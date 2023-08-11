const userService = require('../../service/userService');
const emailService = require('../../service/emailService');
const registerService = require('../../service/registerService');
const invitationService = require('../../service/invitationService');
const config = require('../../configReader')().config;

const getPendingUsers = function (app) {
  return async (ctx, next) => {
    ctx.response.status = 200
    ctx.response.body = { code: 200, data: await userService.getPendingUserList()}
  }
}

const getUserList = function (app) {
  return async (ctx, next) => {
    let results = []
    try {
      let pendingInvitations = await invitationService.getPendingInvitations(ctx.query.search_text)
      pendingInvitations.forEach((invitation)=> {
        results.push({
          "email": invitation.invitee,
          'company_name': null,
          'username': null,
          'location': null,
          'inviter': invitation.inviter,
          'createAt': invitation.createAt,
          'state': 0
        })
      })

      let users = await userService.getNormalUserList(ctx.query.search_text)
      users.forEach((user)=> {
        user.state = 1
        results.push(user)
      })

      ctx.response.status = 200
      ctx.response.body = { code: 200, data: results}

    } catch (e) {
      console.error("getUserList error: ", e);
      ctx.response.status = 200
      ctx.response.body = { code: 400, data: e}
    }
  }
}

const approve = function (app) {
  return async (ctx, next) => {
    const userEmail = ctx.request.body.email
    const adminEmail = ctx.token.username
    const admins = config.systemAdmins
    if(admins.indexOf(adminEmail) < 0) {
      ctx.response.status = 200
      ctx.response.body = { code: 400, message: "Not authorized to do this operation!"}
    } else {
      try {
        let result = await userService.updateUser(userEmail, null, 'status', 1)
        await sendApproveEmail(userEmail)
        ctx.response.status = 200
        ctx.response.body = { code: 200, data: result}
      } catch (e) {
        console.log("approve error: ", e);
        ctx.response.status = 200
        ctx.response.body = { code: 400, data: e}
      }
    }
  }
}

const reject = function (app) {
  return async (ctx, next) => {
    const userEmail = ctx.request.body.email
    const adminEmail = ctx.token.username
    const admins = config.systemAdmins
    if(admins.indexOf(adminEmail) < 0) {
      ctx.response.status = 200
      ctx.response.body = { code: 400, message: "Not authorized to do this operation!"}
    } else {
      try {
        let result = await userService.updateUser(userEmail, null, 'status', 3)
        await registerService.iamDeleteUser(userEmail, ctx.token.access_token)
        await sendRejectEmail(userEmail)
        ctx.response.status = 200
        ctx.response.body = { code: 200, data: result }
      } catch (e) {
        console.log("reject error: ", e);
        ctx.response.status = 200
        ctx.response.body = { code: 400, data: e }
      }
    }
  }
}

async function sendApproveEmail(email) {
  let apiConfig = config.service.booking
  let user = await userService.getUserByEmail(email)
  const templateParams = {
    first_name: user.username,
    link: apiConfig.domain + '/landing'
  }
  emailService.sendEmail(email, "Your openuse.io account has been approved",
    "dais_join_approved", templateParams)
}

async function sendRejectEmail(email) {
  let user = await userService.getUserByEmail(email)
  const templateParams = {
    first_name: user.username
  }
  emailService.sendEmail(email, "Your openuse.io account has been rejected",
    "dais_join_rejected", templateParams)
}

module.exports = {
  'GET /admin/pending-approval': {
    method: getPendingUsers,
    auth: []
  },
  'GET /admin/user-list' : {
    method: getUserList,
    auth: []
  },
  'POST /admin/approve': {
    method: approve,
    auth: []
  },
  'POST /admin/reject': {
    method: reject,
    auth: []
  }
}