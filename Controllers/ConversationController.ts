/// <reference path="../External/angularjs/angular.d.ts" />
/// <reference path="../External/angular-ui/angular-ui-router.d.ts" />

module Controllers {
    export interface IConversationScope extends ng.IScope {
        Messages: Array<Models.TextMessage>;
        ConversationId: number;
    }

    export function ConversationController($scope: IConversationScope,
                                           $http: ng.IHttpService,
                                           $stateParams: ng.ui.IStateParamsService) {
        $scope.ConversationId = $stateParams['convId'];
        
        $http.get(Managers.Constants.RelayUrl + "/text_conversations/" + $scope.ConversationId + "/text_messages").success(
            (data: Array<Models.IJsTextMessage>) => {
                $scope.Messages = data.map(x=> new Models.TextMessage(x));
            });
    }
}