export declare const VERSION = 1;
export interface IUserProfileDAC {
    setUserStatus(status: string): Promise<IDACResponse>;
    setProfile(profile: IUserProfile): Promise<IDACResponse>;
    updateProfile(profile: Partial<IUserProfile>): Promise<IDACResponse>;
    setPreferences(prefs: IUserPreferences): Promise<IDACResponse>;
    getSkappPreferences(): Promise<any>;
    setGlobalPreferences(prefs: IUserPreferences): Promise<IDACResponse>;
    getGlobalPreferences(): Promise<any>;
    getUserStatus(userID: string, options?: IUserStatusOptions): Promise<IUserStatus>;
    getProfile(userID: string, options: IProfileOptions): Promise<any>;
    getProfileHistory(userID: string): Promise<any>;
    getPreferences(userID: string, options: IPreferencesOptions): Promise<any>;
    getPreferencesHistory(userID: string): Promise<any>;
    getSkappsIndex(userID: string): Promise<any>;
}
export declare const StatusType: {
    readonly ONLINE: "Online";
    readonly IDLE: "Idle";
    readonly DO_NOT_DISTURB: "Do Not Disturb";
    readonly INVISIBLE: "Invisible";
    readonly NONE: "None";
};
export declare type StatusType = typeof StatusType[keyof typeof StatusType];
export declare const PrivacyType: {
    readonly PRIVATE: "Private";
    readonly PUBLIC: "Public";
};
export declare type PrivacyType = typeof PrivacyType[keyof typeof PrivacyType];
export declare const LastSeenPrivacyType: {
    readonly PRIVATE: "Private";
    readonly PUBLIC_TS: "Public with Timestamp";
    readonly PUBLIC_NO_TS: "Public without Timestamp";
};
export declare type LastSeenPrivacyType = typeof LastSeenPrivacyType[keyof typeof LastSeenPrivacyType];
export declare const UserPresenceType: {
    readonly RECENTLY: "Recently";
    readonly YESTERDAY: "Yesterday";
    readonly WITHIN_A_WEEK: "Within a week";
    readonly WITHIN_A_MONTH: "Within a month";
    readonly LONG_TIME_AGO: "Long time ago";
};
export declare type UserPresenceType = typeof UserPresenceType[keyof typeof UserPresenceType];
export declare const DEFAULT_USER_STATUS: {
    status: "None";
    lastSeen: number;
};
export declare const DEFAULT_USER_PROFILE: IUserProfile;
export declare const DEFAULT_PREFERENCES: IUserPreferences;
export interface IUserStatus {
    status: StatusType;
    lastSeen: number;
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
    ext: string;
    w: number;
    h: number;
    url: string;
}
export interface IHistoryLog {
    updatedBy: string;
    timestamp: Date;
}
export interface IProfileOptions {
    ipd?: string;
    skapp?: string;
}
export interface IUserStatusOptions {
    skapp?: string;
    onUserStatusChange?: (latestUserStatus: IUserStatus) => void;
}
export interface IPreferencesIndex {
    version: number;
    preferences: IUserPreferences;
    lastUpdatedBy: string;
    skapps: string[];
    historyLog: IHistoryLog[];
}
export interface IUserPreferences {
    version: number;
    darkmode?: boolean;
    portal?: string;
    userStatus?: IUserStatusPreferences | null;
}
export interface IUserStatusPreferences {
    statusPrivacy: PrivacyType;
    lastSeenPrivacy: LastSeenPrivacyType;
    updatefrequency: number;
}
export interface IPreferencesOptions {
    skapp?: string;
}
export interface IDACResponse {
    submitted: boolean;
    error?: string;
}
//# sourceMappingURL=types.d.ts.map