var config       = require('config');
var Log          = require('node-android-logging');
var mysql        = require('mysql');

if (process.env.NODE_ENV === "development") {
  var requiredConfigs = ["db.password", "db.host", "db.user", "db.name"];

  var i;
  var message = "{";

  for (i = 0; i < requiredConfigs.length; ++i) {
    message += "\"" + requiredConfigs[i] + "\":";
    if (config.has(requiredConfigs[i])) {
      if (config.get(requiredConfigs[i]) !== "changeme" &&
          requiredConfigs[i] == 'db.password') {
        message += "\"not displayed for security reasons\"";
      } else {
        message += "\"" + config.get(requiredConfigs[i]) + "\"";
      }
    } else {
      message += "null";
    }

    if (i + 1 < requiredConfigs.length) {
      message += ",";
    }
  }

  message += "}";

  Log.I(message);
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

