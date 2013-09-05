var tsc;
(function (tsc) {
    (function (util) {
        var RingBuffer = (function () {
            function RingBuffer(itemCount) {
                this.array = new Array();
                this.itemCount = 0;
                this.index = 0;
                this.itemCount = itemCount;
            }
            RingBuffer.prototype.add = function (item) {
                this.array[this.index] = item;
                this.index = (this.index + 1) % this.itemCount;
            };

            RingBuffer.prototype.get = function (index) {
                if (index < 0 || index > this.itemCount)
                    return null;
                return this.array[index];
            };
            return RingBuffer;
        })();
        util.RingBuffer = RingBuffer;
    })(tsc.util || (tsc.util = {}));
    var util = tsc.util;
})(tsc || (tsc = {}));
