/// <reference path="../External/angularjs/angular.d.ts" />
/// <reference path="../External/angular-ui/angular-ui-router.d.ts" />

module Controllers {
    export interface IConversationScope extends ng.IScope {
        Messages: Array<Models.TextMessage>;
        Conversation: Models.TextConversation;
        ChatInput: string;

        Send(): void;
    }

    export function ConversationController($scope: IConversationScope,
                                           $http: ng.IHttpService,
                                           $stateParams: ng.ui.IStateParamsService) {
        var convId = $stateParams['convId'];
        $http.get(Managers.Constants.RelayUrl + "/text_conversations/" + convId).success(
            (data: Models.IJsTextConversation)=> {
                $scope.Conversation = new Models.TextConversation(data);
            });
        $http.get(Managers.Constants.RelayUrl + "/text_conversations/" + convId + "/text_messages").success(
            (data: Array<Models.IJsTextMessage>) => {
                $scope.Messages = data.map(x=> new Models.TextMessage(x));
            });

        $scope.Send = () => {
            // Code used: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c=> {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            $http.post(Managers.Constants.RelayUrl + "/text_conversations/" + convId + "/text_messages", {
                text_message: {
                    client_uuid: uuid,
                    content: $scope.ChatInput
                }
            });
            $scope.ChatInput = "";
        };
    }
}