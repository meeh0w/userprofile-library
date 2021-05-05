export interface IUserProfile {
  version: number;
  username: string;
  firstName?: string;
  lastName?: string;
  emailID?: string;
  contact?: string;
  aboutMe?: string;
  location?: string;
  topics?: string[];
  avatar?: IAvatar[];
  connections?: any[];
}
export interface IAvatar {
  ext: string,
  w: number,
  h: number,
  url: string
}
export interface IProfileOptions{
  ipd?:string,
  skapp?:string
}
export interface IUserPreferences {
  version: number,
  darkmode?: boolean,
  portal?: string
}
export interface IPreferencesOptions{
  skapp?:string
}
export interface ICreateDACResponse {
  submitted: boolean;
  error?: string;
}
export interface IUserProfileDAC {
  setProfile(data: IUserProfile): Promise<ICreateDACResponse>;
  setPreferences(data: IUserPreferences): Promise<ICreateDACResponse>;

  //getProfile(): Promise<any>;
  getProfile(userID:string,options:IProfileOptions): Promise<any>;
  getProfileHistory(userID: string): Promise<any>;
  getPreferences(userID:string,options:IPreferencesOptions): Promise<any>;
  getPreferencesHistory(userID:string): Promise<any>
}
