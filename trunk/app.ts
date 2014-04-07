/// <reference path="External/angularjs/angular.d.ts" />
/// <reference path="External/angular-ui/angular-ui-router.d.ts" />

/// <reference path="Controllers/MainController.ts" />
/// <reference path="Controllers/LoginController.ts" />

angular.module("BibaApp", ['ui.router'])
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