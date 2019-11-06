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
            pwdBtn: get('acc_pwd_btn'),
            usernamePopup: get('username_popup')
        },

        data: {},

        dimmer: ui.dimmer.create('page_account', true),
        popupDimmer: ui.dimmer.create('username_popup', true),

        saveAction: null,
        usernameAction: null,

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

        showUsernamePopup(){
            val('username_pp_input', '')
            ui.popup.show('username_popup')
        },

        async chnageUsername(username){
            try {
                await this.usernameAction.do({username});
                this.data.username = username;
                val(this.elts.username, username);
                await alert('Username was successfully changed!');
                return true;
            } catch (error) {
                if(error == 'USERNAME_EXIST'){
                    alert(`Username "${username}" is already used, Please type a diffrent one.`);
                }else{
                    error_msg1();
                }
                return false;
            }
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
        
        changeUsernameClick(){
            this.showUsernamePopup();
        },

        async submitUsernameClick(){
            const username = val('username_pp_input').trim();
            if(username == this.data.username){
                alert('You have entered the current username, Please use a diffrent one.');
                return;
            }
            if(username.length < 6){
                alert('The username should be at least 6 characters long.');
                return;
            }
            if(isAlphaNumeric(username)){
                this.popupDimmer.show('Changing...');
                const success = await this.chnageUsername(username);
                this.popupDimmer.hide();
                if(success) ui.popup.hide();
            }else{
                alert('Special characters are not allowed.');
            }
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
    account.usernameAction = fetchAction.create('account/changeUsername');

    account.elts.pwdBtn.onclick = account.pwdBtnClick;

    registerPage('account', account.elt, 'Account', function () {
        account.update();
    });


}