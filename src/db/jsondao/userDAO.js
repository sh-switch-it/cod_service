import BaseDAO from './BaseDAO.js';
class UserDAO extends BaseDAO{
    constructor(){
        super('users');
    }
}



export default new UserDAO();