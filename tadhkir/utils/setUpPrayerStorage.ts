/**In the first function, prayer data for current month will be retrieved. This data will then be passed into the second function for cleaning and storage.  
 * 
 * The second function is going to setup the storage for prayer times, including the status for each prayer and the number of prayers completed
 * Each day can be accessed (directly from asyncstorage) through its date in the format DD-MM-YYYY.
 * For each date, there will be a json dict in asyn storage of the format:
 * {'timings': {'Fajr': '05:00', 'Dhuhr': '12:00', 'Asr': '15:00', 'Maghrib': '18:00', 'Isha': '20:00'},
 * 'status': {'Fajr': false, 'Dhuhr': false, 'Asr': false, 'Maghrib': false, 'Isha': false},
 * 'count': 0}
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

export async function initializeMonthStorage (month){ //function to set a new storage for all the months we've had so far 
    //it is called from index at the first start of the app or after clearing data. 
    //it stores a list with only one item for now (the currebnt onth at start of app)

    let newMonthStorage = [month];
    await AsyncStorage.setItem("monthStorage", JSON.stringify(newMonthStorage))
}

export async function addMonthToMonths(month){ //function to add a new month to the month storage list. It is called from index
    //once a new month is detected
    let monthStorage = await AsyncStorage.getItem("monthStorage");
    monthStorage = monthStorage ? JSON.parse(monthStorage) : [];

    if (!monthStorage.includes(month)) { 
        monthStorage.push(month);
    } 
    await AsyncStorage.setItem("monthStorage", JSON.stringify(monthStorage));
}

export async function getPrayerTimes(latitude, longitude, passedMonth: Number = 0) {
    //first I'll construct the date format Aladhan API uses. To get a month's data, I need to pass in the year/month.  
    const today = new Date()
    const year = today.getFullYear()
    let month = passedMonth; 

    if (passedMonth === 0){
        
        month = today.getMonth() + 1 // month is indexed starting at 0.
    }
    

    await AsyncStorage.setItem('currentYear', year.toString())
    await AsyncStorage.setItem('currentMonth', month.toString()) // store year and month so we can check in index page if month changed so we get new day
    
    const formattedDate = year + "/" + month

    // next I'll construct the api url to make the call to using date, inputted latitude and longitude. All queries used can be found on Aladhan documentation.
    const apiUrl = `https://api.aladhan.com/v1/calendar/${formattedDate}?latitude=${latitude}&longitude=${longitude}&method=2&shafaq=general&calendarMethod=HJCoSA`;
     
    let response;
    try {
        response = await fetch(apiUrl);
    } catch (error) {
        const defaultResult = require('./defaultResult.json');
        console.error("DETAILED fetch error:", JSON.stringify(error));
    }

    if (!response.ok){
        const defaultResult = require('./defaultResult.json');
        
        return defaultResult.data  // this is fall back data I'm using in case something goes wrong with the api connection.
        //with time, I'll make this another call to a different api instead!
    }

    const resultJSON = await response.json()
    const monthPrayerData = resultJSON.data
    return monthPrayerData
    
}

export async function setUpPrayerStorage(monthPrayerData) {
    // we are going to loop through each day in the prayer data, create an object for it and store in asyncstorage. 

    monthPrayerData.forEach(async dayObject => {
        let newDayObject = {} // this is the object that will be stored in asyncstorage following the format stated earlier. 
        let date = dayObject.date.gregorian.date // the date in DD-MM-YYYY format which will serve as key directly in asyncstorage to get the day's data object. 

        let prayerTimings = dayObject.timings;
        let dayStatus = {'Fajr': false, 'Dhuhr': false, 'Asr': false, 'Maghrib': false, 'Isha': false} // default for each day
        let count = 0

        newDayObject['timings'] = prayerTimings
        newDayObject['status'] = dayStatus
        newDayObject['count'] = count

        await AsyncStorage.setItem(date, JSON.stringify(newDayObject))
        
    });
}

export async function getAndStoreLocationName(latitude, longitude){
    // function to get the human understandabl location info using latitude and longitude; also store longitude and latitude
    await AsyncStorage.setItem("latitude", latitude)
    await AsyncStorage.setItem("longitude", longitude)
    const addressArray = await Location.reverseGeocodeAsync({ latitude: Number(latitude), longitude: Number(longitude) });
    await AsyncStorage.setItem("Address", JSON.stringify(addressArray))

    if (addressArray.length > 0) {
      const address = addressArray[0];
      const city = address.city || address.subregion || 'Unknown city';
      const region = address.region || '';
      await AsyncStorage.setItem("city", city)
      await AsyncStorage.setItem("region", region)
    } 
    
}

export async function storeTimeOffset(){
    /**
     * Function to store default offset for notifications in minutes
     */
    const prayers = [
        'Fajr',
        'Dhuhr',
        'Asr',
        'Maghrib',
        'Isha'
    ];
    const defaultOffset = 5;

    prayers.map(async (prayer) => {
        const storageKey = `${prayer}Offset`;
        await AsyncStorage.setItem(storageKey, defaultOffset.toString())
    })

}

export async function setupStreakStorage (){
    let newObject = {};
    await AsyncStorage.setItem("streakStorage", JSON.stringify(newObject))
    await AsyncStorage.setItem("maxStreak",  "0")

}

export async function prayerStorageMain(latitude, longitude) {
    const monthPrayerData = await getPrayerTimes(latitude, longitude)
    await getAndStoreLocationName(latitude, longitude)
    await storeTimeOffset()
    await setUpPrayerStorage(monthPrayerData)
    await setupStreakStorage()
}

export async function locationFromSettings(latitude, longitude){
    const monthPrayerData = await getPrayerTimes(latitude, longitude)
    await getAndStoreLocationName(latitude, longitude)
    await setUpPrayerStorage(monthPrayerData)


}

// export default prayerStorageMain; initializeMonthStorage;