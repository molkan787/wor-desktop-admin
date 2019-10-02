class ITS_Payments{

    static init(){

        this.elts = {table: get('page_its_payments_table')};

        this.editForm = Reacto.bindInputs('#page_its_add_payment .form input, #page_its_add_payment .form select');

        this.loadAction = fetchAction.create('vendor/getPayments');
        this.editAction = fetchAction.create('vendor/addPayment');
        this.deleteAction = fetchAction.create('vendor/deletePayment');

        this.dimmer = ui.dimmer.create('page_its_payments', true);
        this.editDimmer = ui.dimmer.create('page_its_add_payment', true);

        registerPage('its_payments', get('page_its_payments'), 
        ({vendor}) => ({title: `Payments to "${vendor.name}"`, ibb: true}),
        params => this.update(params));

        registerPage('its_payment_edit', get('page_its_add_payment'),
        params => params.data ? 'Payment details' : 'Make Payment',
        params => this.updateEdit(params));
    }

    static async update({vendor}){
        this.currentVendor = vendor;
        clearRows(this.elts.table);
        this.dimmer.show();
        let btns = [{
            className: 'mtm inverted button row_btn show_pay_btn',
            icon: 'file nm',
            handler: (data) => this.showPayment(data),
        }];
        if(Rights.check('its_del')){
            btns.push({
                className: 'mtm inverted button row_btn del_pay_btn',
                icon: 'delete nm',
                handler: (data, elt) => this.deletePayment(data, elt),
            });
        }
        try {
            const data = await this.loadAction.do({vendor_id: vendor.id});
            Dosk.setRows(this.elts.table, {
                data: data.items,
                cells: ['payment_date', 'amount', 'payment_method', 'reference', 'receiver_name', 'attachment'],
                formats: { amount: val => fasc.formatPrice(val), payment_method: m => m.toUpperCase() },
                defaults: {reference: '---', attachment: '---'},
                buttons: btns
            });
            tooltip('.del_pay_btn', 'Delete')
            tooltip('.show_pay_btn', 'Show details')
        } catch (error) {
            console.log(error)
            error_msg3();
        }
        this.dimmer.hide();
    }

    static updateEdit(params){

        this.currentVendorId = params && params.vendor && params.vendor.id || 0;
        const vendorName = params && params.vendor && params.vendor.name || '';
        const balance = params && params.vendor && params.vendor.balance || 0;
        val('page_its_add_payment_vendor_name', vendorName);
        val('page_its_add_payment_vendor_balance', fasc.formatPrice(balance));
        if(params.data){
            this.editForm.patch(params.data)
            this.editForm.data.amount = fasc.formatPrice(this.editForm.data.amount, true)
            this.disableForm();
        }else{
            this.clearForm();
            this.enableForm();
        }
    }

    static async confirm(){

        if(Reacto.validateData(this.editForm, {check: true, exclude: ['attachment', 'reference']})){
            this.editDimmer.show('Saving');
            const data = {vendor_id: this.currentVendorId, ...this.editForm.__data};
            try {
                await this.editAction.do({data});
                await msg1();
                goBack(true);
            } catch (error) {
                error_msg2();
            }
            this.editDimmer.hide();
        }else{
            alert('Please fill all fields..');
        }
    }

    static clearForm(){
        this.editForm.clear();
    }

    static disableForm(){
        const inputs = document.querySelectorAll('#page_its_add_payment *[name]');
        for(let inp of inputs) inp.disabled = true;
        const btns = document.querySelectorAll('#page_its_add_payment button');
        for(let btn of btns) btn.style.display = 'none';
    }
    static enableForm(){
        const inputs = document.querySelectorAll('#page_its_add_payment *[name]');
        for(let inp of inputs) inp.disabled = false;
        const btns = document.querySelectorAll('#page_its_add_payment button');
        for(let btn of btns) btn.style.display = 'unset';
    }
    
    static async deletePayment(data, elt){
        if(await confirm(`Do you realy want to delete the payment ?`)){
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

    static showPayment(data){
        navigate('its_payment_edit', {
            vendor: this.currentVendor,
            data
        });
    }


}

registerInitFunc(() => ITS_Payments.init());