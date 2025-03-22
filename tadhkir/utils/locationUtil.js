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

    const formattedToday = yyyy + "/" + mm ;

    // new = "https://api.aladhan.com/v1/calendar/2025/1?latitude=51.5194682&longitude=-0.1360365&method=2&shafaq=general&calendarMethod=HJCoSA" 

    const apiUrl = `https://api.aladhan.com/v1/calendar/${formattedToday}?latitude=${latitude}&longitude=${longitude}&method=2&shafaq=general&calendarMethod=HJCoSA`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const data = await response.json();

        return data.data;

    } catch (error) {
        console.error(error.message);
    }
}

(async () => {
    console.log(await getPrayerTimes(-15.82944, -65.89028));
})();
// export default getPrayerTimes;