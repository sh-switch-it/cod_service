const {createHash} = require("crypto");
const userDAO = require("../db/dao/userDAO");
function sha256(content) {  
  return createHash ('sha3-256').update(content).digest('hex')
}

module.exports = {
  checkPasswordFormat(password){
    const pattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return pattern.test(password);
  },

  async isAuth(username, password) {
    const existedUser = await userDAO.query({
      username,
      "password": sha256(password)
    });
    if(existedUser){
      delete existedUser["password"];
    }
    return existedUser;
  },

  async addUser(username, password, role) {
    const existedUser = await this.getUserByUsername(username);
    if(existedUser){
      return new Error('user existed');
    }
    if(!this.checkPasswordFormat(password)){
      return new Error('password is invalid');
    }
    return userDAO.create({
      "username":username,
      "password": sha256(password),
      "status": 1,
      role
    })
  },

  async getUsers(){
    return await userDAO.queryAll();
  },

  async getUserByUsername(username) {
    const existedUser = await userDAO.query({username});
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

  async updateUser(username, role){
    const existedUser = await this.getUserByUsername(username);
    if(existedUser){
      return await userDAO.updatePatch(existedUser.id, {
        role
      });
    }
    return null;
  }
}