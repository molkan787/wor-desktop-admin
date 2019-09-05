class State {

    static init(){
        this.data = {
            online: true
        };

        this.handlers = {}

    }

    static onChange(name, handler){
        if(!this.handlers[name]) this.handlers[name] = [];
        this.handlers[name].push(handler);
    }

    static _callHandlers(name, value){
        if(!this.handlers[name]) return;
        for(let handler of this.handlers[name]){
            handler(value);
        }
    }

    static set online(val){
        if(val == this.data['online']) return;
        this.data['online'] = val;
        this._callHandlers('online', val);
    }

    static get online(){
        return this.data['online'];
    }


}

State.init();