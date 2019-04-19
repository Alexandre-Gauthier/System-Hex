class Token extends Element{
	constructor(id,attributes,parent,name,color,border){
		super(id,attributes);
		this.parent = parent;
		this.name = name;
		this.color = '#'+color;
		this.borderColor = '#'+border;
	}

	tick(){
		super.tick();
		return this.outputs;
	}

}