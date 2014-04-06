module Models {

    export interface IJsTextMessage extends IJsBibaModel {
        text_conversation: IJsTextConversation;
        profile: IJsProfile;
        client_uuid: string;
        content: string;
        state: string;
    }

    export class TextMessage extends BibaModel {

        constructor(model: IJsTextMessage = null) {
            super(model);
        }

        GetRawModel(): IJsTextMessage {
            return <IJsTextMessage>super.GetRawModel();
        }

        private get Model(): IJsTextMessage {
            return this.GetRawModel();
        }

        private _profile: Profile;
        get Profile(): Profile {
            return this._profile = this._profile || new Profile(this.Model.profile);
        }

        get Content(): string {
            return this.Model.content;
        }

        get IsOwnMessage(): boolean {
            return this.Profile.IsCurrentUser;
        }

    }

}