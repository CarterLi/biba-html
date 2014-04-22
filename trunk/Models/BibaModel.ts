module Models {

    export interface IRawBibaModel {
        id: number;
        uuid: string;
        lock_version: number;
        created_at: string;
        updated_at: string;
    }

    export class BibaModel {

        constructor(private model: IRawBibaModel = null) {}

        Raw(): IRawBibaModel {
            return this.model;
        }

        get Id(): number {
            return this.model.id;
        }

        get LockVersion(): number {
            return this.model.lock_version;
        }

        get CreateAt(): Date {
            return new Date(this.model.created_at);
        }

        get UpdatedAt(): Date {
            return new Date(this.model.updated_at);
        }

        set UpdatedAt(value: Date) {
            this.model.updated_at = value.toISOString();
        }

        get IsNew(): boolean {
            return !this.Id;
        }

    }

}