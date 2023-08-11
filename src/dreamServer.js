const Koa = require('koa');
const cors = require('koa2-cors');
const helmet = require("koa-helmet");
const request = require("request");
const bodyParser = require('koa-bodyparser');
const staticFold = require('koa-static');
const configReader = require('./configReader.js');
const userTokens = require('./utils/userTokenManager');
const appToken = require('./utils/appTokenManager');
const permissions = require('./utils/permissionManager');
const rateLimiterMiddleware = require('./middlewares/rateLimiterRedis');
const errorHandlerMiddleware = require('./middlewares/errorHandler');

function DreamServer() {
    this.app = new Koa();
    this.app.use(staticFold(__dirname + '/../docs'));
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(bodyParser({
        jsonLimit: "10mb",
        formLimit: "10mb",
        textLimit: "10mb"
    }));
    this.app.use(rateLimiterMiddleware())
    this.app.use(errorHandlerMiddleware())
    this.request = request
    this.config = configReader().getConfig()

    this.userTokenManager = new userTokens(this, this.config);
    this.permissionManager = new permissions();
    this.appTokenManager = appToken;

    this.app.use(async (ctx, next) => {
        console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);

        let result = await this.userTokenManager.checkToken(ctx);
        if (!result.valid) {
            ctx.response.body = "Unauthorized"
            ctx.response.status = 403
        } else {
            ctx.token = result.token;
            await next();
        }
        //ctx.token = {};
        // mock test user
        //manager@opendias.com
        //test-leader11@test.com
        //test-leader22@test.com
        //test31@test.com
        //test32@test.com
        //test_user@opendias.com

        // ctx.token = {
        //     username: 'test-leader33@test.com',
        //     userPermissions: ["Book_Meeting", "Invite_Member"]
        // };
        // await next();
    });
}

function needAuthorize(ctx) {
    // if(ctx.request.path.indexOf('/auth/') >= 0) {
    //     return true
    // }

    return false
}

function refreshToken(ctx) {
    let authorized = false

    let authorization = ctx.headers["Authorization"]
    if (authorization) {
        authorized = this.userTokenManager.isExpired(authorization)
    }

    return authorized
}

DreamServer.prototype.use = function (func) {
    this.app.use(func)
}
DreamServer.prototype.listen = function (port, callback) {
    this.app.listen(port, callback);
}

module.exports = DreamServer