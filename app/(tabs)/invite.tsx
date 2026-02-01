import Button from '@/components/Button';
import Card from '@/components/Card';
import GradientText from '@/components/GradientText';
import { db } from '@/lib/firebase';
import { FirestoreService } from '@/lib/firestore';
import { User as UserType } from '@/types';
import { copyInviteLink, shareGroupInvite } from '@/utils/shareUtils';

import { BannerAdComponent, interstitialAdManager } from '@/components/AdMobManager';
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
import { Copy, Share2, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useApp } from '../../context/AppContext';

export default function InviteScreen() {
  const { user, currentGroup, refreshGroups } = useApp();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [groupMembers, setGroupMembers] = useState<UserType[]>([]);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  const { isPro } = useApp();

  // Share group invite handlers
  const handleShareGroup = async () => {
    if (!currentGroup || !user) return;
    
    const success = await shareGroupInvite({
      groupId: currentGroup.id,
      groupName: currentGroup.name,
      inviterName: user.displayName,
    });
    
    if (success) {
      console.log('Group invite shared successfully');
    }
  };

  const handleCopyInviteLink = async () => {
    if (!currentGroup) return;
    
    await copyInviteLink(currentGroup.id);
  };

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

  if (!user || !currentGroup) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show interstitial ad before opening AddMemberModal
  const handleShowAddMember = async () => {
    if (isPro) {
      setShowAddMemberModal(true);
      return;
    }
    
    // Try to show interstitial ad
    const adShown = await interstitialAdManager.showAd();
    if (adShown) {
      // Ad was shown, wait a moment then show modal
      setTimeout(() => {
        setShowAddMemberModal(true);
      }, 500);
    } else {
      // Ad not available, show modal immediately
      setShowAddMemberModal(true);
    }
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

              // Remove from local state
              setGroupMembers(
                groupMembers.filter((member) => member.id !== memberId),
              );

              Alert.alert(
                'Success',
                `${memberName} has been removed from the group.`,
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to remove member');
            }
          },
        },
      ],
    );
  };

  // Add member handler
  const handleAddMember = async (member: any) => {
    console.log('adding member');
    // Find user by email in Firestore
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', member.email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      Alert.alert(
        'User Not Found',
        'No user found with this email. Please ask them to sign up first.',
      );
      return;
    }

    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;
    console.log('userid', userId);
    // Add userId to group members in Firestore
    const groupRef = doc(db, 'groups', currentGroup.id);
    const groupSnap = await getDoc(groupRef);
    console.log('snap is', groupSnap);
    if (!groupSnap.exists()) return;

    const currentMembers = groupSnap.data().members || [];
    if (currentMembers.includes(userId)) {
      Alert.alert('Already a member', 'This user is already in the group.');
      return;
    }

    await updateDoc(groupRef, {
      members: [...currentMembers, userId],
    });
    await onRefresh();

    // Refresh local members list
    // await loadGroupMembers();

    // setTimeout(async() => {

    Alert.alert('Success', 'Member added to the group!');
    // await onRefresh()

    // }, 1000);
  };
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f0f0f', '#281f5a']} style={styles.gradient}>
        <View style={styles.header}>
          <GradientText
            style={styles.title}
            colors={['#ffffff', '#a1a1aa', '#71717a']}
          >
            Invite
          </GradientText>
          <Text style={styles.subtitle}>
            Add members to {currentGroup.name}
          </Text>
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Add Members (Shifted from Settings) */}

          {/* Share Invite Section */}
          <Card style={styles.inviteCard}>
            <View style={styles.cardHeader}>
              <Share2 size={24} color='#8b5cf6' />
              <Text style={styles.cardTitle}>Share Group Invite</Text>
            </View>

            <View style={styles.shareSection}>
              <Text style={styles.shareDescription}>
                Invite friends to join "{currentGroup.name}" by sharing the group link
              </Text>
              
              <View style={styles.shareButtons}>
                <Button
                  title='Share Invite'
                  variant='primary'
                  size='sm'
                  icon={<Share2 size={16} color='#ffffff' />}
                  onPress={handleShareGroup}
                  style={styles.shareButton}
                />
                
                <Button
                  title='Copy Link'
                  variant='outline'
                  size='sm'
                  icon={<Copy size={16} color='#6366f1' />}
                  onPress={handleCopyInviteLink}
                  style={styles.shareButton}
                />
              </View>
              
              <Text style={styles.shareNote}>
                💡 Friends will be prompted to download the app if they don't have it
              </Text>
            </View>
          </Card>

        

          {/* Share Link Section */}
          {/* <Card style={styles.inviteCard}>
            <View style={styles.cardHeader}>
              <Link size={24} color="#10b981" />
              <Text style={styles.cardTitle}>Share Invite Link</Text>
            </View>

            <Text style={styles.cardDescription}>
              Share this link with anyone you want to add to your group
            </Text>

            <View style={styles.linkSection}>
              <View style={styles.linkContainer}>
                <Text style={styles.linkText} numberOfLines={2}>
                  {generateInviteLink()}
                </Text>
              </View>

              <View style={styles.linkButtons}>
                <Button
                  title="Copy"
                  variant="outline"
                  size="sm"
                  icon={<Copy size={16} color="#6366f1" />}
                  onPress={copyInviteLink}
                  style={styles.linkButton}
                />

                <Button
                  title="Share"
                  size="sm"
                  onPress={shareInviteLink}
                  style={styles.linkButton}
                />
              </View>
            </View>
          </Card> */}

          {/* Current Members Section */}
          <Card style={styles.membersCard}>
            <View style={styles.cardHeader}>
              <Users size={24} color='#f59e0b' />
              <Text style={styles.cardTitle}>
                Current Members ({groupMembers.length})
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

                  {member.id === currentGroup.createdBy && (
                    <View style={styles.adminBadge}>
                      <Text style={styles.adminText}>Admin</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>

            <View>
              {groupMembers.length === 0 && (
                <Text style={{ color: '#a1a1aa', textAlign: 'center' }}>
                  No members in this group
                </Text>
              )}
              <Button
                title='Add Members Manually?'
                variant='outline'
                size='sm'
                onPress={handleShowAddMember}
                style={{ marginTop: 18 }}
              />
            </View>
          </Card>

          {/* Instructions */}
          <Card style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>How to invite members:</Text>
            <View style={styles.instructionsList}>
              <Text style={styles.instructionItem}>
                • Send an email invitation directly from the app
              </Text>
              <Text style={styles.instructionItem}>
                • Copy the app's playstore link and share with your friends
              </Text>
              <Text style={styles.instructionItem}>
                • New members will need to create a SplitMate account
              </Text>
              <Text style={styles.instructionItem}>
                • Once they join, they'll automatically be added to this group
              </Text>
            </View>
          </Card>
        </ScrollView>
        {!isPro && <BannerAdComponent />}
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
    paddingBottom: 10,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
    paddingHorizontal: 30,
  },
  inviteCard: {
    backgroundColor: '#2b1753ff',
    marginBottom: 24,
  },
  membersCard: {
    backgroundColor: '#2b1753ff',
    marginBottom: 24,
  },
  instructionsCard: {
    backgroundColor: '#2b1753ff',
    marginBottom: 32,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontFamily: 'Inter-SemiBold',
  },
  cardDescription: {
    fontSize: 14,
    color: '#a1a1aa',
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
  },
  shareSection: {
    gap: 16,
  },
  shareDescription: {
    fontSize: 14,
    color: '#a1a1aa',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    textAlign: 'center',
  },
  shareButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  shareButton: {
    flex: 1,
    maxWidth: 140,
  },
  shareNote: {
    fontSize: 12,
    color: '#71717a',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  linkSection: {
    gap: 16,
  },
  linkContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#404040',
  },
  linkText: {
    fontSize: 14,
    color: '#a1a1aa',
    fontFamily: 'Inter-Regular',
  },
  linkButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  linkButton: {
    flex: 1,
  },
  membersList: {
    gap: 16,
    marginBottom: 29,
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
  instructionsTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  instructionsList: {
    gap: 8,
  },
  instructionItem: {
    fontSize: 14,
    color: '#a1a1aa',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  closeAdIcon: {
    position: 'absolute',
    right: 0,
    top: -10,
    padding: 8,
    zIndex: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 60,
    padding: 10,
    backgroundColor: '#1e1e1e',
    alignItems: 'center',
  },
  footerText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  removeButton: {
    width: 36,
    height: 36,
    padding: 0,
  },
});
