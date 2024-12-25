import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
;

export default function App() {
  const [count, setCount] = useState(1);
  const [name, setname] = useState("")
  

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Welcome {name || "User"}</Text>
      <TextInput
      style={styles.input}
      placeholder='Enter your name'
      value={name}
      onChangeText={(text) => setname(text)}
      />
      <Text style={styles.counter}>Count is {count}</Text>
      <Button title="Increase Count" onPress={() => setCount(count * 5)} />
      <Button title = "Reduce Count"  onPress={() => setCount(count / 3)} />
      
    </View>
  );
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  counter: {
    fontSize: 18,
    marginVertical: 10,
  },
});;
