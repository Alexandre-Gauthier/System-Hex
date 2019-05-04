let inputs = {'fire':{name:'fire',power:50},'water':{name:'water'}};
let attributes = {'durability':500,'humidity':100};

let localeVars = {};

let space = null;
let stringBody = null;
let methodBody = null;

let selectedPiece = null;
let selectedTags = [];
let buttons = [];
let savedPiece = null;

let dom2JSON = null;
let unresolvedInput = 0;

let token = null;
let method = null;

let isTile = false;

const iniEditor = () =>{
	space = document.querySelector('#creationSpace');
	stringBody = document.querySelector('#stringBody');

	space.onclick=(e)=>{
		if(selectedPiece){
			unSelect();
		}
	}

	buttons = document.querySelectorAll('#listPieces button');
	showButton();
	getApi('methodEditor',(result)=>{
		system = result;
		setTextNode('#titleSystem',system.title);
		if(getUrlVars()["token"]){
			token = findElement(system.tokens,'name',getUrlVars()["token"],true);
			setTextNode('#tokenTitle',token.name);
			addOnClickSaveMethod('#methodBtnSave',token.name,'token');
			addOnClickDeleteMethod('#methodBtnDelete',token.name,'token');
		}else{
			token = system.tile;
			setTextNode('#tokenTitle',"Tiles");
			addOnClickSaveMethod('#methodBtnSave',token,'tile');
			addOnClickDeleteMethod('#methodBtnDelete',token,'tile');
			isTile = true;
		}

		addAttributes('#listTokenAttributes',token.attributes,token,'token');

		console.log(token);
		addOpenEditor('#listTokenMethods',token.methods,token.name);


		if(getUrlVars()["method"] == 'new'){
			method = {name:'',body:'',dom:'',listenedInputs:[],unresolved:0};
			token.methods.push(method);
		}else{
			method = findElement(token.methods,'name',getUrlVars()["method"],true);
			fillInput('#titleMethod',getUrlVars()["method"]);
			dom2JSON = method.dom;
			methodBody = method.body;
			restoreDOM();
		}
		getSelectedMethod();
	});
	setTextNode('#editorHeader','Éditeur ('+unresolvedInput+')');
}

const getSelectedMethod = () =>{
	let nodes = document.querySelector('#listTokenMethods').childNodes;
	nodes.forEach(node=>{
		if(node.innerHTML == method.name){
			node.style.color = '#344c7c';
		}
	});
}

const setTextNode = (id,text) =>{
	document.querySelector(id).innerHTML = text;
}

const addOnClickSaveMethod = (id,key,type='token') =>{
	document.querySelector(id).onclick = () =>{
		dom2String();
		if(document.querySelector('#titleMethod').value != ""){
			let data = {oldName:method.name};
			method.name = document.querySelector('#titleMethod').value;

			data['method'] = method;
			updateAPI(key,type,'saveMethod',data,(res)=>{
				let tokenStr = "";
				if(getUrlVars()["token"]){
					tokenStr = "token="+token.name+"&";
				}
				window.location.href = "/methodEditor.html?"+tokenStr+"method="+method.name;
			});
		}else{
			alert('Entrez un nom');
		}
	}
}

const addOnClickDeleteMethod = (id,key,type='token') =>{
	document.querySelector(id).onclick = () =>{
		if (confirm('Voulez-vous vraiment supprimer cette Méthode?')) {
			let data = {oldName:method.name};
			updateAPI(key,type,'deleteMethod',data,(res)=>{
				window.location.href = "/dashboard.html";
			})
		}
	}
}

// ****************************************** Event Action *******************************************

const unSelect=()=>{
	if(selectedPiece){
		selectedPiece.style.boxShadow  = "none";
	}
	selectedPiece = null;
	selectedTags = null;

	showButton();
}

const select=(event,node)=>{
	if(selectedPiece){
		unSelect();
	}
	node.style.boxShadow = "0px 0px 0px 2px #9acecb inset";
	selectedPiece = node;

	selectedTags = getTag(node);

	showButton();

	event.stopPropagation();
}

const activeUpBtn = () =>{
	if(selectedPiece && selectedPiece.getAttribute("class")=="newPiece"){
		let prev = getPrev(selectedPiece)
		if(prev && !hasTag('hint',prev)){
			document.querySelector('#editorBtnUp').classList.add("active");
		}else{
			document.querySelector('#editorBtnUp').classList.remove("active");
		}
	}else{
		document.querySelector('#editorBtnUp').classList.remove("active");
	}
}

