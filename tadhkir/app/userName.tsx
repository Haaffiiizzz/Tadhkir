import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, TextInput} from 'react-native';
import { Link, useRouter } from 'expo-router';;
import AsyncStorage from '@react-native-async-storage/async-storage';

const userSetup = () => {
    const [firstName, setFirstName] = useState('');
    const router = useRouter();

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
                router.push('/userLocation');
              }} 
            />
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

