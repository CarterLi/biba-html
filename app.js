var Controllers;
(function (Controllers) {
    function ConversationController($scope, $http, $upload, $stateParams) {
        var convId = $stateParams['convId'];
        $http.get(Managers.Constants.RelayUrl + "/text_conversations/" + convId).success(function (data) {
            $scope.Conversation = new Models.TextConversation(data);
        });
        $http.get(Managers.Constants.RelayUrl + "/text_conversations/" + convId + "/text_messages").success(function (data) {
            $scope.Messages = data.map(function (x) {
                return new Models.TextMessage(x);
            });
        });

        $scope.FileSelected = function ($files) {
            if ($files.length > 1) {
                alert("Only one file is allowed");
                return;
            }
            $scope.Attachment = $files[0];
        };

        $scope.KeyDown = function ($event) {
            if ($event.keyCode == 27) {
                $scope.Attachment = null;
                $event.preventDefault();
            }
        };

        $scope.KeyPress = function ($event) {
            if ($event.keyCode == 13 && !$event.shiftKey) {
                if ($scope.convForm.$valid || $scope.Attachment) {
                    $scope.Send();
                }
                $event.preventDefault();
            }
        };

        $scope.Send = function () {
            var msg = new Models.TextMessage({
                client_uuid: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                }),
                content: $scope.ChatInput || null,
                profile: Managers.UserManager.Session.Raw()
            });
            var idx = $scope.Messages.push(msg) - 1;

            $upload.upload({
                url: Managers.Constants.RelayUrl + "/text_conversations/" + convId + "/text_messages",
                data: {
                    "text_message[client_uuid]": msg.Raw().client_uuid,
                    "text_message[content]": msg.Content
                },
                fileFormDataName: "text_message[attachment]",
                file: $scope.Attachment
            }).progress(function (evt) {
                console.log('percent: ' + (100.0 * evt.loaded / evt.total));
            }).success(function (data) {
                $scope.Messages[idx] = new Models.TextMessage(data);
            });
            $scope.ChatInput = "";
            $scope.Attachment = null;
        };
    }
    Controllers.ConversationController = ConversationController;
})(Controllers || (Controllers = {}));
var Controllers;
(function (Controllers) {
    function LoginController($scope, $state, $http) {
        $scope.Submit = function () {
            $http({
                method: 'POST',
                url: Managers.Constants.RelayUrl + "/sessions",
                headers: { Authorization: "Basic " + btoa($scope.UserName + ":" + $scope.Password) }
            }).success(function (session) {
                window.sessionStorage.setItem("Session", JSON.stringify(session));
                Managers.UserManager.Session = new Models.Profile(session);
                $state.go("Main");
            });
        };
    }
    Controllers.LoginController = LoginController;
})(Controllers || (Controllers = {}));
var Controllers;
(function (Controllers) {
    function MainController($scope, $state, $http) {
        if (!Managers.UserManager.Session) {
            var session = JSON.parse(window.sessionStorage.getItem("Session"));
            if (session && session.id) {
                Managers.UserManager.Session = new Models.Profile(session);
            } else {
                $state.go("Login");
                return;
            }
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
angular.module("BibaApp", ['ui.router', 'angularFileUpload']).directive('emoji', function () {
    return ({
        restrict: 'E',
        template: '<span>{{html}}</span>',
        replace: true,
        link: function ($scope, $elem, $attrs) {
            $attrs.$observe('text', function (value) {
                $elem.text(value);
                window['emojify'].run($elem[0]);
                $scope.html = $elem.html();
            });
        }
    });
}).config(function ($httpProvider, $stateProvider, $urlRouterProvider) {
    window['emojify'].setConfig({ img_dir: "External/emoji.js/images/emoji" });

    $httpProvider.defaults.headers.common.Accept = "application/json";
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
        url: 'TextConversations/:convId',
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
    var Attachment = (function () {
        function Attachment(model) {
            this.model = model;
        }
        Attachment.prototype.Raw = function () {
            return this.model;
        };

        Object.defineProperty(Attachment.prototype, "IsImage", {
            get: function () {
                return this.model.content_type.substr(0, 6) == 'image/';
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Attachment.prototype, "Url", {
            get: function () {
                return Managers.Constants.RelayUrl + this.model.url;
            },
            enumerable: true,
            configurable: true
        });
        return Attachment;
    })();
    Models.Attachment = Attachment;
})(Models || (Models = {}));
var Models;
(function (Models) {
    var BibaModel = (function () {
        function BibaModel(model) {
            if (typeof model === "undefined") { model = null; }
            this.model = model;
        }
        BibaModel.prototype.Raw = function () {
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
        Profile.prototype.Raw = function () {
            return _super.prototype.Raw.call(this);
        };

        Object.defineProperty(Profile.prototype, "Model", {
            get: function () {
                return this.Raw();
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
        TextConversation.prototype.Raw = function () {
            return _super.prototype.Raw.call(this);
        };

        Object.defineProperty(TextConversation.prototype, "Model", {
            get: function () {
                return this.Raw();
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
        TextMessage.prototype.Raw = function () {
            return _super.prototype.Raw.call(this);
        };

        Object.defineProperty(TextMessage.prototype, "Model", {
            get: function () {
                return this.Raw();
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

        Object.defineProperty(TextMessage.prototype, "Attachment", {
            get: function () {
                if (this.attachment === undefined) {
                    this.attachment = this.Model.attachment ? new Models.Attachment(this.Model.attachment) : null;
                }

                return this.attachment;
            },
            enumerable: true,
            configurable: true
        });
        return TextMessage;
    })(Models.BibaModel);
    Models.TextMessage = TextMessage;
})(Models || (Models = {}));
//# sourceMappingURL=app.js.map
