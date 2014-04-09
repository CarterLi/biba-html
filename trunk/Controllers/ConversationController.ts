/// <reference path="../External/angularjs/angular.d.ts" />
/// <reference path="../External/angular-ui/angular-ui-router.d.ts" />

module Controllers {
    export interface IConversationScope extends ng.IScope {
        Messages: Array<Models.TextMessage>;
        Conversation: Models.TextConversation;
        ChatInput: string;
        Attachment: File;

        convForm: ng.IFormController;

        FileSelected($files: Array<File>): void;
        KeyDown($event: JQueryKeyEventObject): void;
        KeyPress($event: JQueryKeyEventObject): void;
        Send(): void;
    }

    export function ConversationController($scope: IConversationScope,
                                           $http: ng.IHttpService,
                                           $upload: any,
                                           $stateParams: ng.ui.IStateParamsService) {
        var convId = $stateParams['convId'];
        $http.get(Managers.Constants.RelayUrl + "/text_conversations/" + convId).success(
            (data: Models.IRawTextConversation)=> {
                $scope.Conversation = new Models.TextConversation(data);
            });
        $http.get(Managers.Constants.RelayUrl + "/text_conversations/" + convId + "/text_messages").success(
            (data: Array<Models.IRawTextMessage>) => {
                $scope.Messages = data.map(x=> new Models.TextMessage(x));
            });

        $scope.FileSelected = $files=> {
            if ($files.length > 1) {
                alert("Only one file is allowed");
                return;
            }
            $scope.Attachment= $files[0];
        };

        $scope.KeyDown = $event=> {
            if ($event.keyCode == 27 /* ESC */) {
                $scope.Attachment = null;
                $event.preventDefault();
            }
        };

        $scope.KeyPress = $event=> {
            if ($event.keyCode == 13 /* ENTER */ && !$event.shiftKey) {
                if ($scope.convForm.$valid) {
                    $scope.Send();
                }
                $event.preventDefault();
            }
        };

        $scope.Send = () => {
            // Code used: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c=> {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });

            $upload.upload({
                url: Managers.Constants.RelayUrl + "/text_conversations/" + convId + "/text_messages",
                data: {
                    "text_message[client_uuid]": uuid,
                    "text_message[content]": $scope.ChatInput
                },
                fileFormDataName: "text_message[attachment]",
                file: $scope.Attachment
            }).progress((evt: ProgressEvent)=> {
                console.log('percent: ' + (100.0 * evt.loaded / evt.total));
            }).success((data: Models.IRawTextMessage)=> {
                // file is uploaded successfully
                $scope.Messages.push(new Models.TextMessage(data));
            });
            $scope.ChatInput = "";
            $scope.Attachment = null;
        };
    }
}