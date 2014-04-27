/// <reference path="../External/angularjs/angular.d.ts" />
/// <reference path="../External/angularjs/angular-route.d.ts" />

module Models {

    export interface IRawTextConversation extends IRawBibaModel {
        text_messages: Array<IRawTextMessage>;
        last_message: IRawTextMessage;
        profiles: Array<IRawProfile>;
        unread_counts: Object;
    }

    export class TextConversation extends BibaModel {

        constructor(model: IRawTextConversation = null) {
            super(model);
        }

        Raw(): IRawTextConversation {
            return <IRawTextConversation>super.Raw();
        }

        SetRaw(model: IRawTextConversation): void {
            super.SetRaw(model);
            this._profiles = undefined;
        }

        get IsGroupChat(): boolean {
            return this.Raw().profiles.length > 2;
        }

        private _profiles: Array<Profile>;

        get Profiles(): Array<Profile> {
            if (this._profiles === undefined) {
                this._profiles = this.Raw().profiles.map(x=> new Profile(x));
            }
            return this._profiles;
        }

        get Receiver(): Profile {
            for (var i = 0; i < this.Profiles.length; ++i) {
                if (!this.Profiles[i].IsCurrentUser)
                    return this.Profiles[i];
            }
            throw new Error("Server bug found!");
        }

    }

}