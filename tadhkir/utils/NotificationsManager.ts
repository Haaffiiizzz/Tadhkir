import * as Notifications from "expo-notifications"
import AsyncStorage from "@react-native-async-storage/async-storage";
import { prayerStorageMain } from "./setUpPrayerStorage";
const prayers = [
        'Fajr',
        'Dhuhr',
        'Asr',
        'Maghrib',
        'Isha'
];
async function scheduleAllNotifications(todayDate: string, todayData: { timings: Record<string, string> }){
    /**
     * For each prayer in todays data, we will create a notification for it. 
     */
    const prayerTimings = todayData.timings

    prayers.map(prayer => {
        let timeString = prayerTimings[prayer].split(" ")[0]
        console.log("prayer", prayer, "time", timeString)
        scheduleNotification(prayer, timeString, 5)
       
    });

    await AsyncStorage.setItem('NotificationScheduled', todayDate)
}
async function scheduleNotification(prayer: string, time: string, offset: number) {
    /**
     * Function to shedule notification for a particular prayer given its name, time and offset(minutes before prayer to send notif)
     */
    const triggerDate = getTriggerDate(time, offset);
    console.log("notification scheduled for", triggerDate.getHours(), triggerDate.getMinutes())
    
    await Notifications.scheduleNotificationAsync({
        content: {
        title: `${prayer}`,
        body: `${prayer} is in ${offset} minutes`,
        data: { data: 'goes here', test: { test1: 'more data' } },
        },
        trigger: { 
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
        }
    });
 
}

const getTriggerDate = (timeStr: string, offset: number): Date => {
    /**
     * Function to get the time/date object for the notification to be triggered at.
     */
    const [hours, minutes] = timeStr.split(':').map(Number);
    const now = new Date();

    let trigger = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes
    );

    trigger = new Date(trigger.getTime() - offset * 60000)

    return trigger;
};

export default scheduleAllNotifications;