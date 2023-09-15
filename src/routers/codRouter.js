
const Router = require('koa-router');
const codService = require('../service/codService');
const codRouter = new Router({prefix:'/api'});
codRouter.post('/cod', async(ctx, next) => {
	let body = ctx.request.body;
	const result = await codService.addCodTask(body.pendingTime,body.retryTimes,body.textTemplate);
	ctx.body = result;
});

codRouter.post('/cod/:id/calls', async(ctx, next) => {
	const codId = ctx.params.id;
	const body = ctx.request.body;
	// [{
    //     "callee":{
    //         "name": "李莉",
    //         "phone": "13817921334",
    //         "org": "外科",
    //         "job": "医师",
    //         "location": "手术室"
    //     },
    //     "callTime": "2023-08-29 11:35:51",
    //     "retryTimes": 0,
    //     "answerTime": "2023-08-29 11:37:52",
    //     "hangUpTime": "2023-08-29 11:38:52",
    //     "callStatus": 2,    //2 is setup, 3 is tts ready, 4 waiting for dailing, 5 ringing, 6 dialing, 7 reject, 8 hangup ,1 finished 
    //     "status": 1
    // }],
	const cod = await codService.addCallRecordsToCodeTask(codId,body);
	ctx.body = cod;
});

codRouter.post('/cod/:id/tts', async(ctx, next) => {
	const codId = ctx.params.id;
	const result = await codService.generateTTSBatch(codId);
	ctx.body = result;
});

codRouter.post('/cod/:id/calling', async(ctx, next) => {
	const codId = ctx.params.id;
	const result = await codService.startCall(codId);
	ctx.body = result;
});

codRouter.get('/cod', async(ctx, next) => {
	const result = await codService.getCodTasks();
	ctx.body = result;
});

codRouter.get('/cod/:id', async(ctx, next) => {
	const codId = ctx.params.id;
	const result = await codService.monitorCall(codId);
	ctx.body = result;
});


module.exports = codRouter;