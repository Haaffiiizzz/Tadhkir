// import React from 'react';
// import { Text, View, StyleSheet, TextInput } from 'react-native';
// import {Link} from 'expo-router';
// import { Platform } from 'react-native';

// import GetLocation from 'react-native-get-location'

// GetLocation.getCurrentPosition({
//     enableHighAccuracy: true,
//     timeout: 60000,
// })
// .then(location => {
//     console.log(location);
// })
// .catch(error => {
//     const { code, message } = error;
//     console.warn(code, message);
// })

// export default function Index() {

//   const [name, setName] = React.useState("");
//   const [submittedName, setSubmittedName] = React.useState("");

//   return (
//     <View style={styles.container}>
//       <Text style={styles.text}>Tadhkir</Text>
//       <Link href="/(tabs)/about" style={styles.button}>
//         Get Started
//       </Link>
//       <TextInput
//         style={{ height: 40, borderColor: 'gray', borderWidth: 1, width: 200, color: '#fff' }}
//         onChangeText={text => setName(text)}
//         onSubmitEditing={() => setSubmittedName(name)}
//         value={name}
//         placeholder='Enter your name to get started'
//       />
//       {submittedName !== "" && <Text style={{color: '#fff'}}>Hello, {submittedName}!</Text>}
//     </View>
//   ); 
// }


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#25292e',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   text: {
//     color: '#fff',
//     fontSize: 35,
//     fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'HelveticaNeue',
//   },
//   button: {
//     fontSize: 20,
//     textDecorationLine: 'underline',
//     color: '#fff',
//   }
// });

import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import * as Location from 'expo-location';

const LocationComponent = () => {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);

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
        </View>
    );
};

export default LocationComponent;

