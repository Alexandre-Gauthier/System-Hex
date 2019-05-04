class Token extends Element{
	constructor(id,attributes,parent,tile,name,color,border){
		super(id,attributes,name,tile);
		this.parent = parent;
		this.color = '#'+color;
		this.borderColor = '#'+border;
	}

	tick(){
		super.tick();

		return this.outputs;
	}

}