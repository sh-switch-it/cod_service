import { User } from '../models/Schema';
import BaseDAO from './BaseDAO';
class UserDAO extends BaseDAO{
    constructor(){
        super(User);
    }

    async queryAll(condition,sorter,offset,limit){
        let result = await this.Model.findAll({          
            where: condition,
            order: sorter,
            limit: limit,
            offset: offset,
            attributes:{
                exclude:['password']
            }
        })
        return result;
    }
}



export default new UserDAO();