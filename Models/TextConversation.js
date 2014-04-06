var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Models;
(function (Models) {
    var TextConversation = (function (_super) {
        __extends(TextConversation, _super);
        function TextConversation(model) {
            if (typeof model === "undefined") { model = null; }
            _super.call(this, model);
        }
        TextConversation.prototype.GetRawModel = function () {
            return _super.prototype.GetRawModel.call(this);
        };

        Object.defineProperty(TextConversation.prototype, "Model", {
            get: function () {
                return this.GetRawModel();
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TextConversation.prototype, "IsGroupChat", {
            get: function () {
                return this.Model.profiles.length > 2;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TextConversation.prototype, "Profiles", {
            get: function () {
                return this._profiles = this._profiles || this.Model.profiles.map(function (x) {
                    return new Models.Profile(x);
                });
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TextConversation.prototype, "Receivers", {
            get: function () {
                var _this = this;
                if (this._receivers == undefined) {
                    this._receivers = new Set();
                    this.Profiles.filter(function (x) {
                        return !x.IsCurrentUser;
                    }).forEach(function (x) {
                        return _this._receivers.add(x);
                    });
                }

                return this._receivers;
            },
            enumerable: true,
            configurable: true
        });
        return TextConversation;
    })(Models.BibaModel);
    Models.TextConversation = TextConversation;
})(Models || (Models = {}));
//# sourceMappingURL=TextConversation.js.map
