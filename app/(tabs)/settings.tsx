import AddMemberModal from '@/components/AddMemberModal';
import Button from '@/components/Button';
import Card from '@/components/Card';
import CurrencySelector from '@/components/CurrencySelector';
import GradientText from '@/components/GradientText';
import Subscribe from '@/components/Subscribe';
import { useApp } from '@/context/AppContext';
import { db } from '@/lib/firebase';
import { FirestoreService } from '@/lib/firestore';
import { User as UserType } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  DollarSign,
  LogOut,
  Pencil,
  Settings as SettingsIcon,
  Trash2,
  User,
  Users,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AdEventType,
  InterstitialAd,
  TestIds,
} from 'react-native-google-mobile-ads';

const interstitial = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL, {
  requestNonPersonalizedAdsOnly: true,
});

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
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
];

export default function SettingsScreen() {
  const { user, currentGroup, setCurrency, signOut, refreshGroups, setIsPro } =
    useApp();

  const [refreshing, setRefreshing] = useState(false);
  const [groupMembers, setGroupMembers] = useState<UserType[]>([]);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(user?.displayName || '');
  const currency = currentGroup?.currency || 'USD';

  const { isPro, userSelectedPlan, setUserSelectedPlan } = useApp();
  console.log('User in Settings:', isPro);

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

  const handleRemoveMember = async (memberId: string, memberName: string) => {
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
              // Remove member from Firestore group
              const groupRef = doc(db, 'groups', currentGroup.id);
              await updateDoc(groupRef, {
                members: currentGroup.members.filter((id) => id !== memberId),
              });

              // Optionally, refresh group members in UI
              await refreshGroups();
              await loadGroupMembers();

              Alert.alert(
                'Success',
                `${memberName} has been removed from the group.`
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to remove member');
            }
          },
        },
      ]
    );
  };

  // Add member handler
  const handleAddMember = async (member) => {
    // Find user by email in Firestore
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', member.email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      Alert.alert(
        'User Not Found',
        'No user found with this email. Please ask them to sign up first.'
      );
      return;
    }

    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;

    // Add userId to group members in Firestore
    const groupRef = doc(db, 'groups', currentGroup.id);
    const groupSnap = await getDoc(groupRef);
    if (!groupSnap.exists()) return;

    const currentMembers = groupSnap.data().members || [];
    if (currentMembers.includes(userId)) {
      Alert.alert('Already a member', 'This user is already in the group.');
      return;
    }

    await updateDoc(groupRef, {
      members: [...currentMembers, userId],
    });

    // Refresh local members list
    await loadGroupMembers();
    Alert.alert('Success', 'Member added to the group!');
  };

  const handleSaveName = async () => {
    if (!newDisplayName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    try {
      // Update Firestore
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { displayName: newDisplayName.trim() });
      // Optionally update local user state if needed
      user.displayName = newDisplayName.trim();
      setEditingName(false);
      Alert.alert('Success', 'Name updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update name');
    }
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

  const handleRemoveSubscription = async () => {
    Alert.alert(
      'Remove Subscription',
      'Are you sure you want to remove your subscription?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await FirestoreService.UpdatePlan(
                user.id,
                false,
                '',
                '',
                '',
                null
              );
              setUserSelectedPlan(null);
              setIsPro(false);
              null;
              Alert.alert(
                'Subscription Removed',
                'Your subscription has been removed successfully.'
              );
            } catch (error) {
              console.error('Error removing subscription:', error);
              Alert.alert('Error', 'Failed to remove subscription.');
            }
          },
        },
      ]
    );
  };

  // Show interstitial ad before opening AddMemberModal
  const handleShowAddMember = () => {
    if (isPro) {
      setShowAddMemberModal(true);
      return;
    }
    interstitial.load();
    const adListener = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        interstitial.show();
      }
    );
    const closeListener = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setShowAddMemberModal(true);
        adListener();
        closeListener();
      }
    );
    // If ad fails to load, open modal anyway
    const errorListener = interstitial.addAdEventListener(
      AdEventType.ERROR,
      () => {
        setShowAddMemberModal(true);
        adListener();
        closeListener();
        errorListener();
      }
    );
  };

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
                {editingName ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <TextInput
                      style={{
                        backgroundColor: '#262626',
                        color: '#fff',
                        fontFamily: 'Inter-SemiBold',
                        fontSize: 18,
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        minWidth: 120,
                      }}
                      value={newDisplayName}
                      onChangeText={setNewDisplayName}
                      autoFocus
                    />
                    <TouchableOpacity onPress={handleSaveName}>
                      <Text
                        style={{
                          color: '#10b981',
                          fontFamily: 'Inter-Bold',
                          fontSize: 16,
                        }}
                      >
                        Save
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingName(false);
                        setNewDisplayName(user.displayName);
                      }}
                    >
                      <Text
                        style={{
                          color: '#ef4444',
                          fontFamily: 'Inter-Bold',
                          fontSize: 16,
                        }}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <Text style={styles.userName}>{user.displayName}</Text>
                    <TouchableOpacity onPress={() => setEditingName(true)}>
                      <Pencil size={18} color="#6366f1" />
                    </TouchableOpacity>
                  </View>
                )}
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
              <View>
                {groupMembers.length === 0 && (
                  <Text style={{ color: '#a1a1aa', textAlign: 'center' }}>
                    No members in this group
                  </Text>
                )}
                <Button
                  title="Add Members Manually?"
                  variant="outline"
                  size="sm"
                  onPress={handleShowAddMember}
                  style={{ marginTop: 18 }}
                />
              </View>
              <AddMemberModal
                visible={showAddMemberModal}
                onClose={() => setShowAddMemberModal(false)}
                onAdd={handleAddMember}
              />
            </View>
          </Card>

          {/* Remove  Card */}
          {!isPro ? (
            <Card style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Remove Ads</Text>
              </View>
              <Button
                title="Remove Ads"
                variant="outline"
                onPress={() => setShowSubscribe(true)}
                style={{ marginTop: 8 }}
              />
            </Card>
          ) : (
            <Card style={styles.sectionCard}>
              <Text
                style={{
                  alignItems: 'center',
                  fontSize: 16,
                  color: '#fff',
                  fontFamily: 'Inter-Regular',
                  textAlign: 'center',
                }}
              >
                Your Plan
              </Text>
              <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                <Text
                  style={{
                    color: '#6366f1',
                    fontSize: 16,
                    fontFamily: 'Inter-Bold',
                    marginBottom: 8,
                  }}
                >
                  {userSelectedPlan?.label || 'Pro'}
                </Text>
                <Text
                  style={{
                    color: '#ffffff',
                    fontSize: 16,
                    fontFamily: 'Inter-Regular',
                    marginBottom: 8,
                  }}
                >
                  {userSelectedPlan?.price || ''}
                </Text>
                <Text
                  style={{
                    color: '#10b981',
                    fontSize: 14,
                    fontFamily: 'Inter-Bold',
                  }}
                >
                  Active
                </Text>
              </View>
            </Card>
          )}

          {isPro && (
            <TouchableOpacity
              onPress={() => handleRemoveSubscription()}
              style={styles.managePlanButton}
            >
              <Text style={styles.managePlanButtonText}>
                Remove Subscription
              </Text>
            </TouchableOpacity>
          )}

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

          {/* Privacy Policy Card */}
          <Card style={styles.sectionCard}>
            <TouchableOpacity onPress={() => setShowPrivacy(true)}>
              <Text
                style={{
                  color: '#fff',
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 14,
                  textAlign: 'center',
                }}
              >
                Privacy Policy
              </Text>
            </TouchableOpacity>
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

        {/* Subscribe Modal */}
        {showSubscribe && <Subscribe onClose={() => setShowSubscribe(false)} />}

        {/* Privacy Policy Modal */}
        <Modal visible={showPrivacy} animationType="slide" transparent>
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
                    fontFamily: 'Inter-Regular',
                    fontSize: 14,
                    marginBottom: 16,
                    textAlign: 'left',
                  }}
                >
                  {/* Replace this with your actual privacy policy legal text */}
                  Privacy Policy Your privacy is important to us. This app does
                  not share your personal information with third parties. All
                  data is securely stored and only used to provide app
                  functionality. For more details, please contact support.
                </Text>
                <Button
                  size="sm"
                  title="Close"
                  onPress={() => setShowPrivacy(false)}
                />
              </ScrollView>
            </View>
          </View>
        </Modal>
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
  managePlanButton: {
    backgroundColor: '#f86f6fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '95%',
    alignSelf: 'center',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  managePlanButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },

  header: {
    backgroundColor: 'Gradient',
    paddingBottom: 10,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#a1a1aa',
    fontFamily: 'Inter-Regular',
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
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
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'Inter-SemiBold',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
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
    fontSize: 14,
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
    fontSize: 14,
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 12,
    color: '#a1a1aa',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 12,
    color: '#71717a',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
});
