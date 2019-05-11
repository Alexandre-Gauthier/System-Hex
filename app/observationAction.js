const nbColumns = 36;

let gap = 5;
let nbRows = 14;
const tilesList = [];
const boardConfig = {width:0,height:0,size:0,speed:0,timer:0,startingSpeed:-20};

const tileDic = {};
const tokenTemplate = {};
const effectTemplate = {};

let ctx = null;
let canvas = null;

let posX = 0;
let posY = 0;
let clickEvent = false;

let selectedTile = null;

let demoToken = null;
let paused = false;

const iniObservation = () =>{
	canvas = document.querySelector('#mainCanvas');
	ctx = canvas.getContext('2d');
	ctx.moveTo(0, 0);

	let container = document.querySelector('#board_container');
	boardConfig.width = container.offsetWidth;
	boardConfig.height = container.offsetHeight;

	boardConfig.size = (boardConfig.width / nbColumns)/1.76;
	nbRows = Math.ceil(boardConfig.height/boardConfig.size*.435);

	ctx.canvas.width  = container.offsetWidth;
	ctx.canvas.height = container.offsetHeight;

	canvas.onclick=(e)=>{
		clickEvent = true;
	}
	canvas.onmousemove = (e) =>{
		posX = e.offsetX;
		posY = e.offsetY;
	}

	$( "#speedSlider" ).slider({
		min: -60,
		max: 0,
      	value: boardConfig.startingSpeed,
		slide: changeSpeed,
		change: changeSpeed});

		let speed = $( "#speedSlider").slider("value");
		boardConfig.speed = Math.abs(speed);

	getApi('systemChoiceData',(result)=>{
		system = result;
		setTextNode('#titleSystem',system.title);

		iniApp();
	});

	document.querySelector('#btnReset').onclick = iniBoard;
	document.querySelector('#btnPause').onclick = simPause;

}

const simPause = () =>{
	paused = !paused;
	let btn = document.querySelector('#btnPause');
	if(paused){
		btn.innerHTML = "Reprendre";
		btn.classList.add("active");
	}else{
		btn.innerHTML = "Pause";
		btn.classList.remove("active");
	}
}

const iniApp = () =>{
	// Create Effect Template
	for(let i = 0; i< system.effects.length;i++){
		let json = system.effects[i];
		try{
			let effect = json;
			let attributes = {};
			effect.attributes.forEach(attribute=>{
				let newAttribute = JSON.parse(JSON.stringify(attribute));
				attributes[newAttribute.name] = Number(newAttribute.value);
			});
			effect.attributes = attributes;
			effectTemplate[effect.name] = effect;
			console.log(effect)
		}catch(err){
			console.error(json.name,'ERROR_CONSTRUCTION_METHOD');
		}
	}

	// Create Token Template
	for(let i = 0; i< system.tokens.length;i++){
		let json = system.tokens[i];
		try{
			let token = json;
			tokenTemplate[token.name] = token;
			console.log(token)
		}catch(err){
			console.error(json.name,'ERROR_CONSTRUCTION_METHOD');
		}
	}

	let color = system.board.Color;
	console.log(color)
	if(color && color != "" && color != " "){
		document.body.style.backgroundColor = '#'+color;
	}
	iniBoard();
	tick();
}

const iniBoard = () =>{
	tilesList.length = 0;
	// Create board
	for(let row = 0;row<nbRows;row++){
		let tileRow = [];
		for(let column = 0;column<nbColumns;column++){
			let tile = new Tile(getId(),system.tile.attributes,column,row,system.tile.Color,system.tile.Border);
			tile.installMethods(system.tile.methods);
			iniToken(tile);

			let iniPosX = boardConfig.size, iniPosY = boardConfig.size;
			let x = boardConfig.size*1.75;
			let y = boardConfig.size*2;
			if(column%2 == 0){
				iniPosY += boardConfig.size;
			}
			tile.addCoord(boardConfig.size,column*x+iniPosX,row*y+iniPosY)

			tileRow.push(tile);
			tileDic[column+'-'+row] = tile;
		}
		tilesList.push(tileRow);
	}

}

