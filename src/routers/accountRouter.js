
const Router = require('koa-router');
const userService = require('../service/userService');
const accountRouter = new Router({prefix:'/api'});

accountRouter.get('/accounts', async(ctx, next)=>{
	const result = await userService.getUsers();
	ctx.body = result;
})

accountRouter.post('/accounts', async(ctx, next)=>{
	const user = ctx.request.body;
	let result;
	try{
		result = await userService.addUser(user.username,user.password, user.role);
		ctx.body = result;
	}catch(e){
		if(e.message === "user existed"){
			ctx.response.status = 409;
		}else{
			ctx.response.status = 400;
		}
	}
})

accountRouter.patch('/accounts/:id', async(ctx, next)=>{
	const id = ctx.params.id;
	const updatePart = ctx.request.body;
	let result = await userService.updateUser(id,updatePart);
	ctx.body = result;
})

accountRouter.delete('/accounts/:id', async(ctx, next)=>{
	const id = ctx.params.id;
	let result = await userService.removeUser(id);
	ctx.body = result;
})

module.exports = accountRouter;
