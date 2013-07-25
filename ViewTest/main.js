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
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var MyView = (function (_super) {
    __extends(MyView, _super);
    function MyView() {
        var _this = this;
        var templateElement = TemplateElementLoader.getTemplateNode("title");

        _super.call(this, templateElement, function () {
            document.body.appendChild(_this.getInstance());
            var element = _this.getHTMLElementById("title");
            element.innerHTML = "Blubber";
        });
    }
    return MyView;
})(View);

var MyOtherView = (function (_super) {
    __extends(MyOtherView, _super);
    function MyOtherView() {
        var _this = this;
        _super.call(this, "Template.html", function () {
            document.body.appendChild(_this.getInstance());
            setTimeout(function () {
                var element = _this.getHTMLElementsByName("title")[0];
                element.innerHTML = "My new Title";
            }, 10000);
        });
    }
    return MyOtherView;
})(View);

new MyView();
new MyOtherView();
