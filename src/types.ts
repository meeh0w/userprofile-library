export const VERSION = 1;
export interface IUserProfileDAC {
  setProfile(profile: IUserProfile): Promise<IDACResponse>;
  updateProfile(profile: Partial<IUserProfile>): Promise<IDACResponse>;
  setPreferences(prefs: IUserPreferences): Promise<IDACResponse>;

  //getProfile(): Promise<any>;
  getProfile(userID: string, options: IProfileOptions): Promise<any>;
  getProfileHistory(userID: string): Promise<any>;
  getPreferences(userID: string, options: IPreferencesOptions): Promise<any>;
  getPreferencesHistory(userID: string): Promise<any>
}

// DEFAULT_USER_PROFILE defines all props as it is used in validator
export const DEFAULT_USER_PROFILE: IUserProfile = {
  version: VERSION,
  username: "anonymous",
  firstName: "",
  lastName: "",
  emailID: "",
  contact: "",
  aboutMe: "",
  location: "",
  topics: [],
  avatar: [],
  connections: []
}

export const DEFAULT_PREFERENCES: IUserPreferences = {
  version: VERSION,
  darkmode: false,
  portal: "https://siasky.net"
}
export interface IProfileIndex {
  version: number;
  profile: IUserProfile;
  lastUpdatedBy: string;
  historyLog: IHistoryLog[];
}
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
export interface IHistoryLog {
  updatedBy: string,
  timestamp: Date
}

export interface IProfileOptions {
  ipd?: string,
  skapp?: string
}

export interface IPreferencesIndex {
  version: number;
  preferences: IUserPreferences;
  lastUpdatedBy: string;
  historyLog: IHistoryLog[];
}
export interface IUserPreferences {
  version: number,
  darkmode?: boolean,
  portal?: string
}
export interface IPreferencesOptions {
  skapp?: string
}
export interface IDACResponse {
  submitted: boolean;
  error?: string;
}