const iniTokens = () =>{
	for(let i = 0;i<tilesList.length;i++){
		let tile = tilesList[i];
		iniToken(tile);
	}
}

const iniToken = (tile) =>{
	let min = 1;
	let max = system.tokens.length*100;
	let randToken = Math.floor(Math.random() * (+max - +min)) + +min;
	let chooseToken = getRandomToken(randToken);
	if(chooseToken){
		let json = tokenTemplate[chooseToken];
		let token = new Token(getId(),json.attributes,tile,tile.tileID,json.name,json.Color,json.Border);
		token.installMethods(json.methods);
		tile.addToken(token);
	}
}

const getRandomToken = (randomNum) =>{
	let total = 0;
	let newTotal = 0;
	for(let i = 0; i < system.tokens.length; i++){
		let token = system.tokens[i];
		let actRatio = token.iniRatio+((token.iniRatio/100)*getRatio(token));
		newTotal += actRatio;
		if(randomNum > total && randomNum <= newTotal){
			return token.name;
		}
		total = newTotal;
	}
	return null;
}

const getRatio = (mainToken) =>{
	let res = 0;
	for(let i = 0; i < system.tokens.length; i++){
		let token = system.tokens[i];
		if(token != mainToken){
			res += 100-token.iniRatio;
		}
	}
	return res;
}

const changeSpeed = () =>{
	let speed = $( "#speedSlider").slider("value");
	boardConfig.speed = Math.abs(speed);
	console.log(boardConfig.speed);
}

const tick = () =>{
	ctx.clearRect(0, 0, boardConfig.width, boardConfig.height);
	tilesSwitch();
	tilesTick();
	if(boardConfig.timer <= 0){
		boardConfig.timer = boardConfig.speed;
	}
	if(selectedTile){
		printInfo();
	}
	boardConfig.timer--;
	clickEvent = false;

	window.requestAnimationFrame(tick);
}

const tilesSwitch = () =>{
	for(let row = 0; row < nbRows;row++){
		for(let column = 0; column < nbColumns;column++){
			let tile = tilesList[row][column]

			if(boardConfig.timer <= 0 && !paused){
				tile.switchInputs();
			}
		}
	}
}

const tilesTick = () =>{
	for(let row = 0; row < nbRows;row++){
		for(let column = 0; column < nbColumns;column++){
			let tile = tilesList[row][column]

			tile.continuousTick(clickEvent);
			if(boardConfig.timer <= 0 && !paused){
				tile.tick();
			}
		}
	}
}

const printInfo = () =>{
	let container = document.querySelector('#infoTile');
	setTextNode('#selectTitle',(selectedTile.name == 'tile')?"Tuile":selectedTile.name+" "+selectedTile.id);

	let listAttributes = container.querySelector('#listAttributes');
	listAttributes.innerHTML = "";
	if(selectedTile.attributes){
		Object.keys(selectedTile.attributes).forEach(function(key){
			addListElement(listAttributes,key + '=' + selectedTile.attributes[key]);
		 });
	}

	printList(container.querySelector('#listListenedEffects'),selectedTile.listenedInputs);
	printObjList(container.querySelector('#listEffects'),selectedTile.nextInputs);
	printObjList(container.querySelector('#listTokens'),selectedTile.children,selectElement);
}

const printList = (parent,list,onclick=null) =>{
	// parent.innerHTML = "";
	// if(list){
	// 	list.forEach(input=>{
	// 		addListElement(parent,input,input,onclick)
	// 	});
	// }
	let actNodes = [];
	parent.childNodes.forEach(node=>{
		if(!list.includes(node.innerHTML)){
			node.remove();
		}else{

			actNodes.push(node.innerHTML);
		}
	});

	if(list){
		list.forEach(input=>{

			if(!actNodes.includes(input)){
				addListElement(parent,input,input,onclick);
			}
		});
	}
}

