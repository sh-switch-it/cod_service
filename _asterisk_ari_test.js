var client = require('ari-client');
client.connect('http://192.168.31.163:8088', 'asterisk', '123456').then(ari => {
    var channel = ari.Channel();
    channel.on('StasisStart', function (event, incoming) {
        console.log('StasisStart_event');
        console.log('channel');//接电话了

        var playback = ari.Playback();
        incoming.play({ media: 'sound:http://192.168.150.230:3011/public/audio/2df1fab01f2698f052301338ef93dc05' }, playback, function (err) { });
        playback.once('PlaybackFinished', () => {
            incoming.hangup();
        });


    });
    channel.on('StasisEnd', function (event, incoming) {
        console.log('StasisEnd_event');
        console.log('channel');//接通后挂电话了
    });
    //channel.on('ChannelDtmfReceived', function (event, channel) { });
    channel.once('ChannelDestroyed', function (event, channel) {
        console.log('ChannelDestroyed');
        console.log('channel');//不接电话，直接挂断
        console.log(event);
        // timeout
        // cause: 0,
        // cause_txt: 'Unknown',

        // 用户自己拒接挂断
        // cause: 17,
        // cause_txt: 'User busy',

        // 用户自己接通后挂断
        // cause: 16,
        // cause_txt: 'Normal Clearing',
    });
    channel.originate(
        { endpoint: 'PJSIP/98086', extension: '1001', callerId: '1001', app: 'momoko8443',timeout:10 },
        function (err, channel) {

        }
    );
    ari.start('momoko8443');

}).catch(err => {
    console.log(err);
})

const testArray = [1];
function regroup(callTasks){
    const maxDial = 4;
    const groupCount = Math.round(callTasks.length / maxDial);
    const newGroup = [];
    for (let l = 0; l < groupCount; l++) {
        const promiseAllArray = [];
        for (let i = maxDial * l; i < callTasks.length && i < maxDial * (l + 1); i++) {
            const callTask = callTasks[i];

            promiseAllArray.push(callTask);

        }
        newGroup.push(promiseAllArray);
    }

    return newGroup;
}


function regroup2(callTasks){
    const maxDial = 4;
    const newGroup = [];
    for (let i = 0; i < callTasks.length; i++) {
        const callTask = callTasks[i];
        let j = i % maxDial;
        if(!newGroup[j]){
            newGroup[j] = [];
        }
        newGroup[j].push(callTask);
    }
    return newGroup;
}

console.log(regroup2(testArray));