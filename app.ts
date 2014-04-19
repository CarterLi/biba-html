﻿/////////////////////////////////////////////////////////////////////////////
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
            $scope.$watch($attrs['ngBind'], ()=> $elem.html($elem.html()['autoLink']({ target: "_blank" })));
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
                element.on('blur keyup change', ()=> {
                    scope.$apply(read);
                });
                read(); // initialize

                // Write data to the model
                function read() {
                    ngModel.$setViewValue(element[0].innerText);
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
                $elem.find("img").load(event=> {
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
                Profile: "=profile"
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
        });
    })
    .controller('AppController', ($scope: ng.IScope, $state: ng.ui.IStateService)=> {
        $scope['Logout'] = () => {
            window.sessionStorage.removeItem("Session");
            Managers.UserManager.Session = null;
            $state.go("Account");
        };
});