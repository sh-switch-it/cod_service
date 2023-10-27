
import Router from 'koa-router';
import cfgDAO from '../db/dao/configurationDAO';
const cfgRouter = new Router({prefix:'/api'});

cfgRouter.get('/job', async(ctx, next) => {
	const result =  cfgDAO.getJobList();
	ctx.body = result;
});

cfgRouter.get('/org', async(ctx, next) => {
	const result =  cfgDAO.getOrgList();
	ctx.body = result;
});

cfgRouter.get('/location', async(ctx, next) => {
	const result =  cfgDAO.getLocationList;
	ctx.body = result;
});

cfgRouter.get('/role', async(ctx, next) => {
	const result =  cfgDAO.getRoleList();
	ctx.body = result;
});





export default cfgRouter;