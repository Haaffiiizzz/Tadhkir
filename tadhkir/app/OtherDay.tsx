import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableWithoutFeedback, Alert } from 'react-native';
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { convertDateToDateObject, get12HourTimeString } from '@/utils/Helper';
import { Sunrise, Sun, SunMedium, Clock, Sunset, Moon } from "lucide-react-native";
import {useFonts} from 'expo-font';
import { useTheme } from './contexts/ThemeContext';

// this page basically mirrors the index page except it displays prayer time for the day selected in moreTimes page i.e shows prayers for a particular selected day. 
//thnere's a whole lot going on here but prayerDay is the json for the daily prayers and whether they have been prayed or not
 

export default function PrayerDay() {
    
    const [fontsLoaded, fontError] = useFonts({
            "DS-DIGII" : require('../assets/fonts/DS-DIGIB.ttf')
        })
    const { date } = useLocalSearchParams();
    const dateObject = convertDateToDateObject(date);
    const [prayerData, setPrayerData] = useState<any | null>(null);
    const [prayerStatus, setPrayerStatus] = useState<any | null>(null);
    const [prayerCount, setPrayerCount] = useState<any | null>(null);
    const [timeFormat, setTimeFormat] = useState<string | null>(null);
    const [streakStorage, setStreakStorage] = useState<object | null>(null)
    const {colors, theme} = useTheme()
     
    const getTimeFormat = async () => {
        const storedTimeFormat = await AsyncStorage.getItem('timeformat');
        setTimeFormat(storedTimeFormat);
    };


    const getPrayerData = async () => {
        try {
            let storedPrayerData = await AsyncStorage.getItem(date);
            
            if (storedPrayerData) {
                storedPrayerData = JSON.parse(storedPrayerData);
                setPrayerData(storedPrayerData);
                if (storedPrayerData){
                    setPrayerStatus(storedPrayerData.status);
                    setPrayerCount(storedPrayerData.count);
                }
            }
        } catch (error) {
            console.error('Error retrieving prayer data:', error);
            setPrayerData(null);
        }
    };


    const getStreakStorage = async () => {
        let streakStorageIn = await AsyncStorage.getItem("streakStorage")
        streakStorageIn = JSON.parse(streakStorageIn)
        setStreakStorage(streakStorageIn)
    }

    useFocusEffect(
        React.useCallback(() => {
            getPrayerData();
            getTimeFormat();
        }, [])
    );

    useEffect(() => {
        getStreakStorage()
    }, [])

    const completedAllAlert = () => {
               //function to display an alert if all prayers are completed for the day.
               Alert.alert('MashaAllah', 'Congrats! 🎉 You completed all prayers!! 🥳', [
                   {
                     text: 'Continue',
                     style: 'cancel',
                   },
                 ]);    
    };

    const addToStreak = async () => {
        streakStorage[date] = true
        await AsyncStorage.setItem("streakStorage", JSON.stringify(streakStorage));
    }

    const removeFromStreak = async () => {
        streakStorage[date] = false
        await AsyncStorage.setItem("streakStorage", JSON.stringify(streakStorage));
    }

    const handleValueChange = async (prayer: string) => { // to change the true or false value for a prayer when the checkbox is clicked and increase or decrease
        // the number of saved prayers.
        const newValue = !prayerStatus[prayer];  // true/false
        const newPrayerStatus = { ...prayerStatus, [prayer]: newValue };
        let newPrayerCount = prayerCount;

        if (newValue === true){// if it was false before and after clicking we changed to true, then increase the prayer count else decrease
            newPrayerCount += 1;
        } else {
            newPrayerCount -= 1;
        }

        if (newPrayerCount === 5){
            addToStreak()
            completedAllAlert()
            
        }
        else{
            removeFromStreak()
        }

        const newPrayerData = { ...prayerData, status: newPrayerStatus, count: newPrayerCount };

        await AsyncStorage.setItem(date, JSON.stringify(newPrayerData));
        
        setPrayerData(newPrayerData);
        setPrayerStatus(newPrayerStatus);
        setPrayerCount(newPrayerCount);
    };

    
    
    const prayers = [
        'Fajr',
        'Sunrise',
        'Dhuhr',
        'Asr',
        'Maghrib',
        'Isha'
    ];
    const prayerIcons = [Sunrise, Sun, SunMedium, Clock, Sunset, Moon];
    const prayerColors = ["#38bdf8", "#f97316", "#facc15", "#fb923c", "#f43f5e", "#6366f1"];

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
      countText: {
        color: colors.text,
        fontSize: 25,
        fontWeight: 'bold',
        alignSelf: 'center',
        marginTop: 20,
      },
      salahView: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginTop: 20
      },
    });    

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}>
            
            {dateObject && (
                    <Text style={[styles.smallHeader]}>
                      🗓️ {dateObject.toLocaleString('default', { weekday: 'long' })},{" "}
                      {dateObject.toLocaleString('default', { month: 'long' })} {date.split("-")[0]}, {date.split("-")[2]}
                    </Text>
                  )}


            <View style={styles.salahView}>
            {/* code down is to map to display only timings in prayers list as api comes with extra timings like sunset, imsak etc */}
            {prayerData && prayerData.timings ? 
                prayers.map((prayer, prayerIndex) => {
                    let time = prayerData['timings'][prayer].split(' ')[0]; // Remove timezone if attached
                    if (timeFormat == "12h")
                        time = get12HourTimeString(time);

                    const isSunrise = prayer === "Sunrise";
                    
                    const PrayerIcon = prayerIcons[prayerIndex];
                    if (!PrayerIcon) return null;

                    const prayerView = (
                        <View 
                            key={prayer}
                            style={[
                                styles.salahItem,
                                prayerStatus[prayer] && styles.donePrayer
                            ]}
                        >
                            <View style={styles.iconWrapper}>
                                <PrayerIcon color={prayerColors[prayerIndex]} />
                            </View>
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
            </View>
        </ScrollView>
    );
}

