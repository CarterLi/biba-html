module Managers {

    export class Ajax {
        private static authorization: string;

        static GenerateAuthorization(user: string, pass: string) {
            this.authorization = btoa(user + ":" + pass);
        }

        static SendRequest(url: string,
            method: string,
            ok: (responseText: string)=> void,
            err: (status: number, responseText: string)=> void) {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url, true);
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.setRequestHeader('Authorization', 'Basic ' + this.authorization);
            xhr.onreadystatechange = ()=> {
                if (xhr.readyState == 4) {
                    if (xhr.status >= 200 && xhr.status < 400) {
                        if (ok) {
                            ok(xhr.responseText);
                        }
                    } else {
                        if (err) {
                            err(xhr.status, xhr.responseText);
                        }
                    }
                }
            };
            xhr.send();
        }

        static Get(url: string,
            ok: (obj: Object)=> void,
            err?: (status: number, responseText: string)=> void) {
            this.SendRequest(Constants.RelayUrl + url, "GET",
                text=> ok(JSON.parse(text)), err);
        }

        static Post(url: string,
            ok: (obj: Object)=> void,
            err?: (status: number, responseText: string)=> void) {
            this.SendRequest(Constants.RelayUrl + url, "POST",
                text=> ok(JSON.parse(text)), err);
        }

    }

}