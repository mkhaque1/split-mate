// Professional error message mappings for Firebase Auth errors
export const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: { [key: string]: string } = {
    // Sign-in errors
    'auth/user-not-found': 'No account found with this email address. Please check your email or sign up for a new account.',
    'auth/wrong-password': 'Incorrect password. Please check your password and try again.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled. Please contact support for assistance.',
    'auth/too-many-requests': 'Too many failed attempts. Please wait a few minutes before trying again.',
    'auth/invalid-credential': 'Invalid email or password. Please check your credentials and try again.',
    
    // Sign-up errors
    'auth/email-already-in-use': 'An account with this email already exists. Please sign in or use a different email.',
    'auth/weak-password': 'Password is too weak. Please use at least 6 characters with a mix of letters and numbers.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
    
    // Network errors
    'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
    'auth/timeout': 'Request timed out. Please check your internet connection and try again.',
    
    // General errors
    'auth/internal-error': 'An internal error occurred. Please try again later.',
    'auth/invalid-api-key': 'Invalid API key. Please contact support.',
    'auth/app-deleted': 'This app has been deleted. Please contact support.',
    'auth/invalid-user-token': 'Your session has expired. Please sign in again.',
    'auth/user-token-expired': 'Your session has expired. Please sign in again.',
    'auth/null-user': 'No user is currently signed in.',
    'auth/invalid-tenant-id': 'Invalid tenant ID. Please contact support.',
    'auth/tenant-id-mismatch': 'Tenant ID mismatch. Please contact support.',
    'auth/requires-recent-login': 'This operation requires recent authentication. Please sign in again.',
    'auth/provider-already-linked': 'This account is already linked to another provider.',
    'auth/no-auth-event': 'No authentication event found.',
    'auth/invalid-continue-uri': 'Invalid continue URL.',
    'auth/missing-continue-uri': 'Missing continue URL.',
    'auth/unauthorized-continue-uri': 'Unauthorized continue URL.',
    'auth/invalid-dynamic-link-domain': 'Invalid dynamic link domain.',
    'auth/argument-error': 'Invalid argument provided.',
    'auth/invalid-persistence-type': 'Invalid persistence type.',
    'auth/unsupported-persistence-type': 'Unsupported persistence type.',
    'auth/invalid-oauth-provider': 'Invalid OAuth provider.',
    'auth/invalid-oauth-client-id': 'Invalid OAuth client ID.',
    'auth/unauthorized-domain': 'This domain is not authorized for OAuth operations.',
    'auth/invalid-action-code': 'Invalid action code.',
    'auth/incorrect-password': 'Incorrect password.',
    'auth/invalid-message-payload': 'Invalid message payload.',
    'auth/invalid-sender': 'Invalid sender.',
    'auth/invalid-recipient-email': 'Invalid recipient email.',
    'auth/missing-iframe-start': 'Missing iframe start.',
    'auth/auth-domain-config-required': 'Auth domain configuration required.',
    'auth/missing-app-credential': 'Missing app credential.',
    'auth/invalid-app-credential': 'Invalid app credential.',
    'auth/session-cookie-expired': 'Session cookie expired.',
    'auth/uid-already-exists': 'UID already exists.',
    'auth/reserved-claims': 'Reserved claims.',
    'auth/invalid-claims': 'Invalid claims.',
    'auth/phone-number-already-exists': 'Phone number already exists.',
    'auth/invalid-phone-number': 'Invalid phone number.',
    'auth/missing-phone-number': 'Missing phone number.',
    'auth/quota-exceeded': 'Quota exceeded.',
    'auth/second-factor-already-in-use': 'Second factor already in use.',
    'auth/maximum-second-factor-count-exceeded': 'Maximum second factor count exceeded.',
    'auth/unsupported-first-factor': 'Unsupported first factor.',
    'auth/email-change-needs-verification': 'Email change needs verification.',
    'auth/email-in-use': 'Email already in use.',
    'auth/maximum-user-count-exceeded': 'Maximum user count exceeded.',
    'auth/missing-multi-factor-info': 'Missing multi-factor info.',
    'auth/missing-multi-factor-session': 'Missing multi-factor session.',
    'auth/invalid-multi-factor-session': 'Invalid multi-factor session.',
    'auth/multi-factor-info-not-found': 'Multi-factor info not found.',
    'auth/admin-restricted-operation': 'Admin restricted operation.',
    'auth/unverified-email': 'Unverified email.',
    'auth/second-factor-limit-exceeded': 'Second factor limit exceeded.',
    'auth/missing-client-type': 'Missing client type.',
    'auth/missing-recaptcha-token': 'Missing reCAPTCHA token.',
    'auth/invalid-recaptcha-token': 'Invalid reCAPTCHA token.',
    'auth/invalid-recaptcha-action': 'Invalid reCAPTCHA action.',
    'auth/missing-recaptcha-version': 'Missing reCAPTCHA version.',
    'auth/invalid-recaptcha-version': 'Invalid reCAPTCHA version.',
    'auth/invalid-req-type': 'Invalid request type.',
  };

  return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
};

export const getGoogleSignInErrorMessage = (error: any): string => {
  if (error.message) {
    if (error.message.includes('network')) {
      return 'Network error. Please check your internet connection and try again.';
    } else if (error.message.includes('Authentication failed')) {
      return 'Google authentication failed. Please try again or use email sign-in.';
    } else if (error.message.includes('Play Services')) {
      return 'Google Play Services are not available or outdated. Please update Google Play Services and try again.';
    }
  }
  
  return 'Google Sign-In failed. Please try again or use email sign-in.';
};