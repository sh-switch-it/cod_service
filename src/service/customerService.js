const customerDAO = require('../db/dao/customerDAO');

module.exports = {
    async addCustomer(name, phone, org, job) {
        let createdCustomer;
        try{
            let phone_exist = await customerDAO.query({'phone':phone,'status':1});
            if(phone_exist){
                throw new Error('customer/phone has existed');
            }
            createdCustomer = await customerDAO.create({
                'name':name,
                'phone':phone,
                'org': org,
                'job': job,
                'status': 1});
        }catch(e){
            console.error(e);
            throw e;
        }
        return createdCustomer;
    },
    async getCustomer(condition){
        let customer;
        try{
          customer =  customerDAO.query(condition);
        }catch(e){
            console.error(e);
            throw e;
        }
        return customer;
    },

    async isCustomerExist(phone) {
        try{
            return await customerDAO.query({'phone':phone});
        }catch(e){
            console.error(e);
            return true;
        }
    },

    async getCustomerById(id) {
        return await this.getCustomer({'id':id});
    },
    async getCustomerByPhone(phone) {
        return await this.getCustomer({'phone':phone});
    },
    async removeCustomer(id) {
        let customer;
        try{
          customer = await customerDAO.remove(id);
        }catch(e){
            throw e;
        }
        return customer;
    },
    async getCustomers() {
        let customers;
        try{
          customers = await customerDAO.queryAll({'status':1});
        }catch(e){
            throw e;
        }
        return customers;
    },

    async updateCustomer(newCustomer)
    {
        try{
            let customerExist = await customerDAO.query({'id': newCustomer.id});
            if(!customerExist){
                throw new Error('customer not existed');
            }

            const updatedCustomer = await customerDAO.update(newCustomer.id, newCustomer)
            
            return updatedCustomer;
        }catch(e){
            console.error(e);
            throw e;
        }
    },
}