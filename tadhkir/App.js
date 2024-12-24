import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

export default function App() {
  const [count, setCount] = useState(0);
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Your First React Native App!</Text>
      <Text style={styles.counter}>Count is {count}</Text>
      <Button title="Increase Count" onPress={() => setCount(count + 1)} />
      <Button title = "Reduce Count"  onPress={() => setCount(count - 1)} />
    </View>
  );
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  counter: {
    fontSize: 18,
    marginVertical: 10,
  },
});
