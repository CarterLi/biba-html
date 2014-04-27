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

        SetRaw(model: IRawTextMessage): void {
            super.SetRaw(model);
            this._profile = undefined;
            this._attachment = undefined;
        }

        private _profile: Profile;
        get Profile(): Profile {
            if (this._profile === undefined) {
                this._profile = new Profile(this.Raw().profile);
            }
            return this._profile;
        }

        get Content(): string {
            return this.Raw().content;
        }

        get IsOwnMessage(): boolean {
            return this.Profile.IsCurrentUser;
        }

        get State(): string {
            var state = this.Raw().state;
            return state ? this.Raw().state[0].toUpperCase() + this.Raw().state.substr(1) : "Sending";
        }

        private _attachment: Attachment;
        get Attachment(): Attachment {
            if (this._attachment === undefined) {
                this._attachment = this.Raw().attachment ? new Attachment(this.Raw().attachment) : null;
            }

            return this._attachment;
        }

    }

}