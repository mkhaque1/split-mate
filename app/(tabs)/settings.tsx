import Button from '@/components/Button';
import Card from '@/components/Card';
import CurrencySelector from '@/components/CurrencySelector';
import GradientText from '@/components/GradientText';
import { useApp } from '@/context/AppContext';
import { FirestoreService } from '@/lib/firestore';
import { User as UserType } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  DollarSign,
  LogOut,
  Settings as SettingsIcon,
  Trash2,
  User,
  Users,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

export default function SettingsScreen() {
  const { user, currentGroup, currency, setCurrency, signOut, refreshGroups } =
    useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [groupMembers, setGroupMembers] = useState<UserType[]>([]);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/auth');
      return;
    }
    loadGroupMembers();
  }, [user, currentGroup]);

  const loadGroupMembers = async () => {
    if (!currentGroup) return;

    try {
      const members = await FirestoreService.getUsers(currentGroup.members);
      setGroupMembers(members);
    } catch (error) {
      console.error('Error loading group members:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshGroups();
    await loadGroupMembers();
    setRefreshing(false);
  };

  const handleCurrencyChange = (selectedCurrency: string) => {
    setCurrency(selectedCurrency);
    setShowCurrencySelector(false);
    Alert.alert('Success', `Currency changed to ${selectedCurrency}`);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/auth');
          } catch (error) {
            Alert.alert('Error', 'Failed to sign out');
          }
        },
      },
    ]);
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    if (memberId === user?.id) {
      Alert.alert('Error', 'You cannot remove yourself from the group');
      return;
    }

    if (currentGroup?.createdBy !== user?.id) {
      Alert.alert('Error', 'Only the group admin can remove members');
      return;
    }

    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${memberName} from the group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implement member removal logic
              Alert.alert(
                'Info',
                'Member removal will be implemented in a future update'
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to remove member');
            }
          },
        },
      ]
    );
  };

  if (!user || !currentGroup) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const selectedCurrency =
    CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f0f0f', '#1a1a1a']} style={styles.gradient}>
        <View style={styles.header}>
          <GradientText
            style={styles.title}
            colors={['#ffffff', '#a1a1aa', '#71717a']}
          >
            Settings
          </GradientText>
          <Text style={styles.subtitle}>Manage your preferences</Text>
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* User Profile Section */}
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <User size={24} color="#6366f1" />
              <Text style={styles.sectionTitle}>Profile</Text>
            </View>

            <View style={styles.profileInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.displayName.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.displayName}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
            </View>
          </Card>

          {/* Currency Settings */}
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <DollarSign size={24} color="#10b981" />
              <Text style={styles.sectionTitle}>Currency</Text>
            </View>

            <View style={styles.currencyRow}>
              <View style={styles.currencyInfo}>
                <Text style={styles.currencyLabel}>Current Currency</Text>
                <Text style={styles.currencyValue}>
                  {selectedCurrency.name} ({selectedCurrency.symbol})
                </Text>
              </View>

              <Button
                title="Change"
                variant="outline"
                size="sm"
                onPress={() => setShowCurrencySelector(true)}
              />
            </View>
          </Card>

          {/* Group Members */}
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Users size={24} color="#f59e0b" />
              <Text style={styles.sectionTitle}>
                Group Members ({groupMembers.length})
              </Text>
            </View>

            <View style={styles.membersList}>
              {groupMembers.map((member) => (
                <View key={member.id} style={styles.memberItem}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberInitial}>
                      {member.displayName.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.displayName}</Text>
                    <Text style={styles.memberEmail}>{member.email}</Text>
                  </View>

                  <View style={styles.memberActions}>
                    {member.id === currentGroup.createdBy && (
                      <View style={styles.adminBadge}>
                        <Text style={styles.adminText}>Admin</Text>
                      </View>
                    )}

                    {currentGroup.createdBy === user.id &&
                      member.id !== user.id && (
                        <Button
                          title=""
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 size={16} color="#ef4444" />}
                          onPress={() =>
                            handleRemoveMember(member.id, member.displayName)
                          }
                          style={styles.removeButton}
                        />
                      )}
                  </View>
                </View>
              ))}
            </View>
          </Card>

          {/* Actions */}
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <SettingsIcon size={24} color="#ef4444" />
              <Text style={styles.sectionTitle}>Actions</Text>
            </View>

            <Button
              title="Sign Out"
              variant="outline"
              icon={<LogOut size={20} color="#ef4444" />}
              onPress={handleSignOut}
              style={styles.signOutButton}
            />
          </Card>

          {/* App Info */}
          <Card style={styles.sectionCard}>
            <Text style={styles.appName}>SplitMate</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appDescription}>
              Smart shared expense tracker for couples, roommates & friends
            </Text>
          </Card>
        </ScrollView>

        {/* Currency Selector Modal */}
        <CurrencySelector
          visible={showCurrencySelector}
          currencies={CURRENCIES}
          selectedCurrency={currency}
          onSelect={handleCurrencyChange}
          onClose={() => setShowCurrencySelector(false)}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#a1a1aa',
    fontFamily: 'Inter-Regular',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionCard: {
    backgroundColor: '#262626',
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontFamily: 'Inter-SemiBold',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    color: '#ffffff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#a1a1aa',
    fontFamily: 'Inter-Regular',
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currencyInfo: {
    flex: 1,
  },
  currencyLabel: {
    fontSize: 14,
    color: '#a1a1aa',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  currencyValue: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'Inter-Regular',
  },
  membersList: {
    gap: 16,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInitial: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'Inter-SemiBold',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'Inter-Medium',
  },
  memberEmail: {
    fontSize: 14,
    color: '#a1a1aa',
    fontFamily: 'Inter-Regular',
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adminBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  adminText: {
    fontSize: 12,
    color: '#ffffff',
    fontFamily: 'Inter-SemiBold',
  },
  removeButton: {
    width: 36,
    height: 36,
    padding: 0,
  },
  signOutButton: {
    borderColor: '#ef4444',
  },
  appName: {
    fontSize: 18,
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#a1a1aa',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    color: '#71717a',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
});
