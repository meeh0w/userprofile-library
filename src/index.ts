import { DacLibrary } from "skynet-js";
import { PermCategory, Permission, PermType } from "skynet-mysky-utils";
import { Convert } from "./skystandards"
import {
  ICreateDACResponse,IUserProfileDAC, Preference, Profile
} from "./types";

const DAC_DOMAIN = "skyuser.hns";

export class UserProfileDAC extends DacLibrary implements IUserProfileDAC {
  public constructor() {
    super(DAC_DOMAIN);
  }
  
  public async setProfile(data: Profile): Promise<ICreateDACResponse> {
    if (!this.connector) {
      throw new Error("Connector not initialized");
    }
    if(typeof data === 'string'){
      data = Convert.toProfile(data);
    }
    return await this.connector.connection
      .remoteHandle()
      .call("setProfile", data);
  }

  public async getProfile(): Promise<any> {
    if (!this.connector) {
      throw new Error("Connector not initialized");
    }
    return await this.connector.connection
      .remoteHandle()
      .call("getProfile",{test:"test"});
  }

  public async getProfileHistory(): Promise<any> {
    if (!this.connector) {
      throw new Error("Connector not initialized");
    }
    return await this.connector.connection
      .remoteHandle()
      .call("getProfileHistory",{test:"test"});
  }
  
  public async getPreference(): Promise<any> {
    if (!this.connector) {
      throw new Error("Connector not initialized");
    }
    return await this.connector.connection
      .remoteHandle()
      .call("getPreference",{test:"test"});
  }
  public async setPreference(data: Preference): Promise<ICreateDACResponse> {
    if (!this.connector) {
      throw new Error("Connector not initialized");
    }
    if(typeof data === 'string'){
      data = Convert.toPreference(data);
    }
    return await this.connector.connection
      .remoteHandle()
      .call("setPreference", data);
  }

  public async getPreferenceHistory(): Promise<any> {
    if (!this.connector) {
      throw new Error("Connector not initialized");
    }
    return await this.connector.connection
      .remoteHandle()
      .call("getPreferenceHistory",{test:"test"});
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
