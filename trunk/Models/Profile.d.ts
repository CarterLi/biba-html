declare module Models {
    interface IJsProfile extends IJsBibaModel {
    }
    class Profile extends BibaModel {
        constructor(model: IJsProfile);
        public GetRawModel(): IJsProfile;
        private Model;
        public IsCurrentUser : boolean;
    }
}
