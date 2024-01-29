const mongoose = require('mongoose');
const express = require('express');
const nunjucks = require('nunjucks');
const dateFilter = require('nunjucks-date-filter');
const dotenv = require('dotenv');
const methodOverride = require('method-override');
const session = require('express-session');
dotenv.config();

// Enrutadores
const Habitacion = require(__dirname + '/routes/habitaciones');
const Limpieza = require(__dirname + '/routes/limpiezas');
const auth = require(__dirname + '/routes/auth');

mongoose.connect(process.env.RUTA);

let app = express();

let env = nunjucks.configure('views', {
  autoescape: true,
  express: app
});

env.addFilter('date', dateFilter);

app.set('view engine', 'njk');

app.use('/public', express.static(__dirname + '/public'));

// Carga de middleware y enrutadores
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(session({
  secret: '1234',
  resave: true,
  saveUninitialized: false,
  expires: new Date(Date.now() + 3600000)
}));
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
}));
// A cada enrutador se le indica una ruta base
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/habitaciones', Habitacion);
app.use('/limpiezas', Limpieza);
app.use('/auth', auth);

//Puesta en marcha del servidor en el puerto 8080
app.listen(process.env.PUERTO);
