var Queue = (function () {
    function Queue() {
        this.elements = new Array();
    }
    Queue.prototype.enqueue = function (element) {
        this.elements.reverse();
        this.elements.push(element);
        this.elements.reverse();
    };
    Queue.prototype.dequeue = function () {
        return this.elements.pop();
    };
    return Queue;
})();
var Scheduler = (function () {
    function Scheduler() {
        var _this = this;
        this.threads = new Queue();
        setInterval(function () {
            _this.run();
        }, 0);
    }
    Scheduler.prototype.run = function () {
        var runnable = this.threads.dequeue();
        if(runnable != null) {
            if(runnable.run() == null) {
                this.threads.enqueue(runnable);
            }
        }
    };
    Scheduler.prototype.add = function (runnable) {
        this.threads.enqueue(runnable);
        runnable.init();
    };
    return Scheduler;
})();
function isFunction(functionToCheck) {
    var getType = {
    };
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}
function isObject(objToCheck) {
    var getType = {
    };
    return objToCheck && getType.toString.call(objToCheck) === '[object Object]';
}
function getSourceOfObject(obj) {
    var string = "";
    string += "(function(){ var obj = " + obj.constructor + "\n";
    for(var c in obj) {
        if(isFunction(obj[c])) {
            string += "obj." + c + " = " + obj[c] + ";\n";
        } else {
            if(isObject(obj[c])) {
                string += "obj." + c + " = " + getSourceOfObject(obj[c]) + ";\n";
            } else {
                string += "obj." + c + " = " + obj[c] + ";\n";
            }
        }
    }
    string += "return obj;})();";
    return string;
}
var Thread = (function () {
    function Thread() { }
    Thread.worker = undefined;
    Thread.scheduler = null;
    Thread.init = function init() {
        if(Thread.worker != null || Thread.scheduler) {
            return;
        }
        try  {
            window.URL = window.URL || window.webkitURL;
            var blob = new Blob([
                document.querySelector('#worker1').textContent
            ], {
                type: 'text/javascript'
            });
            var blobURL = window.URL.createObjectURL(blob);
            Thread.worker = new Worker(blobURL);
            Thread.worker.onmessage = function (e) {
                console.log(e.data);
            };
        } catch (e) {
            Thread.scheduler = new Scheduler();
        }
    }
    Thread.create = function create(runnable) {
        Thread.init();
        if(Thread.worker != null) {
            Thread.worker.postMessage(getSourceOfObject(runnable));
        } else {
            Thread.scheduler.add(runnable);
        }
    }
    return Thread;
})();
