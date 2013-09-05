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
