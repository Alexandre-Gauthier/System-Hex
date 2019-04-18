class Master{
	constructor(id,attributes){
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
	installMethods(methods){
		methods.forEach(method =>{
			var f = new Function(method.arguments, method.body);
			this.methods.push(f)
		});
	}

	// Ajoute l'input donnée (en json)
	addInput(arr,input){
		if(!getInput(arr,input.name)){
			arr.push(JSON.parse(JSON.stringify(input)));
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
				if(child.listenedInputs.includes(input.name)){
					child.addInput(child.inputs,input);
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
			let attributes = JSON.parse(JSON.stringify(template.attributes));
			token = new Token(getId(),attributes,this,template.name,template.color,template.border);
			token.installMethods(template.methods);
			token.addListenedInputs(template.listenedInputs);
			// console.log('createToken')
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
}