export const enableNotifications = async () => {
  if (Notification.permission != "granted") {
    await Notification.requestPermission();
  }
  if (Notification.permission == "granted") {
    navigator.serviceWorker.getRegistration().then(async (reg) => {
      if (!reg) {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        navigator.serviceWorker.ready.then(async function (registration) {
          const pushServerPublicKey = import.meta.env.VITE_APP_NOTIFY_KEY;
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: pushServerPublicKey,
          });

          fetch("/api/n/subscription", {
            method: "POST",
            body: JSON.stringify(subscription),
            headers: {
              "Content-Type": "application/json",
            },
          });
        });
      }
    });
  }
};
