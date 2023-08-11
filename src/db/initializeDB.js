const userDAO = require('./dao/userDAO');
const sequelize = require('./connect');

async function dbPreCheck(){
    try{
        await sequelize.sync({force:false,alter:true});
        return true;  
    }catch(err){
        console.error(err);
    }
}

module.exports = dbPreCheck;

