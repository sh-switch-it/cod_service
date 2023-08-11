const emailService = require('../../service/emailService');
const config = require('../../configReader')().config;

const request_demo = function(app) {
    return async (ctx, next) => {
        let body = ctx.request.body;

        console.log("_______________ body = {}" + JSON.stringify(body));
        config.request_demo_email.forEach(element => {
            emailService.sendEmail(
                element,
                'New Openuse Portal Interest Request',
                'portal_interest',
                body);
        });
        
        ctx.response.body = {};
    } 
}

module.exports = {
    'POST /request_demo': {
        method: request_demo,
        auth: []
    },
}