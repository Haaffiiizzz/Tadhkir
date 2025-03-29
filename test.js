const today = new Date();
const year = today.getFullYear();
const month = today.getMonth() + 1;
const date = today.getDate();

const formattedDay = date < 10 ? `0${date}` : date;
const formattedMonth = month < 10 ? `0${month}` : month;


const formattedDate = `${formattedDay}-${formattedMonth}-${year}`;

console.log(formattedDate); 
