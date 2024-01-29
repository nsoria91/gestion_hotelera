const express = require('express');
const { autenticacion } = require('../utils/auth');

let Limpieza = require(__dirname + '/../models/limpieza');
let Habitacion = require(__dirname + '/../models/habitacion.js');

let router = express.Router();

// Actualizar una limpieza
router.post('/:id', (req, res) => {
    if(req.params.id){
        let nuevaLimpieza = new Limpieza({
            idHabitacion: req.params.id,
            fechaHora: req.body.fecha,
        });

        if(req.body.observa){
            nuevaLimpieza.observaciones = req.body.observa;
        }

        nuevaLimpieza.save().then(resultado => {
            if(resultado){
                Habitacion.findById(req.params.id).then(habitacion => {
                    Limpieza.find({idHabitacion: habitacion.id}).sort({fechaHora: -1}).then(resultadoLimpieza => {
                        habitacion.ultimaLimpieza = resultadoLimpieza[0].fechaHora;
                        habitacion.save().then(()=>{
                            res.render('limpiezas_listado', {limpiezas: resultadoLimpieza, habitacion: habitacion});
                        });
                    }).catch(error => {
                        res.render('error', {error: 'Error actualizando la limpieza.'});
                    });
                }).catch(error => {
                    res.render('error', {error: 'Error actualizando la limpieza.'});
                });
            }
        }).catch(error => {
            res.render('error', {error: 'Error actualizando la limpieza.'});
        });
    }
    else{
        res.render('error', {error: 'Error actualizando la limpieza.'});
    }
});

// Obtener limpiezas de una habitación
router.get('/:id', (req, res) => {
    Limpieza.find({idHabitacion: req.params.id}).sort({fechaHora: -1}).then(resultado => {
        Habitacion.findById(req.params.id).then(resultado2 => {
            res.render('limpiezas_listado', {limpiezas: resultado, habitacion: resultado2});
        }).catch(error=>{
            res.render('error', {error: 'No se ha encontrado la habitación solicitada.'});
        });
    }).catch (error => {
        res.render('error', {error: 'No se han encontrado limpiezas para esa habitación.'});
    });
});

// Acceder al formulario de nueva limpieza
router.get('/nueva/:id', autenticacion, (req, res) => {
    Habitacion.findById(req.params.id).then(habitacion => {
        let fechaActual = new Date();
        let anyo = fechaActual.getFullYear();
        let mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
        let dia = fechaActual.getDate();
        res.render('limpiezas_nueva', {habitacion: habitacion, anyo: anyo, mes: mes, dia: dia});
    }).catch(error => {
        res.render('error', {error: 'No se ha encontrado la habitación solicitada.'});
    });
});

module.exports = router;