var tsc;
(function (tsc) {
    (function (util) {
        var Buffer = (function () {
            function Buffer(size) {
                this.array = new Array();
                this.size = 0;
                this.index = 0;
                this.size = size;
            }
            Buffer.prototype.add = function (item) {
                if (this.index + 1 < this.size) {
                    this.array[this.index] = item;
                    this.index++;
                } else {
                    for (var i = 0; i < this.array.length - 1; i++) {
                        this.array[i] = this.array[i + 1];
                    }
                    this.array[this.index] = item;
                }
            };

            Buffer.prototype.get = function (index) {
                if (index < 0 || index > this.size)
                    return null;
                return this.array[index];
            };
            return Buffer;
        })();
        util.Buffer = Buffer;
    })(tsc.util || (tsc.util = {}));
    var util = tsc.util;
})(tsc || (tsc = {}));
