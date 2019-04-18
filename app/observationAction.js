const iniObservation = () =>{
	getApi('systemChoiceData',(result)=>{
		system = result;
		setTextNode('#titleSystem',system.title);
	});
}

const nbColumns = 24;
let nbRows = 14;
const tilesList = [];
const boardConfig = {width:0,height:0,size:0};

const tileDic = {};

let ctx = null;
let canvas = null;

let posX = 0;
let posY = 0;
let clickEvent = false;

window.onload=()=>{
	canvas = document.querySelector('#mainCanvas');
	ctx = canvas.getContext('2d');
	ctx.moveTo(0, 0);

	let container = document.querySelector('#board_container');
	boardConfig.width = container.offsetWidth;
	boardConfig.height = container.offsetHeight;
	boardConfig.size = (boardConfig.width / nbColumns)-boardConfig.width*.0175;
	nbRows = Math.ceil(boardConfig.height/boardConfig.size*.46);
	ctx.canvas.width  = container.offsetWidth;
	ctx.canvas.height = container.offsetHeight;


	canvas.onclick=(e)=>{
		clickEvent = true;
	}
	canvas.onmousemove = (e) =>{
		posX = e.offsetX;
		posY = e.offsetY;
	}

	iniApp();
}

const iniApp = () =>{
	// Create board
	// canvas.style.backgroundColor = board.color;
	for(let row = 0;row<nbRows;row++){
		let tileRow = [];
		for(let column = 0;column<nbColumns;column++){
			let tile = new Tile(getId(),iniTile.attributes,column,row);
			tile.installMethods(iniTile.methods);
			tile.testToken();

			let iniPosX = boardConfig.width*.025, iniPosY = boardConfig.width*.025;
			let gap = 5;
			let x = boardConfig.size*1.5+gap;
			let y = boardConfig.size*1.75+gap;
			if(column%2 == 0){
				iniPosY += boardConfig.size;
			}
			tile.addCoord(boardConfig.size,column*x+iniPosX,row*y+iniPosY)

			tileRow.push(tile);
			tileDic[column+'-'+row] = tile;
		}
		tilesList.push(tileRow);
	}
	tick();
}


const tick = () =>{
	ctx.clearRect(0, 0, boardConfig.width, boardConfig.height);
	for(let row = 0; row < nbRows;row++){
		for(let column = 0; column < nbColumns;column++){
			let tile = tilesList[row][column]

			tile.tick(clickEvent); // To Dispatch to workers
		}
	}

	clickEvent = false;
	// setTimeout(tick, 30);
	window.requestAnimationFrame(tick);
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
		/*
		if(arr.children.length > 0){
			getToken(arr.children,token);
		}*/
	}
}

const deleteInput = (arr, input)=> {
	for(let i = 0; i < arr.length;i++){
		if(arr[i].name === input ){
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
		let tile = tileDic[tileId]
		tile.addInput(tile.nextInputs,input)
	});
}