var msg;
function dialogs_init() {
    msg = {
        show: function (text) {
            return alert(text);
        },

        confirm: function (text, callback) {
            const promise = Message.ask(text);
            promise.then(result => callback(result ? 'yes' : 'no'));
            return promise;
        }
    };
}