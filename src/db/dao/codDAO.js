const CodRecord = require('../models/Schema').CodRecord;
const { CallRecord } = require('../models/Schema');
const BaseDAO = require('./BaseDAO');
const includeCondition = [{
    model: CallRecord,
    as: "callRecords",
    }
];
class CodDAO extends BaseDAO{
    constructor(){
        super(CodRecord);
    }

    async query(condition){
        let result = await this.Model.findOne({
            where: condition,
            include: includeCondition
        },)
        return result;
    }

    async queryAll(condition,sorter,offset,limit){
        let result = await this.Model.findAll({          
            where: condition,
            order: sorter,
            limit: limit,
            offset: offset,
            include:includeCondition
        })
        return result;
    }

    async queryAllAndCountAll(condition,sorter,limit,offset){
        let result = await this.Model.findAndCountAll({          
            where: condition,
            order: sorter,
            limit: limit,
            offset: offset,
            distinct: true,
            include:includeCondition
        })
        return result;
    }

    
}

module.exports = new CodDAO();