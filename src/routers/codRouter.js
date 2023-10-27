
import Router from 'koa-router';
import codService from '../service/codService';
const codRouter = new Router({prefix:'/api'});
codRouter.post('/cod', async(ctx, next) => {
	let body = ctx.request.body;
	const result = await codService.addCodTask(body.pendingTime,body.retryTimes,body.textTemplate);
	ctx.body = result;
});

codRouter.post('/cod/:id/calls', async(ctx, next) => {
	const codId = ctx.params.id;
	const body = ctx.request.body;
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

codRouter.post('/cod/:id/cancel', async(ctx, next) => {
	const codId = ctx.params.id;
	const result = await codService.cancelCall(codId);
	ctx.body = result;
});

codRouter.get('/cod', async(ctx, next) => {
	const query = ctx.request.query;
	const offset = parseInt(query.offset);
	const limit = parseInt(query.limit);
	const result = await codService.getCodTasks(null,null,limit,offset);
	ctx.body = result;
});

codRouter.get('/cod/now', async(ctx, next) => {
	const result = await codService.getCurrentRunningCodTasks();
	ctx.body = result;
});

codRouter.get('/cod/:id', async(ctx, next) => {
	const codId = ctx.params.id;
	const result = await codService.monitorCall(codId);
	ctx.body = result;
});


export default codRouter;