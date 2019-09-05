var ls;
function ls_init() {
    ls = {
        elt: get('loading_screen'),
        elts: {
            spinner: get('ls_spinner'),
            login: get('ls_login'),
            loginUsername: get('ls_login_username'),
            loginPassword: get('ls_login_password'),
            loginBtn: get('ls_login_btn')
        },

        loginAction: null,
        visible: true,

        // Login Methods
        login: function () {
            var username = val(this.elts.loginUsername);
            var password = val(this.elts.loginPassword);
            if (username.length < 5 || password.length < 8) {
                msg.show(txt('fill_all_input'));
                return;
            }
            this.showSpinner();
            setTimeout(function () {
                ls.loginAction.do({ username: username, password: password });
            }, 300);
        },

        // UI Methods
        showLogin: function () {
            switchElements('ls_spinner', 'ls_login', 'unset');
        },
        showSpinner: function () {
            switchElements('ls_login', 'ls_spinner');
        },
        hide: function () {
            if (!this.visible) return;
            this.visible = false;
            anime({
                targets: "#loading_screen",
                opacity: 0,
                easing: 'easeOutExpo',
                duration: 300,
                complete: function () {
                    ls.elt.style.display = 'none';
                }
            });
        },

        show: function () {
            if (this.visible) return;
            this.visible = true;
            val(this.elts.loginPassword, '');
            switchElements('ls_spinner', 'ls_login', 'unset');
            this.elt.style.display = 'block';
            anime({
                targets: "#loading_screen",
                opacity: 1,
                easing: 'easeOutExpo',
                duration: 300
            });
        },

        // Callbacks
        loginActionCallback: function (action) {
            val(this.elts.loginPassword, '');
            if (action.status == 'OK') {
                dm.setToken(action.data.token);
                dm.asdAction.do();
            } else if (action.error_code == 'wrong_password') {
                msg.show(txt('wrong_password'));
                this.showLogin();
            } else if (action.error_code == 'user_not_found'){
                msg.show(txt('user_not_found'));
                this.showLogin();
            } else {
                msg.show(txt('error_3'));
                this.showLogin();
            }
        },

        // Handlers
        loginBtnClick: function () {
            ls.login();
        }
    };

    ls.elts.loginBtn.onclick = ls.loginBtnClick;
    ls.loginAction = fetchAction.create('users/login', function (action) { ls.loginActionCallback(action) });

}