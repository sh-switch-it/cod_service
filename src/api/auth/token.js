const getUserToken = function (app) {
    return async (ctx, next) => {
        if (!ctx.query.access_token) {
            console.log("no token")
        }
        let tokenInfo = await app.userTokenManager.getTokenInfo(ctx.query.access_token)
        if (tokenInfo) {
            let userInfo = {
                username: tokenInfo.username,
                userId: tokenInfo.userId,
                access_token: tokenInfo.access_token,
                expires_in: tokenInfo.expires_in,
                permissions: tokenInfo.permissions,
                roles: tokenInfo.roles,
                user_info: tokenInfo.user_info
            }
            ctx.response.body = userInfo
            ctx.response.status = 200
        } else {
            ctx.response.status = 404
        }
    }
};

module.exports = {
    'GET /token': {
        method: getUserToken,
        auth: []
    }
}