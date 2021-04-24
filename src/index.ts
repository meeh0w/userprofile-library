import { DacLibrary, MySky, CustomConnectorOptions, SkynetClient } from "skynet-js";
import { PermCategory, Permission, PermType } from "skynet-mysky-utils";
import { Convert } from "./skystandards"
import {
  ICreateDACResponse, IUserProfileDAC, IProfileOptions, IUserProfile, IPreferencesOptions, IUserPreferences,
} from "./types";

const DAC_DOMAIN = "skyuser.hns";
const VERSION = 1;
const PROFILE_INDEX_PATH = `${DAC_DOMAIN}/profileIndex.json`;
const PREFERENCES_INDEX_PATH = `${DAC_DOMAIN}/preferencesIndex.json`;

// PREFERENCES_PATH: `${DAC_DOMAIN}/${skapp}/preferences.json`,
// PROFILE_PATH: `${DAC_DOMAIN}/${skapp}/userprofile.json`,
// PROFILE_INDEX_PATH: `${DAC_DOMAIN}/profileIndex.json`,
// PREFERENCES_INDEX_PATH: `${DAC_DOMAIN}/preferencesIndex.json`
export class UserProfileDAC extends DacLibrary implements IUserProfileDAC {
  public constructor() {
    super(DAC_DOMAIN);
  }

  client: SkynetClient | undefined

  async init(client: SkynetClient, customOptions: CustomConnectorOptions): Promise<void> {
    this.client = client;
    return super.init(client, customOptions);
  }

  // ************************************************************************/
  // **** DAC Methods: All Set Methods must be called and executed in DAC ***/
  // ************************************************************************/
  public async setProfile(data: IUserProfile): Promise<ICreateDACResponse> {
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

  public async setPreferences(data: IUserPreferences): Promise<ICreateDACResponse> {
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
  public async getProfile(userID: string, options: IProfileOptions): Promise<any> {
    if (typeof this.client === "undefined") {
      throw Error('userprofile-library: SkynetClient not initialized')
    }
    try {
      // check if we need to pull "SkyID" (legancy login) profile
      if (options != null && options != undefined && options.ipd == "SkyId") {
        console.log('Got SkyId params checking SkyID');
        // get "Skapp" name which updated profile last.
        let oldData: any = await this.client.db.getJSON(userID, "profile")
        let userProfile: IUserProfile = {
          version: VERSION,
          username: oldData.username,
          aboutMe: oldData.aboutMe,
          location: oldData.location || "",
          topics: oldData.tags || [],
          avatar: oldData.avatar || []
        }
        return userProfile;
      }
      else { // By default get "MySky" Profile
        let lastSkapp = null;
        if (options && options.skapp) {
          lastSkapp = options.skapp;
        }
        else {
          // get "Skapp" name which updated profile last. 
          lastSkapp = await this.getLastestProfileSkapp(userID);
        }
        // null mean profile is not initilaized correctly. 
        // Ideally this shouldn't happen, since we are initializing empty profile  at first MySky login
        if (lastSkapp != null) {
          // download profile json from Skapp folder and return
          const LATEST_PROFILE_PATH = `${DAC_DOMAIN}/${lastSkapp}/userprofile.json`;
          return await this.downloadFile(userID, LATEST_PROFILE_PATH);
        }
        else {// return empty profile
          return this.getInitialProfile();
        }
      }
    } catch (error) {
      console.log('Error occurred trying to get profile data, err: ', error);
      return { error: error }
    }
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
      console.log('Error occurred trying to record new content, err: ', error)
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
        return this.getInitialPrefrences();
      }
    } catch (error) {
      console.log('Error occurred trying to record new content, err: ', error)
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
      console.log('Error occurred trying to record new content, err: ', error)
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
      throw Error('userprofile-library: SkynetClient not initialized')
    }
    console.log('downloading file at path', path)
    const { data } = await this.client.file.getJSON(userID, path)
    if (!data) {
      console.log('no data found at path', path)
      return null;
    }
    console.log('data found at path', path, data)
    return data as unknown as T
  }

  private getInitialProfile() {
    return {
      version: VERSION,
      username: "",
      aboutMe: "",
      location: "",
      topics: [],
      avatar: []
    }
  }

  private getInitialPrefrences() {
    return {
      version: VERSION,
      darkmode: false,
      portal: "https://siasky.net"
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
  //////////////////////

  // public async getProfile(): Promise<any> {
  //   if (!this.connector) {
  //     throw new Error("Connector not initialized");
  //   }
  //   return await this.connector.connection
  //     .remoteHandle()
  //     .call("getProfile",{test:"test"});
  // }

  // public async getProfileHistory(): Promise<any> {
  //   if (!this.connector) {
  //     throw new Error("Connector not initialized");
  //   }
  //   return await this.connector.connection
  //     .remoteHandle()
  //     .call("getProfileHistory",{test:"test"});
  // }

  // public async getPreferences(): Promise<any> {
  //   if (!this.connector) {
  //     throw new Error("Connector not initialized");
  //   }
  //   return await this.connector.connection
  //     .remoteHandle()
  //     .call("getPreferences",{test:"test"});
  // }

  // public async getPreferencesHistory(): Promise<any> {
  //   if (!this.connector) {
  //     throw new Error("Connector not initialized");
  //   }
  //   return await this.connector.connection
  //     .remoteHandle()
  //     .call("getPreferencesHistory",{test:"test"});
  // }



}
