export interface Avatar {
  ext: string,
  w: number,
  h: number,
  url: string
}


export interface Profile {
  username: string,
  aboutMe?: string,
  location?: string,
  topics?: string[],
  avatar?: Avatar[]
}

export interface Preference {
  darkmode?: boolean,
  portal?: string
}

export interface ICreateDACResponse {
  submitted: boolean;
  error?: string;
}

export interface IUserProfileDAC {
 setProfile(data:Profile):Promise<ICreateDACResponse>;
 getProfile(data:string):Promise<any>;
 getProfileHistory(data:string):Promise<any>;
}
