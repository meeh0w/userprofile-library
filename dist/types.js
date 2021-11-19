(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VERSION = 1;
    exports.StatusType = {
        ONLINE: 'Online',
        IDLE: 'Idle',
        DO_NOT_DISTURB: 'Do Not Disturb',
        INVISIBLE: 'Invisible',
        NONE: 'None'
    };
    exports.PrivacyType = {
        PRIVATE: 'Private',
        PUBLIC: 'Public'
    };
    exports.LastSeenPrivacyType = {
        PRIVATE: 'Private',
        PUBLIC_TS: 'Public with Timestamp',
        PUBLIC_NO_TS: 'Public without Timestamp',
    };
    exports.UserPresenceType = {
        RECENTLY: 'Recently',
        YESTERDAY: 'Yesterday',
        WITHIN_A_WEEK: 'Within a week',
        WITHIN_A_MONTH: 'Within a month',
        LONG_TIME_AGO: 'Long time ago'
    };
    exports.DEFAULT_USER_STATUS = {
        status: exports.StatusType.NONE,
        lastSeen: 0
    };
    // DEFAULT_USER_PROFILE defines all props as it is used in validator
    exports.DEFAULT_USER_PROFILE = {
        version: exports.VERSION,
        username: "anonymous",
        firstName: "",
        lastName: "",
        emailID: "",
        contact: "",
        aboutMe: "",
        location: "",
        topics: [],
        avatar: [],
        connections: []
    };
    exports.DEFAULT_PREFERENCES = {
        version: exports.VERSION,
        darkmode: false,
        portal: "https://siasky.net/",
        userStatus: {
            statusPrivacy: exports.PrivacyType.PRIVATE,
            lastSeenPrivacy: exports.PrivacyType.PRIVATE,
            updatefrequency: 0
        }
    };
});
