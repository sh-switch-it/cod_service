const Customer = require('../models/Schema').Customer;
const BaseDAO = require('./BaseDAO');
class CustomerDAO extends BaseDAO{
    constructor(){
        super(Customer);
    }
}

module.exports = new CustomerDAO();