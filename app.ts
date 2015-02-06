/////////////////////////////////////////////////////////////////////////////
//  Copyright (C) 2014 zhangsongcui3371@sina.com                           //
//                                                                         //
//  This file is part of Biba-html.                                        //
//                                                                         //
//  This program is free software; you can redistribute it and/or modify   //
//  it under the terms of the GNU General Public License as published by   //
//  the Free Software Foundation; either version 3 of the License, or      //
//  (at your option) any later version.                                    //
//                                                                         //
//  This program is distributed in the hope that it will be useful,        //
//  but WITHOUT ANY WARRANTY; without even the implied warranty of         //
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the          //
//  GNU General Public License for more details.                           //
//                                                                         //
//  You should have received a copy of the GNU General Public License      //
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.  //
/////////////////////////////////////////////////////////////////////////////

/// <reference path="External/angularjs/angular.d.ts" />
/// <reference path="External/angular-ui/angular-ui-router.d.ts" />

interface IBibaRootScope extends ng.IScope {
    Session: Models.Profile;
    RelayUrl: string;
}

angular.module("BibaApp", ['ui.router', 'ui.bootstrap', 'angularFileUpload'])
    .directive('emoji', ()=> ({
        priority: 10,
        restrict: 'A',
        link: ($scope: ng.IScope, $elem: JQuery, $attrs: ng.IAttributes)=> {
            $scope.$watch($attrs['ngBind'], ()=> window['emojify'].run($elem[0]));
        }
    }))
    .directive('autolink', ()=> ({
        priority: 5,
        restrict: 'A',
        link: ($scope: ng.IScope, $elem: JQuery, $attrs: ng.IAttributes)=> {
            $scope.$watch($attrs['ngBind'],() => $elem.html(window['Autolinker'].link($elem.html(), { newWindow: true })));
        }
    }))
    .directive('autofocus', ()=> {
        return {
            priority: 500,
            restrict: 'A', // only activate on element attribute
            link: ($scope: ng.IScope, $elem: JQuery, $attrs: ng.IAttributes)=> {
                $elem[0].focus();
            }
        };
    })
    .directive('autoscrollintoview', ()=> {
        return {
            priority: 500,
            restrict: 'A', // only activate on element attribute
            link: ($scope: ng.IScope, $elem: JQuery, $attrs: ng.IAttributes)=> {
                $scope.$watch($attrs['ngBind'], ()=> $elem[0].scrollIntoView(true));
            }
        };
    })
    .directive('contenteditable', ()=> {
        return {
            restrict: 'A', // only activate on element attribute
            require: '?ngModel', // get a hold of NgModelController
            link: (scope: ng.IScope, element: JQuery, attrs: ng.IAttributes, ngModel: ng.INgModelController)=> {
                if (!ngModel) return; // do nothing if no ng-model

                // Specify how UI should be updated
                ngModel.$render = ()=> {
                    element.html(ngModel.$viewValue || '');
                };

                // Listen for change events to enable binding
                ['blur', 'keyup', 'change'].forEach(x=> {
                    element[0].addEventListener(x, ()=> scope.$apply(read));
                });
                read(); // initialize

                // Write data to the model
                function read() {
                    ngModel.$setViewValue(element[0].innerText);
                }

            }
        };
    })
    .directive('draggable', ()=> {
        return {
            restrict: 'A',
            link: (scope: any, element: JQuery, attrs: ng.IAttributes) => {
                var draggingElem: HTMLLIElement;
                if (element[0].draggable && scope.MoveItem) {
                    element[0].addEventListener('dragstart', function (ev) {
                        ev.dataTransfer.effectAllowed = 'move';
                        ev.dataTransfer.setData('text/x-index', (<number>scope.$index).toString());
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
                    element[0].addEventListener('drop', ev=> {
                        var oldIndex = parseInt(ev.dataTransfer.getData('text/x-index'));
                        var newIndex;
                        var elem = <HTMLElement>ev.target;
                        for (; elem.tagName !== "LI"; elem = elem.parentElement);
                        elem.classList.remove('dragover');
                        for (newIndex = 0; elem = <HTMLElement>elem.previousElementSibling; ++newIndex);
                        scope.MoveItem(oldIndex, newIndex);
                        ev.preventDefault();
                    });
                }
            }
        };
    })
    .directive('imagePreviewer', ()=> {
        return {
            restrict: 'E',
            templateUrl: 'Views/ImagePreviewer.html',
            scope: { Attachment: "=attachment" },
            controller: Controllers.ImagePreviewerController,
            link: ($scope: Controllers.IImagePreviewerScope, $elem: JQuery, $attrs: ng.IAttributes)=> {
                $elem[0].querySelector("img").addEventListener('load', event=> {
                    if ($scope.Attachment) {
                        // User might have closed the previewer
                        $scope.$apply('IsLoaded = true');
                    }
                });
            }
        };
    })
    .directive('userAvatar', ()=> {
        return {
            restrict: 'E',
            templateUrl: 'Views/UserAvatar.html',
            scope: {
                Profile: "=profile",
                HideEmail: "=hideEmail"
            },
        };
    })
    .config(($httpProvider: ng.IHttpProvider, $stateProvider: ng.ui.IStateProvider, $urlRouterProvider: ng.ui.IUrlRouterProvider) => {
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
        }).state('Home.NewTextConversation', {
            url: 'NewTextConversation/:userId',
            views: {
                subView: {
                    controller: Controllers.ConversationController,
                    templateUrl: 'Views/Conversation.html'
                }
            }
        });
    })
    .run(($rootScope: IBibaRootScope) => {
        $rootScope.RelayUrl = "https://stage.biba.com";
    })
    .controller('AppController', ($rootScope: IBibaRootScope, $scope: ng.IScope, $state: ng.ui.IStateService)=> {
        $scope['Logout'] = () => {
            window.sessionStorage.removeItem("Session");
            window.localStorage.removeItem("LoginInfo");
            $rootScope.Session = null;
            $state.go("Account");
        };
    });

// Use RootScopeService if possible
function getRootScope(): IBibaRootScope {
    return <IBibaRootScope>angular.element(':root').scope();
}