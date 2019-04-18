let selectionSystems = null;

const getSystems = () => {
	selectionSystems = document.querySelector("#selection_systems");
	getApi('chooseSystemData', result => {
		result.systems.forEach(system => {
			addOption(system.id, system.title);
		});
	});
};

const addOption = (id, name) => {
	let node = document.createElement("option");
	node.setAttribute("value", id);
	let txt = document.createTextNode(name);
	node.appendChild(txt);

	selectionSystems.appendChild(node);
};

const addSystem = () => {
	let name = prompt("Entrez un nom pour le Système", "System");
	if (name != null && name != "") {
		let params = { name: name };
		postApi('addSystem', res => {
			if (res == 'SUCCESS') {
				window.location.href = "/crossroad.html";
			} else {
				alert(res);
			}
		}, params);
	}
};
window.onload = () => {
	modal = document.getElementById('dialogNewAttributes');
	dialogScript();
	inputScript();
};

const getApi = (route, action) => {
	let request = new XMLHttpRequest();
	request.open('GET', '/' + route, true);
	request.onload = () => {
		if (request.readyState === 4) {
			if (request.status >= 200 && request.status < 400) {
				let data = JSON.parse(request.response);
				console.log('Response:', data);
				action(data);
			} else {
				console.log('error');
			}
		}
	};
	request.send(null);
};

const postApi = (route, action, params) => {
	let request = new XMLHttpRequest();
	request.open('POST', '/' + route, true);
	request.setRequestHeader('Content-type', 'application/json');

	request.onreadystatechange = function () {
		if (request.readyState === 4) {
			if (request.status >= 200 && request.status < 400) {
				action(request.responseText);
			} else {
				console.log('error');
			}
		}
	};

	request.send(JSON.stringify(params));
};

