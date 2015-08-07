// Importar modelo BD
var models = require('../models/models.js');


// Autoload de comentarios :commentId
exports.load = function(req, res, next, commentId) {
	models.Comment.find({
			where: {id: Number(commentId)}
		}).then(function(comment) {
			if(comment) {
				req.comment = comment;
				next();
			} else {
				next(new Error('No existe commentId='+commentId));
			}
		}).catch(function(error){next(error)});
}

// GET /quizes/:quizId/comments/new
exports.new = function (req, res, next) {
	var quiz = req.quiz;
	res.render('comments/new', {quizid: req.params.quizId, quiz: quiz, errors: []});
}

// POST /quizes/:quizId/comments
exports.create = function (req, res, next) {
	// Crea objeto Comment
	var comment = models.Comment.build(
		{ texto: req.body.comment.texto, 
			QuizId: req.params.quizId }
	);

	// Guarda en la BD el nuevo comment
	comment.validate().then( 
		function(err) {
			if (err) {
				res.render('comments/new', {comment: comment, quizid: req.params.quizId, errors: err.errors})
			} else { // Guarda en la BD el nuevo comment
				comment.save().then(function(){
					// Redireccion a pregunta con lista de comentarios
					res.redirect('/quizes/'+req.params.quizId);
				});
			}
		}
	);
}

// get /quizes/:quizId/comments/:commentId/publish
exports.publish =  function(req, res) {
	req.comment.publicado = true;

	req.comment.save( {fields: ["publicado"]})
		.then( function(){ res.redirect('/quizes/'+req.params.quizId);})
		.catch(function(error){next(error)});
}
