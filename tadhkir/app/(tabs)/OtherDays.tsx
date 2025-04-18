import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';

/**
 * In this page, there will be a link to each day in the month and each link will lead to a
 * page that looks like the landing page except its going to be showing data for the linked date.
 * 
 */

export default function MoreTimes() {
  const [timeFormat, setTimeFormat] = useState<string | null>(null);
  
  const getTimeFormat = async () => {
    const storedTimeFormat = await AsyncStorage.getItem('timeformat');
    setTimeFormat(storedTimeFormat);
  };

  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1


  const getDaysList = function() {
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

  
  const daysList = getDaysList();
  const [daysCounts, setDaysCounts] = useState<number[] | null>(null);

  const getDayCounts = async (daysList: string[]) => {
    //loop through the daysList and get the stored count for each day
    const countsArray = await Promise.all(
      daysList.map(async (day) => {
        let dayData = await AsyncStorage.getItem(day);
        dayData = dayData ? JSON.parse(dayData) : null;
        return dayData ? dayData.count : 0;
      })
    );

    setDaysCounts(countsArray);
  };

  useEffect(() => {
    getDayCounts(daysList);
  }, [daysList]);

  const colorDict: Record<number, string> = {
    1: "#ff3333",
    2: "#bf4000",
    3: "#7f7f00",
    4: "#40bf00",
    5: "#0f0"
  } //colors from red to green to show prayer statuses


  return (
    <View style={styles.container}>
      {/* <Text style={styles.text}>More Times</Text> */}
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.text}>{today.toLocaleString('default', {month: 'long'})}</Text>

        {daysList && daysCounts && daysList.map((day, dayIndex: number) => {

              const dayCount = daysCounts[dayIndex] ?? 0; 
              const backgroundColor = colorDict[dayCount] || "#ccc"; 

              return (
                <View style={[styles.daysListsItem, { backgroundColor }]} key={day}>
                  <Link href={`../OtherDay?key=${dayIndex+1}&date=${day}`} style={{width: '100%', textAlign: 'center'}}>
                    <Text style={styles.daysListsItemText}>{day.split("-")[0]}</Text>
                  </Link>
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
  },

  scrollContainer: {
    width: '100%',
    flex: 1,

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
    marginBottom: 20,
    backgroundColor: '#50584e',
    padding: 10,
    alignItems: 'center',
    width: '50%',
    alignSelf: 'center',
    borderRadius: 10,
    color: '#fff',
    fontSize: 16,
    justifyContent: 'center',
    display: 'flex',
  },

  daysListsItemText: {
    color: '#fff',
    fontSize: 16,
    alignSelf: 'center',
  },
});