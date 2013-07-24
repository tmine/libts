/// <reference path="Scheduler.ts"/>

var scheduler = new Scheduler();

var MyConsole = (function () {
    function MyConsole() {
    }
    MyConsole.prototype.log = function (str) {
        self.postMessage(str);
    };
    return MyConsole;
})();
var console = new MyConsole();

self.onmessage = function(e) {
    try{
        scheduler.add(eval(e.data));
        self.postMessage(true);
    }catch(e){
        self.postMessage(false);
    }
};