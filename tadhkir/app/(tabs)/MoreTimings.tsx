import { Text, View, StyleSheet, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDaysList } from '@/utils/Helper';
import { useTheme } from '../contexts/ThemeContext';

export default function MoreTimings() {
  const [monthStorage, setMonthStorage] = useState<Array<any> | null>([]);
  const year = new Date().getFullYear();
  const {colors, theme} = useTheme()

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

  const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.background, // light neutral
    paddingTop: 50,
  },
  
  monthContainer: {
    marginBottom: 28,
    padding: 16,
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  monthTitle: {
    fontWeight: "700",
    fontSize: 22,
    marginBottom: 16,
    color: colors.text, 
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  dayContainer: {
    borderRadius: 12,
    backgroundColor: colors.sectionBackground,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
    alignItems: "flex-start",
    marginBottom: 16,
    padding: 16,
    width: "100%",
    borderLeftWidth: 4,
    borderColor: colors.sectionBorder,
    borderLeftColor: colors.accent, // ✅ now from theme
  },
  dayText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text, // ✅ consistent
    marginBottom: 10,
  },
  prayerText: {
    fontSize: 15,
    color: colors.subText, // ✅ softer secondary color
    marginBottom: 8,
    lineHeight: 22,
  },
});


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
                {monthName} {day.split("-")[0]} 
              </Text>

              {daysData && (() => {
              const raw = daysData[day];
              if (!raw) {
                return <Text style={styles.prayerText}>No data available.</Text>;
              }
              let parsed;
              try {
                parsed = JSON.parse(raw);
              } catch (e) {
                return <Text style={styles.prayerText}>Invalid data format.</Text>;
              }
              if (!parsed?.timings) {
                return <Text style={styles.prayerText}>Timings not found.</Text>;
              }
              return (
                <View>
                  <Text style={styles.prayerText}>
                    Fajr: {parsed.timings.Fajr ? parsed.timings.Fajr.split(" ")[0] : "N/A"}
                  </Text>
                  <Text style={styles.prayerText}>
                    Sunrise: {parsed.timings.Sunrise ? parsed.timings.Sunrise.split(" ")[0] : "N/A"}
                  </Text>
                  <Text style={styles.prayerText}>
                    Dhuhr: {parsed.timings.Dhuhr ? parsed.timings.Dhuhr.split(" ")[0] : "N/A"}
                  </Text>
                  <Text style={styles.prayerText}>
                    Asr: {parsed.timings.Asr ? parsed.timings.Asr.split(" ")[0] : "N/A"}
                  </Text>
                  <Text style={styles.prayerText}>
                    Maghrib: {parsed.timings.Maghrib ? parsed.timings.Maghrib.split(" ")[0] : "N/A"}
                  </Text>
                  <Text style={styles.prayerText}>
                    Isha: {parsed.timings.Isha ? parsed.timings.Isha.split(" ")[0] : "N/A"}
                  </Text>
                </View>
              );
              })()}
            </View>
          ))}
        </View>)
        
      })}
    </ScrollView>
  );
}

