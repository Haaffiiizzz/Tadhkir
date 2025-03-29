import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, TextInput, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';;
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * This page will load up on first start of the app to store user info (just name for now)
 * If later user data is cleared, this page will be loaded again
 */
const GetUserInfo = () => {
    const [firstName, setFirstName] = useState('');
    const router = useRouter();

    // storing user's name in asyncstorage and adding a default name. 

    const storeName = async (name: string) => {
        try {
          if (!name) {
            await AsyncStorage.setItem('User First Name', "User");
          } else{
            await AsyncStorage.setItem('User First Name', name);
          }
          
        } catch (e) {
          console.log(e);
        }
      };


    return (
        <View style={styles.container}>
            <Text style={styles.header}>Tadhkir</Text>
            <Text style={styles.text}>First, we need to get some info</Text>

            <TextInput style={styles.textInput}
              onChangeText={setFirstName}
              value={firstName}
              placeholder='Please Enter first name!'
            />
            
            <Button
              title="Submit" 
              onPress={ async () => { 
                await storeName(firstName);
                router.push('/Get User Location');
              }} 
            />
        </View>
    );
};

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
    marginBottom: 50,
  },

  text: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  textInput: {
    backgroundColor: '#555',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: 300,
    color: 'white',
    marginBottom: 20,
  },
  button: {

  }
});
export default GetUserInfo;

