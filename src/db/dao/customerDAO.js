const Customer = require('../models/Schema').Customer;
const { Sequelize } = require('sequelize');
const BaseDAO = require('./BaseDAO');
class CustomerDAO extends BaseDAO{
    constructor(){
        super(Customer);
    }

    async getOrgList(){
        return await this.Model.aggregate('org', 'DISTINCT', { plain: false }).map( item => item.DISTINCT);
    }

    async getJobList(){
        return await this.Model.aggregate('job', 'DISTINCT', { plain: false }).map( item => item.DISTINCT);
    }
}



module.exports = new CustomerDAO();