const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

const userLog = require('./models/basic-auth').auth;
const MongoDB = require("./models/db");
const db = new MongoDB();


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

app.post('/updateAttribute', (req,res)=>{
    if (req.session.user && req.cookies.user_sid) {
        updateAttributes(req,res,(item)=>{
            let system = req.session.system;
            switch(req.body.action){
            case 'delete':
                item.attributes.splice(findElement(item.attributes,'name',req.body.data.keyAttribute,false),1);
                break;
            case 'deleteEffect':
                system.effects.splice(findElement(system.effects,'name',req.body.keyToken,false),1);
                break;
            case 'deleteToken':
                system.tokens.splice(findElement(system.tokens,'name',req.body.keyToken,false),1);
                break;
            case 'add':
                if(!findElement(item.attributes,'name',req.body.data.attribute.name)){
                    item.attributes.push(req.body.data.attribute);
                }else{
                    res.send('ELEMENT_ALREADY_EXIST');
                    return false;
                }
                break;
            case 'save':
                if(req.body.data.keyAttribute == req.body.data.attribute.name || !findElement(item.attributes,'name',req.body.data.attribute.name)){
                    let attribute = item.attributes[findElement(item.attributes,'name',req.body.data.keyAttribute,false)];
                    attribute.name = req.body.data.attribute.name;
                    attribute.value = req.body.data.attribute.value;
                }else{
                    res.send('ELEMENT_ALREADY_EXIST');
                    return false;
                }
                break;
            case 'saveItem':
                if(req.body.keyToken == req.body.data.name || (!findElement(req.session.system.tokens,'name',req.body.data.name) &&
                !findElement(req.session.system.effects,'name',req.body.data.name))
                ){
                    item.name = req.body.data.name;
                    if(req.body.data.Color != 'undefined'){
                        item.Color = req.body.data.Color;
                    }
                    if(req.body.data.Border != 'undefined'){
                        item.Border = req.body.data.Border;
                    }
                }else{
                    res.send('ELEMENT_ALREADY_EXIST');
                    return false;
                }

                break;
            case 'addToken':

                if(!findElement(system.tokens,'name',req.body.keyToken) &&
                !findElement(system.effects,'name',req.body.keyToken)
                ){
                    let templateToken = {"name":req.body.keyToken,
                    "Color":"",
                    "Border":"",
                    "Img":"",
                    "attributes":[],
                    "methods":[]};

                    system.tokens.push(templateToken);
                }else{
                    res.send('ELEMENT_ALREADY_EXIST');
                    return false;
                }
                break;
            case 'addEffect':
                if(!findElement(system.tokens,'name',req.body.keyToken) &&
                !findElement(system.effects,'name',req.body.keyToken)
                ){
                    let templateEffect = {"name":req.body.keyToken,
                    "attributes":[]};

                    system.effects.push(templateEffect);
                }else{
                    res.send('ELEMENT_ALREADY_EXIST');
                    return false;
                }
                break;
            }
            return true;
        });
    }else {
		res.redirect('/login');
	}
});

const updateAttributes = (req,res, action) =>{
    let newSystem = req.session.system;
    let array = null;
    let item = null;
    let canContinu = true;

    switch(req.body.type){
    case 'tokens':
        item = findElement(newSystem.tokens,'name',req.body.keyToken);
        break;
    case 'effects':
        item = findElement(newSystem.effects,'name',req.body.keyToken);
        break;
    case 'tile':
        item = newSystem.tile;
        break;
    case 'board':
        item = newSystem.board;
        break;
    case 'newToken':
        item = newSystem.tokens;
        break;
    case 'newEffect':
        item = newSystem.effects;
        break;
    }

    if(action(item,canContinu)){
        db.getSystems(req.session.user.id,(result)=>{
            result.systems[findElement(result.systems,'id',req.session.system.id,false)] = newSystem;

            db.updateSystem(req.session.user.id,result,(data)=>{
                res.send(req.body.action);
            });
        });
    }
}


const findElement = (array,key,value,element=true) =>{
    for(let i = 0; i < array.length;i++){
        if(array[i][key] == value){
            return element?array[i]:i;
        }
    }
}

db.initDb(function(err){
	const server = app.listen(port, function () {
		console.log('Server listening on port ' + port);
	});
});
