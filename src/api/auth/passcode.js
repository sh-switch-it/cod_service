const config = require('../../configReader')().config;
const forward = require('../forward');

const sendPasscode = function (app) {
  return async(ctx, next) => {
    let apiConfig = config.service.passcode
    let url = apiConfig.domain + apiConfig.context_path + '/2fa/request/'

    await forward.request(url, 'post', null, ctx.request.body).then((result)=> {
      ctx.response.body = result;
    }).catch((error)=> {
      ctx.response.status = error.status;
      ctx.response.body = error.detail;
    })
  };
}

const verifyPasscode = function (app) {
  return async (ctx, next) => {
    let apiConfig = config.service.passcode
    let url = apiConfig.domain + apiConfig.context_path + '/2fa/check/'

    await forward.request(url, 'post', null, ctx.request.body).then((result) => {
      ctx.response.body = result;
    }).catch((error) => {
      ctx.response.status = error.status;
      ctx.response.body = error.detail;
    })
  }
}

module.exports = {
  'POST /passcode/send': {
    method: sendPasscode,
    auth: []
  },
  'POST /passcode/verify': {
    method: verifyPasscode,
    auth: []
  }
}