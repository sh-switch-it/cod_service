import { createHash } from 'crypto';
import userDAO from '../db/dao/userDAO';
function sha256(content) {  
  return createHash ('sha3-256').update(content).digest('hex')
}

export default {
  checkPasswordFormat(password){
    const pattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return pattern.test(password);
  },

  async isAuth(username, password) {
    const existedUser = await userDAO.query({
      username,
      "password": sha256(password),
      "status":1
    });
    if(existedUser){
      delete existedUser["password"];
    }
    return existedUser;
  },

  async addUser(username, password, role) {
    const existedUser = await this.getUserByUsername(username);
    if(existedUser){
      throw new Error('user existed');
    }
    if(!this.checkPasswordFormat(password)){
      throw new Error('password is invalid');
    }
    const newUser =  userDAO.create({
      "username":username,
      "password": sha256(password),
      "status": 1,
      role
    });
    delete newUser["password"];
    return newUser;
  },

  async getUsers(){
    return await userDAO.queryAll({status:1});
  },

  async getUserByUsername(username) {
    const existedUser = await userDAO.query({username,status:1});
    existedUser && delete existedUser["password"];
    return existedUser;
  },

  async changePassword(username, oldPassword, newPassword){
    const existedUser = await this.isAuth(username,oldPassword);
    
    if(existedUser && this.checkPasswordFormat(newPassword)){
      existedUser.password = sha256(newPassword);
      return await userDAO.updatePatch(existedUser.id, {
        password: sha256(newPassword)
      });
    }
    return null;
  },

  async updateUser(id, updatePart){
    return await userDAO.patchUpdate(id,updatePart)
  },

  async removeUser(id){
    return await userDAO.patchUpdate (id,{status:0});
  }
};