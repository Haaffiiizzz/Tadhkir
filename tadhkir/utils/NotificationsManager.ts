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
    const triggerDate = getTriggerDate(time, offset);
    console.log("notification scheduled for", triggerDate.getHours(), triggerDate.getMinutes())
    
    const notificationIdentifier = await Notifications.scheduleNotificationAsync({
        content: {
        title: `Tadhkir`,
        body: `${prayer} is in ${offset} minutes`,
        sound: true,
        },
        trigger: { 
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
        }
    });

    await AsyncStorage.setItem(`${prayer}NotificationID`, notificationIdentifier)
 
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

async function scheduleAllNotifications(todayDate: string, todayData: { timings: Record<string, string> }){
    /**
     * For each prayer in todays data, we will create a notification for it. 
     */
    
    const prayerTimings = todayData.timings
    prayerTimings && prayers.map(async (prayer) => {

        let timeString = prayerTimings[prayer].split(" ")[0] // 02:23 i.e taking off cdt or whatver time zone
        console.log("prayer", prayer, "time", timeString)
        const storageKey = `${prayer}Offset`;
        const offsetString = await AsyncStorage.getItem(storageKey)
        const offset = Number(offsetString)
        scheduleNotification(prayer, timeString, offset)
       
    });

    await AsyncStorage.setItem('NotificationScheduled', todayDate)
}

export default scheduleAllNotifications;