let fs = require("fs");
var instance

function ConfigReader() {
    let mode = process.env.APP_ENV ? process.env.APP_ENV : "local";
    console.log('env.mode', mode);
    let filePath = './config/' + mode + '.env.json'
    this.config = JSON.parse(fs.readFileSync(filePath));
    // if(mode !== 'local'){
    //     this.config.oauth.client_secret = process.env.OAUTH_CLIENT_SECRET;
    //     this.config.db.username = process.env.DB_USERNAME;
    //     this.config.db.password = process.env.DB_PASSWORD;
    // }  
    //console.log('full config',this.config );
}
ConfigReader.prototype.getConfig = function () {
    return this.config
}

function getConfigReader() {
    if(!instance) {
        console.log("reload config")
        instance = new ConfigReader()
    }
    return instance
}

module.exports = getConfigReader