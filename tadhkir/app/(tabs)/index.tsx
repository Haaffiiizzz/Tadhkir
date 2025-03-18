
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, TextInput} from 'react-native';
import * as Location from 'expo-location';
import { Link, useRouter } from 'expo-router';
import getPrayerTimes from '../SetupFunctions.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const userSetup = () => {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const router = useRouter();
    const [prayerTimes, setPrayerTimes] = useState<any | null>(null);
    const [firstName, setFirstName] = useState('');

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
            setLocation(location);
            Alert.alert(
                "Location Obtained",
                `Latitude: ${location.coords.latitude}, Longitude: ${location.coords.longitude}`
            );         
            
        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };

    const retrievePrayerTimes = async () => {
        try {
            let prayerTimes = await getPrayerTimes(location.coords.latitude, location.coords.longitude);
            setPrayerTimes(prayerTimes);
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

    // storing user name in async storage
    const storeName = async (name) => {
        try {
          await AsyncStorage.setItem('userName', name);
        } catch (e) {
          console.log(e);
        }
      };



    return (
        <View style={styles.container}>
            <Text style={styles.header}>Tadhkir</Text>
            <Text>First, we need to get some info</Text>

            <TextInput onChangeText={setFirstName}
            value={firstName}
            placeholder='Please Enter first name!'/>
            <Button 
              title="Submit" 
              onPress={() => { 
                storeName(firstName);
                router.push('/(tabs)/about');
              }} 
            />

            {/* {nameStored && 
                <>
                    <Text>Welcome {firstName}!</Text>
                    <Text>Next, we'll need permission to get your location!</Text>
                    <Button title="Get Location" onPress={requestLocation} />
            
                </>
            } */}

            {//location && (
                // <>
                //     <Text>Latitude: {location.coords.latitude.toString()}</Text>
                //     <Text>Longitude: {location.coords.longitude.toString()}</Text>
                //     {/* added button here so it doesnt show up until user gets location */}
                //     <Button title="Get Prayer Times" onPress={() => { storeLocation(location.coords.latitude.toString(), location.coords.longitude.toString()); retrievePrayerTimes(); }} />
                // </>
            //)};
}


            {/* {prayerTimes && (
                <>
                    <Text>Fajr: {prayerTimes.timings["Fajr"]}</Text>
                    <Text>Dhuhr: {prayerTimes.timings["Dhuhr"]}</Text>
                    <Text>Asr: {prayerTimes.timings["Asr"]}</Text>
                    <Text>Maghrib: {prayerTimes.timings["Maghrib"]}</Text>
                    <Text>Isha: {prayerTimes.timings["Isha"]}</Text>
                </>
            )}; */}

            {/* <Link href="/(tabs)/about">Continue</Link> */}
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

