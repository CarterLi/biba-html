declare module Managers {
    class UserManager {
        static Session: Models.Profile;
        static Login(user: string, pass: string, ok: () => void): void;
    }
}
