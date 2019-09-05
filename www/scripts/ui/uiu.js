var uiu;
function uiu_init() {
    uiu = {
        tmpIdPtr: 1,
        animations: {
            removeElt_p1: {
                targets: '',
                opacity: 0,
                easing: 'easeOutExpo',
                duration: 400
            },
            removeElt_p2: {
                targets: '',
                height: 0,
                padding: 0,
                margin: 0,
                borderWidth: 0,
                easing: 'easeOutExpo',
                duration: 500
            }
        },

        removeElt: function (elt, smooth) {
            if (typeof elt == 'string') elt = get(elt);
            if (smooth) {
                if (!elt.id) elt.id = 'uiu_rv_tmp_id_' + (this.tmpIdPtr++);
                this.animations.removeElt_p1.targets = '#' + elt.id;
                this.animations.removeElt_p2.targets = '#' + elt.id;
                elt.style.overflow = 'hidden';
                var _this = this;
                this.animations.removeElt_p1.complete = function () {
                    anime(_this.animations.removeElt_p2);
                };
                this.animations.removeElt_p2.complete = function () {
                    if (elt && elt.parentNode)
                        elt.parentNode.removeChild(elt);
                };
                anime(this.animations.removeElt_p1);
            } else {
                elt.parentNode.removeChild(elt);
            }
        }
    };
}

function notify(title, text){
    return new Notification(title, {
        body: text,
        icon: 'images/slogo.png',
    })

}
