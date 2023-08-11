const meetingService = require('../../service/meetingService');
const userService = require('../../service/userService');
const conferenceService = require('../../service/conferenceService');
const invitationService = require('../../service/invitationService');
const coreService = require('../../service/coreService');
const config = require('../../configReader')().config;
const kafka = require('../../kafka/kafka_processor');
const moment = require('moment');
const getMeetings = function (app) {
    return async (ctx, next) => {
        try {
            const username = ctx.token.username;
            //const user = await userService.getUserByEmail(username);
            const user = {
                email: username
            };
            let startdate = ctx.query.startdate ? ctx.query.startdate : null;
            let enddate = ctx.query.enddate ? ctx.query.enddate : null;
            let organizationId = ctx.query.organizationId ? ctx.query.organizationId : null;
            if (startdate && enddate) {
                if (organizationId) {
                    console.log("----------------------------------------")
                    const result = await meetingService.getMeetings(user, startdate, enddate, organizationId);
                    ctx.response.body = result;
                } else {
                    const result = await meetingService.getMeetings(user, startdate, enddate);
                    ctx.response.body = result;
                }

            } else {
                ctx.response.body = [];
            }

        } catch (err) {
            ctx.response.body = err
        }
    };
}

const createMeeting = function (app) {
    return async (ctx, next) => {
        try {
            let organizer = ctx.token.username;
            let title = ctx.request.body.title;
            let startTime = ctx.request.body.startTime;
            let duration = ctx.request.body.duration;
            let durationExtended = 0;
            let host = ctx.request.body.host;
            let agenda = ctx.request.body.agenda;
            let participants = ctx.request.body.participants;
            let requests = ctx.request.body.requests;
            let organizationId = ctx.request.body.organizationId;
            let servicePackage = ctx.request.body.servicePackage;
            const conferenceId = await conferenceService.askForConferenceID(host, startTime, duration);
            const wrapperParticipants = [];
            const inviteeList = [];
            for (let i = 0; i < participants.length; i++) {
                const p = participants[i];
                if (p.indexOf('$invite:') === 0) {
                    const invitee = p.split('$invite:')[1];
                    wrapperParticipants.push(invitee);
                    inviteeList.push(invitee);
                } else {
                    wrapperParticipants.push(p);
                }
            }
            // check current user permission
            const userPermissions = ctx.token.permissions;
            if (inviteeList && inviteeList.length > 0 && userPermissions && userPermissions.indexOf('Invite_User') < 0) {
                ctx.throw(403, 'You have no permission to invite new user.');
            }
            const wrapperParticipantsString = wrapperParticipants.join(',');
            const result = await meetingService.createMeeting({
                organizer,
                title,
                startTime,
                duration,
                durationExtended,
                host,
                agenda,
                participants: wrapperParticipantsString,
                conferenceId,
                requests,
                organizationId,
                servicePackage
            });
            //kafka test
            //kafka.kafkaProduceMessage('add_meeting',result);
            //kafka.runKafkaConsumer('add_meeting');

            //const invitationPool = await invitationService.createInvitations(organizer,inviteeList);
            const invitationPool = await coreService.createInvitations(organizer, inviteeList);
            const inviteeInfoList = [];
            if (organizer !== host) {
                wrapperParticipants.push(host);
            }
            for (let i = 0; i < wrapperParticipants.length; i++) {
                const p = wrapperParticipants[i];
                let link = config.boothVideo.url + result.conferenceId;
                if (invitationPool[p]) {
                    link = config.booking.url + '/register?email=' + encodeURIComponent(p) + '&code=' + invitationPool[p] + "&orgId="+ organizationId;
                }
                const obj = {
                    email: p,
                    link: link
                };
                inviteeInfoList.push(obj);
            }

            const result2 = await meetingService.sentInvitationLink(organizer, inviteeInfoList, result, isUpdate=false);
            console.log(result2);
            ctx.response.body = result;
        } catch (err) {
            ctx.response.body = err
        }
    };
}


