/// <reference path="ResourceLoader.ts"/>

declare class XSLTProcessor{
    importStylesheet(xsl:any);
    transformToFragment(xml: any, doc: any);
}

module ts.ui{
    
    class TemplateCache{
        private static cache: Array<HTMLElement> = new Array<HTMLElement>();
        
        public static put(key: string, element: HTMLElement): void {
            var styles = element.getElementsByTagName("style");
            
            for(var i=0; i<styles.length; i++){
                if(styles[i].getAttribute("type") == "text/css") {
                    document.head.appendChild(styles[i]);
                }
            }
            for(var i=0; i<styles.length; i++){
                element.removeChild(styles[i]);
            }
            
            TemplateCache.cache[key] = <HTMLElement> element.cloneNode(true);
        }
        
        public static get(key: string) : HTMLElement {
            var element: HTMLElement = TemplateCache.cache[key];
            if(element){
                element = <HTMLElement> element.cloneNode(true);                
                return element;
            } else {
                return null;
            }
        }
        
    }
    
	export class View{
		private instance : HTMLElement;
		
		// you can construct your view with: 
		// - HTMLElement
		// - Template HTMLElement, you will receive the content of the template Element in a new span 
		// - Path (string) Content of this HTML File will be loaded inside a span element which will be you instance object
		constructor(template : any, onload? : Function, data? : Object, match? : string){
			if(template.constructor === String){
				if(!template || template == "") return <any>false;
				
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
                        
                        var instance: HTMLElement = TemplateCache.get(template);
                        if(instance){
                            this.instance = instance;
                        } else {
    						new ResourceLoader().load(template, function(content) {				
    							_this.instance = document.createElement("span");
    							_this.instance.innerHTML = content;
    							
                                TemplateCache.put(template, _this.instance);
                                
    							setTimeout(onload, 0);
    						});
                        }
					} else {
						var instance: HTMLElement = TemplateCache.get(template);
                        if(instance){
                            this.instance = instance;
                        } else {
                            var content = new ResourceLoader().load(template);
    						this.instance = document.createElement("span");
    						this.instance.innerHTML = content;
                            
                            TemplateCache.put(template, this.instance);
                        }
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
				return <any>false;
			}
			
		}
		
		public getDom() : HTMLElement {
			return this.instance;
		}

		public append(parent : HTMLElement) : void{
			if(parent && this.instance) parent.appendChild(this.instance);
		}
        
        public deinit(): void{
            
        }
		
        public supplant(o) : View {
            this.instance.innerHTML = (<any>this.instance.innerHTML.replace)(
                /\{([^{}]*)\}/g,
                function (a, b) {
                    var r = o[b];
                    return typeof r === 'string' || typeof r === 'number' ? r : a;
                }
            );
			return new View(this.instance);
        }
        
		public getHTMLElementsByName(name : string) : Array<HTMLElement>{
            if(this.instance.querySelector){
                return <any> this.instance.querySelectorAll("[name="+name+"]");
            }
            
			var elements = new Array<HTMLElement>();
			this._traversAllChildNodes(function(element : HTMLElement){
				if(element.getAttribute && element.getAttribute("name") == name) elements.push(element); 
			}, this.instance);
			return elements;
		}

		public getHTMLElementsByAttribute(attribute : string, value : string) : Array<HTMLElement>{
			if(this.instance.querySelector){
                if(attribute === "class") return <any> this.instance.querySelectorAll("."+value);
                return <any> this.instance.querySelectorAll("["+attribute+"="+value+"]");
            }
            
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
            if(this.instance.querySelector){
                return <HTMLElement>this.instance.querySelector("#"+id);
            }
            
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