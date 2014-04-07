/// <reference path="../External/angularjs/angular.d.ts" />
/// <reference path="../External/angular-ui/angular-ui-router.d.ts" />
var Controllers;
(function (Controllers) {
    function ConversationController($scope, $http, $stateParams) {
        var convId = $stateParams['convId'];
        $http.get(Managers.Constants.RelayUrl + "/text_conversations/" + convId).success(function (data) {
            $scope.Conversation = new Models.TextConversation(data);
        });
        $http.get(Managers.Constants.RelayUrl + "/text_conversations/" + convId + "/text_messages").success(function (data) {
            $scope.Messages = data.map(function (x) {
                return new Models.TextMessage(x);
            });
        });

        $scope.Send = function () {
            // Code used: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            $http.post(Managers.Constants.RelayUrl + "/text_conversations/" + convId + "/text_messages", {
                text_message: {
                    client_uuid: uuid,
                    content: $scope.ChatInput
                }
            });
            $scope.ChatInput = "";
        };
    }
    Controllers.ConversationController = ConversationController;
})(Controllers || (Controllers = {}));
/// <reference path="../External/angularjs/angular.d.ts" />
var Controllers;
(function (Controllers) {
    function LoginController($scope, $state, $http) {
        $http.defaults.headers.common.Accept = "application/json";

        var Login = function (authorization) {
            $http.defaults.headers.common.Authorization = "Basic " + authorization;
            $http.post(Managers.Constants.RelayUrl + "/sessions", null).success(function (session) {
                window.sessionStorage.setItem("LoginInfo", authorization);
                Managers.UserManager.Session = new Models.Profile(session);
                $state.go("Main");
            });
        };

        $scope.Submit = function () {
            Login(btoa($scope.UserName + ":" + $scope.Password));
        };

        (function () {
            var authorization = window.sessionStorage.getItem("LoginInfo");
            if (authorization)
                Login(authorization);
        })();
    }
    Controllers.LoginController = LoginController;
})(Controllers || (Controllers = {}));
/// <reference path="../External/angularjs/angular.d.ts" />
/// <reference path="../External/angularjs/angular-route.d.ts" />
var Controllers;
(function (Controllers) {
    function MainController($scope, $state, $http) {
        if (!Managers.UserManager.Session) {
            $state.go("Login");
            return;
        }

        $http.get(Managers.Constants.RelayUrl + "/text_conversations").success(function (data) {
            $scope.Conversations = data.map(function (x) {
                return new Models.TextConversation(x);
            }).filter(function (x) {
                return !x.IsGroupChat;
            });
        });
    }
    Controllers.MainController = MainController;
})(Controllers || (Controllers = {}));
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
/// <reference path="External/angularjs/angular.d.ts" />
/// <reference path="External/angular-ui/angular-ui-router.d.ts" />
/// <reference path="Controllers/MainController.ts" />
/// <reference path="Controllers/LoginController.ts" />
angular.module("BibaApp", ['ui.router']).config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider.state('Login', {
        url: '/Login',
        controller: 'Controllers.LoginController',
        templateUrl: 'Views/Login.html'
    }).state('Main', {
        url: '/',
        controller: 'Controllers.MainController',
        templateUrl: 'Views/Main.html'
    }).state('Main.TextConversation', {
        url: '/TextConversations/:convId',
        views: {
            subView: {
                controller: 'Controllers.ConversationController',
                templateUrl: 'Views/Conversation.html'
            }
        }
    });
});
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
/// <reference path="../External/angularjs/angular.d.ts" />
/// <reference path="../External/angularjs/angular-route.d.ts" />
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
