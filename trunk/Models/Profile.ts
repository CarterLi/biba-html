module Models {

    export interface IRawProfile extends IRawBibaModel {
        email: string;
        first_name: string;
        last_name: string;
        full_name: string;
        "registered?": boolean;
        presence_dot: number;
    }

    export class Profile extends BibaModel {

        constructor(model: IRawProfile) {
            super(model);
        }

        Raw(): IRawProfile {
            return <IRawProfile>super.Raw();
        }

        private get Model(): IRawProfile {
            return this.Raw();
        }

        get Email(): string {
            return this.Model.email;
        }

        private _emailDomain: string;

        get EmailDomain(): string {
            if (this._emailDomain === undefined) {
                this._emailDomain = this.Email.split('@')[1];
            }
            return this._emailDomain;
        }

        get FullName(): string {
            return this.Model.full_name;
        }

        get IsRegistered(): boolean {
            return this.Model["registered?"];
        }

        get Availability(): string {
            if (this.IsRegistered) {
                switch (this.Model.presence_dot) {
                case 0:
                    return "None";
                case 1:
                    return "Unknown";
                case 2:
                    return "Available";
                case 3:
                    return "MayBeAway";
                case 4:
                    return "Busy";
                case 5:
                    return "Phone";
                default:
                    return null;
                }
            } else {
                return "Unregistered";
            }
        }

        get IsCurrentUser(): boolean {
            var session = getRootScope().Session;
            return session && this.Id === session.Id;
        }

    }

}