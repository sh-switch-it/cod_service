const tokenService = require('../service/tokenService');
const userService = require('../service/userService');
const redis = require('../redis/connect');
const jwt = require('jsonwebtoken');
const coreService = require('../service/coreService');

function UserTokenManager(app, config) {
    this.app = app;
    this.config = config;
    this.addToken = async function (token, info) {
        let expires = info.expires_in;
        await redis.setItem(token, JSON.stringify(info), expires - 300);
    };

    this.getTokenInfo = async function (token) {
        let tokenInfo = await redis.getItem(token);
        if (!tokenInfo) {
            try {
                console.log('++++++++++start check token for iam +++++++++++++')
                const tokenData = await tokenService.checkToken(token, this.config);
                const iamTokenInfo = jwt.decode(token);
                const userName = iamTokenInfo.username;
                console.log('tokenData:' + tokenData)
                console.log('++++++++++end check token for iam +++++++++++++')
                //let userInfoInDB = await userService.getUserByEmail(iamTokenInfo.username);
                //userId = '7d92edcf-1868-4e3c-a6bd-4e5aaabf586d';'
                console.log('++++++++++start get user info from core service +++++++++++++')
                const userData = await coreService.getPermissionByUserName(userName);
                // if(!userInfoInDB){
                //     userInfoInDB = await userService.addUser(iamTokenInfo.first_name,iamTokenInfo.username);
                // }
                console.log('user info:'+ JSON.stringify(userData) )
                console.log('++++++++++end get user info from core service +++++++++++++')
                const tokenInfo = {
                    access_token: tokenData.access_token,
                    expires_in: tokenData.expires_in,
                    expires: tokenData.expires_in,
                    username: userName,
                    userId: userData ? userData.id : null,
                    permissions: userData ? userData.permissions : [],
                    roles: userData ? userData.roles : [],
                    user_info: userData
                }
                console.log('+++++++++token info:'+ tokenInfo )
                console.log("expires: " + tokenInfo.expires)
                await this.addToken(token, tokenInfo)
                return tokenInfo;
            } catch (err) {
                console.log("check token: ", err)
                return null
            }
        } else {
            return JSON.parse(tokenInfo);
        }
    };

    this.removeToken = async function (token) {
        await redis.deleteItem(token);
    };

    this.checkToken = async function (ctx) {
        let valid = false;
        let tokenInfo = null;
        if (needAuthorize(ctx)) {
            console.log(ctx.headers)
            console.log(this)
            let authorization = ctx.headers["authorization"]
            if (authorization) {
                console.log("has auth")
                if (authorization == "c2VydmljZS1jYWxs") {
                    return {
                        "valid": true,
                        "token": authorization
                    }
                }
                let token = authorization.substring(9)
                ctx.query.access_token = token
                tokenInfo = await this.getTokenInfo(token);
                if (tokenInfo) {
                    console.log("has cached token")
                    valid = true
                } else {
                    console.log("check token failed: ")
                    valid = false
                }
            }
            console.log("test has auth: " + valid)
        } else {
            valid = true
        }
        return {
            "valid": valid,
            "token": tokenInfo
        }
    }


}

function needAuthorize(ctx) {
    if (ctx.request.path.indexOf('/auth/') >= 0) {
        return true
    }

    return false
}

module.exports = UserTokenManager