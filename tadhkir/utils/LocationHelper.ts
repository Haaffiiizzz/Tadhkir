import * as Location from 'expo-location';
import {Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function requestLocation (){
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