import { Team } from '../models/Schema';
import { Customer } from '../models/Schema';
import BaseDAO from './BaseDAO';
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

export default new TeamDAO();