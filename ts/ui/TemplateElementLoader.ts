module ts.ui{
	export class TemplateElementLoader{
	    public static getTemplateNode(name : string) : HTMLElement{
	    	var templateElements = document.getElementsByTagName("template");
			for(var i in templateElements){
				var element = <HTMLElement>(templateElements[i]);
				if(element.getAttribute("templateName") == name) return element;
			}
			return null;
		}
	}
}