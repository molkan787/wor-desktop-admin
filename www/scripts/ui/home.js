var home;
function home_init() {

    home = {
        elt: get('page_home'),
        elts: {
            totalSales: get('stats_total_sales'),
            walkonSales: get('stats_walkon_sales'),
            onlineSales: get('stats_online_sales'),
            totalOrders: get('stats_total_orders'),
            completedOrders: get('stats_completed_orders'),
            pendingOrders: get('stats_pending_orders'),
            totalCustomers: get('stats_total_customers'),
            verifiedCustomers: get('stats_verified_customers'),
            notVerifiedCustomers: get('stats_notverified_customers'),
            popup: get('home_popup'),
            popupFrom: get('home_pp_from'),
            popupTo: get('home_pp_to'),
            popupSubmit: get('home_pp_submit'),
            filterDateText: get('home_filter_date_text')
        },

        loadAction: null,
        dailyLoadAction: null,

        dateFrom: '',
        dateTo: '',

        dimmer: ui.dimmer.create('page_home', true),

        menuItems: [
            { text: 'Print daily report', action: 'print_daily' }
        ],

        update: function () {
            this.dimmer.show();

            var d = new Date();
            if (this.dateTo.length < 1) this.dateTo = dateToString(d);
            d.setDate(d.getDate() - 6);
            if (this.dateFrom.length < 1) this.dateFrom = dateToString(d);
            val(this.elts.filterDateText, `${this.dateFrom} - ${this.dateTo}`);

            this.loadAction.do({ from: this.dateFrom, to: this.dateTo });
        },

        loadData: function (data) {
            val(this.elts.totalSales, fasc.formatPrice(data.total_sales.total));
            val(this.elts.walkonSales, fasc.formatPrice(data.total_sales.walkon));
            val(this.elts.onlineSales, fasc.formatPrice(data.total_sales.online));

            val(this.elts.totalOrders, data.orders.total);
            val(this.elts.completedOrders, data.orders.completed);
            val(this.elts.pendingOrders, data.orders.pending);

            val(this.elts.totalCustomers, data.customers.verified);
            val(this.elts.verifiedCustomers, data.customers.verified);
            val(this.elts.notVerifiedCustomers, data.customers.not_verified);

            // Preparing charts data
            var spd = data.salesPerDay;
            var spd_l = [];
            var spd_v = [[], []];
            for (var day in spd) {
                if (spd.hasOwnProperty(day)) {
                    spd_l.push(day.substr(-5));
                    spd_v[0].push(spd[day].w);
                    spd_v[1].push(spd[day].o);
                }
            }
            spd_l.reverse();
            spd_v[0].reverse();
            spd_v[1].reverse();
            initChart('home_chart_sales', spd_l, spd_v);

            spd = data.ordersPerDay;
            spd_l = [];
            spd_v = [];
            for (var day in spd) {
                if (spd.hasOwnProperty(day)) {
                    spd_l.push(day.substr(-5));
                    spd_v.push(spd[day]);
                }
            }
            spd_l.reverse();
            spd_v.reverse();
            initChart('home_chart_orders', spd_l, [spd_v]);

            spd = data.customersPerDay;
            spd_l = [];
            spd_v = [];
            for (var day in spd) {
                if (spd.hasOwnProperty(day)) {
                    spd_l.push(day.substr(-5));
                    spd_v.push(spd[day]);
                }
            }
            spd_l.reverse();
            spd_v.reverse();
            initChart('home_chart_customers', spd_l, [spd_v]);
        },

        showPopup: function () {
            val(this.elts.popupFrom, this.dateFrom);
            val(this.elts.popupTo, this.dateTo);
            ui.popup.show(this.elts.popup);
        },

        showOptions: function(){
            contextMenu.show('Reports', this.menuItems, this.menuItemClick);
        },

        // Callbacks
        loadActionCallback: function (action) {
            if (action.status == 'OK') {
                this.loadData(action.data);
            } else {
                msg.show(txt('error_3'));
            }
            this.dimmer.hide();
        },
        dailyLoadActionCallback: function (action) {
            this.dimmer.hide();
            if (action.status == 'OK') {
                printDailyReport(action.data);
            } else {
                msg.show(txt('error_3'));
            }
        },

        // Handlers
        submitBtnClick: function () {
            ui.popup.hide();
            const dateFrom = val(home.elts.popupFrom);
            const dateTo = val(home.elts.popupTo);
            home.dateFrom = dateFrom;
            home.dateTo = dateTo;
            val(home.elts.filterDateText, `${dateFrom} - ${dateTo}`);
            home.update();
        },

        menuItemClick: function (action) {
            if(action == 'print_daily'){
                home.dimmer.show('Loading data');
                home.dailyLoadAction.do();
            }
        },


    };

    home.loadAction = fetchAction.create('report/general', function (action) { home.loadActionCallback(action) });
    home.dailyLoadAction = fetchAction.create('report/dailyReport', function (action) { home.dailyLoadActionCallback(action) });

    home.elts.popupSubmit.onclick = home.submitBtnClick;

    registerPage('dashboard', home.elt, 'Dashboard', function () {
        home.update();
    });

    // var d = new Date();
    // attr(home.elts.popupTo, 'min', dateToString(d));
    // d.setDate(d.getDate() - 3);
    // attr(home.elts.popupFrom, 'max', dateToString(d));
}

function initChart(elt, labels, series) {
    var data = {
        labels: labels,
        series: series
    };
    const chart = new Chartist.Bar('#' + elt, data, { width: '100%', height: '300px', seriesBarDistance: 10});

    const tippy_config = {
        content: '',
        placement: 'top',
        arrow: true,
        animation: 'scale',
        theme: 'light',
        duration: 200
    };

    const values = series[0];
    chart.on('draw', function(data) {
        if(data.type == 'bar') {
            const content = `<br><span style="font-size: 18px !important">${values[data.index]}</span>`;
            tippy_config.content = labels[data.index] + content;
            tippy(data.element._node, tippy_config);
            data.element.animate({
                y2: {
                    dur: '1s',
                    from: data.y1,
                    to: data.y2,
                    easing: 'easeOutQuart'
                }
            });
        }
    });
}