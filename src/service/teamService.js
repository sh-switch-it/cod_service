import teamDAO from '../db/dao/teamDAO';

export default {
    async addCustomer(team_id, customer_id) {
      const team = await this.getTeamById(team_id);
      return await team.addCustomer(customer_id);
    },

    async addOrUpdateCustomers(team_id, customer_ids) {
      await this.removeAllCustomers(team_id);
      const team = await this.getTeamById(team_id);
      return await team.addCustomers(customer_ids);
    },

    async removeAllCustomers(team_id){
      const team = await this.getTeamById(team_id);
      if(team && team.customers && team.customers.length > 0){
        const existed_customer_ids = team.customers.map((customer) => customer.id);
        await team.removeCustomers(existed_customer_ids);
      }
    },


    async addTeam(name, location, description) {
      let createdTeam;
      try {
        let name_exist = await teamDAO.query({ 'name': name, 'status': 1 });
        if (name_exist) {
          throw new Error('name has existed');
        }
        createdTeam = await teamDAO.create({
          'name': name,
          'location': location,
          'description': description,
          'status': 1
        });
      } catch (e) {
        console.error(e);
        throw e;
      }
      return createdTeam;
    },
    async getTeam(condition){
      let team;
      try {
        team = teamDAO.query(condition);
      } catch (e) {
        console.error(e);
        throw e;
      }
      return team;
    },

    async isTeamExist(name) {
      try {
        return await teamDAO.query({ 'name': name });
      } catch (e) {
        console.error(e);
        return true;
      }
    },

    async getTeamById(id) {
      return await this.getTeam({ 'id': id });
    },
    async removeTeam(id) {
      let team;
      try {
        team = await teamDAO.update(id,{status:0})
      } catch (e) {
        throw e;
      }
      return team;
    },
    async getTeams() {
      let teams;
      try {
        teams = await teamDAO.queryAll({ 'status': 1 });
      } catch (e) {
        throw e;
      }
      return teams;
    },

    async updateTeam(id,newTeam)
    {
      try {
        let teamExist = await teamDAO.query({ 'id': id });
        if (!teamExist) {
          throw new Error('team not existed');
        }
        const updatedTeam = await teamDAO.update(id, newTeam)
        return updatedTeam;
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
  };