const updateMeeting = function (app) {
    return async (ctx, next) => {
        try {
            let organizer = ctx.token.username;
            const meetingId = ctx.params.meetingId;
            let title = ctx.request.body.title;
            let startTime = ctx.request.body.startTime;
            let duration = ctx.request.body.duration;
            let host = ctx.request.body.host;
            let agenda = ctx.request.body.agenda;
            let participants = ctx.request.body.participants;
            let organizationId = ctx.request.body.organizationId;
            let requests = ctx.request.body.requests;
            const wrapperParticipants = [];
            const inviteeList = [];
            for (let i = 0; i < participants.length; i++) {
                const p = participants[i];
                if (p.indexOf('$invite:') === 0) {
                    const invitee = p.split('$invite:')[1];
                    wrapperParticipants.push(invitee);
                    inviteeList.push(invitee);
                } else {
                    wrapperParticipants.push(p);
                }
            }
            // check current user permission
            const userPermissions = ctx.token.permissions;
            if (inviteeList && inviteeList.length > 0 && userPermissions && userPermissions.indexOf('Invite_User') < 0) {
                ctx.throw(403, 'You have no permission to invite new user.');
            }
            const wrapperParticipantsString = wrapperParticipants.join(',');
            const result = await meetingService.updateMeeting(meetingId,{
                title,
                startTime,
                duration,
                host,
                agenda,
                participants: wrapperParticipantsString,
                requests
            });
            //kafka test
            //kafka.kafkaProduceMessage('add_meeting',result);
            //kafka.runKafkaConsumer('add_meeting');

            //const invitationPool = await invitationService.createInvitations(organizer,inviteeList);
            const invitationPool = await coreService.createInvitations(organizer, inviteeList);
            const inviteeInfoList = [];
            if (organizer !== host) {
                wrapperParticipants.push(host);
            }
            for (let i = 0; i < wrapperParticipants.length; i++) {
                const p = wrapperParticipants[i];
                let link = config.boothVideo.url + result.conferenceId;
                if (invitationPool[p]) {
                    link = config.booking.url + '/register?email=' + encodeURIComponent(p) + '&code=' + invitationPool[p] + "&orgId="+ organizationId;
                }
                const obj = {
                    email: p,
                    link: link
                };
                inviteeInfoList.push(obj);
            }

            const result2 = await meetingService.sentInvitationLink(organizer, inviteeInfoList, result, isUpdate=true);
            console.log(result2);
            ctx.response.body = result;
        } catch (err) {
            ctx.response.body = err
        }
    };
}

const createAgenda = function (app) {
    return async (ctx, next) => {
        try {

            let conferenceId = ctx.request.body.meetingId;
            let agenda = ctx.request.body.agenda;

            const result = await meetingService.createAgenda(
                conferenceId, agenda
            );
            ctx.response.body = result;
        } catch (err) {
            ctx.response.body = err
        }
    };
}

const getAgenda = function (app) {
    return async (ctx, next) => {
        try {
            const meetingId = ctx.params.meetingId;
            const result = await meetingService.getAgenda(meetingId);
            ctx.response.body = result;
        } catch (err) {
            ctx.response.body = err
        }
    };
}

const submitRequests = function (app) {
    return async (ctx, next) => {
        try {
            const meetingId = ctx.params.meetingId;
            const requester = ctx.token.username;
            const requests = ctx.request.body.requests;
            // const meeting = meetingService.getMeeting(meetingId);
            const result = await meetingService.submitRequests(meetingId, requester, requests);
            ctx.response.body = result;
        } catch (err) {
            ctx.response.body = err
        }
    }
}

const cancelMeeting = function (app) {
    return async (ctx, next) => {
        try {
            const meetingId = ctx.params.meetingId;
            const currentUser = ctx.token.username;
            const result = await meetingService.cancelMeeting(meetingId,currentUser);
            ctx.response.body = result;
        } catch (err) {
            ctx.response.body = err
        }
    };
}



module.exports = {
    'GET /meetings': {
        method: getMeetings,
        auth: []
    },
    'POST /meetings': {
        method: createMeeting,
        auth: ["Book_Meeting", "Invite_Member"]
    },
    'PUT /meetings/:meetingId/requests': {
        method: submitRequests,
        auth: []
    },
    'POST /meetings/agenda': {
        method: createAgenda,
        auth: []
    },
    'GET /meetings/agenda/:meetingId': {
        method: getAgenda,
        auth: []
    },
    'DELETE /meetings/:meetingId': {
        method: cancelMeeting,
        auth: []
    },

    'PUT /meetings/:meetingId': {
        method: updateMeeting,
        auth: []
    },
}