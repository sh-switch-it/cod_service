const request = require('request');
const config = require('../configReader')().config;
var randomString = require('random-string');
const meetingDAO = require('../db/dao/meetingDAO');

function randomRoomIdString() {
    
    let room_id = randomString({ length: 12, numeric: false }).toLowerCase();
    const cipherChars = [...room_id]; // convert into array

    cipherChars[3] = '-'; 
    cipherChars[8] = '-'; 

    let new_room_id = cipherChars.join(''); 
    return new_room_id;
}

module.exports = {
    async askForConferenceID(host,startTime,duration){

        let conferenceId;
        while (1) {
            conferenceId = randomRoomIdString();
            let isExist = await meetingDAO.isConferenceIdExist(conferenceId);
            
            if (!isExist){
                break;
            }
        }

        return conferenceId;
    }
}