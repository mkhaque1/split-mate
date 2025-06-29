import Button from '@/components/Button';
import React from 'react';
import { Linking, Modal, ScrollView, Text, View } from 'react-native';

export default function PrivacyModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <View
          style={{
            backgroundColor: '#18181b',
            borderRadius: 16,
            padding: 24,
            maxHeight: '80%',
            width: '100%',
          }}
        >
          <ScrollView>
            <Text
              style={{
                color: '#fff',
                fontFamily: 'Inter-Bold',
                fontSize: 18,
                marginBottom: 12,
                textAlign: 'center',
              }}
            >
              Privacy Policy
            </Text>
            <Text
              style={{
                color: '#fff',
                fontFamily: 'Inter-Regular',
                fontSize: 14,
                marginBottom: 16,
                textAlign: 'left',
              }}
            >
              Your privacy is important to us. This app does not share your
              personal information with third parties. All data is securely
              stored and only used to provide app functionality. By using
              SplitMate, you agree to our privacy practices.
              {'\n\n'}
              This app is made by{' '}
              <Text
                style={{ color: '#6366f1', textDecorationLine: 'underline' }}
                onPress={() => Linking.openURL('https://pyonet.com')}
              >
                pyonet.com
              </Text>
              . Visit our agency website for more info.
              {'\n\n'}
              For any questions or concerns, please contact support.
            </Text>
            <Button size="sm" title="Close" onPress={onClose} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
