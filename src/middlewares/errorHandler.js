function errorHandlerMiddleware(){
    return async (ctx, next) => {
        try {
            await next();
        } catch (err) {
            ctx.status = err.statusCode || err.status || 500;
            ctx.body = {
                message: err.message
            };
        }
    }
}

export default errorHandlerMiddleware;