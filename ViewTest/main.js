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
    })(tsc.ui || (tsc.ui = {}));
    var ui = tsc.ui;
})(tsc || (tsc = {}));
/// <reference path="ResourceLoader.ts"/>
var tsc;
(function (tsc) {
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
                            new ui.ResourceLoader().loadXML(template, function (xsl) {
                                var xsltProcessor = new XSLTProcessor();
                                xsltProcessor.importStylesheet(xsl);
                                var xml = View.toXML(data, match);
                                _this.instance = xsltProcessor.transformToFragment(xml, document);
                                setTimeout(onload, 0);
                            });
                        } else {
                            var xsl = new ui.ResourceLoader().loadXML(template);
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
                                new ui.ResourceLoader().load(template, function (content) {
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
                                var content = new ui.ResourceLoader().load(template);
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
    })(tsc.ui || (tsc.ui = {}));
    var ui = tsc.ui;
})(tsc || (tsc = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../tsc/ui/TemplateElementLoader.ts"/>
/// <reference path="../tsc/ui/View.ts"/>
var TemplateElementLoader = tsc.ui.TemplateElementLoader;

var MyView = (function (_super) {
    __extends(MyView, _super);
    function MyView() {
        var _this = this;
        // get the template Element with the TemplateElementLoader Class
        var templateElement = TemplateElementLoader.getTemplateNode("title");

        // construct your view
        _super.call(this, templateElement, function () {
            document.body.appendChild(_this.getDom());
            var element = _this.getHTMLElementById("title");
            element.innerHTML = "Blubber";
        });
    }
    return MyView;
})(tsc.ui.View);

var MyOtherView = (function (_super) {
    __extends(MyOtherView, _super);
    function MyOtherView() {
        var _this = this;
        // construct your view
        _super.call(this, "Template.html", function () {
            document.body.appendChild(_this.getDom());
            setTimeout(function () {
                var element = _this.getHTMLElementsByName("title")[0];
                element.innerHTML = "My new Title";
            }, 10000);
        });
    }
    return MyOtherView;
})(tsc.ui.View);

new MyView();
new MyOtherView();
