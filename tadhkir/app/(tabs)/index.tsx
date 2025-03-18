
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, TextInput} from 'react-native';
import { Link, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const userSetup = () => {
    const router = useRouter();
    const [firstName, setFirstName] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchData = async () => {
            const storedFirstName = await AsyncStorage.getItem('userName');
            setFirstName(storedFirstName);
        }
        fetchData();
    }
    , []);
            
    useEffect(() => {
        if (!firstName) {
            const timer = setTimeout(() => {
                router.push('/others/userName');
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [firstName]);



    return (
        <View style={styles.container}>
            
        <Text>Welcome back {firstName}</Text>

        <Button title="Clear All Data" 
              onPress= {()=> {AsyncStorage.clear()}}     
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
