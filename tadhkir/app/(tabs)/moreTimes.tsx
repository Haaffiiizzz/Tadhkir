import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';

export default function MoreTimes() {
  const [prayerTimes, setPrayerTimes] = useState<any | null>(null);


  const getPrayerTimes = async () => {
      const storedPrayerTimes = await AsyncStorage.getItem('prayerTimes');
      if (storedPrayerTimes !== null) {
          setPrayerTimes(JSON.parse(storedPrayerTimes));
      } else {
          setPrayerTimes(null);
      }
  };

  useFocusEffect(
          React.useCallback(() => {
              getPrayerTimes();
          }, [])
      );

  return (
    <View style={styles.container}>
      {/* <Text style={styles.text}>More Times</Text> */}
      <ScrollView style={styles.scrollContainer}>
        {prayerTimes
          ? prayerTimes.map((day, dayIndex) => {
              
              return (
                <View style={styles.daysListsItem} key={day.date.gregorian.date}>
                  <Link href={`../prayerDay?key=${dayIndex+1}&date=${day.date.gregorian.date}`} style={{width: '100%', textAlign: 'center'}}>
                    <Text style={styles.daysListsItemText}>{day.date.readable}</Text>
                  </Link>
                </View>
                
                
              );
            })
          : null}
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