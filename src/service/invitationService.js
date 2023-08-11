const invitationDAO = require('../db/dao/invitationDAO');
const stringRandom = require('string-random');
const userService = require('./userService');
const { Invitation } = require('../db/models/Schema');
const sequelize = require('../db/connect');
const { QueryTypes } = require('sequelize');

module.exports = {
    async createInvitations(inviter, invitees){
        const resultPool = {};
        for (let i = 0; i < invitees.length; i++) {
            const invitee = invitees[i];
            const invitationInfo = await this.createInvitation(inviter, invitee);
            if(invitationInfo && invitationInfo.invitationCode){
                resultPool[invitee] = invitationInfo.invitationCode;
            }
        }
        return resultPool;
    },

    async createInvitation(inviter, invitee){
        const hasExist = await this.hasExist(invitee);
        //const hasInvited = await this.hasInvited(inviter, invitee);
        if(!hasExist){
            const code = this.generateInvitationCode();
            const result = await invitationDAO.create({inviter,invitee,invitationCode:code,expireTime: 3600*24*30,status:0});
            return result;
        }else{
            return null;
        }
    },

    async getInvitationByCode(code){
        const result = await invitationDAO.query({invitationCode:code,status:0});
        return result 
    },

    async finishInvitation(code,invitee){
        const invitation = await this.getInvitationByCode(code);
        if(invitation && invitation.invitee === invitee){
            const result = await invitationDAO.update(invitation.id,{status:1});
            return result;
        }else{
            return null;
        }
        
    },

    async hasInvited(inviter, invitee){
        const result = await invitationDAO.query({inviter,invitee,status:0});
        if(result && result.length > 0){
            return true;
        }
        return false;
    },
    
    async hasExist(invitee){
        const isExist = await userService.isUserExist(invitee);
        return isExist;
    },
    
    generateInvitationCode(){
        return stringRandom(16);
    },

    async getPendingInvitations(searchText){
        let sql = "SELECT * FROM invitations inv WHERE inv.status = 0"
        if(searchText) {
            sql += " AND (inv.invitee LIKE '%" + searchText + "%' OR inv.inviter LIKE '%" + searchText + "%')"
        }
        try{
            const invitations = await sequelize.query(sql, { type: QueryTypes.SELECT });
            return invitations;
        }catch(e){
            console.error(e);
            throw e;
        }
    }
}