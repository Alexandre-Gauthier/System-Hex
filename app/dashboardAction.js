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
	while (parent.firstChild) {
		parent.removeChild(parent.firstChild);
	}
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

const addAttributes = (id,array,token) =>{
	let parent = document.querySelector(id);

	while (parent.firstChild) {
		parent.removeChild(parent.firstChild);
	}
	for(let i = 0; i < array.length;i++){
		let item = array[i];
		let newElem = document.createElement('a');
		let txt = document.createTextNode(item.name);
		newElem.appendChild(txt);
		newElem.setAttribute('href','#');
		newElem.setAttribute('class','modalBtn');
		newElem.onclick = () =>{
			showAttribute(item,i,newElem,token);
		}

		parent.appendChild(newElem);
	}

}

const showAttribute = (attribute, index,node, token) =>{
	let modal = document.getElementById('dialogNewAttributes');
	fillInput('#titleAttribute',attribute.name);
	fillInput('#valueAttribute',attribute.value);

	modal.querySelector('#modalBtnDelete').onclick = () =>{
		deleteAttribute(attribute,index,node,token);
	}

	modal.querySelector('#modalBtnSave').onclick = () =>{
		saveAttribute(attribute,node,token);
	}

	modal.style.display = "block";
}

const deleteAttribute = (attribute,index,node,token) =>{
	if (confirm('Voulez-vous vraiment supprimer cet Attributs?')) {
		token.attributes.splice(index,1);
		node.remove();
		document.getElementById('dialogNewAttributes').style.display = "none";

		let params = {keyToken:token.name,keyAttribute:attribute.name}
		postApi('deleteTokenAttribute',(res)=>{alert(res);},params);
	}
}

const saveAttribute = (attribute,node,token) =>{
	let title = document.querySelector('#titleAttribute').value;
	let value = document.querySelector('#valueAttribute').value
	attribute.name = title;
	attribute.value = value;
	node.innerHTML = title;

	document.getElementById('dialogNewAttributes').style.display = "none";
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
	addAttributes('#listTokenAttributes',token.attributes,token);
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
	// addAttributes('#listEffectAttributes',effect.attributes);
}