class Element{
	constructor(id,attributes,name,tile){
		this.id = id;
		this.name = name;
		this.tile = tile;

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
			this.addListenedInput(this.myListenedInputs,input);
			this.addListenedInput(this.listenedInputs,input);
		});
	}

	addListenedInput(arr,input){
		if(!arr.includes(input)){
			arr.push(input);
		}
	}

	createAttributes(array){
		if(array && array.length > 0){
			array.forEach(attribute=>{
				let newAttribute = JSON.parse(JSON.stringify(attribute));
				this.attributes[newAttribute.name] = Number(newAttribute.value);
			});
		}
	}

	// Créé les méthodes données en string et les ajoutes à un tableau
	installMethods(methods){
		if(methods){
			methods.forEach(method =>{
				let newMethod = JSON.parse(JSON.stringify(method));
				if(method.unresolved == 0){
					if(method['active'] == null || method['active'] == true){
						try{
							var f = new Function('obj','tile', newMethod.body);
							this.methods.push(f);
							this.addListenedInputs(newMethod.listenedInputs);
						}catch(err){
							console.error('METHOD',newMethod.name,'HAS AN ERROR');
						}
					}else{
						console.error('METHOD',newMethod.name,'IS INACTIVE');
					}
				}else{
					console.error('METHOD',newMethod.name,'IS UNRESOLVED');
				}
			});
		}
	}

	// Ajoute l'input donnée (en json)
	addInput(arr,input,limit=false){
		if(limit){
			if(this.listenedInputs.includes(input.name)){
				this.pushInput(arr,input);
			}
		}else{
			this.pushInput(arr,input);
		}
	}

	pushInput(arr,input){
		let checkInput = getInput(arr,input.name)
		if(!checkInput){
			arr.push(JSON.parse(JSON.stringify(input)));
		}else{
			if(input.elem && checkInput.elem){

				if(checkInput.elem != input.elem){
					arr.push(JSON.parse(JSON.stringify(input)));
				}
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
		this.getListenedInput();
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
		this.outputs = [];
		this.children.forEach(child => {
			let result = child.tick();
			result.forEach(output=>{
				if(output.elemName == 'Fire'){console.log('RUN_CHILDREN',this.name,output);}
				this.addInput(this.outputs,output);

			});
		});
	}

	getListenedInput(){
		this.listenedInputs = [];
		this.children.forEach(child => {
			child.listenedInputs.forEach(input=>{
				this.addListenedInput(this.listenedInputs,input);
			});
		});

		this.myListenedInputs.forEach(input=>{
			this.addListenedInput(this.listenedInputs,input);
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

	tokenExist(name){
		return getToken(this.children,name) ? true: false;
	}

	getInput(name){
		return getInput(this.inputs,name);
	}

	getTileAttribute(name){
		let tileDic = getTile(this.tile);
		return tileDic.attributes[name];
	}

	getEffectAttribute(effect,name){
		let input = getInput(this.inputs,effect)
		if(input){
			return input.attributes[name];
		}
	}

	deleteToken(){
		this.addInput(this.outputs,{name:'destroyChild',elem:this.id,elemName:this.name});
	}

	createToken(name){
		if(!getToken(this.children,name)){
			let json = tokenTemplate[name];
			let token = new Token(getId(),json.attributes,this,this.tile,json.name,json.Color,json.Border);
			token.installMethods(json.methods);
			if(token){
				this.addToken(token)
			}
		}
	}

	createEffect(name){
		if(!getInput(this.inputs,name)){
			let json = effectTemplate[name];
			if(json){
				this.addInput(this.inputs,json)
			}
		}
	}

	addToken(token){
		if(!getToken(this.children,token.name)){
			this.children.push(token);
		}
	}

	randomPerc(num,denom){
		let min = 0;
		let max = denom;
		let randomNum = Math.floor(Math.random() * (+max - +min)) + +min;
		if(randomNum < num){
			return true;
		}
		return false;
	}

	listenInput(name){

	}

	putEffect(name){
		this.addOutputEffect(name,'self');
	}

	broadcastEffect(name){
		this.addOutputEffect(name,'broad');
	}

	shareEffect(name,number){
		this.addOutputEffect(name,'share',number);
	}

	addOutputEffect(name,target='self',data){
		let input = getInput(this.inputs,name);
		if(!input){
			this.createEffect(name);
			input = getInput(this.inputs,name);
		}
		input['target'] = target;
		input['data'] = data;
		this.addInput(this.outputs,input);
	}
}