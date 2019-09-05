var stores;
function stores_init() {
    stores = {
        elt: get('page_stores'),
        elts: {
            list: get('stores_list'),
            delPopup: get('stores_popup_del'),
            delName: get('stores_pp_del_name'),
            delPassword: get('stores_pp_del_pwd'),
            delBtn: get('stores_pp_del_btn'),
            optionsPopup: get('stores_popup_options'),
            optionsName: get('stores_pp_options_name'),
            optionsDelBtn: get('stores_pp_options_del'),
            optionsVisit: get('stores_pp_options_visit'),
            addPopup: get('stores_popup_add'),
            addCity: get('stores_pp_add_city'),
            addRegion: get('stores_pp_add_region'),
            addName: get('stores_pp_add_name'),
            addOwner: get('stores_pp_add_owner'),
            addBtn: get('stores_pp_add_btn')
        },
        dimc: ui.dimmer.create('stores_dimmer'),
        dimcDeletePopup: ui.dimmer.create('stores_pp_del_dimmer'),
        dimcAddPopup: ui.dimmer.create('stores_pp_add_dimmer'),
        dimcOptionsPopup: ui.dimmer.create('stores_pp_options_dimmer'),

        storesData: {},
        citiesData: {},
        cityStores: null,
        currentStore: null,

        loadAction: null,
        deleteAction: null,
        addAction: null,

        // methods
        getCityName: function (city_id, parent_id) {
            var isChild = typeof parent_id != 'undefined';
            var city = this.citiesData[isChild ? parent_id : city_id] || {};
            if (isChild) {
                var childs = city.childs || [];
                for (var i = 0; i < childs.length; i++) {
                    if (childs[i].city_id == city_id) {
                        return childs[i].name_1;
                    }
                }   
                return '---';
            } else {
                return city.name_1 || '---';
            }
        },
        update: function () {
            this.dimc.show();
            this.loadAction.do();
        },
        confirmStoreDelete: function () {
            var _this = this;
            msg.confirm(txt('confirm_store_delete', this.currentStore.name), function (answer) {
                if (answer == 'yes') {
                    _this.showDeleteForm();
                }
            });
        },
        deleteStore: function () {
            var pwd = val(this.elts.delPassword);
            if (pwd.length < 1) {
                msg.show(txt('enter_password'));
                return;
            }
            var data = {
                store_id: this.currentStore.store_id,
                pwd: pwd
            };
            var _this = this;
            msg.confirm(txt('confirm_store_delete', this.currentStore.name), function (answer) {
                if (answer == 'yes') {
                    _this.dimcDeletePopup.show();
                    _this.deleteAction.do(data);
                }
            });
        },
        addStore: function () {
            var storeName = val(this.elts.addName);
            var storeOwner = val(this.elts.addOwner);
            var storeCity = val(this.elts.addCity);
            var storeRegion = val(this.elts.addRegion);
            if (!storeCity) {
                msg.show(txt('select_store_city'));
                return;
            } else if(this.citiesData[storeCity].childs.length > 0 && !storeRegion) {
                msg.show(txt('select_store_region'));
                return;
            }
            if (storeName.length < 5) {
                msg.show(txt('valid_store_name'));
                return;
            }
            if (storeOwner.length < 8) {
                msg.show(txt('valid_store_owner'));
                return;
            }
            var _this = this;
            msg.confirm(txt('confirm_add_store', storeName), function (answer) {
                if (answer == 'yes') {
                    _this.dimcAddPopup.show();
                    _this.addAction.do({ name: storeName, owner_name: storeOwner, city_id: storeCity, region_id: storeRegion});
                }
            });
        },

        createPanel: function (data) {
            this.storesData[data.store_id] = data;
            var isActive = data.store_id == dm.storeId;
            var div = crt_elt('div');
            var btn = crt_elt('label', div);
            var icon = crt_elt('i', btn);
            var h4_1 = crt_elt('h4', div);
            var h4_2 = crt_elt('h4', div);
            var h4_3 = crt_elt('h4', div);
            var span_2 = crt_elt('label', h4_1);
            var span_1 = crt_elt('span', h4_1);
            var span_4 = crt_elt('label', h4_2);
            var span_3 = crt_elt('span', h4_2);
            var creationDateLbl = crt_elt('h4', div);

            const date_icon = '<i class="calendar colored icon"></i> ';
            val(creationDateLbl, date_icon + data.date_added.substr(0, data.date_added.length - 3));

            if (isActive) {
                this.addActiveStoreSign(div);
            }

            var regionName = this.getCityName(data.region_id, data.city_id);
            var isRegionStore = (regionName != '---');
            if (isRegionStore) {
                val(h4_3, '<i class="map marker alternate colored icon"></i>' + regionName);
                var span_6 = crt_elt('span', h4_3);
                val(span_6, ' (Region)');
            } else {
                val(h4_3, '<i class="map marker alternate colored icon"></i>' + this.getCityName(data.city_id));
                var span_5 = crt_elt('span', h4_3);
                val(span_5, ' (City)');
            }
            

            div.className = 'store_item';
            btn.className = 'ui label mbutton';
            icon.className = 'setting icon';
            var t_txt = crt_elt('span', btn);
            // t_txt.style.point
            val(t_txt, 'Options');
            attr(btn, 'store_id', data.store_id);

            val(span_1, ' (id:' + data.store_id + ')');
            val(span_2, '<i class="building colored icon"></i>' + data.name);
            val(span_3, ' (Store Admin)');
            val(span_4, '<i class="user colored icon"></i> s' + data.store_id + '_admin');
            h4_2.className = 'smaller';

            div.id = 'stores_pan_' + data.store_id;

            btn.onclick = this.optionsBtnClick;

            if (isRegionStore) {
                if (this.cityStores[data.city_id]) {
                    div.className += ' sub';
                    this.cityStores[data.city_id].appendChild(div);
                } else {
                    this.elts.list.appendChild(div);
                }
            } else {
                if (!this.cityStores[data.city_id]) {
                    this.cityStores[data.city_id] = div;
                }
                this.elts.list.appendChild(div);
            }
        },

        addActiveStoreSign: function (parent) {
            var activeLabel = get('active_store_label');
            if (activeLabel) {
                parent.appendChild(activeLabel);
            } else {
                activeLabel = crt_elt('label', parent);
            }
            activeLabel.className = 'active_label';
            val(activeLabel, '(Active)');
            activeLabel.id = 'active_store_label';
        },

        loadData: function (data) {
            this.cityStores = {};
            var stores = data.stores;
            var cities = data.cities;
            for (var i = 0; i < cities.length; i++) {
                this.citiesData[cities[i].city_id] = cities[i];
            }
            val(this.elts.list, '');
            for (var i = 0; i < stores.length; i++) {
                this.createPanel(stores[i]);
            }
            setOptions(this.elts.addCity, data.cities, '---', 'name_1', 'city_id');
        },

        showOptions: function (store_id) {
            var writeAccess = (parseInt(account.data.ai.stores) == 2);
            var data = this.storesData[store_id];
            this.currentStore = data;
            if (!data) return;
            val(this.elts.optionsName, data.name);
            if (writeAccess) {
                attr_rm(this.elts.optionsDelBtn, 'disabled');
            } else {
                attr(this.elts.optionsDelBtn, 'disabled', '1');
            }
            ui.popup.show(this.elts.optionsPopup);
        },

        showDeleteForm: function () {
            val(this.elts.delName, this.currentStore.name);
            val(this.elts.delPassword, '');
            ui.popup.show(this.elts.delPopup);
        },
        showAddForm: function () {
            val(this.elts.addName, '');
            val(this.elts.addCity, '');
            val(this.elts.addOwner, '');
            this.elts.addRegion.innerHTML = '';
            ui.popup.show(this.elts.addPopup);
        },

        // Callbacks
        loadActionCallback: function (action){
            if (action.status == 'OK') {
                this.loadData(action.data);
            } else {
                msg.show(txt('error_3'));
                // goBack();
            }
            this.dimc.hide();
        },
        deleteActionCallback: function (action) {
            if (action.status == 'OK') {
                msg.show(txt('msg_2', 'Store "' + this.currentStore.name + '"'));
                ui.popup.hide();
                uiu.removeElt('stores_pan_' + this.currentStore.store_id, true);
            } else if (action.error_code == 'wrong_password') {
                msg.show(txt('wrong_password'));
            } else {
                msg.show(txt('error_txt1'));
            }
            this.dimcDeletePopup.hide();
        },
        addActionCallback: function (action) {
            if (action.status == 'OK') {
                msg.show(txt('store_created'));
                users.showUserPassword(action.data.admin, action.data.password, 'Store Admin');
                reloadPage();
            } else {
                msg.show(txt('error_txt1'));
            }
            this.dimcAddPopup.hide();
        },

        storeChangedCallback: function (action) {
            var parent_pan = get('stores_pan_' + dm.storeId);
            if (parent_pan) stores.addActiveStoreSign(parent_pan);
            stores.dimcOptionsPopup.hide();
            ui.popup.hide();
        },
        // Handlers
        optionsBtnClick: function () {
            stores.showOptions(attr(this, 'store_id'));
        },
        deleteBtnClick1: function () {
            stores.confirmStoreDelete();
        },
        deleteBtnClick2: function () {
            stores.deleteStore();
        },
        addBtnClick: function () {
            stores.addStore();
        },
        visitBtnClick: function () {
            stores.dimcOptionsPopup.show();
            dm.setStoreId(stores.currentStore.store_id, stores.storeChangedCallback);
            //ui.popup.hide();
        },
        cityChanged: function () {
            var city = stores.citiesData[this.value];
            var cities = (city) ? city.childs : [];
            setOptions(stores.elts.addRegion, cities, '---', 'name_1', 'city_id');
        }
    };

    stores.elts.optionsDelBtn.onclick = stores.deleteBtnClick1;
    stores.elts.delBtn.onclick = stores.deleteBtnClick2;
    stores.elts.addBtn.onclick = stores.addBtnClick;
    stores.elts.addCity.onchange = stores.cityChanged;
    stores.elts.optionsVisit.onclick = stores.visitBtnClick;

    stores.loadAction = fetchAction.create('setting/list_stores', function (action) { stores.loadActionCallback(action) });
    stores.deleteAction = fetchAction.create('setting/delete_store', function (action) { stores.deleteActionCallback(action) });
    stores.addAction = fetchAction.create('setting/add_store', function (action) { stores.addActionCallback(action) });

    registerPage('stores', stores.elt, 'Stores', function () {
        stores.update();
    });
}