const userDAO = require('./dao/userDAO');
const sequelize = require('./connect');
const userService = require('../service/userService');

async function dbPreCheck(){
    try{
        await sequelize.sync({force:false,alter:true});
        const superAdmins = await userDAO.queryAll({status:1,role:'超级管理员'});
        if(!superAdmins || superAdmins.length === 0){
            //create first admin account
            await userService.addUser('admin','P@ssw0rd123','超级管理员');
        }
        return true;  
    }catch(err){
        console.error(err);
    }
}

module.exports = dbPreCheck;

