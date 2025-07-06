import {Text, TextInput, Button,View} from "react-native"
import React, { useEffect, useState } from 'react';
const SignIn = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    return (
        <View>
        <TextInput style={styles.textInput}
            onChangeText={setEmail}
            value={email}
            placeholder='Enter username or email address'
        />

        <TextInput style={styles.textInput}
            onChangeText={setPassword}
            value={password}
            placeholder='Enter password.'
        />
        
        <Button
            title="Submit" 
            onPress={ async () => { 
             console.log(email, password)
            }} 
        />
        </View>
    )
}
export default SignIn;