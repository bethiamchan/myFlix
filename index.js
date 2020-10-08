const express = require('express'),
    morgan = require('morgan');
const app = express();

let topMovies = [
    {
        title: 'Pride and Prejudice',
        director: 'Joe Wright',
        genre: ['Drama', 'Romance'],
        released: 2005,
        starring: ['Keira Knightley', 'Matthew Macfadyen', 'Rosamund Pike']
    },
    {
        title: 'Emma',
        director: 'Autumn de Wilde',
        genre: ['Comedy', 'Drama', 'Romance'],
        released: 2020,
        starring: ['Anya Taylor-Joy', 'Mia Goth', 'Johnny Flynn', 'Bill Nighy']
    },
    {
        title: 'Sense and Sensibility',
        director: 'Ang Lee',
        genre: ['Drama', 'Romance'],
        released: 1995,
        starring: ['Emma Thompson', 'Kate Winslet', 'Hugh Grant', 'Alan Rickman']
    },
    {
        title: 'Love and Friendship',
        director: 'Whit Stillman',
        genre: ['Comedy', 'Drama', 'Romance'],
        released: 2016,
        starring: ['Kate Beckinsale', 'Morfydd Clark', 'Chloe Sevigny']
    },
    {
        title: 'Little Women',
        director: 'Greta Gerwig',
        genre: ['Drama', 'Romance'],
        released: 2019,
        starring: ['Saoirse Ronan', 'Emma Watson', 'Florence Pugh', 'Laura Dern', 'Timothee Chalamet', 'Meryl Streep']
    },
    {
        title: 'Enola Holmes',
        director: 'Harry Bradbeer',
        genre: ['Adventure', 'Drama', 'Crime'],
        released: 2020,
        starring: ['Millie Bobby Brown', 'Henry Cavill', 'Sam Claflin', 'Helena Bonham Carter']
    },
    {
        title: 'Ladies in Black',
        director: 'Bruce Beresford',
        genre: ['Comedy', 'Drama', 'Romance'],
        released: 2018,
        starring: ['Julia Ormond', 'Angourie Rice', 'Rachael Taylor']
    },
    {
        title: 'Belle',
        director: 'Amma Asante',
        genre: ['Biography', 'Drama', 'Romance'],
        released: 2013,
        starring: ['Gugu Mbatha-Raw', 'Matthew Goode', 'Emily Watson']
    },
    {
        title: 'The Help',
        director: 'Tate Taylor',
        genre: ['Drama'],
        released: 2011,
        starring: ['Emma Stone', 'Viola Davis', 'Octavia Spencer']
    },
    {
        title: 'Hidden Figures',
        director: 'Theodore Melfi',
        genre: ['Biography', 'Drama', 'History'],
        released: 2016,
        starring: ['Taraji P. Henson', 'Octavia Spencer', 'Janelle Monae', 'Kevin Costner', 'Jim Parsons', 'Mahershala Ali']
    },
];

//Log requests using Morgan middleware
app.use(morgan('common'));

//GET requests
app.get('/movies', (req, res) => {
    res.json(topMovies);
});

app.get('/', (req, res) => {
    res.send('Welcome to my movie club!');
});

app.use(express.static('public'));

//Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

//listen for requests
app.listen(8080, () =>
    console.log('Your app is listening on port 8080.')
);