
const util = require('util');
const path = require('path');
const exec = util.promisify(require('child_process').exec);

module.exports = {
    async generateAudio(call_id, text) {
        try {
            const dynamiceText = text;
            const filePath = path.resolve(__dirname,'../../tts_audio/',call_id+"_audio.mp3");
            console.log("aaaaaaa",filePath);
            const cmd = `edge-tts --voice zh-CN-XiaoyiNeural --text "${dynamiceText}" --write-media ${filePath}`
            const { stdout, stderr } = await exec(cmd);
            console.log('stdout:', stdout);
            console.log('stderr:', stderr);
            return filePath;
        }catch (err){
           console.error(err);
        };
    },
}