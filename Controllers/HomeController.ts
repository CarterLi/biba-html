/// <reference path="../External/angularjs/angular.d.ts" />
/// <reference path="../External/angularjs/angular-route.d.ts" />

module Controllers {

    export interface IHomeScope extends ng.IScope {
        ActiveConversations: Array<Models.TextConversation>;
        Contacts: Array<Models.Profile>;
        ContactsFilterText: string;
        DoContactsFilterText: string;
        IsNewConversationOpen: boolean;

        ContactsFilterPredicate(contact: Models.Profile): boolean;
        IsNewConversationOpenChanged(): void;
        OpenConversation(contact: Models.Profile): void;
        CloseConversation(conv: Models.TextConversation): void;
    }

    export function HomeController($scope: IHomeScope, $state: ng.ui.IStateService, $http: ng.IHttpService, $timeout: ng.ITimeoutService) {
        var conversations: Array<Models.TextConversation>;

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
                conversations = data
                    .map(x=> new Models.TextConversation(x))
                    .filter(x=> !x.IsGroupChat);
                $scope.ActiveConversations = conversations.slice(0, 10);
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
            var conv = conversations.first(x=> x.Receiver.Id === contact.Id);
            if (conv) {
                conv.UpdatedAt = new Date();
                if ($scope.ActiveConversations.first(x=> x.Id === conv.Id) === undefined) {
                    $scope.ActiveConversations.push(conv);
                }
            } else {
                conv = new Models.TextConversation(<Models.IRawTextConversation>{
                    profiles: [Managers.UserManager.Session.Raw(), contact.Raw()],
                    updated_at: new Date().toISOString()
                });
                console.log(conv.Receiver);
                $scope.ActiveConversations.push(conv);
            }
            $state.go("Home.TextConversation", {
                convId: conv.Id
            });
            $scope.IsNewConversationOpen = false;
        };

        $scope.CloseConversation = conv=> {
            $scope.ActiveConversations.splice($scope.ActiveConversations.indexOf(conv), 1);
        };

        $scope.IsNewConversationOpenChanged = ()=> {
            if ($scope.IsNewConversationOpen) {
                $("#newMessage + .pop-over input[type=search]").focus();
            } else {
                $scope.ContactsFilterText = '';
            }
        };
    }
}