var tsc;
(function (tsc) {
    /// <reference path="List.ts"/>
    (function (util) {
        var ListNode = (function () {
            function ListNode(item) {
                this.item = item;
            }
            return ListNode;
        })();

        var LinkedList = (function () {
            function LinkedList() {
            }
            LinkedList.prototype.add = function (item) {
                if (this.first == null)
                    this.first = new ListNode(item);

                var last = this.first;
                while (last.next != null) {
                    last = last.next;
                }
                last.next = new ListNode(item);
                last.next.prev = last;
            };
            LinkedList.prototype.remove = function (item) {
                if (this.first == null)
                    return;

                var node = this.first;
                while (node.next != null) {
                    if (node.item == item) {
                        node.prev.next = node.next;
                        node.next.prev = node.prev;
                        break;
                    }
                    node = node.next;
                }
            };
            LinkedList.prototype.get = function (index) {
                if (index == 0)
                    return null;

                var node = this.first;
                for (var i = 0; i < index; i++) {
                    if (node.next == null)
                        return null;
else
                        node = node.next;
                }
                return node.item;
            };
            return LinkedList;
        })();
        util.LinkedList = LinkedList;
    })(tsc.util || (tsc.util = {}));
    var util = tsc.util;
})(tsc || (tsc = {}));
