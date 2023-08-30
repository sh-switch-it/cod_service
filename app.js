const https = require('https');
const Koa = require('koa');
const sslify = require('koa-sslify').default;
const fs = require('fs');
const Router = require('koa-router');
// const configReader = require('./src/configReader.js');
const dbPreCheck = require('./src/db/initializeDB');
const helmet = require("koa-helmet");
const static = require('koa-static');
const path = require('path');
const bodyParser = require('koa-bodyparser');
//const redis = require('./src/redis/connect');
const customerService = require('./src/service/customerService');
const { async } = require('q');
const multer = require('@koa/multer');
const readXlsxFile = require('read-excel-file/node');
const authService = require('./src/service/authService');
const { TokenUtil } = require('./src/utils/jwtTokenUtil');
const cors = require('koa2-cors');
const teamService = require('./src/service/teamService');
const codService = require('./src/service/codService');
const config = require('./src/configReader')().config;
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname ,'/upload_temp'))
    },
    filename: function (req, file, cb) {
        let type = file.originalname.split('.')[1]
        cb(null, `${file.fieldname}.${type}`)
    }
})
//文件上传限制
const limits = {
    fields: 10,//非文件字段的数量
    fileSize: 500 * 1024,//文件大小 单位 b
    files: 1//文件数量
}


const upload = multer({storage,limits})
// const { runKafkaConsumer, kafkaInit } = require('./src/kafka/kafka_processor.js');

let mode = process.env.APP_ENV ? process.env.APP_ENV : "local";
console.log('mode',mode);
// var keyPath = mode === 'prod' ? '/etc/letsencrypt/live/booking.openuse.io/privkey.pem' : '/etc/letsencrypt/live/booking.opendais.net/privkey.pem';
// var certPath = mode === 'prod'?  '/etc/letsencrypt/live/booking.openuse.io/cert.pem' : '/etc/letsencrypt/live/booking.opendais.net/cert.pem';

const app = new Koa();
app.use(cors({
  // origin: function(ctx) {
  //   if (ctx.url === '/test') {
  //     return false;
  //   }
  //   return 'http://127.0.0.1:3000';
  // },
	origin: config.web.url,
  // exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
  // maxAge: 5,
  credentials: true,
  allowMethods: ['GET', 'POST', 'DELETE','PUT','OPTION'],
  //allowHeaders: ['Content-Type', 'Authorization', 'Accept','Authing-Jwt-Token','authing-jwt-token','pragma','cache-control'],
}));
app.use(bodyParser());
let authRouter = new Router()

app.use(authRouter.routes())
.use(authRouter.allowedMethods());

// authRouter.get('/', (ctx, next) => {
//     ctx.body = 'Hello World!';
// });
    
const staticPath = './build'

console.log(__dirname + '' + staticPath);


async function middlewareCheckAuthingToken(ctx, next) {
		
    try {
      const access_token = ctx.request.headers['authing-jwt-token'];
      let decoded = TokenUtil.verify(access_token);
			if(!decoded || !decoded.userName){
        ctx.response.status = 403;
			}else{
				const expired = Date.parse(new Date()) / 1000 > decoded.exp;
				if (expired) {
					// 过期
					ctx.response.status = 403;
				} else {
					console.log('token is right');
					await next();
				}
			}
      
    } catch (error) {
        console.error(error);
        ctx.response.status = 403;
    }
  }
app.use(static(
    path.join( __dirname,  staticPath)
));


authRouter.post('/auth', async (ctx, next) => {
	const username = ctx.request.body.username;
	const password = ctx.request.body.password;

	const authUser = await authService.isAuth(username,password);
	if(authUser){
		ctx.body = 'hello ' + authUser.username;
		const jwtToken = TokenUtil.sign(authUser.username);
		//await redis.setItem('jwt_' + authUser.username, jwtToken);
		ctx.body = jwtToken;
	}else{
		ctx.response.status = 400;
	}
})

authRouter.use('/api/*', middlewareCheckAuthingToken);



authRouter.get('/api/health', async(ctx, next) => {
    ctx.body = 'Hello World';
})
authRouter.get('/api/customers', async(ctx, next) => {
    const result = await customerService.getCustomers();
    ctx.body = result;
})

