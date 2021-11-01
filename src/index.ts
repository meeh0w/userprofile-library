import { stringToUint8ArrayUtf8, uint8ArrayToStringUtf8, DacLibrary, MySky, CustomConnectorOptions, SkynetClient } from "skynet-js";
import { PermCategory, Permission, PermType } from "skynet-mysky-utils";
import { Convert } from "./skystandards"
import {
  VERSION, DEFAULT_PREFERENCES, DEFAULT_USER_STATUS, DEFAULT_USER_PROFILE, IDACResponse, IUserProfileDAC, IProfileOptions, IUserProfile, IPreferencesOptions, IUserPreferences, IProfileIndex
} from "./types";
import { fromByteArray, toByteArray } from "base64-js";

const DAC_DOMAIN = "profile-dac.hns";
//const DAC_DOMAIN = "localhost";

const USER_STATUS_INDEX_PATH = `${DAC_DOMAIN}/userstatus`;
const PROFILE_INDEX_PATH = `${DAC_DOMAIN}/profileIndex.json`;
const PREFERENCES_INDEX_PATH = `${DAC_DOMAIN}/preferencesIndex.json`;
const DEBUG_ENABLED = "true";

// We'll define a portal to allow for developing on localhost.
// When hosted on a skynet portal, SkynetClient doesn't need any arguments.
const portal =
  window.location.hostname === 'localhost' ? 'https://siasky.net' : undefined;

// PREFERENCES_PATH: `${DAC_DOMAIN}/${skapp}/preferences.json`,
// PROFILE_PATH: `${DAC_DOMAIN}/${skapp}/userprofile.json`,
// PROFILE_INDEX_PATH: `${DAC_DOMAIN}/profileIndex.json`,
// PREFERENCES_INDEX_PATH: `${DAC_DOMAIN}/preferencesIndex.json`
export class UserProfileDAC extends DacLibrary implements IUserProfileDAC {
  private client: SkynetClient

  public constructor() {
    super(DAC_DOMAIN);
    this.client = new SkynetClient(portal);
  }

  // async init(client: SkynetClient, customOptions: CustomConnectorOptions): Promise<void> {
  //   this.client = client;
  //   return super.init(client, customOptions);
  // }

  // ************************************************************************/
  // **** DAC Methods: All Set Methods must be called and executed in DAC ***/
  // ************************************************************************/
  public async setUserStatus(status: string): Promise<IDACResponse> {
    if (!this.connector) {
      throw new Error("Connector not initialized");
    }
    return await this.connector.connection
      .remoteHandle()
      .call("setUserStatus", status);
  }

  public async setProfile(data: IUserProfile): Promise<IDACResponse> {
    if (!this.connector) {
      throw new Error("Connector not initialized");
    }
    if (typeof data === 'string') {
      data = Convert.toProfile(data);
    }
    return await this.connector.connection
      .remoteHandle()
      .call("setProfile", data);
  }

  public async updateProfile(data: IUserProfile): Promise<IDACResponse> {
    if (!this.connector) {
      throw new Error("Connector not initialized");
    }
    if (typeof data === 'string') {
      data = Convert.toProfile(data);
    }
    return await this.connector.connection
      .remoteHandle()
      .call("updateProfile", data);
  }

  public async setPreferences(data: IUserPreferences): Promise<IDACResponse> {
    if (!this.connector) {
      throw new Error("Connector not initialized");
    }
    if (typeof data === 'string') {
      data = Convert.toPreferences(data);
    }
    return await this.connector.connection
      .remoteHandle()
      .call("setPreferences", data);
  }

  // ********************************************************************/
  // **** Library Methods: Get Methods must be implemented in Library ***/
  // ********************************************************************/

  /**
   * This method is used to retrive last saved users profile information globaly. accross all skapps using this dac
   * @param userID need to pass a dummy data for remotemethod call sample {test:"test"}
   * @param options need to pass {ipd:"SkyId"} for skyId profiles
   * @returns Promise<any> the last saved users profile data
   */
  public async getUserStatus(userID: string, options?: IProfileOptions): Promise<any> {
    if (typeof this.client === "undefined") {
      throw Error('userprofile-library: SkynetClient not initialized')
    }
    try {
      let status: string | null = null;
      // Skapp Specific Update
      if (options && options.skapp) {
        const USER_STATUS_PATH = `${DAC_DOMAIN}/${options.skapp}/userstatus`;
        status = await this.getEntryData(userID, USER_STATUS_PATH);
      }
      else {//latest status
        status = await this.getEntryData(userID, USER_STATUS_INDEX_PATH);
      }
      return status ? {status} : {status : DEFAULT_USER_STATUS};
    } catch (error) {
      this.log('Error occurred trying to get user status, err: ', error);
      return { error: error }
    }
  }

