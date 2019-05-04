function toJSON(node) {
		node = node || this;
		var obj = {
			nodeType: node.nodeType
		};
		if (node.tagName) {
			obj.tagName = node.tagName.toLowerCase();
		} else if (node.nodeName) {
			obj.nodeName = node.nodeName;
		}

		if (node.nodeValue) {
			obj.nodeValue = node.nodeValue;
		}

		var attrs = node.attributes;
		if (attrs) {
			var length = attrs.length;
			var arr = obj.attributes = new Array(length);
			for (var i = 0; i < length; i++) {
				attr = attrs[i];
				arr[i] = [attr.nodeName, attr.nodeValue];
			}
		}
		var childNodes = node.childNodes;
		if (childNodes) {
			length = childNodes.length;
			arr = obj.childNodes = new Array(length);
			for (i = 0; i < length; i++) {
				arr[i] = toJSON(childNodes[i]);
			}
		}
		if(node instanceof HTMLInputElement || node instanceof HTMLSelectElement){
			arr = obj.value = node.value;
		}
		return obj;
  }

  function toDOM(obj) {
		if (typeof obj == 'string') {
			obj = JSON.parse(obj);
		}

		var node, nodeType = obj.nodeType;

		switch (nodeType) {
			case 1: //ELEMENT_NODE
				node = document.createElement(obj.tagName);
				var attributes = obj.attributes || [];
				for (var i = 0, len = attributes.length; i < len; i++) {
					var attr = attributes[i];
					node.setAttribute(attr[0], attr[1]);
				}
				break;
			case 3: //TEXT_NODE
				node = document.createTextNode(obj.nodeValue);
				break;
			case 8: //COMMENT_NODE
				node = document.createComment(obj.nodeValue);
				break;
			case 9: //DOCUMENT_NODE
				node = document.implementation.createDocument();
				break;
			case 10: //DOCUMENT_TYPE_NODE
				node = document.implementation.createDocumentType(obj.nodeName);
				break;
			case 11: //DOCUMENT_FRAGMENT_NODE
				node = document.createDocumentFragment();
				break;
			default:
				return node;
		}
		if (nodeType == 1 || nodeType == 11) {
			var childNodes = obj.childNodes || [];
			for (i = 0, len = childNodes.length; i < len; i++) {
				node.appendChild(toDOM(childNodes[i]));
			}
		}

		if(obj.tagName == "select" && hasTag('variable',node)){
			clearSelectOptions(node);
			let options = getVar().concat(getAttributes());
			addSelectOptions(node,options);
		}

		if(obj.tagName == "select" && hasTag('tileAtt',node)){
			clearSelectOptions(node);
			let options = getTileAttributes();
			addSelectOptions(node,options);
		}

		if(obj.tagName == "select" && hasTag('effect',node)){
			clearSelectOptions(node);
			let options = getInputs();
			addSelectOptions(node,options);
		}

		if(obj.tagName == "select" && hasTag('token',node)){
			clearSelectOptions(node);
			let options = getTokens();
			addSelectOptions(node,options);
		}

		if(obj.value){
			node.value = obj.value;
			node.defaultValue = obj.value;
		}
		return node;
  }

  const restoreSelectList = (list,options) =>{
	clearSelectOptions(list);
	addSelectOptions(list,options);
  }

  // https://gist.github.com/sstur/7379870