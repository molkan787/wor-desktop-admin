var account;
function account_init() {
    account = {
        elt: get('page_account'),
        elts: {
            fullname: get('acc_fullname'),
            type: get('acc_type'),
            username: get('acc_username'),
            pwdOld: get('acc_pwd_old'),
            pwdNew: get('acc_pwd_new'),
            pwdRet: get('acc_pwd_ret'),
            pwdBtn: get('acc_pwd_btn')
        },

        data: {},

        dimmer: ui.dimmer.create('page_account', true),

        saveAction: null,

        changePwd: function () {
            var old = val(this.elts.pwdOld);
            var _new = val(this.elts.pwdNew);
            var ret = val(this.elts.pwdRet);
            if (old.length < 8 || _new.length < 8 || ret.length < 8) {
                msg.show(txt('invalid_password'));
                return;
            }
            if (_new != ret) {
                msg.show(txt('passwords_doesnt_match'));
                return;
            }
            this.saveAction.do({
                new: _new,
                old: old
            });
            this.dimmer.show(txt('updating'));
        },

        update: function () {
            val(this.elts.type, txt('user_' + this.data.user_type));
            val(this.elts.fullname, this.data.fullname);
            val(this.elts.username, this.data.username);
            val(this.elts.pwdOld, '');
            val(this.elts.pwdNew, '');
            val(this.elts.pwdRet, '');
        },

        // Callbacks
        saveActionCallback: function (action) {
            if (action.status == 'OK') {
                val(this.elts.pwdOld, '');
                val(this.elts.pwdNew, '');
                val(this.elts.pwdRet, '');
                msg.show(txt('password_success'));
            } else if (action.error_code == 'wrong_password'){
                msg.show(txt('wrong_password'));
            }else {
                msg.show(txt('error_txt1'));
            }
            this.dimmer.hide();
        },

        // Handlers
        pwdBtnClick: function () {
            account.changePwd();
        },

        // -------------
        hasWriteAccess: function (ai) {
            return this.data.ai[ai] == '2';
        }
    };

    window.userType = () => parseInt(account.data.user_type);


    account.saveAction = fetchAction.create('account/changepassword', function (action) { account.saveActionCallback(action) });

    account.elts.pwdBtn.onclick = account.pwdBtnClick;

    registerPage('account', account.elt, 'Account', function () {
        account.update();
    });


}