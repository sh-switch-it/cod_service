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
    codStatus:{
        type: DataTypes.INTEGER,
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
        allowNull: true
    },
    callTime:{
        type: DataTypes.DATE,
        allowNull: true
    },
    answerTime:{
        type: DataTypes.DATE,
        allowNull: true
    },
    callStatus:{
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ttsFileId:{
        type: DataTypes.TEXT,
        allowNull: true
    }
    ,
    outboundnumber:{
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    sequelize,
    freezeTableName: true,
    tableName: 'call_record',
});
CodRecord.hasMany(CallRecord, {as: 'callRecords', foreignKey: 'CodRecordId'});
CallRecord.belongsTo(CodRecord);




module.exports = {
    'User':User,
    //'Customer':Customer,
    'Team': Team,
    'CodRecord': CodRecord,
    'CallRecord': CallRecord
}