// dbConfig.js
let conf = {
    host: 'localhost',
    user: 'usermain',
    password: 'inipassword123',
    database: 'androidmonitor',
    connectionLimit: 10 // Adjust the connection limit as needed
};

import mariadb from "mariadb"

const pool = mariadb.createPool(conf);

export default pool;