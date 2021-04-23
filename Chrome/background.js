// Güven Şahin - guvensahin.com
importScripts('/js/utils.js');

// check every 15 minutes
chrome.alarms.create({ periodInMinutes: 15, when: Date.now() });

chrome.alarms.onAlarm.addListener(() => {
  refreshContent();
});