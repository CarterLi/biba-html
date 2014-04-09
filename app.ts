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

/// <reference path="Controllers/MainController.ts" />
/// <reference path="Controllers/LoginController.ts" />

angular.module("BibaApp", ['ui.router', 'angularFileUpload'])
    .config(($stateProvider: ng.ui.IStateProvider, $urlRouterProvider: ng.ui.IUrlRouterProvider) => {
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