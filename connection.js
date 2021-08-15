const mysql = require("mysql");
//connect to mysql server
const db = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "rootr00t",
    database: "jsmysql",
});

db.connect((error) => {
    if(error) {
        throw(error);
    }
    console.log("MySql Connected!");
});

module.exports = db;

        