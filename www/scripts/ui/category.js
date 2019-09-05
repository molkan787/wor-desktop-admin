var category;
function category_init() {
    category = {
        elt: get('page_category'),
        elts: {
            subs: get('subcats_subs'),
            add: get('subcats_add'),
            img: get('cat_img'),
            imgBtn: get('cat_img_btn'),
            name1: get('cat_name_1'),
            name2: get('cat_name_2'),
            imgSec: get('cat_img_sec'),
            subsSec: get('cat_subs_sec')
        },

        data: {},
        currentCat: null,

        dimc: ui.dimmer.create('subcats_dimmer'),

        loadAction: null,
        saveAction: null,
        uploadAction: null,
        deleteAction: null,

        imgSlt: null,

        getChildsOrder: function () {
            var ids = [];
            var elts = this.elts.subs.children;
            if (elts.length < 1) return;
            for (var i = 0; i < elts.length; i++) {
                ids.push(attr(elts[i], 'cat_id'));
            }
            return ids.join(',');
        },

        // Methods
        update: function (params) {
            this.parent = params.parent;
            this.cat_id = params.id;
            this.gtype = params.gtype;
            this.deepLevel = params.deepLevel;

            if (this.deepLevel == 1) {
                this.elts.imgSec.style.display = '';
            } else {
                this.elts.imgSec.style.display = 'none';
            }
            if (this.deepLevel > 2 || (this.deepLevel > 1 && this.gtype == '1')) {
                this.elts.subsSec.style.display = 'none';
            } else {
                this.elts.subsSec.style.display = '';
            }
            val('cat_subs_text', cat_get_Item_name(this.gtype, this.deepLevel + 1, true));

            var cat_id = params.id;
            this.imgSlt.reset();
            if (cat_id != 'new') {
                this.dimc.show();
                this.loadAction.do({ cat_id: cat_id });
            } else {
                this.loadCat({category_id: 'new'});
            }
        },

        loadCat: function (data) {
            this.currentCat = data.category_id;
            val(this.elts.subs, '');
            if (data.category_id == 'new') {
                val(this.elts.img, 'images/document_blank.png');
                val(this.elts.name1, '');
                val(this.elts.name2, '');
            } else {
                val(this.elts.img, data.image);
                val(this.elts.name1, data.name[1]);
                val(this.elts.name2, data.name[2]);
                for (var i = 0; i < data.subs.length; i++) {
                    this.createPanel(data.subs[i]);
                }
            }
        },

        getData: function () {
            var name1 = val(this.elts.name1);
            var name2 = val(this.elts.name2);
            return {
                gtype: this.gtype,
                parent: this.parent,
                cat_id: this.currentCat,
                name1: name1,
                name2: name2,
                childs_order: this.getChildsOrder()
            };

        },

        save: function () {
            var name1 = val(this.elts.name1);
            var name2 = val(this.elts.name2);
            if (name1.length < 2 || name2.length < 2) {
                msg.show(txt('fill_all_input'));
                return;
            }
            this.dimc.show('Saving');
            if (this.imgSlt.changed) {
                this.uploadAction.do(this.imgSlt.getData());
            } else {
                var data = this.getData();
                this.saveAction.do(data);
            }
        },

        toggleState: function (elt, btnElt) {
            var ise = (attr(elt, 'state') == 'enabled');
            if (ise && !attr(elt, 'origin_id')) {
                uiu.removeElt(elt, true);
                return;
            }
            if (ise) {
                attr(elt, 'state', 'disabled');
                class_add(elt, 'disabled');
                val(btnElt, 'Undo');
            } else {
                attr(elt, 'state', 'enabled');
                class_rm(elt, 'disabled');
                val(btnElt, 'Remove');
            }
            foreach(get_bt('input', elt), function (inp) {
                if (ise)
                    attr(inp, 'disabled', '1')
                else
                    attr_rm(inp, 'disabled')
            });
        },

        // Callbacks
        loadActionCallback: function (action) {
            if (action.status == 'OK') {
                dm.updateCat(this.parent, action.data, this.gtype);
                this.loadCat(action.data);
            } else {
                msg.show(txt('error_3'));
                goBack();
            }
            this.dimc.hide();
        },

        uploadActionCallback: function (action) {
            if (action.status == 'OK') {
                var data = this.getData();
                data.image = action.data.filename;
                this.saveAction.do(data);
            } else {
                msg.show(txt('error_2'));
                this.dimc.hide();
            }
        },

        saveActionCallback: function (action) {
            this.dimc.hide();
            if (action.status == 'OK') {
                msg.show(txt('msg_1'));
                var params = { id: action.data.cat_id, deepLevel: this.deepLevel, gtype: this.gtype, parent: this.parent };
                reloadPage(params);
            } else {
                msg.show(txt('error_2'));
            }
        },

        deleteActionCallback: function (action) {
            if (action.status == 'OK') {
                dm.deleteCat(this.cat_id, action.params.cat_id);
                uiu.removeElt('cat_panel_' + action.params.cat_id, true);
            } else {
                msg.show(txt('error_txt1'));
            }
            this.dimc.hide();
        },

        // Methods
        deleteCategory: function (cat_id) {
            var cat = this.items[cat_id];
            if (!cat) return;
            var _this = this;
            var itemName = cat_get_Item_name(category.gtype, category.deepLevel + 1);
            var msgText = txt('confirm_city_delete', itemName, cat.text);
            msg.confirm(msgText, function (answer) {
                if (answer == 'yes') {
                    _this.dimc.show('Deleting');
                    _this.deleteAction.do({ cat_id: cat_id });
                }
            });
        },

        // UI Methods
        createPanel: function (data) {
            var div = crt_elt('div');
            var h3 = crt_elt('h3', div);
            var btn = crt_elt('label', div);
            var icon = crt_elt('i', btn);
            var btn2 = crt_elt('label', div);
            var icon2 = crt_elt('i', btn2);
            
            val(h3, data.name);
            div.className = 'cats_item';
            btn.className = 'ui label';
            icon.className = 'delete icon';

            btn2.className = 'ui label handle';
            icon2.className = 'sort icon';
            attr(btn2, 'cancel-pdr', true);
            attr(icon2, 'cancel-pdr', true);

            btn.onclick = this.deleteBtnClick;

            attr(btn, 'cancelclick', '1');
            attr(icon, 'cancelclick', '1');
            attr(btn, 'cat_id', data.category_id);
            attr(div, 'cat_id', data.category_id);
            div.onclick = this.panelClick;
            div.id = 'cat_panel_' + data.category_id;

            this.elts.subs.appendChild(div);
        },

        // Handlers
        panelClick: function (e) {
            if (attr(e.srcElement, 'cancelclick')) return;
            navigate('category', { id: attr(this, 'cat_id'), deepLevel: category.deepLevel + 1, gtype: category.gtype, parent: category.cat_id });
        },

        addButtonClick: function () {
            if (category.cat_id == 'new') {
                var cItem = cat_get_Item_name(category.gtype, category.deepLevel);
                var nItem = cat_get_Item_name(category.gtype, category.deepLevel + 1, true);
                var text = txt('save_before_adding', cItem, nItem);
                msg.show(text);
                return;
            }
            navigate('category', { id: 'new', deepLevel: category.deepLevel + 1, gtype: category.gtype, parent: category.cat_id });
        },

        saveButtonClick: function () {
            category.save();
        },

        deleteBtnClick: function () {
            category.deleteCategory(attr(this, 'cat_id'));
        }
    };

    category.loadAction = fetchAction.create('category/info', function (action) { category.loadActionCallback(action); });
    category.saveAction = fetchAction.create('category/save', function (action) { category.saveActionCallback(action); });
    category.uploadAction = fetchAction.create('image/upBase64&folder=categories', function (action) { category.uploadActionCallback(action); });
    category.deleteAction = fetchAction.create('category/delete', function (action) { category.deleteActionCallback(action); });

    category.imgSlt = imageSelector.init(category.elts.imgBtn, category.elts.img);

    category.elts.add.onclick = category.addButtonClick;

    Sortable.create(category.elts.subs, { handle: '.handle' });

    registerPage('category', category.elt, function (params) {
        var gname = cat_get_Item_name(params.gtype, params.deepLevel);
        if (params.id == 'new') {
            return 'Add new ' + gname;
        } else {
            return gname + ' Details';
        }
    }, function (params) {
        category.update(params);
    }, { icon: 'save', handler: category.saveButtonClick });
}

function cat_get_Item_name(gtype, deepLevel, plur) {
    var gname = deepLevel == 3 ? 'Child ' : '';
    if (deepLevel > 1) gname += 'Sub-';
    gname += gtype == '1' ? (plur ? 'Brands' : 'Brand') : (plur ? 'Categories' : 'Category');
    return gname;
}