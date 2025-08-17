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

  const [daysData, setDaysData] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const fetchDaysData = async () => {
      const allDays = Object.values(daysPerMonth).flat();
      const entries: [string, string | null][] = await Promise.all(
        allDays.map(async (day) => [day, await AsyncStorage.getItem(day)])
      );
      setDaysData(Object.fromEntries(entries));
    };
    if (Object.keys(daysPerMonth).length > 0) {
      fetchDaysData();
    }
  }, [daysPerMonth]);

  return (
    <ScrollView style={styles.container}>
      {Object.entries(daysPerMonth).map(([month, days]) => {
        const monthName = new Date(year, Number(month) - 1).toLocaleString('default', { month: 'long' });
        return (
        <View key={month} style={styles.monthContainer}>
          <Text style={styles.monthTitle}>{monthName}</Text>
          {days.map((day) => (
            
            <View key={day} style={styles.dayContainer}>
              <Text style={styles.dayText}>
                {day} 
              </Text>

              { daysData && (
                <View>
                  <Text style={styles.prayerText}>
                    Fajr: {(JSON.parse(daysData[day])["timings"]["Fajr"])}
                  </Text>
                  <Text style={styles.prayerText}>
                    Sunrise: {(JSON.parse(daysData[day])["timings"]["Sunrise"])}
                  </Text>
                  <Text style={styles.prayerText}>
                    Dhuhr: {(JSON.parse(daysData[day])["timings"]["Dhuhr"])}
                  </Text>
                  <Text style={styles.prayerText}>
                    Asr: {(JSON.parse(daysData[day])["timings"]["Asr"])}
                  </Text>
                  <Text style={styles.prayerText}>
                    Maghrib: {(JSON.parse(daysData[day])["timings"]["Maghrib"])}
                  </Text>
                  <Text style={styles.prayerText}>
                    Isha: {(JSON.parse(daysData[day])["timings"]["Isha"])}
                  </Text>
                  </View>
              )}
              

            </View>
          ))}
        </View>)
        
      })}
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
    alignItems: "center",
  },
  monthTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 12,
    color: '#222',
    textTransform: 'uppercase',
  },
  dayContainer: {
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    alignItems: "flex-start",
    marginBottom: 20,
    padding: 16,
    width: "100%",
  },
  dayText: {
    fontSize: 16,
    fontWeight: "600",
    color: '#1E293B',
    marginBottom: 8,
  },
  prayerText: {
    fontSize: 15,
    color: '#334155',
    marginBottom: 6,
    lineHeight: 22,
  },
});
