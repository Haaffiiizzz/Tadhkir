import { View, Button, StyleSheet, Text, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import React, { useState, useEffect } from 'react';
import { Switch } from 'react-native-switch';

export default function Settings() {
    const restartApp = async () => {
        try {
            await Updates.reloadAsync();
        } catch (e) {
            console.error(e);
        }
    };

    const [is24Hour, setIs24Hour] = useState(false);

    useEffect(() => {
        const loadTimeFormat = async () => {
            const storedFormat = await AsyncStorage.getItem('timeformat');
            if (storedFormat === "24h") {
                setIs24Hour(true);
            } else {
                setIs24Hour(false);
            }
        };

        loadTimeFormat();
    }, []);

    const changeTimeFormat = async () => {
        const newFormat = is24Hour ? "24h" : "12h";
        await AsyncStorage.setItem('timeformat', newFormat);
        setIs24Hour(!is24Hour);
    };

    const confirmClearData = () => {
        Alert.alert(
            "Confirm",
            "Are you sure you want to clear all data?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: async () => {
                        await AsyncStorage.clear();
                        restartApp();
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Switch
                onValueChange={changeTimeFormat}
                value={is24Hour}
                activeText={'12h'}
                inActiveText={'24h'}
                circleSize={40}
                switchLeftPx={8}
                switchRightPx={8}
            />
            <Text style={styles.text}>Toggle to change time format!</Text>
            
            <Button
                title="Clear All Data"
                onPress={confirmClearData}
            />

            
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
        margin: 10,
        fontSize: 20
    }
});