import { Expense, Group, Settlement, User } from '@/types';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

export class FirestoreService {
  // Groups
  static async createGroup(
    groupData: Omit<Group, 'id' | 'createdAt'>
  ): Promise<string> {
    const docRef = await addDoc(collection(db, 'groups'), {
      ...groupData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  }

  static async getGroup(groupId: string): Promise<Group | null> {
    const docSnap = await getDoc(doc(db, 'groups', groupId));
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt.toDate(),
      } as Group;
    }
    return null;
  }

  static async getUserGroups(userId: string): Promise<Group[]> {
    const q = query(
      collection(db, 'groups'),
      where('members', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as Group[];
  }

  static async addMemberToGroup(
    groupId: string,
    userId: string
  ): Promise<void> {
    const groupRef = doc(db, 'groups', groupId);
    const groupDoc = await getDoc(groupRef);

    if (groupDoc.exists()) {
      const currentMembers = groupDoc.data().members || [];
      if (!currentMembers.includes(userId)) {
        await updateDoc(groupRef, {
          members: [...currentMembers, userId],
        });
      }
    }
  }

  // Expenses
  static async createExpense(
    expenseData: Omit<Expense, 'id' | 'createdAt'>
  ): Promise<string> {
    const docRef = await addDoc(collection(db, 'expenses'), {
      ...expenseData,
      date: Timestamp.fromDate(expenseData.date),
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  }

  static async getGroupExpenses(groupId: string): Promise<Expense[]> {
    const q = query(
      collection(db, 'expenses'),
      where('groupId', '==', groupId),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate(),
    })) as Expense[];
  }

  static async updateExpense(
    expenseId: string,
    updates: Partial<Expense>
  ): Promise<void> {
    const expenseRef = doc(db, 'expenses', expenseId);
    const updateData = { ...updates };

    if (updates.date) {
      updateData.date = Timestamp.fromDate(updates.date) as any;
    }

    await updateDoc(expenseRef, updateData);
  }

  static async deleteExpense(expenseId: string): Promise<void> {
    await deleteDoc(doc(db, 'expenses', expenseId));
  }

  // Settlements
  static async createSettlement(
    settlementData: Omit<Settlement, 'id' | 'createdAt'>
  ): Promise<string> {
    const docRef = await addDoc(collection(db, 'settlements'), {
      ...settlementData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  }

  static async getGroupSettlements(groupId: string): Promise<Settlement[]> {
    const q = query(
      collection(db, 'settlements'),
      where('groupId', '==', groupId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      completedAt: doc.data().completedAt?.toDate(),
    })) as Settlement[];
  }

  static async updateSettlement(
    settlementId: string,
    updates: Partial<Settlement>
  ): Promise<void> {
    const settlementRef = doc(db, 'settlements', settlementId);
    const updateData = { ...updates };

    if (updates.completedAt) {
      updateData.completedAt = Timestamp.fromDate(updates.completedAt) as any;
    }

    await updateDoc(settlementRef, updateData);
  }

  // Users
  static async getUser(userId: string): Promise<User | null> {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as User;
    }
    return null;
  }

  static async getUsers(userIds: string[]): Promise<User[]> {
    if (userIds.length === 0) return [];

    const batch = writeBatch(db);
    const users: User[] = [];

    for (const userId of userIds) {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        users.push({
          id: userDoc.id,
          ...userDoc.data(),
        } as User);
      }
    }
    console.log('Fetched users:', users);
    return users;
  }

  static async setUserMarketingConsent(userId: string, consent: boolean) {
    await setDoc(
      doc(db, 'users', userId),
      { marketingConsent: consent },
      { merge: true }
    );
  }

  // Real-time listeners
  static subscribeToGroupExpenses(
    groupId: string,
    callback: (expenses: Expense[]) => void
  ): () => void {
    const q = query(
      collection(db, 'expenses'),
      where('groupId', '==', groupId),
      orderBy('date', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const expenses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate(),
      })) as Expense[];
      callback(expenses);
    });
  }
}
