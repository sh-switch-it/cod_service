
import codDAO from '../db/dao/codDAO';
import callDAO from '../db/dao/callDAO';
import ttsService2 from './ttsService2';
import { getConfigReader } from '../configReader';
import ariClient from '../pbx/ariClient';
import sequelize from 'sequelize';
import Promise from 'bluebird';
const {dialingNumber} = ariClient;
const config = getConfigReader().getConfig();
const { Op } = sequelize;

export default {


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
    //     "callStatus": 2,    | 0  | rejected || 1  | accepted || 2  | init || 3  | tts is ready || 4  | calling |
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
    async getCodTasks(where,order,limit,offset) {
      let codTasks;
      try {
        codTasks = await codDAO.queryAllAndCountAll(where, [['createdAt', 'DESC']],limit,offset);
      } catch (e) {
        throw e;
      }
      return codTasks;
    },

    async getCurrentRunningCodTasks() {
      let codTasks;
      const ONE_HOUR = 60 * 60 * 1000 * 24 * 30;
      try {
        codTasks = await codDAO.queryAll(
          {
              codStatus: {
                [Op.or]: [2,3]
              },
              createdAt: {
                [Op.between]:[new Date(new Date().getTime() - ONE_HOUR), new Date()]
              }
          }
        );
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
    async generateTTSBatchAsync(codId){
      console.time();
      let codTaskExist = await codDAO.query({ 'id': codId });
      if(codTaskExist.codStatus === 2){
        const textTemplate = codTaskExist.textTemplate;
        //南部紧急呼叫，[部门]的[姓名][职务]，请于5分钟内,紧急前往[集合地]参与病患救治
        const callTasks = codTaskExist.callRecords;
        const promiseAllArray = [];
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
            promiseAllArray.push(this.generateTTS(callTask.id, text));
            console.log('generated sound file');
          }
        }
        await Promise.all(promiseAllArray);
        await codDAO.update(codTaskExist.id, {codStatus:3});
      }
      console.timeEnd();
      return await codDAO.query({id:codId});
    },

    async generateTTSBatch(codId){
      console.time('tts');
      const ttsNodeCount = config.tts.nodeCount;
      let codTaskExist = await codDAO.query({ 'id': codId });
      if(codTaskExist.codStatus === 2){
        const textTemplate = codTaskExist.textTemplate;
        //南部紧急呼叫，[部门]的[姓名][职务]，请于5分钟内,紧急前往[集合地]参与病患救治
        const callTasks = codTaskExist.callRecords;
        let promiseAllArray = [];
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
            if(i % ttsNodeCount === 0){
              promiseAllArray = [];
            }
            promiseAllArray.push(this.generateTTS(callTask.id, text));
            if(i % ttsNodeCount === ttsNodeCount - 1 || i === callTasks.length -1 ){
              await Promise.all(promiseAllArray);
            }
            console.log('generated sound file');
          }
        }
        console.timeEnd('tts');
        await codDAO.update(codTaskExist.id, {codStatus:3});
      }
      return await codDAO.query({id:codId});
    },

    async generateTTS(callTaskId, text){
      const {callId, fileId} = await ttsService2.text2SpeechWave(callTaskId, text);
      await callDAO.update(callId, {callStatus: 3, ttsFileId:fileId});
      return fileId;
    },

    async startCall(codId){
      const pstnPool = config.pbx.pstnPool;
      let codTask = await this.getCodTaskById(codId);
      let callTasks = codTask.callRecords;
      //分每组4路并行
      let regroup = this.regroup(callTasks);
      let promiseAllArray = [];
      for (let i = 0; i < regroup.length; i++) {
        const group = regroup[i];
        promiseAllArray.push(Promise.each(group, function(callTask) {
          return wholeCallProcess(pstnPool[i], callTask, codTask);
        }));
      }
      await this.promiseAllFunction(promiseAllArray);

      //call second round
      codTask = await this.getCodTaskById(codId);
      if(codTask.codStatus === 3){
      
        codTask = await this.getCodTaskById(codId);
        callTasks = codTask.callRecords.filter((item) => { return item.callStatus === 0});

        regroup = this.regroup(callTasks);
        promiseAllArray = [];
        for (let i = 0; i < regroup.length; i++) {
          const group = regroup[i];
          promiseAllArray.push(Promise.each(group, function(callTask) {
            return wholeCallProcess(pstnPool[i], callTask, codTask);
          }));
        }
        await this.promiseAllFunction(promiseAllArray);
      }
      codTask = await this.getCodTaskById(codId);
      if(codTask.codStatus === 3){
        codTask = await codDAO.update(codId,{codStatus: 1});
      }
      return codTask;
    },
    async cancelCall(codId){
      let cod = await codDAO.update(codId, {codStatus: 4});
      cod = await this.getCodTaskById(codId);
      for (let i = 0; i < cod.callRecords.length; i++) {
        const callTask = cod.callRecords[i];
        if(callTask.callStatus === 2 || callTask.callStatus === 3 || callTask.callStatus === 4){
          await callDAO.update(callTask.id,{callStatus:5});
        }
      }
      return await this.getCodTaskById(codId);
    },
    promiseAllFunction(promises){
      return new Promise((resolve,reject)=>{
        Promise.all(promises).then((result)=>{
          resolve(result);
        })
      })
    },

    async monitorCall(codId){
      const result = await codDAO.query({id: codId});
      return result;
    },

    regroup(callTasks){
      const pstnPool = config.pbx.pstnPool;
      const maxDial = pstnPool.length;
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
    },

    wholeCallProcess(pstn,callTask,codTask){
      return new Promise((resolve,reject)=>{
        callDAO.update(callTask.id,{outboundnumber:pstn,callStatus:4}).then(()=>{
          //check cod task is canceled manually？
          this.getCodTaskById(codTask.id).then((cod)=>{
            if(cod.codStatus === 4){
              callDAO.update(callTask.id,{
                callStatus:5
              }).then(()=>{
                resolve();
              });
            }else if(cod.codStatus === 3){
              dialingNumber(pstn,callTask, codTask.pendingTime,codTask.retryTimes).then((result)=>{
                callDAO.update(callTask.id,{
                  answerTime: result.answerTime,
                  hangUpTime:result.hangUpTime,
                  callStatus:result.callStatus
                }).then(()=>{
                  console.log();
                  resolve();
                });
              }).catch((e)=>{
                console.log(e);
                reject();
              })
            }else{
              reject();
            }
          });
        })
      });
    },
  };