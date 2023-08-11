const logout = function (app) {
    return async(ctx, next) => {        
        try{
            let authorization = ctx.request.headers['authorization'];
            let token = authorization.substring(9);
            let result = await logoutFromIam(token, app); 
            if(token){
                await app.userTokenManager.removeToken(token);
            }
            ctx.response.body = result;
        }catch(err){
            ctx.response.body = err
        }
    };
}

const logoutFromIam = (token, app) => {
    let apiConfig = app.config.service.iam
    let url = apiConfig.domain + apiConfig.api_logout + '?token=' + token

    return new Promise(function(resolve, reject) {
        app.request.get({
            url: url,
            rejectUnauthorized:false,
            headers: {
                "accept": "*/*",

            }
        }, function(err, response, body){
            if (err) {
                console.error('[logoutFromIam]', 'error check token', err.stack);
                reject({ status: 500, "message":"Internal error" } )
            } else if (response.statusCode >= 400) {
                console.error('[logoutFromIam]', 'unable to retrieve managed users', response.body);
                reject(response.body)
            } else {
                console.error('[logoutFromIam]', 'sucess', body);
                resolve(body)
            }
        })
    })
}

module.exports = {
    'GET /logout': {
        method: logout,
        auth: []
    }
}