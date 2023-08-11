const config = require('../configReader')().config;
const redis = require("redis");


const url = config.redis.url;
const port = config.redis.port;
const db = config.redis.db;
const client = redis.createClient({
    'host':url,
    'port':port,
    'db':db
});
client.on("error", function(error) {
    console.error(error);
});

//expires: seconds
const setItem = function(key,value,expires){
    return new Promise((resolve,reject)=>{
        client.set(key,value,(err)=>{
            if(err){
                reject(err);
            }
            if(!expires){
                resolve();
            }else{
                client.expire(key,expires,(err)=>{
                    if(err){
                        reject(err);
                    }else{
                        resolve();
                    }
                })
            }
        })
    });
}

const getItem = function(key){
    return new Promise((resolve,reject)=>{
        client.get(key,(err,reply)=>{
            if(err){
                reject(err);
            }else{
                resolve(reply);
            }
        })
    });
}

const deleteItem = function(key){
    return new Promise((resolve,reject)=>{
        client.del(key,(err)=>{
            if(err){
                reject(err);
            }else{
                resolve();
            }
        })
    });
}


module.exports = {
    setItem,
    getItem,
    deleteItem
};