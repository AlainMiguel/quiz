// Modelo de datos

var path = require('path');

// Postgres DATABASE_URL = postgres://user:passwd@host:port/database
// SQLite   DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name  = (url[6]||null);
var user     = (url[2]||null);
var pwd      = (url[3]||null);
var protocol = (url[1]||null);
var dialect  = (url[1]||null);
var port     = (url[5]||null);
var host     = (url[4]||null);
var storage  = process.env.DATABASE_STORAGE;

// Cargar modelo ORM
var Sequelize = require('sequelize');

// Usar BD SQLite o Postgresql
var sequelize = new Sequelize(DB_name, user, pwd, 
  { dialect:  protocol,
    protocol: protocol,
    port:     port,
    host:     host,
    storage:  storage,  // solo SQLite (.env)
    omitNull: true      // solo Postgres
  }      
);

// Importar definición de tabla Quiz de fichero quiz.js
var Quiz = sequelize.import(path.join(__dirname, 'quiz'));

// Exportar definición de la tabla Quiz
exports.Quiz = Quiz;

// Crear e inicializar la tabla de preguntas en la BD
sequelize.sync().then(function() {
	Quiz.count().then(function (count) {
		if (count === 0) { // Inicializar si la tabla está vacía			
			Quiz.create({pregunta: 'Capital de Italia', respuesta: 'Roma'});
			Quiz.create({pregunta: 'Capital de Portugal', respuesta: 'Lisboa'})
				.then(function() { console.log('BD inicializada'); });
		};
	});
});
