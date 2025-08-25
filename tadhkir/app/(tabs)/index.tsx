import React, { useEffect, useState, useRef} from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableWithoutFeedback, Alert, Button, Appearance} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {prayerStorageMain, initializeMonthStorage, addMonthToMonths} from "../../utils/setUpPrayerStorage"
import scheduleAllNotifications from "../../utils/NotificationsManager"
import {useFonts} from 'expo-font'
import { Sunrise, Sun, SunMedium, Clock, Sunset, Moon } from "lucide-react-native";
import { GetDateFormat, get12HourTimeString, checkDaysBeforeLatestNotification, daysToSchedule } from '@/utils/Helper';
import * as Notifications from "expo-notifications";
import { useTheme } from '../contexts/ThemeContext';
import BackgroundFetch from "react-native-background-fetch";
import { CheckMonth, GetBasicUserData, handleValueChange } from '@/utils/IndexHelpers';


/**
 * This is basically the index / home page. In this page, the current day is shown and the prayers for the day are displayed.
 * Users can make each prayer as done once done. The next prayer for the day is also highlighted for users.
 * 
 * BackEnd: In this page, we first check if we are in a new month and if so, get data for the month.
 * 
 * Else, it'll redirect to the required pages to get these data.
 * 
 */


const HomePage = () => {
  //FIRST SET CONSTANTS
    const [fontsLoaded, fontError] = useFonts({
        "DS-DIGII" : require('../../assets/fonts/DS-DIGIB.ttf')
    })
    const router = useRouter();
    const [firstName, setFirstName] = useState<string | null>(null);
    const [city, setCity] = useState<string | null>(null);
    const [region, setRegion] = useState<string | null>(null);
    const [latitude, setLatitude] = useState<string | null>(null);
    const [timeFormat, setTimeFormat] = useState<string | null>(null);
    const [prayerData, setPrayerData] = useState< any | null>(null);
    const [prayerStatus, setPrayerStatus] = useState< any | null >(null);
    const [prayerCount, setPrayerCount] = useState< any | null>(null)
    const [nextPrayer, setCurrentPrayer] = useState<string | null>(null);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [streakStorage, setStreakStorage] = useState<object | null>(null)
    const {colors, theme} = useTheme()
    const [NotificationPermission, setNotificationPermision] = useState< any | null>(null);
    

    const getBasicData = async() => {
      /**
       * This function calls GetBasicUserData in IndexHelper.tsx to get user data if saved. 
       */
      const [storedFirstName, storedCity, storedRegion, storedLatitude, storedTimeFormat] = await GetBasicUserData()
      setFirstName(storedFirstName);
      setCity(storedCity);
      setRegion(storedRegion);
      setLatitude(storedLatitude);
      setTimeFormat(storedTimeFormat);
    }


    //USE-EFFECT TO CALL USER DATA FUNCTION 
    useFocusEffect(
        React.useCallback(() => {
          const loadAllData = async () => {
            await getBasicData(); //from '@/utils/IndexHelpers'
            setDataLoaded(true);
            // now safe to evaluate redirect
          };
          loadAllData();
        }, [])
      );
      
    
    // here I am checking if name or location has not been stored.
    //if they haven't, then we redirect to the neccessary pages to get those info
    
    //CHECK IF NAME AND LOCATION ALREADY STORED ELSE REDIRECT TO NAME/LOCATION PAGES
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
      
        if (!dataLoaded) return;
      
        (async () => {
          const monthStorage = await AsyncStorage.getItem('monthStorage');
      
          if (!firstName) {
            if (!monthStorage) {
              await initializeMonthStorage(month); //FROM SETUPUSERSTORAGE
            }
            timer = setTimeout(() => {
              router.push('../GetUserInfo');
            }, 0);
          } else if (!latitude) {
            timer = setTimeout(() => {
              router.push('../GetUserLocation');
            }, 0);
          }
        })();
      
        return () => {
          if (timer) clearTimeout(timer);
        };
      }, [dataLoaded, firstName, latitude]);
      

    const today = new Date();
    const month = today.getMonth() + 1;

    useEffect(() => {
        (async () => {
            // incase we enter a new month, we need to get new month data from the api. 
            //Notice this means having new dicts for new days i.e old data is still available.
            await CheckMonth(); //FROM INDEXHELPER.TSX
        })();
    }, [month]);
    
    //going to add background task below here once we've gotten all data needed
    useEffect(() => {
      const initBackgroundFetch = async () => {
        const onEvent = async (taskId: string) => {
          console.log('[BackgroundFetch] task:', taskId);
          // Do your background work here
          const daysAhead = await checkDaysBeforeLatestNotification()

          if (daysAhead < 4) {
            const daysToScheduleList = await daysToSchedule(daysAhead)
            await scheduleAllNotifications(daysToScheduleList);
          }
          BackgroundFetch.finish(taskId);
        };

        const onTimeout = async (taskId: string) => {
          console.warn('[BackgroundFetch] TIMEOUT task:', taskId);
          BackgroundFetch.finish(taskId);
        };

        const status = await BackgroundFetch.configure(
          { minimumFetchInterval: 15 }, // in minutes
          onEvent,
          onTimeout
        );

        if (status === BackgroundFetch.STATUS_AVAILABLE) {
  BackgroundFetch.start();
}


        console.log('[BackgroundFetch] configure status:', status);
      };

      initBackgroundFetch();
    }, []);

    //RETRIEVING PRAYER DATA
    const getPrayerData = async () => {
        try {
            let storedPrayerData = await AsyncStorage.getItem(todayDate);
            
            if (storedPrayerData) {
                storedPrayerData = JSON.parse(storedPrayerData)
                setPrayerData(storedPrayerData);
                if (storedPrayerData){
                    setPrayerStatus(storedPrayerData.status)
                    setPrayerCount(storedPrayerData.count)
                }
            }
        } catch (error) {
            console.error('Error retrieving prayer data:', error);
            setPrayerData(null);
        }
    };

    //USEEFFECT TO LOAD PRAYER DATA FOR THE DAY
    useFocusEffect(
        React.useCallback(() => {
          const loadAllData = async () => {
            await getPrayerData();
            
          };
          loadAllData();
        }, [])
      );
    
    //REQUEST NOTIFICATION PERMISSION
    useEffect(() => {
      /**
       * We need to make sure we get permissions to send notifications on the start of the app. 
       * ANd then schedule notifications. 
       */
      const registerForNotifications = async () => {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
          const { status: newStatus } = await Notifications.requestPermissionsAsync();
          if (newStatus !== 'granted') {
            console.warn('Notification permissions not granted!');
          }
        }
        setNotificationPermision(status)
      };

      registerForNotifications();
    }, []);


    const todayDate = GetDateFormat()
    
    const getStreakStorage = async () => {
        let streakStorageIn = await AsyncStorage.getItem("streakStorage")
        streakStorageIn = JSON.parse(streakStorageIn)
        setStreakStorage(streakStorageIn)
    }

    useFocusEffect(React.useCallback(() => {
            getStreakStorage()
        }, []))
   
    //FUNCTION TO DETERMINE UPCOMING PRAYER
    const determineCurrentPrayer = () => {
            if (!prayerData) return;
    
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes
    
            let nextPrayer = null;
            for (const prayer of prayers) {
                const time = prayerData.timings[prayer].split(' ')[0];
                const [hour, minute] = time.split(':').map(Number);
                const prayerTime = hour * 60 + minute;
    
                if (currentTime <= prayerTime) {
                    if (prayer !== "Sunrise"){
                        nextPrayer = prayer;
                        break
                    }
                } 
            }
    
            setCurrentPrayer(nextPrayer);
        };
    
    
    useEffect(() => {
        determineCurrentPrayer();
    }, [prayerData]);

    const prayers = [
        'Fajr',
        'Sunrise',
        'Dhuhr',
        'Asr',
        'Maghrib',
        'Isha'
    ];

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
        }).start();
    }, []);
    
    const prayerIcons = [Sunrise, Sun, SunMedium, Clock, Sunset, Moon];
    const prayerColors = ["#38bdf8", "#f97316", "#facc15", "#fb923c", "#f43f5e", "#6366f1"];

    //SCHEDULING NOTIFICATIONS
    useEffect(() => {

        if (!dataLoaded || NotificationPermission !== "granted") return;
        
        (async () => {
            const daysAhead = await checkDaysBeforeLatestNotification()

            if (daysAhead < 4) {
              const daysToScheduleList = await daysToSchedule(daysAhead)
              console.log(daysToScheduleList)
              await scheduleAllNotifications(daysToScheduleList);
              console.log("Scheduled all notifications!")
            } else {
              console.log("already scheduled ")
            }
        })();
    }, [dataLoaded, NotificationPermission])

    //styling 
  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    flexDirection: "column",
    paddingTop: "20%",
  },
  header: {
    color: colors.text,
    fontSize: 35,
    fontWeight: "bold",
    alignSelf: "center",
    marginTop: 20,
  },
  smallHeader: {
    color: colors.text,
    fontSize: 25,
    fontWeight: "bold",
    alignSelf: "center",
    marginTop: 20,
    textAlign: "center",
  },
  salahItem: {
    backgroundColor: colors.salahItem,
    margin: 10,
    height: 100,
    width: 350,
    borderRadius: 10,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 22,
    marginRight: 22,
  },
  salahText: {
    color: colors.salahText,
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 5,
  },
  salahTime: {
    color: colors.salahText,
    fontSize: 35,
    fontFamily: "DS-DIGII",
  },
  nextPrayerHighlight: {
    borderWidth: 4,
    borderColor: colors.nextPrayerBorder,
  },
  donePrayer: {
    backgroundColor: colors.donePrayer,
  },
  iconWrapper: {
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});    

