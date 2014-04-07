/// <reference path="../External/angularjs/angular.d.ts" />
/// <reference path="../External/angularjs/angular-route.d.ts" />

module Models {

    export interface IJsTextConversation extends IJsBibaModel {
        text_messages_attributes: Array<IJsTextMessage>;
        last_message: IJsTextMessage;
        profiles: Array<IJsProfile>;
        unread_counts: Object;
    }

    export class TextConversation extends BibaModel {

        constructor(model: IJsTextConversation = null) {
            super(model);
        }

        GetRawModel(): IJsTextConversation {
            return <IJsTextConversation>super.GetRawModel();
        }

        private get Model(): IJsTextConversation {
            return this.GetRawModel();
        }

        get IsGroupChat(): boolean {
            return this.Model.profiles.length > 2;
        }

        private _profiles: Array<Profile>;

        get Profiles(): Array<Profile> {
            return this._profiles = this._profiles || this.Model.profiles.map(x=> new Profile(x));
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