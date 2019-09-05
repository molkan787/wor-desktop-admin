
function ui_popup_init() {
    ui.popup = {
        elt: null,
        isOpen: false,
        nextElt: null,
        closeBtn: null,

        showAnimation: {
            targets: '',
            opacity: 1,
            scale: 1,
            easing: 'easeOutExpo',
            duration: 500
        },
        hideAnimation: {
            targets: '',
            opacity: 0,
            scale: 0.95,
            easing: 'easeOutExpo',
            duration: 500,
            complete: function () {
                ui.popup.animCompleted();
            }
        },

        animCompleted: function () {
            if (this.elt) this.elt.style.display = 'none';
            this.elt = null;
            if (this.nextElt) {
                this.show(this.nextElt, true);
            }
        }
    };
    ui.popup.show = function (elt, isSwitch) {
        if (this.isOpen && this.elt) {
            this.nextElt = elt;
            this.hide();
            return;
        }
        this.nextElt = null;
        this.isOpen = true;
        elt = get(elt);
        this.elt = elt;
        elt.style.transform = 'scale(1.1)';
        elt.style.display = 'block';
        this.showAnimation.targets = '#' + elt.id;
        if (!isSwitch) ui.mx.bbp.show(1);
        anime(this.showAnimation);
    };

    ui.popup.hide = function () {
        this.isOpen = false;
        this.hideAnimation.targets = '#' + this.elt.id;
        if (!this.nextElt) ui.mx.bbp.hide(1);
        anime(this.hideAnimation);
    };

    ui.popup.setCloseButton = function (elt) {
        this.closeBtn = elt;
        elt.onclick = this.closeBtnClick;
    };

    ui.popup.closeBtnClick = function () {
        ui.popup.closeBtn = null;
        ui.popup.hide();
    };

    ui.mx.bbp.setClickHandler(1, function () {
        if (!ui.popup.closeBtn) ui.popup.hide();
    });

}