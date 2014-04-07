/// <reference path="../External/angularjs/angular.d.ts" />

module Controllers {
    export interface ILoginScope extends ng.IScope {
        Login(): void;
        LoginWithAuthorization(authorization: string): void;
        UserName: string;
        Password: string;
    }

    export function LoginController($scope: ILoginScope, $location: ng.ILocationService, $http: ng.IHttpService) {
        $http.defaults.headers.common.Accept = "application/json";

        $scope.Login = () => {
            $scope.LoginWithAuthorization(btoa($scope.UserName + ":" + $scope.Password));
        };

        $scope.LoginWithAuthorization = authorization=> {
            $http.defaults.headers.common.Authorization = "Basic " + authorization;
            $http.post(Managers.Constants.RelayUrl + "/sessions", null)
                .success((session: Models.IJsProfile) => {
                    window.sessionStorage.setItem("LoginInfo", authorization);
                    Managers.UserManager.Session = new Models.Profile(session);
                    $location.path("/");
                });
        };
        (()=> {
            var authorization = window.sessionStorage.getItem("LoginInfo");
            if (authorization)
                $scope.LoginWithAuthorization(authorization);
        })();
    }
}