const activeDownBtn = () =>{
	if(selectedPiece && selectedPiece.getAttribute("class")=="newPiece"){
		if(getNext(selectedPiece)){
			document.querySelector('#editorBtnDown').classList.add("active");
		}else{
			document.querySelector('#editorBtnDown').classList.remove("active");
		}
	}else{
		document.querySelector('#editorBtnDown').classList.remove("active");
	}
}

const activeDeleteBtn = () =>{
	if(selectedPiece && !hasTag('capsule',selectedPiece)){
		document.querySelector('#editorBtnDelete').classList.add("active");
		document.querySelector('#editorBtnDelete').classList.add("delete");
	}else{
		document.querySelector('#editorBtnDelete').classList.remove("active");
		document.querySelector('#editorBtnDelete').classList.remove("delete");
	}
}

const activeMoveBtn = () =>{
	if((selectedPiece && !hasTag('capsule',selectedPiece)) || savedPiece){
		document.querySelector('#editorBtnMove').classList.add("active");

	}else{
		document.querySelector('#editorBtnMove').classList.remove("active");
	}
	if(savedPiece){
		document.querySelector('#editorBtnMove').classList.add("move");
	}else{
		document.querySelector('#editorBtnMove').classList.remove("move");
	}
}

const showButton = () =>{
	activeUpBtn();
	activeDownBtn();
	activeDeleteBtn();
	activeMoveBtn();
	buttons.forEach(button=>{
		let display = "none";
		let tags = getTag(button);
		tags.forEach(tag=>{
			if(selectedPiece){
				if(selectedTags.indexOf(tag) >= 0 || tag == "main"){
					display = "block";
				}else if(tag == 'dependent' && nodeIsEmpty(selectedPiece,2)){
					display = "none";
				}else if(tag == 'notTile' && isTile){
					display = "none";
				}
			}else{
				if(tag=="main" || tag=="block" || tag=="line"){
					display = "block";
					if(tag == 'dependent' && nodeIsEmpty(space,1)){
						display = "none";
					}
				}
			}
		});
		button.style.display = display;
	});
}

// ****************************************** Button Action *******************************************

const saveDOM = () =>{
	dom2JSON = toJSON(space);
	return dom2JSON;
}

const clearDOM = () =>{
	while (space.firstChild){
		space.removeChild(space.firstChild);
	}
}

const restoreDOM = () =>{
	if(dom2JSON){
		let json2DOM = toDOM(dom2JSON);
		space.replaceWith(json2DOM);
		space = document.querySelector('#creationSpace');
	}
	dom2String();
}

const deleteNode = () =>{
	if(selectedPiece){
		if(selectedPiece.getAttribute("class")=="newPiece"){
			removePiece();
		}
	}

	dom2String();
}

const savePiece = () =>{
	if(!savedPiece){
		if(selectedPiece){
			savedPiece = toJSON(selectedPiece);
			removePiece();
			dom2String();
		}
	}else{
		restorePiece();
	}
}

const restorePiece = () =>{
	if(savedPiece){
		let movedPiece = toDOM(savedPiece);
		if(selectedPiece && hasTag('capsule',selectedPiece)){
			if(hasTags(getTag(movedPiece),selectedPiece)){
				selectedPiece.appendChild(movedPiece);

				selectedPiece.querySelector(".hint").style.display = "none";
				selectedPiece.style.border = "none";

				savedPiece = null;
				unSelect();
			}
		}else{
			if(hasTags(['block','line'],movedPiece)){
				space.appendChild(movedPiece);
				savedPiece = null;
				unSelect();
			}
		}
	}
	activeMoveBtn();
	dom2String();
}

const removePiece = (piece = selectedPiece) =>{
	let prev = getPrev(piece);
	let next = getNext(piece);
	let parent = getParent(piece);
	if(prev && hasTag("hint",prev) && nodeIsEmpty(parent,2)){
		prev.style.display = "inline";
		parent.style.border = "1px solid red";
	}
	selectedPiece.remove();

	showButton();
}