return (
  <ScrollView
    style={styles.container}
    contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}
  >
    <Animated.View style={[styles.infoView, { opacity: fadeAnim }]}>
      {firstName && (
        <Text style={styles.smallHeader}>👋🏼 Hello, {firstName}</Text>
      )}

      {city && region && (
        <Text style={styles.smallHeader}>📍 {city}, {region}</Text>
      )}

      {today && (
        <Text style={[styles.smallHeader]}>
          🗓️ {today.toLocaleString('default', { weekday: 'long' })},{" "}
          {today.toLocaleString('default', { month: 'long' })} {todayDate.split("-")[0]}, {todayDate.split("-")[2]}
        </Text>
      )}
    </Animated.View>

    <Animated.View style={[styles.salahView, { opacity: fadeAnim }]}>
      {prayerData && prayerData.timings
        ? prayers.map((prayer, prayerIndex) => {
            let time = prayerData['timings'][prayer].split(' ')[0]; // Remove timezone if attached
            if (timeFormat == '12h') time = get12HourTimeString(time);

            const isCurrentPrayer = prayer === nextPrayer;
            const isSunrise = prayer === 'Sunrise';
            const PrayerIcon = prayerIcons[prayerIndex];

            
            if (!PrayerIcon) return null;

            const prayerView = (
              <View
                key={prayer}
                style={[
                  styles.salahItem,
                  isCurrentPrayer && styles.nextPrayerHighlight,
                  prayerStatus[prayer] && styles.donePrayer,
                ]}
              >
                <View style={styles.iconWrapper}>
                  <PrayerIcon color={prayerColors[prayerIndex]} />
                </View>

                <Text style={styles.salahText}>{prayer}</Text>
                <Text style={styles.salahTime}>{String(time)}</Text>
              </View>
            );

            // If it's sunrise, show without clickability
            if (isSunrise) return prayerView;

            return (
              <TouchableWithoutFeedback
                key={prayer}
                onPress={async () => await handleValueChange(
                  prayer,
                  prayerStatus,
                  prayerCount,
                  prayerData,
                  todayDate,
                  streakStorage || {},
                  setPrayerData,
                  setPrayerStatus,
                  setPrayerCount,
                )}
                delayLongPress={500}
              >
                {prayerView}
              </TouchableWithoutFeedback>
            );
          })
        : null}
    </Animated.View>

  </ScrollView>
);
};


export default HomePage;