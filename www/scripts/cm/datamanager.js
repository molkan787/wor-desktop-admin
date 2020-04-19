var dm;

function dm_init() {
    dm_oca_init();
    cm.dm = dm;
    dm.storeId = -1;
    dm.apiToken = window.localStorage.getItem('api_token');
    dm.callbacks = [];

    dm.setToken = function (token) {
        this.apiToken = token;
        window.localStorage.setItem('api_token', token);
    };

    dm.registerCallback = function (callback) {
        this.callbacks.push(callback);
    };

    dm.callCallbacks = function () {
        for (var i = 0; i < this.callbacks.length; i++) {
            this.callbacks[i]();
        }
    };

    dm.setAsd = function (data) {
        this.cps = data.cps_categories;
        this.cats = data.categories.cats;
        this.subcats = data.categories.subcats;
        this.contactInfo = data.contact_info;
        account.data = data.user;
        dm.callCallbacks();
    };

    dm.updateCat = function (parent, data, gtype) {
        var items = (parseInt(parent) ? this.subcats[parent] : this.cats) || [];
        var found = false;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.id == data.category_id) {
                found = true;
                item.text = data.name[1];
                break;
            }
        }
        if (!found) {
            items.push({
                id: data.category_id,
                text: data.name[1],
                gtype: gtype
            });
        }
        dm.callCallbacks();
    };

    dm.deleteCat = function (parent, cat_id) {
        var items = parseInt(parent) ? this.subcats[parent] : this.cats;
        for (var i = 0; i < items.length; i++) {
            if (items[i].id == cat_id) {
                items.splice(i, 1);
            }
        }
        dm.callCallbacks();
    };

    dm.asdActionCallback = function (action) {
        if (action.status == 'OK') {
            dm.setAsd(action.data);
            if (dm.asdCallback) dm.asdCallback('OK');
            else {
                lm.setAvPages(action.data.user);
                ls.hide();
            }
            rtdc.check();
        } else if (action.error_code == 'NO_USER') {
            ls.showLogin();
        } else {
            dm.storeId = 0;
            if (dm.asdCallback) dm.asdCallback('FAIL');
            else msg.show(txt('error_3'));
            ls.showLogin();
        }
    };

    dm.getCat = function (cat_id) {
        for (var i = 0; i < this.cats.length; i++) {
            var cat = this.cats[i];
            if (cat.id == cat_id) {
                cat.subs = this.subcats[cat_id];
                return cat;
            }
        }
    };

    dm.setStoreId = function (store_id, callback) {
        dm.storeId = store_id;
        this.reloadAsd(callback);
    };

    dm.reloadAsd = function (callback) {
        this.cats = {};
        this.subcats = {};
        dm.asdAction.do();
        dm.asdCallback = callback;
    };

    dm.asdAction = fetchAction.create('common/asd', dm.asdActionCallback);

    if (dm.apiToken) {
        dm.asdAction.do();
    } else {
        setTimeout(function () { ls.showLogin(); }, 200);
    }
}