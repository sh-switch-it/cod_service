const userService = require('./userService');
const companyDAO = require('../db/dao/companyDAO');
const userDAO = require('../db/dao/userDAO');

module.exports = {
    async addCompany(companyName) {
        let createdCompany;
        try{
            let companyname_exist = await userDAO.query({'company_name':companyName});
            if(companyname_exist){
                throw new Error('companyname has existed');
            }
            createdCompany = await companyDAO.create({'company_name':companyName, 'status':1});
        }catch(e){
            console.error(e);
            throw e;
        }
        return createdCompany;
    },

    async getCompany(email) {
        
        let userExist = await userDAO.query({'email': email});
        if(!userExist){
            throw new Error('email not existed');
        }
        
        let company = await companyDAO.query({'id': userExist.company_id});
        if(!company){
            return {};
        }
        return company;
    },

    async getCompanyById(id) {
        
        let company = await companyDAO.query({'id': id});
        if(!company){
            return {};
        }
        return company;
    },

    async getCompanyUsers(company_id) {
        let users = await userDAO.queryAll({'company_id': company_id});
        if(!users){
            throw new Error('company_id not existed');
        }

        return users;
    },

    async companyExisted(companyName) {
        try{
            return await companyDAO.query({'company_name':companyName});
        }catch(e){
            console.error(e);
            return true
        }
    },

    async addCompanyWithUser(companyInfo, userInfo) {
        let result;
        try{
            let company = await this.companyExisted(companyInfo.name);
            if(!company){
                console.log('company not exist, create: ' + companyInfo.name)
                company = await companyDAO.create({
                    'company_name':companyInfo.name,
                    'logo': companyInfo.logo,
                    'domain': companyInfo.domain,
                    'status':1});
            }
            result = await userService.addUser(userInfo.username, userInfo.email,
              userInfo.avatar, userInfo.location, userInfo.signature, company.id, userInfo.inviter, userInfo.status)
            console.log('createdUser: ', result)
        }catch(e){
            console.error(e);
            throw e;
        }
        return result;
    },
}