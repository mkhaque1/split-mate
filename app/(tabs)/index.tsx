import AddExpenseModal from '@/components/AddExpenseModal';
import Button from '@/components/Button';
import Card from '@/components/Card';
import ExpenseItem from '@/components/ExpenseItem';
import GradientText from '@/components/GradientText';
import { FirestoreService } from '@/lib/firestore';
import { User as UserType } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { DollarSign, Plus, User } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { CalculationService } from '../../lib/calculation';

export default function ExpensesScreen() {
  const { user, currentGroup, expenses, refreshExpenses, refreshGroups } =
    useApp();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [groupMembers, setGroupMembers] = useState<UserType[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadGroupMembers = useCallback(async () => {
    if (!currentGroup) return;
    try {
      const members = await FirestoreService.getUsers(currentGroup.members);
      setGroupMembers(members);
    } catch (error) {
      console.error('Error loading group members:', error);
    }
  }, [currentGroup]);

  // Only one unified effect handles all loading logic safely
  useEffect(() => {
    if (!user) {
      router.replace('/auth');
      return;
    }

    if (!hasLoaded) {
      const fetchData = async () => {
        try {
          await refreshGroups();
          await refreshExpenses();

          if (currentGroup) {
            await loadGroupMembers();
            setHasLoaded(true);
          }
        } catch (error) {
          console.error('Error loading data:', error);
        }
      };
      fetchData();
    }
  }, [
    user,
    currentGroup,
    hasLoaded,
    refreshGroups,
    refreshExpenses,
    loadGroupMembers,
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshExpenses();
    await loadGroupMembers();
    setRefreshing(false);
  };

  const handleExpenseAdded = async () => {
    setShowAddExpense(false);
    await refreshExpenses();
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await FirestoreService.deleteExpense(expenseId);
      await refreshExpenses();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete expense');
    }
  };
  const getUserName = (userId: string) => {
    const member = groupMembers.find((m) => m?.id === userId);
    return member?.displayName || 'Unknown';
  };

  // Don't conditionally return before hooks
  if (!user || !currentGroup) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Expenses...</Text>
      </View>
    );
  }

  // Only calculate these when user and currentGroup are guaranteed to exist
  const totalExpenses = CalculationService.getTotalExpenses(expenses);
  const userPaidTotal = CalculationService.getUserExpenseTotal(
    expenses,
    user.id
  );
  const userOwedTotal = CalculationService.getUserOwedAmount(expenses, user.id);
  const userBalance = userPaidTotal - userOwedTotal;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f0f0f', '#1a1a1a']} style={styles.gradient}>
        <View style={styles.header}>
          <GradientText
            style={styles.title}
            colors={['#ffffff', '#a1a1aa', '#71717a']}
          >
            Expenses
          </GradientText>
          <Text style={styles.groupName}>{currentGroup.name}</Text>
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.summaryRow}>
            <Card style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <DollarSign size={20} color="#6366f1" />
                <Text style={styles.summaryLabel}>Total</Text>
              </View>
              <Text style={styles.summaryAmount}>
                {currentGroup.currency} {totalExpenses.toFixed(2)}
              </Text>
            </Card>

            <Card style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <User
                  size={20}
                  color={userBalance >= 0 ? '#10b981' : '#ef4444'}
                />
                <Text style={styles.summaryLabel}>Your Balance</Text>
              </View>
              <Text
                style={[
                  styles.summaryAmount,
                  { color: userBalance >= 0 ? '#10b981' : '#ef4444' },
                ]}
              >
                {userBalance >= 0 ? '+' : ''}
                {currentGroup.currency} {userBalance.toFixed(2)}
              </Text>
            </Card>
          </View>

          <Button
            title="Add New Expense"
            icon={<Plus size={20} color="#ffffff" />}
            onPress={() => setShowAddExpense(true)}
            style={styles.addButton}
          />

          <View style={styles.expensesSection}>
            <Text style={styles.sectionTitle}>Recent Expenses</Text>
            {expenses.length === 0 ? (
              <Card style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No expenses yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Tap "Add New Expense" to get started
                </Text>
              </Card>
            ) : (
              expenses.map((expense) => (
                <ExpenseItem
                  key={expense?.id}
                  expense={expense}
                  getUserName={getUserName}
                  currency={currentGroup.currency}
                  onDelete={handleDeleteExpense}
                />
              ))
            )}
          </View>
        </ScrollView>

        <AddExpenseModal
          visible={showAddExpense}
          onClose={() => setShowAddExpense(false)}
          onExpenseAdded={handleExpenseAdded}
          groupMembers={groupMembers} // <-- make sure this includes new members
          currency={currentGroup.currency}
          groupId={currentGroup?.id}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
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
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  groupName: {
    fontSize: 16,
    color: '#a1a1aa',
    fontFamily: 'Inter-Regular',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#262626',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#a1a1aa',
    fontFamily: 'Inter-Medium',
  },
  summaryAmount: {
    fontSize: 20,
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
  },
  addButton: {
    marginBottom: 32,
  },
  expensesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#262626',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#a1a1aa',
    fontFamily: 'Inter-Regular',
  },
});
