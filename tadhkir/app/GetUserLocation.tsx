import { View, Text, Button, Alert, StyleSheet} from 'react-native';
import * as Location from 'expo-location';
import {useRouter } from 'expo-router';
import {prayerStorageMain} from "../utils/setUpPrayerStorage"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';

const userSetup = () => {
    const router = useRouter();
    const [locationReady, setLocationReady] = useState(false)

    const predefinedLocations = [
        { name: "Cairo, Egypt", lat: 30.0444, lon: 31.2357 },
        { name: "Riyadh, Saudi Arabia", lat: 24.7136, lon: 46.6753 },
        { name: "Istanbul, Turkey", lat: 41.0082, lon: 28.9784 },
        { name: "Jakarta, Indonesia", lat: -6.2088, lon: 106.8456 },
        { name: "London, UK", lat: 51.5074, lon: -0.1278 },
        { name: "New York, USA", lat: 40.7128, lon: -74.0060 },
        { name: "Karachi, Pakistan", lat: 24.8607, lon: 67.0011 },
        { name: "Lagos, Nigeria", lat: 6.5244, lon: 3.3792 },
        { name: "Kuala Lumpur, Malaysia", lat: 3.1390, lon: 101.6869 },
        { name: "Toronto, Canada", lat: 43.6532, lon: -79.3832 },
        { name: "Winnipeg, Canada", lat: 49.8951, lon: -97.1384 },
        { name: "Edmonton, Canada", lat: 53.5461, lon: -113.4938 },
        { name: "Abuja, Nigeria", lat: 9.0765, lon: 7.3986 },
    ];


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
            await AsyncStorage.setItem("latitude", location.coords.latitude.toString())
            await AsyncStorage.setItem("longitude", location.coords.longitude.toString())
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
                    title="Automatically get location"
                    onPress={async () => {
                        const locationData = await requestLocation();
                        if (locationData) {
                            const [latitude, longitude] = locationData;
                            await prayerStorageMain(latitude.toString(), longitude.toString());
                            setLocationReady(true);
                        }
                    }}
                />
                <Text>Or select manually below</Text>

                {locationReady && (
                    <Button
                        title="Continue"
                        onPress={() => {
                            router.push('/(tabs)');
                        }}
                    />
                )}
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
