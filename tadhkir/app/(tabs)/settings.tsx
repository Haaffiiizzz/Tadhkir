import { View, Button, StyleSheet, Text, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import React, { useState, useEffect } from 'react';
import { Switch } from 'react-native-switch';
import * as Notifications from 'expo-notifications';
import { Dropdown } from 'react-native-element-dropdown';
import scheduleAllNotifications, { scheduleNotification } from '@/utils/NotificationsManager';
import { daysToSchedule, GetDateFormat } from '@/utils/Helper';
import { requestLocation } from '@/utils/LocationHelper';
import { locationFromSettings } from '@/utils/setUpPrayerStorage';
import * as Location from 'expo-location';

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
  const [offsets, setOffsets] = useState<Record<string, string>>({});
  const [locationReady, setLocationReady] = useState(false)

  const [value, setValue] = useState(null);

  const predefinedLocations = [
      { label: "Cairo, Egypt", value: { latitude: 30.0444, longitude: 31.2357 } },
      { label: "Riyadh, Saudi Arabia", value: { latitude: 24.7136, longitude: 46.6753 } },
      { label: "Istanbul, Turkey", value: { latitude: 41.0082, longitude: 28.9784 } },
      { label: "Jakarta, Indonesia", value: { latitude: -6.2088, longitude: 106.8456 } },
      { label: "London, UK", value: { latitude: 51.5074, longitude: -0.1278 } },
      { label: "New York, USA", value: { latitude: 40.7128, longitude: -74.0060 } },
      { label: "Karachi, Pakistan", value: { latitude: 24.8607, longitude: 67.0011 } },
      { label: "Lagos, Nigeria", value: { latitude: 6.5244, longitude: 3.3792 } },
      { label: "Kuala Lumpur, Malaysia", value: { latitude: 3.1390, longitude: 101.6869 } },
      { label: "Toronto, Canada", value: { latitude: 43.6532, longitude: -79.3832 } },
      { label: "Winnipeg, Canada", value: { latitude: 49.8951, longitude: -97.1384 } },
      { label: "Edmonton, Canada", value: { latitude: 53.5461, longitude: -113.4938 } },
      { label: "Abuja, Nigeria", value: { latitude: 9.0765, longitude: 7.3986 } },
  ];

  useEffect(() => {
    const loadTimeFormat = async () => {
      const storedFormat = await AsyncStorage.getItem('timeformat');
      if (storedFormat === '24h') {
        setIs24Hour(true);
      } else {
        setIs24Hour(false);
      }
    };

    loadTimeFormat();
  }, []);

  useEffect(() => {
    //load already saved offsets for each prayer so they can be used as values in the dropdown
    const loadOffsets = async () => {
      const loadedOffsets: Record<string, string> = {};
      for (const prayer of prayers) {
        const key = `${prayer}Offset`;
        const stored = await AsyncStorage.getItem(key);
        loadedOffsets[prayer] = stored || '5'; // default to '5' if nothing is stored
      }
      setOffsets(loadedOffsets);
    };

    loadOffsets();
  }, []);

  const changeTimeFormat = async () => {
    const newFormat = is24Hour ? '24h' : '12h';
    await AsyncStorage.setItem('timeformat', newFormat);
    setIs24Hour(!is24Hour);
  };

  const confirmClearData = () => {
    Alert.alert('Confirm', 'Are you sure you want to clear all data?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: async () => {
          await AsyncStorage.clear();
          sendNotif('Data Cleared');
          await Notifications.cancelAllScheduledNotificationsAsync();
          await AsyncStorage.setItem('NotificationScheduled', '');
          restartApp();
        },
      },
    ]);
  };

  const sendNotif = (text: string) => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'Tadhkir',
        body: text,
      },
      trigger: null,
    });
  };

  const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  const data = [
    { label: '1 minute', value: '1' },
    { label: '2 minutes', value: '2' },
    { label: '3 minutes', value: '3' },
    { label: '5 minutes', value: '5' },
    { label: '10 minutes', value: '10' },
    { label: '15 minutes', value: '15' },
  ];

  const changeOffset = async (prayer: string, newOffset: number) => {
    /**
     * Function to set a new offset in minutes for any prayer 
     */
    const storageKey = `${prayer}Offset`;

    await AsyncStorage.setItem(storageKey, newOffset.toString());
    setOffsets((prev) => ({ ...prev, [prayer]: newOffset.toString() }));
    //after changing offset, itd also make sense to reschedule the notification for that prayer
    await rescheduleNotification(prayer, newOffset);
  };


  const rescheduleNotification = async (prayer: string, newOffset: number) => {
    /**
     * Function that runs after offset for a prayer is changed. It first cancels the old notification for that prayer, and then creates a new one. 
     */

    const notificationIdentifier = await AsyncStorage.getItem(`${prayer}NotificationID`);

    if (notificationIdentifier) {
      await Notifications.cancelScheduledNotificationAsync(notificationIdentifier); // we first cancel old notification and then create a new one
      
    }

    const todayDataStr = await AsyncStorage.getItem(GetDateFormat());
    if (!todayDataStr) return;

    const todayData = JSON.parse(todayDataStr);
    const todayTime = todayData.timings[prayer].split(' ')[0];
    const todayDate = GetDateFormat()
    await scheduleNotification(prayer, todayTime, newOffset, todayDate);
  };

  const getPrayerFunction = async (latitude: number, longitude: number) => {
    if (latitude && longitude){
      await locationFromSettings(latitude.toString(), longitude.toString())
      setLocationReady(true)
      if (locationReady){
        await Notifications.cancelAllScheduledNotificationsAsync()
        const daysToScheduleList = await daysToSchedule()
        await scheduleAllNotifications(daysToScheduleList)
        
      }
    }

  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={ {justifyContent: 'center', alignItems: 'center'}}>
      <View style = {styles.settingSection}>
        
        <Text style={styles.sectionHeader}>Toggle to change time format!</Text>
        <Switch
          onValueChange={changeTimeFormat}
          value={is24Hour}
          activeText={'12h'}
          inActiveText={'24h'}
          circleSize={40}
          switchLeftPx={8}
          switchRightPx={8}
        />
      </View>


      <View style = {styles.settingSection}>

        <Text style={styles.sectionHeader}>Adjust Notification Offset!</Text>

        {prayers.map((prayer) => {
        return (
          <View key={prayer}>
            <Text style={[styles.label, { color: 'blue' }]}>{prayer}</Text>

            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              data={data}
              maxHeight={300}
              labelField="label"
              valueField="value"
              value={offsets[prayer]}
              onChange={(item) => {
                changeOffset(prayer, item.value);
              }}
            />
          </View>
        );
      })}
      </View>


      <View style={styles.settingSection}>
          <Text style={styles.sectionHeader}>Change Location!</Text>

          <Button
              title="Automatically get location"
              onPress={async () => {
                  const locationData = await requestLocation();

                  if (locationData) {
                      const [latitude, longitude] = locationData;

                      const newAddressArray = await Location.reverseGeocodeAsync({ latitude: Number(latitude), longitude: Number(longitude) });
                      
                      const savedAddressItem = await AsyncStorage.getItem("Address");
                      const savedAddressArray = savedAddressItem ? JSON.parse(savedAddressItem) : null;

                      if (newAddressArray[0].city != savedAddressArray[0].city){
                          await getPrayerFunction(latitude, longitude);
                      } //i.e theres really no need to get new data if the user is still in the same city. 
                          
                  }
              }}
          />

          <Dropdown //use on  confirm selection 
              style={styles.dropdown}
              data={predefinedLocations}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              maxHeight={300}
              onChange={async (item) => {
                  const latitude = item.value.latitude
                  const longitude = item.value.longitude
                  setValue(item.label)
                  await getPrayerFunction(latitude, longitude)
              }}
              placeholder={value ? value : "Please make a selection!"}
              labelField="label"
              valueField="value"
              value= {value}
                          
          />
      </View>

      <Button title="Clear All Data" onPress={confirmClearData} />

      <Button
        title="Test Notification"
        onPress={() => {
          sendNotif('Testing Notifications!');
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 100,
    flex: 1,
    backgroundColor: '#25292e',
  },
  text: {
    margin: 10,
    fontSize: 20,
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

  settingSection: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    backgroundColor: '#2f3338',
    marginVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: '95%',
    padding: 12, 
  },

  sectionHeader: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ddd',
    marginBottom: 8,
}


});
