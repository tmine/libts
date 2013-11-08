module tsc.lang{
	export interface Runnable{
		init() : void;
		run() : number;
	}
}/// <reference path="../util/Queue.ts"/>
/// <reference path="Runnable.ts"/>

module tsc.lang{

	export class Scheduler{
		private threads : tsc.util.Queue<tsc.lang.Runnable> = new tsc.util.Queue<tsc.lang.Runnable>();
		
		constructor(){
			setInterval(() => { this.run(); }, 0);
		}
		
		private run() : void {
			var runnable : tsc.lang.Runnable = this.threads.dequeue();
			if(runnable != null){
				if(runnable.run() == null){
					this.threads.enqueue(runnable);
				}
			}
		}
		
		public add(runnable : tsc.lang.Runnable){
			this.threads.enqueue(runnable);
			runnable.init();
		}
		
	}
}/// <reference path="Scheduler.ts"/>
/// <reference path="Runnable.ts"/>

module tsc.main{

    function isFunction(functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }

    function isObject(objToCheck) {
        var getType = {};
        return objToCheck && getType.toString.call(objToCheck) === '[object Object]';
    }

    function getSourceOfObject(obj) {
        var string = "";
        string += "(function(){ var obj = " + obj.constructor + "\n";
        for (var c in obj) {
            if (isFunction(obj[c])) {
                string += "obj." + c + " = " + obj[c] + ";\n";
            } else if (isObject(obj[c])) {
                string += "obj." + c + " = " + getSourceOfObject(obj[c]) + ";\n";
            } else {
                string += "obj." + c + " = " + obj[c] + ";\n";
            }
        }
        string += "return obj;})();";
        return string;
    }

    export class Thread{
        private static worker;
        private static scheduler : tsc.lang.Scheduler;

        public static init(){
            if (Thread.worker != null || Thread.scheduler) return;

            try  {
                Thread.worker = new Worker("WorkerSource.js");

                Thread.worker.onmessage = function (e) {
                    console.log(e.data);
                };
            } catch (e) {
                Thread.scheduler = new tsc.lang.Scheduler();
            }
        }

