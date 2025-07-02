import { View, Text, Button, Alert, StyleSheet} from 'react-native';
import * as Location from 'expo-location';
import {useRouter } from 'expo-router';
import {prayerStorageMain} from "../utils/setUpPrayerStorage"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { Dropdown } from 'react-native-element-dropdown';
import { requestLocation } from '@/utils/LocationHelper';

const userSetup = () => {
    const router = useRouter();
    const [locationReady, setLocationReady] = useState(false)
    const [value, setValue] = useState(null);

    const predefinedLocations = [
        { label: "Cairo, Egypt", value: { latitude: 30.0444, longitude: 31.2357 } },
        { label: "Riyadh, Saudi Arabia", value: { latitude: 24.7136, longitude: 46.6753 } },
        { label: "Istanbul, Turkey", value: { latitude: 41.0082, longitude: 28.9784 } },
        { label: "Jakarta, Indonesia", value: { latitude: -6.2088, longitude: 106.8456 } },
        { label: "London, UK", value: { latitude: 51.5074, longitude: -0.1278 } },
        { label: "New York, USA", value: { latitude: 40.7128, longitude: -74.0060 } },
        { label: "Karachi, Pakistan", value: { latitude: 24.8607, longitude: 67.0011 } },
        { label: "Lagos, Nigeria", value: { latitude: 6.5244, longitude: 3.3792 } },
        { label: "Kuala Lumpur, Malaysia", value: { latitude: 3.1390, longitude: 101.6869 } },
        { label: "Toronto, Canada", value: { latitude: 43.6532, longitude: -79.3832 } },
        { label: "Winnipeg, Canada", value: { latitude: 49.8951, longitude: -97.1384 } },
        { label: "Edmonton, Canada", value: { latitude: 53.5461, longitude: -113.4938 } },
        { label: "Abuja, Nigeria", value: { latitude: 9.0765, longitude: 7.3986 } },
    ];

    const getPrayerFunction = async (latitude: number, longitude: number) => {
        if(latitude && longitude){
            await prayerStorageMain(latitude.toString(), longitude.toString());
            
            setLocationReady(true);
            
        }
    }

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
                            await getPrayerFunction(latitude, longitude);
                        }
                    }}
                />
                
                <Text>Or select manually below</Text>
                <Dropdown //use on  confirm selection 
                    style={styles.dropdown}
                    data={predefinedLocations}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    maxHeight={300}
                    onChange={async (item) => {
                        const latitude = item.value.latitude
                        const longitude = item.value.longitude
                        setValue(item.label)
                        await getPrayerFunction(latitude, longitude)
                    }}
                    placeholder={value ? value : "Please make a selection!"}
                    labelField="label"
                    valueField="value"
                    value= {value}
                
                />

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
    },
    dropdown: {
        margin: 16,
        height: 50,
        width: 150,
        borderBottomColor: 'gray',
        borderBottomWidth: 0.5,
    },
    placeholderStyle: {
    fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
    },
});
export default userSetup;
