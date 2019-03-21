let system = null;
window.onload = () =>{
	dialogScript();
	inputScript();

	getApi('systemChoiceData',(result)=>{
		system = result;
		console.log(result);
		document.querySelector('#titleToken').value =
		document.querySelector('#titleToken').defaultValue = system.title;
	});
}