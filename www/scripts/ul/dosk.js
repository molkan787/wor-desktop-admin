class Dosk{

    static setRows(table, params){
        const {data, cells, formats, defaults} = params;
        const tbody = table.tBodies[0];
        for(let row of data){
            const tr = tbody.insertRow();
            for(let c of cells){
                const td = crt_elt('td', tr);
                const formater = formats[c];
                const value = row[c] || (defaults && defaults[c]) || '';
                if(formater){
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

    static getRowsData(table){
        const result = [];
        const rows = table.querySelectorAll('tbody tr');
        for(let row of rows){
            const data = this.getData(row, true);
            if(data){
                result.push(data);
            }
        }
        return result;
    }

    static getData(el, nullIfEmpty){
        const data = {};
        const inputs = el.querySelectorAll('input, select');
        let added = false;
        for(let input of inputs){
            const name = input.getAttribute('name');
            if(name){
                data[name] = input.value;
                added = true;
            }
        }
        if(nullIfEmpty && !added) return null;
        return data;
    }

}