var setting;
function setting_init() {
    setting = {
        elt: get('page_setting'),
        elts: {
            name: get('set_name'),
            phone: get('set_phone'),
            email: get('set_email'),
            address: get('set_address'),
            minTotal: get('set_min_total'),
            timingFrom: get('set_timing_from'),
            timingTo: get('set_timing_to'),
            timingSlot: get('set_timing_slot'),
            orderPhone: get('set_order_phone'),
            delCost: get('set_delcost'),
            razorKey: get('set_razor_key'),
            razorSecret: get('set_razor_secret'),
            notPhone: get('set_not_phone'),
            cancelTimeout: get('set_cancel_timeout')
        },

        dimc: ui.dimmer.create('setting_dimmer'),

        loadAction: null,
        saveAction: null,


        // Methods
        update: function () {
            Rights.check('payment_setting') ? showElt('setting_menu_payment', 'flex') : hideElt('setting_menu_payment');
            this.dimc.show();
            this.loadAction.do();
        },

        loadData: function (data) {
            val(this.elts.minTotal, data.min_total);
            val(this.elts.timingFrom, data.timing_from);
            val(this.elts.timingTo, data.timing_to);
            val(this.elts.timingSlot, data.timing_slot);
            val(this.elts.name, data.info.name || '');
            val(this.elts.phone, data.info.telephone || '');
            val(this.elts.email, data.info.email || '');
            val(this.elts.address, data.info.address || '');
            val(this.elts.orderPhone, data.info.order_phone || '');
            val(this.elts.delCost, data.fast_del_cost || '0');
            val(this.elts.razorKey, data.razor_key || '');
            val(this.elts.razorSecret, '');
            val(this.elts.notPhone, data.not_phone);
            val(this.elts.cancelTimeout, data.order_cancel_time);
        },

        save: function () {
            var data = {
                min_total: val(this.elts.minTotal),
                timing_from: val(this.elts.timingFrom),
                timing_to: val(this.elts.timingTo),
                timing_slot: val(this.elts.timingSlot),
                name: val(this.elts.name),
                telephone: val(this.elts.phone),
                email: val(this.elts.email),
                address: val(this.elts.address),
                order_phone: val(this.elts.orderPhone),
                fast_del_cost: val(this.elts.delCost),
                razor_key: val(this.elts.razorKey),
                razor_secret: val(this.elts.razorSecret),
                not_phone: val(this.elts.notPhone),
                order_cancel_time: val(this.elts.cancelTimeout)
            };
            this.dimc.show('Saving');
            this.saveAction.do(data);
        },

        // Callbacks
        loadActionCallback: function (action) {
            if (action.status == 'OK') {
                this.loadData(action.data);
            } else {
                msg.show(txt('error_3'));
            }
            this.dimc.hide();
        },
        saveActionCallback: function (action) {
            if (action.status == 'OK') {
                val(this.elts.razorSecret, '');
                msg.show(txt('msg_1'));
            } else {
                msg.show(txt('error_2'));
            }
            this.dimc.hide();
        },

        // Handlers
        saveBtnClick: function () {
            setting.save();
        }
    };

    for (var i = 0; i < 24; i++) {
        var opt1 = crt_elt('option', setting.elts.timingFrom);
        var opt2 = crt_elt('option', setting.elts.timingTo);
        var str = ('0' + i).substr(-2) + ':00';
        val(opt1, str);
        val(opt2, str);
        opt1.value = opt2.value = i;
    }
    for (var i = 1; i < 9; i++) {
        var opt1 = crt_elt('option', setting.elts.timingSlot);
        val(opt1, getTimeTextSS(i));
        opt1.value = i;
    }

    setting.loadAction = fetchAction.create('setting/store_setting', function (action) { setting.loadActionCallback(action) });
    setting.saveAction = fetchAction.create('setting/store_setting_save', function (action) { setting.saveActionCallback(action) });

    registerPage('setting', setting.elt, 'Setting', function () { setting.update(); });


    for (var i = 0; i < 9; i++) {
        var opt1 = crt_elt('option', setting.elts.cancelTimeout);
        val(opt1, getTimeTextSS(i));
        opt1.value = i * 900;
    }

}

function getTimeTextSS(i) {
    if (i == 0) return '0 Minutes';
    var str = '';
    var mi = i % 4;
    var hours = (i - mi) / 4;
    if (hours > 0) {
        str = hours + ' Hour' + (hours > 1 ? 's ' : ' ');
    }
    if (mi > 0) {
        str += (mi * 15) + ' Minutes';
    }
    return str;
}