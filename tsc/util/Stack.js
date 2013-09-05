var tsc;
(function (tsc) {
    (function (util) {
        var Stack = (function () {
            function Stack() {
                this.array = new Array();
            }
            Stack.prototype.push = function (item) {
                this.array.push(item);
            };

            Stack.prototype.pop = function () {
                return this.array.pop();
            };
            return Stack;
        })();
        util.Stack = Stack;
    })(tsc.util || (tsc.util = {}));
    var util = tsc.util;
})(tsc || (tsc = {}));
