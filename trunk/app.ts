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

angular.module("BibaApp", ['ui.router', 'angularFileUpload'])
    .directive('emoji', () => ({
        restrict: 'E',
        template: '<span>{{html}}</span>',
        replace: true,
        link: ($scope: ng.IScope, $elem: JQuery, $attrs: ng.IAttributes) => {
            $attrs.$observe('text', (value: string) => {
                $elem.text(value);
                window['emojify'].run($elem[0]);
                (<any>$scope).html = $elem.html();
            });
        }
    }))
    .config(($httpProvider: ng.IHttpProvider, $stateProvider: ng.ui.IStateProvider, $urlRouterProvider: ng.ui.IUrlRouterProvider) => {
        window['emojify'].setConfig({ img_dir: "External/emoji.js/images/emoji" });

        $httpProvider.defaults.headers.common.Accept = "application/json";
        $urlRouterProvider.otherwise('/');
        $stateProvider.state('Account', {
            url: '/Account',
            controller: 'Controllers.AccountController',
            templateUrl: 'Views/Account.html'
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