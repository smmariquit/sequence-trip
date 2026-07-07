// src/notifications/NotificationRouter.tsx
//
// Routes a tapped daily-sequence notification to its visualize screen.
// Rendered only on native — expo-notifications' getLastNotificationResponse
// throws on web, so the hook must never run there.

import React from "react";
import { router } from "expo-router";
import * as Notifications from "expo-notifications";

export default function NotificationRouter() {
  const response = Notifications.useLastNotificationResponse();
  React.useEffect(() => {
    const anum = response?.notification.request.content.data?.anum;
    if (typeof anum === "string") router.push(`/visualize/${anum}`);
  }, [response]);
  return null;
}
