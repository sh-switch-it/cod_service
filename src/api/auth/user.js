const userService = require('../../service/userService');

const getUser = function (app) {
    return async(ctx, next) => {        
        try{
            const email = ctx.params.email;
            const result = await userService.getUserByEmail();
            ctx.response.body = result;
        }catch(err){
            ctx.response.body = err
        }
    };
}

const getUsers = function (app) {
    return async(ctx, next) => {        
        try{
            const result = await userService.getUsers();
            ctx.response.body = result;
        }catch(err){
            ctx.response.body = err
        }
    };
}

const createUser = function (app) {
    return async(ctx, next) => {        
        try{
            let username = ctx.request.body.username;
            let email = ctx.request.body.email;
            const result = await userService.addUser(username,email);
            ctx.response.body = result;
        }catch(err){
            ctx.response.body = err
        }
    };
}

const updateUser = function (app) {
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
                    result = await userService.updateUser(email, op, path, value);
                }
                
            }
            
            ctx.response.body = result;
        }catch(err){
            ctx.response.body = err
        }
    };
}

module.exports = {
    'GET /users': {
        method: getUsers,
        auth: []
    },
    'GET /users/:email': {
        method: getUser,
        auth: []
    },
    'POST /users': {
        method: createUser,
        auth: []
    },
    'PATCH /users/:email': {
        method: updateUser,
        auth: []
    }

}