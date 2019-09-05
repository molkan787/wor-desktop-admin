var pos;
function pos_init() {
    pos = {
        elt: get('page_pos'),
        elts: {
            sec1: get('pos_sec1'),
            sec2: get('pos_sec2'),
            cItems: get('pos_c_items'),
            aItems: get('pos_a_items'),
            total: get('pos_total'),
            other: get('pos_other'),
            tax: get('pos_tax'),
            subTotal: get('pos_subtotal'),
            search: get('pos_search'),
            searchCats: get('pos_search_cats'),
            clearBtn: get('pos_btn_clear'),
            submitBtn: get('pos_btn_submit'),
            loadDataBtn: get('pos_loaddata_btn'),
            popup: get('pos_popup'),
            ppForm: get('pos_pp_form'),
            ppTotal: get('pos_pp_total'),
            ppCustomer: get('pos_pp_customer'),
            ppPhone: get('pos_pp_phone'),
            ppSubmit: get('pos_pp_submit'),
        },

        dimmer: ui.dimmer.create('page_pos', true),

        products: {},
        products_arr: null,

        total: 0,
        _total: 0,

        cart: {},
        cartItemsData: {},

        dataLoaded: false,

        loadAction: null,
        submitAction: null,

        cartIsEmpty(){
            for (var pid in this.cart) {
                if (this.cart.hasOwnProperty(pid) && this.cart[pid] > 0) {
                    return false;
                }
            }
            return true;
        },

        submit: function () {
            var prts = [];
            var other_val = parseFloat(val(this.elts.other));
            for (var pid in this.cart) {
                if (this.cart.hasOwnProperty(pid) && this.cart[pid] > 0) {
                    var pd = this.products[pid];
                    var p = {
                        id: pid,
                        q: this.cart[pid],
                        name: pd.name,
                        price: pd.price,
                        gst: pd.tax,
                        hsn: pd.hsn,
                        real_price: pd.real_price,
                    };
                    prts.push(p);
                }
            }
            if (prts.length < 1) return;
            this.dimmer.show('Submiting');pos_pp_submit
            this.popupLoading(true);
            this.submitAction.do({ 
                products: JSON.stringify({ items: prts }),
                other_val: other_val,
                customerName: val(this.elts.ppCustomer),
                customerPhone: val(this.elts.ppPhone),
            })
            .then((data) => {
                rtdc.addExcludes(data.order_id);
                navigate('receipt', {
                    orderData: {
                        id: data.order_id,
                        items: prts,
                        total: this.total,
                        tax: this.totalTax,
                        subTotal: this.subTotal,
                        customer: data.customer,
                        saved_amount: data.saved
                    }
                });
                this.clearCart();
            })
            .catch(() => {})
            .finally(() => {
                this.popupLoading(false)
                ui.popup.hide();
            });
        },

        patchData(data){
            if(!this.products_arr || !this.products_arr.length || !data || !data.length) return;
            const ids = [];
            for(let p of data){
                const cp = this.products[p.id];
                if(!cp) continue;
                ids.push(p.id);
                cp.quantity = p.quantity; 
                cp.price = p.price; 
            }
            this.updateDisplayedItems(ids);
        },
        updateDisplayedItems(ids){
            let icc = false;
            for(let id of ids){
                const p = this.products[id];
                const dp = this.displayedItems[id];
                const cp = this.cartItemsData[id];
                const cc = this.cart[id];
                if(dp){
                    if(dp.price != p.price || dp.quantity != p.quantity){
                        this.updatePanelData(p);
                    }
                }
                if(cp && cc){
                    if(cp.price != p.price || cc > parseInt(p.quantity)){
                        this.updateCartRowData(p);
                        icc = true;
                    }
                }
            }
            if(icc){
                this.updateTotal();
            }
        },

        loadData: function (data) {
            console.log(data.items);
            this.products_arr = data.items;
            var l = data.items.length;
            var ai = [];
            for (var i = 0; i < l; i++) {
                var p = data.items[i];
                this.products[p.id] = p;
                if (i < 40) {
                    ai.push(p);
                }
            }
            this.setAvItems(ai);
            try {
                setOptions(this.elts.searchCats, dm.cats.filter(c => c.gtype == '0'), true);
            } catch (error) {
                
            }
        },

        popupLoading(state){
            if(state){
                this.elts.ppForm.style.opacity = '0.5';
                attr(this.elts.ppCustomer, 'disabled', true);
                attr(this.elts.ppPhone, 'disabled', true);
                class_add(this.elts.ppSubmit, 'loading');
            }else{
                this.elts.ppForm.style.opacity = '1';
                attr_rm(this.elts.ppCustomer, 'disabled');
                attr_rm(this.elts.ppPhone, 'disabled');
                class_rm(this.elts.ppSubmit, 'loading');
            }
        },

        setAvItems: function (_items) {
            const items = _items.sort((a, b) => {
                const aq = parseInt(a.quantity);
                const bq = parseInt(b.quantity);
                if(aq > 0 && bq <= 0) return -1;
                else if (aq <= 0 && bq > 0) return 1;
                else return 0;
            });
            val(this.elts.aItems, '');
            this.displayedItems = {};
            for (var i = 0; i < items.length; i++) {
                const item = items[i];
                this.createPanel(item);
                this.displayedItems[item.id] = {...item};
            }
        },

        clearCart: function () {
            this.cart = {};
            this.cartItemsData = {};
            this.elts.cItems.innerHTML = '';
            val(this.elts.other, '0');
            this.updateTotal();
        },

        setProductCount: function (p_id, dir) {
            let cart_p = this.cart[p_id];
            const p = this.products[p_id];

            if (cart_p) {
                this.cart[p_id] += dir;
                val('pos_row_count_' + p_id, this.cart[p_id]);
            } else {
                if (dir != 1) return;
                this.cart[p_id] = 1;
                this.createRow(p);
                this.cartItemsData[p_id] = {...p};
            }
            if (this.cart[p_id] == 0) {
                uiu.removeElt('pos_row_' + p_id);
                this.cartItemsData[p_id] = null;
            }

            if(dir > 0 && parseInt(p.quantity) < this.cart[p_id]){
                this.setProductCount(p_id, -1);
            }else{
                this.updateTotal();
            }
        },

        updateTotal: function () {
            var total = 0;
            var subtotal = 0;
            var total_tax = 0;
            for (var pid in this.cart) {
                if (this.cart.hasOwnProperty(pid) && this.cart[pid] > 0) {
                    var p = this.products[pid];
                    var price = p.price;
                    var ltotal = this.cart[pid] * price;
                    total += ltotal;
                    var net = ltotal / ((100 + p.tax) / 100);
                    // var tax = ltotal / (1 + p.tax / 100);
                    total_tax += ltotal - net;
                    subtotal += net;
                }
            }
            var other_val = parseFloat(val(this.elts.other));

            this._total = total;
            this.total = total + other_val;
            this.subTotal = subtotal;
            this.totalTax = total_tax;

            val(this.elts.tax, fasc.formatPrice(total_tax, true));
            val(this.elts.subTotal, fasc.formatPrice(subtotal, true));
            val(this.elts.total, fasc.formatPrice(this.total, true));
        },

        _updateTotal: function () {
            var other_val = parseFloat(val(this.elts.other));
            this.total = this._total + other_val;

            val(this.elts.other, fasc.formatPrice(other_val, true));
            val(this.elts.total, fasc.formatPrice(this.total, true));
        },

        search: function (text, onlyBarcode) {
            if (!this.dataLoaded) return;
            const cat = val(this.elts.searchCats);
            var arr = this.products_arr;
            var l = arr.length;
            var ai = [];
            if (text.length < 2) {
                for (var i = 0; i < l; i++) {
                    if(cat && arr[i].cat != cat) continue;
                    ai.push(arr[i]);
                    if (ai.length >= 40) {
                        break;
                    }
                }
                this.setAvItems(ai);
                return;
            }
            for (var i = 0; i < l; i++) {
                var p = arr[i];
                if (p.barcode == text) {
                    this.addItem(p.id);
                    if (!onlyBarcode) {
                        val(this.elts.search, '');
                        this.search('');
                    }
                    return;
                } else if (text.length > 1 && p.barcode && p.barcode.indexOf(text) != -1){
                    ai.push(p);
                } else if (!onlyBarcode) {
                    if(cat && p.cat != cat) continue;
                    if (p.name.toLowerCase().indexOf(text) != -1 || p.id == text) {
                        ai.push(p);
                    }
                }
                if (ai.length >= 40) {
                    break;
                }
            }
            if (!onlyBarcode) this.setAvItems(ai);
        },

        addItem(pid){
            if(this.addTimer) clearTimeout(this.addTimer);
            this.addTimer = setTimeout(() => {
                this.setProductCount(pid, 1);
            }, 100);
        },

        // Methods
        updateCartRowData(data){
            console.log('Updating row:', data);
            const id = data.id;
            const el_sel = '#pos_row_' + id;
            const el = document.querySelector(el_sel);
            if(!el) return;
            const price_el = el.querySelector('.price');
            val(price_el, fasc.formatPrice(data.price, true));
            const diff = this.cart[id] - parseInt(data.quantity);
            if(diff > 0){
                this.setProductCount(id, -diff);
            }
        },

        createRow: function (data) {
            var tr = crt_elt('tr');
            var td1 = crt_elt('td', tr);
            var td2 = crt_elt('td', tr);
            var td3 = crt_elt('td', tr);
            var img = crt_elt('img', td1);
            var lbl = crt_elt('label', td3);
            var l_i1 = crt_elt('i', lbl);
            var l_lbl = crt_elt('label', lbl);
            var l_i2 = crt_elt('i', lbl);

            td1.className = 'first toe';
            td1.appendChild(crt_txt(data.name));
            val(img, data.image);
            val(td2, fasc.formatPrice(data.price, true));
            td2.className = 'price';
            lbl.className = 'ui label pos_item_cc';
            l_i1.className = 'minus icon';
            val(l_lbl, '1');
            l_i2.className = 'plus icon';

            l_lbl.id = 'pos_row_count_' + data.id;
            tr.id = 'pos_row_' + data.id;

            attr(l_i1, 'pid', data.id);
            attr(l_i2, 'pid', data.id);
            l_i1.onclick = this.minusBtnClick;
            l_i2.onclick = this.plusBtnClick;

            this.elts.cItems.appendChild(tr);
        },

        updatePanelData(data){
            const el_sel = '#pos_av_item_' + data.id;
            const nostock = parseInt(data.quantity) < 1;
            const el = document.querySelector(el_sel);
            if(!el) return;
            const nsp = el.querySelector('.no_stock_pane');
            const label = el.querySelector('label');
            anime({
                targets: el_sel,
                opacity: 0,
                duration: 200,
                easing: 'easeInOutExpo',
                complete: () => {
                    if(nostock){
                        el.style.pointerEvents = 'none';
                        nsp.style.display = 'unset';
                    }else{
                        el.style.pointerEvents = 'unset';
                        nsp.style.display = 'none';
                    }
                    val(label, fasc.formatPrice(data.price));
                    anime({
                        targets: el_sel,
                        opacity: 1,
                        duration: 800,
                        easing: 'easeInOutExpo'
                    })
                }
            })
        },

        createPanel: function (data) {
            const nostock = parseInt(data.quantity) < 1;
            var div = crt_elt('div');
            var img = crt_elt('img', div);
            var h4 = crt_elt('h4', div);
            var label = crt_elt('label', div);
            var label_stock = crt_elt('label', div);

            const nsp = crt_elt('div', div);
            const nsp_text = crt_elt('span', nsp)
            nsp.className = 'no_stock_pane';
            val(nsp_text, 'Out of stock');
            nsp_text.className = 'no_stock_pane_text';

            if(nostock){
                div.style.pointerEvents = 'none';
            }else{
                nsp.style.display = 'none';
            }

            label_stock.className = 'stock';
            val(label_stock, 'Stock: ' + data.quantity);

            h4.className = 'toe';
            val(img, data.image);
            val(h4, data.name);
            val(label, fasc.formatPrice(data.price));
            attr(div, 'pid', data.id);
            div.id = 'pos_av_item_' + data.id;
            div.onclick = this.panelClick;
            this.elts.aItems.appendChild(div);
        },

        // Callbacks
        loadActionCallback: function (action) {
            if (action.status == 'OK') {
                this.loadData(action.data);
                this.dataLoaded = true;
                attr_rm(this.elts.search, 'disabled');
            } else {
                msg.show(txt('error_3'));
            }
            this.dimmer.hide();
        },

        submitActionCallback: function (action) {
            console.log(action.data);
            if (action.status == 'OK') {
                // msg.show(txt('pos_success', action.data.order_id));
            } else {
                msg.show(txt('error_txt1'));
            }
            this.dimmer.hide();
        },

        showSubmitPopup(){
            val(this.elts.ppTotal, fasc.formatPrice(this.total));
            val(this.elts.ppCustomer, '');
            val(this.elts.ppPhone, '');
            ui.popup.show(this.elts.popup);
        },

        // Handlers
        panelClick: function () {
            pos.setProductCount(attr(this, 'pid'), 1);
        },
        plusBtnClick: function () {
            pos.setProductCount(attr(this, 'pid'), 1);
        },
        minusBtnClick: function () {
            pos.setProductCount(attr(this, 'pid'), -1);
        },
        searchBoxChanged: function () {
            pos.search(this.value);
        },
        searchCatChange(){
            pos.search(pos.elts.search.value);
        },
        clearBtnClick: function () {
            pos.clearCart();
        },
        submitBtnClick: function () {
            if(!pos.cartIsEmpty()){
                pos.showSubmitPopup();
            }
        },
        loadDataBtnClick: function () {
            pos.dimmer.show('Loading data');
            pos.loadAction.do();
        },
        otherValueChanged: function () {
            pos._updateTotal();
        }
    };

    pos.elts.clearBtn.onclick = pos.clearBtnClick;
    pos.elts.search.onkeyup = pos.searchBoxChanged;
    pos.elts.loadDataBtn.onclick = pos.loadDataBtnClick;
    pos.elts.submitBtn.onclick = pos.submitBtnClick;
    pos.elts.searchCats.onchange = pos.searchCatChange;
    pos.elts.other.onchange = pos.otherValueChanged;

    pos.loadAction = fetchAction.create('pos/listProducts', function (action) { pos.loadActionCallback(action) });
    pos.submitAction = fetchAction.create('pos/addOrder', function (action) { pos.submitActionCallback(action) });
    // pos.loadAction.do();
    registerPage('pos', pos.elt, 'POS');
    // pos.loadAction.do();

}
