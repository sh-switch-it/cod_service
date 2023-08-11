const {
    set
} = require("lodash");
let request = require("request");
const config = require('../configReader')().config;
const appToken = require('../utils/appTokenManager');
const coreServiceConfig = config.service.coreservice;
const {
    permissionDict
} = require('../utils/permissions');
module.exports = {
    async getPermissionByUserName(userName) {

        const url = coreServiceConfig.domain +
            coreServiceConfig.context_path +
            `/auth/users/detail/${userName}`;
        // get app token
        const token = await this.getAppToken();
        return new Promise(function (resolve, reject) {
            request.get({
                url: url,
                json: true,
                headers: {
                    "authorization": "Opendais " + token,
                    "accept": "*/*"
                },
            }, function (err, response, body) {
                if (err) {
                    console.error(err.stack);
                    reject(err)
                } else if (response.statusCode >= 400) {
                    console.error(response.body);
                    reject(response)
                } else {
                    console.log(body);
                    if (body && body.roles) {
                        let tmpRoles = new Set();
                        let permissions = new Set();
                        body.roles.forEach(item => {
                            tmpRoles.add(item.name);
                            const appPermissions = permissionDict[item.name];
                            // add app permission
                            for (appPermission of appPermissions) {
                                permissions.add(appPermission);
                            }
                            // add system permission
                            for (sysPermission of item.permissions) {
                                permissions.add(sysPermission.name);
                            }
                        });
                        body.roles = [...tmpRoles];
                        body.permissions = [...permissions];
                    }
                    resolve(body)
                }
            });
        })
    },
    async createInvitations(inviter, invitees) {
        const url = coreServiceConfig.domain +
            coreServiceConfig.context_path +
            `/auth/invitation/bulk`;
        // get app token
        const token = await this.getAppToken();
        return new Promise(function (resolve, reject) {
            request.post({
                url: url,
                json: true,
                headers: {
                    "authorization": "Opendais " + token,
                    "accept": "*/*"
                },
                body: {
                    inviter, invitees
                },
            }, function (err, response, body) {
                if (err) {
                    console.error(err.stack);
                    reject(err)
                } else if (response.statusCode >= 400) {
                    console.error(response.body);
                    reject(response)
                } else {
                    console.log(body);
                    resolve(body)
                }
            });
        })
    },
    async getAppToken() {
        let app = {};
        app.config = config;
        const token = await appToken.getToken(app);
        return token;
    }
}