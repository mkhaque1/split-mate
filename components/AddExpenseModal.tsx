import { useApp } from '@/context/AppContext';
import { FirestoreService } from '@/lib/firestore';
import { ExpenseCategory, User } from '@/types';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, DollarSign, Tag, Users, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Button from './Button';
import Card from './Card';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onExpenseAdded: () => void;
  groupMembers: User[];
  currency: string;
  groupId: string;
}

const CATEGORIES: { value: ExpenseCategory; label: string; emoji: string }[] = [
  { value: 'food', label: 'Food & Dining', emoji: '🍽️' },
  { value: 'transport', label: 'Transport', emoji: '🚗' },
  { value: 'utilities', label: 'Utilities', emoji: '💡' },
  { value: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { value: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { value: 'health', label: 'Health', emoji: '🏥' },
  { value: 'rent', label: 'Rent', emoji: '🏠' },
  { value: 'other', label: 'Other', emoji: '💼' },
];

export default function AddExpenseModal({
  visible,
  onClose,
  onExpenseAdded,
  groupMembers,
  currency,
  groupId,
}: AddExpenseModalProps) {
  const { user } = useApp();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [paidBy, setPaidBy] = useState(user?.id || '');
  const [splitBetween, setSplitBetween] = useState<string[]>(
    groupMembers.map((m) => m.id)
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPaidBy(user?.id || '');
    setSplitBetween(groupMembers.map((m) => m.id));
  }, [groupMembers, user]);

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setDescription('');
    setCategory('food');
    setPaidBy(user?.id || '');
    setSplitBetween(groupMembers.map((m) => m.id));
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleMemberSplit = (memberId: string) => {
    // Add haptic feedback on mobile
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setSplitBetween((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleCategorySelect = (selectedCategory: ExpenseCategory) => {
    // Add haptic feedback on mobile
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCategory(selectedCategory);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !amount || splitBetween.length === 0) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      // Build the expense object without undefined fields
      const expenseData: any = {
        groupId,
        title: title.trim(),
        amount: numAmount,
        currency,
        category,
        paidBy,
        splitBetween,
        date: new Date(),
      };
      if (description.trim()) {
        expenseData.description = description.trim();
      }

      await FirestoreService.createExpense(expenseData);

      // Add success haptic feedback on mobile
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      resetForm();
      onExpenseAdded();
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'Failed to add expense');

      // Add error haptic feedback on mobile
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setLoading(false);
    }
  };

  const getMemberName = (memberId: string) => {
    const member = groupMembers.find((m) => m.id === memberId);
    return member?.displayName || 'Unknown';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <LinearGradient colors={['#0f0f0f', '#1a1a1a']} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add New Expense</Text>
          <Pressable onPress={handleClose} style={styles.closeButton}>
            <X size={24} color="#ffffff" />
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Basic Info */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Tag size={20} color="#6366f1" />
              <Text style={styles.sectionTitle}>Basic Information</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter expense title"
                placeholderTextColor="#71717a"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount ({currency}) *</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="#71717a"
                keyboardType="decimal-pad"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Optional description"
                placeholderTextColor="#71717a"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </Card>

          {/* Category */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Tag size={20} color="#10b981" />
              <Text style={styles.sectionTitle}>Category</Text>
            </View>

            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.value}
                  style={[
                    styles.categoryItem,
                    category === cat.value && styles.categoryItemSelected,
                  ]}
                  onPress={() => handleCategorySelect(cat.value)}
                >
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      category === cat.value && styles.categoryLabelSelected,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>

          {/* Paid By */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <DollarSign size={20} color="#f59e0b" />
              <Text style={styles.sectionTitle}>Paid By</Text>
            </View>

            <View style={styles.membersList}>
              {groupMembers.map((member) => (
                <Pressable
                  key={member.id}
                  style={[
                    styles.memberItem,
                    paidBy === member.id && styles.memberItemSelected,
                  ]}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setPaidBy(member.id);
                  }}
                >
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberInitial}>
                      {member.displayName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.memberName,
                      paidBy === member.id && styles.memberNameSelected,
                    ]}
                  >
                    {member.displayName}
                  </Text>
                  <View
                    style={[
                      styles.radio,
                      paidBy === member.id && styles.radioSelected,
                    ]}
                  >
                    {paidBy === member.id && (
                      <Check
                        size={16}
                        color="#fff"
                        style={{ alignSelf: 'center' }}
                      />
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          </Card>

          {/* Split Between */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Users size={20} color="#ec4899" />
              <Text style={styles.sectionTitle}>Split Between</Text>
            </View>

            <View style={styles.membersList}>
              {groupMembers.map((member) => (
                <Pressable
                  key={member.id}
                  style={[
                    styles.memberItem,
                    splitBetween.includes(member.id) &&
                      styles.memberItemSelected,
                  ]}
                  onPress={() => toggleMemberSplit(member.id)}
                >
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberInitial}>
                      {member.displayName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.memberName,
                      splitBetween.includes(member.id) &&
                        styles.memberNameSelected,
                    ]}
                  >
                    {member.displayName}
                  </Text>
                  <View
                    style={[
                      styles.checkbox,
                      splitBetween.includes(member.id) &&
                        styles.checkboxSelected,
                    ]}
                  >
                    {splitBetween.includes(member.id) && (
                      <Check
                        size={16}
                        color="#fff"
                        style={{ alignSelf: 'center' }}
                      />
                    )}
                  </View>
                </Pressable>
              ))}
            </View>

            {splitBetween.length > 0 && (
              <Text style={styles.splitInfo}>
                Split {splitBetween.length} ways: {currency}{' '}
                {(parseFloat(amount) / splitBetween.length || 0).toFixed(2)} per
                person
              </Text>
            )}
          </Card>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Cancel"
            variant="ghost"
            onPress={handleClose}
            style={styles.footerButton}
          />
          <Button
            title="Add Expense"
            onPress={handleSubmit}
            loading={loading}
            style={styles.footerButton}
          />
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  title: {
    fontSize: 18,
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    backgroundColor: '#262626',
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#ffffff',
    fontFamily: 'Inter-SemiBold',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: '#ffffff',
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#404040',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#404040',
  },
  categoryItemSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#a1a1aa',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  categoryLabelSelected: {
    color: '#ffffff',
  },
  membersList: {
    gap: 12,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#404040',
  },
  memberItemSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInitial: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: 'Inter-SemiBold',
  },
  memberName: {
    flex: 1,
    fontSize: 14,
    color: '#a1a1aa',
    fontFamily: 'Inter-Medium',
  },
  memberNameSelected: {
    color: '#ffffff',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#404040',
  },
  radioSelected: {
    backgroundColor: 'transparent',
    borderColor: '#ffffff',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#404040',
  },
  checkboxSelected: {
    backgroundColor: 'transparent',
    borderColor: '#ffffff',
  },
  splitInfo: {
    fontSize: 12,
    color: '#a1a1aa',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  footer: {
    flexDirection: 'row',
    gap: 5,
    padding: 18,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  footerButton: {
    flex: 1,
  },
});
