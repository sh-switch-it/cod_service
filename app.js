import https from 'https';
import pem from 'pem';
import Koa from 'koa';
import fs from 'fs';
import Router from 'koa-router';

// const configReader = require('./src/configReader.js');
import { dbPreCheck } from './src/db/initializeDB.js';

import serve from 'koa-static';
import path from 'path';
import bodyParser from 'koa-bodyparser';
import userService from './src/service/userService.js';

//const redis = require('./src/redis/connect');

import { TokenUtil } from './src/utils/jwtTokenUtil.js';

import cors from 'koa2-cors';
import { getConfigReader } from './src/configReader.js';
const config = getConfigReader().getConfig();

import accountRouter from './src/routers/accountRouter';
import customerRouter from './src/routers/customerRouter';
import teamRouter from './src/routers/teamRouter';
import codRouter from './src/routers/codRouter';
import ttsService2 from './src/service/ttsService2';
import cfgRouter from './src/routers/configurationRouter';
import { StopExceptionCodTask } from './src/db/initializeDB';
import { syncOrgList } from './src/db/initializeDB';
import { syncJobList } from './src/db/initializeDB';

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url))

const certProps = {
	days: 365, // Validity in days
	selfSigned: true,
};



// const { runKafkaConsumer, kafkaInit } = require('./src/kafka/kafka_processor.js');

let mode = process.env.APP_ENV ? process.env.APP_ENV : "local";
console.log('mode', mode);
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
	allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTION'],
	//allowHeaders: ['Content-Type', 'Authorization', 'Accept','Authing-Jwt-Token','authing-jwt-token','pragma','cache-control'],
}));
app.use(bodyParser());
let authRouter = new Router()

app.use(authRouter.routes())
	.use(authRouter.allowedMethods());


const staticPath = './build'

console.log(__dirname + '' + staticPath);

async function middlewareCheckAuthingToken(ctx, next) {

	try {
		const access_token = ctx.request.headers['authing-jwt-token'];
		let decoded = TokenUtil.verify(access_token);
		if (!decoded || !decoded.userName) {
			ctx.response.status = 403;
		} else {
			const expired = Date.parse(new Date()) / 1000 > decoded.exp;
			if (expired) {
				// 过期
				ctx.response.status = 403;
			} else {
				//console.log('token is right');
				await next();
			}
		}

	} catch (error) {
		console.error(error);
		ctx.response.status = 403;
	}
}

authRouter.post('/auth', async (ctx, next) => {
	const username = ctx.request.body.username;
	const password = ctx.request.body.password;

	const authUser = await userService.isAuth(username, password);
	if (authUser) {
		const jwtToken = TokenUtil.sign(authUser.username);
		//await redis.setItem('jwt_' + authUser.username, jwtToken);
		ctx.body = {token:jwtToken, user: authUser};
	} else {
		ctx.response.status = 400;
	}
})

authRouter.use('/api/*', middlewareCheckAuthingToken);

authRouter.post('/public/tts2', async (ctx, next) => {
	const body = ctx.request.body;
	const fileId = await ttsService2.text2SpeechWave(body.id, body.text)
	ctx.body = fileId;
});

authRouter.get('/public/tts2/:id', async (ctx, next) => {
	const id = ctx.params.id;
	const rstream = fs.createReadStream(__dirname + `/audio/${id}.wav`);
	ctx.response.set("content-type", "audio/wav");
	ctx.body = rstream;
});


authRouter.get('/public/audio/:id', async (ctx, next) => {
	const audioId = ctx.params.id;
	const rstream = fs.createReadStream(__dirname + `/tts_audio/${audioId}.wav`);
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
const nestedRoutes = [accountRouter, customerRouter, teamRouter, codRouter, cfgRouter];
for (var router of nestedRoutes) {
	authRouter.use(router.routes(), router.allowedMethods())
}



authRouter.get("/", async (ctx, next) => {
	ctx.type = 'html';
	ctx.body = fs.createReadStream('./build/index.html');
});

app.use(serve(
	path.join(__dirname, staticPath)
));

const httpsPort = mode === 'docker'? 443 : 3010;

const httpPort = mode === 'docker'? 80 : 3011;


pem.createCertificate(certProps, (error, keys) => {
	if (error) {
		throw error;
	}
	const credentials = { key: keys.serviceKey, cert: keys.certificate };
	const httpsServer = https.createServer(credentials, app.callback());
	httpsServer.listen(httpsPort, async () => {
		console.log('mode', mode);
		let success = await dbPreCheck();
		if (success) {
			console.log('database initialize success');
			await StopExceptionCodTask();
			await syncOrgList();
			await syncJobList();
		}
		console.log('app https started at port 3010...');
	});
});

app.listen(httpPort, async () => {
	console.log('app http started at port 3011...');
});

