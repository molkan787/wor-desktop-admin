class ITS_Purchase{

    static init(){
        this.dimmer = ui.dimmer.create('page_its_purchases', true);
        this.add_dimmer = ui.dimmer.create('page_its_add_purchase', true);
        this.elts = {
            productsTable: get('page_its_add_purchase_table'),
            table: get('page_its_purchases_table'),
        };

        this.data = {
            products: null,
        };

        this.editData = Reacto.bindInputs('#page_its_add_purchase input');

        this.productsMenu = new FloatingList({
            textProp: 'name',
            autoValueSet: true,
            onSearch: query => DataAgent.searchProducts(query),
            onSelected: (data, el) => el.product_id = data.id
        });

        this.loadAction = fetchAction.create('vendor/getPurchases');
        this.savePurchaseAction = fetchAction.create('vendor/addPurchase');
        this.deleteAction = fetchAction.create('vendor/deletePurchase');
        this.uploadAction = fetchAction.create('files/upload');

        registerPage('its_purchases', get('page_its_purchases'),
        ({vendor}) => ({title: `Purchases from "${vendor.name}"`, ibb: true}),
        params => this.update(params) );

        registerPage('its_add_purchase', get('page_its_add_purchase'),
        params => params.data ? 'Purchase details' : 'Add new Purchase',
        params => this.updateEdit(params), {
            icon: 'save',
            handler: () => {
                this.save();
        }});
    }

    static async update({vendor}){
        this.currentVendor = vendor;
        clearRows(this.elts.table);
        this.dimmer.show();
        let btns = [{
            className: 'mtm inverted button row_btn show_pur_btn',
            icon: 'file nm',
            handler: (data) => this.showPurchase(data),
        }];
        if(Rights.check('its_del')){
            btns.push({
                className: 'mtm inverted button row_btn del_pur_btn',
                icon: 'delete nm',
                handler: (data, elt) => this.deletePurchase(data, elt),
            });
        }
        try {
            const data = await this.loadAction.do({vendor_id: vendor.id});
            Dosk.setRows(this.elts.table, {
                data: data.items,
                cells: ['purchase_date', 'total_value', 'invoice_no', 'date_added', 'attachment'],
                defaults: {attachment: '---'},
                formats: { total_value: val => fasc.formatPrice(val) },
                buttons: btns,
                cellButtons: {
                    attachment: {
                        skipIfNoValue: true,
                        text: 'Download',
                        onClick: (fn, btn) => this.downloadAttachement(fn, btn)
                    }
                }
            });
            tooltip('.del_pur_btn', 'Delete');
            tooltip('.show_pur_btn', 'Show details');
        } catch (error) {
            console.log(error)
            error_msg3();
        }
        this.dimmer.hide();
    }

    static async downloadAttachement(filename, button){
        loading(button, true);
        try {
            const file = await download(dm.URL_BASE + 'user_files/' + filename);
            const showFile = await confirm(txt('attachment_download_success'), {yesText: 'Open', noText: 'Close'});
            if(showFile){
                showFileInExplorer(file.filePath);
            }
        } catch (error) {
            error_msg1();
        }
        loading(button, false);
    }

    static async updateEdit(params){
        this.currentVendorId = params && params.vendor_id || 0;
        const vendor_name = params && params.vendor_name || '';
        val('page_its_add_purchase_vendor_name', vendor_name);
        val('page_its_add_purchase_vendor_id', this.currentVendorId);
        if(params.data){
            this.clearForm(true);
            this.loadData(params.data);
            this.disableForm();
        }else{
            this.clearForm();
            this.enableForm();
        }
    }

    static loadData(data){
        this.editData.patch(data);
        for(let item of data.items){
            this.createProductRow(item);
        }
    }

    static clearForm(skinAddingRow){
        this.editData.data.invoice_no = '';
        this.editData.data.purchase_date = '';
        this.editData.data.attachment = '';
        const el = get('its_purchase_addrow_row');
        const tbody = this.elts.productsTable.tBodies[0];
        tbody.removeChild(el);
        clearRows(this.elts.productsTable);
        tbody.appendChild(el);
        if(!skinAddingRow) this.createProductRow();
    }

    static disableForm(){
        const inputs = document.querySelectorAll('#page_its_add_purchase *[name]');
        for(let inp of inputs) inp.disabled = true;
        lockElt('its_purchase_addrow_row');
        hideHbFab();
    }
    
    static enableForm(){
        const inputs = document.querySelectorAll('#page_its_add_purchase *[name]');
        for(let inp of inputs) inp.disabled = false;
        unLockElt('its_purchase_addrow_row');
    }

    static async deletePurchase(data, elt){
        if(await confirm(`Do you realy want to delete the purchase ?`)){
            this.dimmer.show('Deleting');
            try {
                await this.deleteAction.do({id: data.id});
                forceNextReload();
                rm_elt(elt);
            } catch (error) {
                error_msg1();
            }
            this.dimmer.hide();
        }
    }

    static showPurchase(data){
        navigate('its_add_purchase', {
            vendor_id: this.currentVendor.id,
            vendor_name: this.currentVendor.name,
            data
        })
    }

    static async save(){
        const d = this.editData.data;
        let items = Dosk.getRowsData(this.elts.productsTable, {
            getters: {
                product: el => ({name: el.value, id: el.product_id})
            }
        });
        items = items.filter(i => i.product && i.qty && i.buy_price && i.sell_price);
        if(!d.invoice_no || !d.purchase_date || !items.length){
            alert('Please fill all inputs..')
            return;
        }
        
        let attachment = '';
        const file = d.attachment && d.attachment[0];
        if(file){
            log(file)
            const resp = await this.uploadAction.do(file);
            attachment = resp.filename;
            log(attachment)
        }

        const data = {
            vendor_id: this.currentVendorId,
            invoice_no: d.invoice_no,
            purchase_date: d.purchase_date,
            items,
            attachment,
        }
        this.add_dimmer.show();
        try {
            await this.savePurchaseAction.do({data});            
            await msg1();
            goBack(true);
        } catch (error) {
            error_msg2();
        }
        this.add_dimmer.hide();    
    }

    static createProductRow(data){
        const tbody = this.elts.productsTable.tBodies[0];
        const tr = tbody.insertRow(tbody.rows.length-1);
        const td1 = crt_elt('td', tr);
        const td2 = crt_elt('td', tr);
        const td3 = crt_elt('td', tr);
        const td4 = crt_elt('td', tr);
        const td5 = crt_elt('td', tr);
        const td6 = crt_elt('td', tr);

        const pname = crt_elt('input', td1);
        pname.name = 'product';
        pname.className = 'pname';
        pname.placeholder = 'Product name';

        const qty = crt_elt('input', td2);
        qty.name = 'qty';
        qty.type = 'number';
        qty.min = 0;
        qty.placeholder = '0';

        const rate = crt_elt('input', td3);
        rate.name = 'rate';
        rate.placeholder = '0';

        const gst = crt_elt('select', td4);
        gst.name = 'gst';
        setOptions(gst, [
            {id: '0', text: '0%'},
            {id: '5', text: '5%'},
            {id: '12', text: '12%'},
            {id: '18', text: '18%'},
            {id: '25', text: '28%'},
        ]);

        const buy_price = crt_elt('input', td5);
        buy_price.name = 'buy_price';
        buy_price.placeholder = '0.00';

        const sell_price = crt_elt('input', td6);
        sell_price.name = 'sell_price';
        sell_price.placeholder = '0.00';

        if(data){
            val(pname, data.name);
            val(qty, data.qty);
            val(rate, data.rate);
            val(gst, data.gst);
            val(buy_price, parseFloat(data.buy_price).toFixed(2));
            val(sell_price, parseFloat(data.sell_price).toFixed(2));
        }
        
        this.productsMenu.link([pname]);
    }

}

registerInitFunc(() => ITS_Purchase.init());