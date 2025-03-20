
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const userSetup = () => {
    const router = useRouter();
    const [firstName, setFirstName] = useState<string | null>(null);
    const [latitude, setLatitude] = useState<string | null>(null);

    const getName = async () => {
        const storedFirstName = await AsyncStorage.getItem('userName');
        setFirstName(storedFirstName);
    };

    const getLatitude = async () => {
        const storedLatitude = await AsyncStorage.getItem('latitude');
        setLatitude(storedLatitude);
    };

    useFocusEffect(
        React.useCallback(() => {
            getName();
            getLatitude();
        }, [])
    );

    useEffect(() => {
        if (!firstName) {
            const timer = setTimeout(() => {
                router.push('/others/userName');
            }, 0);
            return () => clearTimeout(timer);
        } else if (firstName && !latitude) {
            const timer = setTimeout(() => {
                router.push('/others/userLocation');
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [firstName, latitude]);

    return (
        <View style={styles.container}>
            <Text>Welcome back {firstName}</Text>
            <Button
                title="Clear All Data"
                onPress={() => {
                    AsyncStorage.clear();
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
        FontFace: 'bold',
    }
});
export default userSetup;
