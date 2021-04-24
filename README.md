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

```typescript
export interface IUserProfileDAC {
  setProfile(data: IUserProfile): Promise<ICreateDACResponse>;
  setPreferences(data: IUserPreferences): Promise<ICreateDACResponse>;

  //getProfile(): Promise<any>;
  getProfile(userID:string,options:IProfileOptions): Promise<any>;
  getProfileHistory(userID: string): Promise<any>;
  getPreferences(userID:string,options:IPreferencesOptions): Promise<any>;
  getPreferencesHistory(userID: string): Promise<any>
}

export interface IUserProfile {
  version: number,
  username: string,
  aboutMe?: string,
  location?: string,
  topics?: string[],
  avatar?: IAvatar[]
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
```

## Usage

Using the library is very straightforward. In this section we'll show an example
of how a skapp could use the content record library and record user interactions.

```typescript
import { SkynetClient } from "skynet-js";
import { ContentRecordDAC } from "skynet-content-record-library";

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
