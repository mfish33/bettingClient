cordova.define('cordova/plugin_list', function(require, exports, module) {
  module.exports = [
    {
      "id": "cordova-plugin-secure-storage.SecureStorage",
      "file": "plugins/cordova-plugin-secure-storage/www/securestorage.js",
      "pluginId": "cordova-plugin-secure-storage",
      "clobbers": [
        "SecureStorage"
      ]
    },
    {
      "id": "cordova-plugin-device.device",
      "file": "plugins/cordova-plugin-device/www/device.js",
      "pluginId": "cordova-plugin-device",
      "clobbers": [
        "device"
      ]
    },
    {
      "id": "cordova-plugin-fullscreen.AndroidFullScreen",
      "file": "plugins/cordova-plugin-fullscreen/www/AndroidFullScreen.js",
      "pluginId": "cordova-plugin-fullscreen",
      "clobbers": [
        "AndroidFullScreen"
      ]
    }
  ];
  module.exports.metadata = {
    "cordova-plugin-whitelist": "1.3.3",
    "cordova-plugin-secure-storage": "3.0.2",
    "cordova-plugin-device": "2.0.2",
    "cordova-plugin-fullscreen": "1.1.0"
  };
});