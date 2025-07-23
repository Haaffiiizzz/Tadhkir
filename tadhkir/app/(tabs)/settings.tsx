import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Text, Alert, ScrollView, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import { Switch } from 'react-native-switch';
import * as Notifications from 'expo-notifications';
import { Dropdown } from 'react-native-element-dropdown';
import * as Location from 'expo-location';

import scheduleAllNotifications, { reschedulePrayerWithNewOffset} from '@/utils/NotificationsManager';
import { daysToSchedule} from '@/utils/Helper';
import { requestLocation } from '@/utils/LocationHelper';
import { locationFromSettings } from '@/utils/setUpPrayerStorage';

import { useTheme } from '../contexts/ThemeContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const offsetOptions = [
  { label: '1 minute', value: '1' },
  { label: '2 minutes', value: '2' },
  { label: '3 minutes', value: '3' },
  { label: '5 minutes', value: '5' },
  { label: '10 minutes', value: '10' },
  { label: '15 minutes', value: '15' },
];

const predefinedLocations = [
  { label: 'Cairo, Egypt', value: { latitude: 30.0444, longitude: 31.2357 } },
  { label: 'Riyadh, Saudi Arabia', value: { latitude: 24.7136, longitude: 46.6753 } },
  { label: 'Istanbul, Turkey', value: { latitude: 41.0082, longitude: 28.9784 } },
  { label: 'Jakarta, Indonesia', value: { latitude: -6.2088, longitude: 106.8456 } },
  { label: 'London, UK', value: { latitude: 51.5074, longitude: -0.1278 } },
  { label: 'New York, USA', value: { latitude: 40.7128, longitude: -74.0060 } },
  { label: 'Karachi, Pakistan', value: { latitude: 24.8607, longitude: 67.0011 } },
  { label: 'Lagos, Nigeria', value: { latitude: 6.5244, longitude: 3.3792 } },
  { label: 'Kuala Lumpur, Malaysia', value: { latitude: 3.139, longitude: 101.6869 } },
  { label: 'Toronto, Canada', value: { latitude: 43.6532, longitude: -79.3832 } },
  { label: 'Winnipeg, Canada', value: { latitude: 49.8951, longitude: -97.1384 } },
  { label: 'Edmonton, Canada', value: { latitude: 53.5461, longitude: -113.4938 } },
  { label: 'Abuja, Nigeria', value: { latitude: 9.0765, longitude: 7.3986 } },
];

