var banners;
function banners_init() {

    banners = {
        elt: get('page_banners'),
        elts: {
            list: get('bans_list')
        },

        data: {
            bans: null
        },

        dimc: ui.dimmer.create('bans_dimmer'),

        loadAction: null,
        uploadAction: null,
        saveAction: null,


        // Callbacks

        loadActionCallback: function (action) {
            if (action.status == 'OK') {
                this.loadBanners(action.data.items);
            } else {
                msg.show(txt('error_3'));
            }
            this.dimc.hide();
        },

        uploadActionCallback: function (action) {
            if (action.status == 'OK') {
                this.data.bans.push(action.data.filename);
                this.checkNextBan();
            } else {
                msg.show(txt('error_2'));
            }
            this.dimc.hide();
        },

        saveActionCallback: function (action) {
            if (action.status == 'OK') {
                this.loadBanners(action.data.items);
            } else {
                msg.show(txt('error_2'));
            }
            this.dimc.hide();
        },

        // Methods

        save: function () {
            this.dimc.show('Saving');
            this.data.bans = [];
            this.banIndex = -1;
            this.bansElts = this.elts.list.children;
            this.checkNextBan();
        },

        checkNextBan: function () {
            this.banIndex++;
            if (this.banIndex < this.bansElts.length) {
                var elt = this.bansElts[this.banIndex];
                if (attr(elt, 'state') == 'disabled') {
                    this.checkNextBan();
                    return;
                }
                var origin_id = attr(elt, 'origin_id');
                this.data.bans.push(origin_id);
                this.checkNextBan();
                // if (origin_id) {
                //     this.data.bans.push(origin_id);
                //     this.checkNextBan();
                // } else {
                //     this.uploadAction.do(get_bt('img', elt)[0].src);
                // }

            } else {
                this.saveAction.do({
                    items: this.data.bans.join(',')
                });
            }
        },

        loadBanners: function (data) {
            val(this.elts.list, '');
            for (var i = 0; i < data.length; i++) {
                this.createPanel(data[i]);
            }
        },

        createPanel: function (data, insertFirst) {
            var div = crt_elt('div');
            var img = crt_elt('img', div);
            var btns_con = crt_elt('div', div);
            var btn_up = crt_elt('label', btns_con);
            var btn_edit = crt_elt('button', btns_con);
            crt_elt('br', btns_con);
            var btn_down = crt_elt('label', btns_con);
            var btn_options = crt_elt('button', btns_con);
            var i1 = crt_elt('i', btn_up);
            var i2 = crt_elt('i', btn_down);
            var i3 = crt_elt('i', btn_options);

            i1.className = 'arrow up icon';
            i2.className = 'arrow down icon';
            i3.className = 'undo icon';

            btn_up.className = btn_down.className = 'ui label mbutton';
            btn_options.className = 'ui label mbutton ft10';
            btn_edit.className = 'ui label edit_btn mbutton ft10';
            btn_up.onclick = btn_down.onclick = this.btnsClick;
            btn_options.onclick = this.toggleState;
            btn_edit.onclick = this.editBtnClick;
            val(btn_options, 'Remove');

            val(btn_edit, 'Edit');

            attr(btn_up, 'job', 'up');
            attr(btn_down, 'job', 'down');
            attr(btn_options, 'job', 'options');

            attr(btn_edit, 'banner_id', data.id);

            div.className = 'bans_item mtm db unclickable';
            attr(div, 'origin_id', data.id);
            attr(div, 'state', 'enabled');
            val(img, data.image);

            if (insertFirst) {
                insertNodeAsFirst(div, this.elts.list);
            } else {
                this.elts.list.appendChild(div);
            }
        },

        update: function () {
            this.dimc.show();
            this.loadAction.do();
        },

        movePanel: function (pan, direction) {
            if (attr(pan, 'state') == 'disabled') return;
            var index = getIndexInParent(pan);
            var pan2 = this.elts.list.children[index + direction];
            if (!pan2) return;
            if (direction == 1)
                swapHtmlElts(pan, pan2);
            else
                swapHtmlElts(pan2, pan);
        },

        toggleState: function () {
            var pan = this.parentNode.parentNode;
            var ise = (attr(pan, 'state') == 'enabled');
            attr(pan, 'state', ise ? 'disabled' : 'enabled');
            val(this, ise ? 'Undo' : 'Remove');
            if (ise) {
                class_add(pan, 'disabled');
                moveEltToBot(pan);
            } else {
                class_rm(pan, 'disabled');
            }
        },

        addImage: function (imageData) {
            var data = {
                id: '',
                image: imageData
            };
            this.createPanel(data, true);
        },

        // Handlers

        btnsClick: function () {
            var job = attr(this, 'job');
            if (job == 'up')
                banners.movePanel(this.parentNode.parentNode, -1);
            else if (job == 'down')
                banners.movePanel(this.parentNode.parentNode, 1);
        },
        editBtnClick: function () {
            var banner_id = attr(this, 'banner_id');
            navigate('banner', banner_id);
        },

        addBtnClick: function () {
            navigate('banner', 'new');
        }

    };

    get('bans_add').onclick = banners.addBtnClick;

    banners.loadAction = fetchAction.create('banner/list', function (action) { banners.loadActionCallback(action); });
    banners.saveAction = fetchAction.create('banner/save', function (action) { banners.saveActionCallback(action); });
    banners.uploadAction = fetchAction.create('image/upBase64&folder=banners', function (action) { banners.uploadActionCallback(action); });

    registerPage('banners', banners.elt, 'Banners', function () { banners.update(); });

}