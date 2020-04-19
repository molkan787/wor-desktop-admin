class TagInput{

    static get CUSTOM_MODE() { return 1 }
    static get SEARCH_MODE() { return 2 }

    constructor(options){
        const {parent, mode, onSearch, textProp, valueProp, placeholder, classes} = options;
        this.$mode = mode || TagInput.CUSTOM_MODE;
        this.$textProp = textProp || 'name';
        this.$valueProp = valueProp || 'id';
        const el = document.createElement('div');
        const input = document.createElement('input');
        input.placeholder = placeholder || '';
        el.appendChild(input);
        if(parent) parent.appendChild(el);
        el.className = 'tagInput ' + (classes ? classes : '');
        el.onclick = e => this.$rootElClick(e);

        this.$el = el;
        this.$inputEl = input;
        this.$items = [];

        el.controller = this;

        if(this.$mode == TagInput.SEARCH_MODE){
            this.$floatingList = new FloatingList({
                autoClearInput: true,
                textProp: this.$textProp,
                onSearch,
                onSelected: data => this.$createItem(data),
            });
            this.$floatingList.link([input]);
        }else{
            input.oninput = e => this.$onInput(e);
            input.onkeypress = e => e.charCode == 13 ? this.$onInput(e, true) : true;
        }
    }

    clearItems(){
        this.$items.length = 0;
        this.$el.removeChild(this.$inputEl);
        this.$el.innerHTML = '';
        this.$el.appendChild(this.$inputEl);
    }

    getItems(){
        return this.$items.map(i => i.data);
    }
    
    getItemsTexts(){
        return this.$items.map(i => i.data[this.$textProp]);
    }

    getItemsValues(){
        return this.$items.map(i => i.data[this.$valueProp]);
    }

    getItemsAsString(){
        return this.getItemsTexts().join(',');
    }

    setItemsFromString(str){
        if(!str){
            this.clearItems();
            return;
        }
        let items = str.split(',');
        items = items.map(i => i.trim());
        items = items.filter(i => i);
        items = items.map(i => ({name: i}));
        this.setItems(items);
    }

    setItems(items){
        this.clearItems();
        if(items instanceof Array){
            for(let item of items) this.$createItem(item);
        }else{
            this.$createItem(items);
        }
    }

    $createItem(data){
        const item = {data};
        this.$createTagEl(item);
        this.$items.push(item);
    }

    $createTagEl(item){
        const data = item.data;
        const tag = document.createElement('span');
        const icon = document.createElement('i');
        icon.className = 'close icon';
        icon.title = 'Remove';
        tag.innerText = data[this.$textProp];
        tag.value = data[this.$valueProp];
        tag.appendChild(icon);
        this.$el.insertBefore(tag, this.$inputEl);
        icon.onclick = () => this.$removeItem(item);
        item.el = tag;
    }

    $rootElClick(e){
        if(e.srcElement == this.$el){
            this.$inputEl.focus();
        }
    }

    $removeItem(item){
        const index = this.$items.indexOf(item);
        this.$items.splice(index, 1);
        this.$el.removeChild(item.el);
    }

    $onInput(e, force){
        if(this.$mode == TagInput.CUSTOM_MODE){
            const val = this.$inputEl.value;
            if(force || val.includes(',')){
                const text = val.split(',')[0];
                this.$inputEl.value = '';
                if(!text) return;
                const data = {};
                data[this.$textProp] = text.trim();
                this.$createItem(data);
            }
        }
    }

}