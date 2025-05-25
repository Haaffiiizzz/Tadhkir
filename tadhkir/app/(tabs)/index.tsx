import React, { useEffect, useState, useRef} from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableWithoutFeedback, Alert, Platform} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {prayerStorageMain, initializeMonthStorage, addMonthToMonths} from "../../utils/setUpPrayerStorage"
import scheduleNotification from "../../utils/NotificationsManager"
import * as SplashScreen from 'expo-splash-screen';
import {useFonts} from 'expo-font'
import { Sunrise, Sun, SunMedium, Clock, Sunset, Moon } from "lucide-react-native";



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

    const getName = async () => {
        const storedFirstName = await AsyncStorage.getItem('User First Name');
        setFirstName(storedFirstName);
    };

    const getCity = async () => {
        const storedCity = await AsyncStorage.getItem('city');
        setCity(storedCity);
    };

    const getRegion = async () => {
        const storedRegion = await AsyncStorage.getItem('region');
        setRegion(storedRegion);
    };

    const getLatitude = async () => {
        const storedLatitude = await AsyncStorage.getItem('latitude');
        setLatitude(storedLatitude);
    };

    const getTimeFormat = async () => {
        const storedTimeFormat = await AsyncStorage.getItem('timeformat');
        setTimeFormat(storedTimeFormat);
    }

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

    // first we try to get data we need. Name, location, timeformat, prayerData (We try to get these from storage)
    useFocusEffect(
        React.useCallback(() => {
          const loadAllData = async () => {
            await getName();
            await getCity();
            await getRegion();
            await getLatitude();
            await getTimeFormat();
            await getPrayerData();
            setDataLoaded(true);  // now safe to evaluate redirect
          };
          loadAllData();
        }, [])
      );
      
    
    // here I am checking if name or location has not been stored.
    //if they haven't, then we redirect to the neccessary pages to get those info

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
      
        if (!dataLoaded) return;
      
        (async () => {
          const monthStorage = await AsyncStorage.getItem('monthStorage');
      
          if (!firstName) {
            if (!monthStorage) {
              await initializeMonthStorage(month);
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
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();

    useEffect(() => {
        // incase we enter a new month, we need to get new month data from the api. 
        //Notice this means having new dicts for new days i.e old data is still available.
        const checkMonth = async () => {
            const savedMonth = await AsyncStorage.getItem('month');
            if (month.toString() && month.toString()!== savedMonth) {
                const latitude = await AsyncStorage.getItem("latitude")
                const longitude = await AsyncStorage.getItem("longitude")
                await addMonthToMonths(month) 
                await AsyncStorage.setItem('month', month.toString());
                await prayerStorageMain(latitude?.toString(), longitude?.toString())
            }
        };
        checkMonth();
    }, [month]);

    const formattedDay = date < 10 ? `0${date}` : date;
    const formattedMonth = month < 10 ? `0${month}` : month;
    const todayDate = `${formattedDay}-${formattedMonth}-${year}`; //basically getting the string format for the current day. this serves as the key to get data for the particular day from aysncstorage.
    
    const getTimeString = (time: string) => {
        // this function takes in a time string in 24hour format 22:04 and returns the time in a 12 hour format.
        let timeHour = +time.split(':')[0];
        let timeMin = time.split(':')[1];
        if (timeHour > 12) {
            timeHour = timeHour - 12;
            time = timeHour + ':' + timeMin + ' PM';
        } else {
            time = timeHour + ':' + timeMin + ' AM';
        }
        return time
    }

    const completedAllAlert = () => {
           //function to display an alert if all prayers are completed for the day.
           Alert.alert('MashaAllah', 'Congrats! 🎉 You completed all prayers!! 🥳', [
               {
                 text: 'Continue',
                 style: 'cancel',
               },
             ]);
         
    }

    const handleValueChange = async (prayer: string) => { 
        // to change the true or false value for a prayer when it is clicked and increase or decrease
        // the number of saved prayers.
    
        // first we need to check if a prayer time has reached. if it hasn't, we want to display an 
        //are you sure to mark the prayer as prayed. we can always unmark a prayer regardless of time.
    
        const confirmMarking = () => {
            return new Promise<boolean>((resolve) => {
                Alert.alert(
                    "Confirm",
                    "Are you sure you want to mark prayer as done? It's not yet the prayer time!",
                    [
                        {
                            text: "Yes",
                            onPress: () => resolve(true)
                        },
                        {
                            text: "No",
                            onPress: () => resolve(false)
                        }
                    ]
                );
            });
        };
    
        if (!prayerStatus[prayer]){ //if it was unmarked we need to check if time has reached
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes
    
            const time = prayerData.timings[prayer].split(' ')[0];
            const [hour, minute] = time.split(':').map(Number);
            const prayerTime = hour * 60 + minute;
    
            if (currentTime < prayerTime){ // time hasnt reached prayer time
                const userConfirmed = await confirmMarking();
                if (!userConfirmed) {
                    return;
                }
            }
        }
    
        const newValue = !prayerStatus[prayer];  // true/false
        const newPrayerStatus = { ...prayerStatus, [prayer]: newValue };
        let newPrayerCount = prayerCount
    
        if (newValue === true){// if it was false before and after clicking we changed to true, then increase the prayer count else decrease
            newPrayerCount += 1
        } else {
            newPrayerCount -= 1
        }

        if (newPrayerCount === 5){
            completedAllAlert()
        }
      
    
        const newPrayerData = { ...prayerData, status: newPrayerStatus, count: newPrayerCount };
    
        await AsyncStorage.setItem(todayDate, JSON.stringify(newPrayerData));
        
        setPrayerData(newPrayerData);
        setPrayerStatus(newPrayerStatus);
        setPrayerCount(newPrayerCount);
    };   
    

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

    scheduleNotification("Fajr", "02:19", 5)


    return (
        <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}>
            <Animated.View style={[styles.infoView, {opacity: fadeAnim}]}>
                <Text style={styles.smallHeader}> 👋🏼 Hello, {firstName}</Text>
                <Text style={styles.smallHeader}> 📍 {city}, {region}</Text>
                <Text style={[styles.smallHeader]}> 🗓️ {today.toLocaleString('default', {weekday: 'long'})}, {today.toLocaleString('default', {month: 'long'})} {date}, {year}</Text>
            </Animated.View>
            
            
            <Animated.View style={[styles.salahView, {opacity: fadeAnim}]}>
            {/* code down is to get map to display only timings in prayers list as api comes with extra timings like sunset, imsak etc */}
            {prayerData && prayerData.timings ? 
                prayers.map((prayer, prayerIndex) => {
                    let time = prayerData['timings'][prayer].split(' ')[0]; // Remove timezone if attached
                    if (timeFormat == "12h")
                        time = getTimeString(time);

                    const isCurrentPrayer = prayer === nextPrayer;
                    const isSunrise = prayer === "Sunrise";
                    const PrayerIcon = prayerIcons[prayerIndex]

                    const prayerView = (
                        <View 
                            key={prayer}
                            style={[
                                styles.salahItem,
                                isCurrentPrayer && styles.nextPrayerHighlight,
                                prayerStatus[prayer] && styles.donePrayer
                            ]}
                        >
                            <View style={styles.iconWrapper}> <PrayerIcon color={prayerColors[prayerIndex]}/> </View>
                            
                            <Text style={styles.salahText}>{prayer}</Text>
                            <Text style={styles.salahTime}>{String(time)}</Text>
                        </View>
                    );

                    // If it's sunrise, just show the view normally
                    if (isSunrise) {
                        return prayerView;
                    }

                    // Otherwise, wrap it in a Touchable
                    return (
                        <TouchableWithoutFeedback key={prayer} onPress={async () => await handleValueChange(prayer)} delayLongPress={500}>
                            {prayerView}
                        </TouchableWithoutFeedback>
                    );
                })
            : null}

            </Animated.View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
        flexDirection: "column",
        paddingTop: "20%"
    },
    header: {
        color: '#fff',
        fontSize: 35,
        fontWeight: 'bold',
        alignSelf: 'center',  
        marginTop: 20  
    },
    infoView: {
        
    },
    smallHeader: {
        color: '#fff',
        fontSize: 25,
        fontWeight: 'bold',
        alignSelf: 'center',
        marginTop: 20,
        textAlign:'center',        
    },
    
    salahView: {
        flexDirection: 'column',
        marginTop: 50,
        marginBottom: 50
    },

    salahItem: {
        backgroundColor: '#50584e',
        margin: 10,
        height: 100,
        width: 350,
        borderRadius: 10,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 22,
        marginRight: 22,
    },
    salahText: {
        color: '#e0eaff',
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    salahTime: {
        color: '#e0eaff',
        fontSize: 35,
        fontFamily: 'DS-DIGII',
    },

    // Highlight for the current prayer (if not yet marked as done)
    nextPrayerHighlight: {
        borderWidth: 4,
        borderColor: '#fff',
    },
    donePrayer: {
        backgroundColor: "#06d6a0" // lght green
    },
    iconWrapper: {
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
  },
   
});
export default HomePage;