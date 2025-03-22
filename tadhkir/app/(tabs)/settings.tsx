import { View, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';



export default function Settings() {
    const restartApp = async () => {
        try {
          await Updates.reloadAsync();
        } catch (e) {
          console.error(e);
        }
      };
      
    return (
        <View style={styles.container}>  
            <Button
                title="Clear All Data"
                onPress={() => {
                    AsyncStorage.clear(),
                    restartApp();
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  }
});