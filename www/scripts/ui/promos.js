var promos;
function promos_init() {
    promos = {
        elt: get('page_promos'),
        elts: {
            items: get('promos_items')
        },

        dimmer: ui.dimmer.create('page_promos', true),

        loadAction: null,
        saveAction: null,
        deleteAction: null,

        menuItems1: [
            { text: 'Delete', action: 'delete' },
            { text: 'Edit', action: 'edit' }
        ],

        // Methods
        handleAction: function (action) {
            if (action == 'edit') {
                navigate('promo', this.currentPromoId);
            } else if (action == 'delete') {
                var _this = this;
                msg.confirm(txt('confirm_delete', 'this banner'), function (answer) {
                    if (answer == 'yes') {
                        _this.dimmer.show();
                        _this.deleteAction.do({ promo_id: _this.currentPromoId });
                    }
                });
            }
        },

        updateItem: function (promo_id, data) {
            log(data)
            if (promo_id == 'new') {
                this.items[data.promo_id] = data;
                this.createPanel(data);
            } else {
                if (data.image == '') data.image = this.items[promo_id].image;
                this.items[promo_id] = data;
                var pan = get('promo_pan_' + promo_id);
                var img = get_bt('img', pan)[0];
                pan.className = 'promo_item promo_format' + data.format;
                val(img, data.image);
            }
        },

        save: function () {
            this.dimmer.show('Saving order');
            var ids = '';
            var elts = this.elts.items.children;
            for (var i = 0; i < elts.length; i++) {
                if (ids.length) ids += ',';
                ids += attr(elts[i], 'promo_id');
            }
            this.saveAction.do({ids: ids});
        },

        update: function () {
            this.dimmer.show();
            val(this.elts.items, '');
            this.loadAction.do();
        },

        loadData: function (data) {
            this.items = {};
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                this.items[item.promo_id] = item;
                this.createPanel(item);
            }
        },

        createPanel: function (data) {
            var div = crt_elt('div');
            var img = crt_elt('img', div);
            var btn = crt_elt('button', div);
            var i = crt_elt('i', btn);

            attr(div, 'cancel-pdr', true);
            attr(img, 'cancel-pdr', true);
            attr(btn, 'cancel-pdr', true);
            attr(i, 'cancel-pdr', true);

            attr(div, 'promo_id', data.promo_id);
            div.className = 'promo_item promo_format' + data.format;
            val(img, data.image);
            div.id = 'promo_pan_' + data.promo_id;

            attr(btn, 'promo_id', data.promo_id);
            btn.className = 'ui label';
            i.className = 'setting icon';
            btn.onclick = this.optionsBtnClick;

            this.elts.items.appendChild(div);
        },

        // Callbacks
        loadActionCallback: function (action) {
            if (action.status == 'OK') {
                this.loadData(action.data.items);
            } else {
                msg.show(txt('error_3'));
            }
            this.dimmer.hide();
        },
        saveActionCallback: function (action) {
            if (action.status == 'OK') {
                msg.show(txt('msg_1'));
            } else {
                msg.show(txt('error_2'));
            }
            this.dimmer.hide();
        },

        deleteActionCallback: function (action) {
            if (action.status == 'OK') {
                msg.show(txt('msg_2', 'Banner'));
                uiu.removeElt('promo_pan_' + action.params.promo_id);
            } else {
                msg.show(txt('error_txt1'));
            }
            this.dimmer.hide();
        },


        // Handlers
        saveBtnClick: function () {
            promos.save();
        },
        addBtnClick: function () {
            navigate('promo', 'new');
        },

        optionsBtnClick: function () {
            promos.currentPromoId = attr(this, 'promo_id');
            contextMenu.show('Options', promos.menuItems1, promos.menuItemClick);
        },
        menuItemClick: function (action) {
            promos.handleAction(action);
        },
    };

    get('promos_add_btn').onclick = promos.addBtnClick;

    Sortable.create(promos.elts.items);

    promos.loadAction = fetchAction.create('promos/list', function (action) { promos.loadActionCallback(action); });
    promos.saveAction = fetchAction.create('promos/editOrder', function (action) { promos.saveActionCallback(action); });
    promos.deleteAction = fetchAction.create('promos/delete', function (action) { promos.deleteActionCallback(action); });

    registerPage('promos', promos.elt, 'Branding and Promotion', function () { promos.update(); });
}