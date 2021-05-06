import { DacLibrary, MySky, CustomConnectorOptions, SkynetClient } from "skynet-js";
import { PermCategory, Permission, PermType } from "skynet-mysky-utils";
import { Convert } from "./skystandards"
import {
  VERSION, DEFAULT_PREFERENCES, DEFAULT_USER_PROFILE, IDACResponse, IUserProfileDAC, IProfileOptions, IUserProfile, IPreferencesOptions, IUserPreferences, IProfileIndex
} from "./types";

const DAC_DOMAIN = "profile-dac.hns";

const PROFILE_INDEX_PATH = `${DAC_DOMAIN}/profileIndex.json`;
const PREFERENCES_INDEX_PATH = `${DAC_DOMAIN}/preferencesIndex.json`;
const DEBUG_ENABLED = "true";

// PREFERENCES_PATH: `${DAC_DOMAIN}/${skapp}/preferences.json`,
// PROFILE_PATH: `${DAC_DOMAIN}/${skapp}/userprofile.json`,
// PROFILE_INDEX_PATH: `${DAC_DOMAIN}/profileIndex.json`,
// PREFERENCES_INDEX_PATH: `${DAC_DOMAIN}/preferencesIndex.json`
export class UserProfileDAC extends DacLibrary implements IUserProfileDAC {
  private client: SkynetClient

  public constructor() {
    super(DAC_DOMAIN);
    this.client = new SkynetClient("https://siasky.net");
  }

  // async init(client: SkynetClient, customOptions: CustomConnectorOptions): Promise<void> {
  //   this.client = client;
  //   return super.init(client, customOptions);
  // }

  // ************************************************************************/
  // **** DAC Methods: All Set Methods must be called and executed in DAC ***/
  // ************************************************************************/
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
  public async getProfile(userID: string, options?: IProfileOptions): Promise<any> {
    if (typeof this.client === "undefined") {
      throw Error('userprofile-library: SkynetClient not initialized')
    }
    try {
      let profileData = null;
      // check if we need to pull "SkyID" (legancy login) profile
      if (options != null && options != undefined && options.ipd == "SkyId") {
        return await this.getSkyIdUserProfile(userID);
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
              profileData = await this.getSkyIdUserProfile(userID);
              return profileData;// users SkyID profile data
            }
            return profileData;// users latest profile data
          }
        }
      }
      if (profileData == null) {// return skyId profile or empty profile
        let profileData = await this.getSkyIdUserProfile(userID);
        if (!profileData) {
          profileData = DEFAULT_USER_PROFILE;
        }
        return profileData;
      }
    } catch (error) {
      this.log('Error occurred trying to get profile data, err: ', error);
      return { error: error }
    }
  }

  private async getSkyIdUserProfile(userID: any): Promise<any> {
    this.log(' *** MySky userprofile doesnt exist, get SkyID userprofile data **');
    let userProfile: IUserProfile | null = null;
    try {
      // get "Skapp" name which updated profile last.
      //let oldData: any = await this.client.db.getJSON(userID, "profile");
      const result: any | null = await this.client.registry.getEntry(userID, "profile");
      this.log(' #### SkyID getEntry : result.entry :' + result.entry);
      if (result != null && result != undefined && result.entry != undefined && result.entry != null) {
        const contentObj: any = await this.client.getFileContent(result.entry.data);
        this.log(' #### SkyID Profile Data :' + contentObj.data);
        const skyIdProfile: any = JSON.parse(contentObj.data);
        userProfile = {
          version: VERSION,
          username: skyIdProfile.username,
          aboutMe: skyIdProfile.aboutMe,
          location: skyIdProfile.location || "",
          topics: skyIdProfile.tags || [],
          avatar: skyIdProfile.avatar || []
        }
      }
      else {
        userProfile = DEFAULT_USER_PROFILE;
      }
    }
    catch (error) {
      this.log('Error occurred trying to get SkyID profile data, err: ', error);
    }
    return userProfile;
  }
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
