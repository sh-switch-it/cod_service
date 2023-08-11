let request = require("request");

const checkToken = async (token, config) => {
    let secret = Base64.encode(config.oauth.client_id + ':' + config.oauth.client_secret)
    let apiConfig = config.service.iam
    let url = apiConfig.domain + apiConfig.api_check_token
    console.log('+++++++call iam endpoint++++++++++' + url);

    return new Promise(function (resolve, reject) {
        request.get({
            url: url,
            json: true,
            qs: {
                token: token
            },
            rejectUnauthorized:false,
            headers: {
                "x-authorization": "Basic " + secret,
                "accept": "*/*"
            }
        }, function(err, response, body){
            if (err) {
                console.error('[check_token]', 'error check token', err.stack);
                reject(err )
            } else if (response.statusCode >= 400) {
                console.error('[check_token]', 'unable to retrieve managed users', response.body);
                reject(response)
            } else {
                console.log('[check_token]', 'sucess', body);
                resolve(body)
            }
        });
    })
};

module.exports = {checkToken}