const createPiece=(type)=>{
	let parent = space;
	if(selectedPiece){
		if(hasTag("capsule",selectedPiece)){
			parent = selectedPiece;
			unresolvedInput--;
			selectedPiece.style.border = "none";
			parent.querySelector(".hint").style.display = "none";

		}else{
			parent = getParent(selectedPiece);
		}
	}
	let piece = new type(parent);
	unSelect();
	dom2String();
}

const upNode=()=>{
	if(selectedPiece){
		let prev = getPrev(selectedPiece);
		let parent = getParent(selectedPiece);
		if(prev){
			parent.insertBefore(selectedPiece,prev);
		}
	}
	showButton();
	dom2String();
}

const downNode=()=>{
	if(selectedPiece){
		let next = getNext(selectedPiece);
		let parent = getParent(selectedPiece);
		if(next){
			parent.insertBefore(next,selectedPiece);
		}
	}
	showButton();
	dom2String();
}

// ****************************************** Getter Node and Tag *******************************************

const getTag = (node) =>{
	let tags = null;
	let s_tags = node.getAttribute("tags")
	if(s_tags){
		tags = s_tags.split(',');
	}
	return tags;
}

const hasTag = (tag,node) =>{
	let tags = getTag(node);
	if(tags != null){
		return tags.indexOf(tag) > -1
	}
	return false;
}

const hasTags = (tags,node) =>{
	let result = false;
	tags.forEach(tag=>{
		if(hasTag(tag,node)){
			result = true;
		}
	});
	return result;
}

const getPrev = (node) => {
	return node.previousElementSibling;
}
const getNext = (node) =>{
	return node.nextElementSibling;
}
const getParent = (node) =>{
	return node.parentNode;
}
const nodeIsEmpty = (node,limit) =>{
	return node.childNodes.length <= limit;
}

// ************************************** Getter Input && Attribute ****************************************
const getInputs = () =>{
	let results = system.effects;
	let arr = [];
	results.forEach(input=>{
		arr.push([input.name]);
	});

	return arr;
}

const getTokens = () =>{
	let results = system.tokens;
	let arr = [];
	results.forEach(token=>{
		arr.push([token.name]);
	});

	return arr;
}

const getAttributes = () =>{
	let results = token.attributes;
	let arr = [];
	results.forEach(attribute=>{
		arr.push([attribute.name,"obj.attributes['"+attribute.name+"']"]);
	});

	return arr;
}

const getTileAttributes = () =>{
	let results = system.tile.attributes;
	let arr = [];
	results.forEach(attribute=>{
		arr.push([attribute.name,"obj.getTileAttribute('"+attribute.name+"')"]);
	});

	return arr;
}

const getVar = () =>{
	let results = Object.keys(localeVars);
	let arr = [];
	results.forEach(localVar =>{
		arr.push([localVar]);
	});

	return arr;
}

const clearSelectOptions = (select) =>{
	let length = select.options.length;
	for (let i = 0; i < length; i++) {
		select.options[i] = null;
	}
	$(select).empty();
}

const addSelectOptions = (select,options) =>{
	if(options){
		options.forEach(option => {
			let newOption = document.createElement("option");
			let value = option[0];
			if(option[1]){
				value = option[1]
			}
			newOption.setAttribute("value",value);
			let text = document.createTextNode(option[0]);
			newOption.appendChild(text);
			select.appendChild(newOption);
		});
	}
}

// ****************************************** Class Pieces *******************************************

class Piece{
	constructor(parent){
		let newElem = document.createElement("div");
		newElem.setAttribute("class","newPiece");
		newElem.setAttribute("onClick","select(event,this)");
		parent.appendChild(newElem);
		this.node = newElem;
	}

	addText(title,type,parent,hint=false){
		let h3 = document.createElement(type);
		let t = document.createTextNode(title);

		if(hint){
			h3.setAttribute("class","hint");
			h3.setAttribute("tags","hint");
		}

		h3.appendChild(t);
		parent.appendChild(h3);
	}
	addCapsule(text,tags){
		let container = document.createElement("div");
		container.setAttribute("class","capsule");
		container.setAttribute("onClick","select(event,this)");
		container.setAttribute("tags",tags+",capsule");
		container.style.border = "solid 1px red";
		this.addText(text,"p",container,true);

		this.node.appendChild(container);
	}
	addAnchor(tags){
		let container = document.createElement("div");
		container.setAttribute("class","anchor");
		container.setAttribute("tags",tags);
		this.node.appendChild(container);
	}

