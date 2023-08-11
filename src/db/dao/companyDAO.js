const Company = require('../models/Schema').Company;
const BaseDAO = require('./BaseDAO');
class CompanyDAO extends BaseDAO{
    constructor(){
        super(Company);
    }
}

module.exports = new CompanyDAO();