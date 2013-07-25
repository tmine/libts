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
var tsc;
(function (tsc) {
    (function (ui) {
        if (!XMLHttpRequest) {
            XMLHttpRequest = ActiveXObject("Microsoft.XMLHTTP");
        }

        var ResourceLoader = (function () {
            function ResourceLoader() {
            }
            ResourceLoader.prototype.load = function (path, callback) {
                return this._load(false, path, callback);
            };
            ResourceLoader.prototype.loadXML = function (path, callback) {
                return this._load(true, path, callback);
            };

            ResourceLoader.prototype._load = function (xml, path, callback) {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        if (callback) {
                            if (xml)
                                callback(xhr.responseXML); else
                                callback(xhr.responseText);
                        }
                    }
                };
                xhr.open("GET", path, (callback != undefined));
                xhr.send();

                if (xml)
                    return xhr.responseXML; else
                    return xhr.responseText;
            };
            return ResourceLoader;
        })();
        ui.ResourceLoader = ResourceLoader;
    })(tsc.ui || (tsc.ui = {}));
    var ui = tsc.ui;
})(tsc || (tsc = {}));
var tsc;
(function (tsc) {
    (function (ui) {
        var TemplateElementLoader = (function () {
            function TemplateElementLoader() {
            }
            TemplateElementLoader.getTemplateNode = function (name) {
                var templateElements = document.getElementsByTagName("template");
                for (var i in templateElements) {
                    var element = (templateElements[i]);
                    if (element.getAttribute("templateName") == name)
                        return element;
                }
                return null;
            };
            return TemplateElementLoader;
        })();
        ui.TemplateElementLoader = TemplateElementLoader;
    })(tsc.ui || (tsc.ui = {}));
    var ui = tsc.ui;
})(tsc || (tsc = {}));
var tsc;
(function (tsc) {
    (function (ui) {
        var ResourceLoader = tsc.ui.ResourceLoader;

        var View = (function () {
            function View(template, onload) {
                if (template.constructor === String) {
                    if (!template || template == "") {
                        return false;
                    }

                    if (onload) {
                        var _this = this;
                        new ResourceLoader().load(template, function (content) {
                            _this.instance = document.createElement("span");
                            _this.instance.innerHTML = content;

                            setTimeout(onload, 0);
                        });
                    } else {
                        var content = new ResourceLoader().load(template);
                        this.instance = document.createElement("span");
                        this.instance.innerHTML = content;
                    }
                } else if (template instanceof HTMLElement) {
                    if (template.nodeName == "TEMPLATE") {
                        this.instance = document.createElement("span");
                        this.instance.innerHTML = template.innerHTML;
                    } else {
                        this.instance = template.cloneNode(true);
                    }
                    if (onload)
                        setTimeout(onload, 0);
                } else {
                    return false;
                }
            }
            View.prototype.getInstance = function () {
                return this.instance;
            };

            View.prototype.getHTMLElementsByName = function (name) {
                var elements = new Array();
                this._traversAllChildNodes(function (element) {
                    if (element.getAttribute && element.getAttribute("name") == name)
                        elements.push(element);
                }, this.instance);
                return elements;
            };

            View.prototype._traversAllChildNodes = function (visitor, instance) {
                visitor(instance);
                var childNodes = instance.childNodes;
                for (var i in childNodes) {
                    this._traversAllChildNodes(visitor, childNodes[i]);
                }
            };

            View.prototype.getHTMLElementById = function (id) {
                return this._getHTMLElementById(id, this.instance);
            };

            View.prototype._getHTMLElementById = function (id, instance) {
                if (instance.getAttribute("id") == id)
                    return instance;

                var childNodes = instance.childNodes;
                for (var i in childNodes) {
                    var instance = this._getHTMLElementById(id, childNodes[i]);
                    if (instance != null)
                        return instance;
                }

                return null;
            };
            return View;
        })();
        ui.View = View;
    })(tsc.ui || (tsc.ui = {}));
    var ui = tsc.ui;
})(tsc || (tsc = {}));
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
var tsc;
(function (tsc) {
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
                        return null; else
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
var tsc;
(function (tsc) {
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
