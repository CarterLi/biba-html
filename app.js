var _this = this;
Array.prototype.first = function () {
    return _this[0];
};

Array.prototype.first = function (callbackfn) {
    for (var i = 0; i < _this.length; ++i) {
        var value = _this[i];
        if (callbackfn(value, i, _this)) {
            return value;
        }
    }
    return undefined;
};

Array.prototype.findFirstIndex = function (callbackfn) {
    for (var i = 0; i < _this.length; ++i) {
        if (callbackfn(_this[i], i, _this)) {
            return i;
        }
    }
    return -1;
};
var Controllers;
(function (Controllers) {
    function ConversationController($scope, $http, $upload, $state, $stateParams) {
        var convId = parseInt($stateParams['convId'], 10);
        var page = 1;
        $scope.IsLoadingMessages = true;

        if ('Conversations' in $scope.$parent) {
            $scope.Conversation = $scope.$parent.Conversations.first(function (x) {
                return x.Id === convId;
            });
        }
        $http.get(Managers.Constants.RelayUrl + "/text_conversations/" + convId).success(function (data) {
            $scope.Conversation = new Models.TextConversation(data);
        }).error(function (e) {
            $state.go('Home');
        });
        $http.get(Managers.Constants.RelayUrl + "/text_conversations/" + convId + "/text_messages").success(function (data) {
            $scope.HasMoreMessages = data.length > 0;
            $scope.Messages = data.map(function (x) {
                return new Models.TextMessage(x);
            });
            $scope.IsLoadingMessages = false;
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

        $scope.AttachClick = function ($event) {
            if ($event.which == 2) {
                $scope.Attachment = null;
                $event.preventDefault();
            } else {
                $('#inputFile').click();
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

        $scope.Preview = function (attachment) {
            $scope.AttachmentToPreview = attachment;
        };

        $scope.LoadHistory = function () {
            $scope.IsLoadingMessages = true;
            $http.get(Managers.Constants.RelayUrl + "/text_conversations/" + convId + "/text_messages?page=" + (++page)).success(function (data) {
                $scope.IsLoadingMessages = false;
                $scope.HasMoreMessages = data.length > 0;
                data.forEach(function (x) {
                    var idx = $scope.Messages.findFirstIndex(function (msg) {
                        return msg.Id === x.id;
                    });
                    if (idx === -1) {
                        $scope.Messages.push(new Models.TextMessage(x));
                    } else {
                        $scope.Messages[idx] = new Models.TextMessage(x);
                    }
                });
            });
        };

        $scope.Send = function () {
            var msg = new Models.TextMessage({
                client_uuid: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                }),
                content: $scope.ChatInput || '',
                profile: Managers.UserManager.Session.Raw()
            });
            var idx = $scope.Messages.push(msg) - 1;
            var file = $scope.Attachment;

            $upload.upload({
                url: Managers.Constants.RelayUrl + "/text_conversations/" + convId + "/text_messages",
                data: {
                    "text_message[client_uuid]": msg.Raw().client_uuid,
                    "text_message[content]": msg.Content
                },
                fileFormDataName: "text_message[attachment]",
                file: file
            }).progress(function ($event) {
                if (file) {
                    msg.Raw().state = 'Sending ' + ($event.loaded / $event.total * 100).toFixed() + '%';
                }
            }).success(function (data) {
                $scope.Messages[idx] = new Models.TextMessage(data);
            }).error(function () {
                msg.Raw().state = 'Error';
            });
            $scope.ChatInput = "";
            $scope.Attachment = null;
        };
    }
    Controllers.ConversationController = ConversationController;
})(Controllers || (Controllers = {}));
var Controllers;
(function (Controllers) {
    function AccountController($scope, $state, $http) {
        $scope.RelayUrl = Managers.Constants.RelayUrl;

        var doSignIn = function (account) {
            $http({
                method: 'POST',
                url: Managers.Constants.RelayUrl + "/sessions",
                headers: { Authorization: "Basic " + btoa(account.email + ":" + account.password) }
            }).success(function (session) {
                window.sessionStorage.setItem("Session", JSON.stringify(session));
                Managers.UserManager.Session = new Models.Profile(session);
                $state.go("Home");
            });
        };

        $scope.OnSignIn = function () {
            if ($scope.SignInForm.$valid) {
                doSignIn($scope.SignIn);
            }
        };

        $scope.OnCreateAccount = function () {
            if ($scope.CreateAccountForm.$valid && $scope.CreateAccount.terms_) {
                $scope.CreateAccount.terms = $scope.CreateAccount.terms_ ? '1' : '0';
                $http.post(Managers.Constants.RelayUrl + "/signups", { signup: $scope.CreateAccount }).success(function () {
                    doSignIn($scope.CreateAccount);
                }).error(function (err) {
                });
            }
        };
    }
    Controllers.AccountController = AccountController;
})(Controllers || (Controllers = {}));
var Controllers;
(function (Controllers) {
    function HomeController($scope, $state, $http) {
        if (!Managers.UserManager.Session) {
            var session = JSON.parse(window.sessionStorage.getItem("Session"));
            if (session && session.id) {
                Managers.UserManager.Session = new Models.Profile(session);
            } else {
                $state.go("Account");
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
    Controllers.HomeController = HomeController;
})(Controllers || (Controllers = {}));
var Controllers;
(function (Controllers) {
    function ImagePreviewerController($scope) {
        $scope.Close = function ($event) {
            if (!$event || $event.target.classList.contains("dialog-body")) {
                $scope.IsLoaded = false;
                $scope.FileName = $scope.Attachment.Raw().filename;
                $scope.Attachment = null;
            }
        };
    }
    Controllers.ImagePreviewerController = ImagePreviewerController;
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
angular.module("BibaApp", ['ui.router', 'ui.bootstrap', 'angularFileUpload']).directive('emoji', function () {
    return ({
        priority: 10,
        restrict: 'A',
        link: function ($scope, $elem, $attrs) {
            $scope.$watch($attrs['ngBind'], function () {
                return window['emojify'].run($elem[0]);
            });
        }
    });
}).directive('autolink', function () {
    return ({
        priority: 5,
        restrict: 'A',
        link: function ($scope, $elem, $attrs) {
            $scope.$watch($attrs['ngBind'], function () {
                return $elem.html($elem.html()['autoLink']({ target: "_blank" }));
            });
        }
    });
}).directive('autofocus', function () {
    return {
        priority: 500,
        restrict: 'A',
        link: function ($scope, $elem, $attrs) {
            $elem[0].focus();
        }
    };
}).directive('autoscrollintoview', function () {
    return {
        priority: 500,
        restrict: 'A',
        link: function ($scope, $elem, $attrs) {
            $scope.$watch($attrs['ngBind'], function () {
                return $elem[0].scrollIntoView(true);
            });
        }
    };
}).directive('contenteditable', function () {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel)
                return;

            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };

            element.on('blur keyup change', function () {
                scope.$apply(read);
            });
            read();

            function read() {
                ngModel.$setViewValue(element[0].innerText);
            }
        }
    };
}).directive('imagePreviewer', function () {
    return {
        restrict: 'E',
        templateUrl: 'Views/ImagePreviewer.html',
        scope: { Attachment: "=attachment" },
        controller: Controllers.ImagePreviewerController,
        link: function ($scope, $elem, $attrs) {
            $elem.find("img").load(function (event) {
                if ($scope.Attachment) {
                    $scope.$apply('IsLoaded = true');
                }
            });
        }
    };
}).directive('userAvatar', function () {
    return {
        restrict: 'E',
        templateUrl: 'Views/UserAvatar.html',
        scope: {
            Profile: "=profile"
        }
    };
}).config(function ($httpProvider, $stateProvider, $urlRouterProvider) {
    window['emojify'].setConfig({ img_dir: "External/emoji.js/images/emoji" });

    $httpProvider.defaults.headers.common.Accept = "application/json";
    $urlRouterProvider.otherwise('/');
    $stateProvider.state('Account', {
        url: '/Account',
        controller: Controllers.AccountController,
        templateUrl: 'Views/Account.html'
    }).state('Home', {
        url: '/',
        controller: Controllers.HomeController,
        templateUrl: 'Views/Home.html'
    }).state('Home.TextConversation', {
        url: 'TextConversations/:convId',
        views: {
            subView: {
                controller: Controllers.ConversationController,
                templateUrl: 'Views/Conversation.html'
            }
        }
    });
}).controller('AppController', function ($scope, $state) {
    $scope['Logout'] = function () {
        window.sessionStorage.removeItem("Session");
        Managers.UserManager.Session = null;
        $state.go("Account");
    };
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

        Object.defineProperty(Attachment.prototype, "Filesize", {
            get: function () {
                return window['filesize'](this.Raw().size);
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
                return !this.Id;
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
                if (this.IsRegistered) {
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
                } else {
                    return "Unregistered";
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

        Object.defineProperty(TextMessage.prototype, "State", {
            get: function () {
                var state = this.Model.state;
                return state ? this.Model.state[0].toUpperCase() + this.Model.state.substr(1) : "Sending";
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TextMessage.prototype, "Attachment", {
            get: function () {
                if (this._attachment === undefined) {
                    this._attachment = this.Model.attachment ? new Models.Attachment(this.Model.attachment) : null;
                }

                return this._attachment;
            },
            enumerable: true,
            configurable: true
        });
        return TextMessage;
    })(Models.BibaModel);
    Models.TextMessage = TextMessage;
})(Models || (Models = {}));
//# sourceMappingURL=app.js.map
