/// <reference path="External/angularjs/angular.d.ts" />
/// <reference path="External/angular-ui/angular-ui-router.d.ts" />
/// <reference path="External/angularjs/angular-route.d.ts" />
declare module Controllers {
    interface IConversationScope extends ng.IScope {
        Messages: Models.TextMessage[];
        ConversationId: number;
    }
    function ConversationController($scope: IConversationScope, $http: ng.IHttpService, $stateParams: ng.ui.IStateParamsService): void;
}
declare module Controllers {
    interface ILoginScope extends ng.IScope {
        Login(): void;
        LoginWithAuthorization(authorization: string): void;
        UserName: string;
        Password: string;
    }
    function LoginController($scope: ILoginScope, $location: ng.ILocationService, $http: ng.IHttpService): void;
}
declare module Controllers {
    interface IMainScope extends ng.IScope {
        Conversations: Models.TextConversation[];
    }
    function MainController($scope: IMainScope, $location: ng.ILocationService, $http: ng.IHttpService): void;
}
declare module Managers {
    class Ajax {
        private static authorization;
        static GenerateAuthorization(user: string, pass: string): void;
        static SendRequest(url: string, method: string, ok: (responseText: string) => void, err: (status: number, responseText: string) => void): void;
        static Get(url: string, ok: (obj: Object) => void, err?: (status: number, responseText: string) => void): void;
        static Post(url: string, ok: (obj: Object) => void, err?: (status: number, responseText: string) => void): void;
    }
}
declare module Managers {
    var Constants: {
        "RelayUrl": string;
    };
}
declare module Managers {
    class UserManager {
        static Session: Models.Profile;
        static Login(user: string, pass: string, ok: () => void): void;
    }
}
declare module Models {
    interface IJsBibaModel {
        id: number;
        uuid: string;
        lock_version: number;
        created_at: string;
        updated_at: string;
    }
    class BibaModel {
        private model;
        constructor(model?: IJsBibaModel);
        public GetRawModel(): IJsBibaModel;
        public Id : number;
        public LockVersion : number;
        public CreateAt : Date;
        public UpdatedAt : Date;
        public IsNew : boolean;
    }
}
declare module Models {
    interface IJsProfile extends IJsBibaModel {
        email: string;
        full_name: string;
        "registered?": boolean;
        presence_dot: number;
    }
    class Profile extends BibaModel {
        constructor(model: IJsProfile);
        public GetRawModel(): IJsProfile;
        private Model;
        public Email : string;
        public FullName : string;
        public IsRegistered : boolean;
        public Availability : string;
        public IsCurrentUser : boolean;
    }
}
declare module Models {
    interface IJsTextConversation extends IJsBibaModel {
        text_messages_attributes: IJsTextMessage[];
        last_message: IJsTextMessage;
        profiles: IJsProfile[];
        unread_counts: Object;
    }
    class TextConversation extends BibaModel {
        constructor(model?: IJsTextConversation);
        public GetRawModel(): IJsTextConversation;
        private Model;
        public IsGroupChat : boolean;
        private _profiles;
        public Profiles : Profile[];
        public Receiver : Profile;
    }
}
declare module Models {
    interface IJsTextMessage extends IJsBibaModel {
        text_conversation: IJsTextConversation;
        profile: IJsProfile;
        client_uuid: string;
        content: string;
        state: string;
    }
    class TextMessage extends BibaModel {
        constructor(model?: IJsTextMessage);
        public GetRawModel(): IJsTextMessage;
        private Model;
        private _profile;
        public Profile : Profile;
        public Content : string;
        public IsOwnMessage : boolean;
    }
}
