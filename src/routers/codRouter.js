
const Router = require('koa-router');
const codService = require('../service/codService');
const codRouter = new Router({prefix:'/api'});
codRouter.post('/cod', async(ctx, next) => {
	let body = ctx.request.body;
	const result = await codService.addCodTask(body.pendingTime,body.retryTimes,body.textTemplate);
	ctx.body = result;
});

codRouter.post('/cod/:id/call', async(ctx, next) => {
	const codId = ctx.params.id;
	const body = ctx.request.body;
	const result = await codService.addCallRecordsToCodeTask(codId,body);
	ctx.body = result;
});

codRouter.get('/cod', async(ctx, next) => {
	const result = await codService.getCodTasks();
	ctx.body = result;
});

module.exports = codRouter;