var order;
function ui_order_init() {
    order = ui.order = {
        // Properties
        elt: get('page_order'),
        elts: {
            customer: get('ord_customer'),
            phone: get('ord_phone'),
            total: get('ord_total'),
            statusCon: get('ord_status_con'),
            statusText: get('ord_status_text'),
            statusIcon: get('ord_status_icon'),
            delSegment: get('ord_del_seg'),
            delDate: get('ord_del_date'),
            delTiming: get('ord_del_timing'),
            delAddr: get('ord_del_addr'),
            orderDate: get('ord_order_date'),
            itemsTable: get('ord_items_table'),

            optionsPopup: get('order_popup'),
            btnCompleted: get('ord_btn_com'),
            btnOut4Delivery: get('ord_btn_o4d'),
            btnPending: get('ord_btn_pen'),
            btnDelete: get('ord_btn_del'),

            receiptButton: get('ord_receipt_btn'),

            paidStatus: get('paid_status'),
            paidIcon: get('paid_icon'),
            paidText: get('paid_text'),

        },

        loadAction: null,
        changeAction: null,
        removeAction: null,

        dimc: ui.dimmer.create('ord_dimmer'),
        dimcPopup: ui.dimmer.create('ord_popup_dimmer'),

        // Methods

        createTableRow: function (v1, v2, v3, pid) {
            var tr = crt_elt('tr', this.elts.itemsTable);
            var td1 = crt_elt('td', tr);
            if(parseInt(pid) != 0) var icon = crt_elt('i', td1);
            var span = crt_elt('span', td1);
            var td2 = crt_elt('td', tr);
            var td3 = crt_elt('td', tr);

            td2.className = 'second';
            td3.className = 'third';

            if(parseInt(pid) != 0){
                icon.className = 'remove circle icon';
                attr(icon, 'data-product_id', pid);
                attr(icon, 'data-product_name', v1);
                icon.onclick = this.removeBtnClick;
            }
            val(span, v1);
            val(td2, v2);
            val(td3, v3);
            
        },

        loadOrder: function (data) {
            console.log(data)
            this.currentOrder = data;
            val(this.elts.customer, data.customer || 'Walk on Customer');
            val(this.elts.phone, data.telephone || '---');
            val(this.elts.total, fasc.formatPrice(data.total, true));
            if (data.customer) {
                val(this.elts.delDate, data.del_date);
                val(this.elts.delTiming, data.del_timing);
                val(this.elts.delAddr, data.shipping_address_1 || '---' + ', ' + data.shipping_city);
                this.elts.delSegment.style.display = 'block';
            } else {
                this.elts.delSegment.style.display = 'none';
            }
            val(this.elts.orderDate, data.date_added);

            var paid = data.paid;
            this.elts.paidStatus.className = 'paid_status ' + (paid ? 'paid' : 'not_paid');
            this.elts.paidIcon.className = 'icon ' + (paid ? 'check circle' : 'circle outline');
            val(this.elts.paidText, paid ? 'Paid' : 'Not Paid');

            var status_id = parseInt(data.order_status_id);

            this.elts.statusCon.className = 'status ' + ord_getStatusClass(status_id);
            this.elts.statusIcon.className = 'icon ' + ord_getStatusIcon(status_id);
            val(this.elts.statusText, ord_getStatusText(status_id));

            val(this.elts.itemsTable, '');

            var writeAccess = Rights.check('order_write') && account.hasWriteAccess('orders');
            
            for (var i = 0; i < data.items.length; i++) {
                var item = data.items[i];
                this.createTableRow(item.name, item.quantity, fasc.formatPrice(item.price, true), writeAccess ? item.product_id : 0);
            }
        },

        loadActionCallback: function (action) {
            if (action.status == 'OK') {
                console.log(action.data)
                this.orderData = action.data;
                this.loadOrder(action.data);
            } else {
                msg.show('We could not load order data.');
                goBack();
            }
            this.dimc.hide();
        },

        changeActionCallback: function (action) {
            if (action.status == 'OK') {
                if (action.data.operation == 'status') {
                    orders.updatePanelStatus(this.currentOrder.order_id, action.data.status);
                    this.currentOrder.order_status_id = action.data.status;
                    this.loadOrder(this.currentOrder);
                } else {
                    msg.show(txt('msg_2', 'Order'));
                    goBack(true);
                }
                ui.popup.hide();
            } else {
                msg.show(txt('error_2'));
            }
            this.dimcPopup.hide();
        },

        removeActionCallback: function(action){
            if(action.status == 'OK'){
                reloadPage();
            }else{
                msg.show(txt('error_2'));
            }
            this.dimc.hide();
        },

        showOptions: function () {
            var status = parseInt(this.currentOrder.order_status_id);
            attr_rm(this.elts.btnCompleted, 'disabled');
            attr_rm(this.elts.btnOut4Delivery, 'disabled');
            attr_rm(this.elts.btnPending, 'disabled');
            if (status == 5) {
                attr(this.elts.btnCompleted, 'disabled', '1');
            } else if (status == 4){
                attr(this.elts.btnOut4Delivery, 'disabled', '1');
            } else {
                attr(this.elts.btnPending, 'disabled', '1');
            }
            var writeAccess = (parseInt(account.data.ai.orders) == 2);
            if (writeAccess) {
                attr_rm(this.elts.btnDelete, 'disabled');
            } else {
                attr(this.elts.btnDelete, 'disabled', '1');
            }
            ui.popup.show(this.elts.optionsPopup);
        },

        removeProduct: async function(product_id, product_name){
            var msg = txt('confirm_product_return', product_name);
            if(await confirm(msg)){
                this.dimc.show('Please wait');
                this.removeAction.do({order_id: this.currentOrder.order_id, product_id: product_id});
            }

        },

        // Handlers
        actionIconClick: function () {
            const allowMarkAsDeliveredOnly = userType() == 14;
            if (!account.hasWriteAccess('orders') && !allowMarkAsDeliveredOnly) return;
            if (!order.dimc.visibile) {
                order.showOptions();
                if(allowMarkAsDeliveredOnly){
                    attr(order.elts.btnOut4Delivery, 'disabled', '1');
                    attr(order.elts.btnPending, 'disabled', '1');
                }
            }
        },

        btnsClick: function () {
            var params = {
                operation: attr(this, 'operation'),
                status: attr(this, 'status'),
                order_id: order.currentOrder.order_id
            };
            if (params.operation == 'delete') {
                msg.confirm('Are you sure you want to delete this Order?', function (answer) {
                    if (answer == 'yes') {
                        order.dimcPopup.show();
                        order.changeAction.do(params);
                    }
                });
            } else {
                order.dimcPopup.show();
                order.changeAction.do(params);
            }
        },

        removeBtnClick: function(){
            var pid = attr(this, 'data-product_id');
            var pnm = attr(this, 'data-product_name');
            order.removeProduct(pid, pnm);
        },

        receiptBtnClick: function(){
            navigate('receipt', {
                convertData: true,
                orderData: order.orderData,
            });
        }
    };

    order.elts.btnCompleted.onclick = order.btnsClick;
    order.elts.btnOut4Delivery.onclick = order.btnsClick;
    order.elts.btnPending.onclick = order.btnsClick;
    order.elts.btnDelete.onclick = order.btnsClick;

    order.elts.receiptButton.onclick = order.receiptBtnClick;

    order.loadAction = fetchAction.create('orderadm/info', function (action) { order.loadActionCallback(action) });
    order.changeAction = fetchAction.create('orderadm/change', function (action) { order.changeActionCallback(action) });
    order.removeAction = fetchAction.create('orderadm/removeProduct', function (action) { order.removeActionCallback(action) });

    registerPage('order', order.elt, oid => `Order #${oid}`, function (param) {
        order.dimc.show();
        order.loadAction.do({ order_id: param });
        if(!Rights.check('order_write')) hideHbFab();
    }, { icon: 'ellipsis vertical', handler: order.actionIconClick });
}