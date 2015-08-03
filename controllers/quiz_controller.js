// Importar modelo BD
var models = require('../models/models.js');

// Temas de las preguntas
// Mejor pudiera estar en la BD, pero las relaciones entre tablas es asunto del tema 9
// Ya llegaré allá
var temas = {otro: 'Otro', humanidades: 'Humanidades', ocio: 'Ocio', ciencia: 'Ciencia', tecnologia: 'Tecnología'};

// Autoload
exports.load = function(req, res, next, quizId) {
	models.Quiz.find({
		where: { id: Number(quizId) },
		include: [{ model: models.Comment }]
	}).then(
		function(quiz) {
			if (quiz) {
				req.quiz = quiz;
				next();
			} else {
				next(new Error('No existe quiId=' + quizId));
			}
		}
	).catch(function(error) { next(error); });
};

// GET /quizes
exports.index = function (req, res, next) {
	var search = req.query.search || '';

	if (search === '') { // Listar todas las preguntas
		models.Quiz.findAll().then(function(quizes) {
			res.render('quizes/index', {quizes: quizes, search: search, temas: temas, errors: []});
		}).catch(function(error) { next(error); });
	} else { // Buscar preguntas con texto
		models.Quiz.findAll( {where:["pregunta LIKE ?", '%' + search.replace(/ /g, '%') + '%'], order:"pregunta"} )
		.then(function(quizes) {
			res.render('quizes/index', {quizes: quizes, search: search, temas: temas, errors: []});
		}).catch(function(error) { next(error); });
	}
}

// GET /quizes/quizes/:id
exports.show = function (req, res, next) {
	models.Quiz.find(req.params.quizId).then(function(quiz) {
		res.render('quizes/show', {quiz: req.quiz, temas: temas, errors: []});
	});
}

// GET /quizes/:id/answer
exports.answer = function (req, res, next) {
	models.Quiz.find(req.params.quizId).then(function(quiz) {
		if (req.query.respuesta === req.quiz.respuesta) {
			res.render('quizes/answer', {quiz: quiz, respuesta: 'Correcto', errors: []});
		} else {
			res.render('quizes/answer', {quiz: req.quiz, respuesta: 'Incorrecto', errors: []});
		}
	});
}

// GET /quizes/new
exports.new = function (req, res, next) {
	models.Quiz.find(req.params.quizId).then(function(quiz) {
		// Crea objeto Quiz
		var quiz = models.Quiz.build({pregunta: "", respuesta: "", tema: "otro"});

		res.render('quizes/new', {quiz: quiz, accion: 'Añadir', errors: []});
	});
}

// POST /quizes/create
exports.create = function (req, res, next) {
	// Crea objeto Quiz
	var quiz = models.Quiz.build( req.body.quiz );

	// Guarda en la BD el nuevo quiz
	quiz.validate().then( 
		function(err) {
			if (err) {
				res.render('quizes/new', {quiz: quiz, accion: "Añadir", errors: err.errors})
			} else { // Guarda en la BD el nuevo quiz
				quiz.save({fields: ["pregunta", "respuesta", "tema"]}).then(function(){
					// Redireccion a lista de preguntas
					res.redirect('/quizes');
				});
			}
		}
	);
}

// GET /quizes/quizes/:id/edit
exports.edit = function (req, res, next) {
	// Cargar instancia de quiz
	var quiz = req.quiz;

	res.render('quizes/edit', {quiz:quiz, accion: 'Actualizar', errors: []});
}

// PUT /quizes/:id
exports.update = function (req, res, next) {
	req.quiz.pregunta = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;
	req.quiz.tema = req.body.quiz.tema;

	// Valida y actualiza en la BD el quiz
	req.quiz.validate().then( 
		function(err) {
			if (err) {
				res.render('quizes/edit', {quiz: req.quiz, accion: 'Actualizar', errors: err.errors})
			} else { // Guarda en la BD el quiz
				req.quiz.save({fields: ["pregunta", "respuesta", "tema"]}).then(function(){
					// Redireccion a lista de preguntas
					res.redirect('/quizes');
				});
			}
		}
	);
}

// DELETE /quizes/:id
exports.destroy = function (req, res, next) {
	req.quiz.destroy().then( 
		function() {
			// Redireccion a lista de preguntas
			res.redirect('/quizes');
		}
	).catch(function(error){ next(error) });
}