function setInputFilter(textbox, inputFilter) {
	["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function (event) {
		textbox.addEventListener(event, function () {
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

const dialogScript = () => {
	// Get the modal
	if (modal) {
		// Get the button that opens the modal
		var btns = document.querySelectorAll(".modalBtn");

		// Get the <span> element that closes the modal
		var span = document.querySelector("#closeBtn");

		// When the user clicks the button, open the modal
		// btns.forEach(btn=>{
		// 	btn.onclick = ()=> {
		// 		modal.style.display = "block";
		// 	}
		// })


		// When the user clicks on <span> (x), close the modal
		span.onclick = function () {
			modal.style.display = "none";
			hideModal();
		};

		// When the user clicks anywhere outside of the modal, close it
		window.onclick = function (event) {
			if (event.target == modal) {
				modal.style.display = "none";
				hideModal();
			}
		};
	}
};

const inputScript = () => {
	/* Change format of file input */
	let input = document.querySelector('.inputfile');
	if (input) {
		let label = input.nextElementSibling,
		    labelVal = label.innerHTML;

		input.addEventListener('change', function (e) {
			var fileName = '';
			fileName = e.target.value.split('\\').pop();

			if (fileName) document.querySelector('#labelFile').innerHTML = fileName;else label.innerHTML = labelVal;
		});
	}

	/* Limits the inputs */
	inputs = document.querySelectorAll('.lineInput');
	let lineLimit = /^[a-fA-F0-9]*$/;

	[].forEach.call(inputs, function (input) {
		setInputFilter(input, function (value) {
			return lineLimit.test(value);
		});
	});

	inputs = document.querySelectorAll('.boxInput');
	let boxLimit = /^[a-zA-Z0-9]*$/;

	[].forEach.call(inputs, function (input) {
		setInputFilter(input, function (value) {
			return boxLimit.test(value);
		});
	});

	inputs = document.querySelectorAll('.titleInput');
	let titleLimit = /^[a-zA-Z0-9éèêà_]*$/;

	[].forEach.call(inputs, function (input) {
		setInputFilter(input, function (value) {
			return titleLimit.test(value);
		});
	});
};

const findElement = (array, key, value, element = true) => {
	for (let i = 0; i < array.length; i++) {
		if (array[i][key] == value) {
			return element ? array[i] : i;
		}
	}
};

function getUrlVars() {
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&!(#)]*)/gi, function (m, key, value) {
		vars[key] = value;
	});
	return vars;
}
let system = null;
let modal = null;

const iniDashboard = () => {
	getApi('systemChoiceData', result => {
		system = result;
		addOnClickSaveSystem('#systemBtnSave');
		fillInput('#titleSystem', system.title);

		fillInput('#colorBGTile', system.tile.Color);
		fillInput('#colorBorderTile', system.tile.Border);
		addAttributes('#listTileAttributes', system.tile.attributes, system.tile, 'tile');
		addOnClickModal('#addTileAttribute', '#listTileAttributes', system.tile, 'tile');

		fillInput('#colorBGBoard', system.board.Color);
		addAttributes('#listBoardAttributes', system.board.attributes, system.board, 'board');
		addOnClickModal('#addBoardAttribute', '#listBoardAttributes', system.board, 'board');

		addOpenEditor('#listTileMethods', system.tile.methods, null);
		fillList('#listTokens', system.tokens, showToken);
		document.querySelector('#addToken').onclick = createToken;

		fillList('#listEffects', system.effects, showEffect);
		document.querySelector('#addEffect').onclick = createEffect;

		changeBtn('#tileView', system.tile.Color, system.tile.Border);
		$('#colorBGTile').colpick({
			colorScheme: 'light',
			onChange: function (hsb, hex, rgb, el, bySetColor) {
				$(el).val(hex);
				changeBtn('#tileView', hex, document.querySelector('#colorBorderTile').value);
			}
		});

		$('#colorBorderTile').colpick({
			colorScheme: 'light',
			onChange: function (hsb, hex, rgb, el, bySetColor) {
				$(el).val(hex);
				changeBtn('#tileView', document.querySelector('#colorBGTile').value, hex);
			}
		});

		changeBtn('#boardView', system.board.Color, "");
		$('#colorBGBoard').colpick({
			colorScheme: 'light',
			onChange: function (hsb, hex, rgb, el, bySetColor) {
				$(el).val(hex);
				changeBtn('#boardView', hex, "");
			}
		});
	});
};

const fillInput = (id, value) => {
	document.querySelector(id).value = document.querySelector(id).defaultValue = value;
};

const fillList = (id, array, onclick = null) => {
	let parent = document.querySelector(id);
	while (parent.firstChild) {
		parent.removeChild(parent.firstChild);
	}
	for (let i = 0; i < array.length; i++) {
		let item = array[i];
		addElement(id, i, item, onclick);
	}
};

const addElement = (id, index, item, onclick) => {
	let parent = document.querySelector(id);
	let newElem = document.createElement('a');
	let txt = document.createTextNode(item.name);
	newElem.appendChild(txt);

	if (onclick) {
		newElem.onclick = () => {
			onclick(index);
		};
	}
	parent.appendChild(newElem);
};

const addAttributes = (id, array, element, type = 'token') => {
	let parent = document.querySelector(id);

	while (parent.firstChild) {
		parent.removeChild(parent.firstChild);
	}
	if (array) {
		for (let i = 0; i < array.length; i++) {
			let attribute = array[i];
			addAttribute(id, attribute, element, type);
		}
	}
};

const addAttribute = (id, attribute, element, type) => {
	let parent = document.querySelector(id);
	let newElem = document.createElement('a');
	let txt = document.createTextNode(attribute.name);
	newElem.appendChild(txt);
	newElem.setAttribute('href', '#');
	newElem.setAttribute('class', 'modalBtn');
	newElem.onclick = () => {
		showAttribute(attribute, newElem, element, type);
	};

	parent.appendChild(newElem);
};

const showAttribute = (attribute, node, element, type) => {
	fillInput('#titleAttribute', attribute.name);
	fillInput('#valueAttribute', attribute.value);
	modal.querySelector('#modalBtnDelete').style.display = 'block';

	modal.querySelector('#modalBtnDelete').onclick = () => {
		deleteAttribute(attribute, node, element, type);
	};

	modal.querySelector('#modalBtnSave').onclick = () => {
		saveAttribute(attribute, node, element, type);
	};

	showModal();
};

const deleteAttribute = (attribute, node, element, type) => {
	if (confirm('Voulez-vous vraiment supprimer cet Attributs?')) {
		updateAPI(element.name, type, 'deleteAttribute', { keyAttribute: attribute.name }, res => {
			element.attributes.splice(findElement(element.attributes, 'name', attribute.name, false), 1);
			node.remove();
			hideModal();
		});
	}
};

const saveAttribute = (attribute, node, element, type) => {
	let title = document.querySelector('#titleAttribute').value;
	let value = document.querySelector('#valueAttribute').value;
	let oldTitle = attribute.name;
	let newAttribute = { name: title, value: value };

	updateAPI(element.name, type, 'saveAttribute', { keyAttribute: oldTitle, attribute: newAttribute }, res => {
		attribute.name = title;
		attribute.value = value;
		node.innerHTML = title;

		hideModal();
	});
};

const createAttribute = (id, element, type) => {
	let title = document.querySelector('#titleAttribute').value;
	let value = document.querySelector('#valueAttribute').value;
	let attribute = { name: title, value: value };

	updateAPI(element.name, type, 'addAttribute', { attribute: attribute }, res => {
		element.attributes.push(attribute);
		addAttribute(id, attribute, element, type);
		hideModal();
	});
};

const createToken = () => {
	let tokenName = prompt("Entrez un nom pour le Jeton", "Jeton");
	if (tokenName != null && tokenName != "") {
		updateAPI(tokenName, 'tokens', 'addToken', {}, res => {
			let templateToken = { "name": tokenName,
				"Color": "",
				"Border": "",
				"Img": "",
				"attributes": [],
				"methods": [] };
			system.tokens.push(templateToken);
			addElement('#listTokens', system.tokens.length - 1, templateToken, showToken);

			showToken(system.tokens.length - 1);
		});
	}
};

const createEffect = () => {
	let effectName = prompt("Entrez un nom pour l'Effet", "Effet");
	if (effectName != null && effectName != "") {
		updateAPI(effectName, 'effects', 'addEffect', {}, res => {
			let templateEffect = { "name": effectName,
				"attributes": [] };
			system.effects.push(templateEffect);
			addElement('#listEffects', system.effects.length - 1, templateEffect, showEffect);

			showEffect(system.effects.length - 1);
		});
	}
};

const showToken = index => {
	let formToken = document.querySelector('#formToken');
	let formEffect = document.querySelector('#formEffect');
	let display = document.querySelector('#formToken').style.display;
	if (display == 'none') {
		formToken.style.display = 'block';
		formEffect.style.display = 'none';
		let token = system.tokens[index];
		addOnClickModal('#addTokenAttribute', '#listTokenAttributes', token, 'token');
		console.log(token.name);
		fillInput('#titleToken', token.name);
		fillInput('#colorBGToken', token.Color);
		fillInput('#colorBorderToken', token.Border);
		addAttributes('#listTokenAttributes', token.attributes, token);
		addOpenEditor('#listTokenMethods', token.methods, token.name);
		changeBtn('#tokenView', token.Color, token.Border);
		addOnClickSaveItem('#tokenBtnSave', token, 'token', '#titleToken', '#listTokens', '#colorBGToken', '#colorBorderToken');
		addOnClickdeleteElement('#tokenBtnDelete', token, 'token', 'deleteToken', system.tokens, '#listTokens');

		$('#colorBGToken').colpick({
			colorScheme: 'light',
			onChange: function (hsb, hex, rgb, el, bySetColor) {
				$(el).val(hex);
				changeBtn('#tokenView', hex, document.querySelector('#colorBorderToken').value);
			}
		});

		$('#colorBorderToken').colpick({
			colorScheme: 'light',
			onChange: function (hsb, hex, rgb, el, bySetColor) {
				$(el).val(hex);
				changeBtn('#tokenView', document.querySelector('#colorBGToken').value, hex);
			}
		});
		document.querySelector('#addTokenMethod').onclick = () => {
			window.location.href = "/methodEditor.html?token=" + token.name + "&method=new";
		};
	} else {
		formToken.style.display = 'none';
	}
};

const changeBtn = (id, bg, border) => {
	let btn = document.querySelector(id);
	if (bg) {
		btn.style.backgroundColor = '#' + bg;
	} else {
		btn.style.backgroundColor = 'transparent';
	}
	if (border) {
		btn.style.borderColor = '#' + border;
	} else {
		btn.style.borderColor = 'transparent';
	}
};

const showEffect = index => {
	let formToken = document.querySelector('#formToken');
	let formEffect = document.querySelector('#formEffect');
	let display = document.querySelector('#formEffect').style.display;
	if (display == 'none') {
		formEffect.style.display = 'block';
		formToken.style.display = 'none';
		let effect = system.effects[index];
		addOnClickModal('#addEffectAttribute', '#listEffectAttributes', effect, 'effect');

		fillInput('#titleEffect', effect.name);
		addAttributes('#listEffectAttributes', effect.attributes, effect, 'effect');
		addOnClickSaveItem('#effectBtnSave', effect, 'effects', '#titleEffect', '#listEffects');
		addOnClickdeleteElement('#effectBtnDelete', effect, 'effects', 'deleteEffect', system.effects, '#listEffects');
	} else {
		formEffect.style.display = 'none';
	}
};

const addOpenEditor = (id, array, name) => {
	let parent = document.querySelector(id);
	while (parent.firstChild) {
		parent.removeChild(parent.firstChild);
	}
	if (array) {
		for (let i = 0; i < array.length; i++) {
			let item = array[i];
			addElement(id, i, item, () => {
				let tokenStr = "";
				if (name) {
					tokenStr = "token=" + name + "&";
				}
				window.location.href = "/methodEditor.html?" + tokenStr + "method=" + item.name;
			});
		}
	}
};

const addOnClickModal = (id, listnode, item, type) => {
	document.querySelector(id).onclick = () => {
		modal.querySelector('#modalBtnDelete').style.display = 'none';
		modal.querySelector('#modalBtnSave').onclick = () => {
			createAttribute(listnode, item, type);
		};
		showModal();
	};
};

const addOnClickdeleteElement = (id, item, type, action, list, container) => {
	document.querySelector(id).onclick = () => {
		if (confirm('Voulez-vous vraiment supprimer cet Attributs?')) {
			updateAPI(item.name, type, action, {}, res => {
				list.splice(findElement(list, 'name', item.name, false), 1);
				let node = findNode(document.querySelector(container), item.name);
				node.remove();
				formToken.style.display = 'none';
				formEffect.style.display = 'none';
			});
		}
	};
};

const addOnClickSaveItem = (id, item, type, nameId, container, colorId = null, borderId = null) => {
	document.querySelector(id).onclick = () => {
		let data = { name: document.querySelector(nameId).value };

		if (colorId) {
			data.Color = document.querySelector(colorId).value;
		}
		if (borderId) {
			data.Border = document.querySelector(borderId).value;
		}
		let oldTitle = item.name;
		updateAPI(oldTitle, type, 'saveItem', data, res => {
			item.name = document.querySelector(nameId).value;
			if (colorId) {
				item.Color = document.querySelector(colorId).value;
			}
			if (borderId) {
				item.Border = document.querySelector(borderId).value;
			}
			let node = findNode(document.querySelector(container), oldTitle);
			node.innerHTML = item.name;
			formToken.style.display = 'none';
			formEffect.style.display = 'none';
		});
	};
};

const addOnClickSaveSystem = id => {
	document.querySelector(id).onclick = () => {
		let data = {};
		data['title'] = document.querySelector('#titleSystem').value;
		data['tileColor'] = document.querySelector('#colorBGTile').value;
		data['tileBorder'] = document.querySelector('#colorBorderTile').value;
		data['boardColor'] = document.querySelector('#colorBGBoard').value;
		updateAPI(null, 'system', 'saveSystem', data, res => {
			system.title = data.title;
			system.tile.Color = data.tileColor;
			system.tile.Board = data.tileBoard;
			system.board.Color = data.boardColor;
		});
	};
};

const updateAPI = (item, type, action, data, callback) => {
	let params = { key: item, data: data, type: type };
	postApi(action, res => {
		if (res == 'SUCCESS') {
			callback(res);
		} else {
			alert(res);
		}
	}, params);
};

const showModal = () => {
	modal.style.display = "block";
};

const hideModal = () => {
	fillInput('#titleAttribute', '');
	fillInput('#valueAttribute', '');
	modal.style.display = "none";
};

const findNode = (container, value) => {
	var childs = container.childNodes;
	for (let i = 0; i < childs.length; i++) {
		if (childs[i].innerHTML == value) {
			return childs[i];
		}
	}
};

const deleteSystem = () => {
	if (confirm('Voulez-vous vraiment supprimer ce Système?')) {
		let params = {};
		postApi('deleteSystem', res => {
			if (res == 'SUCCESS') {
				window.location.href = "/chooseSystem.html";
			} else {
				alert(res);
			}
		}, params);
	}
};
let board = { attributes: [], color: '#ede1c9' };

let iniTile = { attributes: [], color: '#ede1c9', border: '#8e8a6b', selected: '#436177', methods: [{ name: 'onFire', arguments: 'obj', body: "" }] };

let iniTokenArbre = { name: 'Arbre',
						color: '#8dae7f',
						border: '#547048',
						attributes: { durability: 500 },
						listenedInputs: ['fire'],
						methods: [{ name: 'dealFire', arguments: 'obj', body: "let input = getInput(obj.inputs,'fire'); if(input){obj.attributes['durability'] -= input.power;obj.addInput(obj.outputs,input);}" }, { name: 'destroyToken', arguments: 'obj', body: "if(obj.attributes['durability']<=0){obj.addInput(obj.outputs,{name:'destroyChild',elem:obj.id})}" }]
};

let iniTokenFire = { name: 'Fire',
						color: '#f4b642',
						border: '#995037',
						attributes: {},
						listenedInputs: ['fire'],
						methods: [{ name: 'destroyToken', arguments: 'obj', body: "if(!getInput(obj.inputs,'fire')){obj.addInput(obj.outputs,{name:'destroyChild',elem:obj.id})}" }]
};

let inputFire = { name: 'fire',
						power: 10
};
function toJSON(node) {
	node = node || this;
	var obj = {
		nodeType: node.nodeType
	};
	if (node.tagName) {
		obj.tagName = node.tagName.toLowerCase();
	} else if (node.nodeName) {
		obj.nodeName = node.nodeName;
	}

	if (node.nodeValue) {
		obj.nodeValue = node.nodeValue;
	}

	var attrs = node.attributes;
	if (attrs) {
		var length = attrs.length;
		var arr = obj.attributes = new Array(length);
		for (var i = 0; i < length; i++) {
			attr = attrs[i];
			arr[i] = [attr.nodeName, attr.nodeValue];
		}
	}
	var childNodes = node.childNodes;
	if (childNodes) {
		length = childNodes.length;
		arr = obj.childNodes = new Array(length);
		for (i = 0; i < length; i++) {
			arr[i] = toJSON(childNodes[i]);
		}
	}
	if (node instanceof HTMLInputElement || node instanceof HTMLSelectElement) {
		arr = obj.value = node.value;
	}
	return obj;
}

function toDOM(obj) {
	if (typeof obj == 'string') {
		obj = JSON.parse(obj);
	}

	var node,
	    nodeType = obj.nodeType;

	switch (nodeType) {
		case 1:
			//ELEMENT_NODE
			node = document.createElement(obj.tagName);
			var attributes = obj.attributes || [];
			for (var i = 0, len = attributes.length; i < len; i++) {
				var attr = attributes[i];
				node.setAttribute(attr[0], attr[1]);
			}
			break;
		case 3:
			//TEXT_NODE
			node = document.createTextNode(obj.nodeValue);
			break;
		case 8:
			//COMMENT_NODE
			node = document.createComment(obj.nodeValue);
			break;
		case 9:
			//DOCUMENT_NODE
			node = document.implementation.createDocument();
			break;
		case 10:
			//DOCUMENT_TYPE_NODE
			node = document.implementation.createDocumentType(obj.nodeName);
			break;
		case 11:
			//DOCUMENT_FRAGMENT_NODE
			node = document.createDocumentFragment();
			break;
		default:
			return node;
	}
	if (nodeType == 1 || nodeType == 11) {
		var childNodes = obj.childNodes || [];
		for (i = 0, len = childNodes.length; i < len; i++) {
			node.appendChild(toDOM(childNodes[i]));
		}
	}

	if (obj.tagName == "select" && hasTag('variable', node)) {
		clearSelectOptions(node);
		let options = getVar().concat(getAttributes());
		console.log(options);
		addSelectOptions(node, options);
	}
	if (obj.value) {
		node.value = obj.value;
		node.defaultValue = obj.value;
	}
	return node;
}

// https://gist.github.com/sstur/7379870
let inputs = { 'fire': { name: 'fire', power: 50 }, 'water': { name: 'water' } };
let attributes = { 'durability': 500, 'humidity': 100 };

let localeVars = {};

let space = null;
let methodBody = null;

let selectedPiece = null;
let selectedTags = [];
let buttons = [];
let savedPiece = null;

let dom2JSON = null;
let unresolvedInput = 0;

let token = null;
let method = null;

const iniEditor = () => {
	space = document.querySelector('#creationSpace');

	space.onclick = e => {
		if (selectedPiece) {
			unSelect();
		}
	};

	buttons = document.querySelectorAll('#listPieces button');
	showButton();
	getApi('methodEditor', result => {
		system = result;
		setTextNode('#titleSystem', system.title);
		if (getUrlVars()["token"]) {
			token = findElement(system.tokens, 'name', getUrlVars()["token"], true);
			setTextNode('#tokenTitle', token.name);
			addOnClickSaveMethod('#methodBtnSave', token.name, 'token');
			addOnClickDeleteMethod('#methodBtnDelete', token.name, 'token');
		} else {
			token = system.tile;
			setTextNode('#tokenTitle', "Tiles");
			addOnClickSaveMethod('#methodBtnSave', token, 'tile');
			addOnClickDeleteMethod('#methodBtnDelete', token, 'tile');
		}

		addAttributes('#listTokenAttributes', token.attributes, token, 'token');

		fillList('#listTokenMethods', token.methods);

		if (getUrlVars()["method"] == 'new') {
			method = { name: '', body: '', dom: '', unresolved: 0 };
			token.methods.push(method);
		} else {
			method = findElement(token.methods, 'name', getUrlVars()["method"], true);
			fillInput('#titleMethod', getUrlVars()["method"]);
			dom2JSON = method.dom;
			methodBody = method.body;
			restoreDOM();
		}
	});
	setTextNode('#editorHeader', 'Éditeur (' + unresolvedInput + ')');
};

const setTextNode = (id, text) => {
	document.querySelector(id).innerHTML = text;
};

const addOnClickSaveMethod = (id, key, type = 'token') => {
	document.querySelector(id).onclick = () => {
		dom2String();
		if (document.querySelector('#titleMethod').value != "") {
			let data = { oldName: method.name };
			method.name = document.querySelector('#titleMethod').value;
			data['method'] = method;
			updateAPI(key, type, 'saveMethod', data, res => {
				let tokenStr = "";
				if (getUrlVars()["token"]) {
					tokenStr = "token=" + token.name + "&";
				}
				window.location.href = "/methodEditor.html?" + tokenStr + "method=" + method.name;
			});
		} else {
			alert('Entrez un nom');
		}
	};
};

const addOnClickDeleteMethod = (id, key, type = 'token') => {
	document.querySelector(id).onclick = () => {
		if (confirm('Voulez-vous vraiment supprimer cette Méthode?')) {
			let data = { oldName: method.name };
			updateAPI(key, type, 'deleteMethod', data, res => {
				window.location.href = "/dashboard.html";
			});
		}
	};
};

// ****************************************** Event Action *******************************************

const unSelect = () => {
	if (selectedPiece) {
		selectedPiece.style.boxShadow = "none";
	}
	selectedPiece = null;
	selectedTags = null;

	showButton();
};

const select = (event, node) => {
	if (selectedPiece) {
		unSelect();
	}
	node.style.boxShadow = "0px 0px 0px 2px #9acecb inset";
	selectedPiece = node;

	selectedTags = getTag(node);

	showButton();

	event.stopPropagation();
};

const activeUpBtn = () => {
	if (selectedPiece && selectedPiece.getAttribute("class") == "newPiece") {
		let prev = getPrev(selectedPiece);
		if (prev && !hasTag('hint', prev)) {
			document.querySelector('#editorBtnUp').classList.add("active");
		} else {
			document.querySelector('#editorBtnUp').classList.remove("active");
		}
	} else {
		document.querySelector('#editorBtnUp').classList.remove("active");
	}
};

const activeDownBtn = () => {
	if (selectedPiece && selectedPiece.getAttribute("class") == "newPiece") {
		if (getNext(selectedPiece)) {
			document.querySelector('#editorBtnDown').classList.add("active");
		} else {
			document.querySelector('#editorBtnDown').classList.remove("active");
		}
	} else {
		document.querySelector('#editorBtnDown').classList.remove("active");
	}
};

const activeDeleteBtn = () => {
	if (selectedPiece && !hasTag('capsule', selectedPiece)) {
		document.querySelector('#editorBtnDelete').classList.add("active");
		document.querySelector('#editorBtnDelete').classList.add("delete");
	} else {
		document.querySelector('#editorBtnDelete').classList.remove("active");
		document.querySelector('#editorBtnDelete').classList.remove("delete");
	}
};

const activeMoveBtn = () => {
	if (selectedPiece && !hasTag('capsule', selectedPiece) || savedPiece) {
		document.querySelector('#editorBtnMove').classList.add("active");
	} else {
		document.querySelector('#editorBtnMove').classList.remove("active");
	}
	if (savedPiece) {
		document.querySelector('#editorBtnMove').classList.add("move");
	} else {
		document.querySelector('#editorBtnMove').classList.remove("move");
	}
};

const showButton = () => {
	activeUpBtn();
	activeDownBtn();
	activeDeleteBtn();
	activeMoveBtn();
	buttons.forEach(button => {
		let display = "none";
		let tags = getTag(button);
		tags.forEach(tag => {
			if (selectedPiece) {
				if (selectedTags.indexOf(tag) >= 0 || tag == "main") {
					display = "block";
				}
			} else {
				if (tag == "main" || tag == "block" || tag == "line") {
					display = "block";
				}
			}
		});
		button.style.display = display;
	});
};

// ****************************************** Button Action *******************************************

const saveDOM = () => {
	dom2JSON = toJSON(space);
	return dom2JSON;
};

const clearDOM = () => {
	while (space.firstChild) {
		space.removeChild(space.firstChild);
	}
};

const restoreDOM = () => {
	if (dom2JSON) {
		let json2DOM = toDOM(dom2JSON);
		space.replaceWith(json2DOM);
		space = document.querySelector('#creationSpace');
	}
	dom2String();
};

const deleteNode = () => {
	if (selectedPiece) {
		if (selectedPiece.getAttribute("class") == "newPiece") {
			removePiece();
		}
	}

	dom2String();
};

const savePiece = () => {
	if (!savedPiece) {
		if (selectedPiece) {
			savedPiece = toJSON(selectedPiece);
			removePiece();
			dom2String();
		}
	} else {
		restorePiece();
	}
};

const restorePiece = () => {
	if (savedPiece) {
		let movedPiece = toDOM(savedPiece);
		if (selectedPiece && hasTag('capsule', selectedPiece)) {
			if (hasTags(getTag(movedPiece), selectedPiece)) {
				selectedPiece.appendChild(movedPiece);

				selectedPiece.querySelector(".hint").style.display = "none";
				selectedPiece.style.border = "none";

				savedPiece = null;
				unSelect();
			}
		} else {
			if (hasTags(['block', 'line'], movedPiece)) {
				space.appendChild(movedPiece);
				savedPiece = null;
				unSelect();
			}
		}
	}
	activeMoveBtn();
	dom2String();
};

const removePiece = (piece = selectedPiece) => {
	let prev = getPrev(piece);
	let next = getNext(piece);
	let parent = getParent(piece);
	if (prev && hasTag("hint", prev) && nodeIsEmpty(parent, 2)) {
		prev.style.display = "inline";
		parent.style.border = "1px solid red";
	}
	selectedPiece.remove();

	showButton();
};

const createPiece = type => {
	let parent = space;
	if (selectedPiece) {
		if (hasTag("capsule", selectedPiece)) {
			parent = selectedPiece;
			unresolvedInput--;
			selectedPiece.style.border = "none";
			parent.querySelector(".hint").style.display = "none";
		} else {
			parent = getParent(selectedPiece);
		}
	}
	let piece = new type(parent);
	unSelect();
	dom2String();
};

const upNode = () => {
	if (selectedPiece) {
		let prev = getPrev(selectedPiece);
		let parent = getParent(selectedPiece);
		if (prev) {
			parent.insertBefore(selectedPiece, prev);
		}
	}
	showButton();
	dom2String();
};

const downNode = () => {
	if (selectedPiece) {
		let next = getNext(selectedPiece);
		let parent = getParent(selectedPiece);
		if (next) {
			parent.insertBefore(next, selectedPiece);
		}
	}
	showButton();
	dom2String();
};

// ****************************************** Getter Node and Tag *******************************************

const getTag = node => {
	let tags = null;
	let s_tags = node.getAttribute("tags");
	if (s_tags) {
		tags = s_tags.split(',');
	}
	return tags;
};

const hasTag = (tag, node) => {
	let tags = getTag(node);
	if (tags != null) {
		return tags.indexOf(tag) > -1;
	}
	return false;
};

const hasTags = (tags, node) => {
	let result = false;
	tags.forEach(tag => {
		if (hasTag(tag, node)) {
			result = true;
		}
	});
	return result;
};

const getPrev = node => {
	return node.previousElementSibling;
};
const getNext = node => {
	return node.nextElementSibling;
};
const getParent = node => {
	return node.parentNode;
};
const nodeIsEmpty = (node, limit) => {
	return node.childNodes.length <= limit;
};

// ************************************** Getter Input && Attribute ****************************************
const getInputs = () => {
	let results = system.effects;
	let arr = [];
	results.forEach(input => {
		arr.push([input.name]);
	});

	return arr;
};

const getAttributes = () => {
	let results = token.attributes;
	let arr = [];
	results.forEach(attribute => {
		arr.push([attribute.name, "obj.attributes['" + attribute.name + "']"]);
	});

	return arr;
};

const getVar = () => {
	let results = Object.keys(localeVars);
	let arr = [];
	results.forEach(localVar => {
		arr.push([localVar]);
	});

	return arr;
};

const clearSelectOptions = select => {
	let length = select.options.length;
	for (let i = 0; i < length; i++) {
		select.options[i] = null;
	}
};

const addSelectOptions = (select, options) => {
	options.forEach(option => {
		let newOption = document.createElement("option");
		let value = option[0];
		if (option[1]) {
			value = option[1];
		}
		newOption.setAttribute("value", value);
		let text = document.createTextNode(option[0]);
		newOption.appendChild(text);
		select.appendChild(newOption);
	});
};

// ****************************************** Class Pieces *******************************************

class Piece {
	constructor(parent) {
		let newElem = document.createElement("div");
		newElem.setAttribute("class", "newPiece");
		newElem.setAttribute("onClick", "select(event,this)");
		parent.appendChild(newElem);
		this.node = newElem;
	}

	addText(title, type, parent, hint = false) {
		let h3 = document.createElement(type);
		let t = document.createTextNode(title);

		if (hint) {
			h3.setAttribute("class", "hint");
			h3.setAttribute("tags", "hint");
		}

		h3.appendChild(t);
		parent.appendChild(h3);
	}
	addCapsule(text, tags) {
		let container = document.createElement("div");
		container.setAttribute("class", "capsule");
		container.setAttribute("onClick", "select(event,this)");
		container.setAttribute("tags", tags + ",capsule");
		container.style.border = "solid 1px red";
		this.addText(text, "p", container, true);

		this.node.appendChild(container);
	}
	addAnchor(tags) {
		let container = document.createElement("div");
		container.setAttribute("class", "anchor");
		container.setAttribute("tags", tags);
		this.node.appendChild(container);
	}

	addSelect(tags, options) {
		let selector = document.createElement("SELECT");
		selector.setAttribute("tags", tags);
		this.node.appendChild(selector);

		this.node.onchange = function () {
			dom2String();
		};

		addSelectOptions(selector, options);
	}

	addBloc(txt) {
		this.addAnchor("startCode");
		this.addCapsule(txt, "block,line");
		this.addAnchor("endCode");
	}

	addGroup(txt, tags) {
		this.addAnchor("startGroup");
		this.addCapsule(txt, tags);
		this.addAnchor("endGroup");
	}

	addInput(txt, tags, limit) {
		let selector = document.createElement("input");
		selector.type = "text";
		selector.placeholder = txt;
		selector.setAttribute("tags", tags);

		setInputFilter(selector, function (value) {
			return limit.test(value);
		});
		selector.setAttribute("onchange", "dom2String()");

		this.node.appendChild(selector);
	}
}

class When extends Piece {
	constructor(parent) {
		super(parent);
		this.node.setAttribute("tags", "block,line");
		this.node.style.backgroundColor = "#d8ca97";

		this.addAnchor("if");
		this.addText("Quand", "h3", this.node);
		this.addGroup("Condition", "condition,group");
		this.addBloc("Faire");
	}
}

class Else extends Piece {
	constructor(parent) {
		super(parent);
		this.node.setAttribute("tags", "block,dependent,line");
		this.node.style.backgroundColor = "#c1d897";

		this.addAnchor("else");
		this.addText("Sinon", "h3", this.node);
		this.addBloc("Faire");
	}
}

class ElseIf extends Piece {
	constructor(parent) {
		super(parent);
		this.node.setAttribute("tags", "block,dependent,line");
		this.node.style.backgroundColor = "#b3e2d3";

		this.addAnchor("elseIf");
		this.addText("Sinon si", "h3", this.node);
		this.addGroup("Condition", "condition,group");
		this.addBloc("Faire");
	}
}

class Comparaison extends Piece {
	constructor(parent) {
		super(parent);
		this.node.setAttribute("tags", "condition,group");
		this.node.style.backgroundColor = "#bbdd6e";

		this.node.style.display = "flex";
		this.addAnchor("startGroup");
		this.addCapsule("valeur", "valeur,math");
		this.addSelect("select,comparaison", [["égal à", "=="], ["plus grand que", ">"], ["plus petit que", "<"], ["plus grand ou egal que", ">="], ["plus petit ou egal que", "<="], ["n'égal pas", "!="]]);
		this.addCapsule("valeur", "valeur,math");
		this.addAnchor("endGroup");
	}
}

class CheckInput extends Piece {
	constructor(parent) {
		super(parent);
		this.node.setAttribute("tags", "condition,group");
		this.node.style.backgroundColor = "#bbdd6e";

		this.node.style.display = "flex";
		this.addText("Jeton est affecté par ", "h3", this.node);
		this.addAnchor("checkInput");
		this.addSelect("select,input", getInputs());
		this.addAnchor("endGroup");
	}
}

class GetInput extends Piece {
	constructor(parent) {
		super(parent);
		this.node.setAttribute("tags", "valeur,group");
		this.node.style.backgroundColor = "#bbdd6e";

		this.node.style.display = "flex";
		this.addAnchor("getInput");
		this.addSelect("select,input", getInputs());
		this.addAnchor("endGroup");
	}
}

class GetLocaleVar extends Piece {
	constructor(parent) {
		super(parent);
		this.node.setAttribute("tags", "valeur,group");
		this.node.style.backgroundColor = "#bbdd6e";
		this.node.style.display = "flex";

		let results = getVar().concat(getAttributes());
		if (results.length > 0) {
			this.addSelect("select,variable", results);
		}
	}
}

class And extends Piece {
	constructor(parent) {
		super(parent);
		this.node.setAttribute("tags", "condition,dependent,group");
		this.node.style.backgroundColor = "#ddb46e";

		//this.node.style.display = "flex";
		this.addText("Et", "h3", this.node);
		this.addAnchor("and");
		this.addCapsule("valeur", "condition");
	}
}

class Or extends Piece {
	constructor(parent) {
		super(parent);
		this.node.setAttribute("tags", "condition,dependent,group");
		this.node.style.backgroundColor = "#ddb46e";

		//this.node.style.display = "flex";
		this.addText("Ou", "h3", this.node);
		this.addAnchor("or");
		this.addCapsule("valeur", "condition");
	}
}

class Group extends Piece {
	constructor(parent) {
		super(parent);
		this.node.setAttribute("tags", "group,condition");
		this.node.style.backgroundColor = "#bbdd6e";

		this.node.style.display = "flex";
		this.addText("(", "h3", this.node);

		this.addGroup("Éléments à grouper", "condition,valeur,math");

		this.addText(")", "h3", this.node);
	}
}

class GroupMath extends Piece {
	constructor(parent) {
		super(parent);
		this.node.setAttribute("tags", "group,valeur,math");
		this.node.style.backgroundColor = "#bbdd6e";

		this.node.style.display = "flex";
		this.addText("(", "h3", this.node);

		this.addGroup("Éléments à grouper", "valeur,math");

		this.addText(")", "h3", this.node);
	}
}

class Not extends Piece {
	constructor(parent) {
		super(parent);
		this.node.setAttribute("tags", "group");
		this.node.style.backgroundColor = "#d68f7a";

		this.node.style.display = "flex";
		this.addText("(", "h3", this.node);
		this.addAnchor("not");
		this.addGroup("Élément à inverser", "condition,valeur");

		this.addText(")", "h3", this.node);
	}
}

class Line extends Piece {
	constructor(parent) {
		super(parent);
		this.node.setAttribute("tags", "line");
		this.node.style.backgroundColor = "#bed8d3";

		this.addCapsule("Faire", "variable,valeur,math,group");
		this.addAnchor("endLine");
	}
}

class MathBloc extends Piece {
	constructor(parent) {
		super(parent);
		this.node.setAttribute("tags", "math,dependent,valeur,group");
		this.node.style.backgroundColor = "#c2a9cc";

		this.node.style.display = "flex";
		this.addSelect("select,operator", [["+", "+"], ["-", "-"], ["*", "*"], ["/", "/"], ["mod", "%"]]);
		this.addCapsule("valeur", "valeur,group");
	}
}

class InputNumber extends Piece {
	constructor(parent) {
		super(parent);
		this.node.setAttribute("tags", "valeur,math");
		this.node.style.backgroundColor = "#bed8d3";

		this.node.style.display = "flex";
		this.addInput("Nombre", "input", /^\d*\.?\d*$/);
	}
}

class InputString extends Piece {
	constructor(parent) {
		super(parent);
		this.node.setAttribute("tags", "valeur,math");
		this.node.style.backgroundColor = "#d7e094";

		this.node.style.display = "flex";
		this.addInput("Mot", "input", /^[a-zA-Z0-9]*$/);
	}
}

class NewVariable extends Piece {
	constructor(parent) {
		super(parent);
		this.node.setAttribute("tags", "valeur,math");
		this.node.style.backgroundColor = "#d7e094";

		this.node.style.display = "flex";
		this.addAnchor("let");
		this.addInput("Nom", "localeVar", /^[a-zA-Z]*$/);
		this.addText(" est égal à ", "h3", this.node);
		this.addAnchor("equal");
		this.addCapsule("valeur", "valeur,group,math,object");
		this.addAnchor("endLine");
	}
}
class Increment extends Piece {
	constructor(parent) {
		super(parent);
		this.node.setAttribute("tags", "valeur,math,line");
		this.node.style.backgroundColor = "#c69ace";

		this.node.style.display = "flex";
		let results = getVar().concat(getAttributes());
		if (results.length > 0) {
			this.addText("Augmenter ", "h3", this.node);
			this.addSelect("select,variable", results);
			this.addText(" de ", "h3", this.node);
			this.addAnchor("increment");
			this.addCapsule("valeur", "valeur,group,math");
			this.addAnchor("endLine");
		}
	}
}
class Decrement extends Piece {
	constructor(parent) {
		super(parent);
		this.node.setAttribute("tags", "valeur,math,line");
		this.node.style.backgroundColor = "#c69ace";

		this.node.style.display = "flex";
		let results = getVar().concat(getAttributes());
		console.log(results);
		if (results.length > 0) {
			this.addText("Diminuer ", "h3", this.node);
			this.addSelect("select,variable", results);
			this.addText(" de ", "h3", this.node);
			this.addAnchor("decrement");
			this.addCapsule("valeur", "valeur,group,math");
			this.addAnchor("endLine");
		}
	}
}
class ChangeVariable extends Piece {
	constructor(parent) {
		super(parent);
		this.node.setAttribute("tags", "valeur,math");
		this.node.style.backgroundColor = "#c69ace";

		this.node.style.display = "flex";
		let results = getVar().concat(getAttributes());
		console.log(results);
		if (results.length > 0) {
			this.addSelect("select,variable", results);
			this.addText(" est égal à ", "h3", this.node);
			this.addAnchor("equal");
			this.addCapsule("valeur", "valeur,group,math,object");
			this.addAnchor("endLine");
		}
	}
}
// ****************************************** To String Functions *******************************************

const dom2String = () => {
	unresolvedInput = 0;
	methodBody = "";
	localeVars = {};

	if (nodeIsEmpty(space, 1)) {
		selectedPiece = null;
		selectedTags = [];
		showButton();
	}

	recurseDomChildren(space);
	setTextNode('#editorHeader', 'Éditeur (' + unresolvedInput + ')');
	method.unresolved = unresolvedInput;
	method.dom = saveDOM();
	method.body = methodBody;
};

// Dans Class Method
function recurseDomChildren(start) {
	var nodes;
	if (start.childNodes) {
		nodes = start.childNodes;
		loopNodeChildren(nodes);
	}
}

function loopNodeChildren(nodes) {
	var node;
	for (var i = 0; i < nodes.length; i++) {
		node = nodes[i];

		outputNode(node);
		if (node.childNodes) {
			recurseDomChildren(node);
		}
	}
}

function outputNode(node) {
	var whitespace = /^\s+$/g;
	if (node.nodeType === 1) {
		if (hasTag('checkInput', node)) {
			methodBody += "inputExist(";
		}
		if (hasTag('getInput', node)) {
			methodBody += "getInput(";
		}

		if (hasTag('if', node)) {
			methodBody += "if";
		}
		if (hasTag('else', node)) {
			methodBody += "else";
		}
		if (hasTag('elseIf', node)) {
			methodBody += "else if";
		}
		if (hasTag('and', node)) {
			methodBody += "&&";
		}
		if (hasTag('or', node)) {
			methodBody += "||";
		}
		if (hasTag('not', node)) {
			methodBody += "!";
		}

		if (hasTag('let', node)) {
			methodBody += "let ";
		}

		if (hasTag('equal', node)) {
			methodBody += " = ";
		}
		if (hasTag('increment', node)) {
			methodBody += " += ";
		}
		if (hasTag('decrement', node)) {
			methodBody += " -= ";
		}

		if (hasTag('startCode', node)) {
			methodBody += "{";
		}
		if (hasTag('endCode', node)) {
			methodBody += "}  ";
		}
		if (hasTag('startGroup', node)) {
			methodBody += "(";
		}
		if (hasTag('endGroup', node)) {
			methodBody += ")";
		}
		if (hasTag('endLine', node)) {
			methodBody += ";  ";
		}

		if (hasTag('select', node)) {
			methodBody += node.options[node.selectedIndex].value;
		}
		if (hasTag('input', node)) {
			let txt = node.value;
			if (txt.length <= 0) {
				unresolvedInput++;
			}
			methodBody += txt;
		}
		if (hasTag('localeVar', node)) {
			let txt = node.value;
			if (txt.length <= 0) {
				unresolvedInput++;
			} else {
				localeVars[txt] = true;
			}
			methodBody += txt;
		}

		if (hasTag('capsule', node)) {
			if (nodeIsEmpty(node, 1)) {
				unresolvedInput++;
			}
		}
		if (hasTag('dependent', node)) {
			let prev = getPrev(node);
			if (prev == null || hasTag("hint", prev)) {
				console.log('danger');
				unresolvedInput++;
				node.style.border = "1px solid red";
			} else {
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
	["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function (event) {
		textbox.addEventListener(event, function () {
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
class Master {
	constructor(id, attributes) {
		this.id = id;
		this.children = [];
		this.attributes = attributes;
		this.methods = [];

		this.inputs = [];
		this.nextInputs = [];
		this.outputs = [];

		this.posX = 0;
		this.posY = 0;
		this.size = 0;
	}

	// ---------------------------------------------------------------------------------------------
	// Méthodes D'initialisation
	// ---------------------------------------------------------------------------------------------
	// Créé les méthodes données en string et les ajoutes à un tableau
	installMethods(methods) {
		methods.forEach(method => {
			var f = new Function(method.arguments, method.body);
			this.methods.push(f);
		});
	}

	// Ajoute l'input donnée (en json)
	addInput(arr, input) {
		if (!getInput(arr, input.name)) {
			arr.push(JSON.parse(JSON.stringify(input)));
		}
	}

	addCoord(size, x, y) {
		this.size = size;
		this.posX = x;
		this.posY = y;
	}

	// ---------------------------------------------------------------------------------------------
	// Tick
	// ---------------------------------------------------------------------------------------------
	tick() {
		this.pushInputsDown();
		this.runChildren();
		this.runMyMethods();
		this.clearInputs();
	}

	// ---------------------------------------------------------------------------------------------
	// Méthodes pour les Childs
	// ---------------------------------------------------------------------------------------------
	// Distribue les inputs à tous ses enfants
	pushInputsDown() {
		this.children.forEach(child => {
			this.inputs.forEach(input => {
				if (child.listenedInputs.includes(input.name)) {
					child.addInput(child.inputs, input);
				}
			});
		});
	}

	// Roule les enfants et récupère les outputs
	runChildren() {
		this.children.forEach(child => {
			let result = child.tick();
			result.forEach(output => {

				this.addInput(this.outputs, output);
			});
		});
	}

	createToken(template) {
		let token = null;
		if (!getToken(this.children, template.name)) {
			let attributes = JSON.parse(JSON.stringify(template.attributes));
			token = new Token(getId(), attributes, this, template.name, template.color, template.border);
			token.installMethods(template.methods);
			token.addListenedInputs(template.listenedInputs);
			// console.log('createToken')
		}
		return token;
	}

	// ---------------------------------------------------------------------------------------------
	// Méthodes d'action
	// ---------------------------------------------------------------------------------------------
	runMyMethods() {
		for (let i = 0; i < this.methods.length; i++) {
			this.methods[i](this);
		}
	}

	clearInputs() {
		this.inputs = [];
	}
}
class Tile extends Master {
	constructor(id, attributes, x, y) {
		super(id, attributes);

		this.stackColor = { ini: iniTile.color, border: iniTile.border, selected: iniTile.selected };
		this.colorToken = '';
		this.borderToken = '';

		this.selected = false;
		this.hexX = x;
		this.hexY = y;
	}

	// ---------------------------------------------------------------------------------------------
	// Méthodes Test
	// ---------------------------------------------------------------------------------------------
	testToken() {
		let range = 50;

		let min = 1;
		let max = 100;
		let randToken = Math.floor(Math.random() * (+max - +min)) + +min;
		if (randToken >= 100 - range) {
			let token = this.createToken(iniTokenArbre);
			if (token) {
				this.children.push(this.createToken(iniTokenArbre));
			}
		}
	}
	setOnFire() {
		this.addInput(this.nextInputs, inputFire);
		clickEvent = false;
	}
	// ---------------------------------------------------------------------------------------------
	// Tick
	// ---------------------------------------------------------------------------------------------
	tick(clickEvent) {
		this.mouseEvent(clickEvent);
		this.switchInputs();
		this.iniInputs(); // À modifier pour une méthode anonyme
		super.tick();
		this.drawTile();
		this.checkOutputs();
		this.setColor();
	}

	// ---------------------------------------------------------------------------------------------
	// Méthodes d'Actions
	// ---------------------------------------------------------------------------------------------
	mouseEvent(clickEvent) {
		let mod = 5;
		let x = this.posX;
		let y = this.posY;
		if (posX > x - this.size + mod && posX < x + this.size - mod && posY > y - this.size + mod && posY < y + this.size - mod) {
			this.selected = true;
			if (clickEvent) {
				this.setOnFire();
				this.getNeighbours();
			}
		} else {
			this.selected = false;
		}
	}

	setColor() {
		this.children.forEach(child => {
			if (child.color) {
				this.colorToken = child.color;
			}
			if (child.borderColor) {
				this.borderToken = child.borderColor;
			}
		});
	}

	switchInputs() {
		this.nextInputs.forEach(input => {
			this.inputs.push(JSON.parse(JSON.stringify(input)));
		});
		this.nextInputs = [];
	}

	iniInputs() {
		this.inputs.forEach(input => {
			switch (input.name) {
				case 'fire':
					let token = this.createToken(iniTokenFire);
					if (token) {
						this.children.push(token);
					}

					console.log('fire');
					break;
			}
		});
	}

	checkOutputs() {
		this.outputs.forEach(output => {
			switch (output.name) {
				case 'destroyChild':
					deleteToken(this.children, output.elem);
					this.colorToken = '';
					this.borderToken = '';
					deleteInput(this.outputs, output.name);
					break;
				case 'fire':
					this.addInput(this.nextInputs, output);
					giveInput(output, this.getNeighbours());
					deleteInput(this.outputs, output.name);
					break;
			}
		});
	}

	getNeighbours() {
		let keyVoisin = [];
		let x = this.hexX;
		let y = this.hexY;
		if (x % 2 == 0) {
			if (x > 0) {
				keyVoisin.push(x - 1 + '-' + y);
			}
			if (y > 0) {
				keyVoisin.push(x + '-' + (y - 1));
			}
			if (x < nbColumns - 1) {
				keyVoisin.push(x + 1 + '-' + y);
			}

			if (y < nbRows - 1 && x > 0) {
				keyVoisin.push(x - 1 + '-' + (y + 1));
			}
			if (y < nbRows - 1) {
				keyVoisin.push(x + '-' + (y + 1));
			}
			if (y < nbRows - 1 && x < nbColumns - 1) {
				keyVoisin.push(x + 1 + '-' + (y + 1));
			}
		} else {
			if (y > 0 && x > 0) {
				keyVoisin.push(x - 1 + '-' + (y - 1));
			}
			if (y > 0) {
				keyVoisin.push(x + '-' + (y - 1));
			}
			if (y > 0 && x < nbColumns - 1) {
				keyVoisin.push(x + 1 + '-' + (y - 1));
			}

			if (x > 0) {
				keyVoisin.push(x - 1 + '-' + y);
			}
			if (y < nbRows - 1) {
				keyVoisin.push(x + '-' + (y + 1));
			}
			if (x < nbColumns - 1) {
				keyVoisin.push(x + 1 + '-' + y);
			}
		}
		return keyVoisin;
	}

	// ---------------------------------------------------------------------------------------------
	// Méthodes d'Affichage
	// ---------------------------------------------------------------------------------------------
	drawTile() {
		let x = this.posX;
		let y = this.posY;
		let size = this.size;
		let side = 0;
		let canvas = document.querySelector('#mainCanvas').getContext('2d');

		canvas.beginPath();
		canvas.lineCap = "round";
		canvas.moveTo(x + size * Math.cos(0), y + size * Math.sin(0));
		for (side; side < 7; side++) {
			canvas.lineTo(x + size * Math.cos(side * 2 * Math.PI / 6), y + size * Math.sin(side * 2 * Math.PI / 6));
		}
		canvas.closePath();

		canvas.fillStyle = this.getBgColor();
		canvas.save();
		canvas.clip();
		canvas.fill();

		canvas.lineWidth = 8;
		canvas.strokeStyle = this.getBorderColor();
		canvas.stroke();
		canvas.restore();

		// canvas.font = "10px Arial";
		// canvas.fillStyle = 'black';
		// ctx.fillText(this.hexX+"-"+this.hexY, x-9, y+4);
	}

	getBorderColor() {
		let borderColor = this.stackColor.border;
		if (this.selected) {
			borderColor = this.stackColor.selected;
		} else if (this.borderToken != '') {
			borderColor = this.borderToken;
		}

		return borderColor;
	}

	getBgColor() {
		let color = this.stackColor.ini;
		if (this.colorToken != '') {
			color = this.colorToken;
		}

		return color;
	}
}
class Token extends Master {
	constructor(id, attributes, parent, name, color, border) {
		super(id, attributes);
		this.parent = parent;
		this.name = name;
		this.listenedInputs = [];
		this.color = color;
		this.borderColor = border;
	}

	tick() {
		super.tick();
		return this.outputs;
	}

	addListenedInputs(inputs) {
		inputs.forEach(input => {
			this.listenedInputs.push(input);
		});
	}

}

const iniObservation = () => {
	canvas = document.querySelector('#mainCanvas');
	ctx = canvas.getContext('2d');
	ctx.moveTo(0, 0);

	let container = document.querySelector('#board_container');
	boardConfig.width = container.offsetWidth;
	boardConfig.height = container.offsetHeight;
	boardConfig.size = boardConfig.width / nbColumns - boardConfig.width * .0175;
	nbRows = Math.ceil(boardConfig.height / boardConfig.size * .46);
	ctx.canvas.width = container.offsetWidth;
	ctx.canvas.height = container.offsetHeight;

	canvas.onclick = e => {
		clickEvent = true;
	};
	canvas.onmousemove = e => {
		posX = e.offsetX;
		posY = e.offsetY;
	};

	getApi('systemChoiceData', result => {
		system = result;
		setTextNode('#titleSystem', system.title);
	});

	iniApp();
};

const nbColumns = 24;
let nbRows = 14;
const tilesList = [];
const boardConfig = { width: 0, height: 0, size: 0 };

const tileDic = {};

let ctx = null;
let canvas = null;

let posX = 0;
let posY = 0;
let clickEvent = false;

const iniApp = () => {
	// Create board
	// canvas.style.backgroundColor = board.color;
	for (let row = 0; row < nbRows; row++) {
		let tileRow = [];
		for (let column = 0; column < nbColumns; column++) {
			let tile = new Tile(getId(), iniTile.attributes, column, row);
			tile.installMethods(iniTile.methods);
			tile.testToken();

			let iniPosX = boardConfig.width * .025,
			    iniPosY = boardConfig.width * .025;
			let gap = 5;
			let x = boardConfig.size * 1.5 + gap;
			let y = boardConfig.size * 1.75 + gap;
			if (column % 2 == 0) {
				iniPosY += boardConfig.size;
			}
			tile.addCoord(boardConfig.size, column * x + iniPosX, row * y + iniPosY);

			tileRow.push(tile);
			tileDic[column + '-' + row] = tile;
		}
		tilesList.push(tileRow);
	}
	tick();
};

const tick = () => {
	ctx.clearRect(0, 0, boardConfig.width, boardConfig.height);
	for (let row = 0; row < nbRows; row++) {
		for (let column = 0; column < nbColumns; column++) {
			let tile = tilesList[row][column];

			tile.tick(clickEvent); // To Dispatch to workers
		}
	}

	clickEvent = false;
	// setTimeout(tick, 30);
	window.requestAnimationFrame(tick);
};

// ---------------------------------------------------------------------------------------------
// GENERAL FUNCTIONS
// ---------------------------------------------------------------------------------------------
const getInput = (arr, input) => {
	for (let i = 0; i < arr.length; i++) {
		if (arr[i].name === input) {
			return arr[i];
		}
	}
};

const getToken = (arr, token) => {
	for (let i = 0; i < arr.length; i++) {
		if (arr[i].name === token) {
			return arr[i];
		}
		/*
  if(arr.children.length > 0){
  	getToken(arr.children,token);
  }*/
	}
};

const deleteInput = (arr, input) => {
	for (let i = 0; i < arr.length; i++) {
		if (arr[i].name === input) {
			arr.splice(i, 1);
		}
	}
};

const deleteToken = (arr, id) => {
	for (let i = 0; i < arr.length; i++) {
		if (arr[i].id === id) {
			arr.splice(i, 1);
		}
	}
};

const getId = () => {
	if (typeof getId.counter == 'undefined') {
		getId.counter = 0;
	}
	return ++getId.counter;
};

const giveInput = (input, arr) => {
	arr.forEach(tileId => {
		let tile = tileDic[tileId];
		tile.addInput(tile.nextInputs, input);
	});
};
