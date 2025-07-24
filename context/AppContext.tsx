import { AuthService } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { FirestoreService } from '@/lib/firestore';
import { Expense, Group, User } from '@/types';
import { doc, updateDoc } from 'firebase/firestore';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Alert } from 'react-native';

interface AppContextType {
  user: User | null;
  loading: boolean;
  currentGroup: Group | null;
  groups: Group[];
  expenses: Expense[];
  setCurrentGroup: (group: Group | null) => void;
  setCurrency: (currency: string) => void;
  refreshGroups: () => Promise<void>;
  refreshExpenses: () => Promise<void>;
  signOut: () => Promise<void>;
  isPro: boolean;
  setIsPro: (pro: boolean) => void;
  userSelectedPlan: { key: string; label: string; price: string } | null;
  setUserSelectedPlan: (
    plan: { key: string; label: string; price: string } | null
  ) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isPro, setIsPro] = useState(false);
  const [userSelectedPlan, setUserSelectedPlan] = useState<null | {
    key: string;
    label: string;
    price: string;
  }>(null);

useEffect(() => {
  const unsubscribe = AuthService.onAuthStateChanged(async (authUser) => {
    setUser(authUser);
    setLoading(true);

    if (authUser) {
      console.log('User authenticated:', authUser);

      const currentDate = new Date().toISOString().split('T')[0];
      const planExpiry = authUser.PlanExpiry || null;


      if (planExpiry === currentDate || currentDate > planExpiry) {
        // Plan expired today
        console.log('User plan expired today, updating to free plan');
        Alert.alert(
          'Plan Expired',
          'Your subscription has expired. You have been downgraded to the free plan.',
        )
        setIsPro(false);
        setUserSelectedPlan(null);
        await FirestoreService.UpdatePlan(
          authUser.id,
          false,
          '',
          '',
          '',
          null
        );
      } else {
       console.log('User plan still valid');
        setIsPro(authUser.isPro || false);
        setUserSelectedPlan(authUser.UserPlan || null);
      }

      await refreshGroups();
    } else {
      setUserSelectedPlan(null);
      setIsPro(false);
      setGroups([]);
      setExpenses([]);
    }

    setLoading(false);
  });

  return unsubscribe;
}, []);


  useEffect(() => {
    if (currentGroup) {
      refreshExpenses();
    }
  }, [currentGroup]);

  const refreshGroups = async () => {
    console.log('Refreshing groups for user:', user);
    if (!user) return;

    try {
      console.log('Fetching groups for user');
      const userGroups = await FirestoreService.getUserGroups(user.id);
      console.log('Fetched groups:', userGroups);

      setGroups(userGroups);

      // Set first group as current if none selected
      // if (!currentGroup && userGroups.length > 0) {

      setCurrentGroup(userGroups[0]);
      // }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const refreshExpenses = async () => {
    if (!currentGroup) return;

    try {
      const groupExpenses = await FirestoreService.getGroupExpenses(
        currentGroup.id
      );
      setExpenses(groupExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const setCurrency = async (currency: string) => {
    if (!currentGroup) return;
    await updateDoc(doc(db, 'groups', currentGroup.id), { currency });
    await refreshGroups(user);
  };

  const signOut = async () => {
    await AuthService.signOut();
    setUser(null);
    setCurrentGroup(null);
    setGroups([]);
    setExpenses([]);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        currentGroup,
        groups,
        expenses,
        setCurrentGroup,
        setCurrency,
        refreshGroups,
        refreshExpenses,
        signOut,
        isPro,
        setIsPro,
        userSelectedPlan,
        setUserSelectedPlan,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
