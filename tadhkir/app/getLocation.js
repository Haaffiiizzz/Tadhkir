async function getPrayerTimes(latitude, longitude) {
    /**
     * Using the Aladhan API, this function makes a call to get the prayer time for a specific location using the latitude and longitude.
     */

    // first Ill construct the date
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    const formattedToday = dd + '-' + mm + '-' + yyyy;

    const apiUrl = `https://api.aladhan.com/v1/timings/${formattedToday}?latitude=${latitude}&longitude=${longitude}&method=2&shafaq=general&tune=5%2C3%2C5%2C7%2C9%2C-1%2C0%2C8%2C-6&timezonestring=UTC&calendarMethod=UAQ`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const data = await response.json();
        // let allDays = [];
        // data["data"].forEach(element => {
        //     let dayData = {
        //         timings: element.timings,
        //         date: element.date.readable
        //     };
        //     allDays.push(dayData);
        // }); THIS IS FOR WHEN I WAS GETTING MULTIPLE DAYS (ONE MONTH)

        return data.data;

    } catch (error) {
        console.error(error.message);
    }
}

// getPrayerTimes(-15.82944, -65.89028);
export default getPrayerTimes;