module ts.ui{

	// XMLHttpRequest for IE6, IE5
	if (!XMLHttpRequest) {
	      XMLHttpRequest = new ActiveXObject("Microsoft.XMLHTTP");
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
			xhr.onreadystatechange = function(){
				if (xhr.readyState == 4/* && xhr.status == 200*/){
					if(callback){
						if(xml) callback(xhr.responseXML);
						else 	callback(xhr.responseText);
					}
				}
			};
			xhr.open("GET", path, (callback != undefined));
			xhr.send();

			if(xml) return xhr.responseXML;
			else 	return xhr.responseText;
		}
	}
}