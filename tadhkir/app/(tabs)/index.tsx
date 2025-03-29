import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
/**
 * This is basically the index / home page. For now, it'll display user name and prayer times if these details are already stored.
 * Else, it'll redirect to the required pages to get these data.
 * 
 */
const HomePage = () => {

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();

    const formattedDay = date < 10 ? `0${date}` : date;
    const formattedMonth = month < 10 ? `0${month}` : month;
    const todayDate = `${formattedDay}-${formattedMonth}-${year}`;

    const router = useRouter();
    const [firstName, setFirstName] = useState<string | null>(null);
    const [latitude, setLatitude] = useState<string | null>(null);
    const [timeFormat, setTimeFormat] = useState<string | null>(null);
    const [prayerData, setPrayerData] = useState< any | null>(null);
   

    const getName = async () => {
        const storedFirstName = await AsyncStorage.getItem('User First Name');
        setFirstName(storedFirstName);
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
            getName();
            getLatitude();
            getTimeFormat();
            getPrayerData();
        }, [])
    );

    useEffect(() => {
        if (!firstName) {
            const timer = setTimeout(() => {
                router.push('../GetUserInfo');
            }, 0);
            return () => clearTimeout(timer);
        } else if (firstName && !latitude) {
            const timer = setTimeout(() => {
                router.push('../GetUserLocation');
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [firstName, latitude]);

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
            <Text style={styles.header}>Welcome back {firstName}</Text>
            <Text style={styles.smallHeader}>Prayer Times for Today</Text>
            
            <View style={styles.salahView}>
            {/* code down is to get map to display only timings in prayers list as api comes with extra timings like sunset, imsak etc */}
            {prayerData && prayerData.timings? 
                prayers.map(prayer => {
                    let time = prayerData['timings'][prayer].split(' ')[0]; // since timezone not added to api call, it adds timezone to time so need to split

                    if (timeFormat === '12h'){
                        let timeHour = +time.split(':')[0];
                        let timeMin = +time.split(':')[1];
                        if (timeHour > 12) {
                            timeHour = timeHour - 12;
                            time = timeHour + ':' + timeMin + ' PM';
                        } else {
                            time = timeHour + ':' + timeMin + ' AM';
                        }

                    }

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
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        color: '#fff',
        fontSize: 35,
        fontWeight: 'bold',
        alignSelf: 'center',
        top: -100,
    },
    smallHeader: {
        color: '#fff',
        fontSize: 25,
        fontWeight: 'bold',
        alignSelf: 'center',
        top: -30,
    },
    text: {
        color: '#F5F5F5',

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
export default HomePage;
