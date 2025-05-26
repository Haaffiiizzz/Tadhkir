const GetDateFormat = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();


    const formattedDay = date < 10 ? `0${date}` : date;
    const formattedMonth = month < 10 ? `0${month}` : month;
    const todayDate = `${formattedDay}-${formattedMonth}-${year}`; //basically getting the string format for the current day. this serves as the key to get data for the particular day from aysncstorage.
   return todayDate
};

export default GetDateFormat;