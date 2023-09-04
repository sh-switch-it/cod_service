const {Sequelize,DataTypes} = require('sequelize');
const sequelize = require('../connect');
const Model = Sequelize.Model;
class User extends Model {}
User.init({
    // attributes
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    freezeTableName: true,
    tableName: 'users',
});
class Customer extends Model {}
Customer.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // location: {
    //     type: DataTypes.STRING,
    //     allowNull: true
    // },
    org: {
        type: DataTypes.STRING,
        allowNull: true
    },
    job: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
}, {
    sequelize,
    freezeTableName: true,
    tableName: 'customers',
});
class Team extends Model {}
Team.init({
    // attributes
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    freezeTableName: true,
    tableName: 'teams',
});


class TeamCustomer extends Model{}
TeamCustomer.init({
    // id:{
    //     type: DataTypes.INTEGER,
    //     allowNull: false,
    //     autoIncrement: true,
    //     primaryKey: true
    // },
    teamId:{
        type: DataTypes.INTEGER,
        field: 'team_id',
        allowNull: false,
        defaultValue: 0
    },
    customerId:{
        type: DataTypes.INTEGER,
        field: 'customer_id',
        allowNull: false,
        defaultValue: 0
    },
},{
    sequelize,
    freezeTableName: true,
    tableName: 'TeamCustomer',
});

Team.belongsToMany(Customer, { through: TeamCustomer,as: 'customers'});
Customer.belongsToMany(Team, { through: TeamCustomer,as: 'teams'});

class CodRecord extends Model {}
CodRecord.init({
    // attributes
    pendingTime:{
        type: DataTypes.INTEGER,
        allowNull: true
    },
    retryTimes:{
        type: DataTypes.INTEGER,
        allowNull: true
    },
    textTemplate:{
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    freezeTableName: true,
    tableName: 'cod_record',
});

class CallRecord extends Model {}
CallRecord.init({
    // attributes
    callee:{
        type: DataTypes.JSON,
        allowNull: false
    },
    callTime:{
        type: DataTypes.TIME,
        allowNull: false
    },
    retryTimes:{
        type: DataTypes.INTEGER,
        allowNull: true
    },
    answerTime:{
        type: DataTypes.TIME,
        allowNull: true
    },
    hangUpTime:{
        type: DataTypes.TIME,
        allowNull: true
    },
    callStatus:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    freezeTableName: true,
    tableName: 'call_record',
});


CodRecord.hasMany(CallRecord, {as: 'callRecords', foreignKey: 'CodRecordId'});
CallRecord.belongsTo(CodRecord);

// class Meeting extends Model {}
// Meeting.init({
//     organizer:{
//         type:DataTypes.STRING,
//         allowNull: true,
//     },
//     title:{
//         type:DataTypes.STRING,
//         allowNull: false
//     },
//     startTime:{
//         type: DataTypes.DATE,
//         allowNull: false
//     },
//     duration:{
//         type: DataTypes.INTEGER,
//         allowNull: false
//     },
//     durationExtended:{
//         type: DataTypes.INTEGER, // 0  not extended，1 extended
//         allowNull: false,
//         defaultValue: 0
//     },
//     agenda:{
//         type: DataTypes.STRING,
//         allowNull: true
//     },
//     host:{
//         type:DataTypes.STRING,
//         allowNull: true
//     },
//     conferenceId:{
//         type:DataTypes.STRING,
//         allowNull: false
//     },
//     status: {
//         type: DataTypes.INTEGER, // 1  not start，2 in progress， 3 cancelled，4 finished
//         allowNull: false
//     },
//     participants:{
//         type: DataTypes.STRING(2048),
//         allowNull: true
//     },
//     requests:{
//         type: DataTypes.JSON,
//         allowNull: true
//     },
//     organizationId:{
//         type: DataTypes.STRING,
//         allowNull: true
//     },

//     // [
//     //     {requestId:xxxx,fileId:xxxxxx,status:xxxxx}
//     // ]
//     signatureRequests:{
//         type: DataTypes.JSON,
//         allowNull: true
//     },
//     servicePackage:{
//         type: DataTypes.STRING,
//         allowNull: true
//     },
// },
// {
//     sequelize,
//     freezeTableName: true,
//     tableName: 'meetings',
// });


// class Invitation extends Model {}
// Invitation.init({
//     inviter:{
//         type:DataTypes.STRING,
//         allowNull: true,
//     },
//     invitee:{
//         type:DataTypes.STRING,
//         allowNull: false
//     },
//     invitationCode:{
//         type:DataTypes.STRING,
//         allowNull: false
//     },
//     expireTime:{ //unit second
//         type:DataTypes.INTEGER,
//         allowNull: false
//     },
//     status: {
//         type: DataTypes.INTEGER, // 0: pendding, 1: finished
//         allowNull: false
//     },
// },
// {
//     sequelize,
//     freezeTableName: true,
//     tableName: 'invitations',
// });



module.exports = {
    'User':User,
    'Customer':Customer,
    'Team': Team,
    'CodRecord': CodRecord,
    'CallRecord': CallRecord
}