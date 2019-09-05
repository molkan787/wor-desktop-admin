
function sl_init() {

    window.imp = require('electron').remote.require;

    actions_init();
    try {
        Printer.setup();
    } catch (error) {
        console.error(error);
    }
}