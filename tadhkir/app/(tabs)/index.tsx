
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert} from 'react-native';
import * as Location from 'expo-location';
import { Link } from 'expo-router';
import getPrayerTimes from '../getLocation.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LocationComponent = () => {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
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
    const storeData = async (latitude, longitude) => {
        try {
          await AsyncStorage.setItem('latitude', latitude);
          await AsyncStorage.setItem('longitude', longitude);
        } catch (e) {
          console.log(e);
        }
      };






    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Test Location Permissions</Text>
            <Button title="Get Location" onPress={requestLocation} />
            {location && (
                <>
                    <Text>Latitude: {location.coords.latitude.toString()}</Text>
                    <Text>Longitude: {location.coords.longitude.toString()}</Text>
                    {/* added button here so it doesnt show up until user gets location */}
                    <Button title="Get Prayer Times" onPress={() => { storeData(location.coords.latitude.toString(), location.coords.longitude.toString()); retrievePrayerTimes(); }} />
                </>
            )}


            {prayerTimes && (
                <>
                    <Text>Fajr: {prayerTimes.timings["Fajr"]}</Text>
                    <Text>Dhuhr: {prayerTimes.timings["Dhuhr"]}</Text>
                    <Text>Asr: {prayerTimes.timings["Asr"]}</Text>
                    <Text>Maghrib: {prayerTimes.timings["Maghrib"]}</Text>
                    <Text>Isha: {prayerTimes.timings["Isha"]}</Text>
                </>
            )}
            <Link href="/(tabs)/about">Continue</Link>
        </View>
    );
};


export default LocationComponent;

