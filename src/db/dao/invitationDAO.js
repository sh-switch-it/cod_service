const Invitation = require('../models/Schema').Invitation;
const BaseDAO = require('./BaseDAO');
class InvitationDAO extends BaseDAO{
    constructor(){
        super(Invitation);
    }
}

module.exports = new InvitationDAO();