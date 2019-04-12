let inputs = {'fire':{name:'fire',power:50},'water':{name:'water'}};
let attributes = {'durability':500,'humidity':100};

let localeVars = {};

let space = null;
let methodBody = null;
let titleNode = null;

let selectedPiece = null;
let selectedTags = [];
let buttons = [];
let savedPiece = null;

let dom2JSON = null;
let unresolvedInput = 0;

let token = null;
let method = null;


const iniEditor = () =>{
	space = document.querySelector('#creationSpace');
	titleNode = document.querySelector('#stringTest');

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
		token = findElement(system.tokens,'name',getUrlVars()["token"],true);
		setTextNode('#tokenTitle',token.name);
		addAttributes('#listTokenAttributes',token.attributes,token,'token');
		fillList('#listTokenMethods',token.methods);
		addOnClickSaveMethod('#methodBtnSave');
		if(getUrlVars()["method"] == 'new'){
			method = {name:'',body:'',dom:'',unresolved:0};
			token.methods.push(method);
		}else{
			method = findElement(token.methods,'name',getUrlVars()["method"],true);
			fillInput('#titleMethod',method.name);
		}
	});
	setTextNode('#editorHeader','Éditeur ('+unresolvedInput+')');
}

const setTextNode = (id,text) =>{
	document.querySelector(id).innerHTML = text;
}

const addOnClickSaveMethod = (id) =>{
	document.querySelector(id).onclick = () =>{
		dom2String();
		if(document.querySelector('#titleMethod').value != ""){
			let data = {oldName:method.name};
			method.name = document.querySelector('#titleSystem').value;
			data['method'] = method;
			updateAPI(token.name,'token','saveMethod',data,(res)=>{

			});
		}else{
			alert('Entrez un nom');
		}
	}
}

// ****************************************** Event Action *******************************************

const unSelect=()=>{
	selectedPiece.style.boxShadow  = "none";
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
	if(selectedPiece && hasTag('newPiece',selectedPiece)){
		if(getPrev(selectedPiece)){
			document.querySelector('#editorBtnUp').classList.add("active");
		}else{
			document.querySelector('#editorBtnUp').classList.remove("active");
		}
	}else{
		document.querySelector('#editorBtnUp').classList.remove("active");
	}
}

const activeDownBtn = () =>{
	if(selectedPiece && hasTag('newPiece',selectedPiece)){
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
	}else{
		document.querySelector('#editorBtnDelete').classList.remove("active");
	}
}

const activeMoveBtn = () =>{
	if((selectedPiece && !hasTag('capsule',selectedPiece)) || savedPiece){
		document.querySelector('#editorBtnMove').classList.add("active");
	}else{
		document.querySelector('#editorBtnMove').classList.remove("active");
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
				}
			}else{
				if(tag=="main" || tag=="block" || tag=="line"){
					display = "block";
				}
			}
		});
		button.style.display = display;
	});
}

// ****************************************** Button Action *******************************************

const saveDOM = () =>{
	if(unresolvedInput>0){
		alert('Unresolved : '+unresolvedInput);
	}
	dom2JSON = toJSON(space);
	return dom2JSON;
}

const clearDOM = () =>{
	while (space.firstChild){
		space.removeChild(space.firstChild);
	}
	titleNode.innerHTML = "Hello";
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
		if(selectedPiece){
			if(hasTags(getTag(movedPiece),selectedPiece)){
				selectedPiece.appendChild(movedPiece);
				selectedPiece.querySelector(".hint").style.display = "none";
				savedPiece = null;
				unSelect();
			}
		}else{
			if(hasTags(['block','line'],movedPiece)){
				space.appendChild(movedPiece);
				savedPiece = null;
			}
		}

	}
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
			unSelect();
		}else{
			parent = getParent(selectedPiece);
		}
	}
	let piece = new type(parent);
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
	let results = Object.keys(inputs);
	let arr = [];
	results.forEach(input=>{
		arr.push([input]);
	});

	return arr;
}

const getAttributes = () =>{
	let results = Object.keys(attributes);
	let arr = [];
	results.forEach(attribute=>{
		arr.push([attribute,"obj.attributes['"+attribute+"']"]);
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

		options.forEach(option => {
			let newOption = document.createElement("option");
			let value = option[0];
			if(option[1]){
				value = option[1]
			}
			newOption.setAttribute("value",value);
			let text = document.createTextNode(option[0]);
			newOption.appendChild(text);
			selector.appendChild(newOption);
		});
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
		this.addSelect("select",[["égal à","=="],["plus grand que",">"],["plus petit que","<"],["plus grand ou egal que",">="],["plus petit ou egal que","<="],["n'égal pas","!="]]);
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
		this.addText("Jeton est affecté par ","h3",this.node);
		this.addAnchor("checkInput");
		this.addSelect("select",getInputs());
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
		this.addSelect("select",getInputs());
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
			this.addSelect("select",results);
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

		this.addCapsule("Faire","variable,valeur,math,group");
		this.addAnchor("endLine");
	}
}

class MathBloc extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","math,dependent,valeur,group");
		this.node.style.backgroundColor = "#c2a9cc";

		this.node.style.display = "flex";
		this.addSelect("select",[["+","+"],["-","-"],["*","*"],["/","/"],["mod","%"]]);
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
		this.addInput("Mot","input",/^[a-zA-Z0-9]*$/);
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
class Increment extends Piece{
	constructor(parent){
		super(parent);
		this.node.setAttribute("tags","valeur,math,line");
		this.node.style.backgroundColor = "#c69ace";

		this.node.style.display = "flex";
		let results = getVar().concat(getAttributes());
		if(results.length > 0){
			this.addText("Augmenter ","h3",this.node);
			this.addSelect("select",results);
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
		console.log(results)
		if(results.length > 0){
			this.addText("Diminuer ","h3",this.node);
			this.addSelect("select",results);
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
		console.log(results)
		if(results.length > 0){
			this.addSelect("select",results);
			this.addText(" est égal à ","h3",this.node);
			this.addAnchor("equal");
			this.addCapsule("valeur","valeur,group,math,object")
			this.addAnchor("endLine");
		}

	}
}
// ****************************************** To String Functions *******************************************

const dom2String = () =>{
	unresolvedInput = 0;
	methodBody = "";
	localeVars = {};

	if(nodeIsEmpty(space,1)){
		selectedPiece = null;
		selectedTags = [];
		showButton();
	}

	recurseDomChildren(space);
	setTextNode('#editorHeader','Éditeur ('+unresolvedInput+')');
	method.unresolved = unresolvedInput;
	titleNode.innerHTML = methodBody;
	// method.dom = saveDOM();
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
			methodBody += "inputExist(";
		}
		if(hasTag('getInput',node)){
			methodBody += "getInput(";
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
			methodBody += node.options[node.selectedIndex].value;
		}
		if(hasTag('input',node)){
			let txt = node.value;
			if(txt.length <= 0){
				unresolvedInput++;
			}
			methodBody += txt;
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

		if(hasTag('capsule',node)){
			if(nodeIsEmpty(node,1)){
				unresolvedInput++;
			}
		}
		if(hasTag('dependent',node)){
			let prev = getPrev(node)
			if(prev == null || hasTag("hint",prev)){
				console.log('danger')
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