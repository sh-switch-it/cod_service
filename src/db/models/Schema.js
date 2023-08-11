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
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true
    },
    signature: {
        type: DataTypes.JSON,
        allowNull: true
    },
    inviter: {
        type: DataTypes.STRING,
        allowNull: true
    },
    //0 delete, 1 normal, 2 pending, 3 reject
    status: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    freezeTableName: true,
    tableName: 'users',
});

class Company extends Model {}
Company.init({
    // attributes
    company_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    logo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    domain: {
        type: DataTypes.STRING,
        allowNull: true
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
    tableName: 'companies',
});
Company.hasMany(User, { foreignKey: 'company_id', targetKey: 'id', as: 'user'})

class Meeting extends Model {}
Meeting.init({
    organizer:{
        type:DataTypes.STRING,
        allowNull: true,
    },
    title:{
        type:DataTypes.STRING,
        allowNull: false
    },
    startTime:{
        type: DataTypes.DATE,
        allowNull: false
    },
    duration:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    durationExtended:{
        type: DataTypes.INTEGER, // 0  not extended，1 extended
        allowNull: false,
        defaultValue: 0
    },
    agenda:{
        type: DataTypes.STRING,
        allowNull: true
    },
    host:{
        type:DataTypes.STRING,
        allowNull: true
    },
    conferenceId:{
        type:DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.INTEGER, // 1  not start，2 in progress， 3 cancelled，4 finished
        allowNull: false
    },
    participants:{
        type: DataTypes.STRING(2048),
        allowNull: true
    },
    requests:{
        type: DataTypes.JSON,
        allowNull: true
    },
    organizationId:{
        type: DataTypes.STRING,
        allowNull: true
    },

    // [
    //     {requestId:xxxx,fileId:xxxxxx,status:xxxxx}
    // ]
    signatureRequests:{
        type: DataTypes.JSON,
        allowNull: true
    },
    servicePackage:{
        type: DataTypes.STRING,
        allowNull: true
    },
},
{
    sequelize,
    freezeTableName: true,
    tableName: 'meetings',
});


class Invitation extends Model {}
Invitation.init({
    inviter:{
        type:DataTypes.STRING,
        allowNull: true,
    },
    invitee:{
        type:DataTypes.STRING,
        allowNull: false
    },
    invitationCode:{
        type:DataTypes.STRING,
        allowNull: false
    },
    expireTime:{ //unit second
        type:DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.INTEGER, // 0: pendding, 1: finished
        allowNull: false
    },
},
{
    sequelize,
    freezeTableName: true,
    tableName: 'invitations',
});



module.exports = {
    'User':User,
    'Company': Company,
    'Meeting': Meeting,
    'Invitation': Invitation
}