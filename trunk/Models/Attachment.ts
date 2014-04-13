module Models {

    export interface IRawAttachment {
        content_type: string;
        filename: string;
        preview: string;
        size: number;
        url: string;
    }

    export class Attachment {

        constructor(private model: IRawAttachment) {}

        Raw(): IRawAttachment {
            return this.model;
        }

        get IsImage(): boolean {
            return this.model.content_type.substr(0, 6) == 'image/';
        }

        get Url(): string {
            return Managers.Constants.RelayUrl + this.model.url;
        }

        get Filesize(): string {
            return window['filesize'](this.Raw().size);
        }
    }

}