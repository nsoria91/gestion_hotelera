const mongoose = require('mongoose');

let incidenciasSchema = new mongoose.Schema({
    descripcion: {
        type: String,
        required: [true, 'Es obligatorio introducir la descripción de la incidencia.'],
    },
    fechaInicio: {
        type: Date,
        required: [true, 'Es obligatorio introducir la fecha de inicio de la incidencia.'],
        default: Date.now()
    },
    fechaFin: {
        type: Date
    },
    imagen:{
        type: String,
    }
});

let habitacionSchema = new mongoose.Schema({
numero: {
    type: Number,
    required: [true, 'Es obligatorio introducir un número de habitación.'],
    min: [1, 'El número mínimo permitido es 1.'],
    max: [100, 'El número máximo permitido es 100.']
},
tipo: {
    type: String,
    enum: ["individual", "doble", "familiar", "suite"]
},
descripcion: {
    type: String,
    required: [true, 'Es obligatorio introducir la descripción de la habitación.']
},
ultimaLimpieza:{
    type: Date,
    required: [true, 'Es obligatorio introducir la última limpieza de la habitación.'],
    default: Date.now()
},
precio:{
    type: Number,
    required: [true, 'Es obligatorio introducir el precio de la habitación.'],
    min: [0, 'El precio mínimo permitido es 0 euros.'],
    max: [250, 'El precio máximo permitido es 250 euros.']
},
imagen:{
    type: String,
},
incidencias: [incidenciasSchema]
});

let Habitacion = mongoose.model('habitaciones', habitacionSchema);
module.exports = Habitacion;