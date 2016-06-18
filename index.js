"use strict";

var config        = require("config");
var express       = require("express");
var path          = require("path");
var hbs           = require("hbs");
var bodyParser    = require("body-parser");

var app = express();

var Log = require("node-android-logging");

Log.setDefaults();
Log.enableStderr("Trace");

Log.I("\n" + "=".repeat(process.stdout.columns));

// A global root path variable
//  http://stackoverflow.com/questions/10265798/determine-project-root-from-a-running-node-js-application
global.appRoot = path.resolve(__dirname);

// Initialize all the models.
require("./models/model");

Log.I("Finished initializing the database.");

Log.I("\n" + "=".repeat(process.stdout.columns));

require("./router")(app);

hbs.registerPartials(__dirname + "/views/templates");

hbs.registerHelper("json", function(obj) {
  return JSON.stringify(obj);
});

hbs.registerHelper("jsonpp", function(obj) {
  return JSON.stringify(obj, null, 2);
});

app.set("view options", { layout: "layouts/main" });
app.set("views", path.join(__dirname, "views"));

app.set("view engine", "hbs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/static/uploads", express.static("uploads"));
app.use("/static/bootstrap", express.static("bootstrap"));
app.use("/static", express.static("static"));
app.use("/ocr", express.static("/tmp/ocr"));

var server = app.listen(config.get("express.port"), function() {
  var port = server.address().port;

  Log.I("Listening on port %s", port);
  Log.I("Server initialized.");

  Log.I("\n" + "=".repeat(process.stdout.columns));
});

