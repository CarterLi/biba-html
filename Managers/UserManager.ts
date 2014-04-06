module Managers {

    export class UserManager {
        static Session: Models.Profile;

        static Login(user: string, pass: string, ok: ()=> void) {
            Ajax.GenerateAuthorization(user, pass);
            Ajax.Post("/sessions", session=> {
                console.log("Login successfully");
                this.Session = new Models.Profile(<Models.IJsProfile>session);
                ok();
            }, err=> {
                console.log("Error login..." + err);
            });
        }

    }

}