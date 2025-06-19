import { AuthService } from '@/lib/auth';
import { FirestoreService } from '@/lib/firestore';
import { Expense, Group, User } from '@/types';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

interface AppContextType {
  user: User | null;
  loading: boolean;
  currentGroup: Group | null;
  groups: Group[];
  expenses: Expense[];
  currency: string;
  setCurrentGroup: (group: Group | null) => void;
  setCurrency: (currency: string) => void;
  refreshGroups: () => Promise<void>;
  refreshExpenses: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged(async (authUser) => {
      setUser(authUser);
      if (authUser) {
        console.log('User authenticated:', authUser);
        await refreshGroups();
      } else {
        setGroups([]);
        setCurrentGroup(null);
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

     console.log('Fetching groups for user')
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
        currency,
        setCurrentGroup,
        setCurrency,
        refreshGroups,
        refreshExpenses,
        signOut,
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
