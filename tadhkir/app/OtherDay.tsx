import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Checkbox from 'expo-checkbox';

// this page basically mirrors the index page except it displays prayer time for the day selected in moreTimes page i.e shows prayers for a particular selected day. 
//thnere's a whole lot going on here but prayerDay is the json for the daily prayers and whether they have been prayed or not
// the checkbox in each prayer is defaulted to false. when clicked, the value for that prayer changes to True and is saved back to storage.

export default function PrayerDay() {

    const { date } = useLocalSearchParams();
    const [prayerData, setPrayerData] = useState< any | null>(null); // this is the json of prayers and whether true or false if prayed or not  

    const getPrayerData = async () => {
        try {
            let storedPrayerData = await AsyncStorage.getItem(date);
            
            if (storedPrayerData) {
                storedPrayerData = JSON.parse(storedPrayerData);
                setPrayerData(storedPrayerData);
            }
        } catch (error) {
            console.error('Error retrieving prayer data:', error);
            setPrayerData(null);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            getPrayerData();
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
            
            <Text style={styles.header}>{date.slice(0, 5)}</Text>

            <View style={styles.salahView}>
            {/* code down is to get map to display only timings in prayers list as api comes with extra timings like sunset, imsak etc */}
            {prayerData ? 
                prayers.map(prayer => {
                    const time = prayerData.timings[prayer].split(' ')[0]; // since timezone not added to api call, it adds timezone to time so need to split

                    return time ? (
                        <View key={prayer} style={styles.salahItem}>
                            <Text style={styles.salahText}>{prayer} </Text>
                            <Text style={styles.salahTime}>{String(time)}</Text>
                            {/* <Checkbox 
                            value={getPrayerValue(prayer)}
                            onValueChange={async () => await changePrayerValue(prayer)}/> */}
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