var rtdc;
function rtdc_init() {
    var rtdc_time = parseInt(window.localStorage.getItem('rtdc_time')) || 'NOW';
    rtdc = {
        action: null,
        excludes: [],

        pingTime: rtdc_time,
        checkTime: rtdc_time,

        failCount: 0,

        data: {
            orders_count: 0,
        },

        check: function () {
            this.action.do({ time: this.pingTime });
        },

        releaseTime: function () {
            this.data.orders_count = 0;
            lm.setOrdersCount(0);
        },

        // Callbacks
        actionCallback: function (action) {
            if (action.status == 'OK') {
                // console.log('RTDC:', action.data)
                this.setPingTime(action.data.time);
                const orders = action.data.orders.filter(o => !this.excludes.includes(parseInt(o.order_id)));
                var orders_count = orders.length;
                if (orders_count > 0) {
                    this.data.orders_count += orders_count;
                    lm.setOrdersCount(this.data.orders_count);
                    this.notify(orders);
                }
                pos.patchData(action.data.products);
                this.scheduleCheck(10000);
                this.failCount = 0;
                State.online = true;
            }else if(action.error_code == 'network_error'){
                if(this.failCount == 2){
                    this.failCount = 0;
                    State.online = false;
                }else{
                    this.failCount++;
                }
                this.scheduleCheck(2000);
            }
            
        },

        scheduleCheck(time){
            if (this.timer) clearTimeout(this.timer);
            this.timer = setTimeout(() => { this.check() }, time);
        },

        notify(orders){
            if(orders.length == 1){
                notify('New order', `New order with a value of ${fasc.formatPrice(orders[0].total, true)} INR was placed`);
            } else if (orders.length > 1){
                notify('New orders', `${orders.length} new orders was placed`)
            }
        },

        // -----------
        setPingTime: function (time) {
            this.pingTime = time;
            window.localStorage.setItem('rtdc_time', time);
        },

        addExcludes(item){
            this.excludes.push(parseInt(item));
        }
    };

    rtdc.action = fetchAction.create('rtdc/v2', function (action) { rtdc.actionCallback(action) });
}