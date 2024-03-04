import * as OneSignal from 'onesignal-node';
// REST_API_Key : NTg0YzgyYzktMzUyMi00YTI2LWFmN2QtOTM4Y2MxMDIwODUz
//  App Id: 236be9bc-6c91-4fd8-87fd-1a5acde7b78f
// Create a new OneSignal client using your OneSignal App ID and REST API Key
export const oneSignalClient = new OneSignal.Client({
    userAuthKey: 'NTg0YzgyYzktMzUyMi00YTI2LWFmN2QtOTM4Y2MxMDIwODUz',
    app: { appAuthKey: 'NTg0YzgyYzktMzUyMi00YTI2LWFmN2QtOTM4Y2MxMDIwODUz', appId: '236be9bc-6c91-4fd8-87fd-1a5acde7b78f' }
});

// Define the notification content
export const notification = {
    contents: {
        en: 'This is a notification from your Node.js server in English!',
        ar: "هذا الاشعار موجه من ال"
    },
    included_segments: ['All'], // Send to all subscribed users 
    include_player_ids: ['SPECIFIC_PLAYER_ID'] // Specify the player ID of the target device
};


const result = await oneSignalClient.createNotification(notification)

// The included_segments parameter in the OneSignal notification payload specifies the segments of users to whom the notification should be sent.
//  Segments in OneSignal represent groups of users who have subscribed to receive notifications under certain criteria.

// Here are some common values for included_segments:

// All: Sends the notification to all users who have subscribed to receive notifications from your app.

// Active Users: Sends the notification to users who have been active within a certain time frame.

// Inactive Users: Sends the notification to users who have not been active within a certain time frame.

// Engaged Users: Sends the notification to users who have interacted with your app in a specific way, such as clicking on previous notifications.

// Custom Segments: You can create custom segments based on specific criteria, such as geographic location, user preferences, or behavior within your app. You would specify the custom segment name instead of one of the predefined segments.

// For example, if you want to send a notification to all users who have subscribed to your app, you would set included_segments to ['All'].

// If you want to send notifications to a specific group of users, you would create a custom segment in your OneSignal dashboard and specify the name of that segment in the included_segments parameter.

// In summary, included_segments allows you to target specific groups of users with your notifications, based on predefined or custom criteria that you set up within the OneSignal dashboard.