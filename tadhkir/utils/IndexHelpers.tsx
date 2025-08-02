import AsyncStorage from "@react-native-async-storage/async-storage";
import { addMonthToMonths, getPrayerTimes, setUpPrayerStorage } from "./setUpPrayerStorage";
import { Alert } from "react-native";

export async function CheckMonth() {
    /**
     * THis function compares the current month with the last saved month. If it is different, it attemps to get the data
     * for the current (hopefully new month)
     */
    const currentMonth = new Date().getMonth() + 1;
    const savedMonth = await AsyncStorage.getItem('CurrentMonth');

    if (currentMonth.toString() !== savedMonth) {
        await AsyncStorage.setItem('CurrentMonth', currentMonth.toString())
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

export async function GetBasicUserData(){
    /**
     * This function retrieves and returns user's Name, City, Region, Latitude and Time Format. 
     */
    
    const storedFirstName = await AsyncStorage.getItem('User First Name');
    const storedCity = await AsyncStorage.getItem('city');
    const storedRegion = await AsyncStorage.getItem('region');
    const storedLatitude = await AsyncStorage.getItem('latitude');
    const storedTimeFormat = await AsyncStorage.getItem('timeformat');

    return [storedFirstName, storedCity, storedRegion, storedLatitude, storedTimeFormat]
}

const completedAllAlert = () => {
           //function to display an alert if all prayers are completed for the day.
           Alert.alert('MashaAllah', 'Congrats! 🎉 You completed all prayers!! 🥳', [
               {
                 text: 'Continue',
                 style: 'cancel',
               },
             ]);
};

const addToStreak = async (todayDate, streakStorage) => {
    streakStorage[todayDate] = true
    
    await AsyncStorage.setItem("streakStorage", JSON.stringify(streakStorage));
}

const removeFromStreak = async (todayDate, streakStorage) => {
    streakStorage[todayDate] = false
    
    await AsyncStorage.setItem("streakStorage", JSON.stringify(streakStorage));
}
export const handleValueChange = async (prayer: string, prayerStatus: Record<string, boolean>, prayerCount: number, prayerData: any, todayDate: string, streakStorage: object, setPrayerData: Function, setPrayerStatus: Function, setPrayerCount: Function) => {
  
    const confirmMarking = () => {
        return new Promise<boolean>((resolve) => {
            Alert.alert(
                "Confirm",
                "Are you sure you want to mark prayer as done? It's not yet the prayer time!",
                [
                { text: "Yes", onPress: () => resolve(true) },
                { text: "No", onPress: () => resolve(false) },
                ]
            );
            });
    };

    if (!prayerStatus[prayer]) {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const time = prayerData.timings[prayer].split(' ')[0];
        const [hour, minute] = time.split(':').map(Number);
        const prayerTime = hour * 60 + minute;

        if (currentTime < prayerTime) {
            const userConfirmed = await confirmMarking();
        if (!userConfirmed) return;
        }
    }

    const newValue = !prayerStatus[prayer];
    const newPrayerStatus = { ...prayerStatus, [prayer]: newValue };
    let newPrayerCount = prayerCount;

    if (newValue) newPrayerCount += 1;
    else newPrayerCount -= 1;

    if (newPrayerCount === 5) {
        addToStreak(todayDate, streakStorage);
        completedAllAlert();
    } else {
        removeFromStreak(todayDate, streakStorage);
    }

    const newPrayerData = { ...prayerData, status: newPrayerStatus, count: newPrayerCount };
    console.log(newPrayerData)
    console.log("before", await AsyncStorage.getItem(todayDate))
    await AsyncStorage.setItem(todayDate, JSON.stringify(newPrayerData));
    console.log("aFTER", await AsyncStorage.getItem(todayDate))

    setPrayerData(newPrayerData);
    setPrayerStatus(newPrayerStatus);
    setPrayerCount(newPrayerCount);
    };
