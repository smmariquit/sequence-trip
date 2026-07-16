// src/notifications/scheduler.ts
//
// Schedules the daily "sequence of the day" notification. Because each day
// names a different sequence, we schedule a rolling window of one-shot DATE
// triggers (not a single repeating DAILY trigger) and rebuild it on every
// app open. Native only; web no-ops.

import { Platform } from "react-native";
import { notifySettings } from "./notifyStore";
import { isoDate } from "../oeis/dayPick";
import { picksForDates } from "../oeis/db";
import { latexToUnicode } from "../math/latexToUnicode";

const WINDOW_DAYS = 14;
const HOUR = 9; // 09:00 local

export async function cancelDaily(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const Notifications = await import("expo-notifications");
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // best effort
  }
}

export async function rescheduleDaily(): Promise<void> {
  if (Platform.OS === "web") return;
  if (!notifySettings().enabled) return;
  try {
    const Notifications = await import("expo-notifications");
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return;

    await Notifications.cancelAllScheduledNotificationsAsync();

    // start tomorrow if today's 9am already passed
    const startOffset = new Date().getHours() >= HOUR ? 1 : 0;
    const dates = Array.from({ length: WINDOW_DAYS }, (_, i) => isoDate(i + startOffset));
    const picks = await picksForDates(dates);

    for (const p of picks) {
      const at = new Date(`${p.date}T0${HOUR}:00:00`);
      if (at.getTime() <= Date.now()) continue;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Today's sequence",
          // OS notification text cannot render KaTeX; Unicode only.
          body: `${p.anum}: ${latexToUnicode(p.name)}`,
          data: { anum: p.anum },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: at,
        },
      });
    }
  } catch {
    // never let scheduling break the app
  }
}
