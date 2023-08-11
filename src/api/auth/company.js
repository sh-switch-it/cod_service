const companyService = require('../../service/companyService');

const getCompany = function (app) {
    return async(ctx, next) => {        
        try{
            
            const email = ctx.params.email;
            const result = await companyService.getCompany(email);
            ctx.response.body = result;
        }catch(err){
            ctx.response.body = err
        }
    };
}

const getCompanyInfo = function (app) {
    return async(ctx, next) => {        
        try{
            
            const company_id = ctx.params.company_id;
            const result = await companyService.getCompanyById(company_id);
            ctx.response.body = result;
        }catch(err){
            ctx.response.body = err
        }
    };
}

const getCompanyUsers = function (app){
    return async(ctx, next) => {        
        try{
            
            const company_id = ctx.params.company_id;
            const result = await companyService.getCompanyUsers(company_id);
            ctx.response.body = result;
        }catch(err){
            ctx.response.body = err
        }
    };
}


module.exports = {
    
    'GET /company/:email': {
        method: getCompany,
        auth: []
    },
    'GET /company/:company_id/users' : {
        method: getCompanyUsers,
        auth: []
    },
    'GET /company/:company_id/detail' : {
        method: getCompanyInfo,
        auth: []
    }

}