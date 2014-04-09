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

        GetRawModel(): IRawTextMessage {
            return <IRawTextMessage>super.GetRawModel();
        }

        private get Model(): IRawTextMessage {
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

        attachment: Attachment;
        get Attachment(): Attachment {
            if (this.attachment === undefined) {
                this.attachment = this.Model.attachment ? new Attachment(this.Model.attachment) : null;
            }

            return this.attachment;
        }

    }

}