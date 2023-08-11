const userService = require('../../service/userService');

const getUserInfo = function (app) {
    return async(ctx, next) => {        
        try{
            const email = ctx.params.email;
            const result = await userService.getUserByEmail(email);
            ctx.response.body = result;
        }catch(err){
            ctx.response.body = err
        }
    };
}

module.exports = {
    'GET /userinfo/:email': {
        method: getUserInfo,
        auth: []
    }
}