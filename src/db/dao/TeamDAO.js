const Team = require('../models/Schema').Team;
const { Customer } = require('../models/Schema');
const BaseDAO = require('./BaseDAO');
const includeCondition = [{
    model: Customer,
    as: "customers",
    attributes: ["id","name","org","job","phone"],
    through: { attributes: [] }
    }
];
class TeamDAO extends BaseDAO{
    constructor(){
        super(Team);
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
}

module.exports = new TeamDAO();