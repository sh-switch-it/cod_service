
import Router from 'koa-router';
import teamService from '../service/teamService';
const teamRouter = new Router({ prefix: '/api' });

teamRouter.get('/teams', async (ctx, next) => {
    const result = await teamService.getTeams();
    ctx.body = result;

})

teamRouter.get('/teams/:id', async (ctx, next) => {
    const teamId = ctx.params.id;
    const result = await teamService.getTeamById(teamId);
    ctx.body = result;
})


teamRouter.post('/teams/:id/customers', async (ctx, next) => {
    const teamId = ctx.params.id;
    const customer_ids = ctx.request.body.customer_ids;
    const result = await teamService.addOrUpdateCustomers(teamId, customer_ids);
    ctx.body = result;
})


teamRouter.post('/teams', async (ctx, next) => {
    let body = ctx.request.body;
    const result = await teamService.addTeam(body.name, body.location, body.description);
    ctx.body = result;
})

teamRouter.patch('/teams/:id', async(ctx, next) => {
    let id = ctx.params.id;
    let body = ctx.request.body;
    const result = await teamService.updateTeam(id,{name:body.name,location:body.location,description:body.description});
    ctx.body = result;
})

teamRouter.delete('/teams/:id', async(ctx, next) => {
    let id = ctx.params.id;
    const result = await teamService.removeTeam(id);
    ctx.body = result;
})

export default teamRouter;