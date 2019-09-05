var pdr;
function pdr_init() {
    pdr = {
        elt: get('pdr'),
        txtElt: get('pdr_txt'),

        // Dynamics
        dragging: false,
        startY: 0,
        currentState: 'pull',


        // Methods
        setState: function (factor) {
            if (factor < 0) factor = 0;
            else if (factor > 1) factor = 1;
            this.elt.style.top = (70 * factor + 20) + 'px';
            this.elt.style.opacity = factor * 3;

            if (factor > 0.8 && this.currentState == 'pull') {
                val(this.txtElt, 'Release to refresh');
                this.currentState = 'release';
            } else if (factor <= 0.8 && this.currentState == 'release') {
                val(this.txtElt, 'Pull down to refresh');
                this.currentState = 'pull';
            }
        },
        resetBubble: function () {
            anime({
                targets: '#pdr',
                opacity: 0,
                top: '20px',
                duration: 300,
                easing: 'easeOutExpo',
                complete: function () {
                    val(pdr.txtElt, 'Pull down to refresh');
                }
            });
        },

        handleRelease: function () {
            if (this.currentState == 'release') {
                reloadPage();
            }
            this.currentState = 'pull';
        },

        handleDrag: function (currentY, scrollTop) {
            if (scrollTop > 0) this.startY = currentY;
            var range = currentY - this.startY;
            this.setState(range / 150);
        },

        _MouseDown: function (e) {
            var attr_val = attr(e.srcElement, 'cancel-pdr');
            if (attr_val == 'true') return;
            pdr.dragging = true;
            pdr.startY = e.touches[0].screenY;
        },

        _MouseUp: function (e) {
            pdr.dragging = false;
            pdr.resetBubble();
            pdr.handleRelease();
        },

        _MouseMove: function (e) {
            if (pdr.dragging) {
                pdr.handleDrag(e.touches[0].screenY, this.scrollTop);
            }
        },

        // ============================
        addElement: function (elt) {
            elt.addEventListener("touchstart", this._MouseDown);
            elt.addEventListener("touchend", this._MouseUp);
            elt.addEventListener("touchcancel", this._MouseUp);
            elt.addEventListener("touchleave", this._MouseUp);
            elt.addEventListener("touchmove", this._MouseMove);
        }

    };
}