import AsyncStorage from "@react-native-async-storage/async-storage";
import { addMonthToMonths, getPrayerTimes, setUpPrayerStorage } from "./setUpPrayerStorage";

export async function CheckMonth() {
    /**
     * THis function compares the current month with the last saved month. If it is different, it attemps to get the data
     * for the current (hopefully new month)
     */
    const currentMonth = new Date().getMonth() + 1;
    const savedMonth = await AsyncStorage.getItem('CurrentMonth');

    if (currentMonth.toString() !== savedMonth) {
        GetNewMonthData(currentMonth)
    }
 
}

export async function GetNewMonthData(newMonth: Number){
    const latitude = await AsyncStorage.getItem("latitude")
    const longitude = await AsyncStorage.getItem("longitude")

    await addMonthToMonths(newMonth);

    const monthData = await getPrayerTimes(latitude, longitude, newMonth);
    await setUpPrayerStorage(monthData);

}