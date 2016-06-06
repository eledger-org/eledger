var HomeController = require('./controllers/HomeController');
var FilesController = require('./controllers/FilesController');
var ProofsController = require('./controllers/ProofsController');

var jsonParser = require('body-parser').json();

module.exports = function(app) {
  app.get('/', HomeController.Index);
  app.get('/other', HomeController.Other);
  app.get('/file-upload', FilesController.Index);
  app.get('/proofs', ProofsController.Index);
  app.get('/proofs/:id', ProofsController.ProofById);
  app.put('/api/proofs/:id', jsonParser, ProofsController.SaveById);
  app.get('/api/get-file/:id', FilesController.GetFile);
};
