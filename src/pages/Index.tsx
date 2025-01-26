import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScanIcon, Smartphone, QrCode, QrCodeIcon } from 'lucide-react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import QRScanner from '@/components/QRScanner';
import NumberInput from '@/components/NumberInput';
import MomoPayInput from '@/components/MomoPayInput';
import QRCodeGenerator from '@/components/QRCodeGenerator';

type PaymentMethod = "none" | "qr" | "number" | "momopay" | "generate";

const Stack = createNativeStackNavigator();

const HomeScreen = ({ navigation }) => {
  const navigateToScreen = (screen: PaymentMethod) => {
    switch (screen) {
      case "qr":
        navigation.navigate('QRScanner');
        break;
      case "number":
        navigation.navigate('NumberInput');
        break;
      case "momopay":
        navigation.navigate('MomoPayInput');
        break;
      case "generate":
        navigation.navigate('QRCodeGenerator');
        break;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rwanda MOMO Pay</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => navigateToScreen("qr")}
        >
          <ScanIcon size={24} color="#003366" />
          <Text style={styles.primaryButtonText}>Scan QR Code</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigateToScreen("number")}
        >
          <Smartphone size={24} color="#003366" />
          <Text style={styles.buttonText}>Enter Number</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigateToScreen("momopay")}
        >
          <QrCode size={24} color="#003366" />
          <Text style={styles.buttonText}>MomoPay Code</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigateToScreen("generate")}
        >
          <QrCodeIcon size={24} color="#003366" />
          <Text style={styles.buttonText}>Generate Payment QR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="QRScanner" component={QRScanner} />
        <Stack.Screen name="NumberInput" component={NumberInput} />
        <Stack.Screen name="MomoPayInput" component={MomoPayInput} />
        <Stack.Screen name="QRCodeGenerator" component={QRCodeGenerator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003366',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    height: 80,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#FFCB05',
  },
  secondaryButton: {
    backgroundColor: 'white',
  },
  buttonText: {
    fontSize: 18,
    color: '#003366',
    fontWeight: '500',
  },
  primaryButtonText: {
    fontSize: 18,
    color: '#003366',
    fontWeight: '600',
  },
});

export default App;