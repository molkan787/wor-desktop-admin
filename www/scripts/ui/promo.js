var promo;
function promo_init() {
    promo = {
        elt: get('page_promo'),
        elts: {
            img: get('promo_img'),
            imgCon: get('promo_img_con'),
            format: get('promo_format'),
            link: get('promo_link')
        },

        dimmer: ui.dimmer.create('page_promo', true),

        imgSlt: null,

        loadAction: null,
        uploadAction: null,
        saveAction: null,

        // Methods
        update: function (param) {
            this.promo_id = param;
            if (param == 'new') {
                this.loadData({});
            } else {
                var data = promos.items[param];
                this.loadData(data);
            }
            this.imgSlt.reset();
        },

        loadData: function (data) {
            val(this.elts.format, data.format || 1);
            this.elts.format.onchange();
            val(this.elts.img, data.image || 'images/grey_rect.png');
            val(this.elts.link, data.link || '');
        },

        prepareData: function () {
            var raw_link = val(this.elts.link).replace(' ', '').split(',');
            var link = '';
            for (var i = 0; i < raw_link.length; i++) {
                if (link.length > 0) link += ',';
                var l_item = parseInt(raw_link[i]);
                if (l_item > 0) link += l_item;
            }

            this.data = {
                format: val(this.elts.format),
                link: link,
                promo_id: this.promo_id,
                image: ''
            };
        },

        save: function () {
            this.dimmer.show();
            this.prepareData();
            if (this.imgSlt.changed) {
                this.uploadAction.do(this.imgSlt.getData());
            } else {
                this.saveAction.do(this.data, 'promos/' + (this.promo_id == 'new' ? 'add' : 'edit'));
            }
        },

        // Callbacks
        uploadActionCallback: function (action) {
            if (action.status == 'OK') {
                this.data.image = action.data.filename;
                this.saveAction.do(this.data, 'promos/' + (this.promo_id == 'new' ? 'add' : 'edit'));
            } else {
                msg.show(txt('error_2'));
                this.dimmer.hide();
            }
        },
        saveActionCallback: function (action) {
            if (action.status == 'OK') {
                if (this.promo_id == 'new') {
                    this.data.promo_id = action.data.promo_id;
                }
                this.data.image = action.data.image;
                promos.updateItem(this.promo_id, this.data);
                goBack();
            } else {
                msg.show(txt('error_2'));
            }
            this.dimmer.hide();
        },

        // Handlers
        saveBtnClick: function () {
            promo.save();
        },

        formatChanged: function () {
            var format = val(this);
            promo.elts.imgCon.className = 'promo_format' + format;
        }
    };
    
    promo.uploadAction = fetchAction.create('image/upBase64&folder=ads', function (action) { promo.uploadActionCallback(action); });
    promo.saveAction = fetchAction.create('', function (action) { promo.saveActionCallback(action); });

    promo.elts.format.onchange = promo.formatChanged;

    promo.imgSlt = imageSelector.init(get('promo_img_btn'), get("promo_img"));

    registerPage('promo', promo.elt, function (param) {
        return param == 'new' ? 'Add Promotion' : 'Promotion details'
    }, function (param) { promo.update(param); },
        { icon: 'save', handler: promo.saveBtnClick });
}