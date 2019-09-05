const fs = require('fs');
const uuidv1 = require('uuid/v1');

const FSDB_DELETE = 100;
const FSDB_UPDATE = 101;
const FSDB_STOP = 10;

class FSDB{

    constructor(storeName, config){

        const _config = config || {};
        this.uins = _config.uins || {};

        this.base = process.env.APPDATA + '\\WOR-Admin\\';
        if(!fs.existsSync(this.base)){
            fs.mkdirSync(this.base);
        }
        this.base += storeName + '\\';
        if(!fs.existsSync(this.base)){
            fs.mkdirSync(this.base);
        }

    }

    async select(collection, filters, range){
        const start = range && parseInt(range.start) || 0;
        const limit = range && parseInt(range.limit) ? parseInt(range.limit) + start : Infinity;
        const result = [];
        await this.loopCollection(collection, item => {
            if(this._compare(item, filters)){
                result.push(item);
            }
            if(result.length == limit) return FSDB_STOP;
        });
        if(start > 0){
            result.splice(0, start);
        }
        const uin = this._getUIN(collection);
        return result.sort((a,b) => a[uin] - b[uin]);
    }


    async insert(collection, data){
        const uuid = uuidv1();
        const items = data instanceof Array ? data : [data];

        const uin = this._getUIN(collection);
        const ids = items.map(item => item[uin]);

        await this.deleteWhereIdIn(collection, ids);

        const str = JSON.stringify(items);
        await this._write(collection, uuid, str);
        return uuid;
    }

    async deleteWhereIdIn(collection, ids){
        const uin = this._getUIN(collection);
        await this.loopCollection(collection, item => {
            if(ids.length == 0) return FSDB_STOP;
            const index = ids.indexOf(item[uin]);
            if(index != -1){
                ids.splice(index, 1);
                return FSDB_DELETE;
            }
        });
    }

    async loopCollection(name, cb){
        let files;
        try {
            files = await this._listFiles(name);
        } catch (error) {
            return false;
        }
        let index = 0;
        for(let file of files){
            let changed = false;
            const rawData = await this._read(name, file);
            const items = JSON.parse(rawData);
            for(let i = items.length-1; i >= 0; i--){
                const resp = cb(items[i], index);
                if(resp == FSDB_DELETE){
                    changed = true;
                    items.splice(i, 1);
                }else if(resp == FSDB_UPDATE){
                    changed = true;
                }else if(resp == FSDB_STOP){
                    if(changed){
                        if(items.length){
                            await this._write(name, file, JSON.stringify(items));
                        }else{
                            await this._delete(name, file);
                        }
                    }
                    return true;
                }
            }
            if(changed){
                if(items.length){
                    await this._write(name, file, JSON.stringify(items));
                }else{
                    await this._delete(name, file);
                }
            }
        }
        return true;
    }

    async loadCollection(name){
        const files = await this._listFiles(name);
        const result = [];
        for(let file of files){
            const rawData = await this._read(name, file);
            const items = JSON.parse(rawData);
            result.push(...items);
        }
        return result;
    }

    _compare(data, conds){
        if(!conds) return true;
        for(let prop in conds){
            const cond = conds[prop];
            if(typeof cond == 'function'){
                if(!cond(data[prop])) return false;
            }else{
                if(data[prop] != cond) return false;
            }
        }
        return true;
    }

    _getUIN(collection){
        return this.uins[collection] || 'id';
    }

    _listFiles(dir){
        return new Promise((resolve, reject) => {
            fs.readdir(this.base + dir, (err, files) => {
                if(err){
                    reject(err);
                }else{
                    resolve(files);
                }
            });
        });
    }

    _read(dir, file){
        return new Promise(async (resolve, reject) => {
            fs.readFile(this.base + dir + '\\' + file, (err, data) => {
                if(err){
                    reject(err);
                }else{
                    resolve(data);
                }
            });
        });
    }

    _write(dir, file, data){
        return new Promise(async (resolve, reject) => {
            const _dir = await this._getDir(dir);
            fs.writeFile(_dir + file, data, err => {
                if(err){
                    reject(err);
                }else{
                    resolve(true);
                }
            });
        });
    }

    _delete(dir, file){
        return new Promise(async (resolve, reject) => {
            const _dir = await this._getDir(dir);
            fs.unlink(_dir + file, err => {
                if(err){
                    reject(err);
                }else{
                    resolve(true);
                }
            });
        });
    }

    _getDir(name){
        return new Promise((resolve, reject) => {
            const path = this.base + name + '\\';
            fs.exists(path, exists => {
                if(exists){
                    resolve(path);
                }else{
                    fs.mkdir(path, err => {
                        if(err) reject(err);
                        else resolve(path);
                    });
                }
            });
        });
    }

}