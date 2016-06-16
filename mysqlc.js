var config       = require('config');
var Log          = require('node-android-logging');
var mysql        = require('mysql');

if (process.env.NODE_ENV === "development") {
  Log.I(config);
} else {
  Log.I("Launching eledger as " + process.env.NODE_ENV);
}

function connect() {
  mysqlc = mysql.createConnection({
    password: config.get("db.password"),
    host: config.get("db.host"),
    user: config.get("db.user"),
    database: config.get("db.name"),
    debug: true
  });

  mysqlc.connect(function(err) {
    if (err) {
      Log.E(err);
      setTimeout(connect, 2000);
    }
  });

  mysqlc.on('error', function(err) {
    Log.E(err);

    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      Log.W("Lost connection, trying to reconnect.");

      connect();
    } else {
      throw err;
    }
  });

  exports.mysqlc = mysqlc;
}

connect();

