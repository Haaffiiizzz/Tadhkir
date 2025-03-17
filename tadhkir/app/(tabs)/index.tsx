
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert} from 'react-native';
import * as Location from 'expo-location';
import { Link } from 'expo-router';
import getPrayerTimes from '../getLocation.js';

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

            let prayerTimes = await getPrayerTimes(location.coords.latitude, location.coords.longitude);
            setPrayerTimes(prayerTimes);

            
            
        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };


    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Test Location Permissions</Text>
            <Button title="Get Location" onPress={requestLocation} />
            {location && (
                <>
                    <Text>Latitude: {location.coords.latitude}</Text>
                    <Text>Longitude: {location.coords.longitude}</Text>
                    
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

