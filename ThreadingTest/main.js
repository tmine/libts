var tsc;
(function (tsc) {
    (function (util) {
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
        util.Queue = Queue;
    })(tsc.util || (tsc.util = {}));
    var util = tsc.util;
})(tsc || (tsc = {}));
var tsc;
(function (tsc) {
    /// <reference path="../util/Queue.ts"/>
    /// <reference path="Runnable.ts"/>
    (function (lang) {
        var Scheduler = (function () {
            function Scheduler() {
                var _this = this;
                this.threads = new tsc.util.Queue();
                setInterval(function () {
                    _this.run();
                }, 0);
            }
            Scheduler.prototype.run = function () {
                var runnable = this.threads.dequeue();
                if (runnable != null) {
                    if (runnable.run() == null) {
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
        lang.Scheduler = Scheduler;
    })(tsc.lang || (tsc.lang = {}));
    var lang = tsc.lang;
})(tsc || (tsc = {}));
var tsc;
(function (tsc) {
    /// <reference path="Scheduler.ts"/>
    /// <reference path="Runnable.ts"/>
    (function (main) {
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

        var Thread = (function () {
            function Thread() {
            }
            Thread.init = function () {
                if (Thread.worker != null || Thread.scheduler)
                    return;

                try  {
                    Thread.worker = new Worker("WorkerSource.js");

                    Thread.worker.onmessage = function (e) {
                        console.log(e.data);
                    };
                } catch (e) {
                    Thread.scheduler = new tsc.lang.Scheduler();
                }
            };

            Thread.create = function (runnable) {
                Thread.init();
                if (Thread.worker != null) {
                    Thread.worker.postMessage(getSourceOfObject(runnable));
                } else {
                    Thread.scheduler.add(runnable);
                }
            };
            return Thread;
        })();
        main.Thread = Thread;
    })(tsc.main || (tsc.main = {}));
    var main = tsc.main;
})(tsc || (tsc = {}));
/// <reference path="../tsc/lang/Thread.ts"/>
var Thread = tsc.main.Thread;

/* main */
var MyThread = (function () {
    function MyThread(id) {
        this.id = id;
    }
    MyThread.prototype.init = function () {
        // initialise all vars here
        this.i = 0;
    };

    MyThread.prototype.run = function () {
        if (this.i <= 10) {
            //console.log(this.id + " " + this.i);
            this.i++;
        } else {
            // return something != null to terminate
            console.log("Thread " + this.id + " terminated");
            return 0;
        }
    };
    return MyThread;
})();

var id = 0;
for (var i = 0; i < 10; i++) {
    Thread.create(new MyThread(id++));
}
