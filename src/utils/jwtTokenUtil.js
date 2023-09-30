const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// var token = jwt.sign({ foo: 'bar' }, privateKey, { algorithm: 'RS256' })
const TokenUtil = {
  sign: function(userName){
    const payload = { userName };
    const keyPath = path.join(__dirname, '../auth/jwt_key/jwtRS256_cod.key');
    const privateKey = fs.readFileSync(keyPath);
    var token = jwt.sign(payload, privateKey,{expiresIn: 60 * 60 * 24});
    console.log(`token = ${token}`);
    return token;
  },

  verify: function(token){
    const keyPath = path.join(__dirname, '../auth/jwt_key/jwtRS256_cod.key');
    const privateKey = fs.readFileSync(keyPath);
    try{
      const decoded = jwt.verify(token, privateKey);
      //console.log('decoded = '+JSON.stringify(decoded));
      return decoded;
    }catch(err){
      console.error(err);
    }
  },
}
module.exports = {
  TokenUtil
}