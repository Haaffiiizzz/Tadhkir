import { Text, View, StyleSheet, ScrollView } from 'react-native';
import React, { useState, useEffect, useRef} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDaysList } from '@/utils/Helper';
import { useTheme } from '../contexts/ThemeContext';
import { get12HourTimeString } from '@/utils/Helper';
import {useFocusEffect } from 'expo-router';

export default function MoreTimings() {
  const [monthStorage, setMonthStorage] = useState<Array<any> | null>([]);
  const year = new Date().getFullYear();
  const {colors, theme} = useTheme()

  useEffect(() => {
    /**
     * This function retrieves the list of months stored e.g [1, 2, 3...]
     */
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

  /// ---- refs (same)
  const scrollRef = useRef<ScrollView>(null);
  const monthOffsetsRef = useRef<Record<string, number>>({});
  const dayOffsetsRef = useRef<Record<string, number>>({});  // will store "month:day" -> y
  const didScrollRef = useRef(false);

  // reset when data changes
  useEffect(() => {
    monthOffsetsRef.current = {};
    dayOffsetsRef.current = {};
    didScrollRef.current = false;
  }, [daysPerMonth]);

  // current date parts
  const today = new Date();
  const d = today.getDate();
  const m = today.getMonth() + 1;
  const y = today.getFullYear();
  const pad2 = (n:number) => String(n).padStart(2, "0");

  // days in CURRENT month only
  const monthDays = daysPerMonth?.[m] ?? [];

  // resolve the key that exists in your data
  const targetKey = React.useMemo(() => {
    const set = new Set(monthDays);
    const candidates = [
      `${d}-${m}-${y}`,
      `${pad2(d)}-${pad2(m)}-${y}`,
      `${d}-${m}`,
      `${pad2(d)}-${pad2(m)}`
    ];
    return candidates.find(k => set.has(k));
  }, [monthDays, d, m, y]);

  // optional: choose next upcoming in current month if exact not found
  const fallbackKey = React.useMemo(() => {
    if (!monthDays.length) return undefined;
    const parse = (k:string) => {
      const [dd, mm] = k.split("-").map(Number);
      return { dd, mm };
    };
    const candidates = monthDays
      .map(k => ({ k, ...parse(k) }))
      .filter(x => x.mm === m)  // stay in current month
      .sort((a,b) => a.dd - b.dd);
    const next = candidates.find(x => x.dd >= d) ?? candidates[candidates.length - 1];
    return next?.k;
  }, [monthDays, m, d]);

  const keyToScroll = targetKey ?? fallbackKey;

  // composite key that includes the current month
  const targetCompositeKey = keyToScroll ? `${m}:${keyToScroll}` : undefined;

  const topPadding = 50;


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

  
  const [timeFormat, setTimeFormat] = useState<string | null>(null);

  useFocusEffect( React.useCallback(() => {
    const getTimeFormat = async () => {
      const timeformat = await AsyncStorage.getItem("timeformat");
      setTimeFormat(timeformat);
    };
    getTimeFormat();
  }, []));

  //code below is for scrolling to current day automatically

  

  useEffect(() => {
  const t = setTimeout(() => {
    if (didScrollRef.current || !targetCompositeKey) return;
    const yOffset = dayOffsetsRef.current[targetCompositeKey];
    if (scrollRef.current != null && yOffset != null) {
      didScrollRef.current = true;
      scrollRef.current.scrollTo({ y: Math.max(yOffset - topPadding, 0), animated: true });
    }
  }, 300);
  return () => clearTimeout(t);
}, [daysPerMonth, targetCompositeKey]);




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
    fontSize: 18,
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
    <ScrollView ref={scrollRef} style={styles.container}>
      {Object.entries(daysPerMonth).map(([month, days]) => {
        const monthName = new Date(year, Number(month) - 1).toLocaleString('default', { month: 'long' });

        return (

        <View key={month} 
        style={styles.monthContainer}
        onLayout={(e) => {
            monthOffsetsRef.current[month] = e.nativeEvent.layout.y;
          }}>

          <Text style={styles.monthTitle}>{monthName}</Text>

          {days.map((day) => (
            <View key={`${month}:${day}`} 
            style={styles.dayContainer} 
            // immediate scroll when the day's row lays out
            onLayout={(e) => {
            const monthY = monthOffsetsRef.current[month] ?? 0;
            const dayY = e.nativeEvent.layout.y;
            const absoluteY = monthY + dayY;

            const composite = `${month}:${day}`;   // <— namespace with month
            dayOffsetsRef.current[composite] = absoluteY;

            if (!didScrollRef.current && targetCompositeKey && composite === targetCompositeKey && scrollRef.current) {
              didScrollRef.current = true;
              scrollRef.current.scrollTo({
                y: Math.max(absoluteY - topPadding, 0),
                animated: true,
              });
            }
          }}



            >
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

                const prayers = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

                return (
                  <View>
                    {prayers.map((prayer) => (
                      <Text key={prayer} style={styles.prayerText}>
                        {prayer}: {
                          parsed.timings[prayer]
                            ? (timeFormat === "12h"
                                ? get12HourTimeString(parsed.timings[prayer].split(" ")[0])
                                : parsed.timings[prayer].split(" ")[0])
                            : "N/A"
                        }
                      </Text>
                    ))}
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

