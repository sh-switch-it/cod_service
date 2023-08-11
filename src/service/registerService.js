const config = require('../configReader')().config;
const emailService = require('./emailService');
const request = require('request');

module.exports = {
  iamCreateNormalUser (body) {
    const user = {
      "username": body.email,
      "password": body.password,
      "email": body.email,
      "first_name": body.nickname
    }

    return async function() {
      return new Promise((resolve,reject)=>{
        let apiConfig = config.service.iam
        let url = apiConfig.domain + '/v1/users'

        request.post({
          url: url,
          json: true,
          body: user,
          headers: {
            "accept": "*/*"
          },
          rejectUnauthorized:false
        }, function(err, response, body){
          if (err) {
            console.error('[iamCreateUser]', 'error check token', err.stack);
            reject(err.message )
          } else if (response.statusCode >= 400) {
            console.error('[iamCreateUser]', 'unable to create user in iam ', response.body);
            reject(response.body)
          } else {
            console.log('[iamCreateUser]', 'success', body);
            resolve(body)
          }
        });
      })
    }

  },

  iamCreate3rdPartyUser (body, appParams) {
    const user = {
      "username": body.email,
      "email": body.email,
      "first_name": body.nickname,
      "state": body.state,
    }

    return async function() {
      return new Promise((resolve,reject)=>{
        let apiConfig = config.service.iam
        let url = apiConfig.domain + '/3partyapp/users?app_params=' + appParams

        console.log("iamCreate3rdPartyUser: " + url)
        request.post({
          url: url,
          json: true,
          body: user,
          headers: {
            "accept": "*/*"
          },
          rejectUnauthorized:false
        }, function(err, response, body){
          if (err) {
            console.error('[iamCreate3rdPartyUser]', 'error check token', err.stack);
            reject(err.message )
          } else if (response.statusCode >= 400) {
            console.error('[iamCreate3rdPartyUser]', 'unable to create user in iam ', response.body);
            reject(response.body)
          } else {
            console.log('[iamCreate3rdPartyUser]', 'success', body);
            resolve(body)
          }
        });
      })
    }

  },

  async iamDeleteUser (email, token) {
    return new Promise((resolve,reject)=>{
      let apiConfig = config.service.iam
      let url = apiConfig.domain + '/v1/users/' + email

      request.delete({
        url: url,
        json: true,
        headers: {
          "accept": "*/*",
          "x-access-token": "Bearer "+token
        },
        rejectUnauthorized:false
      }, function(err, response, body){
        if (err) {
          console.error('[iamDeleteUser]', 'error check token', err.stack);
          reject(err.message )
        } else if (response.statusCode >= 400) {
          console.error('[iamDeleteUser]', 'unable to delete user in iam ', response.body);
          reject(response.body)
        } else {
          console.log('[iamDeleteUser]', 'success', body);
          resolve(body)
        }
      });
    })
  },

  getUserStatus(userEmail, inviter) {
    let status = 1
    if(!inviter) {
      const admins = config.systemAdmins
      if(admins.indexOf(userEmail) < 0) {
        status = 2
      }
    }
    return status
  },

  sendRequestEmail(email) {
    const apiConfig = config.service.booking
    const admins = config.systemAdmins
    admins.forEach((admin)=> {
      const templateParams = {
        first_name: admin,
        email: email,
        link: apiConfig.domain + '/manage/pending-approvals'
      }
      emailService.sendEmail(admin, "New account application comes",
        "dais_new_join_request", templateParams)
    })
  },

  sendNotifyEmail(email) {
    const apiConfig = config.service.booking
    const admins = config.systemAdmins
    admins.forEach((admin)=> {
      const templateParams = {
        first_name: admin,
        email: email,
        link: apiConfig.domain + '/manage/user-list'
      }
      emailService.sendEmail(admin, "New user joined our platform",
        "dais_new_join_notify", templateParams)
    })
  }
}
