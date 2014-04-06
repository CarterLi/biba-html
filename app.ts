import Ajax = Managers.Ajax;

function main(): void {
    Ajax.Get("/text_conversations",
        obj=> {
            var main = <HTMLDivElement>document.querySelector("#main");
            var convList = <HTMLDivElement>main.querySelector("div.left");
            var convView = <HTMLDivElement>main.querySelector("div.right");
            (<Array<Models.IJsTextConversation>>obj)
                .map(x=> new Models.TextConversation(x))
                .filter(x=> !x.IsGroupChat)
                .forEach(x=> {
                    var divConv = document.createElement("div");
                    var divMsg = document.createElement("div");
                    divMsg.appendChild(document.createTextNode(x.GetRawModel().last_message.content));
                    divConv.appendChild(divMsg);
                    convView.appendChild(divConv);

                    var divProfile = document.createElement("div");
                    divProfile.appendChild(document.createTextNode(x.Receiver.FullName));
                    divProfile.addEventListener("click", e=> {
                        var oldSelected = <HTMLDivElement>convList.querySelector("div.selected");
                        if (oldSelected != null)
                            oldSelected.classList.remove("selected");
                        divProfile.classList.add("selected");
                        oldSelected = <HTMLDivElement>convView.querySelector("div.selected");
                        if (oldSelected != null)
                            oldSelected.classList.remove("selected");
                        divConv.classList.add("selected");

                        Ajax.Get("/text_conversations/" + x.Id + "/text_messages",
                            obj=> {
                                while (divConv.lastChild)
                                    divConv.removeChild(divConv.lastChild);
                                (<Array<Models.IJsTextMessage>>obj)
                                    .map(x=> new Models.TextMessage(x))
                                    .forEach(x=> {
                                        var divMsg = document.createElement("div");
                                        divMsg.appendChild(document.createTextNode(x.Content));
                                        divConv.appendChild(divMsg);
                                    });
                                (<HTMLDivElement>divConv.lastElementChild).scrollIntoView();
                            });
                    });
                    convList.appendChild(divProfile);
            });
        },
        (status, text) => console.log("Error loading conversations..." + text));
}

window.onload = () => {
    var loginForm = <HTMLFormElement>document.querySelector("#login");
    loginForm.querySelector("input[type=submit]").addEventListener("click", arg=> {
        if (!loginForm.checkValidity()) {
            return;
        }

        var username = (<HTMLInputElement>loginForm["username"]).value;
        var password = (<HTMLInputElement>loginForm["password"]).value;
        Managers.UserManager.Login(username, password, () => {
            (<HTMLBodyElement>document.querySelector("body")).classList.remove("login");
            main();
        });
    });
};