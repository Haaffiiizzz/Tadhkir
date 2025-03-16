import { Text, View, StyleSheet } from 'react-native';
import {Link} from 'expo-router';
import { Platform } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tadhkir</Text>
      <Link href="/(tabs)/about" style={styles.button}>
        Get Started
      </Link>
    </View>
  ); 
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 35,
    fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'HelveticaNeue',
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  }
});
