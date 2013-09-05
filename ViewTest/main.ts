/// <reference path="../tsc/ui/TemplateElementLoader.ts"/>
/// <reference path="../tsc/ui/View.ts"/>
var TemplateElementLoader = tsc.ui.TemplateElementLoader;

class MyView extends tsc.ui.View{
    
	constructor(){		
		// get the template Element with the TemplateElementLoader Class
		var templateElement = TemplateElementLoader.getTemplateNode("title");

		// construct your view
		super(templateElement, () => {
			document.body.appendChild(this.getInstance());
			var element = this.getHTMLElementById("title");
			element.innerHTML = "Blubber";
		});
	}

} 

class MyOtherView extends tsc.ui.View{
    constructor(){
        // construct your view
    	super("Template.html", () => {
			document.body.appendChild(this.getInstance());
			setTimeout(() => {
                var element = this.getHTMLElementsByName("title")[0];
        		element.innerHTML = "My new Title";
			}, 10000);
		});
    }
}

new MyView();
new MyOtherView();