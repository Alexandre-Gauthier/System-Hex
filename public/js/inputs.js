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
	let titleLimit = /^[a-zA-Z0-9éèêà_]*$/;

	[].forEach.call(inputs, function(input) {
		setInputFilter(input, function(value) {
			return titleLimit.test(value);
		});
	});
}