import { View, Text, TouchableOpacity, StyleSheet, TextInput  } from 'react-native';
import { useRouter } from 'expo-router';
import React, {useState} from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from './context/UserContext';

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useUser();

  const handleLogin = async () => {
    console.log('Username:', username);
    console.log('Password:', password);
     try {
      const res = await fetch('http://localhost:8081/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json(); // { userId, username }
        setUser(data); 
        router.replace('/home');
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);


  return (
    <View style={styles.backgroundContainer}>
      <Text style={styles.header}>Stock Watch</Text>
      <View style={styles.subContainer}>
        {/* <Text style={styles.subHeader}>Welcome Back</Text> */}
        <TextInput style={{...styles.input, marginTop: '15%'}}
          placeholder = "Username"
          value={username}
          onChangeText={setUsername}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passwordVisible}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Ionicons
              name={passwordVisible ? 'eye' : 'eye-off'}
              size={24}
              color="#1e1a2cff"
            />
          </TouchableOpacity>
        </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogin}>
        <Text style={styles.subHeader}>Don't have an account? Create one now!</Text>
      </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FF8C04'
  },
  header: {
    color: '#fff',
    fontSize: 35,
    marginTop: '50%',
  },
  subContainer: {
    width: '100%',
    height: '90%',
    marginTop: 60,
    alignItems: 'center',
    backgroundColor: '#181424',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    padding: 40,
  },
  subHeader: {
    color: '#4a4370ff',
    fontSize: 16,
    marginTop: '10%',
    fontFamily: 'monospace',
  },
  input: {
    fontSize: 16,
    backgroundColor: '#2a2640',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 8,
    marginBottom: '10%',
    marginTop: 10,
    width: '100%',
  },
  loginButton: {
    backgroundColor: '#FF8C04',
    paddingVertical: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  passwordContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: '10%',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 26,
  },

});
