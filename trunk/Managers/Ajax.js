var Managers;
(function (Managers) {
    var Ajax = (function () {
        function Ajax() {
        }
        Ajax.GenerateAuthorization = function (user, pass) {
            this.authorization = btoa(user + ":" + pass);
        };

        Ajax.SendRequest = function (url, method, ok, err) {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url, true);
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.setRequestHeader('Authorization', 'Basic ' + this.authorization);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status >= 200 && xhr.status < 400) {
                        if (ok) {
                            ok(xhr.responseText);
                        }
                    } else {
                        if (err) {
                            err(xhr.status, xhr.responseText);
                        }
                    }
                }
            };
            xhr.send();
        };

        Ajax.Get = function (url, ok, err) {
            if (typeof err === "undefined") { err = undefined; }
            this.SendRequest(Managers.Constants.RelayUrl + url, "GET", function (text) {
                return ok(JSON.parse(text));
            }, err);
        };

        Ajax.Post = function (url, ok, err) {
            if (typeof err === "undefined") { err = undefined; }
            this.SendRequest(Managers.Constants.RelayUrl + url, "POST", function (text) {
                return ok(JSON.parse(text));
            }, err);
        };
        return Ajax;
    })();
    Managers.Ajax = Ajax;
})(Managers || (Managers = {}));
//# sourceMappingURL=Ajax.js.map
