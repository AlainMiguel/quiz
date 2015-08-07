// MW de auth a partes restringuidas a usuarios autenticados
exports.loginRequired = function (req, res, next) {
	if (req.session.user) {
		next();
	} else {
		res.redirect('/login');
	}
}

// GET /login
exports.new = function (req, res) {
	var errors = req.session.errors || {};
	req.session.errors = {};
	res.render('sessions/new', {errors: errors});
}

// POST /login
exports.create = function (req, res) {
	var login = req.body.login;
	var password = req.body.password;

	var userController = require('./user_controller');
	userController.autenticar(login, password, function(error, user) {
		if (error) { // Si hay error en el inicio de session lo retornamos
			req.session.errors = [{"message": "Se ha producido un error: " + error}];
			res.redirect('/login');
			return;
		}

		// Crear req.session.user y guardar id y username
		// La sesión se define por la existencia de  req.session.user
		req.session.user = {id: user.id, username: user.username};

		// Redirección a path anterior a login
		res.redirect(req.session.redir.toString());
		}
	);
}

// DELETE /logout
exports.destroy = function (req, res) {
	delete req.session.user;

	// Redireción a path anterior a login
	res.redirect(req.session.redir.toString());
}
