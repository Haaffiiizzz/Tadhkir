
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, StyleSheet} from 'react-native';
import * as Location from 'expo-location';
import { Link, useRouter } from 'expo-router';
import prayerStorageMain from "../utils/setUpPrayerStorage"
import AsyncStorage from '@react-native-async-storage/async-storage';

const userSetup = () => {
    const router = useRouter();

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
            return [location.coords.latitude, location.coords.longitude];        
            
        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };
    

    return (
        <View style={styles.container}>
            <>
                <Text>Next, we'll need permission to get your location!</Text>
                <Button
                    title="Get Location"
                    onPress={async () => {
                        const locationData = await requestLocation();
                        if (locationData) {
                            const [latitude, longitude] = locationData;
                            await prayerStorageMain(latitude.toString(), longitude.toString())
                        }
                    }}
                />
                
                <Button title='Continue'
                    onPress={() => {
                        router.push('/(tabs)');
                    }}
                />
                
            </>
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
        fontSize: 40,
        fontWeight: 'bold',
    }
});
export default userSetup;
