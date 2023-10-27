import { getConfigReader } from '../configReader';
import Sequelize from 'sequelize';

const config = getConfigReader().getConfig();
const url = config.db.url;
const port = config.db.port;
const user = config.db.username;
const pass = config.db.password;
const dbname = config.db.database;
const isConnected = false;
console.log(url);
const sequelize = new Sequelize(dbname,user,pass,
    {
        host: url,
        port: port,
        dialect: 'postgres',
        pool: {
            max: 15,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        logging: false
    });


export default sequelize;