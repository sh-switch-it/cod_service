const axios = require('axios');
const config = require('../configReader')().config;
const fs = require('fs');
const path = require('path');
const openTTS_URL = config.tts.url;
const wavefile = require('wavefile');
const Mp32Wav = require('mp3-to-wav')

const crypto = require('crypto');
const { exec } = require('child_process');

module.exports = {
  async text2SpeechWave(call_id, text) {
    const fileName = crypto.createHash('md5').update(text).digest('hex');
    let filePath = path.join(__dirname, '../../tts_audio/');
    filePath = filePath + `/${fileName}.wav`;
    if (!fs.existsSync(filePath)) {
      const params = new URLSearchParams({
        voice: 'coqui-tts:zh_baker',
        text,
        vocoder: 'high',
        denoiserStrength: '0.03',
        cache: false,
      }).toString();
      console.log(openTTS_URL + '?' + params);
      const { data } = await axios.get(openTTS_URL + '?' + params, {
        responseType: 'arraybuffer',
      });
      // Read .wav file and convert it to required format
      let wav = new wavefile.WaveFile(data);
      wav.toSampleRate(8000); // Whisper expects audio with a sampling rate of 16000
      const file = fs.writeFileSync(filePath, wav.toBuffer());
    }
    return { callId: call_id, fileId: fileName };
  },

  async text2SpeechWave_edge(call_id, text) {
    const fileName = crypto.createHash('md5').update(text).digest('hex');
    let filePath = path.join(__dirname, '../../tts_audio');
    filePath = filePath + `/${fileName}.mp3`;
    const wavFilePath = path.join(__dirname, '../../tts_audio') + `/${fileName}.wav`;
    if (!fs.existsSync(filePath)) {
      try {
        const dynamicText = text;
        const cmd = `edge-tts --voice zh-CN-XiaoxiaoNeural --text "${dynamicText}" --write-media ${filePath}`;
        const { stdout, stderr } = await exec(cmd);
        console.log('stdout:', stdout);
        console.log('stderr:', stderr);
        new Mp32Wav(filePath).exec();
        let wav = new wavefile.WaveFile(fs.readFileSync(wavFilePath));
        wav.toSampleRate(8000); // Whisper expects audio with a sampling rate of 16000
        fs.writeFileSync(wavFilePath, wav.toBuffer());
      } catch (err) {
        console.error(err);
      }
    }
    return { callId: call_id, fileId: fileName };
  },
};
