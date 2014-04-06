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
            this.SendRequest(Managers.Constants.RelayUrl + url, "GET", function (text) {
                return ok(JSON.parse(text));
            }, err);
        };

        Ajax.Post = function (url, ok, err) {
            this.SendRequest(Managers.Constants.RelayUrl + url, "POST", function (text) {
                return ok(JSON.parse(text));
            }, err);
        };
        return Ajax;
    })();
    Managers.Ajax = Ajax;
})(Managers || (Managers = {}));
var Ajax = Managers.Ajax;

function main() {
    Ajax.Get("/text_conversations", function (obj) {
        var main = document.querySelector("#main");
        var convList = main.querySelector("div.left");
        var convView = main.querySelector("div.right");
        obj.map(function (x) {
            return new Models.TextConversation(x);
        }).filter(function (x) {
            return !x.IsGroupChat;
        }).forEach(function (x) {
            var divConv = document.createElement("div");
            var divMsg = document.createElement("div");
            divMsg.appendChild(document.createTextNode(x.GetRawModel().last_message.content));
            divConv.appendChild(divMsg);
            convView.appendChild(divConv);

            var divProfile = document.createElement("div");
            divProfile.appendChild(document.createTextNode(x.Receiver.FullName));
            divProfile.addEventListener("click", function (e) {
                var oldSelected = convList.querySelector("div.selected");
                if (oldSelected != null)
                    oldSelected.classList.remove("selected");
                divProfile.classList.add("selected");
                oldSelected = convView.querySelector("div.selected");
                if (oldSelected != null)
                    oldSelected.classList.remove("selected");
                divConv.classList.add("selected");

                Ajax.Get("/text_conversations/" + x.Id + "/text_messages", function (obj) {
                    while (divConv.lastChild)
                        divConv.removeChild(divConv.lastChild);
                    obj.map(function (x) {
                        return new Models.TextMessage(x);
                    }).forEach(function (x) {
                        var divMsg = document.createElement("div");
                        divMsg.appendChild(document.createTextNode(x.Content));
                        divConv.appendChild(divMsg);
                    });
                    divConv.lastElementChild.scrollIntoView();
                });
            });
            convList.appendChild(divProfile);
        });
    }, function (status, text) {
        return console.log("Error loading conversations..." + text);
    });
}

