
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, TextInput} from 'react-native';
import { Link, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const userSetup = () => {
    const router = useRouter();
    const firstName = AsyncStorage.getItem('userName');
    const latitude = AsyncStorage.getItem('latitude')
    const longitude = AsyncStorage.getItem('longitude');
    const prayerTimes = AsyncStorage.getItem('prayerTimes');

    // Immediately navigate to the userName screen only if firstName is not set
    useEffect(() => {
        if (!firstName) {
            const timer = setTimeout(() => {
                router.push('../userName');
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [firstName]);

    // Navigate to userLocation screen if latitude, longitude, and prayerTimes are not set
    useEffect(() => {
        if (!latitude || !longitude || !prayerTimes) {
            const timer = setTimeout(() => {
                router.push('../userLocation');
            }, 0);
            return () => clearTimeout(timer);
        }
    }
    , [latitude, longitude, prayerTimes]);


    return (
        <View style={styles.container}>
            
        <Text>Welcome back {firstName}</Text>
        </View>
    );
};

const styles = {
    container: {
        flex: 1,
        backgroundColor: '#25292e',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        color: '#fff',
        fontSize: 40,
        FontFace: 'bold',
    }
};
export default userSetup;
