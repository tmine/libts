module tsc.ui{

	// XMLHttpRequest for IE6, IE5
	if (!XMLHttpRequest) {
	   XMLHttpRequest = ActiveXObject("Microsoft.XMLHTTP");
	}

	export class ResourceLoader{    
		public load(path : string, callback? : Function) : string {
			return this._load(false, path, callback);
		}
		public loadXML(path : string, callback? : Function) : Document {
			return this._load(true, path, callback);
		}

		private _load(xml : boolean, path : string, callback? : Function) : any {
			var xhr = new XMLHttpRequest();
            if(xml && typeof XDomainRequest != "undefined"){
               console.log("XDomainRequest is defined");
               xhr = <any>new XDomainRequest;
            }
			xhr.onreadystatechange = function(){
				if (xhr.readyState == 4/* && xhr.status == 200*/){
					if(callback){
						if(xml){
                            if(typeof xhr.responseXML != undefined){
                                callback(xhr.responseXML);
                            } else {
                                var xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
                                xmlDoc.async=false;
                                xmlDoc.loadXML(xhr.responseText);
                                callback(xmlDoc);
                            }
						} else {
                            callback(xhr.responseText);
                        }
					}
				}
			};
			xhr.open("GET", path, (callback != undefined));
			xhr.send();

			if(xml){
                if(typeof xhr.responseXML != undefined){
                    return xhr.responseXML;
                } else {
                    var xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
                    xmlDoc.async=false;
                    xmlDoc.loadXML(xhr.responseText);
                    return xmlDoc;
                }
            } else {
                return xhr.responseText;
            }
		}
	}
}