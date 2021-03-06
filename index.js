const express = require('express'),
	morgan = require('morgan'),
	mongoose = require('mongoose'),
	Models = require('./models.js'),
	bodyParser = require('body-parser'),
	cors = require('cors');

const { check, validationResult } = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;

// mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);

const app = express();

//Log requests using Morgan middleware
app.use(morgan('common'));

app.use(bodyParser.json());

app.use(cors());

/**
 * Additional documentation for API calls and responses provided at:
 * https://bchanmyflix.herokuapp.com/documentation.html
 */

/**
 * Import auth.js file for api call to login endpoint and authentication
 */
let auth = require('./auth')(app);

//Require Passport module and import passport.js file
const passport = require('passport');
require('./passport');

/**
 * API call to homepage
 */
app.get('/', (req, res) => {
	res.send('Welcome to myFlix!');
});

/**
 * API call to return information about all movies
 */
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
	Movies.find()
		.then((movies) => {
			res.status(201).json(movies);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

//Return all users - for testing only
// app.get('/usersList', (req, res) => {
// 	Users.find()
// 		.then((users) => {
// 			res.status(201).json(users);
// 		})
// 		.catch((err) => {
// 			console.error(err);
// 			res.status(500).send('Error: ' + err);
// 		});
// });

/**
 * API call to return information about a movie by title
 */
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
	Movies.findOne({ Title: req.params.Title })
		.then((movie) => {
			res.json(movie);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

/**
 * API call to return information about a genre by genre name
 */
app.get('/movies/genres/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
	Movies.findOne({ 'Genre.Name': req.params.Name })
		.then((movie) => {
			res.json(movie.Genre);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

/**
 * API call to return information about a director by director name
 */
app.get('/movies/directors/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
	Movies.findOne({ 'Director.Name': req.params.Name })
		.then((movie) => {
			res.json(movie.Director);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

/**
 * API call to return user details by username
 */
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.findOne({ Username: req.params.Username })
		.then((user) => {
			res.json(user);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

/**
 * API call to create a new user
 */
app.post('/users', [check('Username', 'Username must be at least 6 characters long').isLength({ min: 6 }), check('Username', 'Username contains non alphanumeric characters').isAlphanumeric(), check('Password', 'Password must be at least 6 characters long').isLength({ min: 6 }), check('Email', 'Email does not appear to be valid').isEmail()], (req, res) => {
	let errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	}

	let hashedPassword = Users.hashPassword(req.body.Password);
	Users.findOne({ Username: req.body.Username })
		.then((user) => {
			if (user) {
				return res.status(400).send(req.body.Username + 'already exists');
			} else {
				Users.create({
					Username: req.body.Username,
					Password: hashedPassword,
					Email: req.body.Email,
					Birthday: req.body.Birthday,
				})
					.then((user) => {
						res.status(201).json(user);
					})
					.catch((error) => {
						console.error(error);
						res.status(500).send('Error: ' + error);
					});
			}
		})
		.catch((error) => {
			console.error(error);
			res.status(500).send('Error: ' + error);
		});
});

/**
 * API call to update a user's information
 */
app.put('/users/:Username', [check('Username', 'Username must be at least 6 characters long').isLength({ min: 6 }), check('Username', 'Username contains non alphanumeric characters').isAlphanumeric(), check('Password', 'Password must be at least 6 characters long').isLength({ min: 6 }), check('Email', 'Email does not appear to be valid').isEmail()], passport.authenticate('jwt', { session: false }), (req, res) => {
	let errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	}

	let hashedPassword = Users.hashPassword(req.body.Password);
	Users.findOneAndUpdate(
		{ Username: req.params.Username },
		{
			$set: {
				Username: req.body.Username,
				Password: hashedPassword,
				Email: req.body.Email,
				Birthday: req.body.Birthday,
			},
		},
		{ new: true }
	)
		.then((updatedUser) => {
			res.status(201).json(updatedUser);
		})
		.catch((error) => {
			console.error(error);
			res.status(500).send('Error: ' + error);
		});
});

/**
 * API call to add a movie to a user's list of favorites
 */
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.findOneAndUpdate(
		{ Username: req.params.Username },
		{
			$push: {
				FavoriteMovies: req.params.MovieID,
			},
		},
		{ new: true }
	)
		.then((updatedUser) => {
			res.status(201).json(updatedUser);
		})
		.catch((error) => {
			console.error(error);
			res.status(500).send('Error: ' + error);
		});
});

/**
 * API call to remove a movie from a user's list of favorites
 */
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.findOneAndUpdate(
		{ Username: req.params.Username },
		{
			$pull: {
				FavoriteMovies: req.params.MovieID,
			},
		},
		{ new: true }
	)
		.then((updatedUser) => {
			res.status(201).json(updatedUser);
		})
		.catch((error) => {
			console.error(error);
			res.status(500).send('Error: ' + error);
		});
});

/**
 * API call to delete a user's account
 */
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.findOneAndRemove({ Username: req.params.Username })
		.then((user) => {
			if (!user) {
				res.status(400).send(req.params.Username + ' was not found.');
			} else {
				res.status(200).send(req.params.Username + ' was deleted.');
			}
		})
		.catch((error) => {
			console.error(error);
			res.status(500).send('Error: ' + error);
		});
});

app.use(express.static('public'));

//Error handling
// app.use((err, req, res, next) => {
// 	console.error(err.stack);
// 	res.status(500).send('Something broke!');
// });

//listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
	console.log('Listening on port ' + port);
});
