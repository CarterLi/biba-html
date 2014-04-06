﻿module Models {

    export interface IJsProfile extends IJsBibaModel {
        email: string;
        full_name: string;
        "registered?": boolean;
        presence_dot: number;
    }

    export class Profile extends BibaModel {

        constructor(model: IJsProfile) {
            super(model);
        }

        GetRawModel(): IJsProfile {
            return <IJsProfile>super.GetRawModel();
        }

        private get Model(): IJsProfile {
            return this.GetRawModel();
        }

        get Email(): string {
            return this.Model.email;
        }

        get FullName(): string {
            return this.Model.full_name;
        }

        get IsRegistered(): boolean {
            return this.Model["registered?"];
        }

        get Availability(): string {
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
        }

        get IsCurrentUser(): boolean {
            return this.Id === Managers.UserManager.Session.Id;
        }

    }

}