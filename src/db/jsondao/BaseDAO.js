import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';
import { getConfigReader } from '../../configReader.js';
import lodash from 'lodash';
const config = getConfigReader().getConfig();


class BaseDAO {
    constructor(_dbName){
        this.dbName = _dbName;
        const defaultValue = {};
        defaultValue[_dbName] = [];
        this.db = new LowSync(new JSONFileSync(config.jsondb.path + '/'+ _dbName +'.json'),defaultValue)
        //this.db.read()
        //this.db.write();
    }
    async create(modelObject){
        let createdModel = {createdAt: new Date(),updatedAt: new Date()};
        Object.assign(createdModel,modelObject);
        console.log(createdModel);
        try{
            this.db.read();
            const currentList = this.db.data[this.dbName];
            createdModel.id = currentList.length + 1;
            currentList.push(createdModel);
            this.db.write()
        }catch(e){
            console.error(e);
        }
        return createdModel;
    }
    async update(id,newModelObject){
        this.db.read();
        const currentList = this.db.data[this.dbName];
        let exist = lodash.find(currentList,{id});
        exist = Object.assign(exist,newModelObject);
        this.db.write();
        return exist;
    }

    // async patchUpdate(id,patchModelObject){
    //     let exists = await this.Model.findByPk(id);
    //     Object.keys(patchModelObject).map((key)=>{
    //         exists.set(key, patchModelObject[key]);
    //     })
    //     let result = await exists.save();
    //     return result;
    // }

    async remove(id){
        this.db.read();
        const currentList = this.db.data[this.dbName];
        lodash.remove(currentList,{id});
        this.db.write();
        return;
    }
    async query(condition,includeAssociation){
        this.db.read();
        const currentList = this.db.data[this.dbName];
        return lodash.find(currentList,condition);
    }
    // async queryAll(condition,sorter,offset,limit){
    //     let result = await this.Model.findAll({          
    //         where: condition,
    //         order: sorter,
    //         limit: limit,
    //         offset: offset,
    //     })
    //     return result;
    // }
}

export default BaseDAO;