var bcs_pressed = false;
var bcs_chars = [];
function BarcodeScanner_init() {
    window.onkeypress = function (e) {
        // console.log("Char code: " + e.which);
        if (e.which >= 48 && e.which <= 57) {
            bcs_chars.push(String.fromCharCode(e.which));
        }

        if (bcs_pressed == false) {
            setTimeout(function () {
                if (bcs_chars.length >= 10) {
                    var barcode = bcs_chars.join("");
                    //console.log("Barcode Scanned: " + barcode);
                    pos.search(barcode, true);
                }
                bcs_chars = [];
                bcs_pressed = false;
            }, 500);
        }

        bcs_pressed = true;
    };
}

BarcodeScanner_init();