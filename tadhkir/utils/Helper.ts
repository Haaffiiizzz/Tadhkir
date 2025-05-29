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