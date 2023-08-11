const userDAO = require('../db/dao/userDAO');
const sequelize = require('../db/connect');
const { QueryTypes } = require('sequelize');

module.exports = {
    async addUser(username, email, avatar, location, signature, companyId, inviter, status) {
        let createdUser;
        try{
            let email_exist = await userDAO.query({'email':email});
            if(email_exist){
                throw new Error('username/email has existed');
            }
            createdUser = await userDAO.create({
                'username':username,
                'email':email,
                'avatar': avatar,
                'location': location,
                'signature': signature,
                'company_id': companyId,
                'inviter': inviter,
                'status':status? status: 1});
        }catch(e){
            console.error(e);
            throw e;
        }
        return createdUser;
    },
    async getUser(condition){
        let user;
        try{
            user =  userDAO.query(condition);
        }catch(e){
            console.error(e);
            throw e;
        }
        return user;
    },

    async isUserExist(email) {
        try{
            return await userDAO.query({'email':email});
        }catch(e){
            console.error(e);
            return true;
        }
    },

    async getUserById(id) {
        return await this.getUser({'id':id});
    },
    async getUserByEmail(email) {
        return await this.getUser({'email':email});
    },
    async removeUser(id) {
        let result = false;
        let user;
        try{
            user = await userDAO.update(id,{'status':0});
            if(user.status === 0){
                result = true;
            }
        }catch(e){
            throw e;
        }
        return result;
    },
    async getUsers() {
        let users;
        try{
            users = await userDAO.queryAll({'status':1});
        }catch(e){
            throw e;
        }
        return users;
    },

    async updateUser(email, op, path, value)
    {
        try{
            let userExist = await userDAO.query({'email': email});
            if(!userExist){
                throw new Error('email not existed');
            }

            const updatedUser = await userExist.update({
                [path]: value,
              },{
                 fields: [path]  // 只允许更新这个
              });
            
            return updatedUser;
        }catch(e){
            console.error(e);
            throw e;
        }
    },

    async updateSignature(email, signatureJson)
    {
        try{
            let user_exist = await userDAO.query({'email': email});
            if(!user_exist){
                throw new Error('email not existed');
            }
            
            user_exist.signature = signatureJson;
            user_exist.save();
        }catch(e){
            console.error(e);
            throw e;
        }
        
    },

    async getSignature(email)
    {
        try{
            let user_exist = await userDAO.query({'email': email});
            if(!user_exist){
                throw new Error('email not existed');
            }
            
            return user_exist.signature;
            
        }catch(e){
            console.error(e);
            throw e;
        }
    },

    async getPendingUserList() {
        const sql = "SELECT u.email, c.company_name, u.username, u.location, u.\"createdAt\" FROM users u" +
          " LEFT JOIN companies c ON u.company_id = c.id" +
          " WHERE u.status = 2"
        try{
            const users = await sequelize.query(sql, { type: QueryTypes.SELECT });
            return users;
        }catch(e){
            console.error(e);
            throw e;
        }
    },
    async getNormalUserList(searchText) {
        let sql = "SELECT u.email, c.company_name, u.username, u.location, u.inviter, u.\"createdAt\" FROM users u" +
          " LEFT JOIN companies c ON u.company_id = c.id" +
          " WHERE u.status = 1"
        if(searchText) {
            sql += " AND (u.email LIKE '%" + searchText + "%' OR u.inviter LIKE '%" + searchText + "%')"
        }
        try{
            const users = await sequelize.query(sql, { type: QueryTypes.SELECT });
            return users;
        }catch(e){
            console.error(e);
            throw e;
        }
    }
}