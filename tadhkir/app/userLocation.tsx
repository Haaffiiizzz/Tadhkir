
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, TextInput} from 'react-native';
import * as Location from 'expo-location';
import { Link, useRouter } from 'expo-router';
import getPrayerTimes from '../utils/locationUtil.js';
import setPrayerCount from '../utils/prayercount.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const userSetup = () => {
    const router = useRouter();

    const [firstName, setFirstName] = useState(null);

    useEffect(() => {
        const fetchUserName = async () => {
            const name = await AsyncStorage.getItem('userName');
            setFirstName(name);
        };
        fetchUserName();
    }, []);

    let location = null;
    const [prayerTimes, setPrayerTimes] = useState<any | null>(null);

    const requestLocation = async () => {
        try {
            // Request for location permission
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Location permission is required!');
                return;
            }

            // Get the current location
            let location = await Location.getCurrentPositionAsync({});
            Alert.alert(
                "Location Obtained",
                `Latitude: ${location.coords.latitude}, Longitude: ${location.coords.longitude}`
            );
            return location;         
            
        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };

    const retrievePrayerTimes = async (latitude, longitude) => {
        try {
            let prayerTimes = await getPrayerTimes(latitude, longitude);
            return prayerTimes;
        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };

    // storing user location in async storage
    const storeLocation = async (latitude, longitude) => {
        try {
          await AsyncStorage.setItem('latitude', latitude);
          await AsyncStorage.setItem('longitude', longitude);
        } catch (e) {
          console.log(e);
        }
    };

    const storePrayerTimes = async (prayerTimes) => {
        try { 
            await AsyncStorage.setItem('prayerTimes', JSON.stringify(prayerTimes));
            } catch (e) {
            console.log(e);  
        }
    };

    const storePrayerCount = async () => {
        //for each day in prayerTimes, we'll set the prayer counts using function from prayercount.js
        prayerTimes.map(async day => {
            let dayString = day.date.gregorian.date;
            await setPrayerCount(dayString);

        })
    }

    

    return (
        <View style={styles.container}>
            <>
                <Text style={styles.header}>Welcome {firstName}!</Text>
                <Text>Next, we'll need permission to get your location!</Text>
                <Button
                    title="Get Location"
                    onPress={async () => {
                        location = await requestLocation();
                        if (location) {
                            await storeLocation(
                                location.coords.latitude.toString(),
                                location.coords.longitude.toString()
                            );
                            const retrievedPrayerTimes = await retrievePrayerTimes(location.coords.latitude, location.coords.longitude);
                            if (retrievedPrayerTimes) {
                                setPrayerTimes(retrievedPrayerTimes);
                                await storePrayerTimes(retrievedPrayerTimes);
                            }
                        }
                    }}
                />

                {prayerTimes &&
                    <Button title='Continue'
                        onPress={() => {
                            storePrayerCount();
                            router.push('/(tabs)');
                        }}
                    />
                }
            </>
        </View>
    );
}
    
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
        fontWeight: 'bold',
    }
};
export default userSetup;
