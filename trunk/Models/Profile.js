var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Models;
(function (Models) {
    var Profile = (function (_super) {
        __extends(Profile, _super);
        function Profile(model) {
            _super.call(this, model);
        }
        Profile.prototype.GetRawModel = function () {
            return _super.prototype.GetRawModel.call(this);
        };

        Object.defineProperty(Profile.prototype, "Model", {
            get: function () {
                return this.GetRawModel();
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Profile.prototype, "IsCurrentUser", {
            get: function () {
                return this.Id === Managers.UserManager.Session.Id;
            },
            enumerable: true,
            configurable: true
        });
        return Profile;
    })(Models.BibaModel);
    Models.Profile = Profile;
})(Models || (Models = {}));
//# sourceMappingURL=Profile.js.map
