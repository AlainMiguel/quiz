// Importar modelo BD
var models = require('../models/models.js');

// Autoload
exports.load = function(req, res, next, quizId) {
	models.Quiz.find(quizId).then(
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
			res.render('quizes/index', {quizes: quizes, search: search, errors: []});
		}).catch(function(error) { next(error); });
	} else { // Buscar preguntas con texto
		models.Quiz.findAll( {where:["pregunta LIKE ?", '%' + search.replace(/ /g, '%') + '%'], order:"pregunta"} ).then(function(quizes) {
			res.render('quizes/index', {quizes: quizes, search: search, errors: []});
		}).catch(function(error) { next(error); });
	}
}

// GET /quizes/quizes/:id
exports.show = function (req, res, next) {
	models.Quiz.find(req.params.quizId).then(function(quiz) {
		res.render('quizes/show', {quiz:req.quiz, errors: []});
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
		var quiz = models.Quiz.build({pregunta: "", respuesta: ""});

		res.render('quizes/new', {quiz: quiz, errors: []});
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
				res.render('quizes/new', {quiz: quiz, errors: err.errors})
			} else { // Guarda en la BD el nuevo quiz
				quiz.save({fields: ["pregunta", "respuesta"]}).then(function(){
					// Redireccion a lista de preguntas
					res.redirect('/quizes');
				});
			}
		}
	);
}
