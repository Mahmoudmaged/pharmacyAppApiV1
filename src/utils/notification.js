export const pushNotification = async ({
  name,
  enContent,
  arContent,
  ...playerIds
}) => {
  const app_key_provider = {
    getToken() {
      return process.env.ONESIGNAL_REST_API_KEY;
    },
  };

  const configuration = OneSignal.createConfiguration({
    authMethods: {
      app_key: {
        tokenProvider: app_key_provider,
      },
    },
  });
  const client = new OneSignal.DefaultApi(configuration);

  const notification = new OneSignal.Notification();
  notification.app_id = process.env.ONESGINAL_APP_ID;
  notification.name = name;
  notification.contents = {
    en: enContent,
    ar: arContent,
  };
  // required for Huawei
  notification.headings = {
    en: enContent,
    ar: arContent,
  };
  notification.include_player_ids = playerIds;

  const { id } = await client.createNotification(notification);

  // TODO >> DB
};
