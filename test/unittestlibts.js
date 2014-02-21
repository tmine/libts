var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var ts;
(function (ts) {
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
    })(ts.util || (ts.util = {}));
    var util = ts.util;
})(ts || (ts = {}));
/// <reference path="../util/Queue.ts"/>
/// <reference path="Runnable.ts"/>
var ts;
(function (ts) {
    (function (lang) {
        var Scheduler = (function () {
            function Scheduler() {
                var _this = this;
                this.threads = new ts.util.Queue();
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
    })(ts.lang || (ts.lang = {}));
    var lang = ts.lang;
})(ts || (ts = {}));
/// <reference path="Scheduler.ts"/>
/// <reference path="Runnable.ts"/>
var ts;
(function (ts) {
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
                    Thread.scheduler = new ts.lang.Scheduler();
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
    })(ts.main || (ts.main = {}));
    var main = ts.main;
})(ts || (ts = {}));
var ts;
(function (ts) {
    (function (ui) {
        // XMLHttpRequest for IE6, IE5
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
                    if (xhr.readyState == 4) {
                        if (callback) {
                            if (xml)
                                callback(xhr.responseXML);
                            else
                                callback(xhr.responseText);
                        }
                    }
                };
                xhr.open("GET", path, (callback != undefined));
                xhr.send();

                if (xml)
                    return xhr.responseXML;
                else
                    return xhr.responseText;
            };
            return ResourceLoader;
        })();
        ui.ResourceLoader = ResourceLoader;
    })(ts.ui || (ts.ui = {}));
    var ui = ts.ui;
})(ts || (ts = {}));
var ts;
(function (ts) {
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
    })(ts.ui || (ts.ui = {}));
    var ui = ts.ui;
})(ts || (ts = {}));
/// <reference path="ResourceLoader.ts"/>

