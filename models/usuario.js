const mongoose = require('mongoose');

let usuarioSchema = new mongoose.Schema({
login: {
    type: String,
    minlength: 4,
    required: true
},
password: {
    type: String,
    required: true,
    minlength: 7
}
});

let Usuario = mongoose.model('usuarios', usuarioSchema);
module.exports = Usuario;