const DmDB = require('../DmDB');
const db = new DmDB();
class BaseDAO {
    constructor(_Model){
        this.Model = _Model;
    }
    async create(modelObject){
        await db.init();
        const conn = await db.getConnection();
        let columnsString = '"' + Object.keys(modelObject).join(`","`) + '"';
        columnsString += `,"createdAt","updatedAt"`;
        const values = Object.values(modelObject);
        let valuesString = "";
        for (let i = 0; i < values.length; i++) {
            let value = values[i];
            if(typeof value === 'string'){
                value = `'${value}'`;
            }
            if(i !== values.length -1){
                value += ',';
            }
            valuesString += value;
        }
        valuesString += `, now(), now()`;
        const sql = `INSERT INTO "${this.Model}" (${columnsString}) VALUES (${valuesString})`;
        console.log(sql);
        const create = await conn.execute(sql);
        console.log(create);
        await conn.commit();
    }


    async update(id,newModelObject){
        await db.init();
        const conn = await db.getConnection();
        let sql = `UPDATE "${this.Model}" `;
        let keyValuesString = '';
        const keys = Object.keys(newModelObject);
        for (let i = 0; i < keys.length; i++) {
            let valueString = newModelObject[keys[i]];
            if(typeof valueString === 'string'){
                valueString = `'${valueString}'`;
            }
            const keyValue = `"${keys[i]}" = ${valueString}`;

            if(i !== keys.length -1){
                keyValue += ',';
            }
            keyValuesString += keyValue;
        }
        sql += `SET ${keyValuesString} WHERE "id" = ${id}`;

        console.log(sql);
        const update = await conn.execute(sql);
        console.log(update);
        await conn.commit();
    }

    async patchUpdate(id,patchModelObject){
        await this.update(id, patchModelObject);
    }

    async remove(id){
        await db.init();
        const conn = await db.getConnection();
        const sql = `DELETE "${this.Model}" WHERE "id"=${id}`;
        console.log(sql);
        const remove = await conn.execute(sql);
        console.log(remove);
        await conn.commit();
    }
    async query(condition){
        // let result = await this.Model.findOne({
        //     where: condition,
        //     include: includeAssociation
        // },)
        // return result;
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

module.exports = BaseDAO;