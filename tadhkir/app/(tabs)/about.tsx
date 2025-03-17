import { Text, View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';

export default function AboutScreen() {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const getData = async () => {
    try {
      const latitude = await AsyncStorage.getItem('latitude');
      const longitude = await AsyncStorage.getItem('longitude');
      setLatitude(latitude);
      setLongitude(longitude);
      
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getData(); // Call the async function inside useEffect
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>About screen.</Text>
      
      {latitude && longitude && <Text style={styles.text}>Latitude: {latitude}, Longitude: {longitude}</Text>}
      <Link href="/(tabs)" style={styles.button}>
        Go to Home screen  
      </Link>
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
  text: {
    color: '#fff',
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
}
});