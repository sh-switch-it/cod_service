const invitationService = require('../../service/invitationService');


const getInvitation = function (app) {
    return async(ctx, next) => {        
        try{
            const code = ctx.query.code;
            const result = await invitationService.getInvitationByCode(code)
            ctx.response.body = result;
        }catch(err){
            ctx.response.body = err
        }
    };
}


const finishInvitation = function( app){
    return async(ctx, next) => {        
        try{
            const code = ctx.request.body.code;
            const invitee = ctx.request.body.invitee;
            const result = await invitationService.finishInvitation(code,invitee)
            ctx.response.body = result;
        }catch(err){
            ctx.response.body = err
        }
    };
}



module.exports = {
    'GET /invitation': {
        method: getInvitation,
        auth: []
    },
    'PATCH /invitation': {
        method: finishInvitation,
        auth: []
    }
}