window.onload = () =>{
	modal = document.getElementById('dialogNewAttributes');
	dialogScript();
	inputScript();
}

const getApi = (route,action) =>{
	let request = new XMLHttpRequest();
	request.open('GET', '/'+route, true);
	request.onload = () => {
		if(request.readyState === 4){
			if (request.status >= 200 && request.status < 400) {
				let data = JSON.parse(request.response);
				console.log('Response:',data);
				action(data);
			} else {
				console.log('error');
			}
		}
	}
	request.send(null);
}

const postApi = (route,action,params) =>{
	let request = new XMLHttpRequest();
	request.open('POST', '/'+route, true);
	request.setRequestHeader('Content-type', 'application/json');

	request.onreadystatechange = function() {
		if(request.readyState === 4){
			if (request.status >= 200 && request.status < 400) {
				action(request.responseText);
			} else {
				console.log('error');
			}
		}
	}

	request.send(JSON.stringify(params));
}

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

const dialogScript = () =>{
	// Get the modal
	if(modal){
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
		span.onclick = function() {
			modal.style.display = "none";
			hideModal();
		}

		// When the user clicks anywhere outside of the modal, close it
		window.onclick = function(event) {
			if (event.target == modal) {
				modal.style.display = "none";
				hideModal();
			}
		}
	}
}

const inputScript = () =>{
	/* Change format of file input */
	let input = document.querySelector( '.inputfile' );
	if(input){
		let label = input.nextElementSibling, labelVal = label.innerHTML;

		input.addEventListener( 'change', function( e )
		{
			var fileName = '';
			fileName = e.target.value.split( '\\' ).pop();

			if( fileName )
				document.querySelector( '#labelFile' ).innerHTML = fileName;
			else
				label.innerHTML = labelVal;
		});

	}

	/* Limits the inputs */
	inputs = document.querySelectorAll('.lineInput');
	let lineLimit = /^[a-fA-F0-9]*$/;

	[].forEach.call(inputs, function(input) {
		setInputFilter(input, function(value) {
			return lineLimit.test(value);
		});
	});


	inputs = document.querySelectorAll('.boxInput');
	let boxLimit = /^[a-zA-Z0-9]*$/;

	[].forEach.call(inputs, function(input) {
		setInputFilter(input, function(value) {
			return boxLimit.test(value);
		});
	});

	inputs = document.querySelectorAll('.titleInput');
	let titleLimit = /^[a-zA-Z0-9_]*$/;

	[].forEach.call(inputs, function(input) {
		setInputFilter(input, function(value) {
			return titleLimit.test(value);
		});
	});
}

const findElement = (array,key,value,element=true) =>{
    for(let i = 0; i < array.length;i++){
        if(array[i][key] == value){
            return element?array[i]:i;
        }
    }
}

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&!(#)]*)/gi,
    function(m,key,value) {
      vars[key] = value;
    });
    return vars;
}