        public static create(runnable : tsc.lang.Runnable){
            Thread.init();
            if (Thread.worker != null) {
                Thread.worker.postMessage(getSourceOfObject(runnable)); 
            } else {
                Thread.scheduler.add(runnable);
            }
        }
    }
}module tsc.ui{

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
			xhr.onreadystatechange = function(){
				if (xhr.readyState == 4 && xhr.status == 200){
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
}module tsc.ui{
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
}/// <reference path="ResourceLoader.ts"/>

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
module tsc.util{
	export class Buffer<T>{
		private array : Array<T> = new Array<T>();
		private size : number = 0;
		private index : number = 0;
		
		constructor(size : number){
			this.size = size;
		}
		
		public add(item : T){
			if(this.index+1 < this.size){
				this.array[this.index] = item;
				this.index++;
			}else{
				for(var i=0; i<this.array.length-1; i++){
					this.array[i] = this.array[i+1];
				}
				this.array[this.index] = item;
			}
		}
		
		public get(index : number){
			if(index < 0 || index > this.size) return null;
			return this.array[index];
		}
	}
}module tsc.util{
	export class Dictionary<any, V>{
		private array : Array<V> = new Array<V>();
		
		public put(key : any, value : V) : void{
			this.array[key] = value;
		}
		
		public get(key : any) : V {
			return this.array[key];
		}
		
		public elements() : Array<V> {
			var elements = new Array<V>();
			for(var key in this.array){
				elements.push(this.array[key]);
			}
			return elements;
		}
		
		public isEmpty() : boolean{
			return (this.size() == 0);
		}
		
		public keys() : Array<any> {
			var keys = new Array<any>();
			for(var key in this.array){
				keys.push(key);
			}
			return keys;
		}
		
		public remove(key : any) : V {
			var value : V = this.array[key];
			this.array[key] = null;
			return value;
		}
		
		public size() : number {
			var size : number = 0;
			for(var item in this.array){
				size++;
			}
			return size;
		}
	}
}/// <reference path="List.ts"/>

module tsc.util{
	class ListNode{
		public prev : ListNode;
		public next : ListNode;
		public item;
		
		constructor(item) {
			this.item = item;
		}
	}
	
	export class LinkedList<T> implements tsc.util.List<T> {
		private first : ListNode;
		
		public add(item : T){
			if(this.first == null) this.first = new ListNode(item);
			
			var last : ListNode = this.first;
			while(last.next != null){
				last = last.next;
			}
			last.next = new ListNode(item);
			last.next.prev = last;
		}
		public remove(item : T){
			if(this.first == null) return;
			
			var node : ListNode = this.first;
			while(node.next != null){
				if(node.item == item){
					node.prev.next = node.next;
					node.next.prev = node.prev;
					break;
				}
				node = node.next;
			}
		}
		public get(index : number) : T{
			if(index == 0) return null;
			
			var node : ListNode = this.first;
			for(var i : number = 0; i<index; i++){
				if(node.next == null) return null;
				else node = node.next;
			}
			return node.item;
		}
	}
}module tsc.util{
	export interface List<T> {
		add(item : T);
		remove(item : T);
		get(index : number) : T;
	}
}/// <reference path="Observer.ts"/>
module tsc.util{

    export class Observable {
        private observers : Array<tsc.util.Observer>;
     
        constructor() {
            this.observers = new Array<tsc.util.Observer>();
        }
     
        public registerObserver (observer : tsc.util.Observer) : void {
            this.observers.push(observer);
        }
     
        public removeObserver (observer : tsc.util.Observer) : void {
            this.observers.splice(this.observers.indexOf(observer), 1);
        }
     
        public notifyObservers (arg : any) : void {
            this.observers.forEach((observer : tsc.util.Observer) => {
                observer.update(arg);
            });
        }
    }
}module tsc.util{
	export interface Observer {
	    update (arg:any);
	}
}module tsc.util{
	export class Queue<T>{
		private elements = new Array<T>();
		
		public enqueue(element : T) : void {
			this.elements.reverse();
			this.elements.push(element);
			this.elements.reverse();
		}
		
		public dequeue() : T{
			return this.elements.pop();
		}
	}
}module tsc.util{
	export class RingBuffer<T>{
		private array : Array<T> = new Array<T>();
		private itemCount : number = 0;
		private index : number = 0;
		
		constructor(itemCount : number){
			this.itemCount = itemCount;
		}
		
		public add(item : T){
			this.array[this.index] = item;
			this.index = (this.index + 1) % this.itemCount;
		}
		
		public get(index : number) : T{
			if(index < 0 || index > this.itemCount) return null;
			return this.array[index];
		}
	}
}module tsc.util{
	export class Stack<T>{
		private array : Array<T> = new Array<T>();
		
		public push(item : T) : void{
			this.array.push(item);
		}
		
		public pop() : T {
			return this.array.pop();
		}
	}
}window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
window.storageInfo = window.storageInfo || window.webkitStorageInfo;
window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;

class Filesystem{
	private static filesystem;
	
	private static init(success, error) : void{
		if(Filesystem.filesystem) return;
		
		var size = 5*1024*1024;
		if(window.storageInfo){
			window.storageInfo.requestQuota(window.PERSISTENT, size, function(gb) {
				window.requestFileSystem(window.PERSISTENT, gb, success, error);
			}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
			} else {
				window.requestFileSystem(window.PERSISTENT, size, success, error);
			}
		
	}
	
	public static readAllFiles(success, error){
		function toArray(list) {
			return Array.prototype.slice.call(list || [], 0);
		}
		Filesystem.init(function(fs){
			var dirReader = fs.root.createReader();
			var entries = [];
			var files = [];
			
			// Call the reader.readEntries() until no more results are returned.
			var readEntries = function() {
				dirReader.readEntries (function(results) {
					if (!results.length) {
						console.log(entries);
						for(var i=0; i<entries.length; i++){
							var entry = entries[i];
							if(entry.isFile) files.push(entry.name);
						}
						if(success) success(files);
					} else {
						entries = entries.concat(toArray(results));
						readEntries();
					}
				}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
			};
			readEntries(); // Start reading dirs.
		}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
	}
	
	public static writeFile(path : string, data : any, success, error) : void{
		function write(){
			Filesystem.init(function(fs){
				fs.root.getFile(path, {create: true}, function(fileEntry) {
			        fileEntry.createWriter(function(writer) {
			            writer.write(data);
						if(success) success();
			        }, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
			    }, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
			}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
		}
		Filesystem.removeFile(path, write, write);
	}
	
	public static readFile(path, success, error) {
	    Filesystem.init(function(fs){
			fs.root.getFile(path, {}, function(fileEntry) {
		        fileEntry.file(function(file) {
		            var reader = new FileReader();
		            reader.onloadend = function(e) {
		                if (success) success(this.result);
		            };
		            reader.readAsText(file);
		        }, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
		    }, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
		}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
	}
	
	public static removeFile(path, success, error){
		Filesystem.init(function(fs){
			fs.root.getFile(path, {create: false}, function(fileEntry) {
				fileEntry.remove(function() {
					if(success) success();
				}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
			}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
		}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
	}
	
	private static FsErrorHandler(e) {
	    var msg = '';
	
	    switch (e.code) {
	        case FileError.QUOTA_EXCEEDED_ERR:
	            msg = 'QUOTA_EXCEEDED_ERR';
	            break;
	        case FileError.NOT_FOUND_ERR:
	            msg = 'NOT_FOUND_ERR';
	            break;
	        case FileError.SECURITY_ERR:
	            msg = 'SECURITY_ERR';
	            break;
	        case FileError.INVALID_MODIFICATION_ERR:
	            msg = 'INVALID_MODIFICATION_ERR';
	            break;
	        case FileError.INVALID_STATE_ERR:
	            msg = 'INVALID_STATE_ERR';
	            break;
	        default:
	            msg = 'Unknown Error';
	            break;
	    };
	
	    console.log('Error: ' + msg);
	}
}
module tsc.lang{
	export interface Runnable{
		init() : void;
		run() : number;
	}
}/// <reference path="../util/Queue.ts"/>
/// <reference path="Runnable.ts"/>

module tsc.lang{

	export class Scheduler{
		private threads : tsc.util.Queue<tsc.lang.Runnable> = new tsc.util.Queue<tsc.lang.Runnable>();
		
		constructor(){
			setInterval(() => { this.run(); }, 0);
		}
		
		private run() : void {
			var runnable : tsc.lang.Runnable = this.threads.dequeue();
			if(runnable != null){
				if(runnable.run() == null){
					this.threads.enqueue(runnable);
				}
			}
		}
		
		public add(runnable : tsc.lang.Runnable){
			this.threads.enqueue(runnable);
			runnable.init();
		}
		
	}
}/// <reference path="Scheduler.ts"/>
/// <reference path="Runnable.ts"/>

module tsc.main{

    function isFunction(functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }

    function isObject(objToCheck) {
        var getType = {};
        return objToCheck && getType.toString.call(objToCheck) === '[object Object]';
    }

    function getSourceOfObject(obj) {
        var string = "";
        string += "(function(){ var obj = " + obj.constructor + "\n";
        for (var c in obj) {
            if (isFunction(obj[c])) {
                string += "obj." + c + " = " + obj[c] + ";\n";
            } else if (isObject(obj[c])) {
                string += "obj." + c + " = " + getSourceOfObject(obj[c]) + ";\n";
            } else {
                string += "obj." + c + " = " + obj[c] + ";\n";
            }
        }
        string += "return obj;})();";
        return string;
    }

    export class Thread{
        private static worker;
        private static scheduler : tsc.lang.Scheduler;

        public static init(){
            if (Thread.worker != null || Thread.scheduler) return;

            try  {
                Thread.worker = new Worker("WorkerSource.js");

                Thread.worker.onmessage = function (e) {
                    console.log(e.data);
                };
            } catch (e) {
                Thread.scheduler = new tsc.lang.Scheduler();
            }
        }

        public static create(runnable : tsc.lang.Runnable){
            Thread.init();
            if (Thread.worker != null) {
                Thread.worker.postMessage(getSourceOfObject(runnable)); 
            } else {
                Thread.scheduler.add(runnable);
            }
        }
    }
}module tsc.ui{

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
			xhr.onreadystatechange = function(){
				if (xhr.readyState == 4 && xhr.status == 200){
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
}module tsc.ui{
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
}/// <reference path="ResourceLoader.ts"/>

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
module tsc.util{
	export class Buffer<T>{
		private array : Array<T> = new Array<T>();
		private size : number = 0;
		private index : number = 0;
		
		constructor(size : number){
			this.size = size;
		}
		
		public add(item : T){
			if(this.index+1 < this.size){
				this.array[this.index] = item;
				this.index++;
			}else{
				for(var i=0; i<this.array.length-1; i++){
					this.array[i] = this.array[i+1];
				}
				this.array[this.index] = item;
			}
		}
		
		public get(index : number){
			if(index < 0 || index > this.size) return null;
			return this.array[index];
		}
	}
}module tsc.util{
	export class Dictionary<any, V>{
		private array : Array<V> = new Array<V>();
		
		public put(key : any, value : V) : void{
			this.array[key] = value;
		}
		
		public get(key : any) : V {
			return this.array[key];
		}
		
		public elements() : Array<V> {
			var elements = new Array<V>();
			for(var key in this.array){
				elements.push(this.array[key]);
			}
			return elements;
		}
		
		public isEmpty() : boolean{
			return (this.size() == 0);
		}
		
		public keys() : Array<any> {
			var keys = new Array<any>();
			for(var key in this.array){
				keys.push(key);
			}
			return keys;
		}
		
		public remove(key : any) : V {
			var value : V = this.array[key];
			this.array[key] = null;
			return value;
		}
		
		public size() : number {
			var size : number = 0;
			for(var item in this.array){
				size++;
			}
			return size;
		}
	}
}/// <reference path="List.ts"/>

module tsc.util{
	class ListNode{
		public prev : ListNode;
		public next : ListNode;
		public item;
		
		constructor(item) {
			this.item = item;
		}
	}
	
	export class LinkedList<T> implements tsc.util.List<T> {
		private first : ListNode;
		
		public add(item : T){
			if(this.first == null) this.first = new ListNode(item);
			
			var last : ListNode = this.first;
			while(last.next != null){
				last = last.next;
			}
			last.next = new ListNode(item);
			last.next.prev = last;
		}
		public remove(item : T){
			if(this.first == null) return;
			
			var node : ListNode = this.first;
			while(node.next != null){
				if(node.item == item){
					node.prev.next = node.next;
					node.next.prev = node.prev;
					break;
				}
				node = node.next;
			}
		}
		public get(index : number) : T{
			if(index == 0) return null;
			
			var node : ListNode = this.first;
			for(var i : number = 0; i<index; i++){
				if(node.next == null) return null;
				else node = node.next;
			}
			return node.item;
		}
	}
}module tsc.util{
	export interface List<T> {
		add(item : T);
		remove(item : T);
		get(index : number) : T;
	}
}/// <reference path="Observer.ts"/>
module tsc.util{

    export class Observable {
        private observers : Array<tsc.util.Observer>;
     
        constructor() {
            this.observers = new Array<tsc.util.Observer>();
        }
     
        public registerObserver (observer : tsc.util.Observer) : void {
            this.observers.push(observer);
        }
     
        public removeObserver (observer : tsc.util.Observer) : void {
            this.observers.splice(this.observers.indexOf(observer), 1);
        }
     
        public notifyObservers (arg : any) : void {
            this.observers.forEach((observer : tsc.util.Observer) => {
                observer.update(arg);
            });
        }
    }
}module tsc.util{
	export interface Observer {
	    update (arg:any);
	}
}module tsc.util{
	export class Queue<T>{
		private elements = new Array<T>();
		
		public enqueue(element : T) : void {
			this.elements.reverse();
			this.elements.push(element);
			this.elements.reverse();
		}
		
		public dequeue() : T{
			return this.elements.pop();
		}
	}
}module tsc.util{
	export class RingBuffer<T>{
		private array : Array<T> = new Array<T>();
		private itemCount : number = 0;
		private index : number = 0;
		
		constructor(itemCount : number){
			this.itemCount = itemCount;
		}
		
		public add(item : T){
			this.array[this.index] = item;
			this.index = (this.index + 1) % this.itemCount;
		}
		
		public get(index : number) : T{
			if(index < 0 || index > this.itemCount) return null;
			return this.array[index];
		}
	}
}module tsc.util{
	export class Stack<T>{
		private array : Array<T> = new Array<T>();
		
		public push(item : T) : void{
			this.array.push(item);
		}
		
		public pop() : T {
			return this.array.pop();
		}
	}
}window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
window.storageInfo = window.storageInfo || window.webkitStorageInfo;
window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;

class Filesystem{
	private static filesystem;
	
	private static init(success, error) : void{
		if(Filesystem.filesystem) return;
		
		var size = 5*1024*1024;
		if(window.storageInfo){
			window.storageInfo.requestQuota(window.PERSISTENT, size, function(gb) {
				window.requestFileSystem(window.PERSISTENT, gb, success, error);
			}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
			} else {
				window.requestFileSystem(window.PERSISTENT, size, success, error);
			}
		
	}
	
	public static readAllFiles(success, error){
		function toArray(list) {
			return Array.prototype.slice.call(list || [], 0);
		}
		Filesystem.init(function(fs){
			var dirReader = fs.root.createReader();
			var entries = [];
			var files = [];
			
			// Call the reader.readEntries() until no more results are returned.
			var readEntries = function() {
				dirReader.readEntries (function(results) {
					if (!results.length) {
						console.log(entries);
						for(var i=0; i<entries.length; i++){
							var entry = entries[i];
							if(entry.isFile) files.push(entry.name);
						}
						if(success) success(files);
					} else {
						entries = entries.concat(toArray(results));
						readEntries();
					}
				}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
			};
			readEntries(); // Start reading dirs.
		}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
	}
	
	public static writeFile(path : string, data : any, success, error) : void{
		function write(){
			Filesystem.init(function(fs){
				fs.root.getFile(path, {create: true}, function(fileEntry) {
			        fileEntry.createWriter(function(writer) {
			            writer.write(data);
						if(success) success();
			        }, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
			    }, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
			}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
		}
		Filesystem.removeFile(path, write, write);
	}
	
	public static readFile(path, success, error) {
	    Filesystem.init(function(fs){
			fs.root.getFile(path, {}, function(fileEntry) {
		        fileEntry.file(function(file) {
		            var reader = new FileReader();
		            reader.onloadend = function(e) {
		                if (success) success(this.result);
		            };
		            reader.readAsText(file);
		        }, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
		    }, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
		}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
	}
	
	public static removeFile(path, success, error){
		Filesystem.init(function(fs){
			fs.root.getFile(path, {create: false}, function(fileEntry) {
				fileEntry.remove(function() {
					if(success) success();
				}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
			}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
		}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
	}
	
	private static FsErrorHandler(e) {
	    var msg = '';
	
	    switch (e.code) {
	        case FileError.QUOTA_EXCEEDED_ERR:
	            msg = 'QUOTA_EXCEEDED_ERR';
	            break;
	        case FileError.NOT_FOUND_ERR:
	            msg = 'NOT_FOUND_ERR';
	            break;
	        case FileError.SECURITY_ERR:
	            msg = 'SECURITY_ERR';
	            break;
	        case FileError.INVALID_MODIFICATION_ERR:
	            msg = 'INVALID_MODIFICATION_ERR';
	            break;
	        case FileError.INVALID_STATE_ERR:
	            msg = 'INVALID_STATE_ERR';
	            break;
	        default:
	            msg = 'Unknown Error';
	            break;
	    };
	
	    console.log('Error: ' + msg);
	}
}
module tsc.lang{
	export interface Runnable{
		init() : void;
		run() : number;
	}
}/// <reference path="../util/Queue.ts"/>
/// <reference path="Runnable.ts"/>

module tsc.lang{

	export class Scheduler{
		private threads : tsc.util.Queue<tsc.lang.Runnable> = new tsc.util.Queue<tsc.lang.Runnable>();
		
		constructor(){
			setInterval(() => { this.run(); }, 0);
		}
		
		private run() : void {
			var runnable : tsc.lang.Runnable = this.threads.dequeue();
			if(runnable != null){
				if(runnable.run() == null){
					this.threads.enqueue(runnable);
				}
			}
		}
		
		public add(runnable : tsc.lang.Runnable){
			this.threads.enqueue(runnable);
			runnable.init();
		}
		
	}
}/// <reference path="Scheduler.ts"/>
/// <reference path="Runnable.ts"/>

module tsc.main{

    function isFunction(functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }

    function isObject(objToCheck) {
        var getType = {};
        return objToCheck && getType.toString.call(objToCheck) === '[object Object]';
    }

    function getSourceOfObject(obj) {
        var string = "";
        string += "(function(){ var obj = " + obj.constructor + "\n";
        for (var c in obj) {
            if (isFunction(obj[c])) {
                string += "obj." + c + " = " + obj[c] + ";\n";
            } else if (isObject(obj[c])) {
                string += "obj." + c + " = " + getSourceOfObject(obj[c]) + ";\n";
            } else {
                string += "obj." + c + " = " + obj[c] + ";\n";
            }
        }
        string += "return obj;})();";
        return string;
    }

    export class Thread{
        private static worker;
        private static scheduler : tsc.lang.Scheduler;

        public static init(){
            if (Thread.worker != null || Thread.scheduler) return;

            try  {
                Thread.worker = new Worker("WorkerSource.js");

                Thread.worker.onmessage = function (e) {
                    console.log(e.data);
                };
            } catch (e) {
                Thread.scheduler = new tsc.lang.Scheduler();
            }
        }

        public static create(runnable : tsc.lang.Runnable){
            Thread.init();
            if (Thread.worker != null) {
                Thread.worker.postMessage(getSourceOfObject(runnable)); 
            } else {
                Thread.scheduler.add(runnable);
            }
        }
    }
}module tsc.ui{

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
			xhr.onreadystatechange = function(){
				if (xhr.readyState == 4 && xhr.status == 200){
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
}module tsc.ui{
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
}/// <reference path="ResourceLoader.ts"/>

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
module tsc.util{
	export class Buffer<T>{
		private array : Array<T> = new Array<T>();
		private size : number = 0;
		private index : number = 0;
		
		constructor(size : number){
			this.size = size;
		}
		
		public add(item : T){
			if(this.index+1 < this.size){
				this.array[this.index] = item;
				this.index++;
			}else{
				for(var i=0; i<this.array.length-1; i++){
					this.array[i] = this.array[i+1];
				}
				this.array[this.index] = item;
			}
		}
		
		public get(index : number){
			if(index < 0 || index > this.size) return null;
			return this.array[index];
		}
	}
}module tsc.util{
	export class Dictionary<any, V>{
		private array : Array<V> = new Array<V>();
		
		public put(key : any, value : V) : void{
			this.array[key] = value;
		}
		
		public get(key : any) : V {
			return this.array[key];
		}
		
		public elements() : Array<V> {
			var elements = new Array<V>();
			for(var key in this.array){
				elements.push(this.array[key]);
			}
			return elements;
		}
		
		public isEmpty() : boolean{
			return (this.size() == 0);
		}
		
		public keys() : Array<any> {
			var keys = new Array<any>();
			for(var key in this.array){
				keys.push(key);
			}
			return keys;
		}
		
		public remove(key : any) : V {
			var value : V = this.array[key];
			this.array[key] = null;
			return value;
		}
		
		public size() : number {
			var size : number = 0;
			for(var item in this.array){
				size++;
			}
			return size;
		}
	}
}/// <reference path="List.ts"/>

module tsc.util{
	class ListNode{
		public prev : ListNode;
		public next : ListNode;
		public item;
		
		constructor(item) {
			this.item = item;
		}
	}
	
	export class LinkedList<T> implements tsc.util.List<T> {
		private first : ListNode;
		
		public add(item : T){
			if(this.first == null) this.first = new ListNode(item);
			
			var last : ListNode = this.first;
			while(last.next != null){
				last = last.next;
			}
			last.next = new ListNode(item);
			last.next.prev = last;
		}
		public remove(item : T){
			if(this.first == null) return;
			
			var node : ListNode = this.first;
			while(node.next != null){
				if(node.item == item){
					node.prev.next = node.next;
					node.next.prev = node.prev;
					break;
				}
				node = node.next;
			}
		}
		public get(index : number) : T{
			if(index == 0) return null;
			
			var node : ListNode = this.first;
			for(var i : number = 0; i<index; i++){
				if(node.next == null) return null;
				else node = node.next;
			}
			return node.item;
		}
	}
}module tsc.util{
	export interface List<T> {
		add(item : T);
		remove(item : T);
		get(index : number) : T;
	}
}/// <reference path="Observer.ts"/>
module tsc.util{

    export class Observable {
        private observers : Array<tsc.util.Observer>;
     
        constructor() {
            this.observers = new Array<tsc.util.Observer>();
        }
     
        public registerObserver (observer : tsc.util.Observer) : void {
            this.observers.push(observer);
        }
     
        public removeObserver (observer : tsc.util.Observer) : void {
            this.observers.splice(this.observers.indexOf(observer), 1);
        }
     
        public notifyObservers (arg : any) : void {
            this.observers.forEach((observer : tsc.util.Observer) => {
                observer.update(arg);
            });
        }
    }
}module tsc.util{
	export interface Observer {
	    update (arg:any);
	}
}module tsc.util{
	export class Queue<T>{
		private elements = new Array<T>();
		
		public enqueue(element : T) : void {
			this.elements.reverse();
			this.elements.push(element);
			this.elements.reverse();
		}
		
		public dequeue() : T{
			return this.elements.pop();
		}
	}
}module tsc.util{
	export class RingBuffer<T>{
		private array : Array<T> = new Array<T>();
		private itemCount : number = 0;
		private index : number = 0;
		
		constructor(itemCount : number){
			this.itemCount = itemCount;
		}
		
		public add(item : T){
			this.array[this.index] = item;
			this.index = (this.index + 1) % this.itemCount;
		}
		
		public get(index : number) : T{
			if(index < 0 || index > this.itemCount) return null;
			return this.array[index];
		}
	}
}module tsc.util{
	export class Stack<T>{
		private array : Array<T> = new Array<T>();
		
		public push(item : T) : void{
			this.array.push(item);
		}
		
		public pop() : T {
			return this.array.pop();
		}
	}
}window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
window.storageInfo = window.storageInfo || window.webkitStorageInfo;
window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;

class Filesystem{
	private static filesystem;
	
	private static init(success, error) : void{
		if(Filesystem.filesystem) return;
		
		var size = 5*1024*1024;
		if(window.storageInfo){
			window.storageInfo.requestQuota(window.PERSISTENT, size, function(gb) {
				window.requestFileSystem(window.PERSISTENT, gb, success, error);
			}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
			} else {
				window.requestFileSystem(window.PERSISTENT, size, success, error);
			}
		
	}
	
	public static readAllFiles(success, error){
		function toArray(list) {
			return Array.prototype.slice.call(list || [], 0);
		}
		Filesystem.init(function(fs){
			var dirReader = fs.root.createReader();
			var entries = [];
			var files = [];
			
			// Call the reader.readEntries() until no more results are returned.
			var readEntries = function() {
				dirReader.readEntries (function(results) {
					if (!results.length) {
						console.log(entries);
						for(var i=0; i<entries.length; i++){
							var entry = entries[i];
							if(entry.isFile) files.push(entry.name);
						}
						if(success) success(files);
					} else {
						entries = entries.concat(toArray(results));
						readEntries();
					}
				}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
			};
			readEntries(); // Start reading dirs.
		}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
	}
	
	public static writeFile(path : string, data : any, success, error) : void{
		function write(){
			Filesystem.init(function(fs){
				fs.root.getFile(path, {create: true}, function(fileEntry) {
			        fileEntry.createWriter(function(writer) {
			            writer.write(data);
						if(success) success();
			        }, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
			    }, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
			}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
		}
		Filesystem.removeFile(path, write, write);
	}
	
	public static readFile(path, success, error) {
	    Filesystem.init(function(fs){
			fs.root.getFile(path, {}, function(fileEntry) {
		        fileEntry.file(function(file) {
		            var reader = new FileReader();
		            reader.onloadend = function(e) {
		                if (success) success(this.result);
		            };
		            reader.readAsText(file);
		        }, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
		    }, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
		}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
	}
	
	public static removeFile(path, success, error){
		Filesystem.init(function(fs){
			fs.root.getFile(path, {create: false}, function(fileEntry) {
				fileEntry.remove(function() {
					if(success) success();
				}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
			}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
		}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
	}
	
	private static FsErrorHandler(e) {
	    var msg = '';
	
	    switch (e.code) {
	        case FileError.QUOTA_EXCEEDED_ERR:
	            msg = 'QUOTA_EXCEEDED_ERR';
	            break;
	        case FileError.NOT_FOUND_ERR:
	            msg = 'NOT_FOUND_ERR';
	            break;
	        case FileError.SECURITY_ERR:
	            msg = 'SECURITY_ERR';
	            break;
	        case FileError.INVALID_MODIFICATION_ERR:
	            msg = 'INVALID_MODIFICATION_ERR';
	            break;
	        case FileError.INVALID_STATE_ERR:
	            msg = 'INVALID_STATE_ERR';
	            break;
	        default:
	            msg = 'Unknown Error';
	            break;
	    };
	
	    console.log('Error: ' + msg);
	}
}
module tsc.lang{
	export interface Runnable{
		init() : void;
		run() : number;
	}
}/// <reference path="../util/Queue.ts"/>
/// <reference path="Runnable.ts"/>

module tsc.lang{

	export class Scheduler{
		private threads : tsc.util.Queue<tsc.lang.Runnable> = new tsc.util.Queue<tsc.lang.Runnable>();
		
		constructor(){
			setInterval(() => { this.run(); }, 0);
		}
		
		private run() : void {
			var runnable : tsc.lang.Runnable = this.threads.dequeue();
			if(runnable != null){
				if(runnable.run() == null){
					this.threads.enqueue(runnable);
				}
			}
		}
		
		public add(runnable : tsc.lang.Runnable){
			this.threads.enqueue(runnable);
			runnable.init();
		}
		
	}
}/// <reference path="Scheduler.ts"/>
/// <reference path="Runnable.ts"/>

module tsc.main{

    function isFunction(functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }

    function isObject(objToCheck) {
        var getType = {};
        return objToCheck && getType.toString.call(objToCheck) === '[object Object]';
    }

    function getSourceOfObject(obj) {
        var string = "";
        string += "(function(){ var obj = " + obj.constructor + "\n";
        for (var c in obj) {
            if (isFunction(obj[c])) {
                string += "obj." + c + " = " + obj[c] + ";\n";
            } else if (isObject(obj[c])) {
                string += "obj." + c + " = " + getSourceOfObject(obj[c]) + ";\n";
            } else {
                string += "obj." + c + " = " + obj[c] + ";\n";
            }
        }
        string += "return obj;})();";
        return string;
    }

    export class Thread{
        private static worker;
        private static scheduler : tsc.lang.Scheduler;

        public static init(){
            if (Thread.worker != null || Thread.scheduler) return;

            try  {
                Thread.worker = new Worker("WorkerSource.js");

                Thread.worker.onmessage = function (e) {
                    console.log(e.data);
                };
            } catch (e) {
                Thread.scheduler = new tsc.lang.Scheduler();
            }
        }

        public static create(runnable : tsc.lang.Runnable){
            Thread.init();
            if (Thread.worker != null) {
                Thread.worker.postMessage(getSourceOfObject(runnable)); 
            } else {
                Thread.scheduler.add(runnable);
            }
        }
    }
}module tsc.ui{

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
			xhr.onreadystatechange = function(){
				if (xhr.readyState == 4 && xhr.status == 200){
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
}module tsc.ui{
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
}/// <reference path="ResourceLoader.ts"/>

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
		
		public getDom() : HTMLElement {
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
module tsc.util{
	export class Buffer<T>{
		private array : Array<T> = new Array<T>();
		private size : number = 0;
		private index : number = 0;
		
		constructor(size : number){
			this.size = size;
		}
		
		public add(item : T){
			if(this.index+1 < this.size){
				this.array[this.index] = item;
				this.index++;
			}else{
				for(var i=0; i<this.array.length-1; i++){
					this.array[i] = this.array[i+1];
				}
				this.array[this.index] = item;
			}
		}
		
		public get(index : number){
			if(index < 0 || index > this.size) return null;
			return this.array[index];
		}
	}
}module tsc.util{
	export class Dictionary<any, V>{
		private array : Array<V> = new Array<V>();
		
		public put(key : any, value : V) : void{
			this.array[key] = value;
		}
		
		public get(key : any) : V {
			return this.array[key];
		}
		
		public elements() : Array<V> {
			var elements = new Array<V>();
			for(var key in this.array){
				elements.push(this.array[key]);
			}
			return elements;
		}
		
		public isEmpty() : boolean{
			return (this.size() == 0);
		}
		
		public keys() : Array<any> {
			var keys = new Array<any>();
			for(var key in this.array){
				keys.push(key);
			}
			return keys;
		}
		
		public remove(key : any) : V {
			var value : V = this.array[key];
			this.array[key] = null;
			return value;
		}
		
		public size() : number {
			var size : number = 0;
			for(var item in this.array){
				size++;
			}
			return size;
		}
	}
}/// <reference path="List.ts"/>

module tsc.util{
	class ListNode{
		public prev : ListNode;
		public next : ListNode;
		public item;
		
		constructor(item) {
			this.item = item;
		}
	}
	
	export class LinkedList<T> implements tsc.util.List<T> {
		private first : ListNode;
		
		public add(item : T){
			if(this.first == null) this.first = new ListNode(item);
			
			var last : ListNode = this.first;
			while(last.next != null){
				last = last.next;
			}
			last.next = new ListNode(item);
			last.next.prev = last;
		}
		public remove(item : T){
			if(this.first == null) return;
			
			var node : ListNode = this.first;
			while(node.next != null){
				if(node.item == item){
					node.prev.next = node.next;
					node.next.prev = node.prev;
					break;
				}
				node = node.next;
			}
		}
		public get(index : number) : T{
			if(index == 0) return null;
			
			var node : ListNode = this.first;
			for(var i : number = 0; i<index; i++){
				if(node.next == null) return null;
				else node = node.next;
			}
			return node.item;
		}
	}
}module tsc.util{
	export interface List<T> {
		add(item : T);
		remove(item : T);
		get(index : number) : T;
	}
}/// <reference path="Observer.ts"/>
module tsc.util{

    export class Observable {
        private observers : Array<tsc.util.Observer>;
     
        constructor() {
            this.observers = new Array<tsc.util.Observer>();
        }
     
        public registerObserver (observer : tsc.util.Observer) : void {
            this.observers.push(observer);
        }
     
        public removeObserver (observer : tsc.util.Observer) : void {
            this.observers.splice(this.observers.indexOf(observer), 1);
        }
     
        public notifyObservers (arg : any) : void {
            this.observers.forEach((observer : tsc.util.Observer) => {
                observer.update(arg);
            });
        }
    }
}module tsc.util{
	export interface Observer {
	    update (arg:any);
	}
}module tsc.util{
	export class Queue<T>{
		private elements = new Array<T>();
		
		public enqueue(element : T) : void {
			this.elements.reverse();
			this.elements.push(element);
			this.elements.reverse();
		}
		
		public dequeue() : T{
			return this.elements.pop();
		}
	}
}module tsc.util{
	export class RingBuffer<T>{
		private array : Array<T> = new Array<T>();
		private itemCount : number = 0;
		private index : number = 0;
		
		constructor(itemCount : number){
			this.itemCount = itemCount;
		}
		
		public add(item : T){
			this.array[this.index] = item;
			this.index = (this.index + 1) % this.itemCount;
		}
		
		public get(index : number) : T{
			if(index < 0 || index > this.itemCount) return null;
			return this.array[index];
		}
	}
}module tsc.util{
	export class Stack<T>{
		private array : Array<T> = new Array<T>();
		
		public push(item : T) : void{
			this.array.push(item);
		}
		
		public pop() : T {
			return this.array.pop();
		}
	}
}window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
window.storageInfo = window.storageInfo || window.webkitStorageInfo;
window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;

class Filesystem{
	private static filesystem;
	
	private static init(success, error) : void{
		if(Filesystem.filesystem) return;
		
		var size = 5*1024*1024;
		if(window.storageInfo){
			window.storageInfo.requestQuota(window.PERSISTENT, size, function(gb) {
				window.requestFileSystem(window.PERSISTENT, gb, success, error);
			}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
			} else {
				window.requestFileSystem(window.PERSISTENT, size, success, error);
			}
		
	}
	
	public static readAllFiles(success, error){
		function toArray(list) {
			return Array.prototype.slice.call(list || [], 0);
		}
		Filesystem.init(function(fs){
			var dirReader = fs.root.createReader();
			var entries = [];
			var files = [];
			
			// Call the reader.readEntries() until no more results are returned.
			var readEntries = function() {
				dirReader.readEntries (function(results) {
					if (!results.length) {
						console.log(entries);
						for(var i=0; i<entries.length; i++){
							var entry = entries[i];
							if(entry.isFile) files.push(entry.name);
						}
						if(success) success(files);
					} else {
						entries = entries.concat(toArray(results));
						readEntries();
					}
				}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
			};
			readEntries(); // Start reading dirs.
		}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
	}
	
	public static writeFile(path : string, data : any, success, error) : void{
		function write(){
			Filesystem.init(function(fs){
				fs.root.getFile(path, {create: true}, function(fileEntry) {
			        fileEntry.createWriter(function(writer) {
			            writer.write(data);
						if(success) success();
			        }, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
			    }, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
			}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
		}
		Filesystem.removeFile(path, write, write);
	}
	
	public static readFile(path, success, error) {
	    Filesystem.init(function(fs){
			fs.root.getFile(path, {}, function(fileEntry) {
		        fileEntry.file(function(file) {
		            var reader = new FileReader();
		            reader.onloadend = function(e) {
		                if (success) success(this.result);
		            };
		            reader.readAsText(file);
		        }, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
		    }, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
		}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
	}
	
	public static removeFile(path, success, error){
		Filesystem.init(function(fs){
			fs.root.getFile(path, {create: false}, function(fileEntry) {
				fileEntry.remove(function() {
					if(success) success();
				}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
			}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
		}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
	}
	
	private static FsErrorHandler(e) {
	    var msg = '';
	
	    switch (e.code) {
	        case FileError.QUOTA_EXCEEDED_ERR:
	            msg = 'QUOTA_EXCEEDED_ERR';
	            break;
	        case FileError.NOT_FOUND_ERR:
	            msg = 'NOT_FOUND_ERR';
	            break;
	        case FileError.SECURITY_ERR:
	            msg = 'SECURITY_ERR';
	            break;
	        case FileError.INVALID_MODIFICATION_ERR:
	            msg = 'INVALID_MODIFICATION_ERR';
	            break;
	        case FileError.INVALID_STATE_ERR:
	            msg = 'INVALID_STATE_ERR';
	            break;
	        default:
	            msg = 'Unknown Error';
	            break;
	    };
	
	    console.log('Error: ' + msg);
	}
}
module tsc.lang{
	export interface Runnable{
		init() : void;
		run() : number;
	}
}/// <reference path="../util/Queue.ts"/>
/// <reference path="Runnable.ts"/>

module tsc.lang{

	export class Scheduler{
		private threads : tsc.util.Queue<tsc.lang.Runnable> = new tsc.util.Queue<tsc.lang.Runnable>();
		
		constructor(){
			setInterval(() => { this.run(); }, 0);
		}
		
		private run() : void {
			var runnable : tsc.lang.Runnable = this.threads.dequeue();
			if(runnable != null){
				if(runnable.run() == null){
					this.threads.enqueue(runnable);
				}
			}
		}
		
		public add(runnable : tsc.lang.Runnable){
			this.threads.enqueue(runnable);
			runnable.init();
		}
		
	}
}/// <reference path="Scheduler.ts"/>
/// <reference path="Runnable.ts"/>

module tsc.main{

    function isFunction(functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }

    function isObject(objToCheck) {
        var getType = {};
        return objToCheck && getType.toString.call(objToCheck) === '[object Object]';
    }

    function getSourceOfObject(obj) {
        var string = "";
        string += "(function(){ var obj = " + obj.constructor + "\n";
        for (var c in obj) {
            if (isFunction(obj[c])) {
                string += "obj." + c + " = " + obj[c] + ";\n";
            } else if (isObject(obj[c])) {
                string += "obj." + c + " = " + getSourceOfObject(obj[c]) + ";\n";
            } else {
                string += "obj." + c + " = " + obj[c] + ";\n";
            }
        }
        string += "return obj;})();";
        return string;
    }

    export class Thread{
        private static worker;
        private static scheduler : tsc.lang.Scheduler;

        public static init(){
            if (Thread.worker != null || Thread.scheduler) return;

            try  {
                Thread.worker = new Worker("WorkerSource.js");

                Thread.worker.onmessage = function (e) {
                    console.log(e.data);
                };
            } catch (e) {
                Thread.scheduler = new tsc.lang.Scheduler();
            }
        }

        public static create(runnable : tsc.lang.Runnable){
            Thread.init();
            if (Thread.worker != null) {
                Thread.worker.postMessage(getSourceOfObject(runnable)); 
            } else {
                Thread.scheduler.add(runnable);
            }
        }
    }
}module tsc.ui{

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
			xhr.onreadystatechange = function(){
				if (xhr.readyState == 4 && xhr.status == 200){
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
}module tsc.ui{
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
}/// <reference path="ResourceLoader.ts"/>

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
		
		public getDom() : HTMLElement {
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
module tsc.util{
	export class Buffer<T>{
		private array : Array<T> = new Array<T>();
		private size : number = 0;
		private index : number = 0;
		
		constructor(size : number){
			this.size = size;
		}
		
		public add(item : T){
			if(this.index+1 < this.size){
				this.array[this.index] = item;
				this.index++;
			}else{
				for(var i=0; i<this.array.length-1; i++){
					this.array[i] = this.array[i+1];
				}
				this.array[this.index] = item;
			}
		}
		
		public get(index : number){
			if(index < 0 || index > this.size) return null;
			return this.array[index];
		}
	}
}module tsc.util{
	export class Dictionary<any, V>{
		private array : Array<V> = new Array<V>();
		
		public put(key : any, value : V) : void{
			this.array[key] = value;
		}
		
		public get(key : any) : V {
			return this.array[key];
		}
		
		public elements() : Array<V> {
			var elements = new Array<V>();
			for(var key in this.array){
				elements.push(this.array[key]);
			}
			return elements;
		}
		
		public isEmpty() : boolean{
			return (this.size() == 0);
		}
		
		public keys() : Array<any> {
			var keys = new Array<any>();
			for(var key in this.array){
				keys.push(key);
			}
			return keys;
		}
		
		public remove(key : any) : V {
			var value : V = this.array[key];
			this.array[key] = null;
			return value;
		}
		
		public size() : number {
			var size : number = 0;
			for(var item in this.array){
				size++;
			}
			return size;
		}
	}
}/// <reference path="List.ts"/>

module tsc.util{
	class ListNode{
		public prev : ListNode;
		public next : ListNode;
		public item;
		
		constructor(item) {
			this.item = item;
		}
	}
	
	export class LinkedList<T> implements tsc.util.List<T> {
		private first : ListNode;
		
		public add(item : T){
			if(this.first == null) this.first = new ListNode(item);
			
			var last : ListNode = this.first;
			while(last.next != null){
				last = last.next;
			}
			last.next = new ListNode(item);
			last.next.prev = last;
		}
		public remove(item : T){
			if(this.first == null) return;
			
			var node : ListNode = this.first;
			while(node.next != null){
				if(node.item == item){
					node.prev.next = node.next;
					node.next.prev = node.prev;
					break;
				}
				node = node.next;
			}
		}
		public get(index : number) : T{
			if(index == 0) return null;
			
			var node : ListNode = this.first;
			for(var i : number = 0; i<index; i++){
				if(node.next == null) return null;
				else node = node.next;
			}
			return node.item;
		}
	}
}module tsc.util{
	export interface List<T> {
		add(item : T);
		remove(item : T);
		get(index : number) : T;
	}
}/// <reference path="Observer.ts"/>
module tsc.util{

    export class Observable {
        private observers : Array<tsc.util.Observer>;
     
        constructor() {
            this.observers = new Array<tsc.util.Observer>();
        }
     
        public registerObserver (observer : tsc.util.Observer) : void {
            this.observers.push(observer);
        }
     
        public removeObserver (observer : tsc.util.Observer) : void {
            this.observers.splice(this.observers.indexOf(observer), 1);
        }
     
        public notifyObservers (arg : any) : void {
            this.observers.forEach((observer : tsc.util.Observer) => {
                observer.update(arg);
            });
        }
    }
}module tsc.util{
	export interface Observer {
	    update (arg:any);
	}
}module tsc.util{
	export class Queue<T>{
		private elements = new Array<T>();
		
		public enqueue(element : T) : void {
			this.elements.reverse();
			this.elements.push(element);
			this.elements.reverse();
		}
		
		public dequeue() : T{
			return this.elements.pop();
		}
	}
}module tsc.util{
	export class RingBuffer<T>{
		private array : Array<T> = new Array<T>();
		private itemCount : number = 0;
		private index : number = 0;
		
		constructor(itemCount : number){
			this.itemCount = itemCount;
		}
		
		public add(item : T){
			this.array[this.index] = item;
			this.index = (this.index + 1) % this.itemCount;
		}
		
		public get(index : number) : T{
			if(index < 0 || index > this.itemCount) return null;
			return this.array[index];
		}
	}
}module tsc.util{
	export class Stack<T>{
		private array : Array<T> = new Array<T>();
		
		public push(item : T) : void{
			this.array.push(item);
		}
		
		public pop() : T {
			return this.array.pop();
		}
	}
}window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
window.storageInfo = window.storageInfo || window.webkitStorageInfo;
window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;

class Filesystem{
	private static filesystem;
	
	private static init(success, error) : void{
		if(Filesystem.filesystem) return;
		
		var size = 5*1024*1024;
		if(window.storageInfo){
			window.storageInfo.requestQuota(window.PERSISTENT, size, function(gb) {
				window.requestFileSystem(window.PERSISTENT, gb, success, error);
			}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
			} else {
				window.requestFileSystem(window.PERSISTENT, size, success, error);
			}
		
	}
	
	public static readAllFiles(success, error){
		function toArray(list) {
			return Array.prototype.slice.call(list || [], 0);
		}
		Filesystem.init(function(fs){
			var dirReader = fs.root.createReader();
			var entries = [];
			var files = [];
			
			// Call the reader.readEntries() until no more results are returned.
			var readEntries = function() {
				dirReader.readEntries (function(results) {
					if (!results.length) {
						console.log(entries);
						for(var i=0; i<entries.length; i++){
							var entry = entries[i];
							if(entry.isFile) files.push(entry.name);
						}
						if(success) success(files);
					} else {
						entries = entries.concat(toArray(results));
						readEntries();
					}
				}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
			};
			readEntries(); // Start reading dirs.
		}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
	}
	
	public static writeFile(path : string, data : any, success, error) : void{
		function write(){
			Filesystem.init(function(fs){
				fs.root.getFile(path, {create: true}, function(fileEntry) {
			        fileEntry.createWriter(function(writer) {
			            writer.write(data);
						if(success) success();
			        }, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
			    }, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
			}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
		}
		Filesystem.removeFile(path, write, write);
	}
	
	public static readFile(path, success, error) {
	    Filesystem.init(function(fs){
			fs.root.getFile(path, {}, function(fileEntry) {
		        fileEntry.file(function(file) {
		            var reader = new FileReader();
		            reader.onloadend = function(e) {
		                if (success) success(this.result);
		            };
		            reader.readAsText(file);
		        }, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
		    }, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
		}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
	}
	
	public static removeFile(path, success, error){
		Filesystem.init(function(fs){
			fs.root.getFile(path, {create: false}, function(fileEntry) {
				fileEntry.remove(function() {
					if(success) success();
				}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
			}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
		}, function(e){Filesystem.FsErrorHandler(e); if(error) error();});
	}
	
	private static FsErrorHandler(e) {
	    var msg = '';
	
	    switch (e.code) {
	        case FileError.QUOTA_EXCEEDED_ERR:
	            msg = 'QUOTA_EXCEEDED_ERR';
	            break;
	        case FileError.NOT_FOUND_ERR:
	            msg = 'NOT_FOUND_ERR';
	            break;
	        case FileError.SECURITY_ERR:
	            msg = 'SECURITY_ERR';
	            break;
	        case FileError.INVALID_MODIFICATION_ERR:
	            msg = 'INVALID_MODIFICATION_ERR';
	            break;
	        case FileError.INVALID_STATE_ERR:
	            msg = 'INVALID_STATE_ERR';
	            break;
	        default:
	            msg = 'Unknown Error';
	            break;
	    };
	
	    console.log('Error: ' + msg);
	}
}
module tsc.lang{
	export interface Runnable{
		init() : void;
		run() : number;
	}
}/// <reference path="../util/Queue.ts"/>
/// <reference path="Runnable.ts"/>

module tsc.lang{

	export class Scheduler{
		private threads : tsc.util.Queue<tsc.lang.Runnable> = new tsc.util.Queue<tsc.lang.Runnable>();
		
		constructor(){
			setInterval(() => { this.run(); }, 0);
		}
		
		private run() : void {
			var runnable : tsc.lang.Runnable = this.threads.dequeue();
			if(runnable != null){
				if(runnable.run() == null){
					this.threads.enqueue(runnable);
				}
			}
		}
		
		public add(runnable : tsc.lang.Runnable){
			this.threads.enqueue(runnable);
			runnable.init();
		}
		
	}
}/// <reference path="Scheduler.ts"/>
/// <reference path="Runnable.ts"/>

module tsc.main{

    function isFunction(functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }

    function isObject(objToCheck) {
        var getType = {};
        return objToCheck && getType.toString.call(objToCheck) === '[object Object]';
    }

    function getSourceOfObject(obj) {
        var string = "";
        string += "(function(){ var obj = " + obj.constructor + "\n";
        for (var c in obj) {
            if (isFunction(obj[c])) {
                string += "obj." + c + " = " + obj[c] + ";\n";
            } else if (isObject(obj[c])) {
                string += "obj." + c + " = " + getSourceOfObject(obj[c]) + ";\n";
            } else {
                string += "obj." + c + " = " + obj[c] + ";\n";
            }
        }
        string += "return obj;})();";
        return string;
    }

    export class Thread{
        private static worker;
        private static scheduler : tsc.lang.Scheduler;

        public static init(){
            if (Thread.worker != null || Thread.scheduler) return;

            try  {
                Thread.worker = new Worker("WorkerSource.js");

                Thread.worker.onmessage = function (e) {
                    console.log(e.data);
                };
            } catch (e) {
                Thread.scheduler = new tsc.lang.Scheduler();
            }
        }

        public static create(runnable : tsc.lang.Runnable){
            Thread.init();
            if (Thread.worker != null) {
                Thread.worker.postMessage(getSourceOfObject(runnable)); 
            } else {
                Thread.scheduler.add(runnable);
            }
        }
    }
}module tsc.ui{

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
			xhr.onreadystatechange = function(){
				if (xhr.readyState == 4 && xhr.status == 200){
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
}module tsc.ui{
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
}/// <reference path="ResourceLoader.ts"/>

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
				} else if(template.parentNode == null) {
					this.instance = template;
				} else {
					this.instance = template.cloneNode(true);
				}
				if(onload) setTimeout(onload, 0);
			}else{
				return false;
			}
			
		}
		
		public getDom() : HTMLElement {
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
module tsc.util{
	export class Buffer<T>{
		private array : Array<T> = new Array<T>();
		private size : number = 0;
		private index : number = 0;
		
		constructor(size : number){
			this.size = size;
		}
		
		public add(item : T){
			if(this.index+1 < this.size){
				this.array[this.index] = item;
				this.index++;
			}else{
				for(var i=0; i<this.array.length-1; i++){
					this.array[i] = this.array[i+1];
				}
				this.array[this.index] = item;
			}
		}
		
		public get(index : number){
			if(index < 0 || index > this.size) return null;
			return this.array[index];
		}
	}
}module tsc.util{
	export class Dictionary<any, V>{
		private array : Array<V> = new Array<V>();
		
		public put(key : any, value : V) : void{
			this.array[key] = value;
		}
		
		public get(key : any) : V {
			return this.array[key];
		}
		
		public elements() : Array<V> {
			var elements = new Array<V>();
			for(var key in this.array){
				elements.push(this.array[key]);
			}
			return elements;
		}
		
		public isEmpty() : boolean{
			return (this.size() == 0);
		}
		
		public keys() : Array<any> {
			var keys = new Array<any>();
			for(var key in this.array){
				keys.push(key);
			}
			return keys;
		}
		
		public remove(key : any) : V {
			var value : V = this.array[key];
			this.array[key] = null;
			return value;
		}
		
		public size() : number {
			var size : number = 0;
			for(var item in this.array){
				size++;
			}
			return size;
		}
	}
}/// <reference path="List.ts"/>

module tsc.util{
	class ListNode{
		public prev : ListNode;
		public next : ListNode;
		public item;
		
		constructor(item) {
			this.item = item;
		}
	}
	
	export class LinkedList<T> implements tsc.util.List<T> {
		private first : ListNode;
		private listsize : number = 0;

		public add(item : T){
			if(this.first == null) this.first = new ListNode(item);
			
			var last : ListNode = this.first;
			while(last.next != null){
				last = last.next;
			}
			last.next = new ListNode(item);
			last.next.prev = last;

			this.listsize++;
		}
		public remove(item : T){
			if(this.first == null) return;
			
			var node : ListNode = this.first;
			while(node.next != null){
				if(node.item == item){
					node.prev.next = node.next;
					node.next.prev = node.prev;
					break;
				}
				node = node.next;
			}

			this.listsize--;
		}
		public get(index : number) : T{
			index++;
			if(index == 0) return null;
			
			var node : ListNode = this.first;
			for(var i : number = 0; i<index; i++){
				if(node.next == null) return null;
				else node = node.next;
			}
			return node.item;
		}
		public size() : number {
			return this.listsize;
		}
	}
}module tsc.util{
	export interface List<T> {
		add(item : T);
		remove(item : T);
		get(index : number) : T;
		size() : number;
	}
}/// <reference path="Observer.ts"/>
module tsc.util{

    export class Observable {
        private observers : Array<tsc.util.Observer>;
     
        constructor() {
            this.observers = new Array<tsc.util.Observer>();
        }
     
        public registerObserver (observer : tsc.util.Observer) : void {
            this.observers.push(observer);
        }
     
        public removeObserver (observer : tsc.util.Observer) : void {
            this.observers.splice(this.observers.indexOf(observer), 1);
        }
     
        public notifyObservers (arg : any) : void {
            this.observers.forEach((observer : tsc.util.Observer) => {
                observer.update(arg);
            });
        }
    }
}module tsc.util{
	export interface Observer {
	    update (arg:any);
	}
}module tsc.util{
	export class Queue<T>{
		private elements = new Array<T>();
		
		public enqueue(element : T) : void {
			this.elements.reverse();
			this.elements.push(element);
			this.elements.reverse();
		}
		
		public dequeue() : T{
			return this.elements.pop();
		}
	}
}module tsc.util{
	export class RingBuffer<T>{
		private array : Array<T> = new Array<T>();
		private itemCount : number = 0;
		private index : number = 0;
		
		constructor(itemCount : number){
			this.itemCount = itemCount;
		}
		
		public add(item : T){
			this.array[this.index] = item;
			this.index = (this.index + 1) % this.itemCount;
		}
		
		public get(index : number) : T{
			if(index < 0 || index > this.itemCount) return null;
			return this.array[index];
		}
	}
}module tsc.util{
	export class Stack<T>{
		private array : Array<T> = new Array<T>();
		
		public push(item : T) : void{
			this.array.push(item);
		}
		
		public pop() : T {
			return this.array.pop();
		}
	}
}