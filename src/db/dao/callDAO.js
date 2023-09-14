const CallRecord = require('../models/Schema').CallRecord;
const BaseDAO = require('./BaseDAO');

class CallDAO extends BaseDAO{
    constructor(){
        super(CallRecord);
    }
}

module.exports = new CallDAO();