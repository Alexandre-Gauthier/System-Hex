const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

const userLog = require('./models/basic-auth').auth;
const db = require("./models/db");

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());
app.use(express.static('public'));

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

let sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/crossroad');
    } else {
        next();
    }
};

// Route

app.get('/', sessionChecker, (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/crossroad');
    } else {
        res.redirect('/login');
    }
});

app.route('/login')
    .get(sessionChecker, (req, res) => {
        res.sendFile(__dirname + '/public/login.html');
	})

    .post((req, res) => {
        var username = req.body.username,
			password = req.body.password;

		userLog(username,password,(user)=>{
            if (!user) {
                res.redirect('/login');
            }else{
                req.session.user = user;
                req.session.rand = Math.random()*100;
                res.redirect('/crossroad');
            }
        });
	});

// route for user logout
app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

app.get('/crossroad', (req, res) => {
	if (req.session.user && req.cookies.user_sid) {
		res.sendFile(__dirname + '/public/crossroad.html');
	} else {
		res.redirect('/login');
	}
});

app.get('/chooseSystem', (req, res) => {
	if (req.session.user && req.cookies.user_sid) {
		res.sendFile(__dirname + '/public/chooseSystem.html');
	} else {
		res.redirect('/login');
	}
});

app.get('/chooseSystemData', (req, res) => {
	if (req.session.user && req.cookies.user_sid) {
        db.getSystems(req.session.user.id,(systems)=>{
            res.json(systems);
        });
	} else {
		res.redirect('/login');
	}
});

app.post('/systemChoice', (req,res) =>{
    if (req.session.user && req.cookies.user_sid) {
        db.getSystem(req.session.user.id,req.body.system,(system)=>{
            req.session.system = system;
            res.sendFile(__dirname + '/public/dashboard.html');
        });
	} else {
		res.redirect('/login');
	}
});

app.get('/systemChoiceData',(req, res) => {
	if (req.session.user && req.cookies.user_sid && req.session.system) {
        res.json(req.session.system);
	} else {
		res.redirect('/chooseSystem');
	}
});

db.initDb(function(err){
	const server = app.listen(port, function () {
		console.log('Server listening on port ' + port);
	});
});
