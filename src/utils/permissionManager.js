function PermissionManager() {
    this.permissionMap = new Object()

    this.addAccount("pei.cao@seraitrade.com", ["SERAI_THREADWEB_ONBOARDINGMGR"])
}

PermissionManager.prototype.contains = function (user) {
    return (user in this.permissionMap);
}
PermissionManager.prototype.addAccount = function (user, perms) {
    this.permissionMap[user] = perms
}

PermissionManager.prototype.removeAccount = function (user) {
    if(this.contains(user)) {
        delete this.permissionMap[token]
    }
}
PermissionManager.prototype.getPermissions = function (user) {
    if(this.contains(user)) {
        return this.permissionMap[user]
    }
    return []
}

var instance = null
function getManager() {
    if(!instance) {
        instance = new PermissionManager()
    }
    return instance
}
module.exports = PermissionManager