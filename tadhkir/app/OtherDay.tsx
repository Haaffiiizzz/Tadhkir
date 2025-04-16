import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Checkbox from 'expo-checkbox';

// this page basically mirrors the index page except it displays prayer time for the day selected in moreTimes page i.e shows prayers for a particular selected day. 
//thnere's a whole lot going on here but prayerDay is the json for the daily prayers and whether they have been prayed or not
// the checkbox in each prayer is defaulted to false. when clicked, the value for that prayer changes to True and is saved back to storage.

export default function PrayerDay() {

    const { date } = useLocalSearchParams();
    const [prayerData, setPrayerData] = useState< any | null>(null);
    const [prayerStatus, setPrayerStatus] = useState< any | null >(null);
    const [prayerCount, setPrayerCount] = useState< any | null>(null)
    const [timeFormat, setTimeFormat] = useState<string | null>(null);
  
    const getTimeFormat = async () => {
        const storedTimeFormat = await AsyncStorage.getItem('timeformat');
        setTimeFormat(storedTimeFormat);
    };

    const getTimeString = (time: string) => {
        //lil function to convert original time string from 24 hours to 12 hours
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

    const getPrayerData = async () => {
        try {
            let storedPrayerData = await AsyncStorage.getItem(date);
            
            if (storedPrayerData) {
                storedPrayerData = JSON.parse(storedPrayerData);
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

    useFocusEffect(
        React.useCallback(() => {
            getPrayerData();
            getTimeFormat();
        }, [])
    );

    const handleValueChange = async (prayer: string) => { // to change the true or false value for a prayer when the checkbox is clicked and increase or decrease
        // the number of saved prayers.
        const newValue = !prayerStatus[prayer];  // true/false
        const newPrayerStatus = { ...prayerStatus, [prayer]: newValue };
        let newPrayerCount = prayerCount

        if (newValue === true){// if it was false before and after clicking we changed to true, then increase the prayer count else decrease
            newPrayerCount += 1
        } else {
            newPrayerCount -= 1
        }

        const newPrayerData = { ...prayerData, status: newPrayerStatus, count: newPrayerCount };

        await AsyncStorage.setItem(date, JSON.stringify(newPrayerData));
        
        setPrayerData(newPrayerData);
        setPrayerStatus(newPrayerStatus);
        setPrayerCount(newPrayerCount);
    }
    
    const prayers = [
        'Fajr',
        'Sunrise',
        'Dhuhr',
        'Asr',
        'Maghrib',
        'Isha'
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}>
            
            <Text style={styles.header}>{date.slice(0, 5)}</Text>
            <Text style={styles.countText}> Total Prayed: {prayerCount}</Text>

            <View style={styles.salahView}>
            {/* code down is to get map to display only timings in prayers list as api comes with extra timings like sunset, imsak etc */}
            {prayerData ? 
                prayers.map((prayer: string) => {
                    let time = prayerData.timings[prayer].split(' ')[0]; // since timezone not added to api call, it adds timezone to time so need to split
                    if (timeFormat == "12h")
                        time = getTimeString(time)
                    return time ? (
                        <View key={prayer} style={styles.salahItem}>
                            <Text style={styles.salahText}>{prayer} </Text>
                            <Text style={styles.salahTime}>{String(time)}</Text>
                            
                            {prayer !== "Sunrise" && /**So theres no checkbox for Sunrise */
                                <Checkbox 
                                value={prayerStatus[prayer]}
                                onValueChange={async()=> await handleValueChange(prayer)}
                                />
                            } 
                            
                        </View>
                    ) : null;
                })
            : null}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
        
    },

    header: {
        color: '#fff',
        fontSize: 30,
        fontWeight: 'bold',
        alignSelf: 'center',
        marginTop: 20
    },

    salahView: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginTop: 60

    },

    countText: {
        color: '#fff',
        fontSize: 25,
        fontWeight: 'bold',
        alignSelf: 'center',
        marginTop: 20,
    },

    salahItem: {
        backgroundColor: '#50584e',
        margin: 10,
        height: 85,
        width: 350,
        borderRadius: 10,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 22,
        marginRight: 22,
    },
    salahText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    salahTime: {
        color: '#fff',
        fontSize: 20,
    },


});