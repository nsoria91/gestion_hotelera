const express = require('express');
const { autenticacion } = require('../utils/auth');

const upload = require(__dirname + '/../utils/uploads.js');
const upload2 = require(__dirname + '/../utils/uploads.js');
let Habitacion = require(__dirname + '/../models/habitacion.js');
let Limpieza = require(__dirname + '/../models/limpieza.js');

let router = express.Router();

// Obtener un listado de todas las habitaciones
router.get('/', (req, res) => {
    Habitacion.find().then(resultado => {
        if(resultado.length > 0){
            res.render('habitaciones_listado', {habitaciones: resultado});
        }
        else{
            res.render('error', {error: 'Error listando habitaciones.'});
        }
    }).catch((error => {
        res.render('error', {error: 'Error listando habitaciones.'});
    }));
});

// Formulario de nueva habitación
router.get('/nueva', autenticacion, (req, res) => {
    res.render('habitaciones_nueva');
});

// Formulario de edición de una habitación
router.get('/editar/:id', autenticacion, (req, res) => {
    Habitacion.findById(req.params.id).then(resultado => {
        if(resultado){
            res.render('habitaciones_edicion', {habitacion: resultado});
        }
        else{
            res.render('error', {error: 'No existe el número de habitación.'});
        }
    }).catch (error => {
        res.render('error', {error: 'No existe el número de habitación.'});
    }); 
});

// Obtener detalles de una habitación específica (id)
router.get('/:id', (req, res) => {
    Habitacion.findById(req.params.id).then(resultado => {
        if(resultado){
            res.render('habitaciones_ficha', {habitacion: resultado});
        }
        else{
            res.render('error', {error: 'No existe el número de habitación.'});
        }
    }).catch (error => {
        res.render('error', {error: 'No existe el número de habitación.'});
    }); 
});

// Insertar una nueva habitación
router.post('/', upload.upload.single('imagen'), (req, res) => {
    let nuevaHabitacion = new Habitacion({
        numero: req.body.numero,
        tipo: req.body.tipoHabitacion,
        descripcion: req.body.descripcion,
        ultimaLimpieza: Date.now(),
        precio: req.body.precio
    });

    if(req.file){
        nuevaHabitacion.imagen = req.file.filename;
    }

    nuevaHabitacion.save().then(resultado => {
        res.redirect(req.baseUrl);
    }).catch(error => {
        let errores = {
            general: "Error en la aplicación",
        }

        if(error.errors.numero){
            errores.numero = error.errors.numero;
        }

        if(error.errors.precio){
            errores.precio = error.errors.precio;
        }

        if(error.errors.descripcion){
            errores.descripcion = error.errors.descripcion;
        }
        res.render('habitaciones_nueva', {errores: errores});
    });
});

// Actualizar TODAS las últimas limpiezas
router.put('/ultimaLimpieza', (req, res) => {
    Habitacion.find().then(habitaciones => {
        if(habitaciones.length > 0){
            habitaciones.forEach(habitacion => {
                Limpieza.findOne({idHabitacion: habitacion.id}).sort({fechaHora: -1}).then(resultadoLimpieza => {
                    habitacion.ultimaLimpieza = resultadoLimpieza.fechaHora;
                    habitacion.save().catch(error => {
                        res.status(400).send({error: "Error actualizando limpieza."});
                    });
                }).catch(error => {
                    res.status(400).send({error: "Error actualizando limpieza."});
                });
            });
            res.status(200).send({resultado: habitaciones});
        }
        else{
            res.status(400).send({error: "Error actualizando la limpieza."});
        }
    }).catch(error => {
        res.status(400).send({error: "Error actualizando la limpieza."});
    });
});

// Actualizar una habitación
router.post('/editar/:id', upload.upload.single('imagen'), autenticacion, (req, res) => {
    Habitacion.findById(req.params.id).then(habitacion => {
        if(habitacion){
            habitacion.numero = req.body.numero;
            habitacion.tipo = req.body.tipoHabitacion;
            habitacion.descripcion = req.body.descripcion;
            habitacion.precio = req.body.precio;

            if(req.file){
                habitacion.imagen = req.file.filename;
            }

            habitacion.save().then(resultado => {
                res.redirect(req.baseUrl + '/' + req.params.id);
            })
        }
        else{
            res.render('error', {error: 'No se ha encontrado esa habitación.'});
        }
    }).catch (error => {
        res.render('error', {error: 'No existe el número de habitación.'});
    });
});

// Eliminar una habitación
router.delete('/:id', autenticacion, (req, res) => {
    Habitacion.findByIdAndRemove(req.params.id).then(resultado => {
        if (resultado){
            Limpieza.deleteMany({idHabitacion: req.params.id}).then(() => {
                res.redirect(req.baseUrl);
            });
        }
        else{
            res.render('error', {error: 'Error eliminando la habitación.'});
        }
    }).catch(error => {
        res.render('error', {error: 'Error eliminando la habitación.'});
    });
});

//Añadir una incidencia en una habitación
router.post('/:id/incidencias', autenticacion, upload2.upload2.single('imagen'), (req, res) =>{
    let nuevaIncidencia = {
        descripcion: req.body.descripcion,
        fechaFin: null,
    };

    if(req.file){
        nuevaIncidencia.imagen = req.file.filename;
    }

    Habitacion.findByIdAndUpdate(req.params.id, {
        $push: {
            incidencias: nuevaIncidencia
        }
    }, {new: true}).then(resultado => {
        if(resultado){
            res.redirect(req.baseUrl + '/' + req.params.id);
        }
        else{
            res.render('error', {error: 'Error añadiendo la incidencia.'});
        }
    }).catch(error => {
        res.render('error', {error: 'Error añadiendo la incidencia.'});
    });
});


//Actualizar el estado de una incidencia de una habitación
router.put('/:idH/incidencias/:idI', autenticacion, (req, res) =>{
    Habitacion.findById(req.params.idH).then(hab =>{
        if(hab){
            hab.incidencias.forEach(incidencia => {
                if(incidencia.id == req.params.idI){
                    incidencia.fechaFin = Date.now();
                    hab.save().then(resultado =>{
                        res.redirect(req.baseUrl + '/' + req.params.idH);
                    }).catch(error => {
                        res.render('error', {error: 'No se ha podido cerrar la incidencia.'});
                    });
                }
            });
        }
        else{
            res.status(400).send({error: "Habitación no encontrada."});
        }
    }).catch(error =>{
        res.status(400).send({error: "Incidencia no encontrada."});
    });
});

module.exports = router;