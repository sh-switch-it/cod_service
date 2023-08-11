const meetingDAO = require('../db/dao/meetingDAO');
const conferenceService = require('../service/conferenceService');
let request = require("request");
const config = require('../configReader')().config;
const moment = require('moment');
const emailService = require('../service/emailService');
module.exports = {

    async sentInvitationLink(inviter, invitees, meeting, isUpdate = false) {
        const results = [];
        const meetingTime  = moment(meeting.startTime).toDate().toLocaleString('en-US',{timeZone: 'America/Los_Angeles'}) + ' (USA Los Angeles PST/PDT)';
        // const body = {
        //     "inviter_email": inviter,
        //     "invitee_info": invitees,
        //     "meeting_link": config.boothVideo.url + meeting.conferenceId,
        //     "meeting_title": meeting.title,
        //     "meeting_date": meetingTime,
        //     "meeting_time": meetingTime,
        //     "meeting_duration": meeting.duration + ' minutes',
        //     "meeting_host": meeting.host,
        //     "agenda_list": meeting.agenda.split(',')
        // }
        for (item of invitees) {
            console.log('++++++++++++++++++start send email for meeting+++++++++++++++++++++++++++++');
            const subject = isUpdate ? 'Updated: openuse.io Invitation' : 'openuse.io Invitation';
            const templateName = isUpdate ? 'update_meeting' : 'dais_invitation';
            const templateParam = {
                "meeting_inviter": inviter,
                "meeting_link": config.boothVideo.url + meeting.conferenceId,
                "meeting_title": meeting.title,
                "meeting_date": meetingTime,
                "meeting_time": meetingTime,
                "meeting_host": meeting.host,
                "agenda_list": meeting.agenda.split(','),
                "invitation_link": item.link,
                "meeting_duration": meeting.duration + ' minutes',
            };
            console.log(`subject:${subject},templateName:${templateName},templateParam:${JSON.stringify(templateParam)}`);
            const objResult = await emailService.sendEmail(item.email, subject, templateName, templateParam);
            console.log('send email resut:' + JSON.stringify(objResult));
            console.log('++++++++++++++++++end send email for meeting+++++++++++++++++++++++++++++');
            results.push(JSON.stringify(objResult));
        };
        return results;
        
    },
    async createMeeting(meeting) {
        let createdMeeting;
        try {
            meeting.status = 1;
            createdMeeting = await meetingDAO.create(meeting);
        } catch (e) {
            console.error(e);
            throw e;
        }
        return createdMeeting;
    },

    async getMeetings(user, startDate, endDate, orgId) {
        let result;
        try {
            result = await meetingDAO.getMeetings(user, startDate, endDate, orgId);
        } catch (e) {
            console.error(e);
            throw e;
        }
        return result;
    },

    async getTimeoutMeetings() {

        let result;
        try {
            result = await meetingDAO.getTimeoutMeetings();

        } catch (e) {
            console.error(e);
            throw e;
        }
        return result;
    },

    async getMeetingById(id) {
        let result;
        try {
            result = await meetingDAO.getMeeting({ id: id });
        } catch (e) {
            console.error(e);
            throw e;
        }
        return result;
    },


    async submitRequests(meetingId, requester, requests) {
        let meet;
        let result;
        try {
            meet = await meetingDAO.query({ id: meetingId });
            let existRequests = meet.requests;
            if (meet.requests) {
                for (let i = 0; i < requests.length; i++) {
                    const request = requests[i];
                    if (request.startsWith("other:")) {
                        const otherContent = request.split(":")[1];
                        const otherRequest = {
                            name: otherContent,
                            displayName: otherContent,
                            requesters: [requester]
                        }
                        existRequests.push(otherRequest);
                    } else {
                        for (let l = 0; l < existRequests.length; l++) {
                            const existRequest = existRequests[l];
                            if (request === existRequest.name) {
                                //existRequest.requesters.push(requester);
                                const existRequesters = new Set(existRequest.requesters);
                                existRequesters.add(requester);
                                existRequest.requesters = Array.from(existRequesters);
                            }
                        }
                    }
                }
                if (requests && requests.length > 0) {
                    result = await meetingDAO.patchUpdate(meet.id, { "requests": existRequests });
                }
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
        return result;
    },

    async updateMeetingStatus(meeting_id, status) {

        try {
            result = await meetingDAO.updateMeetingStatus(meeting_id, status);

        } catch (e) {
            console.error(e);
            throw e;
        }
        return result;
    },

    async updateMeeting(meeting_id, meeting) {

        try {
            result =await meetingDAO.patchUpdate(meeting_id, {
                title: meeting.title,
                startTime: meeting.startTime,
                duration:meeting.duration,
                host:meeting.host,
                agenda:meeting.agenda,
                participants:meeting.participants,
                requests:meeting.requests
            });

        } catch (e) {
            console.error(e);
            throw e;
        }
        return result;
    },

    async createAgenda(meetId, agenda) {

        let result;
        let meet;

        try {
            meet = await meetingDAO.query({ id: meetId });
            if (!meet) {
                throw new Error('meeting not existed');
            }

            result = await meet.update({
                ['agenda']: agenda,
            }, {
                fields: ['agenda']
            });
        } catch (e) {
            console.error(e);
            throw e;
        }
        return result;
    },

    async getAgenda(meetId) {
        let result;
        let meet;
        try {
            meet = await meetingDAO.query({ id: meetId });
            if (!meet) {
                throw new Error('meeting not existed');
            }
            result = meet.agenda;

        } catch (e) {
            console.error(e);
            throw e;
        }
        return result;
    },

    async cancelMeeting(meetId,operator) {
        let result;
        let meeting;
        try {
            meeting = await meetingDAO.query({ id: meetId });
            if (!meeting) {
                throw new Error('meeting not existed');
            }
            else if(meeting.status != 1){
                throw new Error('meeting status is invalid');
            }
            else if(moment(meeting.startTime).add(meeting.duration,'minutes').isBefore(moment()))
            {
                throw new Error('meeting is over');
            }
            else if(operator !== meeting.organizer){
                throw new Error("you're not organizer");
            }else
            {
               result = await meetingDAO.updateMeetingStatus(meeting.conferenceId, 0);
               const meetingTime  = moment(meeting.startTime).toDate().toLocaleString('en-US',{timeZone: 'America/Los_Angeles'}) + ' (USA Los Angeles PST/PDT)';
               const p = meeting.participants.split(',').join(';');
               const to = p + ';' + meeting.host;
               const subject = 'Cancel Meeting Notification';
               const templateName = 'cancel_meeting';
               const templateParam = {
                "user": 'dear user',
                "canceller": meeting.host,
                "meeting_title":  meeting.title,
                "meeting_date": meetingTime,
                "meeting_duration": meeting.duration + ' minutes',
                "meeting_host": meeting.host,
                "agenda_list": meeting.agenda.split(',')
               };
               const sendCancelEmail = await emailService.sendEmail(to,subject,templateName,templateParam);
            }

        } catch (e) {
            console.error(e);
            throw e;
        }
        return result;
    },
}