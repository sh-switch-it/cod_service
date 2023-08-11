const Meeting = require('../models/Schema').Meeting;
const User = require('../models/Schema').User;
const BaseDAO = require('./BaseDAO');
const { Op } = require("sequelize");
const sequelize = require('../connect');
const moment = require('moment');
class MeetingDAO extends BaseDAO{
    constructor(){
        super(Meeting);
    }
    async create(meeting){
        let createdMeeting;
        try{
            createdMeeting = await Meeting.create(meeting);
        }catch(e){
            console.error(e);
        }
        return createdMeeting;
    }
    async getTimeoutMeetings(){

        let result ;
        
        try{
            result = await sequelize .query('SELECT * FROM public.meetings WHERE now()::timestamp with time zone  - "startTime" >  make_interval(mins => duration) AND status<>4', {
                model: Meeting,
                mapToModel: true 
              });
        }catch(e){
            console.error(e);
        }
        return result;
    }

    async updateMeetingStatus(meeing_id, status) {
        try{
            Meeting.update(
                {
                    status: status
                }, 
                {
                    where: {conferenceId: meeing_id}
                }
            )
        }catch(e){
            console.error(e);
        }
    }

    async  updateMeeting(meetingId, updatedMeeting){
        let result;
        
        try{
            result = await Meeting.update(
                {
                    title: updatedMeeting.title,
                    startTime: updatedMeeting.startTime,
                    duration:updatedMeeting.duration,
                    host:updatedMeeting.host,
                    agenda:updatedMeeting.agenda,
                    participants:updatedMeeting.participants,
                    requests:updatedMeeting.requests
                },
                {
                    where: {
                        'conferenceId': meetingId
                    }
                }
            );
        }catch(e){
            console.error(e);
        }
        
        if (result.length == 0){
            return false;
        }
        return result;
    }

    async isConferenceIdExist(conferenceId) {

        let result;
        
        try{
            result = await Meeting.findAll({
                where: {
                    'conferenceId': conferenceId
                }
            });
        }catch(e){
            console.error(e);
        }
        
        if (result.length == 0){
            return false;
        }

        return true;
    }

    async getMeetings(user,startDate,endDate,orgId){
        
        let result;
        let whereCondition = {
            [Op.or]:[{organizer:user.email},{host:user.email},{participants:{
                [Op.like]:"%"+user.email+"%"
            }}]
        };
        if(startDate && endDate){
            const DAY_START = startDate;
            const DAY_END = endDate;
            console.log('DAY_START_______',DAY_START);
            console.log('DAY_END_________',DAY_END);
            whereCondition.startTime = {
                [Op.gte]: DAY_START,
                [Op.lt]: DAY_END
            }
        }
        if(orgId){
            whereCondition.organizationId = {
                [Op.eq]:orgId
            }
        }
        try{
            result = Meeting.findAll({
                where: whereCondition,
                order: [['startTime', 'ASC']]
            });
        }catch(e){
            console.error(e);
        }
        return result;
    }
}

module.exports = new MeetingDAO();