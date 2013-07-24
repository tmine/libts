/// <reference path="Scheduler.ts"/>
/// <reference path="Runnable.ts"/>

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

class Thread{
    private static worker;
    private static scheduler : Scheduler;

    public static init(){
        if (Thread.worker != null || Thread.scheduler) return;

        try  {
            Thread.worker = new Worker("WorkerSource.js");

            Thread.worker.onmessage = function (e) {
                console.log(e.data);
            };
        } catch (e) {
            Thread.scheduler = new Scheduler();
        }
    }

    public static create(runnable : Runnable){
        Thread.init();
        if (Thread.worker != null) {
            Thread.worker.postMessage(getSourceOfObject(runnable)); 
        } else {
            Thread.scheduler.add(runnable);
        }
    }
}
