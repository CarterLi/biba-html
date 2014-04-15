module Models {

    export interface IRawTextMessage extends IRawBibaModel {
        text_conversation: IRawTextConversation;
        profile: IRawProfile;
        client_uuid: string;
        content: string;
        state: string;

        attachment: IRawAttachment;
        attachment_only: boolean;
    }

    export class TextMessage extends BibaModel {

        constructor(model: IRawTextMessage = null) {
            super(model);
        }

        Raw(): IRawTextMessage {
            return <IRawTextMessage>super.Raw();
        }

        private get Model(): IRawTextMessage {
            return this.Raw();
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

        get State(): string {
            var state = this.Model.state;
            return state ? this.Model.state[0].toUpperCase() + this.Model.state.substr(1) : "Sending";
        }

        private _attachment: Attachment;
        get Attachment(): Attachment {
            if (this._attachment === undefined) {
                this._attachment = this.Model.attachment ? new Attachment(this.Model.attachment) : null;
            }

            return this._attachment;
        }

    }

}