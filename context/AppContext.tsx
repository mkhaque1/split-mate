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

interface Plan {
  key: string;
  label: string;
  price: string;
}

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
  userSelectedPlan: Plan | null;
  setUserSelectedPlan: (plan: Plan | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isPro, setIsPro] = useState(false);
  const [userSelectedPlan, setUserSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged(async (authUser) => {
      setLoading(true);
      setUser(authUser);

      if (authUser) {
        console.log('User authenticated:', authUser);
        const currentDate = new Date().toISOString().split('T')[0];
        const planExpiry = authUser.PlanExpiry;
        const updatedAt = authUser.updatedAt?.toDate().toISOString().split('T')[0];

        if ( updatedAt &&  (!planExpiry || planExpiry <= currentDate )) {
          console.log('User plan expired or missing. Downgrading to free.');
          Alert.alert(
            'Plan Expired',
            'Your subscription has expired. You have been downgraded to the free plan.'
          );
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
          console.log('User plan is still valid');
          setIsPro(authUser.isPro ?? false);
          setUserSelectedPlan(authUser.UserPlan ?? null);
        }

        await refreshGroups(authUser.id);
      } else {
        setUserSelectedPlan(null);
        setIsPro(false);
        setGroups([]);
        setExpenses([]);
        setCurrentGroup(null);
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

  const refreshGroups = async (userId?: string) => {
    const uid = userId || user?.id;
    if (!uid) return;

    try {
      const userGroups = await FirestoreService.getUserGroups(uid);
      setGroups(userGroups);
      if (userGroups.length > 0) {
        setCurrentGroup(userGroups[0]);
      } else {
        setCurrentGroup(null);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const refreshExpenses = async () => {
    if (!currentGroup) return;

    try {
      const groupExpenses = await FirestoreService.getGroupExpenses(currentGroup.id);
      setExpenses(groupExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const setCurrency = async (currency: string) => {
    if (!currentGroup) return;

    try {
      await updateDoc(doc(db, 'groups', currentGroup.id), { currency });
      await refreshGroups();
    } catch (error) {
      console.error('Error updating currency:', error);
    }
  };

  const signOut = async () => {
    try {
      await AuthService.signOut();
    } catch (error) {
      console.error('Error during sign-out:', error);
    }

    setUser(null);
    setCurrentGroup(null);
    setGroups([]);
    setExpenses([]);
    setIsPro(false);
    setUserSelectedPlan(null);
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
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
