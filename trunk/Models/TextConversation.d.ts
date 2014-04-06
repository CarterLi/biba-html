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
        private _receivers;
        public Receivers : Set<Profile>;
    }
}
