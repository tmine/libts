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
