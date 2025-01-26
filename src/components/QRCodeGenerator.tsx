import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { ArrowLeft } from 'lucide-react-native';

const QRCodeGenerator = ({ navigation }) => {
  const [code, setCode] = useState('');
  const [type, setType] = useState<'account' | 'momopay'>('account');

  const generateQRData = () => {
    const data = {
      type,
      code,
      redirectUrl: 'https://momo-quickpay-hub.lovable.app/',
    };
    return JSON.stringify(data);
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

      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            {type === 'account' ? 'Account Number' : 'MomoPay Code'}
          </Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder={`Enter ${type === 'account' ? 'account number' : 'MomoPay code'}`}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[styles.typeButton, type === 'account' && styles.activeType]}
            onPress={() => setType('account')}
          >
            <Text style={[styles.typeText, type === 'account' && styles.activeTypeText]}>
              Account Number
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, type === 'momopay' && styles.activeType]}
            onPress={() => setType('momopay')}
          >
            <Text style={[styles.typeText, type === 'momopay' && styles.activeTypeText]}>
              MomoPay Code
            </Text>
          </TouchableOpacity>
        </View>

        {code && (
          <View style={styles.qrContainer}>
            <QRCode
              value={generateQRData()}
              size={200}
            />
          </View>
        )}
      </View>
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
  content: {
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeType: {
    backgroundColor: '#FFCB05',
  },
  typeText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTypeText: {
    color: '#003366',
    fontWeight: '600',
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
});

export default QRCodeGenerator;