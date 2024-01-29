const multer = require('multer');

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads/habitaciones')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
});

let storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/incidencias')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

let upload = multer({storage: storage});

let upload2 = multer({storage: storage2});

module.exports = {
    upload: upload,
    upload2: upload2
};