	addSelect(tags,options){
		let selector = document.createElement("SELECT");
		selector.setAttribute("tags",tags);
		this.node.appendChild(selector);

		this.node.onchange = function() {
			dom2String();
		  }

		addSelectOptions(selector,options);
	}

	addBloc(txt){
		this.addAnchor("startCode");
		this.addCapsule(txt,"block,line")
		this.addAnchor("endCode");
	}

	addGroup(txt,tags){
		this.addAnchor("startGroup");
		this.addCapsule(txt,tags)
		this.addAnchor("endGroup");
	}

	addInput(txt,tags,limit){
		let selector = document.createElement("input");
		selector.type = "text";
		selector.placeholder = txt;
		selector.setAttribute("tags",tags);

		setInputFilter(selector, function(value) {
			return limit.test(value);
		});
		selector.setAttribute("onchange","dom2String()");

		this.node.appendChild(selector);
	}

	addSlider(tags,min,max,defaut){
		let selector = document.createElement("div");
		selector.setAttribute("tags",tags);
		selector.setAttribute("class","slider");
		$(selector).slider({
			min: min,
			max: max,
			value: defaut});

		this.node.appendChild(selector);
	}
}

class When extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","block,line");
		this.node.style.backgroundColor = "#d8ca97"

		this.addAnchor("if");
		this.addText("Quand","h3",this.node);
		this.addGroup("Condition","condition,group");
		this.addBloc("Faire");
	}
}

class Else extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","block,dependent,line");
		this.node.style.backgroundColor = "#c1d897"

		this.addAnchor("else");
		this.addText("Sinon","h3",this.node);
		this.addBloc("Faire");
	}
}

class ElseIf extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","block,dependent,line");
		this.node.style.backgroundColor = "#b3e2d3"

		this.addAnchor("elseIf");
		this.addText("Sinon si","h3",this.node);
		this.addGroup("Condition","condition,group");
		this.addBloc("Faire");
	}
}

class Comparaison extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","condition,group");
		this.node.style.backgroundColor = "#bbdd6e"

		this.node.style.display = "flex";
		this.addAnchor("startGroup");
		this.addCapsule("valeur","valeur,math");
		this.addSelect("select,comparaison",[["égal à","=="],["plus grand que",">"],["plus petit que","<"],["plus grand ou egal que",">="],["plus petit ou egal que","<="],["n'égal pas","!="]]);
		this.addCapsule("valeur","valeur,math");
		this.addAnchor("endGroup");
	}
}

class CheckInput extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","condition,group");
		this.node.style.backgroundColor = "#bbdd6e"

		this.node.style.display = "flex";
		this.addText("Jeton est affecté par l'effet ","h3",this.node);
		this.addAnchor("checkInput");
		this.addSelect("select,effect",getInputs());
		this.addAnchor("endGroup");
	}
}

class RandomEvent extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","condition,group");
		this.node.style.backgroundColor = "#bbdd6e"

		this.node.style.display = "flex";
		this.addText("Chance que l'événement se produise","h3",this.node);
		this.addAnchor("randomEvent");
		this.addInput("Nombre","input",/^\d*\.?\d*$/);
		this.addText("/","h3",this.node);
		this.addAnchor("separator");
		this.addInput("Nombre","input",/^\d*\.?\d*$/);
		this.addAnchor("endGroup");
	}
}

class CheckToken extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","condition,group");
		this.node.style.backgroundColor = "#bbdd6e"

		this.node.style.display = "flex";
		this.addText("L'élément possède le jeton ","h3",this.node);
		this.addAnchor("checkToken");
		this.addSelect("select,token",getTokens());
		this.addAnchor("endGroup");
	}
}

class GetInput extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","valeur,group");
		this.node.style.backgroundColor = "#bbdd6e"

		this.node.style.display = "flex";
		this.addAnchor("getInput");
		this.addSelect("select,effect",getInputs());
		this.addAnchor("endGroup");
	}
}

class GetLocaleVar extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","valeur,group");
		this.node.style.backgroundColor = "#bbdd6e"
		this.node.style.display = "flex";

		let results = getVar().concat(getAttributes());
		if(results.length > 0){
			this.addSelect("select,variable",results);
		}
	}
}

