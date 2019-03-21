let system = null;
window.onload = () =>{
	dialogScript();
	inputScript();

	getApi('systemChoiceData',(result)=>{
		system = result;
		console.log(result);
	});
}