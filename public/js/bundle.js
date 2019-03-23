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
	var modal = document.getElementById('dialogNewAttributes');

	// Get the button that opens the modal
	var btn = document.getElementById("myBtn");

	// Get the <span> element that closes the modal
	var span = document.querySelector("#closeBtn");

	// When the user clicks the button, open the modal
	btn.onclick = function () {
		modal.style.display = "block";
	};

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
		console.log(result);
		document.querySelector('#titleToken').value = document.querySelector('#titleToken').defaultValue = system.title;
	});
};
const dialogScript = () => {
	// Get the modal
	var modal = document.getElementById('dialogNewAttributes');

	// Get the button that opens the modal
	var btn = document.getElementById("myBtn");

	// Get the <span> element that closes the modal
	var span = document.querySelector("#closeBtn");

	// When the user clicks the button, open the modal
	btn.onclick = function () {
		modal.style.display = "block";
	};

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

