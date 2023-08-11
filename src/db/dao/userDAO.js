const User = require('../models/Schema').User;
const BaseDAO = require('./BaseDAO');
class UserDAO extends BaseDAO{
    constructor(){
        super(User);
    }
}

module.exports = new UserDAO();