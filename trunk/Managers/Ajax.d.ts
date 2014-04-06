declare module Managers {
    class Ajax {
        private static authorization;
        static GenerateAuthorization(user: string, pass: string): void;
        static SendRequest(url: string, method: string, ok: (responseText: string) => void, err: (status: number, responseText: string) => void): void;
        static Get(url: string, ok: (obj: Object) => void, err?: (status: number, responseText: string) => void): void;
        static Post(url: string, ok: (obj: Object) => void, err?: (status: number, responseText: string) => void): void;
    }
}
