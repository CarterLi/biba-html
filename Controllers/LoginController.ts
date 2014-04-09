/// <reference path="../External/angularjs/angular.d.ts" />
/// <reference path="../External/socket.io/socket.io-client.d.ts" />

module Controllers {
    export interface ILoginScope extends ng.IScope {
        Submit(): void;
        UserName: string;
        Password: string;
    }

    export function LoginController($scope: ILoginScope, $state: ng.ui.IStateService, $http: ng.IHttpService) {
        $scope.Submit = () => {
            $http({
                method: 'POST',
                url: Managers.Constants.RelayUrl + "/sessions",
                headers: { Authorization: "Basic " + btoa($scope.UserName + ":" + $scope.Password) }
            }).success((session: Models.IJsProfile) => {
                window.sessionStorage.setItem("Session", JSON.stringify(session));
                Managers.UserManager.Session = new Models.Profile(session);
                $state.go("Main");

                //io.connect("https://push-stage.biba.com/socket.io/1/websocket/1")
                //    .on('connect', ()=> {
                //        console.log('Connected!');
                //    })
                //    .on('error', (reason: any)=> {
                //        console.error('Unable to connect Socket.IO', reason);
                //    })
                //    .on('message', (msg: any) => {
                //        console.log(msg);
                //    });
            });
        };
    }
}