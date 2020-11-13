const jwtSecret = 'your_jwt_secret';

const jwt = require('jsonwebtoken'),
	passport = require('passport');

require('./passport');

let generateJWTToken = (user) => {
	return jwt.sign(user, jwtSecret, {
		subject: user.Username,
		expiresIn: '7d',
		algorithm: 'HS256',
	});
};

module.exports = (router) => {
	router.post('/login', (req, res) => {
		passport.authenticate('local', { session: false }, (error, user) => {
			if (!user) {
				return res.status(400).json({
					message: 'Invalid username and/or password',
					user: user,
				});
			}
			if (error) {
				return res.status(500).send(error)
			}

			req.login(user, { session: false }, (error) => {
				if (error) {
					res.send(error);
				}
				let token = generateJWTToken(user.toJSON());
				return res.json({ user, token });
			});
		})(req, res);
	});
};
