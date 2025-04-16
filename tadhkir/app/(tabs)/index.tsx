import React, { useEffect, useState, useRef} from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import main from "../../utils/setUpPrayerStorage"
import Checkbox from 'expo-checkbox';
/**
 * This is basically the index / home page. For now, it'll display user name and prayer times if these details are already stored.
 * Else, it'll redirect to the required pages to get these data.
 * 
 */
const HomePage = () => {

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();

    useEffect(() => {
        // incase we enter a new month, we need to get new month data from the api. 
        //Notice this means having new dicts for new days i.e old data is still available.
        const checkMonth = async () => {
            const savedMonth = await AsyncStorage.getItem('month');
            if (month.toString() !== savedMonth) {
                const latitude = await AsyncStorage.getItem("latitude")
                const longitude = await AsyncStorage.getItem("longitude")
                await main(latitude, longitude)   
            }
        };
        checkMonth();
    }, [month]);

    const formattedDay = date < 10 ? `0${date}` : date;
    const formattedMonth = month < 10 ? `0${month}` : month;
    const todayDate = `${formattedDay}-${formattedMonth}-${year}`;

    const router = useRouter();
    const [firstName, setFirstName] = useState<string | null>(null);
    const [latitude, setLatitude] = useState<string | null>(null);
    const [timeFormat, setTimeFormat] = useState<string | null>(null);
    const [prayerData, setPrayerData] = useState< any | null>(null);
    const [prayerStatus, setPrayerStatus] = useState< any | null >(null);
    const [prayerCount, setPrayerCount] = useState< any | null>(null)
   

    const getName = async () => {
        const storedFirstName = await AsyncStorage.getItem('User First Name');
        setFirstName(storedFirstName);
    };

    const getLatitude = async () => {
        const storedLatitude = await AsyncStorage.getItem('latitude');
        setLatitude(storedLatitude);
    };

    const getTimeFormat = async () => {
        const storedTimeFormat = await AsyncStorage.getItem('timeformat');
        setTimeFormat(storedTimeFormat);
    }

    const getPrayerData = async () => {
        try {
            let storedPrayerData = await AsyncStorage.getItem(todayDate);
            
            if (storedPrayerData) {
                storedPrayerData = JSON.parse(storedPrayerData)
                setPrayerData(storedPrayerData);
                if (storedPrayerData){
                    setPrayerStatus(storedPrayerData.status)
                    setPrayerCount(storedPrayerData.count)
                }
            }
        } catch (error) {
            console.error('Error retrieving prayer data:', error);
            setPrayerData(null);
        }
    };

    const getTimeString = (time: string) => {
        if (timeFormat === '12h'){
            let timeHour = +time.split(':')[0];
            let timeMin = time.split(':')[1];
            if (timeHour > 12) {
                timeHour = timeHour - 12;
                time = timeHour + ':' + timeMin + ' PM';
            } else {
                time = timeHour + ':' + timeMin + ' AM';
            }

        }
        return time
    }

    useFocusEffect(
        React.useCallback(() => {
            getName();
            getLatitude();
            getTimeFormat();
            getPrayerData();
        }, [])
    );

    useEffect(() => {
        if (!firstName) {
            const timer = setTimeout(() => {
                router.push('../GetUserInfo');
            }, 0);
            return () => clearTimeout(timer);
        } else if (firstName && !latitude) {
            const timer = setTimeout(() => {
                router.push('../GetUserLocation');
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [firstName, latitude]); 

    const handleValueChange = async (prayer: string) => { // to change the true or false value for a prayer when the checkbox is clicked and increase or decrease
        // the number of saved prayers.
        const newValue = !prayerStatus[prayer];  // true/false
        const newPrayerStatus = { ...prayerStatus, [prayer]: newValue };
        let newPrayerCount = prayerCount

        if (newValue === true){// if it was false before and after clicking we changed to true, then increase the prayer count else decrease
            newPrayerCount += 1
        } else {
            newPrayerCount -= 1
        }

        const newPrayerData = { ...prayerData, status: newPrayerStatus, count: newPrayerCount };

        await AsyncStorage.setItem(todayDate, JSON.stringify(newPrayerData));
        
        setPrayerData(newPrayerData);
        setPrayerStatus(newPrayerStatus);
        setPrayerCount(newPrayerCount);
    }

    const prayers = [
        'Fajr',
        'Sunrise',
        'Dhuhr',
        'Asr',
        'Maghrib',
        'Isha'
    ];

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
        }).start();
    }, []);

    
    

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}>
            <Animated.Text style={[styles.header, {opacity: fadeAnim}]}>Welcome back {firstName}</Animated.Text>
            <Animated.Text style={[styles.smallHeader, {opacity: fadeAnim}]}>Prayer Times for {today.toLocaleString('default', {weekday: 'long'})}, {today.toLocaleString('default', {month: 'long'})} {date}</Animated.Text>
            
            <Animated.View style={[styles.salahView, {opacity: fadeAnim}]}>
            {/* code down is to get map to display only timings in prayers list as api comes with extra timings like sunset, imsak etc */}
            {prayerData && prayerData.timings? 
                prayers.map(prayer => {
                    let time = prayerData['timings'][prayer].split(' ')[0]; // since timezone not added to api call, it adds timezone to time so need to split
                    time = getTimeString(time)

                    return time ? (
                        <View key={prayer} style={styles.salahItem}>
                            <Text style={styles.salahText}>{prayer} </Text>
                            <Text style={styles.salahTime}>{String(time)}</Text>
                            
                            {prayer !== "Sunrise" && /**So theres no checkbox for Sunrise */
                                <Checkbox 
                                value={prayerStatus[prayer]}
                                onValueChange={async()=> await handleValueChange(prayer)}
                                />
                            } 
                            
                        </View>
                    ) : null;
                })
            : null}
            </Animated.View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
    },
    header: {
        color: '#fff',
        fontSize: 35,
        fontWeight: 'bold',
        alignSelf: 'center',  
        marginTop: 20  
    },
    smallHeader: {
        color: '#fff',
        fontSize: 25,
        fontWeight: 'bold',
        alignSelf: 'center',
        marginTop: 20,
        padding: 10,
        textAlign:'center'
        
    },
    
    salahView: {
        flexDirection: 'column',
        marginTop: 60,
        marginBottom: 50
    },

    salahItem: {
        backgroundColor: '#50584e',
        margin: 10,
        height: 85,
        width: 350,
        borderRadius: 10,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 22,
        marginRight: 22,
    },
    salahText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    salahTime: {
        color: '#fff',
        fontSize: 20,
    },


});
export default HomePage;

