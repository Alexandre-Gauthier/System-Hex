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

app.get('/methodEditor',(req, res) => {
	if (req.session.user && req.cookies.user_sid && req.session.system) {
        res.json(req.session.system);
	} else {
		res.redirect('/chooseSystem');
	}
});

/* Route for Dashboard update */
app.post('/addAttribute', (req,res)=>{
    if (req.session.user && req.cookies.user_sid) {
        updateSystem(req,res,(item)=>{
            if(!findElement(item.attributes,'name',req.body.data.attribute.name)){
                item.attributes.push(req.body.data.attribute);
            }else{
                res.send('ELEMENT_ALREADY_EXIST');
                return false;
            }
            return true;
        });
    }else{
        res.redirect('/login');
    }
});

app.post('/saveAttribute', (req,res)=>{
    if (req.session.user && req.cookies.user_sid) {
        updateSystem(req,res,(item)=>{
            if(req.body.data.keyAttribute == req.body.data.attribute.name || !findElement(item.attributes,'name',req.body.data.attribute.name)){
                let attribute = item.attributes[findElement(item.attributes,'name',req.body.data.keyAttribute,false)];
                attribute.name = req.body.data.attribute.name;
                attribute.value = req.body.data.attribute.value;
            }else{
                res.send('ELEMENT_ALREADY_EXIST');
                return false;
            }
            return true;
        });
    }else{
        res.redirect('/login');
    }
});

app.post('/deleteAttribute', (req,res)=>{
    if (req.session.user && req.cookies.user_sid) {
        updateSystem(req,res,(item)=>{
            item.attributes.splice(findElement(item.attributes,'name',req.body.data.keyAttribute,false),1);
            return true;
        });
    }else{
        res.redirect('/login');
    }
});

app.post('/deleteEffect', (req,res)=>{
    if (req.session.user && req.cookies.user_sid) {
        updateSystem(req,res,(item,system)=>{
            system.effects.splice(findElement(system.effects,'name',req.body.key,false),1);
            return true;
        });
    }else{
        res.redirect('/login');
    }
});

app.post('/deleteToken', (req,res)=>{
    if (req.session.user && req.cookies.user_sid) {
        updateSystem(req,res,(item,system)=>{
            system.tokens.splice(findElement(system.tokens,'name',req.body.key,false),1);
            return true;
        });
    }else{
        res.redirect('/login');
    }
});

app.post('/addToken', (req,res)=>{
    if (req.session.user && req.cookies.user_sid) {
        updateSystem(req,res,(item,system)=>{
            if(!findElement(system.tokens,'name',req.body.key) &&
            !findElement(system.effects,'name',req.body.key)
            ){
                let templateToken = {"name":req.body.key,
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
            return true;
        });
    }else{
        res.redirect('/login');
    }
});

app.post('/addEffect', (req,res)=>{
    if (req.session.user && req.cookies.user_sid) {
        updateSystem(req,res,(item,system)=>{
            if(!findElement(system.tokens,'name',req.body.key) &&
            !findElement(system.effects,'name',req.body.key)
            ){
                let templateEffect = {"name":req.body.key,
                "attributes":[]};

                system.effects.push(templateEffect);
            }else{
                res.send('ELEMENT_ALREADY_EXIST');
                return false;
            }
            return true;
        });
    }else{
        res.redirect('/login');
    }
});

app.post('/saveItem', (req,res)=>{
    if (req.session.user && req.cookies.user_sid) {
        updateSystem(req,res,(item)=>{
            if(req.body.key == req.body.data.name || (!findElement(req.session.system.tokens,'name',req.body.data.name) &&
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
            return true;
        });
    }else{
        res.redirect('/login');
    }
});

app.post('/saveSystem', (req,res)=>{
    if (req.session.user && req.cookies.user_sid) {
        updateSystem(req,res,(item)=>{
            item.title = req.body.data.title;
            item.tile.Color = req.body.data.tileColor;
            item.tile.Border = req.body.data.tileBorder;
            item.board.Color = req.body.data.boardColor;
            return true;
        });
    }else{
        res.redirect('/login');
    }
});

/* Route for editor */

app.post('/saveMethod', (req,res)=>{
    if (req.session.user && req.cookies.user_sid) {
        updateSystem(req,res,(item)=>{
            if(req.body.data.oldName == req.body.data.method.name ||
                !findElement(item.methods,'name',req.body.data.method.name) ||
                req.body.data.oldName == ""
            ){
                if(req.body.data.oldName == ""){
                    item.methods.push(req.body.data.method);
                }else{
                    item.methods.splice(findElement(item.methods,'name',req.body.data.oldName,false),1);
                    item.methods.push(req.body.data.method);
                }
                return true;
            }
        });
    }else{
        res.redirect('/login');
    }
})

const updateSystem = (req,res,action) =>{
    let newSystem = req.session.system;
    let item = getItem(req,newSystem);
    if(action(item,newSystem)){
        db.getSystems(req.session.user.id,(result)=>{
            result.systems[findElement(result.systems,'id',req.session.system.id,false)] = newSystem;

            db.updateSystem(req.session.user.id,result,(data)=>{
                res.send('SUCCESS');
            });
        });
    }
}

const getItem = (req, system) =>{
    let item = null;
    switch(req.body.type){
        case 'token':
            item = findElement(system.tokens,'name',req.body.key);
            break;
        case 'effect':
            item = findElement(system.effects,'name',req.body.key);
            break;
        case 'system':
            item = system;
            break;
        default:
            item = system[req.body.type];
    }
    return item;
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
