const invitationService = require('../../service/invitationService');

const createInvitation = function (app) {
    return async(ctx, next) => {        
        try{
            
            const invitee = ctx.request.body.invitee;
            const inviter = ctx.request.body.inviter;
            const result = await invitationService.createInvitation(inviter,invitee)
            ctx.response.body = result;
        }catch(err){
            ctx.response.body = err
        }
    };
}


module.exports = {
    
    'POST /invitation': {
        method: createInvitation,
        auth: []
    },
}