var ts;
(function (ts) {
    (function (ui) {
        var TemplateCache = (function () {
            function TemplateCache() {
            }
            TemplateCache.put = function (key, element) {
                var styles = element.getElementsByTagName("style");

                for (var i = 0; i < styles.length; i++) {
                    document.head.appendChild(styles[i]);
                }
                for (var i = 0; i < styles.length; i++) {
                    element.removeChild(styles[i]);
                }

                TemplateCache.cache[key] = element.cloneNode(true);
            };

            TemplateCache.get = function (key) {
                var element = TemplateCache.cache[key];
                if (element) {
                    element = element.cloneNode(true);
                    return element;
                } else {
                    return null;
                }
            };
            TemplateCache.cache = new Array();
            return TemplateCache;
        })();

        var View = (function () {
            // you can construct your view with:
            // - HTMLElement
            // - Template HTMLElement, you will receive the content of the template Element in a new span
            // - Path (string) Content of this HTML File will be loaded inside a span element which will be you instance object
            function View(template, onload, data, match) {
                if (template.constructor === String) {
                    if (!template || template == "")
                        return false;

                    if (template.indexOf(".xsl") != -1) {
                        if (onload) {
                            var _this = this;
                            new ts.ui.ResourceLoader().loadXML(template, function (xsl) {
                                var xsltProcessor = new XSLTProcessor();
                                xsltProcessor.importStylesheet(xsl);
                                var xml = View.toXML(data, match);
                                _this.instance = xsltProcessor.transformToFragment(xml, document);
                                setTimeout(onload, 0);
                            });
                        } else {
                            var xsl = new ts.ui.ResourceLoader().loadXML(template);
                            var xsltProcessor = new XSLTProcessor();
                            xsltProcessor.importStylesheet(xsl);
                            var xml = View.toXML(data, match);
                            this.instance = xsltProcessor.transformToFragment(xml, document);
                        }
                    } else {
                        if (onload) {
                            var _this = this;

                            var instance = TemplateCache.get(template);
                            if (instance) {
                                this.instance = instance;
                            } else {
                                new ts.ui.ResourceLoader().load(template, function (content) {
                                    _this.instance = document.createElement("span");
                                    _this.instance.innerHTML = content;

                                    TemplateCache.put(template, _this.instance);

                                    setTimeout(onload, 0);
                                });
                            }
                        } else {
                            var instance = TemplateCache.get(template);
                            if (instance) {
                                this.instance = instance;
                            } else {
                                var content = new ts.ui.ResourceLoader().load(template);
                                this.instance = document.createElement("span");
                                this.instance.innerHTML = content;

                                TemplateCache.put(template, this.instance);
                            }
                        }
                    }
                } else if (template instanceof HTMLElement) {
                    if (template.nodeName == "TEMPLATE") {
                        this.instance = document.createElement("span");
                        this.instance.innerHTML = template.innerHTML;
                    } else if (template.parentNode == null) {
                        this.instance = template;
                    } else {
                        this.instance = template;
                    }
                    if (onload)
                        setTimeout(onload, 0);
                } else {
                    return false;
                }
            }
            View.prototype.getDom = function () {
                return this.instance;
            };

            View.prototype.append = function (parent) {
                if (parent && this.instance)
                    parent.appendChild(this.instance);
            };

            View.prototype.deinit = function () {
            };

            View.prototype.supplant = function (o) {
                this.instance.innerHTML = this.instance.innerHTML.replace(/\{([^{}]*)\}/g, function (a, b) {
                    var r = o[b];
                    return typeof r === 'string' || typeof r === 'number' ? r : a;
                });
            };

            View.prototype.getHTMLElementsByName = function (name) {
                if (this.instance.querySelector) {
                    return this.instance.querySelectorAll("[name=" + name + "]");
                }

                var elements = new Array();
                this._traversAllChildNodes(function (element) {
                    if (element.getAttribute && element.getAttribute("name") == name)
                        elements.push(element);
                }, this.instance);
                return elements;
            };

            View.prototype.getHTMLElementsByAttribute = function (attribute, value) {
                if (this.instance.querySelector) {
                    if (attribute === "class")
                        return this.instance.querySelectorAll("." + value);
                    return this.instance.querySelectorAll("[" + attribute + "=" + value + "]");
                }

                var elements = new Array();
                this._traversAllChildNodes(function (element) {
                    if (element.getAttribute && element.getAttribute(attribute) == value)
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

            View.prototype.traversAllChildNodes = function (visitor, instance) {
                this._traversAllChildNodes(visitor, instance);
            };

            View.prototype.getHTMLElementById = function (id) {
                if (this.instance.querySelector) {
                    return this.instance.querySelector("#" + id);
                }

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

            View.toXML = function (obj, name) {
                if (!name)
                    name = "root";
                var xml = document.createElement("" + name);
                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        if (obj[prop] instanceof Array) {
                            for (var i = 0; i < obj[prop].length; i++) {
                                xml.appendChild(View.toXML(obj[prop][i], prop));
                            }
                        } else if (typeof obj[prop] == "object") {
                            xml.appendChild(View.toXML(obj[prop], prop));
                        } else if (typeof obj[prop] == "function") {
                        } else {
                            var element = document.createElement(prop);
                            var value = document.createTextNode("" + obj[prop]);
                            element.appendChild(value);
                            xml.appendChild(element);
                        }
                    }
                }
                return xml;
            };
            return View;
        })();
        ui.View = View;
    })(ts.ui || (ts.ui = {}));
    var ui = ts.ui;
})(ts || (ts = {}));
var ts;
(function (ts) {
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
    })(ts.util || (ts.util = {}));
    var util = ts.util;
})(ts || (ts = {}));
var ts;
(function (ts) {
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
    })(ts.util || (ts.util = {}));
    var util = ts.util;
})(ts || (ts = {}));
/// <reference path="List.ts"/>
var ts;
(function (ts) {
    (function (util) {
        var ListNode = (function () {
            function ListNode(item) {
                this.item = item;
            }
            return ListNode;
        })();

        var LinkedList = (function () {
            function LinkedList() {
                this.listsize = 0;
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

                this.listsize++;
            };
            LinkedList.prototype.remove = function (item) {
                if (this.first == null)
                    return;

                var node = this.first;
                while (node.next != null) {
                    if (node.item == item) {
                        if (node.prev)
                            node.prev.next = node.next;
                        if (node.next)
                            node.next.prev = node.prev;
                        break;
                    }
                    node = node.next;
                }

                this.listsize--;
            };
            LinkedList.prototype.get = function (index) {
                index++;
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
            LinkedList.prototype.size = function () {
                return this.listsize;
            };
            return LinkedList;
        })();
        util.LinkedList = LinkedList;
    })(ts.util || (ts.util = {}));
    var util = ts.util;
})(ts || (ts = {}));
var ts;
(function (ts) {
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
    })(ts.util || (ts.util = {}));
    var util = ts.util;
})(ts || (ts = {}));
var ts;
(function (ts) {
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
    })(ts.util || (ts.util = {}));
    var util = ts.util;
})(ts || (ts = {}));
var ts;
(function (ts) {
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

            Stack.prototype.peek = function () {
                var item = this.array.pop();
                this.array.push(item);
                return item;
            };

            Stack.prototype.size = function () {
                return this.array.length;
            };

            Stack.prototype.empty = function () {
                return this.array.length == 0;
            };
            return Stack;
        })();
        util.Stack = Stack;
    })(ts.util || (ts.util = {}));
    var util = ts.util;
})(ts || (ts = {}));
