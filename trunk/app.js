if (typeof Array.prototype.first != "function") {
    Array.prototype.first = function (callbackfn) {
        if (callbackfn) {
            for (var i = 0; i < this.length; ++i) {
                var value = this[i];
                if (callbackfn(value, i, this)) {
                    return value;
                }
            }

            return undefined;
        } else {
            return this[0];
        }
    };
}

if (typeof Array.prototype.findFirstIndex != "function") {
    Array.prototype.findFirstIndex = function (callbackfn) {
        for (var i = 0; i < this.length; ++i) {
            if (callbackfn(this[i], i, this)) {
                return i;
            }
        }
        return -1;
    };
}
var Controllers;
(function (Controllers) {
    function ConversationController($scope, $rootScope, $http, $upload, $state, $stateParams) {
        var convId = parseInt($stateParams['convId'], 10);
        var page = 1;
        $scope.IsLoadingMessages = true;

        if ('Conversations' in $scope.$parent) {
            $scope.Conversation = $scope.$parent.ActiveConversations.first(function (x) {
                return x.Id === convId;
            });
        }
        $http.get($rootScope.RelayUrl + "/text_conversations/" + convId).success(function (data) {
            $scope.Conversation = new Models.TextConversation(data);
        }).error(function (e) {
            $state.go('Home');
        });
        $http.get($rootScope.RelayUrl + "/text_conversations/" + convId + "/text_messages").success(function (data) {
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
            $http.get($rootScope.RelayUrl + "/text_conversations/" + convId + "/text_messages?page=" + (++page)).success(function (data) {
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
                profile: $rootScope.Session.Raw()
            });
            var idx = $scope.Messages.push(msg) - 1;
            var file = $scope.Attachment;

            $upload.upload({
                url: $rootScope.RelayUrl + "/text_conversations/" + convId + "/text_messages",
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
    function AccountController($rootScope, $scope, $state, $http) {
        var doSignIn = function (account) {
            $http({
                method: 'POST',
                url: $rootScope.RelayUrl + "/sessions",
                headers: { Authorization: "Basic " + btoa(account.email + ":" + account.password) }
            }).success(function (session) {
                window.sessionStorage.setItem("Session", JSON.stringify(session));
                $rootScope.Session = new Models.Profile(session);
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
                $http.post($rootScope.RelayUrl + "/signups", { signup: $scope.CreateAccount }).success(function () {
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
    function HomeController($scope, $rootScope, $state, $http, $timeout) {
        var conversations;

        $http.get($rootScope.RelayUrl + "/text_conversations").success(function (data) {
            conversations = data.map(function (x) {
                return new Models.TextConversation(x);
            }).filter(function (x) {
                return !x.IsGroupChat;
            });
            $scope.ActiveConversations = conversations.slice(0, 10);
        });

        $http.get($rootScope.RelayUrl + "/profiles/0/contacts").success(function (data) {
            $scope.Contacts = data.map(function (x) {
                return new Models.Profile(x);
            });
        });

        (function () {
            var filterTextTimeout;
            var tempFilterText;

            $scope.$watch('ContactsFilterText', function (val) {
                if (filterTextTimeout)
                    $timeout.cancel(filterTextTimeout);

                tempFilterText = val;
                filterTextTimeout = $timeout(function () {
                    $scope.DoContactsFilterText = tempFilterText;
                }, 400);
            });
        })();

        $scope.ContactsFilterPredicate = function (contact) {
            return !$scope.DoContactsFilterText || contact.FullName.startsWithIgnoreCase($scope.DoContactsFilterText) || (contact.Raw().last_name && contact.Raw().last_name.startsWithIgnoreCase($scope.DoContactsFilterText)) || contact.Email.startsWithIgnoreCase($scope.DoContactsFilterText) || contact.EmailDomain.startsWithIgnoreCase($scope.DoContactsFilterText);
        };

        $scope.OpenConversation = function (contact) {
            var conv = conversations.first(function (x) {
                return x.Receiver.Id === contact.Id;
            });
            if (conv) {
                conv.UpdatedAt = new Date();

                if ($scope.ActiveConversations.first(function (x) {
                    return x.Id === conv.Id;
                }) === undefined) {
                    $scope.ActiveConversations.unshift(conv);
                }
            } else {
                conv = new Models.TextConversation({
                    profiles: [$rootScope.Session.Raw(), contact.Raw()],
                    updated_at: new Date().toISOString()
                });
                console.log(conv.Receiver);
                $scope.ActiveConversations.unshift(conv);
            }
            $state.go("Home.TextConversation", {
                convId: conv.Id
            });
            $scope.IsNewConversationOpen = false;
        };

        $scope.CloseConversation = function (index) {
            var conv = $scope.ActiveConversations.splice(index, 1).first();
            if ($state.current.name === "Home.TextConversation" && $state.params['convId'] == conv.Id) {
                $state.go('Home');
            }
        };

        $scope.IsNewConversationOpenChanged = function () {
            if ($scope.IsNewConversationOpen) {
                $("#newMessage + .pop-over input[type=search]").focus();
            } else {
                $scope.ContactsFilterText = '';
            }
        };

        $scope.MoveItem = function (from, to) {
            if (from === to)
                return;
            var old = $scope.ActiveConversations[from];
            $scope.ActiveConversations.splice(from, 1);
            $timeout(function () {
                return $scope.ActiveConversations.splice(to, 0, old);
            });
        };
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
if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str) {
        return this.slice(0, str.length) === str;
    };
}

if (typeof String.prototype.startsWithIgnoreCase != 'function') {
    String.prototype.startsWithIgnoreCase = function (str) {
        return this.slice(0, str.length).toUpperCase() === str.toUpperCase();
    };
}

if (typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function (str) {
        return this.slice(-str.length) === str;
    };
}

if (typeof String.prototype.endsWithIgnoreCase != 'function') {
    String.prototype.endsWithIgnoreCase = function (str) {
        return this.slice(-str.length).toUpperCase() === str.toUpperCase();
    };
}

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

            ['blur', 'keyup', 'change'].forEach(function (x) {
                element[0].addEventListener(x, function () {
                    return scope.$apply(read);
                });
            });
            read();

            function read() {
                ngModel.$setViewValue(element[0].innerText);
            }
        }
    };
}).directive('draggable', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var draggingElem;
            if (element[0].draggable && scope.MoveItem) {
                element[0].addEventListener('dragstart', function (ev) {
                    ev.dataTransfer.effectAllowed = 'move';
                    ev.dataTransfer.setData('text/x-index', scope.$index.toString());
                    this.classList.add("dragging");
                    this.parentElement.classList.add("dragging");
                    draggingElem = this;
                });
                element[0].addEventListener('dragover', function (ev) {
                    ev.preventDefault();
                    ev.dataTransfer.dropEffect = 'move';

                    return false;
                });
                element[0].addEventListener('dragenter', function (ev) {
                    if (this.tagName === 'LI')
                        this.classList.add('dragover');
                    console.log('dragenter');
                });
                element[0].addEventListener('dragleave', function (ev) {
                    if (this.tagName === 'LI')
                        this.classList.remove('dragover');
                    console.log('dragleave');
                });
                element[0].addEventListener('dragend', function () {
                    draggingElem.classList.remove('dragging');
                    draggingElem.parentElement.classList.remove('dragging');
                    draggingElem = undefined;
                });
                element[0].addEventListener('drop', function (ev) {
                    var oldIndex = parseInt(ev.dataTransfer.getData('text/x-index'));
                    var newIndex;
                    var elem = ev.target;
                    for (; elem.tagName !== "LI"; elem = elem.parentElement)
                        ;
                    elem.classList.remove('dragover');
                    for (newIndex = 0; elem = elem.previousElementSibling; ++newIndex)
                        ;
                    scope.MoveItem(oldIndex, newIndex);
                    ev.preventDefault();
                });
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
            $elem[0].querySelector("img").addEventListener('load', function (event) {
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
}).run(function ($rootScope, $state) {
    $rootScope.RelayUrl = "https://stage.biba.com";

    var session = JSON.parse(window.sessionStorage.getItem("Session"));
    if (session && session.id) {
        $rootScope.Session = new Models.Profile(session);
    } else {
        $state.go("Account");
        return;
    }
}).controller('AppController', function ($rootScope, $scope, $state) {
    $scope['Logout'] = function () {
        window.sessionStorage.removeItem("Session");
        $rootScope.Session = null;
        $state.go("Account");
    };
});

function getRootScope() {
    return angular.element(':root').scope();
}
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
                return getRootScope().RelayUrl + this.model.url;
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
            set: function (value) {
                this.model.updated_at = value.toISOString();
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

        Object.defineProperty(Profile.prototype, "EmailDomain", {
            get: function () {
                if (this._emailDomain === undefined) {
                    this._emailDomain = this.Email.split('@')[1];
                }
                return this._emailDomain;
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
                var session = getRootScope().Session;
                return session && this.Id === session.Id;
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
