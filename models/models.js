// Modelo de datos

var path = require('path');

// Cargar modelo ORM
var Sequelize = require('sequelize');

// Usar BD SQLite
var sequelize = new Sequelize(null, null, null, {dialect: "sqlite", storage: "quiz.sqlite"});

// Importar definición de tabla Quiz de fichero quiz.js
var Quiz = sequelize.import(path.join(__dirname, 'quiz'));

// Exportar definición de la tabla Quiz
exports.Quiz = Quiz;

// Crear e inicializar la tabla de preguntas en la BD
sequelize.sync().success(function() {
	Quiz.count().success(function (count) {
		if (count === 0) { // Inicializar si la tabla está vacía
			Quiz.create({pregunta: 'Capital de Italia', respuesta: 'Roma'})
				.success(function() { console.log('BD inicializada'); });
		};
	});
});


