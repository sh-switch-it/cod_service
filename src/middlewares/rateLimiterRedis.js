import redis from 'redis';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { getConfigReader } from '../configReader';
const config = getConfigReader().getConfig();
const url = config.redis.url;
const port = config.redis.port;
const redisClient = redis.createClient({
    'host': url,
    'port': port,
    'enable_offline_queue': false,
});

const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'middleware',
    points: 10, // 10 requests for ctx.ip
    duration: 1, // per 1 second
});

function rateLimiterMiddleware(){
    return async (ctx, next) => {
        try {
            await rateLimiter.consume(ctx.ip)
            await next();
        } catch (rejRes) {
            ctx.status = 429
            ctx.body = 'Too Many Requests'
        }
    }
}

export default rateLimiterMiddleware;