var tsc;
(function (tsc) {
    /// <reference path="ResourceLoader.ts"/>
    (function (ui) {
        var ResourceLoader = tsc.ui.ResourceLoader;

        var View = (function () {
            // you can construct your view with:
            // - HTMLElement (will be cloned)
            // - Template HTMLElement, you will receive the content of the template Element in a new span
            // - Path (string) Content of this HTML File will be loaded inside a span element which will be you instance object
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
