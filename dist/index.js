(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "skynet-js", "skynet-mysky-utils", "./skystandards", "./types", "./types"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const skynet_js_1 = require("skynet-js");
    const skynet_mysky_utils_1 = require("skynet-mysky-utils");
    const skystandards_1 = require("./skystandards");
    const types_1 = require("./types");
    const DAC_DOMAIN = "profile-dac.hns";
    //const DAC_DOMAIN = "support-dac.hns";
    //const DAC_DOMAIN = "localhost";
    const USER_STATUS_INDEX_PATH = `${DAC_DOMAIN}/userstatus`;
    const PROFILE_INDEX_PATH = `${DAC_DOMAIN}/profileIndex.json`;
    const PREFERENCES_INDEX_PATH = `${DAC_DOMAIN}/preferencesIndex.json`;
    const urlParams = new URLSearchParams(window.location.search);
    const DEBUG_ENABLED = urlParams.get('debug') === "true";
    // We'll define a portal to allow for developing on localhost.
    // When hosted on a skynet portal, SkynetClient doesn't need any arguments.
    const portal = window.location.hostname === 'localhost' ? 'https://siasky.net' : undefined;
    // PREFERENCES_PATH: `${DAC_DOMAIN}/${skapp}/preferences.json`,
    // PROFILE_PATH: `${DAC_DOMAIN}/${skapp}/userprofile.json`,
    // PROFILE_INDEX_PATH: `${DAC_DOMAIN}/profileIndex.json`,
    // PREFERENCES_INDEX_PATH: `${DAC_DOMAIN}/preferencesIndex.json`
    var types_2 = require("./types");
    exports.LastSeenPrivacyType = types_2.LastSeenPrivacyType;
    exports.PrivacyType = types_2.PrivacyType;
    class UserProfileDAC extends skynet_js_1.DacLibrary {
        constructor() {
            super(DAC_DOMAIN);
            this.client = new skynet_js_1.SkynetClient(portal);
        }
        // async init(client: SkynetClient, customOptions: CustomConnectorOptions): Promise<void> {
        //   this.client = client;
        //   return super.init(client, customOptions);
        // }
        // ************************************************************************/
        // **** DAC Methods: All Set Methods must be called and executed in DAC ***/
        // ************************************************************************/
        async setUserStatus(status) {
            if (!this.connector) {
                throw new Error("Connector not initialized");
            }
            return await this.connector.connection
                .remoteHandle()
                .call("setUserStatus", status);
        }
        async setProfile(data) {
            if (!this.connector) {
                throw new Error("Connector not initialized");
            }
            if (typeof data === 'string') {
                data = skystandards_1.Convert.toProfile(data);
            }
            return await this.connector.connection
                .remoteHandle()
                .call("setProfile", data);
        }
        async updateProfile(data) {
            if (!this.connector) {
                throw new Error("Connector not initialized");
            }
            if (typeof data === 'string') {
                data = skystandards_1.Convert.toProfile(data);
            }
            return await this.connector.connection
                .remoteHandle()
                .call("updateProfile", data);
        }
        async setPreferences(data) {
            if (!this.connector) {
                throw new Error("Connector not initialized");
            }
            if (typeof data === 'string') {
                data = skystandards_1.Convert.toPreferences(data);
            }
            return await this.connector.connection
                .remoteHandle()
                .call("setPreferences", data);
        }
        async setGlobalPreferences(data) {
            if (!this.connector) {
                throw new Error("Connector not initialized");
            }
            if (typeof data === 'string') {
                data = skystandards_1.Convert.toPreferences(data);
            }
            return await this.connector.connection
                .remoteHandle()
                .call("setGlobalPreferences", data);
        }
        async getSkappPreferences() {
            if (!this.connector) {
                throw new Error("Connector not initialized");
            }
            return await this.connector.connection
                .remoteHandle()
                .call("getSkappPreferences", undefined);
        }
        async getGlobalPreferences() {
            if (!this.connector) {
                throw new Error("Connector not initialized");
            }
            return await this.connector.connection
                .remoteHandle()
                .call("getGlobalPreferences", undefined);
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
        async getUserStatus(userID, options) {
            if (typeof this.client === "undefined") {
                throw Error('userprofile-library: SkynetClient not initialized');
            }
            let userStatus = types_1.DEFAULT_USER_STATUS;
            try {
                let status = null;
                this.log(` options.onUserStatusChange ${options.onUserStatusChange}`);
                // Skapp Specific Update
                if (options && options.skapp) {
                    const USER_STATUS_PATH = `${DAC_DOMAIN}/${options.skapp}/userstatus`;
                    status = await this.getEntryData(userID, USER_STATUS_PATH);
                }
                else { //latest status
                    status = await this.getEntryData(userID, USER_STATUS_INDEX_PATH);
                }
                userStatus = this.parseUserStatusEntryData(status);
                // if callback function is present return value in call back function
                if (options && options.onUserStatusChange) {
                    options.onUserStatusChange(userStatus);
                    setInterval(async () => {
                        this.log(' Start : update lastSeen : Every 30 second');
                        try {
                            let status = null;
                            // Skapp Specific Update
                            if (options && options.skapp) {
                                const USER_STATUS_PATH = `${DAC_DOMAIN}/${options.skapp}/userstatus`;
                                status = await this.getEntryData(userID, USER_STATUS_PATH);
                            }
                            else { //latest status
                                status = await this.getEntryData(userID, USER_STATUS_INDEX_PATH);
                            }
                            userStatus = this.parseUserStatusEntryData(status);
                            options.onUserStatusChange(userStatus);
                        }
                        catch (error) {
                            this.log('Error occurred trying to get user status, err: ', error);
                            return { error: error };
                        }
                        this.log(' End : update lastSeen ');
                    }, 120000);
                }
                else {
                    return userStatus;
                }
            }
            catch (error) {
                this.log('Error occurred trying to get user status, err: ', error);
                return { error: error };
            }
        }
        parseUserStatusEntryData(data) {
            const userStatus = types_1.DEFAULT_USER_STATUS;
            if (data) {
                const dataList = data.split("|");
                userStatus.status = dataList[0];
                userStatus.lastSeen = dataList[1];
            }
            return userStatus;
        }
        /**
         * This method is used to retrive last saved users profile information globaly. accross all skapps using this dac
         * @param userID need to pass a dummy data for remotemethod call sample {test:"test"}
         * @param options need to pass {ipd:"SkyId"} for skyId profiles
         * @returns Promise<any> the last saved users profile data
         */
        async getProfile(userID, options) {
            if (typeof this.client === "undefined") {
                throw Error('userprofile-library: SkynetClient not initialized');
            }
            try {
                let profileData = null;
                // check if we need to pull "SkyID" (legancy login) profile
                if (options != null && options != undefined && options.ipd == "SkyId") {
                    //return await this.getSkyIdUserProfile(userID);
                    return types_1.DEFAULT_USER_PROFILE;
                }
                else { // By default get "MySky" Profile
                    // Skapp Specific Update
                    if (options && options.skapp) {
                        const lastSkapp = options.skapp;
                        const LATEST_PROFILE_PATH = `${DAC_DOMAIN}/${lastSkapp}/userprofile.json`;
                        let profileData = await this.downloadFile(userID, LATEST_PROFILE_PATH);
                        return profileData;
                    }
                    else { //latest profile
                        const LATEST_PROFILE_PATH = `${DAC_DOMAIN}/profileIndex.json`;
                        let profileIndexData = await this.downloadFile(userID, LATEST_PROFILE_PATH);
                        if (profileIndexData != null && profileIndexData.profile != null) {
                            profileData = profileIndexData.profile;
                            //check SkyID
                            if (profileData && profileData.username == "" && profileData.aboutMe == "" && profileData.avatar && profileData.avatar.length == 0 && profileData.location == "") {
                                return types_1.DEFAULT_USER_PROFILE; // RETURN DEFAULT profile data
                                //return profileData;
                            }
                            return profileData; // users latest profile data
                        }
                    }
                }
                if (profileData == null) { // return skyId profile or empty profile
                    return types_1.DEFAULT_USER_PROFILE;
                }
            }
            catch (error) {
                this.log('Error occurred trying to get profile data, err: ', error);
                return { error: error };
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
        async getProfileHistory(userID) {
            if (typeof this.client === "undefined") {
                throw Error('userprofile-library: SkynetClient not initialized');
            }
            try {
                // purposefully not awaited
                let indexData = await this.downloadFile(userID, PROFILE_INDEX_PATH);
                return indexData.historyLog;
            }
            catch (error) {
                this.log('Error occurred trying to record new content, err: ', error);
                return { error: error };
            }
        }
        /**
         * This method is used to retrive last saved users Preferences information globaly. accross all skapps using this dac
         * @param data need to pass a dummy data for remotemethod call sample {test:"test"}
         * @returns Promise<any> the last saved users Preferences data
         */
        async getPreferences(userID, options) {
            if (typeof this.client === "undefined") {
                throw Error('userprofile-library: SkynetClient not initialized');
            }
            try {
                let result = null;
                if (options && options.skapp) { // download preferece json from Skapp folder and return
                    const SKAPP_PREF_PATH = `${DAC_DOMAIN}/${options.skapp}/preferences.json`;
                    const temp = await this.downloadFile(userID, SKAPP_PREF_PATH);
                    result = temp ? temp : types_1.DEFAULT_PREFERENCES;
                }
                else // get Global Preferences
                 {
                    const GLOBAL_PREF_PATH = `${DAC_DOMAIN}/preferencesIndex.json`;
                    const temp = await this.downloadFile(userID, GLOBAL_PREF_PATH);
                    result = temp && temp.preferences ? temp.preferences : types_1.DEFAULT_PREFERENCES;
                }
                return result;
            }
            catch (error) {
                this.log('Error occurred in getPreferences, err: ', error);
                return { error: error };
            }
        }
        /**
         * This method is used to retrive last saved users Preferences information globaly. accross all skapps using this dac
         * @param data need to pass a dummy data for remotemethod call sample {test:"test"}
         * @returns Promise<any> the last saved users Preferences data
         */
        async getSkappsIndex(userID) {
            if (typeof this.client === "undefined") {
                throw Error('userprofile-library: SkynetClient not initialized');
            }
            try {
                let result = null;
                const GLOBAL_PREF_PATH = `${DAC_DOMAIN}/preferencesIndex.json`;
                const temp = await this.downloadFile(userID, GLOBAL_PREF_PATH);
                result = temp && temp.skapps ? temp.skapps : [];
                return result;
            }
            catch (error) {
                this.log('Error occurred in getSkappsIndex, err: ', error);
                return { error: error };
            }
        }
        /**
        * This method is used to retrive users Preferences information update History. accross all skapps using this dac
        * @param data need to pass a dummy data for remotemethod call sample {test:"test"}
        * @returns Promise<any> the Preferences data update history
        */
        async getPreferencesHistory(userID) {
            if (typeof this.client === "undefined") {
                throw Error('userprofile-library: SkynetClient not initialized');
            }
            try {
                // purposefully not awaited
                let indexData = await this.downloadFile(userID, PREFERENCES_INDEX_PATH);
                return indexData.historyLog;
            }
            catch (error) {
                this.log('Error occurred trying to record new content, err: ', error);
                return { error: error };
            }
        }
        async getLastestProfileSkapp(userID) {
            let indexData = await this.downloadFile(userID, PROFILE_INDEX_PATH);
            if (indexData != null) {
                return indexData.lastUpdatedBy;
            }
            else {
                return null;
            }
        }
        async handleGetLastestPrefSkapp(userID) {
            let indexData = await this.downloadFile(userID, PREFERENCES_INDEX_PATH);
            if (indexData != null) {
                return indexData.lastUpdatedBy;
            }
            else {
                return null;
            }
        }
        // updateFile merely wraps setJSON but is typed in a way that avoids repeating
        // the awkwars "as unknown as JsonData" everywhere
        async getEntryData(userID, path) {
            this.log('reading EntryData at path', path);
            //this.log('updating file at path(jsonString)', path, jsonString)
            try {
                const entryData = await this.client.file.getEntryData(userID, path);
                if (entryData && entryData.data)
                    return Buffer.from(entryData.data).toString("utf-8");
                else
                    return null;
            }
            catch (e) {
                this.log(' Error Getting Entry Data ', e);
                return null;
                //throw e;
            }
        }
        // downloadFile merely wraps getJSON but is typed in a way that avoids
        // repeating the awkward "as unknown as T" everywhere
        async downloadFile(userID, path) {
            if (typeof this.client === "undefined") {
                throw Error('UserProfileDAC Library :: SkynetClient not initialized');
            }
            this.log('downloading file at path', path);
            const { data } = await this.client.file.getJSON(userID, path);
            if (!data) {
                this.log('no data found at path', path);
                return null;
            }
            this.log('data found at path', path, data);
            return data;
        }
        // log prints to stdout only if DEBUG_ENABLED flag is set
        log(message, ...optionalContext) {
            if (DEBUG_ENABLED) {
                console.log("UserProfileDAC Library :: " + message, ...optionalContext);
            }
        }
        getPermissions() {
            return [
                new skynet_mysky_utils_1.Permission(DAC_DOMAIN, DAC_DOMAIN, skynet_mysky_utils_1.PermCategory.Discoverable, skynet_mysky_utils_1.PermType.Read),
                new skynet_mysky_utils_1.Permission(DAC_DOMAIN, DAC_DOMAIN, skynet_mysky_utils_1.PermCategory.Discoverable, skynet_mysky_utils_1.PermType.Write),
            ];
        }
    }
    exports.UserProfileDAC = UserProfileDAC;
    ;
});
