const mysql = require('mysql2');
require('dotenv').config();

// Create a connection 
const db = mysql.createConnection({
    host: "localhost",
    user: "root", 
    password: "1234",
    database: "emotorad_db",
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL database");
    }
});

module.exports = db;
