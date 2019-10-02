(function () {
    "use strict";

    window.tippy = require('tippy.js')

    document.addEventListener( 'deviceready', onDeviceReady.bind( this ), false );

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener('pause', onPause.bind( this ), false );
        document.addEventListener('resume', onResume.bind(this), false);

    };
    window.log = console.log;
    const { dialog, app } = require('electron').remote.require('electron');
    // global.req = name => require('electron').remote.require(name);

    window.alert = text => Message.info(text);
    window.confirm = text => Message.ask(text);

    window.onload = function () {
        sl_init();
        cm_init();
        ui_init();
        do_tests();

        document.addEventListener("backbutton", ui_device_backBtn_click, false);
        document.addEventListener("keydown", (e) => {
            if (e.which === 123) {
                openDevTools();
            }
        });
        document.addEventListener("keydown", (e) => {
            if (e.which === 116) {
                window.onbeforeunload = null;
                window.location.reload(true);
            }
        });
        // const win = require('electron').remote.getCurrentWindow();
        // win.on('close', (e) => {
        //     if (win) {
        //       e.preventDefault();
        //       console.log('on close')
        //     }
        // });
        window.quit = function (){
            window.onbeforeunload = null;
            require('electron').remote.app.quit();
        }
        window.onbeforeunload = async function (event) {
            const message = 'Are you sure you want quit the app?';
            
            const resp = await confirm(message);

            if(resp){
                window.quit();
            }
            
            return message;
        };
    };

    function openDevTools(){
        const currentWindow = require('electron').remote.getCurrentWindow()
        currentWindow.openDevTools()
    }

    //window.onerror = function (msg, url, lineNo, columnNo, error) {
    //    if (lineNo) alert(msg + " -- " + lineNo);
    //    else alert(msg);

    //    return false;
    //}

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    };
} )();