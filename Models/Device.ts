 module Models {

    export interface IRawDevice extends IRawBibaModel {
        enabled: boolean;
        device_token: string;
        connections: number;
        juggernaut_host: string;
        juggernaut_port: number;
        juggernaut_secure: boolean;
    }

 }