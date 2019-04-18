class Token extends Master{
	constructor(id,attributes,parent,name,color,border){
		super(id,attributes);
		this.parent = parent;
		this.name = name;
		this.listenedInputs = [];
		this.color = color;
		this.borderColor = border;
	}

	tick(){
		super.tick();
		return this.outputs;
	}

	addListenedInputs(inputs){
		inputs.forEach(input => {
			this.listenedInputs.push(input);
		});
	}

}