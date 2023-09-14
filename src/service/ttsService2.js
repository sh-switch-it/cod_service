const axios = require('axios');
const config = require('../configReader')().config;
const fs = require('fs');
const path = require('path');
const openTTS_URL = config.tts.url;
const wavefile = require('wavefile');
module.exports = {

  
  async text2SpeechWave(call_id,text) {
    const params = new URLSearchParams({
        voice: 'coqui-tts:zh_baker',
        text,
        vocoder: 'high',
        denoiserStrength:'0.03',
        cache:false
      }).toString();
    console.log(openTTS_URL+'?'+params);
    const {data} = await axios.get(openTTS_URL+'?'+params,{responseType:'arraybuffer'});
    // Read .wav file and convert it to required format
    let wav = new wavefile.WaveFile(data);
    wav.toSampleRate(8000); // Whisper expects audio with a sampling rate of 16000
    let filePath = path.join(__dirname ,'../../tts_audio/');
    filePath = filePath + `/${call_id}.wav`;
    const file = fs.writeFileSync(filePath,wav.toBuffer());
    return call_id;
  },
}