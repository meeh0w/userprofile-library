# User Profile Record Library

## Description

The user profile record library is a library for skapp developers, allowing them to
record the user profile data of their users within the skapp
that they are building. The main purpose of this tool is content discovery; if
all skapps were to make use of this library, the end result would be a scrapable
global record of all content and the popularity of that content and the skapp.

This information will eventually get displayed in a type of leaderboard that
ranks top pieces of content and top skapps.

## Interface

The library itself is a simple class that acts as a wrapper around the User Profile
Record DAC. This DAC, or Data Access Controller, is built and hosted by
Skynetlabs. The library will contain a hardcoded reference to its domain, thus
abstracting all of its complexities from the skapp developer.

The skapp developer is expected to call upon the User Profile record when its user
perform the following types of actions. This is when a user

***"UserStatus" is experimental feature and will be formally release after getting Skynet community feedback. Implementation may change based on Skynet community feedback***

```typescript
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
  portal?: string,
  userStatus?: IUserStatusPreferences | null
}
export interface IUserStatusPreferences {
  statusPrivacy: PrivacyType;
  lastSeenPrivacy: LastSeenPrivacyType;
  updatefrequency: number; // 0,1,5,10,15
  //more to be added in upcoming versions 
}
export interface IUserStatusOptions {
  skapp?: string,
  getRealtimeUpdate?: (latestUserStatus : IUserStatus) => void;  
}
export interface IPreferencesOptions{
  skapp?:string
}
export interface ICreateDACResponse {
  submitted: boolean;
  error?: string;
}

export interface IUserStatusOptions {
  skapp?: string,
  getRealtimeUpdate?: (latestUserStatus : IUserStatus) => void;  
}

// Types
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
```

## Usage

Using the library is very straightforward. In this section we'll show an example
of how a skapp could use the content record library and record user interactions.

```typescript
import { SkynetClient } from "skynet-js";
import { UserProfileDAC } from "@skynethub/userprofile-library";

(async () => {
  // create client
  const client = new SkynetClient();

  // create content record
  const userProfileRecord = new UserProfileDAC();

  // load mysky
  const mySky = await client.loadMySky("exampleskapp.hns");
  
  // get userID
  const userID = await mySky.userID()
  
  // load DACs
  await mySky.loadDacs(userProfileRecord);

  let userProfile =await mySky.getProfile(userID);
  let userPreference =await mySky.getPreference(userID);



 
})();
```
