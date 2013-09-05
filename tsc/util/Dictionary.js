var tsc;
(function (tsc) {
    (function (util) {
        var Dictionary = (function () {
            function Dictionary() {
                this.array = new Array();
            }
            Dictionary.prototype.put = function (key, value) {
                this.array[key] = value;
            };

            Dictionary.prototype.get = function (key) {
                return this.array[key];
            };

            Dictionary.prototype.elements = function () {
                var elements = new Array();
                for (var key in this.array) {
                    elements.push(this.array[key]);
                }
                return elements;
            };

            Dictionary.prototype.isEmpty = function () {
                return (this.size() == 0);
            };

            Dictionary.prototype.keys = function () {
                var keys = new Array();
                for (var key in this.array) {
                    keys.push(key);
                }
                return keys;
            };

            Dictionary.prototype.remove = function (key) {
                var value = this.array[key];
                this.array[key] = null;
                return value;
            };

            Dictionary.prototype.size = function () {
                var size = 0;
                for (var item in this.array) {
                    size++;
                }
                return size;
            };
            return Dictionary;
        })();
        util.Dictionary = Dictionary;
    })(tsc.util || (tsc.util = {}));
    var util = tsc.util;
})(tsc || (tsc = {}));
