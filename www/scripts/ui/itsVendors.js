class ITS_VENDORS{

    static init(){
        this.data = {
            items: null,
        }
        this.elts = {
            table: get('its_vendors_table'),
        }
        this.dimmer = ui.dimmer.create('page_its_vendors', true);
        this.dimmer2 = ui.dimmer.create('page_its_edit_vendor', true);

        this.editData = Reacto.bindInputs('#page_its_edit_vendor input, #page_its_edit_vendor select');

        this.editData.watch('gst', gst => {
            (gst == '1' ? showElt : hideElt)('its_vendor_edit_gst_number')
        });
        
        registerPage('its_vendors', get('page_its_vendors'), 'ITS - Vendors', params => this.update(params));
        registerPage('its_vendors_edit', get('page_its_edit_vendor'), 'Add new vendor', params => this.updateEdit(params), {
            icon: 'save',
            handler: () => {
                this.save();
        }});

        this.loadAction = fetchAction.create('vendor/list');
        this.editAction = fetchAction.create('vendor/edit');
    }

    static async update(){
        this.dimmer.show();
        try {
            const data = await this.loadAction.do();
            this.data.items = data.items;
            this.loadItems(data.items);
        } catch (error) {
            error_msg3();
        }
        this.dimmer.hide();
    }

    static search(query){
        const s = query.trim();
        if(s){
            const items = this.searchData(s);
            this.loadItems(items);
        }else{
            this.loadItems(this.data.items || []);
        }
    }

    static updateEdit(params){
        const data = params && params.data || {};
        this.currentVendorId = data.id || 'new';
        val('page_its_edit_vendor_id', this.currentVendorId);
        if(this.currentVendorId == 'new'){
            this.editData.clear();
        }else{
            this.editData.patch(data);
        }
    }

    static loadItems(items){
        clearRows(this.elts.table)
        for(let item of items){
            this._createRow(item);
        }

        const tippy_config = {
            content: '',
            placement: 'top',
            arrow: true,
            animation: 'scale',
            theme: 'light',
            duration: 200
        };
        tippy_config.content = 'Edit vendor details';
        tippy('.its_ven_edit', tippy_config);

        tippy_config.content = 'Add new purchase';
        tippy('.its_ven_purchase', tippy_config);

        tippy_config.content = 'Make payment';
        tippy('.its_ven_payment', tippy_config);

        tippy_config.content = 'Payments history';
        tippy('.its_ven_pay_his', tippy_config);

        tippy_config.content = 'Purchase history';
        tippy('.its_ven_pur_his', tippy_config);
    }

    static _createRow(data){
        const table = this.elts.table;
        const tr = table.tBodies[0].insertRow(table.rows.length-1);
        const el_id = crt_elt('td', tr);
        const el_name = crt_elt('td', tr);
        const el_place = crt_elt('td', tr);
        const el_balance = crt_elt('td', tr);
        const el_payment = crt_elt('td', tr);
        const el_purchase = crt_elt('td', tr);
        const el_buttons = crt_elt('td', tr);

        const btn_edit = crt_elt('button', el_buttons);
        const btn_purchase = crt_elt('button', el_buttons);
        const btn_payment = crt_elt('button', el_buttons);
        const btn_pay_his = crt_elt('button', el_buttons);
        const btn_pur_his = crt_elt('button', el_buttons);

        btn_edit.className = 'its_ven_edit';
        btn_purchase.className = 'its_ven_purchase';
        btn_payment.className = 'its_ven_payment';
        btn_pay_his.className = 'its_ven_pay_his';
        btn_pur_his.className = 'its_ven_pur_his';

        class_add([btn_edit, btn_purchase, btn_payment, btn_pay_his, btn_pur_his], 'mtm inverted button row_btn')
        crt_icon('edit nm', btn_edit)
        crt_icon('shopping basket nm', btn_purchase)
        crt_icon('money bill nm', btn_payment)
        crt_icon('history nm', btn_pay_his)
        crt_icon('history nm', btn_pur_his)

        val(el_id, data.id);
        val(el_name, data.name);
        val(el_place, data.place);
        val(el_balance, fasc.formatPrice(data.balance));
        val(el_payment, data.last_payment || '---');
        val(el_purchase, data.last_purchase || '---');
        
        btn_edit.onclick = () => navigate('its_vendors_edit', {data});
        btn_purchase.onclick = () => navigate('its_add_purchase', {
            vendor_id: data.id,
            vendor_name: data.name
        });
        btn_payment.onclick = () => navigate('its_payment_edit', { vendor: data });
        btn_pur_his.onclick = () => navigate('its_purchases', { vendor: data });
        btn_pay_his.onclick = () => navigate('its_payments', { vendor: data });
    }

    static async save(){
        let d = this.editData.__data;
        if(!d.name || !d.address || !d.bank_account_number || !d.bank_account_type
            || !d.bank_ifsc_code || !d.bank_name || !d.state || !d.gst || !d.place
            || (d.gst == '1' && !d.gst_number)){
            alert('Please fill all details..');
            return;
        }

        d.id = this.currentVendorId;
        if(d.gst != '1'){
            d.gst_number = '';
        }

        this.dimmer2.show();
        try {
            const params = {data: JSON.stringify(d)};
            await this.editAction.do(params);
            await msg1();
            goBack(true);
        } catch (error) {
            error_msg2();
        }
        this.dimmer2.hide();
    }

    static searchData(query){
        if(!this.data.items) return [];
        const s = query.toLowerCase();
        const result = [];
        for(let i of this.data.items){
            if(i.id == s || i.name.toLowerCase().indexOf(s) != -1 || i.place.toLowerCase().indexOf(s) != -1){
                result.push(i);
            }
        }
        return result;
    }

}

registerInitFunc(() => ITS_VENDORS.init());