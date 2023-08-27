const customerService = require('../../service/customerService');

const getCustomer = function (app) {
    return async(ctx, next) => {        
        try{
            const email = ctx.params.email;
            const result = await customerService.getCustomerByEmail();
            ctx.response.body = result;
        }catch(err){
            ctx.response.body = err
        }
    };
}

const getCustomers = function (app) {
    return async(ctx, next) => {        
        try{
            const result = await customerService.getCustomers();
            ctx.response.body = result;
        }catch(err){
            ctx.response.body = err
        }
    };
}

const createCustomer = function (app) {
    return async(ctx, next) => {        
        try{
            let customername = ctx.request.body.customername;
            let email = ctx.request.body.email;
            const result = await customerService.addCustomer(customername,email);
            ctx.response.body = result;
        }catch(err){
            ctx.response.body = err
        }
    };
}

const updateCustomer = function (app) {
    return async(ctx, next) => {        
        try{
            let result = {};
            const email = ctx.params.email;
        
            let body = ctx.request.body;
            for (const v of body){
                
                let op = v.op;
                let path = v.path;
                let value = v.value;
                if (op === 'replace')
                {
                    result = await customerService.updateCustomer(email, op, path, value);
                }
                
            }
            
            ctx.response.body = result;
        }catch(err){
            ctx.response.body = err
        }
    };
}

module.exports = {
    'GET /customers': {
        method: getCustomers,
        auth: []
    },
    'GET /customers/:email': {
        method: getCustomer,
        auth: []
    },
    'POST /customers': {
        method: createCustomer,
        auth: []
    },
    'PATCH /customers/:email': {
        method: updateCustomer,
        auth: []
    }

}