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
perform the following types of actions.

**_"UserStatus" is experimental feature and will be formally release after getting Skynet community feedback. Implementation may change based on Skynet community feedback_**
Two new features. 
(1) (near) RealTime UserStatus 
(2) Privacy Preferences

RealTime UserStatus on Skynet:

(1) UserStatus consist of two fields "status" and "lastSeen". Status can be Online,Do not disturb, Invisible..etc (full list). LastSeen value contains unix timestamp. calling system is responsbile for converting timestamp to localtime/time format.

(2) Also, Skynet is unique related to userStatus. We have two types of UserStatus. "Global" and "Skapp" specific. "Global" level only "LastSeen" value gets updated every two minutes. As of today there is no global status(this depends on community feedback post alpha release). "Skapp" level, User can set status from list of possible values (link,this will be expanded to support custom messages in future). Skapp specific status are most useful when user wants to be "online" on riftApp.hns but may prefer to stay "invisible" on skymessage.hns

// Data Path
PREFERENCES_INDEX_PATH: `profile-dac.hns/preferencesIndex.json`
PREFERENCES_PATH: `profile-dac.hns/${skapp}/preferences.json`
PROFILE_INDEX_PATH: `profile-dac.hns/profileIndex.json`
PROFILE_PATH: `profile-dac.hns/${skapp}/userprofile.json`
USER_STATUS_INDEX_PATH: `profile-dac.hns/userstatus`
USER_STATUS_PATH: `profile-dac.hns/${skapp}/userstatus`

${skapp} will be replaced with skapp domain name.

if skapp is skyprofile.hns, path will look like below
PREFERENCES_INDEX_PATH: `profile-dac.hns/preferencesIndex.json`
PREFERENCES_PATH: `profile-dac.hns/skyprofile.hns/preferences.json`
PROFILE_INDEX_PATH: `profile-dac.hns/profileIndex.json`
PROFILE_PATH: `profile-dac.hns/skyprofile.hns/userprofile.json`
USER_STATUS_INDEX_PATH: `profile-dac.hns/userstatus`
USER_STATUS_PATH: `profile-dac.hns/skyprofile.hns/userstatus`

on a seperate note, If you want to explore these paths and check your data at these paths, I strongly recommend to use https://riftapp.hns.siasky.net ("data" tab on UI)

```typescript


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
// Sample JSON
{
  version: 1,
  username: "Terminator",
  emailID: "terminator@skynetlabs.mysky",
  firstName: "My",
  lastName: "Sky",
  contact: "007",
  aboutMe: "New decentralized Internet",
  location: "Above Cloud",
  topics: ['Skynet', 'MySky','Web3'],
  connections: [
   {
    "twitter": "https://twitter.com/skynetlabs"
   },
   {
    "github": "https://github.com/skynetlabs"
   },
  ],
  avatar: [
    {
      "ext": "jpeg",
      "w": 300,
      "h": 300,
      "url": "sia://RABycdgWznT8YeIk57CDE9w0CiwWeHi7JoYOyTwq_UaSXQ/23/300"
    }
  ]
}

interface IProfileOptions{
  ipd?:string,
  skapp?:string
}
interface IUserPreferences {
  version: number,
  darkmode?: boolean,
  portal?: string,
  userStatus?: IUserStatusPreferences | null
}
interface IUserStatusPreferences {
  statusPrivacy: PrivacyType;
  lastSeenPrivacy: LastSeenPrivacyType;
  updatefrequency: number; // 0,1,5,10,15
  //more to be added in upcoming versions
}
interface IUserStatusOptions {
  skapp?: string,
  onUserStatusChange?: (latestUserStatus : IUserStatus) => void;
}
interface IPreferencesOptions{
  skapp?:string
}
interface ICreateDACResponse {
  submitted: boolean;
  error?: string;
}

// Types
const StatusType = {
  ONLINE: 'Online',
  IDLE: 'Idle',
  DO_NOT_DISTURB: 'Do Not Disturb',
  INVISIBLE: 'Invisible',
  NONE: 'None'
} as const;

const PrivacyType = {
  PRIVATE: 'Private',
  PUBLIC: 'Public'
} as const;

const LastSeenPrivacyType = {
  PRIVATE: 'Private',
  PUBLIC_TS: 'Public with Timestamp',
  PUBLIC_NO_TS: 'Public without Timestamp',
} as const;

const UserPresenceType = {
  RECENTLY: 'Recently',
  YESTERDAY: 'Yesterday',
  WITHIN_A_WEEK: 'Within a week',
  WITHIN_A_MONTH: 'Within a month',
  LONG_TIME_AGO: 'Long time ago'
} as const;
```

## Usage

Using the library is very straightforward. In this section we'll show an example
of how a skapp could use the userprofile library.

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
  const userID = await mySky.userID();

  // load DACs
  await mySky.loadDacs(userProfileRecord);

  let userProfile = await mySky.getProfile(userID);
  let userPreference = await mySky.getPreference(userID);

  // ####### (near) RealTime UserStatus #######
  // UserStatus consist of two fields "status" and "lastSeen"
  // We have two type of UserStatus. "Global" and "Skapp" specific.
  
  // "Global" 
  
  // Method 1: get userstatus via callback every 2 minutes
  // Only "LastSeen" value will change.
  const onGlobalUserStatusChange = async (latestStatus) => {
    console.log(`>>> callback : ${JSONstringify(latestStatus)}`);
    // sample latestStatus : {"status":"None","lastSeen":"1637108915830"}
    // parse display "latestStatus" in your skapp.
  };
  profileDAC.getUserStatus(userID, {onUserStatusChange: onGlobalUserStatusChange,
  });
  // Method 2: get one time status without callback
  const globalUserStatus = await profileDAC.getUserStatus(userID,);
  
  //  "Skapp" specific
  // Method 1 : get specific userstatus via callback every 2 minutes
  const skapp = "riftapp.hns";
  const onSkappUserStatusChange = async (latestStatus) => {
    console.log(`>>> callback : ${JSONstringify(latestStatus)}`);
    // sample latestStatus : {"status":"Online","lastSeen":"1637108914997"}
    // parse display "latestStatus" in your skapp.
  };
  profileDAC.getUserStatus(userID, {skapp: skapp,onUserStatusChange: onSkappUserStatusChange});
  // Method 2: get one time status without callback
  const globalUserStatus = await profileDAC.getUserStatus(userID,);

  // Preferences
  const globalPref = await profileDAC.getPreferences(userID)
  const skappPref = await profileDAC.getPreferences(userID, { skapp: "riftapp.hns"})
  const preferencesJSON = {
      darkmode: true,
      portal: "https://siasky.net/",
      userStatus:
               { 
                  statusPrivacy:"Public",
                  lastSeenPrivacy:"Public with Timestamp"
               }
      };
  const globalPref = await profileDAC.setGlobalPreferences(preferencesJSON)
  // Set preferences for loggedIn Skapp domain
  const skappPref = await profileDAC.setPreferences(preferencesJSON)
```
