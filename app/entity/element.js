class Element{
	constructor(id,attributes){
		this.id = id;
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
			this.myListenedInputs.push(input);
			this.listenedInputs .push(input);
		});
	}

	createAttributes(array){
		if(array && array.length > 0){
			array.forEach(attribute=>{
				this.attributes[attribute.name] = attribute.value;
			});
		}
	}

	// Créé les méthodes données en string et les ajoutes à un tableau
	installMethods(methods){
		if(methods){
			methods.forEach(method =>{
				if(method.unresolved == 0){
					try{
						var f = new Function('obj', method.body);
						this.methods.push(f);
						this.addListenedInputs(method.listenedInputs);
					}catch(err){
						console.error('METHOD',method.name,'HAS AN ERROR');
					}
				}
			});
		}
	}

	// Ajoute l'input donnée (en json)
	addInput(arr,input,limit=false){
		if(!getInput(arr,input.name)){
			arr.push(JSON.parse(JSON.stringify(input)));
		}
		// if(limit && this.listenedInputs.includes(input.name)){

		// }else{

		// }
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
				if(child.listenedInputs.includes(input.name)){
					child.addInput(child.inputs,input,true);
				}
			});
		});
	}

	// Roule les enfants et récupère les outputs
	runChildren(){
		this.children.forEach(child => {
			let result = child.tick();
			result.forEach(output=>{

				this.addInput(this.outputs,output);
			});
		});
	}

	createToken(template){
		let token = null;
		if(!getToken(this.children,template.name)){
			token = new Token(getId(),template.attributes,this,template.name,template.color,template.border);
			token.installMethods(template.methods);
		}
		return token;
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

	broadcastEffect(name){
		let input = getInput(this.inputs,name);
		if(input){
			this.addInput(this.outputs,input);
		}
	}
}