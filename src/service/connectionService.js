let request = require("request");
const config = require('../configReader')().config;

const getConnections = async (username) => {
    let apiConfig = config.service.connection
    let url = apiConfig.domain 
        + apiConfig.context_path
        + "/user/" + encodeURIComponent(username) + "/friends/";

    return new Promise(function (resolve, reject) {
        request.get({
            url: url,
            json: true,
            headers: {
                // "x-authorization": "Basic " + secret,
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
                console.error('[check_token]', 'sucess', body);
                resolve(body.data)
            }
        });
    })
};

module.exports = {getConnections}