
const connectionService = require('../../service/connectionService');
const getConnections = function (app) {
    return async(ctx, next) => {        
        try{ 
            // console.log(ctx.token);
            const username = ctx.token.username;
            const result = await connectionService.getConnections(username);
            const friends = [];
            for (let i = 0; i < result.length; i++) {
                const item = result[i];
                friends.push(item.reference_id);
            }
            ctx.response.body = friends;
        }catch(err){
            ctx.response.body = err
        }
    };
}

module.exports = {
    'GET /connections': {
        method: getConnections,
        auth: []
    }
}