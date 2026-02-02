# Share Group Feature

## Overview
The Share Group feature allows users to easily invite friends to join their expense groups by sharing invite links that work seamlessly with the app and Play Store.

## How It Works

### 1. Share Button Location
- Located in **Settings** tab under "Share Group" section
- Available to all group members
- Shows current group name in the description

### 2. Share Options

#### Share Invite Button
- Opens native share dialog with pre-formatted message
- Includes group name and inviter's name
- Contains both deep link and Play Store link
- Works with all sharing apps (WhatsApp, Telegram, Email, etc.)

#### Copy Link Button
- Copies the invite link to clipboard
- Shows confirmation alert
- Perfect for manual sharing or pasting in other apps

### 3. Invite Flow

#### For Users With App Installed
1. Click invite link → App opens automatically
2. App processes the group ID from the link
3. User is automatically added to the group
4. Success message shown
5. Redirected to main app

#### For Users Without App
1. Click invite link → Redirected to Play Store
2. Download and install SplitMate
3. Open app and sign up/sign in
4. Click invite link again → Automatically joins group

### 4. Deep Link Structure
```
splitmate://invite/[groupId]
```

### 5. Share Message Template
```
🎉 You're invited to join "[Group Name]" on SplitMate!

[Inviter Name] wants to share expenses with you using SplitMate - the smart way to track shared costs.

✨ What you can do:
• Track shared expenses instantly
• See who owes what in real-time  
• Split bills fairly and easily
• Never forget who paid for what

🔗 Join "[Group Name]" now: [Deep Link]

📱 Don't have SplitMate? Download it here:
[Play Store Link]

#SplitMate #SharedExpenses #MoneyTracker
```

## Technical Implementation

### Files Created/Modified
- `utils/shareUtils.ts` - Share functionality utilities
- `app/(tabs)/settings.tsx` - Added Share Group section
- `app/invite/[groupId].tsx` - Existing invite handler (already working)

### Key Functions
- `shareGroupInvite()` - Opens native share dialog
- `copyInviteLink()` - Copies link to clipboard
- `generateInviteLink()` - Creates deep link
- `generatePlayStoreLink()` - Creates Play Store link with tracking

### Deep Link Handling
- Uses Expo Linking API for deep link generation
- Automatic routing to invite handler
- Fallback to Play Store for non-users
- UTM tracking for Play Store installs

## User Experience

### Benefits
- ✅ **One-tap sharing** - Native share dialog works with all apps
- ✅ **Automatic app detection** - Works whether friends have app or not
- ✅ **Smart routing** - Direct to group join or Play Store as needed
- ✅ **Professional messaging** - Engaging invite message with clear benefits
- ✅ **Multiple share options** - Share dialog or copy link
- ✅ **Visual feedback** - Confirmation alerts and loading states

### Share Scenarios
1. **WhatsApp/Telegram**: Share button → Select contact → Send
2. **Email**: Share button → Select email → Send with formatted message
3. **SMS**: Share button → Select contact → Send text
4. **Manual sharing**: Copy link → Paste anywhere
5. **Social media**: Share button → Select platform → Post

## Analytics Potential
The Play Store link includes UTM parameters for tracking:
- `utm_source=invite`
- `utm_medium=share` 
- `utm_campaign=group_invite`

This allows tracking of:
- How many installs come from invites
- Which groups generate most invites
- Conversion rates from invite to install

## Future Enhancements
- **Firebase Dynamic Links** - Better link handling and analytics
- **Custom domain** - Branded short links (splitmate.app/join/xyz)
- **Invite analytics** - Track invite success rates
- **Personalized messages** - Custom invite messages per group
- **Invite limits** - Prevent spam by limiting invites per user
- **Invite expiration** - Time-limited invite links