/// <reference path="../External/angularjs/angular.d.ts" />
/// <reference path="../External/socket.io/socket.io-client.d.ts" />

module Controllers {
    export interface IAccountScope extends ng.IScope {
        RelayUrl: string;

        OnSignIn(): void;
        OnCreateAccount(): void;

        SignIn: Models.IRawAccount;
        CreateAccount: Models.IRawAccount;

        SignInForm: ng.IFormController;
        CreateAccountForm: ng.IFormController;
    }

    export function AccountController($scope: IAccountScope, $state: ng.ui.IStateService, $http: ng.IHttpService) {
        $scope.RelayUrl = Managers.Constants.RelayUrl;

        var doSignIn = (account: Models.IRawAccount) => {
            $http({
                method: 'POST',
                url: Managers.Constants.RelayUrl + "/sessions",
                headers: { Authorization: "Basic " + btoa(account.email + ":" + account.password) }
            }).success((session: Models.IRawProfile) => {
                window.sessionStorage.setItem("Session", JSON.stringify(session));
                Managers.UserManager.Session = new Models.Profile(session);
                $state.go("Home");

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

        $scope.OnSignIn = () => {
            if ($scope.SignInForm.$valid) {
                doSignIn($scope.SignIn);
            }
        };

        $scope.OnCreateAccount = () => {
            if ($scope.CreateAccountForm.$valid && $scope.CreateAccount.terms_) {
                $scope.CreateAccount.terms = $scope.CreateAccount.terms_ ? '1' : '0';
                $http.post(Managers.Constants.RelayUrl + "/signups", { signup: $scope.CreateAccount }).success(()=> {
                    doSignIn($scope.CreateAccount);
                }).error(err=> {
                    
                });
            }
        };
    }
}