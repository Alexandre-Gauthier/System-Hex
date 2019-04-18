let board = {attributes:[],color:'#ede1c9'}

let iniTile = {attributes:[],color:'#ede1c9',border:'#8e8a6b',selected:'#436177',methods:[	{name:'onFire',arguments:'obj',body:""}]}

let iniTokenArbre = {	name:'Arbre',
						color:'#8dae7f',
						border: '#547048',
						attributes: {durability:500},
						listenedInputs : ['fire'],
						methods: [
							{name:'dealFire',arguments:'obj',body:"let input = getInput(obj.inputs,'fire'); if(input){obj.attributes['durability'] -= input.power;obj.addInput(obj.outputs,input);}"},
							{name:'destroyToken',arguments:'obj',body:"if(obj.attributes['durability']<=0){obj.addInput(obj.outputs,{name:'destroyChild',elem:obj.id})}"},

						]
					}

let iniTokenFire = {	name:'Fire',
						color: '#f4b642',
						border: '#995037',
						attributes: {},
						listenedInputs : ['fire'],
						methods:[
							{name:'destroyToken',arguments:'obj',body:"if(!getInput(obj.inputs,'fire')){obj.addInput(obj.outputs,{name:'destroyChild',elem:obj.id})}"},

						]
}


let inputFire = 	{ 	name:'fire',
						power: 10
					}