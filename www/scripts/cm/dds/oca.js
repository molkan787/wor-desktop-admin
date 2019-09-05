
function dm_oca_init() {
    dm = {
        // Properties
        // apiBaseURL: 'http://fasc.local/index.php?store_id={%1}&api_token={%2}&route=api/',
        // apiBaseURL: 'http://192.168.0.94/fasc/index.php?store_id={%1}&api_token={%2}&route=api/',
        apiBaseURL: 'https://www.walkonretail.com/index.php?store_id={%1}&api_token={%2}&route=api/',
        // apiBaseURL: 'https://surjankirana.com/api/index.php?store_id={%1}&api_token={%2}&route=api/',

        // Methods
        _getApiUrl: function (req, params) {
            var url = this.apiBaseURL.replace('{%1}', this.storeId).replace('{%2}', this.apiToken);
            url += req;

            if (params && typeof params == 'object') {
                if (typeof params.push == 'function') {
                    for (let i = 0; i < params.length; i++) {
                        let val = params[i].value;
                        if(typeof val == 'object' && !(val instanceof Array)) val = JSON.stringify(val);
                        url += '&' + params[i].name + '=' + encodeURIComponent(val);
                    }
                } else {
                    for (let name in params) {
                        if (params.hasOwnProperty(name)) {
                            let val = params[name];
                            if(typeof val == 'object' && !(val instanceof Array)) val = JSON.stringify(val);
                            url += '&' + name + '=' + encodeURIComponent(val);
                        }
                    }
                }
            }

            return url;
        },
        _callApi: function (url, action, dataProperty) {
            httpGetAsync(url, function (resp) {
                try {
                    resp = JSON.parse(resp);
                } catch (ex) {
                    //log(resp);
                    action.release('FAIL', 'invalid_json');
                    return;
                }
                if (resp.status == 'OK') {
                    if (typeof dataProperty != 'undefined') {
                        action.data = resp.data[dataProperty];
                    } else {
                        action.data = resp.data;
                    }
                    action.release('OK');
                } else {
                    action.release('FAIL', resp.error_code);
                }
            }, function () {
                action.release('FAIL', 'network_error');
            });
        },

        getProducts: function (filters, action) {
            var url = this._getApiUrl('product/list', filters);
            this._callApi(url, action, 'items');
        },

        getProduct: function (id, action) {
            var url = this._getApiUrl('product/info', { product_id: id });
            //log(url);
            //return;
            this._callApi(url, action);
        },

        saveProduct: function (data, action) {
            var url = this._getApiUrl('product/save', data);
            //log(url);
            //return;
            this._callApi(url, action);
        }
    };
}