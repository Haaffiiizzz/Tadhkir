import { Text, View, StyleSheet, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDaysList } from '@/utils/Helper';

export default function MoreTimings() {
  const [monthStorage, setMonthStorage] = useState<Array<any> | null>([]);
  const year = new Date().getFullYear();

  useEffect(() => {
    const fetchStorage = async () => {
      const storedValue = await AsyncStorage.getItem("monthStorage");
      if (storedValue) {
        const storage = JSON.parse(storedValue);
        setMonthStorage(storage);
      }
    };
    fetchStorage();
  }, []);

  const [daysPerMonth, setDaysPerMonth] = useState<Record<number, string[]>>({});

  useEffect(() => {
    if (monthStorage?.length) {
      const newDaysPerMonth: Record<number, string[]> = {};
      monthStorage.forEach((month: number) => {
        const monthList = getDaysList(month, year);
        newDaysPerMonth[month] = monthList;
      });
      setDaysPerMonth(newDaysPerMonth);
    }
  }, [monthStorage]);

  return (
    <ScrollView style={styles.container}>
      {Object.entries(daysPerMonth).map(([month, days]) => (
        <View key={month} style={styles.monthContainer}>
          <Text style={styles.monthTitle}>Month: {month}</Text>
          {days.map((day) => (
            <Text key={day} style={styles.dayText}>
              Day: {day}
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F9F9F9',
  },
  monthContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center"
  },
  monthTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    color: '#333',
  },
  dayText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#555',
    paddingVertical: 2,
  },
});