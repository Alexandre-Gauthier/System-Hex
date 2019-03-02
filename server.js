const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

const userLog = require('./models/basic-auth').auth;
const initDb = require("./models/db").initDb;
const getDb = require("./models/db").getDb;
const getUsers = require("./models/db").getUsers;

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use(cookieParser());

app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');
    }
    next();
});

var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/observation');
    } else {
        next();
    }
};

app.get('/', sessionChecker, (req, res) => {
    res.redirect('/login');
});

app.route('/login')
    .get(sessionChecker, (req, res) => {
        res.sendFile(__dirname + '/public/login.html');
	})

    .post((req, res) => {
        var username = req.body.username,
			password = req.body.password;
		console.log('here')

		let user = userLog(username,password);
		console.log(user)
		if (!user) {
			res.redirect('/login');
		}else{
			req.session.user = user;
			res.redirect('/observation');
		}
    });

app.get('/observation', (req, res) => {
	if (req.session.user && req.cookies.user_sid) {
		res.sendFile(__dirname + '/public/observation.html');
	} else {
		res.redirect('/login');
	}
});

initDb(function(err){
	const server = app.listen(port, function () {
		console.log('Server listening on port ' + port);
	});
});
