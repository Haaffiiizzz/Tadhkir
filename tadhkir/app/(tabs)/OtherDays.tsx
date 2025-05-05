import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';

/**
 * In this page, there will be a link to each day in the month and each link will lead to a
 * page that looks like the landing page except its going to be showing data for the linked date.
 * 
 */

// need to add other months feature next
///need to add year to month storage

export default function MoreTimes() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const todaysDate = today.getDate()

  const [monthStorage, setMonthStorage] = useState<Array<any> | null>([]); // list for months data has been gotten for. 
 

  useEffect(() => {
    const fetchStorage = async () => {
      const storedValue = await AsyncStorage.getItem("monthStorage")
      if (storedValue) {
        const storage = JSON.parse(storedValue)
        setMonthStorage(storage)
      }
    }
    fetchStorage()
  }, [])

  const getDaysList = function(month: number) {
    // creating the dates list here which will be mapped to display the links
    // number of days will depend on current month
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

  const [daysPerMonth, setDaysPerMonth] = useState<Record<number, string[]>>({});
  const [countPerMonth, setCountPerMonth] = useState<Record<number, number[]>>({});

  useEffect(() => {
    if (monthStorage?.length) {
      const newDaysPerMonth: Record<number, string[]> = {};
      monthStorage.forEach((month: number) => {
        const monthList = getDaysList(month);
        newDaysPerMonth[month] = monthList;
      });
      setDaysPerMonth(newDaysPerMonth);
    }
  }, [monthStorage]);

  const getCounts = async (days: Record<number, string[]>) => {
    const newCountPerMonth: Record<number, number[]> = {};
    await Promise.all(
      Object.keys(days).map(async (monthKey) => {
        const month = Number(monthKey);
        const monthList = days[month];
        const countsArray = await Promise.all(
          monthList.map(async (day: string) => {
            let dayData = await AsyncStorage.getItem(day);
            dayData = dayData ? JSON.parse(dayData) : null;
            return dayData && typeof dayData === 'object' && 'count' in dayData
              ? (dayData as { count: number }).count
              : 0;
          })
        );
        newCountPerMonth[month] = countsArray;
      })
    );
    setCountPerMonth(newCountPerMonth);
  };

  useFocusEffect(React.useCallback(() => {
    getCounts(daysPerMonth);
  }, [daysPerMonth]));


  const colorDict: Record<number, string> = {
    1: "#ff3333",
    2: "#bf4000",
    3: "#7f7f00",
    4: "#40bf00",
    5: "#0f0"
  } //colors from red to green to show prayer statuses

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle =  {{alignItems: "center"}}>
        <Text style={styles.text}>{today.toLocaleString('default', {month: 'long'})}</Text>
        <Text>Months so far {monthStorage ? monthStorage.length : 0} PRint: --{monthStorage}--</Text>

        {
          Object.keys(countPerMonth).map((month) => {
            const daysList = daysPerMonth[month];
            const daysCounts = countPerMonth[month];
            return (
              <View style={styles.daysContainer} key={month}>
                {daysList && daysCounts ? (
                  daysList.map((day, dayIndex: number) => {
                    const dayCount = daysCounts[dayIndex] ?? 0;
                    const backgroundColor = colorDict[dayCount] || "#ccc";
                    const date =  +day.slice(0, 2) // day is a string of an actuyal date month year so need to slice to get just the day
                    let link = (date !== todaysDate) ? `../OtherDay?key=${dayIndex + 1}&date=${day}` : "(tabs)/"
      
                    return (
                      <View style={[styles.daysListsItem, { backgroundColor }]} key={day}>
                        <Link href={link} style={{ width: '100%', textAlign: 'center' }}>
                          <Text style={styles.daysListsItemText}>{day.split("-")[0]}</Text>
                        </Link>
                      </View>
                    );
                  })
                ) : (
                  <Text style={styles.text}>Loading...</Text>
                )}
              </View>
            );
          })
        }
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: "center",
    flexDirection: "row"
  },

  scrollContainer: {
    flex: 1,
    width: '100%',
    
  },

  daysContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 15,
    columnGap: 10,
    padding: 10,
    // borderColor: "blue",
    // borderWidth: 2, // Added visible border for the days container as well
    justifyContent: "center",
    width: "90%"
  },

  text: {
    color: '#fff',
    fontSize: 24,
    marginVertical: 20,
    alignSelf: 'center',
  },

  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },

  daysListsItem: {
    fontWeight: 'bold',
    backgroundColor: '#50584e',
    padding: 10,
    alignItems: 'center',
    width: 50,
    borderRadius: 10,
    color: '#fff',
    fontSize: 16,
    justifyContent: 'center',
    // Added drop shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  daysListsItemText: {
    color: '#fff',
    fontSize: 16,
    alignSelf: 'center',
  },
});