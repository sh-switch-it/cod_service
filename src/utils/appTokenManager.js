let Base64 = require("js-base64").Base64;
let request = require("request");
let redis = require("../redis/connect");
const APP_TOKEN = 'booking_app_token';

function AppTokenManager() {

    this.getToken = async function (app) {
        let appToken = await redis.getItem(APP_TOKEN);
        if (appToken) {
            return appToken;
        } else {
            let tokenInfo = await getAppTokenFromIAM(app.config);
            appToken = tokenInfo.access_token;
            let expires = tokenInfo.expires_in; // unit is second
            await redis.setItem(APP_TOKEN, appToken, expires - 300);
            return appToken;
        }
    }
}

function getAppTokenFromIAM(config) {
    let secret = Base64.encode(config.oauth.client_id + ':' + config.oauth.client_secret)
    console.error('[getAppToken]', secret);
    return new Promise(function (resolve, reject) {
        request.post({
            url: config.service.iam.domain + config.service.iam.api_generate_app_token,
            json: true,
            body: {
                grant_type: "client_credentials"
            },
            headers: {
                "x-authorization": "Basic " + secret,
                "accept": "*/*"
            }
        }, function (err, response, body) {
            if (err) {
                console.error('[getAppToken]', 'error: ', err.stack);
                resolve(null)
            } else if (response.statusCode >= 400) {
                console.error('[getAppToken]', 'error: ', response.statusCode);
                resolve(null)
            } else {
                console.log('[getAppToken]', body);
                console.log('[getAppToken]', body.access_token);
                resolve(body)
            }
        });
    })
};


module.exports = new AppTokenManager()