var fasc;
function ui_fasc_init() {
    fasc = ui.fasc = {
        storeId: 0,
        // Properties
        currencySymbol: '&#8377;',

        // Methods
        formatPrice: function (price, without_sign) {
            return parseFloat(price || 0).toFixed(2) + (without_sign ? '' : ' ' + this.currencySymbol);
        }
    };
}