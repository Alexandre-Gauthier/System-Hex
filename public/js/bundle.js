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
window.onload = () => {
	dialogScript();
	inputScript();
};

const getApi = (route, action) => {
	let request = new XMLHttpRequest();
	console.log('Connecting to', route);
	request.open('GET', '/' + route, true);
	request.onload = () => {
		if (request.readyState === 4) {
			console.log('Connection ready');
			if (request.status >= 200 && request.status < 400) {
				console.log('Connection complete');
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
	console.log('Posting to', route);
	request.open('POST', '/' + route, true);
	request.setRequestHeader('Content-type', 'application/json');

	request.onreadystatechange = function () {
		if (request.readyState === 4) {
			console.log('Post ready');
			if (request.status >= 200 && request.status < 400) {
				console.log('Post complete');
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
	let modal = document.getElementById('dialogNewAttributes');
	if (modal) {
		// Get the button that opens the modal
		var btns = document.querySelectorAll(".modalBtn");

		// Get the <span> element that closes the modal
		var span = document.querySelector("#closeBtn");

		// When the user clicks the button, open the modal
		btns.forEach(btn => {
			btn.onclick = () => {
				modal.style.display = "block";
			};
		});

		// When the user clicks on <span> (x), close the modal
		span.onclick = function () {
			modal.style.display = "none";
		};

		// When the user clicks anywhere outside of the modal, close it
		window.onclick = function (event) {
			if (event.target == modal) {
				modal.style.display = "none";
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
let system = null;

const getSystem = () => {
	getApi('systemChoiceData', result => {
		system = result;
		fillInput('#titleSystem', system.title);

		fillInput('#colorBGTile', system.tile.Color);
		fillInput('#colorBorderTile', system.tile.Border);

		fillInput('#colorBGBoard', system.board.Color);

		fillList('#listTokens', system.tokens, showToken);
		fillList('#listEffects', system.effects, showEffect);
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

		let newElem = document.createElement('a');
		let txt = document.createTextNode(item.name);
		newElem.appendChild(txt);

		if (onclick) {
			newElem.onclick = () => {
				onclick(i);
			};
		}
		parent.appendChild(newElem);
	}
};

const addAttributes = (id, json, index) => {
	let parent = document.querySelector(id);
	while (parent.firstChild) {
		parent.removeChild(parent.firstChild);
	}
	for (let key in json) {
		let newElem = document.createElement('a');
		let txt = document.createTextNode(key);
		newElem.appendChild(txt);
		newElem.setAttribute('href', '#');
		newElem.setAttribute('class', 'modalBtn');
		newElem.onclick = () => {
			showAttribute(json, key, newElem, index);
		};

		parent.appendChild(newElem);
	}
	// dialogScript();
};

const showAttribute = (container, key, node, index) => {
	let modal = document.getElementById('dialogNewAttributes');
	fillInput('#titleAttribute', key);
	let value = container[key];
	fillInput('#valueAttribute', value);

	modal.querySelector('#modalBtnDelete').onclick = () => {
		deleteAttribute(container, key, node, index);
	};

	modal.querySelector('#modalBtnSave').onclick = () => {
		saveAttribute(container, key, node, index);
	};

	modal.style.display = "block";
};

const deleteAttribute = (container, key, node, index) => {

	if (confirm('Voulez-vous vraiment supprimer cet Attributs?')) {
		delete container[key];
		node.remove();
		document.getElementById('dialogNewAttributes').style.display = "none";

		let params = { indexToken: index, keyAttribute: key };
		postApi('deleteTokenAttribute', res => {
			alert(res);
		}, params);
	}
};

const saveAttribute = (container, key, node) => {
	let title = document.querySelector('#titleAttribute').value;
	let value = document.querySelector('#valueAttribute').value;
	if (key == title) {
		container[key] = value;
	} else {
		container[title] = value;
		delete container[key];
		node.innerHTML = title;
		node.onclick = () => {
			showAttribute(container, title, node);
		};
	}
	document.getElementById('dialogNewAttributes').style.display = "none";
};

const showToken = index => {
	let formToken = document.querySelector('#formToken');
	let formEffect = document.querySelector('#formEffect');
	let display = document.querySelector('#formToken').style.display;
	if (display == 'none') {
		formToken.style.display = 'block';
		formEffect.style.display = 'none';
	} else {
		formToken.style.display = 'none';
	}

	let token = system.tokens[index];

	fillInput('#titleToken', token.name);
	fillInput('#colorBGToken', token.Color);
	fillInput('#colorBorderToken', token.Border);
	addAttributes('#listTokenAttributes', token.attributes, index);
	fillList('#listTokenMethods', token.methods);
};

const showEffect = index => {
	let formToken = document.querySelector('#formToken');
	let formEffect = document.querySelector('#formEffect');
	let display = document.querySelector('#formEffect').style.display;
	if (display == 'none') {
		formEffect.style.display = 'block';
		formToken.style.display = 'none';
	} else {
		formEffect.style.display = 'none';
	}

	let effect = system.effects[index];
	fillInput('#titleEffect', effect.name);
	addAttributes('#listEffectAttributes', effect.attributes);
};

