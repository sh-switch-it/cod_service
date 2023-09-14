var client = require('ari-client');
const config = require('../configReader')().config;
let ariClient;
client.connect(config.pbx.url, config.pbx.username, config.pbx.password).then(ari => {
    ariClient = ari;
}).catch(err => {
    console.error(err);
})

function dialingNumber(callTask,pendingTime,retryTimes){
    return new Promise((resolve, reject)=>{
        if(!ariClient){
            resolve();
        }
        const phoneNumber = JSON.parse(callTask.callee).phone;
        var channel = ariClient.Channel();
        channel.on('StasisStart', function (event, incoming) {
            console.log('StasisStart_event');
            console.log('channel');//接电话了
            var playback = ariClient.Playback();
            incoming.play({ media: `sound:${config.self.url}/public/audio/${callTask.id}` }, playback, function (err) { });
            playback.once('PlaybackFinished', () => {
                incoming.hangup();
            });
    
    
        });
        channel.on('StasisEnd', function (event, incoming) {
            console.log('StasisEnd_event');
            console.log('channel');//接通后挂电话了
            resolve();
        });
        channel.once('ChannelDestroyed', function (event, channel) {
            console.log('ChannelDestroyed');
            console.log('channel');//不接电话，直接挂断
            resolve();
        });
        channel.originate(
            { endpoint:`PJSIP/${phoneNumber}` , extension: '1001', callerId: '1001', app: 'momoko8443',timeout:pendingTime},
            function (err, outting) {
                console.log(err);
            }
        );
        ariClient.start('momoko8443');
    })

    
}


module.exports = {
    dialingNumber
};
