const express = require('express');
const Usuario = require('../models/usuario');
let router = express.Router();

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/habitaciones');
});

router.post('/login', (req, res) => {
    let usuario = new Usuario({
        login: req.body.login,
        password: req.body.password
    });

    Usuario.findOne({login: usuario.login, password: usuario.password}).then((resultado) => {
        if(resultado){
            req.session.usuario = resultado.login;
            res.redirect('/habitaciones');
        }
        else{
            res.render('login', {error: 'Usuario o contraseña incorrectos. Inténtelo de nuevo.'});
        }
    }).catch((error) => {
        res.render('login', {error: 'Usuario o contraseña incorrectos. Inténtelo de nuevo.'});
    });
});

module.exports = router;