import { useApp } from '@/context/AppContext';
import { FirestoreService } from '@/lib/firestore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';

export default function JoinGroupScreen() {
  const { user, refreshGroups } = useApp();
  const router = useRouter();
  const { groupId } = useLocalSearchParams();
  const [joining, setJoining] = useState(true);

  useEffect(() => {
    const joinGroup = async () => {
      if (!user) {
        // Redirect to auth, then back to this page after login
        router.replace({
          pathname: '/auth',
          params: { redirect: `/invite/${groupId}` },
        });
        return;
      }
      try {
        const group = await FirestoreService.getGroup(groupId as string);
        if (!group) {
          Alert.alert('Error', 'Group not found');
          router.replace('/(tabs)');
          return;
        }
        if (!group.members.includes(user.id)) {
          await FirestoreService.addMemberToGroup(groupId as string, user.id);
          await refreshGroups();
        }
        Alert.alert('Success', `You have joined "${group.name}"`);
        router.replace('/(tabs)');
      } catch (error) {
        Alert.alert('Error', 'Failed to join group');
        router.replace('/(tabs)');
      } finally {
        setJoining(false);
      }
    };
    joinGroup();
  }, [user, groupId]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f0f0f',
      }}
    >
      <ActivityIndicator size="large" color="#6366f1" />
      <Text style={{ color: '#fff', marginTop: 16 }}>Joining group...</Text>
    </View>
  );
}
