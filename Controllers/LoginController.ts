/// <reference path="../External/angularjs/angular.d.ts" />

module Controllers {
    export interface ILoginScope extends ng.IScope {
        Submit(): void;
        UserName: string;
        Password: string;
    }

    export function LoginController($scope: ILoginScope, $state: ng.ui.IStateService, $http: ng.IHttpService) {
        $http.defaults.headers.common.Accept = "application/json";

        var Login = (authorization: string) => {
            $http.defaults.headers.common.Authorization = "Basic " + authorization;
            $http.post(Managers.Constants.RelayUrl + "/sessions", null)
                .success((session: Models.IJsProfile) => {
                    window.sessionStorage.setItem("LoginInfo", authorization);
                    Managers.UserManager.Session = new Models.Profile(session);
                    $state.go("Main");
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