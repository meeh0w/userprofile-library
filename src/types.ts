export const VERSION = 1;
export interface IUserProfileDAC {
  // DAC methods
  setUserStatus(status: string): Promise<IDACResponse>;
  setProfile(profile: IUserProfile): Promise<IDACResponse>;
  updateProfile(profile: Partial<IUserProfile>): Promise<IDACResponse>;
  setPreferences(prefs: IUserPreferences): Promise<IDACResponse>;
  getSkappPreferences():Promise<any>;
  setGlobalPreferences(prefs: IUserPreferences): Promise<IDACResponse>;
  getGlobalPreferences():Promise<any>;

  // Library Methods
  getUserStatus(userID: string, options?: IUserStatusOptions): Promise<IUserStatus>;
  getProfile(userID: string, options: IProfileOptions): Promise<any>;
  getProfileHistory(userID: string): Promise<any>;
  getPreferences(userID: string, options: IPreferencesOptions): Promise<any>;
  getPreferencesHistory(userID: string): Promise<any>
}


export const StatusType = {
  ONLINE: 'Online',
  IDLE: 'Idle',
  DO_NOT_DISTURB: 'Do Not Disturb',
  INVISIBLE: 'Invisible',
  NONE: 'None'
} as const;
export type StatusType = typeof StatusType[keyof typeof StatusType];

export const PrivacyType = {
  PRIVATE: 'Private',
  PUBLIC: 'Public'
} as const;
export type PrivacyType = typeof PrivacyType[keyof typeof PrivacyType];

export const LastSeenPrivacyType = {
  PRIVATE: 'Private',
  PUBLIC_TS: 'Public with Timestamp',
  PUBLIC_NO_TS: 'Public without Timestamp',
} as const;
export type LastSeenPrivacyType = typeof LastSeenPrivacyType[keyof typeof LastSeenPrivacyType];

export const UserPresenceType = {
  RECENTLY: 'Recently',
  YESTERDAY: 'Yesterday',
  WITHIN_A_WEEK: 'Within a week',
  WITHIN_A_MONTH: 'Within a month',
  LONG_TIME_AGO: 'Long time ago'
} as const;
export type UserPresenceType = typeof UserPresenceType[keyof typeof UserPresenceType];

export const DEFAULT_USER_STATUS = {
  status: StatusType.NONE, // 6 bits
  lastSeen: 0 // 32 bits
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
  portal: "https://siasky.net/",
  userStatus: {
    statusPrivacy: PrivacyType.PRIVATE,
    lastSeenPrivacy: PrivacyType.PRIVATE,
    updatefrequency: 0
  }
}

export interface IUserStatus {
  status: StatusType; // 6 bits
  lastSeen: number; // 32 bits
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
export interface IUserStatusOptions {
  skapp?: string,
  getRealtimeUpdate?: (latestUserStatus : IUserStatus) => void;  
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
  portal?: string,
  userStatus?: IUserStatusPreferences | null
}
export interface IUserStatusPreferences {
  statusPrivacy: PrivacyType;
  lastSeenPrivacy: LastSeenPrivacyType;
  updatefrequency: number; // 0,1,5,10,15
  //more to be added in upcoming versions 
}
export interface IPreferencesOptions {
  skapp?: string
}
export interface IDACResponse {
  submitted: boolean;
  error?: string;
}

