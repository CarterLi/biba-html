/// <reference path="../External/angularjs/angular.d.ts" />
/// <reference path="../External/socket.io/socket.io-client.d.ts" />

module Controllers {
    export interface ILoginScope extends ng.IScope {
        Submit(): void;
        UserName: string;
        Password: string;
    }

    export function LoginController($scope: ILoginScope, $state: ng.ui.IStateService, $http: ng.IHttpService) {
        $http.defaults.headers.common.Accept = "application/json";

        var Login = (authorization: string) => {
            $http({
                method: 'POST',
                url: Managers.Constants.RelayUrl + "/sessions",
                data: null,
                headers: { Authorization: "Basic " + authorization }
            }).success((session: Models.IJsProfile) => {
                window.sessionStorage.setItem("LoginInfo", authorization);
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

        $scope.Submit = () => {
            Login(btoa($scope.UserName + ":" + $scope.Password));
        };

        (()=> {
            var authorization = window.sessionStorage.getItem("LoginInfo");
            if (authorization)
                Login(authorization);
        })();
    }
}