const RENO_PRODUCTS_GET = 'product/list';
const RENO_ORDERS_GET = 'orderadm/list';
const RENO_CLIENTS_GET = 'client/list';
const RENO_POS_PRODUCTS = 'pos/listProducts';
const RENO_ASD = 'common/asd';
const RENO_POST_ORDER = 'pos/addOrder';

class Reno {

    static init(){
        this.sm = new FSDB('cache', {
            uins: {
                products: 'product_id',
                orders: 'order_id',
                clients: 'customer_id',
                pos_products: 'id',
                asd: 'apiToken',
            }
        });

        setInterval(() => {
            this.submitOfflineOrders();
        }, 5 * 60 * 1000);
        setTimeout(() => this.submitOfflineOrders(), 60 * 1000);

        State.onChange('online', online => {
            if(online){
                this.submitOfflineOrders();
            }
        });

    }

    static async submitOfflineOrders(){
        if(!State.online) return;
        const orders = await this.sm.select('new_orders');
        for(let order of orders){
            try {
                const resp = await fetch(dm._getApiUrl('') + order.link);
                if(resp.status == 200){
                    this.sm.deleteWhereIdIn('new_orders', [order.id]);
                }
            } catch (error) {
                
            }
        }
    }

    static checkRequest(url, data){
        const path = url.split('&route=api/')[1];

        if(path.startsWith(RENO_PRODUCTS_GET)){
            this.cacheData('products', data.items);
        }else if (path.startsWith(RENO_ORDERS_GET)){
            this.cacheData('orders', data.items);
        }else if(path.startsWith(RENO_CLIENTS_GET)){
            this.cacheData('clients', data.items);
        }else if(path.startsWith(RENO_POS_PRODUCTS)){
            this.cacheData('pos_products', data.items);
        }else if(path.startsWith(RENO_ASD)){
            data.apiToken = dm.apiToken;
            this.cacheData('asd', data);
        }
        else{
            // console.log(path);
        }
    }

    static async handle(url){
        State.online = false;
        const path = url.split('&route=api/')[1];
        const params = this.parseParams(path);
        const range = {
            start: params.start || 0,
            limit: params.limit || 20,
        };
        let data = null;
        if(path.startsWith(RENO_PRODUCTS_GET)){
            data = { items: await this.sm.select('products', null, range) };
        }else if (path.startsWith(RENO_ORDERS_GET)){
            data = {
                totals: { total: 0, completed: 0, pending: 0 },
                items: await this.sm.select('orders', null, range)
            };
        }else if(path.startsWith(RENO_CLIENTS_GET)){
            data = {
                totals: { total: 0, verified: 0, not_verified: 0 },
                items: await this.sm.select('clients', null, range)
            };
        }else if(path.startsWith(RENO_POS_PRODUCTS)){
            data = { items: await this.sm.select('pos_products') };
        }else if(path.startsWith(RENO_ASD)){
            data = (await this.sm.select('asd', {apiToken: dm.apiToken}))[0];
        }else if(path.startsWith(RENO_POST_ORDER)){
            await this.sm.insert('new_orders', {
                id: uuidv1(),
                link: path,
            })
            data = {order_id: '000', customer: " "};
        }
        return this._craftResponseObject(data); 
    }

    static canHandle(url){
        const path = url.split('&route=api/')[1];
        const p1 = path.split('&')[0];
        if(p1 == RENO_PRODUCTS_GET && this.parseParams(path).ptype) return false;
        return [RENO_CLIENTS_GET, RENO_ORDERS_GET, RENO_PRODUCTS_GET,
                RENO_POS_PRODUCTS, RENO_ASD, RENO_POST_ORDER].includes(p1);
    }

    static cacheData(name, data){
        setTimeout(() => this.sm.insert(name, data), 1000);
    }

    static _craftResponseObject(data){
        return {
            status: 'OK',
            lang: '1',
            data
        }
    }

    static parseParams(url){
        const params = url.split('&');
        const result = {};
        for(let i = 1; i < params.length; i++){
            const param = params[i].split('=');
            result[param[0]] = param[1];
        }
        return result;
    }

}