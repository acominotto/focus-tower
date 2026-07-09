const {
  withEntitlementsPlist,
  withInfoPlist,
} = require("@expo/config-plugins");

const APP_GROUP = "group.com.focustower.shared";

/** @type {import('@expo/config-plugins').ConfigPlugin} */
const withFocusTowerScreenTime = (config) => {
  config = withEntitlementsPlist(config, (config) => {
    config.modResults["com.apple.developer.family-controls"] = true;
    if (!config.modResults["com.apple.security.application-groups"]) {
      config.modResults["com.apple.security.application-groups"] = [];
    }
    if (!config.modResults["com.apple.security.application-groups"].includes(APP_GROUP)) {
      config.modResults["com.apple.security.application-groups"].push(APP_GROUP);
    }
    return config;
  });

  config = withInfoPlist(config, (config) => {
    config.modResults.UIBackgroundModes = [
      ...(config.modResults.UIBackgroundModes ?? []),
      "processing",
    ];
    return config;
  });

  return config;
};

module.exports = withFocusTowerScreenTime;
