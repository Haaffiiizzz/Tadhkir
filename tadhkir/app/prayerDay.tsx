import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

// this page basically mirrors the index page except it displays prayer time for the day selected in moreTimes page
export default function PrayerDay() {

    const { key } = useLocalSearchParams();
    const [prayerTimes, setPrayerTimes] = useState<any | null>(null);
    

    const getPrayerTimes = async () => {
        const storedPrayerTimes = await AsyncStorage.getItem('prayerTimes');
        if (storedPrayerTimes !== null) {
            setPrayerTimes(JSON.parse(storedPrayerTimes));
        } else {
            console.log("here")
            setPrayerTimes(null);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            getPrayerTimes();
        }, [])
    );

    const prayers = [
        'Fajr',
        'Sunrise',
        'Dhuhr',
        'Asr',
        'Maghrib',
        'Isha'
    ];


    return (
        <View style={styles.container}>
            
            <Text style={styles.header}>{prayerTimes ? prayerTimes[+key-1].date.readable : "Loading..."}</Text>

            <View style={styles.salahView}>
            {/* code down is to get map to display only timings in prayers list as api comes with extra timings like sunset, imsak etc */}
            {prayerTimes ? 
                prayers.map(prayer => {
                    const time = prayerTimes[+key-1].timings[prayer].split(' ')[0]; // since timezone not added to api call, it adds timezone to time so need to split

                    return time ? (
                        <View key={prayer} style={styles.salahItem}>
                            <Text style={styles.salahText}>{prayer} </Text>
                            <Text style={styles.salahTime}>{String(time)}</Text>
                        </View>
                    ) : null;
                })
            : null}
            </View>
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

    header: {
        color: '#fff',
        fontSize: 30,
        fontWeight: 'bold',
        alignSelf: 'center',
        top: -100,
    },

    salahView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',

    },

    salahItem: {
        backgroundColor: '#50584e',
        margin: 10,
        height: 100,
        width: 170,
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