var Managers;
(function (Managers) {
    var UserManager = (function () {
        function UserManager() {
        }
        UserManager.Login = function (user, pass, ok) {
            var _this = this;
            Managers.Ajax.GenerateAuthorization(user, pass);
            Managers.Ajax.Post("/sessions", function (session) {
                console.log("Login successfully");
                _this.Session = session;
                ok();
            });
        };
        return UserManager;
    })();
    Managers.UserManager = UserManager;
})(Managers || (Managers = {}));
//# sourceMappingURL=UserManager.js.map
