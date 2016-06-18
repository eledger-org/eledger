"use strict";

var FilesController         = require("./controllers/FilesController");
var LedgersController       = require("./controllers/LedgersController");
var ProofsController        = require("./controllers/ProofsController");

var jsonParser = require("body-parser").json();

module.exports = function(app) {
  /* Files API */
  app.get ("/api/get-file/:id", FilesController.api.GetFile);
  app.post("/api/upload/:file", FilesController.api.Upload);

  /* Files Web */
  app.get ("/file-upload", FilesController.Index);

  /* Proofs Web */
  app.get ("/proofs", ProofsController.Index);
  app.get ("/proofs/:id", ProofsController.ProofById);
  app.get ("/api/proofs/next", ProofsController.NextProof);
  app.put ("/api/proofs/:id", jsonParser, ProofsController.SaveById);

  /* Accounting Web */
  app.get ("/ledgers/views/pro", LedgersController.LedgersViewsPro);
};