  /**
   * This method is used to retrive last saved users profile information globaly. accross all skapps using this dac
   * @param userID need to pass a dummy data for remotemethod call sample {test:"test"}
   * @param options need to pass {ipd:"SkyId"} for skyId profiles
   * @returns Promise<any> the last saved users profile data
   */
  public async getProfile(userID: string, options?: IProfileOptions): Promise<any> {
    if (typeof this.client === "undefined") {
      throw Error('userprofile-library: SkynetClient not initialized')
    }
    try {
      let profileData = null;
      // check if we need to pull "SkyID" (legancy login) profile
      if (options != null && options != undefined && options.ipd == "SkyId") {
        //return await this.getSkyIdUserProfile(userID);
        return DEFAULT_USER_PROFILE;
      }
      else { // By default get "MySky" Profile
        // Skapp Specific Update
        if (options && options.skapp) {
          const lastSkapp = options.skapp;
          const LATEST_PROFILE_PATH = `${DAC_DOMAIN}/${lastSkapp}/userprofile.json`;
          let profileData: IUserProfile | null = await this.downloadFile(userID, LATEST_PROFILE_PATH);
          return profileData;
        }
        else {//latest profile
          const LATEST_PROFILE_PATH = `${DAC_DOMAIN}/profileIndex.json`;
          let profileIndexData: IProfileIndex | null = await this.downloadFile(userID, LATEST_PROFILE_PATH);
          if (profileIndexData != null && profileIndexData.profile != null) {
            profileData = profileIndexData.profile;
            //check SkyID
            if (profileData && profileData.username == "" && profileData.aboutMe == "" && profileData.avatar && profileData.avatar.length == 0 && profileData.location == "") {
              return DEFAULT_USER_PROFILE;// RETURN DEFAULT profile data
              //return profileData;
            }
            return profileData;// users latest profile data
          }
        }
      }
      if (profileData == null) {// return skyId profile or empty profile
        return DEFAULT_USER_PROFILE;
      }
    } catch (error) {
      this.log('Error occurred trying to get profile data, err: ', error);
      return { error: error }
    }
  }

  // private async getSkyIdUserProfile(userID: any): Promise<any> {
  //   this.log(' *** MySky userprofile doesnt exist, get SkyID userprofile data **');
  //   let userProfile: IUserProfile | null = null;
  //   try {
  //     // get "Skapp" name which updated profile last.
  //     //let oldData: any = await this.client.db.getJSON(userID, "profile");
  //     const result: any | null = await this.client.registry.getEntry(userID, "profile");
  //     this.log(' #### SkyID getEntry : result.entry :' + result.entry);
  //     if (result != null && result != undefined && result.entry != undefined && result.entry != null) {
  //       const contentObj: any = await this.client.getFileContent(result.entry.data);
  //       this.log(' #### SkyID Profile Data :' + contentObj.data);
  //       const skyIdProfile: any = JSON.parse(contentObj.data);
  //       userProfile = {
  //         version: VERSION,
  //         username: skyIdProfile.username,
  //         aboutMe: skyIdProfile.aboutMe,
  //         location: skyIdProfile.location || "",
  //         topics: skyIdProfile.tags || [],
  //         avatar: skyIdProfile.avatar || []
  //       }
  //     }
  //     else {
  //       userProfile = DEFAULT_USER_PROFILE;
  //     }
  //   }
  //   catch (error) {
  //     this.log('Error occurred trying to get SkyID profile data, err: ', error);
  //   }
  //   return userProfile;
  // }
  /**
   * This method is used to retrive users profile information update History. accross all skapps using this dac
   * @param data need to pass a dummy data for remotemethod call sample {test:"test"}
   * @returns Promise<any> the profile data update history
   */
  public async getProfileHistory(userID: string): Promise<any> {
    if (typeof this.client === "undefined") {
      throw Error('userprofile-library: SkynetClient not initialized')
    }
    try {
      // purposefully not awaited
      let indexData: any = await this.downloadFile(userID, PROFILE_INDEX_PATH);
      return indexData.historyLog;
    } catch (error) {
      this.log('Error occurred trying to record new content, err: ', error)
      return { error: error }
    }
  }

