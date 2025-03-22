
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const userSetup = () => {
    const router = useRouter();
    const [firstName, setFirstName] = useState<string | null>(null);
    const [latitude, setLatitude] = useState<string | null>(null);
    const [prayerTimes, setPrayerTimes] = useState<any | null>(null);

    const getName = async () => {
        const storedFirstName = await AsyncStorage.getItem('userName');
        setFirstName(storedFirstName);
    };

    const getLatitude = async () => {
        const storedLatitude = await AsyncStorage.getItem('latitude');
        setLatitude(storedLatitude);
    };

    const getPrayerTimes = async () => {
        const storedPrayerTimes = await AsyncStorage.getItem('prayerTimes');
        if (storedPrayerTimes !== null) {
            setPrayerTimes(JSON.parse(storedPrayerTimes));
        } else {
            setPrayerTimes(null);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            getName();
            getLatitude();
            getPrayerTimes();
        }, [])
    );

    useEffect(() => {
        if (!firstName) {
            const timer = setTimeout(() => {
                router.push('../userName');
            }, 0);
            return () => clearTimeout(timer);
        } else if (firstName && !latitude) {
            const timer = setTimeout(() => {
                router.push('../userLocation');
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

    const today = new Date();
    let day = today.getDate() - 1;

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Welcome back {firstName}</Text>
            {/* <Text style={styles.text}>Prayer times for today:</Text> */}
            <View style={styles.salahView}>
            {prayerTimes ? 
                prayers.map(prayer => {
                    const time = prayerTimes[day].timings[prayer].split(' ')[0];
                    return time ? (
                        <View key={prayer} style={styles.salahItem}>
                            <Text style={styles.salahText}>{prayer} </Text>
                            <Text style={styles.salahTime}>{String(time)}</Text>
                        </View>
                    ) : null;
                })
            : null}
            </View>
            <Button
                title="Clear All Data"
                onPress={() => {
                    AsyncStorage.clear();
                }}
            />
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
export default userSetup;
