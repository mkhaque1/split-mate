import * as Linking from 'expo-linking';
import { Alert, Share } from 'react-native';

interface ShareGroupOptions {
  groupId: string;
  groupName: string;
  inviterName: string;
}

export const generateInviteLink = (groupId: string): string => {
  // Create a deep link that will work with your app
  const deepLink = Linking.createURL(`/invite/${groupId}`);
  console.log('Generated invite link:', deepLink);
  
  // For production, you might want to use a custom domain or Firebase Dynamic Links
  // For now, we'll use the expo deep link
  return deepLink;
};

export const generatePlayStoreLink = (): string => {
  // Use the provided Play Store link
  return 'https://play.google.com/store/apps/details?id=com.mysplitmate.app&utm_source=emea_Med';
};

export const shareGroupInvite = async ({ groupId, groupName, inviterName }: ShareGroupOptions): Promise<boolean> => {
  try {
    const inviteLink = generateInviteLink(groupId);
    const playStoreLink = generatePlayStoreLink();
    
    console.log('Sharing group invite:', { groupId, groupName, inviterName });
    console.log('Invite link:', inviteLink);
    console.log('Play Store link:', playStoreLink);
    
    // Create a message that includes both links in the text
    const shareMessage = `🎉 ${inviterName} invited you to join "${groupName}" on SplitMate!

💰 Track shared expenses easily
📊 See who owes what instantly

🔗 Join the group:
${inviteLink}

📱 Download SplitMate:
${playStoreLink}

#SplitMate #SharedExpenses`;

    console.log('Share message:', shareMessage);

    // Try sharing with both message and url for better compatibility
    const result = await Share.share(
      {
        message: shareMessage,
        title: `Join "${groupName}" on SplitMate`,
      },
      {
        dialogTitle: `Share "${groupName}" invite`,
        subject: `Join "${groupName}" on SplitMate`,
      }
    );

    console.log('Share result:', result);

    if (result.action === Share.sharedAction) {
      return true;
    } else if (result.action === Share.dismissedAction) {
      return false;
    }
    
    return false;
  } catch (error) {
    console.error('Error sharing group invite:', error);
    Alert.alert(
      'Share Failed',
      'Unable to share the group invite. Please try again.',
      [{ text: 'OK', style: 'default' }]
    );
    return false;
  }
};

export const copyInviteLink = async (groupId: string): Promise<boolean> => {
  try {
    const inviteLink = generateInviteLink(groupId);
    
    // Try to use expo-clipboard with dynamic import
    const { setStringAsync } = await import('expo-clipboard');
    await setStringAsync(inviteLink);
    
    Alert.alert(
      'Link Copied!',
      'The invite link has been copied to your clipboard.',
      [{ text: 'OK', style: 'default' }]
    );
    
    return true;
  } catch (error) {
    console.error('Error copying invite link:', error);
    
    // Fallback: show the link in an alert so user can copy manually
    const inviteLink = generateInviteLink(groupId);
    Alert.alert(
      'Invite Link',
      `Copy this link to share with friends:\n\n${inviteLink}`,
      [
        { text: 'OK', style: 'default' }
      ]
    );
    return false;
  }
};