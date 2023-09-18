var client = require('ari-client');
const config = require('../configReader')().config;
let ariClient;
client.connect(config.pbx.url, config.pbx.username, config.pbx.password).then(ari => {
    ariClient = ari;
    console.log('freepbx is online');
}).catch(err => {
    console.error(err);
})

function dialingNumber(callTask,pendingTime,retryTimes){
    return new Promise((resolve, reject)=>{
        if(!ariClient){
            resolve(callTask);
        }
        if(retryTimes === 0){
            callTask.callStatus = 0;
            resolve(callTask);
        }else{
            const phoneNumber = JSON.parse(callTask.callee).phone;
            var channel = ariClient.Channel();
            channel.on('StasisStart', function (event, incoming) {
                console.log('StasisStart_event');
                console.log('channel');//接电话了
                var playback = ariClient.Playback();
                incoming.play({ media: `sound:${config.audio.url}/public/audio/${callTask.ttsFileId}` }, playback, function (err) {

                });
                playback.once('PlaybackStarted', () => {
                    console.log('PlaybackStarted');
                });
                playback.once('PlaybackFinished', () => {
                    console.log('PlaybackFinished');
                    incoming.hangup();
                });
        
        
            });
            channel.on('StasisEnd', function (event, incoming) {
                console.log('StasisEnd_event');
                console.log('channel');//接通后挂电话了
                //resolve();
            });
            channel.once('ChannelDestroyed', function (event, channel) {
                console.log('ChannelDestroyed');
                console.log(event);
                console.log('channel');//不接电话，直接挂断
                if(event.cause === 0){
                    // 超时未接通，挂断
                    // cause: 0,
                    // cause_txt: 'Unknown',
                    retryTimes--;
                    return dialingNumber(callTask,pendingTime,retryTimes).then((result)=>{
                        resolve(result);
                    });
                }else if(event.cause === 16 || event.cause === 17){
                    callTask.answerTime = new Date();
                    callTask.hangUpTime = new Date();
                    callTask.callStatus = 1;
                    resolve(callTask);
                }else{
                    callTask.answerTime = new Date();
                    callTask.hangUpTime = new Date();
                    callTask.callStatus = 1;
                    resolve(callTask);
                }
                
                // 超时未接通，挂断
                // cause: 0,
                // cause_txt: 'Unknown',

                // 用户自己拒接挂断
                // cause: 17,
                // cause_txt: 'User busy',
                
                // 通后挂断,主动和被动都是16
                // cause: 16,
                // cause_txt: 'Normal Clearing',
                //resolve();
            });
            callTask.callTime = new Date();
            channel.originate(
                { endpoint:`PJSIP/${phoneNumber}` , extension: '1001', callerId: '1001', app: 'momoko8443',timeout:pendingTime},
                function (err, outting) {
                    if(err){
                        // callTask.answerTime = new Date();
                        // callTask.hangUpTime = new Date();
                        //空号，或者不在线
                        callTask.callStatus = 0;
                        resolve(callTask);
                    }
                    console.log(err);
                }
            );
            ariClient.start('momoko8443');
        }
    });
}


module.exports = {
    dialingNumber
};