class GetTileAtt extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","valeur,group");
		this.node.style.backgroundColor = "#6eddbd"
		this.node.style.display = "flex";

		let results = getTileAttributes();
		if(results.length > 0){
			this.addSelect("select,tileAtt",results);
		}
	}
}

class And extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","condition,dependent,group");
		this.node.style.backgroundColor = "#ddb46e"

		//this.node.style.display = "flex";
		this.addText("Et","h3",this.node);
		this.addAnchor("and");
		this.addCapsule("valeur","condition");
	}
}

class Or extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","condition,dependent,group");
		this.node.style.backgroundColor = "#ddb46e"

		//this.node.style.display = "flex";
		this.addText("Ou","h3",this.node);
		this.addAnchor("or");
		this.addCapsule("valeur","condition");
	}
}

class Group extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","group,condition");
		this.node.style.backgroundColor = "#bbdd6e";

		this.node.style.display = "flex";
		this.addText("(","h3",this.node);

		this.addGroup("Éléments à grouper","condition,valeur,math");

		this.addText(")","h3",this.node);
	}
}

class GroupMath extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","group,valeur,math");
		this.node.style.backgroundColor = "#bbdd6e";

		this.node.style.display = "flex";
		this.addText("(","h3",this.node);

		this.addGroup("Éléments à grouper","valeur,math");

		this.addText(")","h3",this.node);
	}
}

class Not extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","group");
		this.node.style.backgroundColor = "#d68f7a";

		this.node.style.display = "flex";
		this.addText("(","h3",this.node);
		this.addAnchor("not");
		this.addGroup("Élément à inverser","condition,valeur");

		this.addText(")","h3",this.node);
	}
}

class Line extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","line");
		this.node.style.backgroundColor = "#bed8d3";

		this.addCapsule("Faire","variable,valeur,math,group,action");
		this.addAnchor("endLine");
	}
}

class MathBloc extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","math,dependent,valeur,group");
		this.node.style.backgroundColor = "#c2a9cc";

		this.node.style.display = "flex";
		this.addSelect("select,operator",[["+","+"],["-","-"],["*","*"],["/","/"],["mod","%"]]);
		this.addCapsule("valeur","valeur,group")
	}
}

class InputNumber extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","valeur,math");
		this.node.style.backgroundColor = "#bed8d3";

		this.node.style.display = "flex";
		this.addInput("Nombre","input",/^\d*\.?\d*$/);
	}
}

class InputString extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","valeur,math");
		this.node.style.backgroundColor = "#d7e094";

		this.node.style.display = "flex";
		this.addInput("Mot","input,string",/^[a-zA-Z0-9.]*$/);
	}
}

class InputDev extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","valeur,math");
		this.node.style.backgroundColor = "#d7e094";

		this.node.style.display = "flex";
		this.addInput("Mot","input",/^[a-zA-Z0-9.]*$/);
	}
}

class NewVariable extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","valeur,math");
		this.node.style.backgroundColor = "#d7e094";

		this.node.style.display = "flex";
		this.addAnchor("let");
		this.addInput("Nom","localeVar",/^[a-zA-Z]*$/);
		this.addText(" est égal à ","h3",this.node);
		this.addAnchor("equal");
		this.addCapsule("valeur","valeur,group,math,object");
		this.addAnchor("endLine");
	}
}

class ConsoleOut extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","valeur,math");
		this.node.style.backgroundColor = "#d7e094";

		this.node.style.display = "flex";
		this.addAnchor("Console");
		this.addCapsule("valeur","valeur");
		this.addAnchor("endGroup");
		this.addAnchor("endLine");
	}
}