const printObjList = (parent,list,onclick=null) =>{
	// parent.innerHTML = "";
	let actNodes = [];
	let listNames = [];
	let nodeNames = [];
	list.forEach(input=>{
		listNames.push(input.name);
	});
	// parent.childNodes.forEach(node=>{
	// 	nodeNames.push(node.innerHTML);
	// });
	parent.childNodes.forEach(node=>{
		if(!listNames.includes(node.innerHTML) || actNodes.includes(node.innerHTML)){
			node.remove();
		}else if(!actNodes.includes(node.innerHTML)){
			actNodes.push(node.innerHTML);
		}
	});
	if(list){
		list.forEach(input=>{
			if(!actNodes.includes(input.name)){
				addListElement(parent,input.name,input,onclick);
			}
		});
	}
}

const addListElement = (parent,text,element=null,onclick=null) =>{
	let newElem = document.createElement('a');
	let txt = document.createTextNode(text);
	newElem.appendChild(txt);

	if(onclick){
		newElem.onclick = () =>{
			onclick(element);
		}
	}

	parent.appendChild(newElem);
}

const selectElement = (element) =>{
	selectedTile = element;
}

// ---------------------------------------------------------------------------------------------
// GENERAL FUNCTIONS
// ---------------------------------------------------------------------------------------------
const getInput = (arr,input)=>{
	for(let i = 0;i < arr.length;i++){
		if(arr[i].name === input){
			return arr[i];
		}
	}
}

const getToken = (arr,token)=>{
	for(let i = 0; i < arr.length;i++){
		if(arr[i].name === token){
			return arr[i];
		}
	}
}

const deleteInput = (arr, input)=> {
	for(let i = 0; i < arr.length;i++){
		if(arr[i].name === input ){
			arr.splice(i,1);
		}
	}
}

const deleteIncasedInput = (arr, container,id)=> {
	for(let i = 0; i < arr.length;i++){
		if(arr[i].name === container && arr[i].elem == id){
			arr.splice(i,1);
		}
	}
}

const deleteToken = (arr, id)=> {
	for(let i = 0; i < arr.length;i++){
		if(arr[i].id === id ){
			arr.splice(i,1);
		}
	}
}

const getId = () =>{
	if (typeof getId.counter == 'undefined'){
		getId.counter = 0;
	}
	return(++getId.counter);
}

const giveInput = (input,arr) =>{
	arr.forEach(tileId => {
		let tile = getTile(tileId);
		tile.addInput(tile.nextInputs,input,true)
	});
}

const getTile = (tileID) =>{
	return tileDic[tileID]
}

const getTemplateToken = (name) =>{
	for(let i = 0;i < tokenTemplate.length;i++){
		let token = tokenTemplate[i];
		if(token.name == name){
			return token;
		}
	}
	return null;
}

const isInput = (name) =>{
	if(effectTemplate[name] != null){
		return true;
	}
	return false;
}

const getNeighbours = (x,y) =>{
	let keyVoisin = [];
	if(x%2 == 0){
		if(x>0){keyVoisin.push((x-1)+'-'+y);}
		if(y>0){keyVoisin.push(x+'-'+(y-1));}
		if(x<nbColumns-1){keyVoisin.push((x+1)+'-'+y);}

		if(y<nbRows-1&&x>0){keyVoisin.push((x-1)+'-'+(y+1));}
		if(y<nbRows-1){keyVoisin.push(x+'-'+(y+1));}
		if(y<nbRows-1&&x<nbColumns-1){keyVoisin.push((x+1)+'-'+(y+1));}
	}else{
		if(y>0&&x>0){keyVoisin.push((x-1)+'-'+(y-1));}
		if(y>0){keyVoisin.push(x+'-'+(y-1));}
		if(y>0&&x<nbColumns-1){keyVoisin.push((x+1)+'-'+(y-1));}

		if(x>0){keyVoisin.push((x-1)+'-'+y);}
		if(y<nbRows-1){keyVoisin.push(x+'-'+(y+1));}
		if(x<nbColumns-1){keyVoisin.push((x+1)+'-'+y);}
	}
	return keyVoisin;
}

// https://alvinalexander.com/source-code/javascript-multiple-random-unique-elements-from-array
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}