authRouter.put('/api/customers', async(ctx, next) => {
    const newCustomer = ctx.request.body;
    const result = await customerService.updateCustomer(newCustomer);
    ctx.body = result;
})

authRouter.post('/api/customers', async(ctx, next) => {
    let body = ctx.request.body;
    // console.log("body",JSON.stringify(body));
    const result = await customerService.addCustomer(body.name,body.phone,body.org,body.job);
    ctx.body = result;
})

authRouter.delete('/api/customers/:id', async(ctx, next) => {
    let id = ctx.params.id;
    const result = await customerService.removeCustomer(id);
    ctx.body = result;
})
authRouter.post(
    '/api/upload_customers',
    upload.single('file'),
    async (ctx,next) => {
			const filePath = path.join(__dirname ,'/upload_temp');
			console.log('file path',filePath );
			const rows = await readXlsxFile(fs.createReadStream(filePath + '/file.xlsx'));
			for (let i = 1; i < rows.length; i++) {
				const item = rows[i];
				const phone = item[1].toString();
				const isExist = await customerService.isCustomerExist(phone);
				if(isExist){
					const existCustomer = await customerService.getCustomerByPhone(phone);
					const updateCustomer = {
						id: existCustomer.id,
						name: item[0],
						phone: phone,
						org: item[2],
						job: item[3]
					}
					await customerService.updateCustomer(updateCustomer);
				} else {

					await customerService.addCustomer(item[0],phone,item[2],item[3]);
				}
			}
			ctx.body = 'upload successfully';
    }
  );

	authRouter.get('/api/teams', async(ctx, next) => {
		const result = await teamService.getTeams();
		ctx.body = result;
		
})

authRouter.get('/api/teams/:id', async(ctx, next) => {
	const teamId = ctx.params.id;
	const result = await teamService.getTeamById(teamId);
	ctx.body = result;
})


authRouter.post('/api/teams/:id/customers', async(ctx, next) => {
	const teamId = ctx.params.id;
	const customer_ids = ctx.request.body.customer_ids;
 const result = await teamService.addOrUpdateCustomers(teamId,customer_ids);
	return result;
})


	authRouter.post('/api/teams', async(ctx, next) => {
			let body = ctx.request.body;
			// console.log("body",JSON.stringify(body));
			const result = await teamService.addTeam(body.name,body.location,body.description);
			ctx.body = result;
	})

	authRouter.post('/api/cod', async(ctx, next) => {
		let body = ctx.request.body;
		const result = await codService.addCodTask(body.pendingTime,body.retryTimes,body.textTemplate);
		ctx.body = result;
	});

	authRouter.post('/api/cod/:id/call', async(ctx, next) => {
		const codId = ctx.params.id;
		const body = ctx.request.body;
		const result = await codService.addCallRecordsToCodeTask(codId,body);
		ctx.body = result;
	});

	authRouter.get('/api/cod', async(ctx, next) => {
		const result = await codService.getCodTasks();
		ctx.body = result;
	});


	authRouter.get('/public/audio/:id', async(ctx, next) => {
		const audioId = ctx.params.id;

		const rstream = fs.createReadStream(__dirname + '/audio/demo.wav');
		ctx.response.set("content-type", "audio/wav");
		ctx.body = rstream;
		});
// authRouter.get('/api/download', (req, res) => {
//   const filePath = __dirname + '/question.pptx';
//   const fileName = 'question.pptx'
//   res.set({
//     'content-type': 'application/octet-stream',
//     'content-disposition': 'attachment;filename=' + encodeURI(fileName)
//   })
//   fs.createReadStream(filePath).pipe(res)
// })

app.use(async(ctx, next) => {
    ctx.response.body = "cod service is online";
})

app.listen(3010, async () => {
    console.log('mode', mode);
    let success = await dbPreCheck();
    if (success) {
        console.log('database initialize success');
    }
    console.log('app started at port 3010...');
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
// const runKafka = async () => {
//     await kafkaInit();

//     //runTimeService();
    
//     runKafkaConsumer();
// }

// runKafka();