const ttsService2 = require("./src/service/ttsService2");

async function run(text){
    await ttsService2.text2SpeechWave_edge(1,text);
} 

run("抢救室抢救A,A,A,创伤,请尽快前往抢救室参与病患救治");
