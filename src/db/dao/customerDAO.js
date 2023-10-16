const Customer = require('../models/Schema').Customer;
const { Sequelize } = require('sequelize');
const BaseDAO = require('./BaseDAO');
class CustomerDAO extends BaseDAO{
    constructor(){
        super(Customer);
    }

    async getOrgList(){
        try{
            return await this.Model.aggregate('org', 'DISTINCT', { plain: false }).map( item => item.DISTINCT);
        }catch(e){
            console.log(e);
            return [];
        }
    }

    async getJobList(){
        try{
            return await this.Model.aggregate('job', 'DISTINCT', { plain: false }).map( item => item.DISTINCT);
        }
        catch(e){
            console.log(e);
            return [];
        }
    }
}



module.exports = new CustomerDAO();