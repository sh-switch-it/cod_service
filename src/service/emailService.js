const config = require('../configReader')().config;
const request = require('request');

module.exports = {
  sendEmail (to, subject, templateName, templateParam) {
    let apiConfig = config.service.notification
    let url = apiConfig.domain + apiConfig.context_path + '/email/request/'

    let body = {
      from_address: "no-reply@openuse.io",
      from_name: "openuse.io",
      to_address: to,
      subject: subject,
      template_name: templateName,
      template_params: templateParam
    }

    return new Promise((resolve,reject)=>{
      request.post({
        url: url,
        json: true,
        body: body,
        headers: {
          "accept": "*/*"
        },
        rejectUnauthorized:false
      }, function(err, response, body){
        if (err) {
          console.error('[sendEmail]', 'error check token', err.stack);
          resolve(null)
        } else if (response.statusCode >= 400) {
          console.error('[sendEmail]', 'unable to create user in iam ', response.body);
          resolve(null)
        } else {
          console.log('[sendEmail]', 'success', body);
          resolve(body)
        }
      });
    })
  }
}