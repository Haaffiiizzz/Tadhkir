import { Text, View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { LineChart } from 'react-native-chart-kit';
import { getWeeklyStreakData } from '@/utils/StreakHelper';

export default function Chart() {
  const [streakStorage, setStreakStorage] = useState<object | null>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const { colors, theme } = useTheme();
  const screenWidth = Dimensions.get('window').width;

  const getStreakStorageAndCount = async () => {
    const stored = await AsyncStorage.getItem("streakStorage");
    const parsed = stored ? JSON.parse(stored) : {};
    setStreakStorage(parsed);
  };

  useFocusEffect(
    useCallback(() => {
      getStreakStorageAndCount();
    }, [])
  );

  useEffect(() => {
    if (streakStorage) {
      const data = getWeeklyStreakData(streakStorage);
      setWeeklyData(data);
    }
  }, [streakStorage]);

  const labels = weeklyData.map((item) => item.label);
  const dataPoints = weeklyData.map((item) => item.value);

  const chartData = {
    labels,
    datasets: [
      {
        data: dataPoints,
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        contentContainerStyle={{ alignItems: 'center' }}
        style={styles.scrollContainer}
      >
        <LineChart
          data={chartData}
          width={Math.max(screenWidth, labels.length * 70)}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          fromZero
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#007AFF',
            },
          }}
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  scrollContainer: {
    flexGrow: 1,
  },
});
