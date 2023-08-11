const userService = require('../../service/userService');
const companyService = require('../../service/companyService');
const registerService = require('../../service/registerService');
const invitationService = require('../../service/invitationService');
const config = require('../../configReader')().config;
const forward = require('../forward');

async function existCheck(ctx, body) {
    let userExisted = await userService.isUserExist(body.email)
    if(userExisted) {
        ctx.response.status = 200
        ctx.response.body = { code: 409, msg: 'User email is already existed'}
    }

    return !userExisted
}

const createUser = function (app) {
    return async(ctx, next) => {
        let body = ctx.request.body

        let check = await existCheck(ctx, body)
        if(check) {
            const iamCreateUserFunc = body.state?
              registerService.iamCreate3rdPartyUser(body, ctx.query.app_params) :
              registerService.iamCreateNormalUser(body);

            await iamCreateUserFunc().then(async (result)=> {
                let userInfo = {
                    "username": body.nickname,
                    "email": body.email,
                    'location': body.location,
                    'avatar': body.avatar,
                    'inviter': body.inviter
                }
                userInfo.status = registerService.getUserStatus(body.email, body.inviter)

                let createdUser
                if(body.company) {
                    createdUser = await companyService.addCompanyWithUser(body.company, userInfo)
                } else {
                    createdUser = await userService.addUser(userInfo.username, userInfo.email,
                      userInfo.avatar, userInfo.location, userInfo.signature, null, userInfo.inviter, userInfo.status)
                }
                if(body.code) {
                    await invitationService.finishInvitation(body.code, body.email)
                    registerService.sendNotifyEmail(body.email)
                } else {
                    registerService.sendRequestEmail(body.email)
                }
                ctx.response.status = 200
                ctx.response.body = { code: 200, msg: "Success", data: createdUser }
            }).catch((errorMsg)=> {
                ctx.response.status = 500
                ctx.response.body = errorMsg
            })
        }
    };
}

const verifyEmail = function (app) {
    return async (ctx, next) => {
        let body = ctx.request.body
        let apiConfig = config.service.passcode
        let url = apiConfig.domain + apiConfig.context_path + '/email/verify/'

        await forward.request(url, 'post', null, ctx.request.body).then((result)=> {
            ctx.response.body = result;
        }).catch((error)=> {
            ctx.response.status = error.status;
            ctx.response.body = error.detail;
        })
    }
}

const verifyCompany = function (app) {
    return async (ctx, next) => {
        let body = ctx.request.body
        let apiConfig = config.service.passcode
        let url = apiConfig.domain + apiConfig.context_path + '/company/verify/'

        await forward.request(url, 'post', null, ctx.request.body).then((result)=> {
            ctx.response.body = result;
        }).catch((error)=> {
            ctx.response.status = error.status;
            ctx.response.body = error.detail;
        })
    }
}

module.exports = {
    'POST /register': {
        method: createUser,
        auth: []
    },
    'POST /verify/email': {
        method: verifyEmail,
        auth: []
    },
    'POST /verify/company': {
        method: verifyCompany,
        auth: []
    }
}