class Increment extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","valeur,math,line");
		this.node.style.backgroundColor = "#c69ace";

		this.node.style.display = "flex";
		let results = getVar().concat(getAttributes());
		if(results.length > 0){
			this.addText("Augmenter ","h3",this.node);
			this.addSelect("select,variable",results);
			this.addText(" de ","h3",this.node);
			this.addAnchor("increment");
			this.addCapsule("valeur","valeur,group,math")
			this.addAnchor("endLine");
		}

	}
}
class Decrement extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","valeur,math,line");
		this.node.style.backgroundColor = "#c69ace";

		this.node.style.display = "flex";
		let results = getVar().concat(getAttributes())
		if(results.length > 0){
			this.addText("Diminuer ","h3",this.node);
			this.addSelect("select,variable",results);
			this.addText(" de ","h3",this.node);
			this.addAnchor("decrement");
			this.addCapsule("valeur","valeur,group,math")
			this.addAnchor("endLine");
		}

	}
}
class ChangeVariable extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","valeur,math");
		this.node.style.backgroundColor = "#c69ace";

		this.node.style.display = "flex";
		let results = getVar().concat(getAttributes());
		if(results.length > 0){
			this.addSelect("select,variable",results);
			this.addText(" est égal à ","h3",this.node);
			this.addAnchor("equal");
			this.addCapsule("valeur","valeur,group,math,object")
			this.addAnchor("endLine");
		}
	}
}

class DeleteToken extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","block,line,action");
		this.node.style.backgroundColor = "#6d6a6b";

		this.addText("Supprimer le Jeton","h3",this.node);
		this.addAnchor("deleteToken");
		this.addAnchor("endLine");
	}
}

class BroadcastEffect extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","block,line,action");
		this.node.style.backgroundColor = "#b4db85";

		this.node.style.display = "flex";
		this.addText("Distribuer ","h3",this.node);
		this.addAnchor("broadcastEffect");
		this.addSelect("select,effect",getInputs());
		this.addText(" à tous les voisins","h3",this.node);
		this.addAnchor("endGroup");
		this.addAnchor("endLine");
	}
}

class GiveEffect extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","block,line,action");
		this.node.style.backgroundColor = "#b4db85";

		this.node.style.display = "flex";
		this.addText("Partager ","h3",this.node);
		this.addAnchor("shareEffect");
		this.addSelect("select,effect",getInputs());
		this.addText(" à un voisin aléatoire","h3",this.node);
		this.addAnchor("endGroup");
		this.addAnchor("endLine");
	}
}

class CreateToken extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","block,line,action");
		this.node.style.backgroundColor = "#b4db85";

		this.node.style.display = "flex";
		this.addText("Créer le Jeton ","h3",this.node);
		this.addAnchor("createToken");
		this.addSelect("select,token",getTokens());
		this.addAnchor("endGroup");
		this.addAnchor("endLine");
	}
}

class CreateEffect extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","block,line,action");
		this.node.style.backgroundColor = "#b4db85";

		this.node.style.display = "flex";
		this.addText("Ajouter l'effet ","h3",this.node);
		this.addAnchor("createEffect");
		this.addSelect("select,effect",getInputs());
		this.addAnchor("endGroup");
		this.addAnchor("endLine");
	}
}

class ListenInput extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","block,line,action");
		this.node.style.backgroundColor = "#b4db85";

		this.node.style.display = "flex";
		this.addText("Écouter l'effet ","h3",this.node);
		this.addAnchor("listenEffect");
		this.addSelect("select,effect",getInputs());
		this.addAnchor("endGroup");
		this.addAnchor("endLine");
	}
}

// ****************************************** To String Functions *******************************************

const dom2String = () =>{
	unresolvedInput = 0;
	methodBody = "";
	localeVars = {};
	method.listenedInputs = [];

	if(nodeIsEmpty(space,1)){
		selectedPiece = null;
		selectedTags = [];
		showButton();
	}

	recurseDomChildren(space);
	setTextNode('#editorHeader','Éditeur ('+unresolvedInput+')');
	if(stringBody){
		stringBody.innerHTML = methodBody;
	}
	method.unresolved = unresolvedInput;
	method.dom = saveDOM();
	method.body = methodBody;
}

// Dans Class Method
function recurseDomChildren(start)
{
	var nodes;
    if(start.childNodes)
    {
        nodes = start.childNodes;
        loopNodeChildren(nodes);
    }
}

function loopNodeChildren(nodes)
{
    var node;
    for(var i=0;i<nodes.length;i++)
    {
        node = nodes[i];

		outputNode(node);
        if(node.childNodes)
        {
            recurseDomChildren(node);
        }
    }
}

