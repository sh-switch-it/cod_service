let fs = require('fs');
let Router = require('koa-router');
const multiparty = require('koa2-multiparty');
let permissionChecker = require('./middlewares/permissionChecker');
let contextPath;
function registerAPIs(_contextPath, router, app) {
    contextPath = _contextPath;
    let dirPath = __dirname + '/api' + contextPath

    console.log(dirPath)
    let files = fs.readdirSync(dirPath)
    let jsFiles = files.filter(function(f){
        return f.endsWith(".js")
    })

    for(let f of jsFiles) {
        let apiMap = require(dirPath + '/' + f);
        addMapping(router, apiMap, app)
    }
}

function addMapping(router, apiMap, app) {
    for(let api in apiMap) {
        let apiObj = apiMap[api];
        if(api.startsWith('GET ')) {
            let apiPath = api.substring(4)
            if(contextPath === '/auth'){
                router.get(apiPath,permissionChecker(app, apiObj.auth), apiObj['method'](app))
            }else{
                router.get(apiPath, apiObj['method'](app))
            }         
            console.log(`register api in router: GET ${apiPath} ` + apiObj);
        } else if(api.startsWith('POST ')) {
            let apiPath = api.substring(5)
            if(apiObj.type && apiObj.type === 'formData'){
                if(contextPath === '/auth'){
                    router.post(apiPath, permissionChecker(app, apiObj.auth), multiparty(), apiObj['method'](app))
                }else{
                    router.post(apiPath, multiparty(), apiObj['method'](app))
                }
                
            }else{
                if(contextPath === '/auth'){
                    router.post(apiPath, permissionChecker(app, apiObj.auth), apiObj['method'](app))
                }else{
                    router.post(apiPath, apiObj['method'](app))
                }
                
            } 
            console.log(`register api in router: POST ${apiPath}` + apiObj);
        } else if(api.startsWith('PATCH ')){
            let apiPath = api.substring(6)
            if(contextPath === '/auth'){
                router.patch(apiPath, permissionChecker(app, apiObj.auth), apiObj['method'](app))
            }else{
                router.patch(apiPath, apiObj['method'](app))
            }
        } 
        else if(api.startsWith('DELETE ')){
            let apiPath = api.substring(7)
            if(contextPath === '/auth'){
                router.del(apiPath, permissionChecker(app, apiObj.auth), apiObj['method'](app))
            }else{
                router.del(apiPath, apiObj['method'](app))
            }
        } 
        else if(api.startsWith('PUT ')){
            let apiPath = api.substring(4)
            if(contextPath === '/auth'){
                router.put(apiPath, permissionChecker(app, apiObj.auth), apiObj['method'](app))
            }else{
                router.put(apiPath, apiObj['method'](app))
            }
        } 
        else {
            console.log(`invalid api URL: ${api}`);
        }
    }
}

module.exports = function (contextPath, app) {
    let router = new Router();
    //router.use(userlogs(app));
    registerAPIs(contextPath, router, app);
    return router;
};
