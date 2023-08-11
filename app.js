const https = require('https');
const sslify = require('koa-sslify').default;
const fs = require('fs');
const Router = require('koa-router');
const DreamServer = require('./src/dreamServer.js');
// const configReader = require('./src/configReader.js');
const apiRegister = require('./src/apiRouter');
const dbPreCheck = require('./src/db/initializeDB');
const helmet = require("koa-helmet");

const redis = require('./src/redis/connect');
const { runKafkaConsumer, kafkaInit } = require('./src/kafka/kafka_processor.js');

let mode = process.env.APP_ENV ? process.env.APP_ENV : "local";
console.log('mode',mode);
// var keyPath = mode === 'prod' ? '/etc/letsencrypt/live/booking.openuse.io/privkey.pem' : '/etc/letsencrypt/live/booking.opendais.net/privkey.pem';
// var certPath = mode === 'prod'?  '/etc/letsencrypt/live/booking.openuse.io/cert.pem' : '/etc/letsencrypt/live/booking.opendais.net/cert.pem';

const app = new DreamServer();

let authRouter = new Router()
let apiRouter = apiRegister('/auth', app)
let publicApiRouter = apiRegister('/public', app)
authRouter.use('/auth', apiRouter.routes(), apiRouter.allowedMethods())
authRouter.use('/public', publicApiRouter.routes(), publicApiRouter.allowedMethods())
app.use(authRouter.routes())

app.use(async(ctx, next) => {
    ctx.response.body = "operation-threads is online";
})

app.listen(3010, async () => {
    console.log('mode', mode);
    let success = await dbPreCheck();
    await redis.setItem('test', 'jake.zheng3');
    if (success) {
        console.log('database initialize success');
    }
    console.log('app started at port 3010...');
    let test = await redis.getItem('test');
    console.log(test);
});

// if(process.env.APP_ENV !== 'aws' && process.env.APP_ENV !== 'prod'){
//     app.listen(3010,async ()=>{
//         console.log('mode',mode);
//         let success = await dbPreCheck();
//         await redis.setItem('test','jake.zheng3');
//         if(success){
//             console.log('database initialize success');
//         }
//         console.log('app started at port 3010...');
//         let test = await redis.getItem('test');
//         console.log(test);
//     });
// }else{
//     app.use(sslify());
//     const opetions = {
//         key: fs.readFileSync(keyPath),
//         cert: fs.readFileSync(certPath),
//     }
//     https.createServer(opetions,app.app.callback()).listen(3010,async ()=>{
//         console.log('mode',mode);
//         let success = await dbPreCheck();
//         await redis.setItem('test','jake.zheng3');
//         if(success){
//             console.log('database initialize success');
//         }
//         console.log('app started at port 3010...');
//         let test = await redis.getItem('test');
//         console.log(test);
//     });
// }
const runKafka = async () => {
    await kafkaInit();

    //runTimeService();
    
    runKafkaConsumer();
}

runKafka();