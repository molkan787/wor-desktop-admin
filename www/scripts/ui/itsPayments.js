class ITS_Payments{

    static init(){

        this.elts = {table: get('page_its_payments_table')};

        this.editForm = Reacto.bindInputs('#page_its_add_payment .form input, #page_its_add_payment .form select');

        this.loadAction = fetchAction.create('vendor/getPayments');
        this.editAction = fetchAction.create('vendor/addPayment');

        this.dimmer = ui.dimmer.create('page_its_payments', true);
        this.editDimmer = ui.dimmer.create('page_its_add_payment', true);

        registerPage('its_payments', get('page_its_payments'), 
        ({vendor}) => ({title: `Payments to "${vendor.name}"`, ibb: true}),
        params => this.update(params));

        registerPage('its_payment_edit', get('page_its_add_payment'), 'Make Payment', params => this.updateEdit(params));
    }

    static async update({vendor}){
        clearRows(this.elts.table);
        this.dimmer.show();
        try {
            const data = await this.loadAction.do({vendor_id: vendor.id});
            Dosk.setRows(this.elts.table, {
                data: data.items,
                cells: ['payment_date', 'amount', 'payment_method', 'reference', 'receiver_name', 'attachment'],
                formats: { amount: val => fasc.formatPrice(val), payment_method: m => m.toUpperCase() },
                defaults: {reference: '---', attachment: '---'}
            });
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


}

registerInitFunc(() => ITS_Payments.init());