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
        CloseConversation(index: number): void;
        MoveItem(from: number, to: number): void;
    }

    export function HomeController($scope: IHomeScope,
        $rootScope: IBibaRootScope,
        $state: ng.ui.IStateService,
        $http: ng.IHttpService,
        $timeout: ng.ITimeoutService) {
        var conversations: Array<Models.TextConversation>;

        var session: Models.IRawProfile = JSON.parse(window.sessionStorage.getItem("Session"));
        if (session && session.id) {
            $rootScope.Session = new Models.Profile(session);
        } else {
            $state.go("Account");
            return;
        }

        $http.get($rootScope.RelayUrl + "/text_conversations").success(
        (data: Array<Models.IRawTextConversation>)=> {
            conversations = data
                .map(x=> new Models.TextConversation(x))
                .filter(x=> !x.IsGroupChat);
            $scope.ActiveConversations = conversations.slice(0, 10);
        });

        $http.get($rootScope.RelayUrl + "/profiles/0/contacts").success(
        (data: Array<Models.IRawProfile>)=> {
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
                filterTextTimeout = $timeout(()=> {
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
                    $scope.ActiveConversations.unshift(conv);
                }
                $state.go("Home.TextConversation", {
                    convId: conv.Id
                });
            } else {
                conv = new Models.TextConversation(<Models.IRawTextConversation>{
                    profiles: [$rootScope.Session.Raw(), contact.Raw()],
                    updated_at: new Date().toISOString()
                });
                $scope.ActiveConversations.unshift(conv);
                $state.go("Home.NewTextConversation", {
                    userId: contact.Id
                });
            }
            $scope.IsNewConversationOpen = false;
        };

        $scope.CloseConversation = index=> {
            var conv = $scope.ActiveConversations.splice(index, 1).first();
            if ($state.current.name === "Home.TextConversation" && $state.params['convId'] == conv.Id) {
                $state.go('Home');
            }
        };

        $scope.IsNewConversationOpenChanged = ()=> {
            if ($scope.IsNewConversationOpen) {
                $("#newMessage ~ .popover input[type=search]").focus();
            } else {
                $scope.ContactsFilterText = '';
            }
        };

        $scope.MoveItem = (from, to)=> {
            if (from === to)
                return;
            var old = $scope.ActiveConversations[from];
            $scope.ActiveConversations.splice(from, 1);
            $timeout(()=> $scope.ActiveConversations.splice(to, 0, old));
        };
    }

}