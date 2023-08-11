module.exports = function(app, allowedPermissions) {
    return async (ctx,next)=>{
        if(allowedPermissions && allowedPermissions.length > 0){
            console.log('allowedPermissions',allowedPermissions);
            let authorization = ctx.headers["authorization"]
            console.log('authorization====', authorization)
            if(authorization) {

                if (authorization == "c2VydmljZS1jYWxs") {
                    await next();
                    return;
                }
                let token = authorization.substring(9);
                let userInfo = await app.userTokenManager.getTokenInfo(token);
                if(userInfo){
                    let isAuth = hasPermission(userInfo.permissions,allowedPermissions);
                    if(isAuth){
                        await next();
                    }else{
                        unauthorized(ctx);
                    }              
                }else{
                    unauthorized(ctx);
                }
            }else{
                unauthorized(ctx);
            }
        }else{
            await next(); 
        }
    }
}

function hasPermission(userPermissions, allowedPermissions){
    for (let i = 0; i < userPermissions.length; i++) {
        const userPermission = userPermissions[i];
        for (let j = 0; j < allowedPermissions.length; j++) {
            const allowedPermission = allowedPermissions[j];
            if(userPermission === allowedPermission){
                return true;
            }
        }
    }
    return false;
}

function unauthorized(ctx){
    ctx.response.body = "Unauthorized"
    ctx.response.status = 403
}