export default function Settings() {
  const { colors, toggleTheme, theme } = useTheme();

  const [is24Hour, setIs24Hour] = useState(false);
  const [offsets, setOffsets] = useState<Record<string, string>>({});
  const [locationReady, setLocationReady] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  useEffect(() => {
    const loadTimeFormat = async () => {
      const storedFormat = await AsyncStorage.getItem('timeformat');
      setIs24Hour(storedFormat === '24h');
    };
    loadTimeFormat();
  }, []);

  useEffect(() => {
    const loadOffsets = async () => {
      const loadedOffsets: Record<string, string> = {};
      for (const prayer of prayers) {
        const stored = await AsyncStorage.getItem(`${prayer}Offset`);
        loadedOffsets[prayer] = stored || '5';
      }
      setOffsets(loadedOffsets);
    };
    loadOffsets();
  }, []);

  const changeTimeFormat = async () => {
    const newFormat = is24Hour ? '12h' : '24h';
    await AsyncStorage.setItem('timeformat', newFormat);
    setIs24Hour(!is24Hour);
  };

  const confirmClearData = () => {
    Alert.alert('Confirm', 'Are you sure you want to clear all data?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          await AsyncStorage.clear();
          await Notifications.cancelAllScheduledNotificationsAsync();
          await AsyncStorage.setItem('NotificationScheduled', '');
          sendNotif('Data Cleared');
          await Updates.reloadAsync();
        },
      },
    ]);
  };

  const sendNotif = (text: string) => {
    Notifications.scheduleNotificationAsync({
      content: { title: 'Tadhkir', body: text, sound: 'adhan.wav', },
       trigger: {
    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    seconds: 2,}
    });
  };

  const changeOffset = async (prayer: string, newOffset: number) => {
    await AsyncStorage.setItem(`${prayer}Offset`, newOffset.toString());
    setOffsets((prev) => ({ ...prev, [prayer]: newOffset.toString() }));
    await reschedulePrayerWithNewOffset(prayer, newOffset);
  };

  // const rescheduleNotification = async (prayer: string, newOffset: number) => {
  //   const notifId = await AsyncStorage.getItem(`${prayer}NotificationID`);
  //   if (notifId) await Notifications.cancelScheduledNotificationAsync(notifId);

  //   const todayDataStr = await AsyncStorage.getItem(GetDateFormat());
  //   if (!todayDataStr) return;

  //   const todayData = JSON.parse(todayDataStr);
  //   const todayTime = todayData.timings[prayer].split(' ')[0];
  //   const todayDate = GetDateFormat();

  //   await scheduleNotification(prayer, todayTime, newOffset, todayDate);
  // };

  const getPrayerFunction = async (latitude: number, longitude: number) => {
    if (!latitude || !longitude) return;

    await locationFromSettings(latitude.toString(), longitude.toString());
    setLocationReady(true);

    if (locationReady) {
      
      await displayAlert("Location Changed Successfully")
      await Notifications.cancelAllScheduledNotificationsAsync();
      const daysList = await daysToSchedule();
      await scheduleAllNotifications(daysList);
    }
  };

  const displayAlert = async (displayText: string) => {
    Alert.alert(
      displayText
    )
  }



  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}
    >

      <View style={[styles.settingSection, {backgroundColor: colors.sectionBackground, borderColor: colors.sectionBorder}]}>
        <Text style={[styles.sectionHeader, {color: colors.text}]}>Toggle Light Mode!</Text>
        <Switch
          onValueChange={toggleTheme}
          value={theme === 'light'}
          activeText="Light Mode"
          inActiveText="Dark Mode"
          circleSize={40}
          switchLeftPx={8}
          switchRightPx={8}
          switchWidthMultiplier={3}
        />
      </View>

      <View style={[styles.settingSection, {backgroundColor: colors.sectionBackground, borderColor: colors.sectionBorder}]}>
        <Text style={[styles.sectionHeader, {color: colors.text}]}>Toggle to change time format!</Text>
        <Switch
          onValueChange={changeTimeFormat}
          value={is24Hour}
          activeText="24h"
          inActiveText="12h"
          circleSize={40}
          switchLeftPx={8}
          switchRightPx={8}
        />
      </View>

      <View style={[styles.settingSection, {backgroundColor: colors.sectionBackground, borderColor: colors.sectionBorder}]}>
        <Text style={[styles.sectionHeader, {color: colors.text}]}>Adjust Notification Offset!</Text>
        {prayers.map((prayer) => (
          <View key={prayer}>
            <Text style={[styles.label, { color: 'blue' }]}>{prayer}</Text>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              data={offsetOptions}
              maxHeight={300}
              labelField="label"
              valueField="value"
              value={offsets[prayer]}
              onChange={(item) => changeOffset(prayer, Number(item.value))}
            />
          </View>
        ))}
      </View>

      <View style={[styles.settingSection, {backgroundColor: colors.sectionBackground, borderColor: colors.sectionBorder}]}>
        <Text style={[styles.sectionHeader, {color: colors.text}]}>Change Location!</Text>
        <Button
          title="Automatically get location"
          onPress={async () => {
            const locationData = await requestLocation();
            if (locationData) {
              const [latitude, longitude] = locationData;
              const newAddressArray = await Location.reverseGeocodeAsync({
                latitude: Number(latitude),
                longitude: Number(longitude),
              });
              const savedAddressStr = await AsyncStorage.getItem('Address');
              const savedAddressArray = savedAddressStr ? JSON.parse(savedAddressStr) : null;

              if (
                newAddressArray?.[0]?.city !== savedAddressArray?.[0]?.city
              ) {
                await getPrayerFunction(latitude, longitude);

              }
            }
          }}
        />

        <Dropdown
          style={styles.dropdown}
          data={predefinedLocations}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          maxHeight={300}
          onChange={async (item) => {
            setSelectedLocation(item.label);
            await getPrayerFunction(item.value.latitude, item.value.longitude);
          }}
          placeholder={selectedLocation ?? 'Please make a selection!'}
          labelField="label"
          valueField="value"
          value={selectedLocation}
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
  borderRadius: 8,
  marginVertical: 12,
  justifyContent: 'center',
  alignItems: 'center',
  width: '95%',
  padding: 12,
},
  sectionHeader: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
});
