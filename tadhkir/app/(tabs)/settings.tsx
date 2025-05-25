import { View, Button, StyleSheet, Text, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import React, { useState, useEffect } from 'react';
import { Switch} from 'react-native-switch';
import * as Notifications from "expo-notifications";
import { Dropdown } from 'react-native-element-dropdown';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
    });
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
                        sendNotif("Data Cleared");
                        await Notifications.cancelAllScheduledNotificationsAsync();
                        await AsyncStorage.setItem('NotificationScheduled', "");
                        restartApp();
                    }
                }
            ]
        );
    };

    const sendNotif = (text: string) => {
        Notifications.scheduleNotificationAsync({
            content: {
                title: 'Tadhkir',
                body: text,
            },
            trigger: null
            });
    }

    const prayers = [
        'Fajr',
        'Dhuhr',
        'Asr',
        'Maghrib',
        'Isha'
    ];

    const data = [
    { label: '1 minute', value: '1' },
    { label: '2 minutes', value: '2' },
    { label: '3 minutes', value: '3' },
    { label: '5 minutes', value: '5' },
    { label: '10 minutes', value: '10' },
    { label: '15 minutes', value: '15' },
    ];
    


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
            
             {prayers.map((prayer) => {

                return <View>
                            <Text style={[styles.label, { color: 'blue' }]}>
                                {prayer}
                            </Text>

                            <Dropdown
                            key={prayer}
                            style={styles.dropdown}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            data={data}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder={prayer}
                            value={5}
                            onChange={() => {
                                
                            }}
                            
                        />
                    
                    </View>
            })}

            <Button
                title="Clear All Data"
                onPress={confirmClearData}
            />

            <Button
                title="Test Notification"
                onPress={ () => {sendNotif("Testing Notifications!")}}
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
    iconStyle: {
      width: 20,
      height: 20,
    },
    label: {
      position: 'absolute',
      backgroundColor: 'white',
      left: 22,
      top: 8,
      zIndex: 999,
      paddingHorizontal: 8,
      fontSize: 14,
    },

    
});