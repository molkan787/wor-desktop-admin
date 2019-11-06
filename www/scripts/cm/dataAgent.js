class DataAgent{

    static init(){
        this.dataReady = false;
        this.customers = [];
        this.products = [];
        dm.registerCallback(() => {
            this.dataReady = false;
            this.customers = [];
            this.products = [];
            this.loadData();
        });

        this.loadDataAction = fetchAction.create('ard');
    }

    static async loadData(){
        try {
            const data = await this.loadDataAction.do();
            this.customers = data.customers;
            this.products = data.products;
            this.dataReady = true;
        } catch (error) {
            console.error(error);
            setTimeout(() => this.loadData(), config.dataAgentRetryTimeout);
        }
    }

    static searchCustomers(query, limit){
        return this.search(this.customers, query, limit);
    }
    
    static searchProducts(query, limit){
        return this.search(this.products, query, limit);
    }

    static async getProductsByIds(ids){
        if(!this.dataReady) await waitUntil(() => this.dataReady);
        return this.products.filter(p => ids.includes(p.id));
    }

    static async search(data, query, limit){
        if(!this.dataReady){
            await waitUntil(() => this.dataReady);
        }
        const _query = query.replace(/\s/g, '').toLowerCase();
        const result = [];
        const _limit = limit || 20;
        const cs = data;
        const l = cs.length;
        for(let i = 0; i < l; i++){
            const c = cs[i];
            const name = c.name.replace(/\s/g, '').toLowerCase();
            if(name.indexOf(_query) != -1){
                result.push(c);
                if(result.length >= _limit) break;
            }
        }

        return result;
    }

}