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
            onSearch: query => this.onSearch(query)
        });

        this.loadAction = fetchAction.create('vendor/getPurchases');
        this.loadProductsAction = fetchAction.create('product/listNames');
        this.savePurchaseAction = fetchAction.create('vendor/addPurchase');

        registerPage('its_purchases', get('page_its_purchases'),
        ({vendor}) => ({title: `Purchases from "${vendor.name}"`, ibb: true}),
        params => this.update(params) );

        registerPage('its_add_purchase', get('page_its_add_purchase'), 'Add new Purchase', params => this.updateEdit(params), {
            icon: 'save',
            handler: () => {
                this.save();
        }});
    }

    static async update({vendor}){
        clearRows(this.elts.table);
        this.dimmer.show();
        try {
            const data = await this.loadAction.do({vendor_id: vendor.id});
            Dosk.setRows(this.elts.table, {
                data: data.items,
                cells: ['purchase_date', 'total_value', 'invoice_no', 'items_count', 'date_added'],
                formats: { total_value: val => fasc.formatPrice(val) }
            });
        } catch (error) {
            console.log(error)
            error_msg3();
        }
        this.dimmer.hide();
    }

    static async updateEdit(params){
        this.currentVendorId = params && params.vendor_id || 0;
        const vendor_name = params && params.vendor_name || '';
        val('page_its_add_purchase_vendor_name', vendor_name);
        val('page_its_add_purchase_vendor_id', this.currentVendorId);
        this.clearForm();
    }

    static clearForm(){
        this.editData.data.invoice_no = '';
        this.editData.data.purchase_date = '';
        const el = get('its_purchase_addrow_row');
        const tbody = this.elts.productsTable.tBodies[0];
        tbody.removeChild(el);
        clearRows(this.elts.productsTable);
        tbody.appendChild(el);
        this.createProductRow();
    }

    static async save(){
        const d = this.editData.data;
        let items = Dosk.getRowsData(this.elts.productsTable);
        items = items.filter(i => i.name && i.qty && i.buy_price && i.sell_price);

        if(!d.invoice_no || !d.purchase_date || !items.length){
            alert('Please fill all inputs..')
            return;
        }
        
        const data = {
            vendor_id: this.currentVendorId,
            invoice_no: d.invoice_no,
            purchase_date: d.purchase_date,
            items,
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

    static createProductRow(){
        const tbody = this.elts.productsTable.tBodies[0];
        const tr = tbody.insertRow(tbody.rows.length-1);
        const td1 = crt_elt('td', tr);
        const td2 = crt_elt('td', tr);
        const td3 = crt_elt('td', tr);
        const td4 = crt_elt('td', tr);
        const td5 = crt_elt('td', tr);
        const td6 = crt_elt('td', tr);

        const pname = crt_elt('input', td1);
        pname.name = 'name';
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
        
        this.productsMenu.link([pname]);
    }

    static async onSearch(query){
        if(!this.data.products){
            await this.loadProducts();
        }

        return this.searchProducts(query)
    }

    static async loadProducts(){
        const data = await this.loadProductsAction.do();
        this.data.products = data.items;
    }

    static searchProducts(query){
        const s = query.toLowerCase();
        const result = [];
        for(let p of this.data.products){
            if(p.name.toLowerCase().indexOf(s) != -1){
                result.push(p);
            }
            if(result.length >= 20) break;
        }
        return result;
    }

}

registerInitFunc(() => ITS_Purchase.init());