import * as Notifications from "expo-notifications"
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FiveDaysDateObject } from "./Helper";

const prayers = [
        'Fajr',
        'Dhuhr',
        'Asr',
        'Maghrib',
        'Isha'
];

export async function scheduleNotification(prayer: string, time: string, offset: number, prayerDate: string) {
    /**
     * Function to shedule notification for a particular prayer given its name, time and offset(minutes before prayer to send notif)
     */
    console.log("entered for")
    const [exactTriggerDate, triggerDateWithOffset] = getTriggerDate(time, offset, prayerDate);

    const offsetNotificationIdentifier = await Notifications.scheduleNotificationAsync({
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
    console.log("offset notification set", offsetNotificationIdentifier)

    const mainNotificationIdentifier = await Notifications.scheduleNotificationAsync({
        content: {
        title: `Tadhkir`,
        body: `It's ${prayer} time!`,
        sound: 'adhan.wav',
        },
        trigger: { 
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: exactTriggerDate,
        }
    });
    
    // we need to store the id for both the offset notification and the main one so we can retrieve and cancel the notifications later on 

    await AsyncStorage.setItem(`${prayerDate}${prayer}OffsetNotificationID`, offsetNotificationIdentifier)
    await AsyncStorage.setItem(`${prayerDate}${prayer}MainNotificationID`, mainNotificationIdentifier)
    console.log(prayer, "done")

 
}

const getTriggerDate = (timeStr: string, offset: number, prayerDate: string): [Date, Date] => {
    /**
     * Function to get the time/date object for the notification to be triggered at.
     */
    const [hours, minutes] = timeStr.split(':').map(Number);

    const [day, month, year] = prayerDate.split('-').map(Number);
    const current = new Date(year, month-1, day);


    const trigger = new Date(
        current.getFullYear(),
        current.getMonth(),
        current.getDate(),
        hours,
        minutes


    ); // exact time and day for the prayer

    const triggerWithOffset = new Date(trigger.getTime() - offset * 60000) //time for the prayer with offset

    return [trigger, triggerWithOffset];
};

async function scheduleDayNotifications(dayDate: string, dayData: { timings: Record<string, string> }){
    /**
     * For each prayer in todays data, we will create a notification for it. 
     */
    console.log("Scheduling for", dayDate)
    const prayerTimings = dayData.timings
    prayerTimings && prayers.map(async (prayer) => {

        let timeString = prayerTimings[prayer].split(" ")[0] // 02:23 i.e taking off cdt or whatver time zone
        const storageKey = `${prayer}Offset`;
        const offsetString = await AsyncStorage.getItem(storageKey)
        const offset = Number(offsetString)
        scheduleNotification(prayer, timeString, offset, dayDate)
       
    });

    await AsyncStorage.setItem('LatestNotificationScheduled', dayDate)
    console.log("Finished for ", dayDate)
    
}

async function scheduleAllNotifications(dates: Array<string>){
    /**
     * In this function, we will schedule notifications for a few days in advance. We can store the latest day scheduled, 
     * and on entering the app everytime, we can check if the latest day scheduled is enough in advance (e.g 3-5 days in advance).
     * If its not enough, we can call this function again with how many more days we need to schedule.
     */
    
    dates.forEach(async (date) => {
            let dayDataStr = await AsyncStorage.getItem(date);
    
            if(dayDataStr){
                const dayData = JSON.parse(dayDataStr);
                await scheduleDayNotifications(date, dayData);
            }
            else{
                console.log("false")
            }
            
    })

    //code below cancels previous (if any) notification prompting user to open app to continue recieving notifications
    const OpenAppNotificationID = await AsyncStorage.getItem("OpenAppNotificationID")
    if (OpenAppNotificationID) {await Notifications.cancelScheduledNotificationAsync(OpenAppNotificationID)}

    const OpenAppDateObject = FiveDaysDateObject() //from helpers.tsx  
    const newOpenAppNotificationID = await Notifications.scheduleNotificationAsync({
        content: {
        title: `Tadhkir`,
        body: `Open the app to continue receiving notifications!`,
        sound: true,
        },
        trigger: { 
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: OpenAppDateObject,
        }
    });

    await AsyncStorage.setItem("OpenAppNotificationID", newOpenAppNotificationID)

}

export async function reschedulePrayerWithNewOffset(prayer: string, newOffset: number){
    /**
     * When a prayer's offset setting is changed, we need to cancel the old scheduled notifications
     * and make new ones for that specific prayer in all the previously scheduled days. 
     */

    const previousDaysStr = await AsyncStorage.getItem("NewNotificationDaysList")
    const previousDaysList = previousDaysStr ? JSON.parse(previousDaysStr) : [] // this is now the list of days we already scheduled. 

    previousDaysList.forEach(async (day: string) => {
        const offsetID = await AsyncStorage.getItem(`${day}${prayer}OffsetNotificationID`);
        const mainID = await AsyncStorage.getItem(`${day}${prayer}MainNotificationID`);

        if (offsetID){
            await Notifications.cancelScheduledNotificationAsync(offsetID)
        }

        if (mainID){
            await Notifications.cancelScheduledNotificationAsync(mainID)
        }

        //after cancelling the days previous notifications, we need to get the prayer data and then schedule new notifications 
        const dayDataStr = await AsyncStorage.getItem(day)
        
        const dayData = dayDataStr ? JSON.parse(dayDataStr) : {}
        const dayTiming = dayData.timings[prayer].split(' ')[0]

        await scheduleNotification(prayer, dayTiming, newOffset, day);
        console.log("done rescheduling after offset")


    })

}

export default scheduleAllNotifications;