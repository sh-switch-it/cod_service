const dm = require("dmdb");
const config = require('../configReader')().config;
const url = config.dmdb.url;
const port = config.dmdb.port;
const user = config.dmdb.username;
const pass = config.dmdb.password;
class DmDB {
  #pool;
  constructor() {
    console.log(`dm://${user}:${pass}@${url}:${port}?autoCommit=false&loginEncrypt=false`);
  }
  //   初始化连接池
  init = async () => {
    this.#pool = await dm.createPool({
      connectString: `dm://${user}:${pass}@${url}:${port}?autoCommit=false&loginEncrypt=false`,
      poolMax: 10,
      poolMin: 1,
    });
  };

  getConnection = async () => {
    return await this.#pool.getConnection();
  };
}


module.exports = DmDB;