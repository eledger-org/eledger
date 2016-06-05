var HomeController = require('./controllers/HomeController');
var FileController = require('./controllers/FileController');

module.exports = function(app) {
  app.get('/', HomeController.Index);
  app.get('/other', HomeController.Other);
  app.get('/file-upload', FileController.Index);
  app.get('/api/get-file/:id', FileController.GetFile);
};
