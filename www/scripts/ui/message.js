class Message{

    static init(){
        this.elt = get('msg_popup');
        this.textElt = get('msg_pp_text');
        this.cancelBtn = get('msg_pp_cancel');
        this.okBtn = get('msg_pp_ok');

        this.okBtn.onclick = () => this.okBtnClick();
        this.cancelBtn.onclick = () => this.cancelBtnClick();

        this.showAnim = {
            targets: '#msg_popup',
            opacity: 1,
            scale: 1,
            easing: 'easeOutExpo',
            duration: 500
        };
        this.hideAnim = {
            targets: '#msg_popup',
            opacity: 0,
            scale: 0.95,
            easing: 'easeOutExpo',
            duration: 500
        };
    }

    static async _show(){
        if(this.hidingAnim) this.hidingAnim.pause();
        this.animatingShow = new Promise(resolve => {
            this.elt.style.transform = 'scale(1.1)';
            this.elt.style.display = 'block';
            ui.mx.bbp.show(3);
            this.showAnim.complete = () => resolve();
            this.showingAnim = anime(this.showAnim);
        });
        return this.animatingShow;
    }

    static _hide(){
        if(this.showingAnim) this.showingAnim.pause();
        this.animatingHide = new Promise(async resolve => {
            await this.animatingShow;
            ui.mx.bbp.hide(3);
            this.hideAnim.complete = () => {
                this.elt.style.display = 'none';
                resolve();
            };
            this.hidingAnim = anime(this.hideAnim);
        });
        return this.animatingHide;
    }

    static okBtnClick(){
        this._hide();
        if(this.callback) this.callback(true);
    }
    static cancelBtnClick(){
        this._hide();
        if(this.callback) this.callback(false);
    }

    static info(text){
        return new Promise(resolve => {
            this.callback = resolve;
            this.cancelBtn.style.visibility = 'hidden';
            val(this.okBtn, 'OK');
            val(this.textElt, text);
            this._show();
        });
    }

    static ask(text, options){
        const {yesText, noText} = (options || {});
        return new Promise(resolve => {
            this.callback = resolve;
            this.cancelBtn.style.visibility = 'visible';
            val(this.okBtn, yesText || 'YES');
            val(this.cancelBtn, noText || 'NO');
            val(this.textElt, text);
            this._show();
        });
    }

}