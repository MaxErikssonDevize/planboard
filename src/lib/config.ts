export function getAppConfig() {
  return {
    appName: process.env.APP_NAME || "Planboard",
    appIcon: process.env.APP_ICON || "",
  };
}
