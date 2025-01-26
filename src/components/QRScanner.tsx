import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { ArrowLeft } from 'lucide-react-native';

const QRScanner = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleBarCodeScanned = ({ data }) => {
    try {
      const parsedData = JSON.parse(data);
      if (!amount) {
        alert('Please enter an amount first');
        return;
      }

      const ussdCode = parsedData.type === 'account'
        ? `tel:*182*1*1*${parsedData.code}*${amount}%23`
        : `tel:*182*8*1*${parsedData.code}*${amount}%23`;

      Linking.openURL(ussdCode);
    } catch (error) {
      alert('Invalid QR code');
    }
  };

  const handleStartScanning = () => {
    if (!amount) {
      alert('Please enter an amount first');
      return;
    }

    if (!/^\d+$/.test(amount)) {
      alert('Please enter a valid amount');
      return;
    }

    setIsScanning(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={20} color="#003366" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      {!isScanning ? (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Amount (RWF)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleStartScanning}
          >
            <Text style={styles.scanButtonText}>Start Scanning</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <RNCamera
          style={styles.camera}
          onBarCodeRead={handleBarCodeScanned}
          captureAudio={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    marginLeft: 8,
    color: '#003366',
    fontSize: 16,
  },
  inputContainer: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 4,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  scanButton: {
    backgroundColor: '#FFCB05',
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonText: {
    color: '#003366',
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
    borderRadius: 8,
  },
});

export default QRScanner;