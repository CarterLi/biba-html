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

    export function AccountController($rootScope: IBibaRootScope,
        $scope: IAccountScope,
        $state: ng.ui.IStateService,
        $http: ng.IHttpService) {

        var doSignIn = (authorization: string) => {
            var signInField = <HTMLFieldSetElement>$("form[name=SignInForm]").parent()[0];
            signInField.style.cursor = "wait";
            signInField.disabled = true;
            $http({
                method: 'POST',
                url: $rootScope.RelayUrl + "/sessions",
                headers: { Authorization: "Basic " + authorization }
            }).success((session: Models.IRawProfile) => {
                signInField.style.cursor = "";
                signInField.disabled = false;
                window.sessionStorage.setItem("Session", JSON.stringify(session));
                window.localStorage.setItem("LoginInfo", authorization);
                $rootScope.Session = new Models.Profile(session);
                $state.go("Home");

                //$http.post($rootScope.RelayUrl + "/profiles/" + session.id + "/windows_devices", {
                //    windows_device: {
                //        enabled: true,
                //        device_token: "0000000000000000000000000000000000000000"
                //    }
                //}).success((device: Models.IRawDevice) => {
                //    var juggUrl = (device.juggernaut_secure ? "https" : "http") + "://" + device.juggernaut_host + ":" + device.juggernaut_port;
                //    io.connect(juggUrl)
                //        .on('connect', () => {
                //            console.log('Connected!');
                //        })
                //        .on('error', (reason: any) => {
                //            console.error('Unable to connect Socket.IO', reason);
                //        })
                //        .on('message', (msg: any) => {
                //            console.log(msg);
                //        });
                //    });
                //});
            }).error(err=> {
                signInField.style.cursor = "";
                signInField.disabled = false;
                if (err.error === "Forbidden") {
                    alert("Invalid email address or password");
                    $("#siPassword").val("");
                    $("#siEmail").focus().select();
                }
            });
        };

        $scope.OnSignIn = ()=> {
            if ($scope.SignInForm.$valid) {
                doSignIn(btoa($scope.SignIn.email + ":" + $scope.SignIn.password));
            }
        };

        $scope.OnCreateAccount = ()=> {
            if ($scope.CreateAccountForm.$valid && $scope.CreateAccount.terms_) {
                $scope.CreateAccount.terms = $scope.CreateAccount.terms_ ? '1' : '0';
                $http.post($rootScope.RelayUrl + "/signups", { signup: $scope.CreateAccount }).success(()=> {
                    doSignIn(btoa($scope.CreateAccount.email + ":" + $scope.CreateAccount.password));
                }).error(err=> {

                });
            }
        };

        (()=> {
            var authorization = window.localStorage.getItem("LoginInfo");
            if (authorization)
                doSignIn(authorization);
        })();
    }

}