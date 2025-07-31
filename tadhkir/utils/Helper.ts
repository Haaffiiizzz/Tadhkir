/**
 * One file to store small, unrelated helper functions
 */

import { QrCode } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GetNewMonthData } from "./IndexHelpers";

export function GetDateFormat (){
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();

    const formattedDay = date < 10 ? `0${date}` : date;
    const formattedMonth = month < 10 ? `0${month}` : month;
    const todayDate = `${formattedDay}-${formattedMonth}-${year}`; //basically getting the string format for the current day. this serves as the key to get data for the particular day from aysncstorage.
   return todayDate
};

export function get12HourTimeString (time: string) {
        // this function takes in a time string in 24hour format 22:04 and returns the time in a 12 hour format.
        let timeHour = +time.split(':')[0];
        let timeMin = time.split(':')[1];
        if (timeHour > 12) {
            timeHour = timeHour - 12;
            time = timeHour + ':' + timeMin + ' PM';
        } else {
            time = timeHour + ':' + timeMin + ' AM';
        }
        return time
};

export function getDaysList (month: number, year: number) {
    // creating the dates list here which will be mapped to display the links
    // number of days will depend on current month
    // each item in the list is of the format 24-02-2025

    const thirty = [9, 4, 6, 11] //sept, april, jun, nov
    let limit = 32 // i want to start indexing at one                                                                                  
    if (month === 2){
      limit = 29
    } else if (thirty.includes(month)) {
      limit = 31
    }

    let daysList = []

    for (let i = 1; i < limit; i++){
      const formattedDay = i < 10 ? `0${i}` : i;
      const formattedMonth = month < 10 ? `0${month}` : month;
      const date = `${formattedDay}-${formattedMonth}-${year}`;
      daysList.push(date)
    }

    return daysList
  };

export async function checkDaysBeforeLatestNotification(){
  /**
   * Given the current day and the day latest (furthest) day for which notifications have been set,
   * this function will check how many advanced days of notification we already have and return it. 
   */

    let latestDate = await AsyncStorage.getItem("LatestNotificationScheduled") || "";
    if (!latestDate){
      return 0
    }

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0); //cos if comparing say 10 am of one day to 3pm of another day difference might be more than one day or less if opposite
    
    const [latestDay,latestMonth, latestYear] = latestDate.split('-').map(Number);

    const latestDateObject = new Date(latestYear, latestMonth - 1, latestDay);
    latestDateObject.setHours(0, 0, 0, 0);

    const diffInMs = latestDateObject.getTime() - todayDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    return diffInDays > 0 ? diffInDays : 0;
}

export async function daysToSchedule(daysAdvance: number = 0){
 /**
  * Given the days of advance we have and the latest day scheduled, here we can decide how many more days to schedule
  * and return a list of those days.
  */
  let startDate;
  let daysNeeded;

  if (daysAdvance <= 0){
    startDate = new Date()
    daysNeeded = 5
  }

  else {
    // Parse latestScheduled date string (format: dd-mm-yyyy)
    let latestDate = await AsyncStorage.getItem("LatestNotificationScheduled") || "";
    const [latestDay, latestMonth, latestYear] = latestDate ? latestDate.split('-').map(Number): [null, null, null];
    const latestDateObject = latestDay && latestMonth && latestYear ? new Date(latestYear, latestMonth - 1, latestDay): null;
    daysNeeded = 5 - daysAdvance

    if (!latestDateObject){
      startDate = new Date()
      
    }
    else {
      startDate = latestDateObject
      startDate.setDate(startDate.getDate() + 1)
    }
    
  }
  
  if (daysNeeded <= 0) return [];
  const newDays: string[] = [];
  
  // Schedule additional days starting from the day start date i.e either current day(today) or latest scheduled date. 
  let currentDataMonth = startDate.getMonth() + 1;
  for (let i = 0; i < daysNeeded; i++){

      const thisMonth = startDate.getMonth() + 1;
      if (thisMonth !== currentDataMonth) {
        await GetNewMonthData(thisMonth); // Fetch data for new month
        currentDataMonth = thisMonth;
      }
      
      
      const currentDay = startDate.getDate(); 
      const currentMonth = startDate.getMonth() + 1;
      const formattedDay = currentDay < 10 ? `0${currentDay}` : currentDay;
      const formattedMonth = currentMonth < 10 ? `0${currentMonth}` : currentMonth;
      const dateStr = `${formattedDay}-${formattedMonth}-${startDate.getFullYear()}`;
      newDays.push(dateStr);
      startDate.setDate(startDate.getDate() + 1); // move to next day
  }
  // we are going to store this list of days so we can retrieve and use to cancel notifications later
  await AsyncStorage.setItem("NewNotificationDaysList", JSON.stringify(newDays))
  return newDays;
}