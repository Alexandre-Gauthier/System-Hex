class Token extends Element{
	constructor(id,attributes,parent,name,color,border){
		super(id,attributes,name);
		this.parent = parent;
		this.color = '#'+color;
		this.borderColor = '#'+border;
	}

	tick(){
		super.tick();

		return this.outputs;
	}

}