class Element{
	constructor(id,attributes,name){
		this.id = id;
		this.name = name;

		this.children = [];
		this.attributes = {};
		this.createAttributes(attributes);
		this.methods = [];

		this.inputs = [];
		this.nextInputs = [];
		this.outputs = [];

		this.listenedInputs = [];
		this.myListenedInputs = [];

		this.posX = 0;
		this.posY = 0;
		this.size = 0;
	}

	// ---------------------------------------------------------------------------------------------
	// Méthodes D'initialisation
	// ---------------------------------------------------------------------------------------------
	addListenedInputs(inputs){
		inputs.forEach(input => {
			this.addInput(this.myListenedInputs,input);
			this.addInput(this.listenedInputs,input);
		});
	}

	createAttributes(array){
		if(array && array.length > 0){
			array.forEach(attribute=>{
				let newAttribute = JSON.parse(JSON.stringify(attribute));
				this.attributes[newAttribute.name] = newAttribute.value;
			});
		}
	}

	// Créé les méthodes données en string et les ajoutes à un tableau
	installMethods(methods){
		if(methods){
			methods.forEach(method =>{
				if(method.unresolved == 0){
					try{
						let newMethod = JSON.parse(JSON.stringify(method));
						var f = new Function('obj', newMethod.body);
						this.methods.push(f);
						this.addListenedInputs(newMethod.listenedInputs);
					}catch(err){
						console.error('METHOD',newMethod.name,'HAS AN ERROR');
					}
				}
			});
		}
	}

	// Ajoute l'input donnée (en json)
	addInput(arr,input,limit=false){
		if(limit){
			if(this.listenedInputs.includes(input.name)){
				if(!getInput(arr,input.name)){
					arr.push(JSON.parse(JSON.stringify(input)));
				}
			}
		}else{
			if(!getInput(arr,input.name)){
				arr.push(JSON.parse(JSON.stringify(input)));
			}
		}
	}

	addCoord(size,x,y){
		this.size = size;
		this.posX = x;
		this.posY = y;
	}

	// ---------------------------------------------------------------------------------------------
	// Tick
	// ---------------------------------------------------------------------------------------------
	tick(){
		this.pushInputsDown();
		this.runChildren();
		this.runMyMethods();
		this.clearInputs();
	}

	// ---------------------------------------------------------------------------------------------
	// Méthodes pour les Childs
	// ---------------------------------------------------------------------------------------------
	// Distribue les inputs à tous ses enfants
	pushInputsDown(){
		this.children.forEach(child => {
			this.inputs.forEach(input=>{
				child.addInput(child.inputs,input,true);
			});
		});
	}

	// Roule les enfants et récupère les outputs
	runChildren(){
		this.children.forEach(child => {
			this.getChildListenedInput(child.listenedInputs);
			let result = child.tick();
			result.forEach(output=>{

				this.addInput(this.outputs,output);
			});
		});
	}

	getChildListenedInput(inputs){
		this.listenedInputs = [];
		inputs.forEach(input=>{
			this.addInput(this.listenedInputs,input);
		});
		this.myListenedInputs.forEach(input=>{
			this.addInput(this.listenedInputs,input);
		});
	}

	// ---------------------------------------------------------------------------------------------
	// Méthodes d'action
	// ---------------------------------------------------------------------------------------------
	runMyMethods(){
		for(let i = 0; i<this.methods.length;i++){
			this.methods[i](this);
		}
	}

	clearInputs(){
		this.inputs = [];
	}

	inputExist(name){
		return getInput(this.inputs,name) ? true: false;
	}

	getInput(name){
		return getInput(this.inputs,name);
	}

	deleteToken(){

		this.addInput(this.outputs,{name:'destroyChild',elem:this.id})
	}

	addToken(token){
		if(!getToken(this.children,token.name)){
			this.children.push(token);
		}
	}

	broadcastEffect(name){
		let input = getInput(this.inputs,name);
		if(input){
			this.addInput(this.outputs,input);
		}
	}
}