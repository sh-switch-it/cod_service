var client = require('ari-client');
const { phone_number } = require('faker/lib/locales/az');
const config = require('../configReader')().config;
let ariClient;
//const sipTrunkPool = {};
client.connect(config.pbx.url, config.pbx.username, config.pbx.password).then(ari => {
    ariClient = ari;
    console.log('freepbx is online');
}).catch(err => {
    console.error(err);
});

function dialingNumberTester(pstnPoint,callTask,pendingTime,retryTimes){
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            console.log({
                pstnPoint, callTaskId:callTask.id
            });
            callTask.callStatus = 1;
            resolve(callTask);
        }, Math.random() * 10000);
    });
}

function dialingNumber(pstnPoint,callTask,pendingTime,retryTimes){
    return new Promise((resolve, reject)=>{
        if(!ariClient){
            resolve(callTask);
        }
        if(retryTimes === 0){
            callTask.callStatus = 0;
            resolve(callTask);
        }else{
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
                    incoming.play({ media: `sound:${config.audio.url}/public/audio/${callTask.ttsFileId}` }, playback, function (err) {});
                    playback.once("PlaybackFinished", () => {
                        incoming.play({ media: `sound:${config.audio.url}/public/audio/${callTask.ttsFileId}` }, playback, function (err) {});
                        playback.once("PlaybackFinished", () => {
                            incoming.hangup();
                        })
                    })
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
                if(event.cause === 0 || event.cause === 34){
                    // 超时未接通，挂断
                    // cause: 0,
                    // cause_txt: 'Unknown',
                    console.log('if',event.cause);
                    retryTimes--;
                    return dialingNumber(pstnPoint,callTask,pendingTime,retryTimes).then((result)=>{
                        resolve(result);
                    });
                }else if(event.cause === 16 || event.cause === 17){
                    callTask.answerTime = new Date();
                    callTask.hangUpTime = new Date();
                    callTask.callStatus = 1;
                    console.log('else if',event.cause);
                    resolve(callTask);
                }else{
                    callTask.answerTime = new Date();
                    callTask.hangUpTime = new Date();
                    callTask.callStatus = 1;
                    console.log('else',event.cause);
                    resolve(callTask);
                }
                
                // cause:
                // 34
                // cause_txt:
                // 'Circuit/channel congestion'
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
            let phoneNumber = JSON.parse(callTask.callee).phone;
            let endpoint = `PJSIP/${phoneNumber}`;
            if(config.pbx.prefix !== "" && phoneNumber.length === 11){
                phoneNumber = config.pbx.prefix + "w" + phoneNumber;
                endpoint = `PJSIP/${phoneNumber}@pstn`;
            }
            
            // let phoneNumber = JSON.parse(callTask.callee).phone;
            // let endpoint = `PJSIP/${phoneNumber}`;
            
            console.log('endpoint',endpoint);
            
            channel.originate(
                { endpoint , extension: pstnPoint, callerId: pstnPoint, app: 'momoko8443',timeout:pendingTime},
                function (err) {
                    if(err){
                        // callTask.answerTime = new Date();
                        // callTask.hangUpTime = new Date();
                        //空号，或者不在线
                        //console.log('originate error:',err);
                        callTask.callStatus = 0;
                        resolve(callTask);
                    }
                }
            );
            ariClient.start('momoko8443');
        }
    });
}


module.exports = {
    dialingNumber,
    dialingNumberTester
};
