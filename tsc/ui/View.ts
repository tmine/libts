/// <reference path="ResourceLoader.ts"/>

module tsc.ui{
	var ResourceLoader = tsc.ui.ResourceLoader;

	export class View{
		private instance : HTMLElement;
		
		// you can construct your view with: 
		// - HTMLElement (will be cloned)
		// - Template HTMLElement, you will receive the content of the template Element in a new span 
		// - Path (string) Content of this HTML File will be loaded inside a span element which will be you instance object
		constructor(template : any, onload? : Function){
			if(template.constructor === String){
				if(!template || template == ""){
					return false;
				}
				
				if(onload){
					var _this = this;
					new ResourceLoader().load(template, function(content) {				
						_this.instance = document.createElement("span");
						_this.instance.innerHTML = content;
						
						setTimeout(onload, 0);
					});
				} else {
					var content = new ResourceLoader().load(template);
					this.instance = document.createElement("span");
					this.instance.innerHTML = content;
				}
			}else if(template instanceof HTMLElement){
				if(template.nodeName == "TEMPLATE"){
					this.instance = document.createElement("span");
					this.instance.innerHTML = template.innerHTML;
				} else {
					this.instance = template.cloneNode(true);
				}
				if(onload) setTimeout(onload, 0);
			}else{
				return false;
			}
			
		}
		
		public getInstance() : HTMLElement {
			return this.instance;
		}
		
		public getHTMLElementsByName(name : string) : Array<HTMLElement>{
			var elements = new Array<HTMLElement>();
			this._traversAllChildNodes(function(element : HTMLElement){
				if(element.getAttribute && element.getAttribute("name") == name) elements.push(element); 
			}, this.instance);
			return elements;
		}
		
		private _traversAllChildNodes(visitor : Function, instance : HTMLElement){
			visitor(instance);
			var childNodes = instance.childNodes;
			for(var i in childNodes){
				this._traversAllChildNodes(visitor, <HTMLElement>childNodes[i]);
			}
		}
		
		public getHTMLElementById(id : string) : HTMLElement{
			return this._getHTMLElementById(id, this.instance);
		}
		
		private _getHTMLElementById(id: string, instance: HTMLElement) : HTMLElement{
			if(instance.getAttribute("id") == id) return instance;
			
			var childNodes = instance.childNodes;
			for(var i in childNodes){
				var instance = this._getHTMLElementById(id, <HTMLElement>childNodes[i]);
				if(instance != null) return instance;
			}
			
			return null;
		}
	}
}