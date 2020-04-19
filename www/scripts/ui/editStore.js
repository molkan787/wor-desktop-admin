class EditStore {

    static init(){
        const PAGE_ID = 'page_edit_store';
        this.pageSlug = 'editStore';
        this.elt = get(PAGE_ID);
        this.elts = {
            city: get('stores_pp_add_city'),
            region: get('stores_pp_add_region')
        };
        this.form = Reacto.bindInputs(`#${PAGE_ID} input, #${PAGE_ID} select`);
        this.dimmer = ui.dimmer.create(PAGE_ID, true);
        registerPage(
            this.pageSlug,
            this.elt,
            d => d ? `Edit store (id: ${d.store_id} )` : 'Create new store',
            d => this.update(d),
            {
                icon: 'save',
                handler: () => this.save()
            }
        );
        
        this.saveAction = fetchAction.create('setting/add_store');
        this.callbacks = {
            resolve: null,
            reject: null,
        }
    }

    static update(data){
        this.storeId = data ? data.store_id : 0;
        this.form.setData(data);
        try {
            this.elts.city.onchange();
            this.form.data.region_id = "";
            setTimeout(() => this.form.data.region_id = data.region_id, 0);
        } catch (error) { }
    }

    static async save(){
        if(!this.form.validate({check: true, exclude: ['region_id']})){
            alert('Please fill all fields.');
            return;
        }
        this.dimmer.show('Saving');
        try {
            const data = this.form.copyData();
            data.store_id = this.storeId;
            const result = await this.saveAction.do(data);
            this._resolve(result);
        } catch (error) {
            error_msg2();
            this._reject();
        }
        this.dimmer.hide();
    }

    static open(data){
        return new Promise((resolve, reject) => {
            this.callbacks.resolve = resolve;
            this.callbacks.reject = reject;
            navigate(this.pageSlug, data);
        })
    }

    static _resolve(data){
        if(typeof this.callbacks.resolve == 'function')
            this.callbacks.resolve(data);
        goBack(true);
    }

    static _reject(){
        if(typeof this.callbacks.reject == 'function')
            this.callbacks.reject();
    }

}

registerInitFunc(() => EditStore.init())