import * as Notifications from "expo-notifications"
import AsyncStorage from "@react-native-async-storage/async-storage";

const prayers = [
        'Fajr',
        'Dhuhr',
        'Asr',
        'Maghrib',
        'Isha'
];

export async function scheduleNotification(prayer: string, time: string, offset: number) {
    /**
     * Function to shedule notification for a particular prayer given its name, time and offset(minutes before prayer to send notif)
     */
    const [exactTriggerDate, triggerDateWithOffset] = getTriggerDate(time, offset);

    const notificationIdentifier = await Notifications.scheduleNotificationAsync({
        content: {
        title: `Tadhkir`,
        body: `${prayer} is in ${offset} minutes!`,
        sound: true,
        },
        trigger: { 
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDateWithOffset,
        }
    });

    await Notifications.scheduleNotificationAsync({
        content: {
        title: `Tadhkir`,
        body: `It's ${prayer} time!`,
        sound: true,
        },
        trigger: { 
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: exactTriggerDate,
        }
    });
    
    await AsyncStorage.setItem(`${prayer}NotificationID`, notificationIdentifier)
 
}

const getTriggerDate = (timeStr: string, offset: number): [Date, Date] => {
    /**
     * Function to get the time/date object for the notification to be triggered at.
     */
    const [hours, minutes] = timeStr.split(':').map(Number);
    const now = new Date();

    const trigger = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes
    ); // exact time for the prayer

    const triggerWithOffset = new Date(trigger.getTime() - offset * 60000) //time for the prayer with offset

    return [trigger, triggerWithOffset];
};

async function scheduleDayNotifications(todayDate: string, todayData: { timings: Record<string, string> }){
    /**
     * For each prayer in todays data, we will create a notification for it. 
     */
    
    const prayerTimings = todayData.timings
    prayerTimings && prayers.map(async (prayer) => {

        let timeString = prayerTimings[prayer].split(" ")[0] // 02:23 i.e taking off cdt or whatver time zone
        const storageKey = `${prayer}Offset`;
        const offsetString = await AsyncStorage.getItem(storageKey)
        const offset = Number(offsetString)
        scheduleNotification(prayer, timeString, offset)
       
    });

    await AsyncStorage.setItem('NotificationScheduled', todayDate)
}

async function scheduleAllNotifications(todayDate: string, todayData: { timings: Record<string, string> }){
    /**
     * In this function, we will schedule notifications for a few days in advance. We can store the latest day scheduled, 
     * and on entering the app everytime, we can check if the latest day scheduled is enough in advance (e.g 3-5 days in advance).
     * If its not enough, we can call this function again with how many more days we need to schedule.
     */
    scheduleDayNotifications(todayDate, todayData)
}

export default scheduleAllNotifications;