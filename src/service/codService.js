const teamDAO = require('../db/dao/TeamDAO');
const codDAO = require('../db/dao/codDAO');
const { CallRecord } = require('../db/models/Schema');

module.exports = {
    // async addCustomer(team_id, customer_id) {
    //   const team = await this.getTeamById(team_id);
    //   return await team.addCustomer(customer_id);
    // },

    // async addOrUpdateCustomers(team_id, customer_ids) {
    //   await this.removeAllCustomers(team_id);
    //   const team = await this.getTeamById(team_id);
    //   return await team.addCustomers(customer_ids);
    // },

    // async removeAllCustomers(team_id){
    //   const team = await this.getTeamById(team_id);
    //   if(team && team.customers && team.customers.length > 0){
    //     const existed_customer_ids = team.customers.map((customer) => customer.id);
    //     await team.removeCustomers(existed_customer_ids);
    //   }
    // },

    //status: 2 is running, 1 is finished , 3 is pasued
    async addCodTask(pendingTime, retryTimes, textTemplate) {
      let createdCodTask;
      try {
        createdCodTask = await codDAO.create({
          "pendingTime":pendingTime,
          "retryTimes":retryTimes,
          "textTemplate": textTemplate,
          'status': 2
        });
      } catch (e) {
        console.error(e);
        throw e;
      }
      return createdCodTask;
    },

    async addCallRecordsToCodeTask(codId,callRecords) {
      let existedCodTask = await this.getCodTaskById(codId);
      const promiseArrary = [];
      for (let i = 0; i < callRecords.length; i++) {
        const call = callRecords[i];
        call.callee = JSON.stringify(call.callee);
        promiseArrary.push(existedCodTask.createCallRecord(call));
      }
      await Promise.all(promiseArrary);
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
  }