let system = null;

const getSystem = () =>{
	getApi('systemChoiceData',(result)=>{
		system = result;
		fillInput('#titleSystem',system.title);

		fillInput('#colorBGTile',system.tile.Color);
		fillInput('#colorBorderTile',system.tile.Border);

		fillInput('#colorBGBoard',system.board.Color);

		fillList('#listTokens',system.tokens,showToken);
		fillList('#listEffects',system.effects,showEffect);
	});
}

const fillInput = (id,value) =>{
	document.querySelector(id).value =
	document.querySelector(id).defaultValue = value;
}

const fillList = (id,array, onclick=null) =>{
	let parent = document.querySelector(id);
	for(let i = 0; i < array.length;i++){
		let item = array[i];

		let newElem = document.createElement('a');
		let txt = document.createTextNode(item.name);
		newElem.appendChild(txt);

		if(onclick){
			newElem.onclick = () =>{
				onclick(i);
			}
		}
		parent.appendChild(newElem);
	}
}

const addAttributes = (id,json, onclick = null) =>{
	let parent = document.querySelector(id);
	for(let key in json){
		let newElem = document.createElement('a');
		let txt = document.createTextNode(key);
		newElem.appendChild(txt);
		newElem.setAttribute('href','#');
		newElem.setAttribute('class','modalBtn');

		if(onclick){
			newElem.onclick = () =>{
				onclick(i);
			}
		}
		parent.appendChild(newElem);
	}
	dialogScript();
}

const showAttribute = (container, key) =>{
	let modal = document.getElementById('dialogNewAttributes');
	
	modal.style.display = "block";
}

const showToken = (index) =>{
	let formToken = document.querySelector('#formToken');
	let formEffect = document.querySelector('#formEffect');
	let display = document.querySelector('#formToken').style.display;
	if(display == 'none'){
		formToken.style.display = 'block';
		formEffect.style.display = 'none';
	}else{
		formToken.style.display = 'none';
	}

	let token = system.tokens[index];

	fillInput('#titleToken',token.name);
	fillInput('#colorBGToken',token.Color);
	fillInput('#colorBorderToken',token.Border);
	addAttributes('#listTokenAttributes',token.attributes);
	fillList('#listTokenMethods',token.methods);
}

const showEffect = (index) =>{
	let formToken = document.querySelector('#formToken');
	let formEffect = document.querySelector('#formEffect');
	let display = document.querySelector('#formEffect').style.display;
	if(display == 'none'){
		formEffect.style.display = 'block';
		formToken.style.display = 'none';
	}else{
		formEffect.style.display = 'none';
	}

	let effect = system.effects[index];
	fillInput('#titleEffect',effect.name);
}