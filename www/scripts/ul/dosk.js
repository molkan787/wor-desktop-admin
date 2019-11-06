class Dosk{

    static setRows(table, params){
        const {data, cells, formats, defaults, cellButtons} = params;
        const tbody = table.tBodies[0];
        for(let row of data){
            const tr = tbody.insertRow();
            for(let c of cells){
                const td = crt_elt('td', tr);
                const formater = formats[c];
                const button = cellButtons && cellButtons[c];
                const rawValue = row[c];
                const value = rawValue || (defaults && defaults[c]) || '';
                if(button){
                    if(!button.skipIfNoValue || rawValue){
                        const btn = crt_elt('button', td);
                        btn.className = 'ui button mbutton';
                        val(btn, button.text);
                        if(button.icon){
                            const i = crt_elt('i', btn);
                            i.className = button.icon + ' icon';
                        }
                        btn.onclick = () => button.onClick(rawValue, btn);
                    }else{
                        val(td, value);
                    }
                }else if(formater){
                    val(td, formater(value));
                }else{
                    val(td, value);
                }
            }
            if(params.buttons){
                const td = crt_elt('td', tr);
                td.style.textAlign = 'right';
                td.style.paddingLeft = '0';
                for(let btn of params.buttons){
                    const el = crt_elt('button', td);
                    el.className = btn.className;
                    el.onclick = () => btn.handler(row, tr);
                    if(btn.icon) crt_icon(btn.icon, el);
                }
            }
        }
    }

    static getRowsData(table, options){
        const getters = options && options.getters;
        const result = [];
        const rows = table.querySelectorAll('tbody tr');
        for(let row of rows){
            const data = this.getData(row, true, getters);
            if(data){
                result.push(data);
            }
        }
        return result;
    }

    static getData(el, nullIfEmpty, getters){
        const data = {};
        const inputs = el.querySelectorAll('input, select');
        let added = false;
        for(let input of inputs){
            const name = input.getAttribute('name');
            if(name){
                const getter = getters && getters[name];
                data[name] = getter ? getter(input) : input.value;
                added = true; 
            }
        }
        if(nullIfEmpty && !added) return null;
        return data;
    }

}