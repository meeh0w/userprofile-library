import { Profiler } from "inspector";
import { DacLibrary } from "skynet-js";
import { PermCategory, Permission, PermType } from "skynet-mysky-utils";
import { Convert, Profile } from "./skystandards"
import {
  ICreateProfileDACResponse,IUserProfileDAC
} from "./types";

const DAC_DOMAIN = "crqa.hns";

export class UserProfileDAC extends DacLibrary implements IUserProfileDAC {
  public constructor() {
    super(DAC_DOMAIN);
  }
  public async createProfile(data: Profile): Promise<ICreateProfileDACResponse> {
    if (!this.connector) {
      throw new Error("Connector not initialized");
    }
    if(typeof data === 'string'){
      data = Convert.toProfile(data);
    }
    return await this.connector.connection
      .remoteHandle()
      .call("createProfile", data);
  }
  public async getProfile(data: string): Promise<Profile> {

    // to be implimentted to directly fetch the data
    throw new Error("Method not implemented.");
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
