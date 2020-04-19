var cats;
function categories_init() {
    cats = {
        elt: get('page_categories'),
        elts: {
            list: get('cats_list'),
            saveBtn: get('cats_save_btn')
        },

        dimc: ui.dimmer.create('cats_dimmer'),
        items: null,

        deleteAction: null,
        saveAction: null,

        createPanel: function (data, minimal) {
            var div = crt_elt('div');
            var img = crt_elt('img', div);
            var h3 = crt_elt('h3', div);
            if(!minimal){
                var btn = crt_elt('label', div);
                var icon = crt_elt('i', btn);
                var btn2 = crt_elt('label', div);
                var icon2 = crt_elt('i', btn2);
                btn.className = 'ui label mbutton';
                icon.className = 'delete icon';
                btn.onclick = this.deleteBtnClick;
                btn2.className = 'ui label mbutton handle';
                icon2.className = 'sort icon';
                attr(btn2, 'cancel-pdr', true);
                attr(icon2, 'cancel-pdr', true);
                attr(btn, 'cat_id', data.id);
            }

            val(img, data.image);
            val(h3, data.text);
            div.className = 'cats_item mtm db';

            attr(div, 'cat_id', data.id);

            if(minimal){
                return div;
            }else{
                attr(btn, 'cancelclick', '1');
                attr(icon, 'cancelclick', '1');
                attr(btn2, 'cancelclick', '1');
                attr(icon2, 'cancelclick', '1');
            }

            if(this.cps){
                attr(btn, 'cps', 'true');
                attr(div, 'cps', 'true');
            }
            div.onclick = this.panelClick;
            div.id = 'cat_panel_' + data.id;

            this.elts.list.appendChild(div);
        },
        
        update: function (param) {
            const io = typeof param == 'object';
            this.gtype = io ? param.gtype : param;
            this.cps = io && param.cps;
            this.dimc.show();
            val(this.elts.list, '');
            dm.reloadAsd(() => {
                this.loadCats(this.cps ? dm.cps.cats : dm.cats);
                this.dimc.hide();
            });
        },

        loadCats: function (data) {
            this.items = {};
            for (var i = 0; i < data.length; i++) {
                var cat = data[i];
                if (cat.gtype == this.gtype) {
                    this.items[cat.id] = cat;
                    this.createPanel(cat);
                }
            }
        },

        deleteCategory: function (cat_id) {
            var cat = this.items[cat_id];
            if (!cat) return;
            var _this = this;
            var txtName = this.gtype == '1' ? 'confirm_brand_delete' : 'confirm_cat_delete';
            var msgText = txt(txtName, cat.text);
            msg.confirm(msgText, function (answer) {
                if (answer == 'yes') {
                    _this.dimc.show('Deleting');
                    _this.deleteAction.do({ cat_id: cat_id });
                }
            });
        },

        saveOrder: function () {
            var ids = [];
            var elts = this.elts.list.children;
            if (elts.length < 1) return;
            for (var i = 0; i < elts.length; i++) {
                ids.push(attr(elts[i], 'cat_id'));
            }
            ids = ids.join(',');
            this.dimc.show();
            this.saveAction.do({ ids: ids});
        },

        // Callbacks
        deleteActionCallback: function (action) {
            if (action.status == 'OK') {
                dm.deleteCat(0, action.params.cat_id);
                uiu.removeElt('cat_panel_' + action.params.cat_id, true);
            } else {
                msg.show(txt('error_txt1'));
            }
            this.dimc.hide();
        },

        saveActionCallback: function (action) {
            if (action.status != 'OK') {
                msg.show(txt('error_2'));
            }
            this.dimc.hide();
        },

        // Handlers
        panelClick: function (e) {
            if (attr(e.srcElement, 'cancelclick')) return;
            const cat_id = attr(this, 'cat_id');
            const cps = attr(this, 'cps') == 'true';
            navigate('category', { id: cat_id, deepLevel: 1, gtype: cats.gtype, parent: 0, cps});
        },
        deleteBtnClick: function () {
            cats.deleteCategory(attr(this, 'cat_id'));
        },
        addBtnClick: function () {
            navigate('category', {id: 'new', gtype: cats.gtype, deepLevel: 1, cps: cats.cps});
        },
        saveBtnClick: function () {
            cats.saveOrder();
        }
    };

    cats.deleteAction = fetchAction.create('category/delete', function (action) { cats.deleteActionCallback(action); });
    cats.saveAction = fetchAction.create('category/sort_order', function (action) { cats.saveActionCallback(action); });

    cats.elts.saveBtn.onclick = cats.saveBtnClick;

    registerPage('categories', cats.elt, function (param) {
        const prefix = param && param.cps ? 'CPS ' : '';
        return prefix + (param == '1' ? 'Brands' : 'Categories');
    }, function (param) {
        cats.update(param);
    });

    Sortable.create(cats.elts.list, {handle: '.handle'});
}