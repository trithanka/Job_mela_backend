var mysql = require('mysql');
//create pool
var configuration = require('../config.json');
var pool = mysql.createPool(configuration.databaseMYSQL);
module.exports = exports = pool;