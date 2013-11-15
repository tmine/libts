/// <reference path="ResourceLoader.ts"/>

declare class XSLTProcessor{
    importStylesheet(xsl:any);
    transformToFragment(xml: any, doc: any);
}

module tsc.ui{
	var ResourceLoader = tsc.ui.ResourceLoader;

	export class View{
		private instance : HTMLElement;
		
		// you can construct your view with: 
		// - HTMLElement (will be cloned)
		// - Template HTMLElement, you will receive the content of the template Element in a new span 
		// - Path (string) Content of this HTML File will be loaded inside a span element which will be you instance object
		constructor(template : any, onload? : Function, data? : Object, match? : string){
			if(template.constructor === String){
				if(!template || template == ""){
					return false;
				}
				
				if(template.indexOf(".xsl") != -1){
					if(onload){
						var _this = this;
						new ResourceLoader().loadXML(template, function(xsl) {
							var xsltProcessor = new XSLTProcessor();
							xsltProcessor.importStylesheet(xsl);
							var xml = View.toXML(data, match);
							_this.instance = xsltProcessor.transformToFragment(xml, document);
							setTimeout(onload, 0);
						});
					} else {
						var xsl = new ResourceLoader().loadXML(template);
						var xsltProcessor = new XSLTProcessor();
						xsltProcessor.importStylesheet(xsl);
						var xml = View.toXML(data, match);
						this.instance = xsltProcessor.transformToFragment(xml, document);
					}
				} else {
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
				}
			}else if(template instanceof HTMLElement){
				if(template.nodeName == "TEMPLATE"){
					this.instance = document.createElement("span");
					this.instance.innerHTML = template.innerHTML;
				} else if(template.parentNode == null) {
					this.instance = template;
				} else {
					this.instance = template;
				}
				if(onload) setTimeout(onload, 0);
			}else{
				return false;
			}
			
		}
		
		public getDom() : HTMLElement {
			return this.instance;
		}

		public append(parent : HTMLElement) : void{
			if(parent && this.getInstance()) parent.appendChild(this.getInstance());
		}
		
		public getHTMLElementsByName(name : string) : Array<HTMLElement>{
			var elements = new Array<HTMLElement>();
			this._traversAllChildNodes(function(element : HTMLElement){
				if(element.getAttribute && element.getAttribute("name") == name) elements.push(element); 
			}, this.instance);
			return elements;
		}

		public getHTMLElementsByAttribute(attribute : string, value : string) : Array<HTMLElement>{
			var elements = new Array<HTMLElement>();
			this._traversAllChildNodes(function(element : HTMLElement){
				if(element.getAttribute && element.getAttribute(attribute) == value) elements.push(element); 
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

		public traversAllChildNodes(visitor : Function, instance : HTMLElement){
			this._traversAllChildNodes(visitor, instance);
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

		private static toXML = function(obj, name){
			if(!name) name = "root";
			var xml = document.createElement("" + name);
			for(var prop in obj){
				if (obj.hasOwnProperty(prop)) {
					if(obj[prop] instanceof Array){
						for(var i=0; i<obj[prop].length; i++){
							xml.appendChild(View.toXML(obj[prop][i], prop));
						}
					} else if(typeof obj[prop] == "object"){
						xml.appendChild(View.toXML(obj[prop], prop));
					} else if(typeof obj[prop] == "function") {
					} else {
						var element = document.createElement(prop);
						var value = document.createTextNode("" + obj[prop]);
						element.appendChild(value);
						xml.appendChild(element);
					}
				}
			}
			return xml;
		};
	}
}