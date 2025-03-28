import AsyncStorage from '@react-native-async-storage/async-storage';

async function setPrayerCount(prayerDay){
    // We'll initialize all prayers for said day to be false and store in asyncstorage

    let dayPrayers = {"Fajr": false, "Dhuhr": false, "Asr": false, "Maghrib": false, "Isha": false};
    await AsyncStorage.setItem(prayerDay, JSON.stringify(dayPrayers)); // save each prayer as false. once user clicks on checkmark, it'll be changed to true.
    
}


export default setPrayerCount;