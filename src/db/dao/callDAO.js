import { CallRecord } from '../models/Schema';
import BaseDAO from './BaseDAO';

class CallDAO extends BaseDAO{
    constructor(){
        super(CallRecord);
    }
}

export default new CallDAO();