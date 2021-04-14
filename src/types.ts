import { Profile } from "./skystandards";


export interface ICreateProfileDACResponse {
  submitted: boolean;
  error?: string;
}

export interface IUserProfileDAC {
 createProfile(data:Profile):Promise<ICreateProfileDACResponse>;
 getProfile(data:string):Promise<any>;
}
