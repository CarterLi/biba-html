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
