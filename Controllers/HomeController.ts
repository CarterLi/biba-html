/// <reference path="../External/angularjs/angular.d.ts" />
/// <reference path="../External/angularjs/angular-route.d.ts" />

module Controllers {

    export interface IHomeScope extends ng.IScope {
        Conversations: Array<Models.TextConversation>;
        Contacts: Array<Models.Profile>;
    }

    export function HomeController($scope: IHomeScope, $state: ng.ui.IStateService, $http: ng.IHttpService) {
        if (!Managers.UserManager.Session) {
            var session: Models.IRawProfile = JSON.parse(window.sessionStorage.getItem("Session"));
            if (session && session.id) {
                Managers.UserManager.Session = new Models.Profile(session);
            } else {
                $state.go("Account");
                return;
            }
        }

        $http.get(Managers.Constants.RelayUrl + "/text_conversations").success(
            (data: Array<Models.IRawTextConversation>)=> {
                $scope.Conversations = data
                    .map(x=> new Models.TextConversation(x))
                    .filter(x=> !x.IsGroupChat);
            });

        $http.get(Managers.Constants.RelayUrl + "/profiles/0/contacts").success(
            (data: Array<Models.IRawProfile>) => {
                $scope.Contacts = data
                    .map(x=> new Models.Profile(x));
            });
    }
}