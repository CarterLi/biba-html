/// <reference path="../External/angularjs/angular.d.ts" />
/// <reference path="../External/angularjs/angular-route.d.ts" />

module Controllers {

    export interface IHomeScope extends ng.IScope {
        Conversations: Array<Models.TextConversation>;
        Contacts: Array<Models.Profile>;
        ContactsFilterText: string;
        DoContactsFilterText: string;
        IsNewConversationOpen: boolean;

        ContactsFilterPredicate(contact: Models.Profile): boolean;
        OpenConversation(contact: Models.Profile): void;
    }

    export function HomeController($scope: IHomeScope, $state: ng.ui.IStateService, $http: ng.IHttpService, $timeout: ng.ITimeoutService) {
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

        (()=> {
            var filterTextTimeout: ng.IPromise<any>;
            var tempFilterText: string;

            $scope.$watch('ContactsFilterText', val=> {
                if (filterTextTimeout)
                    $timeout.cancel(filterTextTimeout);

                tempFilterText = val;
                filterTextTimeout = $timeout(() => {
                    $scope.DoContactsFilterText = tempFilterText;
                }, 400); // delay 400 ms
            });
        })();

        $scope.ContactsFilterPredicate = contact=> {
            return !$scope.DoContactsFilterText
                || contact.FullName.startsWithIgnoreCase($scope.DoContactsFilterText)
                || (contact.Raw().last_name && contact.Raw().last_name.startsWithIgnoreCase($scope.DoContactsFilterText))
                || contact.Email.startsWithIgnoreCase($scope.DoContactsFilterText)
                || contact.EmailDomain.startsWithIgnoreCase($scope.DoContactsFilterText);
        };

        $scope.OpenConversation = contact=> {
            var conv = $scope.Conversations.first(x=> x.Receiver.Id === contact.Id);
            if (conv) {
                $state.go("Home.TextConversation", {
                    convId: conv.Id
                });
                $scope.IsNewConversationOpen = false;
                $scope.ContactsFilterText = '';
            }
        };
    }
}