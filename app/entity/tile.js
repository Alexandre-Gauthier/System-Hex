class Tile extends Element{
	constructor(id,attributes,x,y,color='ede1c9',border='8e8a6b'){
		super(id,attributes,'tile',null);

		this.stackColor = {ini:'#'+color,border:'#'+border,selected:'#76d2fc'} //#436177
		this.colorToken = '';
		this.borderToken = '';

		this.selected = false;
		this.hexX = x;
		this.hexY = y;
		this.tileID = x+'-'+y
		this.tile = this.tileID;
	}

	// ---------------------------------------------------------------------------------------------
	// Tick
	// ---------------------------------------------------------------------------------------------
	tick(){
		super.tick();
		this.drawTile();
		this.checkOutputs();
		this.setColor();
	}

	continuousTick(clickEvent){
		this.mouseEvent(clickEvent)
		this.drawTile();
		this.setColor();
	}

	// ---------------------------------------------------------------------------------------------
	// Méthodes d'Actions
	// ---------------------------------------------------------------------------------------------
	mouseEvent(clickEvent){
		let mod = 5;
		let x = this.posX;
		let y = this.posY;
		if(posX > x-this.size+mod && posX < x + this.size -mod && posY > y-this.size+mod && posY < y+this.size-mod){
			this.selected = true;
			if(clickEvent){
				this.showTile();
			}
		}
		else if(selectedTile == this || (selectedTile && selectedTile.tile == this.tile)){
			this.selected = true;
		}else{
			this.selected = false;
		}
	}

	showTile(){
		let container = document.querySelector('#infoTile');
		if(selectedTile != this){
			container.style.opacity = '1';
			selectedTile = this;
		}else{
			container.style.opacity = '0';
			selectedTile = null;
		}
	}

	setColor(){
		this.children.forEach(child=>{
			if(child.color){
				this.colorToken = child.color;
			}
			if(child.borderColor){
				this.borderToken = child.borderColor;
			}
		})

	}

	switchInputs(){
		this.clearInputs();
		this.nextInputs.forEach(input=>{
			this.addInput(this.inputs,input);
		})
		this.nextInputs = [];
	}

	checkOutputs(){
		for(let i = 0; i<this.outputs.length;i++){
			let output = this.outputs[i];

			if(output.name == 'destroyChild'){
				deleteToken(this.children,output.elem);
				this.colorToken = '';
				this.borderToken = '';
				this.outputs.splice(i,1);
				i--;
			}else if (isInput(output.name)){

				if(output.target == 'self'){
					this.addInput(this.nextInputs,output,true);
					giveInput(output,[this.tileID]);
					this.outputs.splice(i,1);
					i--;
				}else if(output.target == 'broad'){
					this.addInput(this.nextInputs,output,true);
					giveInput(output,this.getNeighbours());
					this.outputs.splice(i,1);
					i--;
				}
				else if(output.target == 'share'){
					console.log('TARGET_ONE')
					this.addInput(this.nextInputs,output,true);
					let neighbours = this.getNeighbours()
					shuffle(neighbours);
					let targets = neighbours.slice(0,output.data);
					giveInput(output,targets);
					this.outputs.splice(i,1);
					i--;
				}

			}
		}
	}

	getNeighbours(){
		let keyVoisin = [];
		let x = this.hexX;
		let y = this.hexY;
		if(x%2 == 0){
			if(x>0){keyVoisin.push((x-1)+'-'+y);}
			if(y>0){keyVoisin.push(x+'-'+(y-1));}
			if(x<nbColumns-1){keyVoisin.push((x+1)+'-'+y);}

			if(y<nbRows-1&&x>0){keyVoisin.push((x-1)+'-'+(y+1));}
			if(y<nbRows-1){keyVoisin.push(x+'-'+(y+1));}
			if(y<nbRows-1&&x<nbColumns-1){keyVoisin.push((x+1)+'-'+(y+1));}
		}else{
			if(y>0&&x>0){keyVoisin.push((x-1)+'-'+(y-1));}
			if(y>0){keyVoisin.push(x+'-'+(y-1));}
			if(y>0&&x<nbColumns-1){keyVoisin.push((x+1)+'-'+(y-1));}

			if(x>0){keyVoisin.push((x-1)+'-'+y);}
			if(y<nbRows-1){keyVoisin.push(x+'-'+(y+1));}
			if(x<nbColumns-1){keyVoisin.push((x+1)+'-'+y);}
		}
		return keyVoisin;
	}

	// ---------------------------------------------------------------------------------------------
	// Méthodes d'Affichage
	// ---------------------------------------------------------------------------------------------
	drawTile(){
		let x = this.posX;
		let y = this.posY;
		let size = this.size;
		let side = 0;
		let canvas = document.querySelector('#mainCanvas').getContext('2d');

		canvas.beginPath();
		canvas.lineCap = "round";
		canvas.moveTo(x + size * Math.cos(0), y + size * Math.sin(0));
		for (side; side < 7; side++) {
			canvas.lineTo(x + size * Math.cos(side * 2 * Math.PI / 6), y + size * Math.sin(side * 2 * Math.PI / 6));
		}
		canvas.closePath();

		canvas.fillStyle = this.getBgColor();
		canvas.save();
		canvas.clip();
		canvas.fill();


		canvas.lineWidth = boardConfig.size/4;
		canvas.strokeStyle = this.getBorderColor();
		canvas.stroke();
		canvas.restore();

		// canvas.font = "10px Arial";
		// canvas.fillStyle = 'black';
		// ctx.fillText(this.hexX+"-"+this.hexY, x-9, y+4);
	}

	getBorderColor(){
		let borderColor = this.stackColor.border;
		if(this.selected){
			borderColor = this.stackColor.selected;
		}
		else if(this.borderToken != ''){
			borderColor = this.borderToken;
		}

		return borderColor;
	}

	getBgColor(){
		let color = this.stackColor.ini;
		if (this.colorToken != ''){
			color = this.colorToken;
		}

		return color;
	}
}