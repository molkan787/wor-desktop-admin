class NotifyPan{

    static show(config){
        return new Promise((resolve, reject) => {
            this.setData(config && config.data);
            this.resolve = resolve;
            this.reject = reject;
            this._showElt();
            this.timeout = setTimeout(
                () => this.closeButtonClick(),
                1000 * 60 * 5
            )
        });
    }

    static setData(data){
        val('notify_pan_title', data.title);
        val('notify_pan_content', data.content);
        val('notify_pan_okbutton', data.okButton);
    }

    static primaryButtonClick(){
        if(this.timeout) clearTimeout(this.timeout);
        if(this.resolve) this.resolve();
        this._hideElt();
    }

    static closeButtonClick(){
        if(this.timeout) clearTimeout(this.timeout);
        if(this.reject) this.reject();
        this._hideElt();
    }

    static _showElt(){
        const elt = get('notify_pan');
        elt.style.display = 'block';
        elt.style.transform = 'scale(0.9)';
        if(this.anim) this.anim.pause();
        this.anim = anime({
            targets: '#notify_pan',
            opacity: 1,
            scale: 1,
            duration: 150,
            easing: 'easeOutQuad'
        })
    }

    static _hideElt(){
        const elt = get('notify_pan');
        if(this.anim) this.anim.pause();
        this.anim = anime({
            targets: '#notify_pan',
            opacity: 0,
            scale: 0.9,
            duration: 250,
            easing: 'easeOutQuad',
            complete(){
                elt.style.display = 'none';
            }
        })
    }

}