  /**
   * This method is used to retrive last saved users Preferences information globaly. accross all skapps using this dac
   * @param data need to pass a dummy data for remotemethod call sample {test:"test"}
   * @returns Promise<any> the last saved users Preferences data
   */
  public async getPreferences(userID: any, options: IPreferencesOptions): Promise<any> {
    if (typeof this.client === "undefined") {
      throw Error('userprofile-library: SkynetClient not initialized')
    }
    try {
      let lastSkapp = null;
      if (options && options.skapp) {
        lastSkapp = options.skapp;
      }
      else {
        // get "Skapp" name which updated preference last.
        lastSkapp = await this.handleGetLastestPrefSkapp(userID);
      }
      // null mean profile is not initilaized correctly. 
      // Ideally this shouldn't happen, since we are initializing empty preference at first MySky login
      if (lastSkapp != null) {
        // download preferece json from Skapp folder and return
        const LATEST_PREF_PATH = `${DAC_DOMAIN}/${lastSkapp}/preferences.json`;
        return await this.downloadFile(userID, LATEST_PREF_PATH);
      }
      else {
        return DEFAULT_PREFERENCES;
      }
    } catch (error) {
      this.log('Error occurred trying to record new content, err: ', error)
      return { error: error }
    }
  }

  /**
  * This method is used to retrive users Preferences information update History. accross all skapps using this dac
  * @param data need to pass a dummy data for remotemethod call sample {test:"test"}
  * @returns Promise<any> the Preferences data update history
  */
  public async getPreferencesHistory(userID: any): Promise<any> {
    if (typeof this.client === "undefined") {
      throw Error('userprofile-library: SkynetClient not initialized')
    }
    try {
      // purposefully not awaited
      let indexData: any = await this.downloadFile(userID, PREFERENCES_INDEX_PATH);
      return indexData.historyLog;
    } catch (error) {
      this.log('Error occurred trying to record new content, err: ', error)
      return { error: error }
    }
  }

  private async getLastestProfileSkapp(userID: any): Promise<string | null> {
    let indexData: any = await this.downloadFile(userID, PROFILE_INDEX_PATH);
    if (indexData != null) {
      return indexData.lastUpdatedBy;
    } else {
      return null;
    }
  }

  private async handleGetLastestPrefSkapp(userID: any): Promise<string | null> {
    let indexData: any = await this.downloadFile(userID, PREFERENCES_INDEX_PATH);
    if (indexData != null) {
      return indexData.lastUpdatedBy;
    } else {
      return null
    }
  }

  // updateFile merely wraps setJSON but is typed in a way that avoids repeating
  // the awkwars "as unknown as JsonData" everywhere
  private async getEntryData(userID: string, path: string): Promise<string | null> {
    this.log('reading EntryData at path', path);
    //this.log('updating file at path(jsonString)', path, jsonString)
    try {
      const entryData = await this.client.file.getEntryData(userID, path);
      if (entryData && entryData.data)
        return fromByteArray(entryData.data);
      else
        return null;
    }
    catch (e) {
      this.log(' Error Getting Entry Data ', e)
      return null;
      //throw e;
    }
  }
  // downloadFile merely wraps getJSON but is typed in a way that avoids
  // repeating the awkward "as unknown as T" everywhere
  private async downloadFile<T>(userID: string, path: string): Promise<T | null> {
    if (typeof this.client === "undefined") {
      throw Error('UserProfileDAC Library :: SkynetClient not initialized')
    }
    this.log('downloading file at path', path)
    const { data } = await this.client.file.getJSON(userID, path)
    if (!data) {
      this.log('no data found at path', path)
      return null;
    }
    this.log('data found at path', path, data)
    return data as unknown as T
  }

  // log prints to stdout only if DEBUG_ENABLED flag is set
  private log(message: string, ...optionalContext: any[]) {
    if (DEBUG_ENABLED) {
      console.log("UserProfileDAC Library :: " + message, ...optionalContext)
    }
  }

  public getPermissions(): Permission[] {
    return [
      new Permission(
        DAC_DOMAIN,
        DAC_DOMAIN,
        PermCategory.Discoverable,
        PermType.Read
      ),
      new Permission(
        DAC_DOMAIN,
        DAC_DOMAIN,
        PermCategory.Discoverable,
        PermType.Write
      ),
    ];
  }
}
