import { DacLibrary } from "skynet-js";
import { Permission } from "skynet-mysky-utils";
import { IUserStatusOptions, IUserStatus, IDACResponse, IUserProfileDAC, IProfileOptions, IUserProfile, IPreferencesOptions, IUserPreferences } from "./types";
export { LastSeenPrivacyType, PrivacyType } from "./types";
export declare class UserProfileDAC extends DacLibrary implements IUserProfileDAC {
    private client;
    constructor();
    setUserStatus(status: string): Promise<IDACResponse>;
    setProfile(data: IUserProfile): Promise<IDACResponse>;
    updateProfile(data: IUserProfile): Promise<IDACResponse>;
    setPreferences(data: IUserPreferences): Promise<IDACResponse>;
    setGlobalPreferences(data: IUserPreferences): Promise<IDACResponse>;
    getSkappPreferences(): Promise<any>;
    getGlobalPreferences(): Promise<any>;
    /**
     * This method is used to retrive last saved users profile information globaly. accross all skapps using this dac
     * @param userID need to pass a dummy data for remotemethod call sample {test:"test"}
     * @param options need to pass {ipd:"SkyId"} for skyId profiles
     * @returns Promise<any> the last saved users profile data
     */
    getUserStatus(userID: string, options?: IUserStatusOptions): Promise<IUserStatus | any>;
    private parseUserStatusEntryData;
    /**
     * This method is used to retrive last saved users profile information globaly. accross all skapps using this dac
     * @param userID need to pass a dummy data for remotemethod call sample {test:"test"}
     * @param options need to pass {ipd:"SkyId"} for skyId profiles
     * @returns Promise<any> the last saved users profile data
     */
    getProfile(userID: string, options?: IProfileOptions): Promise<any>;
    /**
     * This method is used to retrive users profile information update History. accross all skapps using this dac
     * @param data need to pass a dummy data for remotemethod call sample {test:"test"}
     * @returns Promise<any> the profile data update history
     */
    getProfileHistory(userID: string): Promise<any>;
    /**
     * This method is used to retrive last saved users Preferences information globaly. accross all skapps using this dac
     * @param data need to pass a dummy data for remotemethod call sample {test:"test"}
     * @returns Promise<any> the last saved users Preferences data
     */
    getPreferences(userID: any, options: IPreferencesOptions): Promise<any>;
    /**
     * This method is used to retrive last saved users Preferences information globaly. accross all skapps using this dac
     * @param data need to pass a dummy data for remotemethod call sample {test:"test"}
     * @returns Promise<any> the last saved users Preferences data
     */
    getSkappsIndex(userID: any): Promise<any>;
    /**
    * This method is used to retrive users Preferences information update History. accross all skapps using this dac
    * @param data need to pass a dummy data for remotemethod call sample {test:"test"}
    * @returns Promise<any> the Preferences data update history
    */
    getPreferencesHistory(userID: any): Promise<any>;
    private getLastestProfileSkapp;
    private handleGetLastestPrefSkapp;
    private getEntryData;
    private downloadFile;
    private log;
    getPermissions(): Permission[];
}
//# sourceMappingURL=index.d.ts.map