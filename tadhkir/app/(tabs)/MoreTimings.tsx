import { Text, View, StyleSheet, ScrollView, Button,} from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDaysList } from '@/utils/Helper';




export default function MoreTimings(){
    const [monthStorage, setMonthStorage] = useState<Array<any> | null>([]); 
    const year = new Date().getFullYear()
    
    useEffect(() => {
        const fetchStorage = async () => {
        const storedValue = await AsyncStorage.getItem("monthStorage")
        if (storedValue) {
            const storage = JSON.parse(storedValue)
            setMonthStorage(storage)
        }
        }
        fetchStorage()
    }, [])

    const [daysPerMonth, setDaysPerMonth] = useState<Record<number, string[]>>({});
    const [countPerMonth, setCountPerMonth] = useState<Record<number, number[]>>({});
    
      useEffect(() => {
        if (monthStorage?.length) { // creating a new dict to store the day number for each month. looks like {1: [1, 2, 3.., 31], 2:[1, 2, 3..., 28]}
          const newDaysPerMonth: Record<number, string[]> = {};
          monthStorage.forEach((month: number) => {
            const monthList = getDaysList(month, year);
            newDaysPerMonth[month] = monthList;
          });
          setDaysPerMonth(newDaysPerMonth);
        }
      }, [monthStorage]);

    return (
        <View>
            {
                Object.keys(daysPerMonth).map((month) => {
                    return <Text key={month}>{month}</Text>;
                })
            }
        </View>
    )

};