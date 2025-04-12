let pool = require("./mysqlPool");

//get connection from pool

let connection = {};
connection.getDB = function () {
  return new Promise(function (resolve, reject) {
    pool.getConnection(function (err, conn) {
      if (err) reject(err);
      resolve(conn);
    });
  });
};

connection.query = function (conn, query, values) {
  return new Promise(function (resolve, reject) {
    conn.query(query, values, function (err, results) {
      if (err) reject(err);
      resolve(results);
    });
  });
};


connection.beginTransaction = function (conn) {
  return new Promise(function (resolve, reject) {
    conn.beginTransaction(function (err) {
      if (err) reject(err);
      resolve();
    });
  });
};

connection.commit = function (conn) {
  return new Promise(function (resolve, reject) {
    conn.commit(function (err) {
      if (err) {
        return conn.rollback(function (err) {
          if (err) reject(err);
          resolve();
        });
      }
      resolve();
    });
  });
};

connection.rollback = function (conn) {
  return new Promise(function (resolve, reject) {
    conn.rollback(function (err) {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};


module.exports=connection