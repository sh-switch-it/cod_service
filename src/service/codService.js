
const codDAO = require('../db/dao/codDAO');
const callDAO = require('../db/dao/callDAO');
const { CallRecord } = require('../db/models/Schema');
const ttsService2 = require('./ttsService2');
const { dialingNumber} = require('../pbx/ariClient');
module.exports = {


    //status: 2 init, 3 tts generating, 4 ready, 5 running queue, 6 is canceled, 1 is finished ,, 
    async addCodTask(pendingTime, retryTimes, textTemplate) {
      let createdCodTask;
      try {
        createdCodTask = await codDAO.create({
          "pendingTime":pendingTime,
          "retryTimes":retryTimes,
          "textTemplate": textTemplate,
          'codStatus': 2,
          'status': 1
        });
      } catch (e) {
        console.error(e);
        throw e;
      }
      return createdCodTask;
    },

    async addCallRecordsToCodeTask(codId,callRecords) {
      let existedCodTask = await this.getCodTaskById(codId);
      
      // [{
    //     "callee":{
    //         "name": "李莉",
    //         "phone": "13817921334",
    //         "org": "外科",
    //         "job": "医师",
    //         "location": "手术室"
    //     },
    //     "callTime": "2023-08-29 11:35:51",
    //     "retryTimes": 0,
    //     "answerTime": "2023-08-29 11:37:52",
    //     "hangUpTime": "2023-08-29 11:38:52",
    //     "callStatus": 2,    //2 is init, 3 tts is ready, 4 waiting for dailing, 5 ringing, 6 dialing, 7 no responese,8 reject, 9 hangup in middle ,1 finished 
    //     "status": 1
    // }],
      for (let i = 0; i < callRecords.length; i++) {
        const call = callRecords[i];
        call.callee = JSON.stringify(call.callee);
        call.callStatus = 2;
        call.status = 1;
        await existedCodTask.createCallRecord(call);
      }
      existedCodTask = await this.getCodTaskById(codId);
      return existedCodTask;
    },
    async getCod(condition){
      let team;
      try {
        team = codDAO.query(condition);
      } catch (e) {
        console.error(e);
        throw e;
      }
      return team;
    },

    async getCodTaskById(id) {
      return await this.getCod({ 'id': id });
    },
    async removeCodTask(id) {
      let team;
      try {
        team = await codDAO.remove(id);
      } catch (e) {
        throw e;
      }
      return team;
    },
    async getCodTasks() {
      let codTasks;
      try {
        codTasks = await codDAO.queryAll();
      } catch (e) {
        throw e;
      }
      return codTasks;
    },

    async updateCodTask(newCodTask)
    {
      try {
        let codTaskExist = await codDAO.query({ 'id': newCodTask.id });
        if (!codTaskExist) {
          throw new Error('codTask not existed');
        }
        const updatedCodTask = await codDAO.update(newCodTask.id, newCodTask)
        return updatedCodTask;
      } catch (e) {
        console.error(e);
        throw e;
      }
    },

    async generateTTSBatch(codId){
      let codTaskExist = await codDAO.query({ 'id': codId });
      if(codTaskExist.codStatus === 2){
        const textTemplate = codTaskExist.textTemplate;
        //南部紧急呼叫，[部门]的[姓名][职务]，请于5分钟内,紧急前往[集合地]参与病患救治
        const callTasks = codTaskExist.callRecords;
        for (let i = 0; i < callTasks.length; i++) {
          const callTask = callTasks[i];
          if(callTask.callStatus === 2){
            const callee = JSON.parse(callTask.callee);
            const job = callee.job;
            const org = callee.org;
            const name = callee.name;
            const location = callee.location;
            const text = textTemplate.replace('[部门]',org)
              .replace('[姓名]',name)
              .replace('[职务]',job)
              .replace('[集合地]',location);
            console.log(text);
            await this.generateTTS(callTask.id, text);
            console.log('generated sound file');
          }
        }
        await codDAO.update(codTaskExist.id, {codStatus:3});
      }
      return await codDAO.query({id:codId});
    },

    async generateTTS(callTaskId, text){
      const fileId = await ttsService2.text2SpeechWave(callTaskId, text);
      await callDAO.update(callTaskId, {callStatus: 3});
    },

    async startCall(codId){
      const codTask = await this.getCodTaskById(codId);
      const callTasks = codTask.callRecords;
      const promiseAllArray = [];
      for (let i = 0; i < callTasks.length; i++) {
        const callTask = callTasks[i];
        promiseAllArray.push(dialingNumber(callTask, codTask.pendingTime,codTask.retryTimes));
        
      }
      await Promise.all(promiseAllArray);
      //await dialingNumber(testCallTask, codTask.pendingTime,codTask.retryTimes);
      //await callDAO.update(callTaskId, {callStatus: 3});
    },

    async monitorCall(codId){
      
      await callDAO.query({id: codId});
    },
  }