class FloatingList{

    constructor(config){
        this.height = 200;
        this.elt = FloatingList.createElt();

        this.autoValueSet = config && config.autoValueSet || false;
        this.autoClearInput = config && config.autoClearInput && !this.autoValueSet || false;
        this.textProp = config && config.textProp || 'text';
        this.onSelected = config && config.onSelected;
        this.onSearch = config && config.onSearch;
    }

    link(selector){
        const elts = typeof selector == 'string' ? document.querySelectorAll(selector) : selector;
        for(let elt of elts){
            elt.addEventListener('focus', () => this.open(elt));
            elt.addEventListener('input', () => this.open(elt));
            elt.addEventListener('blur', () => {
                this._setInputValue();
                elt.scrollLeft = 0
                this.hide()
            });
        }
    }

    open(attachElt){
        const first = this.elt.style.display != 'block';
        if(this.onSearch){
            this.setLoading();
            const prop = attachElt.tagName == 'INPUT' ? 'value' : 'innerText';
            this.onSearch(attachElt[prop], first).then(items => {
                this.setItems(items);
            })
        }
        if(first){
            this.show(attachElt);
        }
    }

    setItems(items){
        this.elt.innerHTML = '';
        for(let item of items){
            this.createItemElt(item);
        }
    }

    setLoading(){
        this.elt.innerHTML = '';
        const img = crt_elt('img', this.elt);
        img.className = 'spinner';
        img.src = 'images/spinner.gif';
    }

    createItemElt(data){
        const elt = crt_elt('div', this.elt);
        val(elt, data[this.textProp]);
        elt.onclick = () => this.itemClick(data);
    }

    itemClick(data){
        if(this.autoValueSet && this._currentElt){
            const text = data[this.textProp];
            this._setInputValue(text);
            this._currentElt.setAttribute('fl-bktext', text);
        }
        if(this.onSelected){
            if(this.autoClearInput) this._setInputValue('');
            this.onSelected(data, this._currentElt);
        }
    }

    _setInputValue(val){
        const value = val || this._currentElt.getAttribute('fl-bktext');
        const prop = this._currentElt.tagName == 'INPUT' ? 'value' : 'innerText';
        this._currentElt[prop] = value;
    }

    show(attachElt){
        this._currentElt = attachElt;
        const rect = attachElt.getClientRects()[0];
        const topAttached = (rect.bottom + this.height) > window.innerHeight;
        this.elt.style.left = rect.left + 'px';
        this.elt.style.width = rect.width + 'px';
        let top = 0;
        if(topAttached){
            top = rect.top -this.height;
        }else{
            top = rect.bottom;
        }
        this.elt.style.top = (top + (topAttached ? -20 : 20)) + 'px';
        this.attachedSide = topAttached ? 'top' : 'bottom';

        this.elt.style.transform = 'scale(0.96)';
        this.elt.style.display = 'block';
        if(this.animation) this.animation.pause();
        this.animation = anime({
            targets: '#' + this.elt.id,
            scale: 1,
            top: top + 'px',
            opacity: 1,
            duration: 400,
            easing: 'easeOutQuad',
        })
    }

    hide(){
        // this._currentElt = null;
        if(this.animation) this.animation.pause();
        this.animation = anime({
            targets: '#' + this.elt.id,
            opacity: 0,
            duration: 200,
            scale: 0.97,
            easing: 'easeOutQuad',
            complete: () => {
                this.elt.style.display = 'none';
            }
        })
    }


    // -------------------

    static createElt(){
        if(typeof this.eltIdPointer == 'undefined'){
            this.eltIdPointer = 0;
        }
        const id = this.eltIdPointer++;
        const elt = crt_elt('div', get('holder'));
        elt.className = 'floatingList';
        elt.id = 'floating_list_' + id;
        return elt;
    }

}