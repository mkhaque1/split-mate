import { Expense } from '@/types';
import { Calendar, Tag, Trash2, User, Users } from 'lucide-react-native';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Card from './Card';

interface ExpenseItemProps {
  expense: Expense;
  getUserName: (userId: string) => string;
  currency: string;
  onDelete: (expenseId: string) => void;
}

const CATEGORY_EMOJIS: { [key: string]: string } = {
  food: '🍽️',
  transport: '🚗',
  utilities: '💡',
  entertainment: '🎬',
  shopping: '🛍️',
  health: '🏥',
  rent: '🏠',
  other: '💼',
};

export default function ExpenseItem({
  expense,
  getUserName,
  currency,
  onDelete,
}: ExpenseItemProps) {
  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(expense.id),
        },
      ]
    );
  };

  const splitAmount = expense.amount / expense.splitBetween.length;

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.categoryIcon}>
          <Text style={styles.categoryEmoji}>
            {CATEGORY_EMOJIS[expense.category] || '💼'}
          </Text>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>{expense.title}</Text>
          <Text style={styles.amount}>
            {currency} {expense.amount.toFixed(2)}
          </Text>
        </View>

        <Pressable onPress={handleDelete} style={styles.deleteButton}>
          <Trash2 size={18} color="#ef4444" />
        </Pressable>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <User size={14} color="#a1a1aa" />
          <Text style={styles.detailText}>
            Paid by {getUserName(expense.paidBy)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Users size={14} color="#a1a1aa" />
          <Text style={styles.detailText}>
            Split {expense.splitBetween.length} ways ({currency}{' '}
            {splitAmount.toFixed(2)} each)
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Calendar size={14} color="#a1a1aa" />
          <Text style={styles.detailText}>
            {expense.date.toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Tag size={14} color="#a1a1aa" />
          <Text style={styles.detailText}>
            {expense.category.charAt(0).toUpperCase() +
              expense.category.slice(1)}
          </Text>
        </View>
      </View>

      {expense.description && (
        <View style={styles.description}>
          <Text style={styles.descriptionText}>{expense.description}</Text>
        </View>
      )}

      {expense.splitBetween.length > 1 && (
        <View style={styles.splitMembers}>
          <Text style={styles.splitTitle}>Split between:</Text>
          <Text style={styles.splitList}>
            {expense.splitBetween.map(getUserName).join(', ')}
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#262626',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 18,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  amount: {
    fontSize: 18,
    color: '#10b981',
    fontFamily: 'Inter-Bold',
  },
  deleteButton: {
    padding: 8,
  },
  details: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#a1a1aa',
    fontFamily: 'Inter-Regular',
  },
  description: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  splitMembers: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
  },
  splitTitle: {
    fontSize: 12,
    color: '#a1a1aa',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  splitList: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: 'Inter-Regular',
  },
});
