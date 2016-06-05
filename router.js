var HomeController = require('./controllers/HomeController');
var FilesController = require('./controllers/FilesController');

module.exports = function(app) {
  app.get('/', HomeController.Index);
  app.get('/other', HomeController.Other);
  app.get('/file-upload', FilesController.Index);
  app.get('/api/get-file/:id', FilesController.GetFile);
};
