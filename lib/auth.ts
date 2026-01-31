import { User } from '@/types';
import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithCredential,
    signInWithEmailAndPassword,
    updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export class AuthService {
  static getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        unsubscribe();
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            resolve({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || '',
              // avatar: firebaseUser.photoURL || undefined,
              ...userDoc.data(),
            });
          } else {
            resolve({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || '',
              // avatar: firebaseUser.photoURL || undefined,
            });
          }
        } else {
          resolve(null);
        }
      });
    });
  }

  static async signIn(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (userDoc.exists()) {
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || '',
        // avatar: firebaseUser.photoURL || undefined,
        ...userDoc.data(),
      };
    }

    return {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || '',
      // avatar: firebaseUser.photoURL || undefined,
    };
  }

  static async signUp(
    email: string,
    password: string,
    displayName: string
  ): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    await updateProfile(firebaseUser, { displayName });

    const userData: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName,
      // avatar: undefined,
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userData);
    return userData;
  }

  static async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          callback({
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || '',
            Plan:firebaseUser.Plan || '',
            PlanStart:firebaseUser.PlanStart || '',
            PlanExpiry:firebaseUser.PlanExpiry || '',
            isPro: firebaseUser.isPro || false,
            // avatar: firebaseUser.photoURL || undefined,
            ...userDoc.data(),
          });
        } else {
          callback({
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || '',
            // avatar: firebaseUser.photoURL || undefined,
          });
        }
      } else {
        callback(null);
      }
    });
  }

  static async signInWithGoogle(
    idToken: string,
    accessToken: string
  ): Promise<User> {
    try {
      console.log('Creating Google credential...');
      const credential = GoogleAuthProvider.credential(idToken, accessToken);
      
      console.log('Signing in with Firebase...');
      const userCredential = await signInWithCredential(auth, credential);
      const firebaseUser = userCredential.user;

      console.log('Firebase user created:', firebaseUser.uid);

      // Check if user exists in Firestore, if not, create
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) {
        console.log('Creating new user document in Firestore...');
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || '',
        };
        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
        return userData;
      }

      console.log('User document exists, returning user data...');
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || '',
        ...userDoc.data(),
      };
    } catch (error: any) {
      console.error('Firebase Google Sign-In Error:', error);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }
}
