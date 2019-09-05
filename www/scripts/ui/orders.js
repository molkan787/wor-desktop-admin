var orders;
function ui_orders_init() {
    orders = ui.orders = {
        // Proprties
        elt: get('page_orders'),
        elts: {
            ordsList: get('ords_list'),
            filtersPopup: get('ords_popup'),
            filterStatus: get('ords_filters_status'),
            filterOrderDate: get('ords_filters_order_date'),
            filterSubmit: get('ords_filters_submit'),

            statsTotal: get('ords_stats_total'),
            statsCompleted: get('ords_stats_completed'),
            statsPending: get('ords_stats_pending'),
            statsNew: get('ords_stats_new'),

            searchbox: get('orders_searchbox'),
        },
        dimc: ui.dimmer.create('ords_dimmer'),

        filters: [],

        loadAction: null,

        currentPage: 0,
        itemsPerPage: 20,

        // Methods
        createRow: function (data, table) {
            // Customer | Order Date & Time | Total | Status | Paid
            const tr = table.tBodies[0].insertRow(table.rows.length-1);
            const td3 = crt_elt('td', tr);
            const td5 = crt_elt('td', tr);
            const td2 = crt_elt('td', tr);
            const td1 = crt_elt('td', tr);
            const td6 = crt_elt('td', tr);
            const td4 = crt_elt('td', tr);
            const icon = crt_elt('i', td1);
            const span = crt_elt('span', td1);
            const btn = crt_elt('button', td4);

            tr.id = 'ord_pan_' + data.order_id;

            const status_id = parseInt(data.order_status_id);
            td1.className = ord_getStatusClass(status_id) + ' pl60_f';
            icon.className = ord_getStatusIcon(status_id) + ' icon';
            td2.className = td6.className = 'half6 nw';
            td4.className = 'pl60_f';

            val(span, ord_getStatusText(status_id));
            val(td2, ui.fasc.formatPrice(data.total));
            val(td3, data.customer.trim() || '---');

            val(td5, data.date_added.substr(0, data.date_added.length-3));
            val(td6, data.paid ? 'Paid' : 'Not Paid');

            val(btn, 'Show details');
            btn.className = 'ui tiny button';
            btn.onclick = () => { navigate('order', data.order_id) };

            return tr;
        },

        updatePanelStatus: function (order_id, status) {
            var pan = get('ord_pan_' + order_id);
            if (!pan) return;
            var td = pan.children[3];
            var i = get_bt('i', td)[0];
            var span = get_bt('span', td)[0];
            td.className = ord_getStatusClass(status);
            i.className = ord_getStatusIcon(status) + ' icon';
            val(span, ord_getStatusText(status));
        },

        loadOrders: function (list) {
            clearRows(this.elts.ordsList);
            for (var i = 0; i < list.length; i++) {
                this.createRow(list[i], this.elts.ordsList);
            }
        },

        update: function (param) {
            this.dimc.show();
            if (typeof param == 'object' && param) {
                this.fc.lock();
                this.fc.clear();
                this.fc.setFilter({ name: 'customer_id', value: param.customer_id, text: 'Customer: ' + param.name });
                this.fc.unlock();
                this.loadAction.refStart = 0;
                this.loadAction.do(this.filters);

            } else if (typeof param == 'number') {
                this.filters.push({ name: 'start', value: param * this.itemsPerPage });
                this.filters.push({ name: 'limit', value: this.itemsPerPage });
                this.loadAction.refStart = param * this.itemsPerPage;
                this.loadAction.do(this.filters);
                this.filters.pop();
                this.filters.pop();

            } else {
                this.loadAction.refStart = 0;
                this.loadAction.do(this.filters);
            }
        },

        loadActionCallback: function (action) {
            if (action.status == 'OK') {
                const stats = action.data.totals;
                val(this.elts.statsTotal, stats.total);
                val(this.elts.statsCompleted, stats.completed);
                val(this.elts.statsPending, stats.pending);
                const counts = rtdc.data.orders_count;
                rtdc.releaseTime();
                val(orders.elts.statsNew, counts);
                this.pagination.setState(action.refStart, action.data.items.length);
                this.loadOrders(action.data.items);
            } else {
                msg.show(txt('error_3'));
            }
            this.dimc.hide();
        },

        filtersChanged: function () {
            orders.update();
        },

        showFilters: function () {
            val(this.elts.filterStatus, this.fc.getValue('status'));
            val(this.elts.filterOrderDate, this.fc.getValue('order_date'));
            ui.popup.show(this.elts.filtersPopup);
        },

        submitFilters: function () {
            this.fc.lock();
            this.fc.setFilter({ name: 'status', value: val(this.elts.filterStatus), text: getSelectedText(this.elts.filterStatus) });
            this.fc.setFilter({ name: 'order_date', value: val(this.elts.filterOrderDate), text: 'Order date: ' + val(this.elts.filterOrderDate) });
            this.fc.unlock(true);
            ui.popup.hide();
        },

        search(){
            this.fc.setFilter({ name: 'search', value: val(this.elts.searchbox) }, true);
        }
    };

    onSubmit(orders.elts.searchbox, () => orders.search());

    orders.pagination = Pagination(orders.itemsPerPage, [get('ords_btns1')]);

    orders.loadAction = fetchAction.create('orderadm/list', function (action) { orders.loadActionCallback(action) });

    orders.fc = filtersController.create(get('ords_filters'), orders.filtersChanged, orders.filters);
    orders.elts.filterSubmit.onclick = function () { orders.submitFilters() };

    registerPage('orders', orders.elt, 'Orders', function (param) {
        orders.update(param);
    });
}

function ord_getStatusText(status_id) {
    if (status_id == 5)
        return 'Completed';
    else if (status_id == 7)
        return 'Canceled';
    else
        return 'Pending';
}
function ord_getStatusIcon(status_id) {
    if (status_id == 5)
        return 'check circle';
    else if (status_id == 7)
        return 'ban';
    else
        return 'time';
}
function ord_getStatusClass(status_id) {
    if (status_id == 5)
        return 'status completed';
    else if (status_id == 7)
        return 'status canceled';
    else
        return 'status pending';
}