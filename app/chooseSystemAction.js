let selectionSystems = null;

const getSystems = () =>{
	selectionSystems = document.querySelector("#selection_systems");
	getApi('chooseSystemData',(result)=>{
		result.systems.forEach(system=>{
			addOption(system.id,system.title);
		});
	});
}

const addOption = (id,name) =>{
	let node = document.createElement("option");
	node.setAttribute("value",id);
	let txt = document.createTextNode(name);
	node.appendChild(txt);

	selectionSystems.appendChild(node);
}

const addSystem = () =>{
	let name = prompt("Entrez un nom pour le Système","System");
	if (name != null && name != "") {
		let params = {name:name};
		postApi('addSystem',(res)=>{
			if(res == 'SUCCESS'){
				window.location.href = "/crossroad.html";
			}else{
				alert(res);
			}
		},params);
	}
}