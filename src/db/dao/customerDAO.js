import { Customer } from '../models/Schema';
import BaseDAO from './BaseDAO';
class CustomerDAO extends BaseDAO{
    constructor(){
        super(Customer);
    }

    async getOrgList(){
        try{
            return await this.Model.aggregate('org', 'DISTINCT', { plain: false }).map( item => item.DISTINCT);
        }catch(e){
            console.log(e);
            return [];
        }
    }

    async getJobList(){
        try{
            return await this.Model.aggregate('job', 'DISTINCT', { plain: false }).map( item => item.DISTINCT);
        }
        catch(e){
            console.log(e);
            return [];
        }
    }
}



export default new CustomerDAO();