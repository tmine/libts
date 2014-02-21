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
self.onmessage = function (e) {
    try  {
        scheduler.add(eval(e.data));
        self.postMessage(true);
    } catch (e) {
        self.postMessage(false);
    }
};

var scheduler = new Scheduler();

var MyConsole = (function () {
    function MyConsole() {
    }
    MyConsole.prototype.log = function (str) {
        self.postMessage(str);
    };
    return MyConsole;
})();
var myconsole = new MyConsole();

self.onmessage = function (e) {
    try  {
        scheduler.add(eval(e.data));
        self.postMessage(true);
    } catch (e) {
        self.postMessage(false);
    }
};
