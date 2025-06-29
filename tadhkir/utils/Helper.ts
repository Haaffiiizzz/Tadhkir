/**
 * One file to store small, unrelated helper functions
 */

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

export function checkDaysBeforeLatestNotification(todayDate: string, latestDate: string){
  /**
   * Given the current day and the day latest (furthest) day for which notifications have been set,
   * this function will check how many advanced days of notification we already have and return it. 
   */
    const [day1, month1, year1] = todayDate.split('-').map(Number);
    const [day2, month2, year2] = latestDate.split('-').map(Number);

    const date1 = new Date(year1, month1 - 1, day1);
    const date2 = new Date(year2, month2 - 1, day2);

    const diffInMs = date2.getTime() - date1.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    return diffInDays > 0 ? diffInDays : 0;
}

export function daysToSchedule(latestDate:string, daysAdvance: number){
 /**
  * Given the days of advance we have and the latest day scheduled, here we can decide how many more days to schedule
  * and return a list of those days.
  */

  
  // Parse latestScheduled date string (format: dd-mm-yyyy)
  const [latestDay, latestMonth, latestYear] = latestDate ? latestDate.split('-').map(Number): [null, null, null];
  const latestScheduledDate = latestDay && latestMonth && latestYear ? new Date(latestYear, latestMonth - 1, latestDay): null;

  let startDate = new Date();

  let daysNeeded = 0;
  // now we need to check if the latest scheduled date is in the past. if it is, then we definitely need to schedule 5 days.
  // if its in the future, then we need to calculate days needed and start from latest scheduled date. 
  if (!latestScheduledDate || startDate > latestScheduledDate){
    daysNeeded = 5;

  }else{
    daysNeeded = 5 - daysAdvance;
    startDate = new Date(latestScheduledDate.getTime());
    startDate.setDate(startDate.getDate() + 1);

  }
  
  if (daysNeeded <= 0) return [];
  const newDays: string[] = [];
  
  // Schedule additional days starting from the day start date i.e either current day(today) or latest scheduled date. 
  for (let i = 0; i < daysNeeded; i++){
      
      const currentDay = startDate.getDate(); 
      const currentMonth = startDate.getMonth() + 1;
      const formattedDay = currentDay < 10 ? `0${currentDay}` : currentDay;
      const formattedMonth = currentMonth < 10 ? `0${currentMonth}` : currentMonth;
      const dateStr = `${formattedDay}-${formattedMonth}-${startDate.getFullYear()}`;
      newDays.push(dateStr);
      startDate.setDate(startDate.getDate() + 1); // move to next day
  }
  
  return newDays;
}