const BaseDAO = require('./BaseDAO');
class UserDAO extends BaseDAO{
    constructor(){
        super('users');
    }

    // async queryAll(condition,sorter,offset,limit){
    //     let result = await this.Model.findAll({          
    //         where: condition,
    //         order: sorter,
    //         limit: limit,
    //         offset: offset,
    //         attributes:{
    //             exclude:['password']
    //         }
    //     })
    //     return result;
    // }
}



module.exports = new UserDAO();