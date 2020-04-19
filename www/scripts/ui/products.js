var products;
function ui_products_init() {
    products = ui.products = {
        // Properties
        elt: get('page_products'),
        elts: {
            prtsList: get('prts_list'),
            saveBtn: get('prts_save_btn'),
            addBtn: get('prts_add'),
            selectBtn: get('prts_select'),
            unselectBtn: get('prts_unselect'),
            enableBtn: get('prts_enable'),
            disableBtn: get('prts_disable'),
            deleteBtn: get('prts_delete'),
            copyBtn: get('prts_copy'),
            filterCat: get('prts_filter_cat'),
            filterSubcat: get('prts_filter_subcat'),
            filterSubmit: get('prts_filters_submit'),
            filterStock: get('prts_filter_stock'),
            filterName: get('prts_filter_name'),
            filterDiscount: get('prts_filter_discount'),
            filterPopup: get('prts_popup'),
            totalcount: get('prts_totalcount')
        },
        loadAction: null,
        deleteAction: null,
        saveAction: null,
        copyAction: null,
        statusAction: null,

        ptype: '',

        currentPage: 0,
        itemsPerPage: 20,


        filters: [],

        dimc: ui.dimmer.create('prts_dimmer'),
        fc: null,

        // Methods
        createPanel: function (data) {
            const hideStock = this.ptype && true;
            const hideCtrls = this.ptype == 'cps';

            var disabled = (parseInt(data.status) != 1);
            var div = crt_elt('div');
            var id_span = crt_elt('span', hideCtrls ? null : div);
            var checkbox = crt_elt('i', div);
            var img = crt_elt('img', div);
            var a = crt_elt('a', div);
            var a_span = crt_elt('span', a);
            crt_elt('br', div);
            var span = crt_elt('span', hideStock ? null : div);
            var btn3 = crt_elt('button', hideCtrls ? null : div);
            var btn1 = crt_elt('button', hideCtrls ? null : div);
            var btn2 = crt_elt('button', hideCtrls ? null : div);
            if(hideCtrls) var btnCopy = crt_elt('button', div);
            var i3 = crt_elt('i', btn3);
            var t1 = crt_elt('span', btn1);
            var t2 = crt_elt('span', btn2);
            if (disabled) {
                var dis_span = crt_elt('span', div);
            }

            if (hideStock){
                a_span.style.lineHeight = 2.6;
                a_span.style.float = 'left';
            }
            //checkbox.className = 'cb check circle icon';
            attr(div, 'cesl-ref', data.product_id);

            if (btnCopy){
                btnCopy.className = 'ui button';
                val(btnCopy, 'Import');
                btnCopy.onclick = () => {
                    this.copyProducts(data.product_id);
                }
            }

            div.className = 'prt item';
            val(img, data.image);
            val(a_span, data.title);
            val(span, 'Stock: ' + data.quantity);
            val(id_span, 'ID: ' + data.product_id);
            id_span.className = 'id_span';
            if (disabled) {
                val(dis_span, '(Disabled)');
                dis_span.className = 'dis_span';
            }
            var span_class = 'stock ' + (data.quantity == 0 ? 'none' : (data.quantity < 5 ? 'low' : ''));
            span.className = span_class;
            btn1.className = btn2.className = 'ui button';
            btn3.className = 'ui button handle';
            attr(btn3, 'cancel-pdr', true);
            i3.className = 'sort icon nomargin_o';
            attr(i3, 'cancel-pdr', true);
            val(t1, 'Edit');
            val(t2, 'Delete');

            attr(btn1, 'pid', data.product_id);
            attr(btn2, 'pid', data.product_id);

            attr(btn2, 'pname', data.title);

            btn1.onclick = products.editButtonClick;
            btn2.onclick = products.deleteButtonClick;

            div.id = 'prt_panel_' + data.product_id;
            attr(div, 'pid', data.product_id);

            return div;
        },

        loadProducts: function (list) {
            for (var i = 0; i < list.length; i++) {
                this.elts.prtsList.appendChild( this.createPanel(list[i]) );
            }
            this.cesl.refresh();
        },

        reload(){
            this.update(this.ptype);
        },

        update: function (param, page) {
            this.dimc.show();
            val(this.elts.prtsList, '');
            val(this.elts.totalcount, '');

            this.ptype = param;
            this.prepareLayout();

            const fi = this.filters.find(i => i.name == 'ptype');
            if(fi){
                fi.value = param || '';
            }else{
                this.filters.push({ name: 'ptype', value: param });
            }

            this.ptype = param;
            this.itemsPerPage = param == 'cps' ? 150 : 20;

            let page_n = page || 0;

            if(typeof this.backup_pagen == 'number'){
                if(this.ptype === this.backup_ptype){
                    page_n = this.backup_pagen;
                }
                this.backup_pagen = null;
            }
            this.backup_ptype = this.ptype;

            this.updateCatsList()
            get('prts_cats').style.display = this.ptype == 'cps_admin' ? 'block' : 'none';
            get('prts_copyByCat').style.display = this.ptype == 'cps' ? 'block' : 'none';
            
            this.page_n = page_n;

            this.filters.push({ name: 'start', value: page_n * this.itemsPerPage });
            this.filters.push({ name: 'limit', value: this.itemsPerPage });
            this.loadAction.refStart = page_n * this.itemsPerPage;
            this.loadAction.do(this.filters);
            this.filters.pop();
            this.filters.pop();
        },

        updateCatsList(){
            const _cats = this.ptype ? dm.cps.cats : dm.cats;
            var cats = _cats.filter(c => c.gtype == '0');
            cats = alphaSort(cats, 'text');
            setOptions(products.elts.filterCat, cats, true);
        },

        updateFilters: function () {
            this.fc.lock();
            this.fc.setFilter({ name: 'cat', value: val(this.elts.filterCat), text: getSelectedText(this.elts.filterCat) });
            this.fc.setFilter({ name: 'subcat', value: val(this.elts.filterSubcat), text: getSelectedText(this.elts.filterSubcat) });
            this.fc.setFilter({ name: 'stock', value: val(this.elts.filterStock), text: getSelectedText(this.elts.filterStock) });
            this.fc.setFilter({ name: 'discount', value: val(this.elts.filterDiscount), text: getSelectedText(this.elts.filterDiscount) });
            this.fc.unlock(true);
        },

        search(){
            this.fc.setFilter({ name: 'name', value: val(this.elts.filterName) }, true);
        },

        prepareLayout(){
            const bc_fun = this.ptype == 'cps' ? hideElt : showElt;
            const inv_bc_fun = this.ptype == 'cps' ? showElt : hideElt;
            bc_fun(this.elts.enableBtn);
            bc_fun(this.elts.disableBtn);
            bc_fun(this.elts.deleteBtn);
            bc_fun(this.elts.addBtn);
            bc_fun(this.elts.saveBtn);

            inv_bc_fun(this.elts.copyBtn);
        },

        showFilterPopup: function () {
            val(this.elts.filterCat, this.fc.getValue('cat'));
            val(this.elts.filterSubcat, this.fc.getValue('subcat'));
            val(this.elts.filterStock, this.fc.getValue('stock'));
            // val(this.elts.filterName, this.fc.getValue('name'));
            val(this.elts.filterDiscount, this.fc.getValue('discount'));
            ui.popup.show(this.elts.filterPopup);
        },

        saveOrder: function () {
            var ids = [];
            var elts = this.elts.prtsList.children;
            if (elts.length < 1) return;
            for (var i = 0; i < elts.length; i++) {
                ids.push(attr(elts[i], 'pid'));
            }
            ids = ids.join(',');
            this.dimc.show();
            this.saveAction.do({ ids: ids });
        },

        deleteAll: async function () {
            var ids = this.cesl.checked;
            if (ids.length < 1) return;
            if (await confirm(txt('confirm_delete_selected'))) {
                this.lockBtns();
                this.dimc.show();
                this.deleteAction.do({
                    multiple: true,
                    product_id: ids.join(',')
                });
            }
        },

        copyProducts(_ids){
            const ids = _ids || this.cesl.checked;
            this.lockBtns();
            this.dimc.show();
            this.copyAction.do({ids});
        },

        changeStatus: function (status) {
            if (this.cesl.checked.length < 1) return;
            this.dimc.show();
            this.statusAction.do({ operation: status, product_id: this.cesl.checked.join(',') });
        },

        // Handlers
        loadActionCallback: function (action) {
            if (action.status == 'OK') {
                products.pagination.setState(action.refStart, action.data.items.length);
                products.loadProducts(action.data.items);

                if(products.ptype == 'cps_admin')
                    val(products.elts.totalcount, 'Total count of products: ' + action.data.total);
            }
            products.dimc.hide();
        },
        deleteActionCallback: function (action) {
            if (action.status == 'OK') {
                if (action.params.multiple) {
                    reloadPage();
                } else {
                    uiu.removeElt('prt_panel_' + action.params.product_id, true);
                }
            } else {
                msg.show(txt('error_txt1'));
            }
            products.dimc.hide();
        },
        copyActionCallback: function (action) {
            if (action.status == 'OK') {
                msg.show(txt('products_copy_success'));
            } else {
                msg.show(txt('error_txt1'));
            }
            products.dimc.hide();
        },
        saveActionCallback: function (action) {
            if (action.status != 'OK') {
                msg.show(txt('error_2'));
            }
            products.dimc.hide();
        },

        statusActionCallback: function (action) {
            this.dimc.hide();
            if (action.status == 'OK') {
                reloadPage();
            } else {
                msg.show(txt('error_txt1'));
            }
        },

        editButtonClick: function () {
            products.backup_pagen = products.page_n;
            navigate('product', { 
                pid: attr(this, 'pid'),
                cps: products.ptype != ''
            });
        },
        deleteButtonClick: async function () {
            if (await confirm('Product "' + attr(this, 'pname') + '" will be deleted permanently, Do you want to proceed anyway?')) {
                products.dimc.show();
                products.deleteAction.do({product_id: attr(this, 'pid')});
            }
        },
        filterCatChanged: function () {
            let subs = dm.subcats[products.elts.filterCat.value];
            subs = alphaSort(subs, 'text');
            setOptions(products.elts.filterSubcat, subs, true);
        },
        filterSubmitClick: function () {
            ui.popup.hide();
            products.updateFilters();
        },
        saveBtnClick: function () {
            products.saveOrder();
        },

        selectAllBtnClick: function () {
            products.cesl.checkAll();
        },
        deleteAllBtnClick: function () {
            products.deleteAll();
        },
        enableAllBtnClick: function () {
            products.changeStatus('enable');
        },
        disableAllBtnClick: function () {
            products.changeStatus('disable');
        },
        copyAllBtnClick: function (){
            products.copyProducts();
        },

        ceslOnChange: function (sender, count) {
            if (count > 0) {
                this.lockBtns();
            } else {
                this.unlockBtns();
            }
        },

        lockBtns: function () {
            attr_rm(this.elts.deleteBtn, 'disabled');
            attr_rm(this.elts.enableBtn, 'disabled');
            attr_rm(this.elts.disableBtn, 'disabled');
            attr_rm(this.elts.unselectBtn, 'disabled');
            attr_rm(this.elts.copyBtn, 'disabled');
        },
        unlockBtns: function () {
            attr(this.elts.deleteBtn, 'disabled', true);
            attr(this.elts.enableBtn, 'disabled', true);
            attr(this.elts.disableBtn, 'disabled', true);
            attr(this.elts.unselectBtn, 'disabled', true);
            attr(this.elts.copyBtn, 'disabled', true);
        }
    };

    onSubmit(products.elts.filterName, () => products.search());

    products.pagination = Pagination(products.itemsPerPage, [get('prts_btns1')], {prefixParam: true});

    products.elts.filterCat.onchange = products.filterCatChanged;
    products.elts.filterSubmit.onclick = products.filterSubmitClick;
    products.elts.saveBtn.onclick = products.saveBtnClick;
    products.elts.selectBtn.onclick = products.selectAllBtnClick;
    products.elts.deleteBtn.onclick = products.deleteAllBtnClick;
    products.elts.enableBtn.onclick = products.enableAllBtnClick;
    products.elts.disableBtn.onclick = products.disableAllBtnClick;

    products.fc = filtersController.create('prts_filters', function () { products.reload() }, products.filters);

    products.loadAction = fetchAction.create('product/list', products.loadActionCallback);
    products.deleteAction = fetchAction.create('product/delete', products.deleteActionCallback);
    products.saveAction = fetchAction.create('product/sort_order', products.saveActionCallback);
    products.copyAction = fetchAction.create('product/copyCPSP', products.copyActionCallback);
    products.statusAction = fetchAction.create('product/status', function (action) { products.statusActionCallback(action); });

    products.cesl = cesl.init(products.elts.prtsList, null, function (sender, count) { products.ceslOnChange(sender, count); });
    products.elts.unselectBtn.onclick = () => products.cesl.uncheckAll();

    tooltip(get('prts_cats'), 'Show CPS Categories');
    
    registerPage('products', products.elt, 'Products', function (param, page) {
        products.update(param, page);
    });

    Sortable.create(products.elts.prtsList, { handle: '.handle' });
}
