import userDAO from './dao/userDAO';
import sequelize from './connect';
import userService from '../service/userService';
import codDAO from './dao/codDAO';
import customerDAO from './dao/customerDAO';
import configurationDAO from './dao/configurationDAO';

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

async function StopExceptionCodTask(){
    const exceptionCodTasks = await codDAO.queryAll({codStatus:3});
    for (let i = 0; i < exceptionCodTasks.length; i++) {
        const codTask = exceptionCodTasks[i];
        await codDAO.update(codTask.id, {codStatus: 4});
    }
}

async function syncOrgList(){
    const result = await customerDAO.getOrgList();
    console.log(result);
    await configurationDAO.updateOrgList(result);
}

async function syncJobList(){
    const result = await customerDAO.getJobList();
    console.log(result);
    await configurationDAO.updateJobList(result);
}

export { dbPreCheck, StopExceptionCodTask,syncOrgList,syncJobList};