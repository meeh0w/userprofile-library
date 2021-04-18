import { Profile } from "./skystandards";


export interface ICreateDACResponse {
  submitted: boolean;
  error?: string;
}

export interface IUserProfileDAC {
 createProfile(data:Profile):Promise<ICreateDACResponse>;
 getProfile(data:string):Promise<any>;
 getProfileHistory(data:string):Promise<any>;
}
