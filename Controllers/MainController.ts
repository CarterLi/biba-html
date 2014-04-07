﻿/// <reference path="../External/angularjs/angular.d.ts" />
/// <reference path="../External/angularjs/angular-route.d.ts" />

module Controllers {

    export interface IMainScope extends ng.IScope {
        Conversations: Array<Models.TextConversation>;
    }

    export function MainController($scope: IMainScope, $state: ng.ui.IStateService, $http: ng.IHttpService) {
        if (!Managers.UserManager.Session) {
            $state.go("Login");
            return;
        }

        $http.get(Managers.Constants.RelayUrl + "/text_conversations").success(
            (data: Array<Models.IJsTextConversation>)=> {
                $scope.Conversations = data
                    .map(x=> new Models.TextConversation(x))
                    .filter(x=> !x.IsGroupChat);
            });
    }
}