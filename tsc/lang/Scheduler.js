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
