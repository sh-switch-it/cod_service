const userJSON = require("../db/json/user_db.json");
const {createHash} = require("crypto");
function sha256(content) {  
  return createHash ('sha3-256').update(content).digest('hex')
}

module.exports = {
  async isAuth(username, password) {
    for (let i = 0; i < userJSON.length; i++) {
      const user = userJSON[i];
      if(user.username === username && user.password === sha256(password)){
        const authUser = {
          username,
          role: user.role
        }
        return authUser;
      }
    }
    return null;
  },
}