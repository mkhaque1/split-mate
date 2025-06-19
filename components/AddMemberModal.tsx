import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TextInput, View } from 'react-native';
import Button from './Button';

export default function AddMemberModal({ visible, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleAdd = () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Error', 'Please enter name and email');
      return;
    }
    onAdd({ displayName: name.trim(), email: email.trim() });
    setName('');
    setEmail('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Add Member</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#71717a"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#71717a"
            autoCapitalize="none"
          />
          <View style={styles.actions}>
            <Button title="Cancel" variant="ghost" onPress={onClose} />
            <Button title="Add" onPress={handleAdd} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 24,
    width: 320,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#262626',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#404040',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
});
