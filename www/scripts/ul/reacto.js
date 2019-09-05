class Reacto{

    static bindInputs(selector, dataStore){
        const store = dataStore || this.createDataStore();
        const els = document.querySelectorAll(selector);
        for(let el of els){
            const name = el.getAttribute('name');
            if(!name) continue;
            store._createProp(name);
            store.data[name] = el.value;
            el.addEventListener('change', function(){
                store.data[name] = this.value;
            })
            store.watch(name, val => el.value = val);
        }
        return store;
    }

    static validateData(dataStore, config){
        const toCheck = config.check;
        const exclude = config.exclude;

        const data = dataStore.__data;
        if(typeof toCheck == 'boolean' && toCheck){
            for(let p in data){
                if(exclude.includes(p)) continue;
                if(!data[p].trim()) return false;
            }
        }
        return true;
    }

    static createDataStore(){
        return {
            __data: {},
            __props: [],
            data: {},
            watchers: {},

            watch(prop, callback){
                if(!(this.watchers[prop] instanceof Array))
                    this.watchers[prop] = [];
                this.watchers[prop].push(callback);
            },

            clear(val){
                const value = val || '';
                for(let p of this.__props){
                    this.data[p] = value;
                }
            },

            patch(data){
                for(let p in data){
                    if(!data.hasOwnProperty(p)) continue;
                    if(typeof this.data[p] != 'undefined'){
                        this.data[p] = data[p];
                    }
                }
            },

            _createProp(name){
                if(typeof this.data[name] != 'undefined') return;
                this.__props.push(name);
                const _this = this;
                Object.defineProperty(this.data, name, { 
                    set(val) {
                        const oldVal = _this.__data[name];
                        if(oldVal != val){
                            _this.__data[name] = val;
                            _this._triggerWatchers(name, oldVal);
                        }
                    },
                    get(){ return _this.__data[name] }
                });
            },

            _triggerWatchers(name, oldVal){
                const cbs = this.watchers[name];
                if(cbs instanceof Array){
                    const val = this.__data[name];
                    for(let cb of cbs){
                        cb(val, oldVal);
                    }
                }
            }
        }
    }

}