window.onload = function () {
    var loginForm = document.querySelector("#login");
    loginForm.querySelector("input[type=submit]").addEventListener("click", function (arg) {
        if (!loginForm.checkValidity()) {
            return;
        }

        var username = loginForm["username"].value;
        var password = loginForm["password"].value;
        Managers.UserManager.Login(username, password, function () {
            document.querySelector("body").classList.remove("login");
            main();
        });
    });
};
var Managers;
(function (Managers) {
    Managers.Constants = {
        "RelayUrl": "https://stage.biba.com"
    };
})(Managers || (Managers = {}));
var Managers;
(function (Managers) {
    var UserManager = (function () {
        function UserManager() {
        }
        UserManager.Login = function (user, pass, ok) {
            var _this = this;
            Managers.Ajax.GenerateAuthorization(user, pass);
            Managers.Ajax.Post("/sessions", function (session) {
                console.log("Login successfully");
                _this.Session = new Models.Profile(session);
                ok();
            }, function (err) {
                console.log("Error login..." + err);
            });
        };
        return UserManager;
    })();
    Managers.UserManager = UserManager;
})(Managers || (Managers = {}));
var Models;
(function (Models) {
    var BibaModel = (function () {
        function BibaModel(model) {
            if (typeof model === "undefined") { model = null; }
            this.model = model;
        }
        BibaModel.prototype.GetRawModel = function () {
            return this.model;
        };

        Object.defineProperty(BibaModel.prototype, "Id", {
            get: function () {
                return this.model.id;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(BibaModel.prototype, "LockVersion", {
            get: function () {
                return this.model.lock_version;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(BibaModel.prototype, "CreateAt", {
            get: function () {
                return new Date(this.model.created_at);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(BibaModel.prototype, "UpdatedAt", {
            get: function () {
                return new Date(this.model.updated_at);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(BibaModel.prototype, "IsNew", {
            get: function () {
                return !!this.Id;
            },
            enumerable: true,
            configurable: true
        });
        return BibaModel;
    })();
    Models.BibaModel = BibaModel;
})(Models || (Models = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Models;
(function (Models) {
    var Profile = (function (_super) {
        __extends(Profile, _super);
        function Profile(model) {
            _super.call(this, model);
        }
        Profile.prototype.GetRawModel = function () {
            return _super.prototype.GetRawModel.call(this);
        };

        Object.defineProperty(Profile.prototype, "Model", {
            get: function () {
                return this.GetRawModel();
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Profile.prototype, "Email", {
            get: function () {
                return this.Model.email;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Profile.prototype, "FullName", {
            get: function () {
                return this.Model.full_name;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Profile.prototype, "IsRegistered", {
            get: function () {
                return this.Model["registered?"];
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Profile.prototype, "Availability", {
            get: function () {
                switch (this.Model.presence_dot) {
                    case 0:
                        return "None";
                    case 1:
                        return "Unknown";
                    case 2:
                        return "Available";
                    case 3:
                        return "MayBeAway";
                    case 4:
                        return "Busy";
                    case 5:
                        return "Phone";
                    default:
                        return null;
                }
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Profile.prototype, "IsCurrentUser", {
            get: function () {
                return this.Id === Managers.UserManager.Session.Id;
            },
            enumerable: true,
            configurable: true
        });
        return Profile;
    })(Models.BibaModel);
    Models.Profile = Profile;
})(Models || (Models = {}));
var Models;
(function (Models) {
    var TextConversation = (function (_super) {
        __extends(TextConversation, _super);
        function TextConversation(model) {
            if (typeof model === "undefined") { model = null; }
            _super.call(this, model);
        }
        TextConversation.prototype.GetRawModel = function () {
            return _super.prototype.GetRawModel.call(this);
        };

        Object.defineProperty(TextConversation.prototype, "Model", {
            get: function () {
                return this.GetRawModel();
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TextConversation.prototype, "IsGroupChat", {
            get: function () {
                return this.Model.profiles.length > 2;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TextConversation.prototype, "Profiles", {
            get: function () {
                return this._profiles = this._profiles || this.Model.profiles.map(function (x) {
                    return new Models.Profile(x);
                });
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TextConversation.prototype, "Receiver", {
            get: function () {
                for (var i = 0; i < this.Profiles.length; ++i) {
                    if (!this.Profiles[i].IsCurrentUser)
                        return this.Profiles[i];
                }
                throw new Error("Server bug found!");
            },
            enumerable: true,
            configurable: true
        });
        return TextConversation;
    })(Models.BibaModel);
    Models.TextConversation = TextConversation;
})(Models || (Models = {}));
var Models;
(function (Models) {
    var TextMessage = (function (_super) {
        __extends(TextMessage, _super);
        function TextMessage(model) {
            if (typeof model === "undefined") { model = null; }
            _super.call(this, model);
        }
        TextMessage.prototype.GetRawModel = function () {
            return _super.prototype.GetRawModel.call(this);
        };

        Object.defineProperty(TextMessage.prototype, "Model", {
            get: function () {
                return this.GetRawModel();
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TextMessage.prototype, "Profile", {
            get: function () {
                return this._profile = this._profile || new Models.Profile(this.Model.profile);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TextMessage.prototype, "Content", {
            get: function () {
                return this.Model.content;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TextMessage.prototype, "IsOwnMessage", {
            get: function () {
                return this.Profile.IsCurrentUser;
            },
            enumerable: true,
            configurable: true
        });
        return TextMessage;
    })(Models.BibaModel);
    Models.TextMessage = TextMessage;
})(Models || (Models = {}));
//# sourceMappingURL=app.js.map
