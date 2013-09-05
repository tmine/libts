var tsc;
(function (tsc) {
    /// <reference path="Observer.ts"/>
    (function (util) {
        var Observable = (function () {
            function Observable() {
                this.observers = new Array();
            }
            Observable.prototype.registerObserver = function (observer) {
                this.observers.push(observer);
            };

            Observable.prototype.removeObserver = function (observer) {
                this.observers.splice(this.observers.indexOf(observer), 1);
            };

            Observable.prototype.notifyObservers = function (arg) {
                this.observers.forEach(function (observer) {
                    observer.update(arg);
                });
            };
            return Observable;
        })();
        util.Observable = Observable;
    })(tsc.util || (tsc.util = {}));
    var util = tsc.util;
})(tsc || (tsc = {}));
