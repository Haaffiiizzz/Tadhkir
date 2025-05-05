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

export async function initializeMonthStorage (month){ //function to set a new storage for all the months we've had so far 
    //it is called from index at the first start of the app or after clearing data. 

    let newMonthStorage = [month];
    console.log("new month init", newMonthStorage)
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

export async function getPrayerTimes(latitude, longitude) {
    //first I'll construct the date format Aladhan API uses. To get a month's data, I need to pass in the year/month.  

    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1 // month is indexed starting at 0.

    await AsyncStorage.setItem('year', year.toString())
    await AsyncStorage.setItem('month', month.toString()) // store year and month so we can check in index page if month changed so we get new day
    console.log("Saved the month from start")
    
    const formattedDate = year + "/" + month

    // next I'll construct the api url to make the call to using date, inputted latitude and longitude. All queries used can be found on Aladhan documentation.
    const apiUrl = `https://api.aladhan.com/v1/calendar/${formattedDate}?latitude=${latitude}&longitude=${longitude}&method=2&shafaq=general&calendarMethod=HJCoSA`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok){
            const defaultResult = require('./defaultResult.json');
            
            return defaultResult.data  // this is fall back data I'm using in case something goes wrong with the api connection.
            //with time, I'll make this another call to a different api instead!
        }

        const resultJSON = await response.json()
        const monthPrayerData = resultJSON.data
        return monthPrayerData

    } catch (error) {
        const defaultResult = require('./defaultResult.json');
        return defaultResult.data
    }
    
}

export async function setUpPrayerStorage(monthPrayerData) {
    // we are going to loop through each day in the prayer data, create an object for it and store in asyncstorage. 

    monthPrayerData.forEach(async dayObject => {
        let newDayObject = {} // this is the object that will be stored in asyncstorage following the format stated earlier. 
        let date = dayObject.date.gregorian.date // the date in DD-MM-YYYY format which will serve as key directly in asyncstorage to get the day's object. 

        let prayerTimings = dayObject.timings;
        let dayStatus = {'Fajr': false, 'Dhuhr': false, 'Asr': false, 'Maghrib': false, 'Isha': false} // default for each day
        let count = 0

        newDayObject['timings'] = prayerTimings
        newDayObject['status'] = dayStatus
        newDayObject['count'] = count

        newDayObject = JSON.stringify(newDayObject)

        await AsyncStorage.setItem(date, newDayObject)
        
    });

}

export async function prayerStorageMain(latitude, longitude) {

    const monthPrayerData = await getPrayerTimes(latitude, longitude)
    await setUpPrayerStorage(monthPrayerData)
}

// export default prayerStorageMain; initializeMonthStorage;