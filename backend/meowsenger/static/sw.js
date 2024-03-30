"use strict";

importScripts(
  "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js"
);

const AES = this.CryptoJS.AES;
const enc = this.CryptoJS.enc;

const notifications = new BroadcastChannel("notifications");

const decrypt = (msg, key) => {
  const bytes = AES.decrypt(msg, key);
  return bytes.toString(enc.Utf8);
};

async function checkClientIsVisible() {
  const windowClients = await clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  for (var i = 0; i < windowClients.length; i++) {
    if (windowClients[i].visibilityState === "visible") {
      return true;
    }
  }
  return false;
}

self.addEventListener("push", async function (event) {
  let data = event.data.text().split(":");
  if (!(await checkClientIsVisible())) {
    const title = "meowsenger";
    const options = {
      body: `${data[0]}: ${decrypt(data[1], data[2])}`,
      icon: "/static/catuser.png",
      badge: "/static/catuser.png",
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } else {
    notifications.postMessage({
      update: `${data[0]}:${decrypt(data[1], data[2])}:${data[3]}`,
    });
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow("https://meowsenger.pythonanywhere.com/chats")
  );
});