function outputNode(node)
{
    var whitespace = /^\s+$/g;
    if(node.nodeType === 1)
	{
		if(hasTag('checkInput',node)){
			methodBody += "obj.inputExist(";
		}

		if(hasTag('randomEvent',node)){
			methodBody += "obj.randomPerc(";
		}

		if(hasTag('slider',node)){
			methodBody += $( node ).slider("value");
		}

		if(hasTag('separator',node)){
			methodBody += ",";
		}

		if(hasTag('checkToken',node)){
			methodBody += "obj.tokenExist(";
		}

		if(hasTag('getInput',node)){
			methodBody += "obj.getInput(";
		}

		if(hasTag('Console',node)){
			methodBody += "console.log(";
		}
		if(hasTag('if',node)){
			methodBody += "if";
		}
		if(hasTag('else',node)){
			methodBody += "else";
		}
		if(hasTag('elseIf',node)){
			methodBody += "else if";
		}
		if(hasTag('and',node)){
			methodBody += "&&";
		}
		if(hasTag('or',node)){
			methodBody += "||";
		}
		if(hasTag('not',node)){
			methodBody += "!";
		}

		if(hasTag('let',node)){
			methodBody += "let ";
		}

		if(hasTag('equal',node)){
			methodBody += " = ";
		}
		if(hasTag('increment',node)){
			methodBody += " += ";
		}
		if(hasTag('decrement',node)){
			methodBody += " -= ";
		}

		if(hasTag('startCode',node)){
			methodBody += "{";
		}
		if(hasTag('endCode',node)){
			methodBody += "}  ";
		}
		if(hasTag('startGroup',node)){
			methodBody += "(";
		}
		if(hasTag('endGroup',node)){
			methodBody += ")";
		}
		if(hasTag('endLine',node)){
			methodBody += ";  ";
		}

		if(hasTag('select',node)){
			if(hasTag('effect',node) || hasTag('token',node)){
				methodBody += "'"+node.options[node.selectedIndex].value+"'";
			}else{
				methodBody += node.options[node.selectedIndex].value;
			}
		}

		if(hasTag('effect',node)){
			let txt = node.value;
			method.listenedInputs.push(txt);
		}
		if(hasTag('tileAtt',node)){
			let txt = node.options[node.selectedIndex].text;
			method.listenedInputs.push(txt);
		}

		if(hasTag('input',node)){
			let txt = node.value;
			if(txt.length <= 0){
				unresolvedInput++;
			}
			if(hasTag('string',node)){
				methodBody += "'"+txt+"'";
			}else{
				methodBody += txt;
			}
		}
		if(hasTag('localeVar',node)){
			let txt = node.value;
			if(txt.length <= 0){
				unresolvedInput++;
			}else{
				localeVars[txt] = true;
			}
			methodBody += txt;
		}
		if(hasTag('deleteToken',node)){
			methodBody += "obj.deleteToken()";
		}

		if(hasTag('broadcastEffect',node)){
			methodBody += "obj.broadcastEffect(";
		}

		if(hasTag('shareEffect',node)){
			methodBody += "obj.shareEffect(";
		}

		if(hasTag('createToken',node)){
			methodBody += "obj.createToken(";
		}
		if(hasTag('createEffect',node)){
			methodBody += "obj.putEffect(";
		}

		if(hasTag('listenEffect',node)){
			methodBody += "obj.listenInput(";
		}

		if(hasTag('capsule',node)){
			if(nodeIsEmpty(node,1)){
				unresolvedInput++;
			}
		}
		if(hasTag('dependent',node)){
			let prev = getPrev(node)
			if(prev == null || hasTag("hint",prev)){
				unresolvedInput++;
				node.style.border = "1px solid red";
			}else{
				node.style.border = "none";
			}
		}

    }
}

// ****************************************** Filter Input *******************************************

// Signed Int 				/^-?\d*$/.test(value)
// Unsigned Int 			/^\d*$/.test(value)
// Integer up to a limit 	/^\d*$/.test(value) && (value === "" || parseInt(value) <= 500)
// Floating Point			/^-?\d*[.,]?\d*$/.test(value)
//

function setInputFilter(textbox, inputFilter) {
	["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function(event) {
	  textbox.addEventListener(event, function() {
		if (inputFilter(this.value)) {
		  this.oldValue = this.value;
		  this.oldSelectionStart = this.selectionStart;
		  this.oldSelectionEnd = this.selectionEnd;
		} else if (this.hasOwnProperty("oldValue")) {
		  this.value = this.oldValue;
		  this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
		}
	  });
	});
  }