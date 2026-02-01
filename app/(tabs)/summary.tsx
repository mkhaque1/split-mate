import { BannerAdComponent } from '@/components/AdMobManager';
import BalanceItem from '@/components/BalanceItem';
import Button from '@/components/Button';
import Card from '@/components/Card';
import GradientText from '@/components/GradientText';
import { useApp } from '@/context/AppContext';
import { CalculationService } from '@/lib/calculation';
import { FirestoreService } from '@/lib/firestore';
import { Balance, User as UserType } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { Calendar, Download, TrendingUp, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function SummaryScreen() {
  const { user, currentGroup, expenses, refreshExpenses } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [groupMembers, setGroupMembers] = useState<UserType[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [generating, setGenerating] = useState(false);
  const [showSubscribe, setShowSubscribe] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/auth');
      return;
    }
    loadGroupMembers();
  }, [user, currentGroup]);

  useEffect(() => {
    if (groupMembers.length > 0 && expenses.length > 0) {
      const calculatedBalances = CalculationService.calculateGroupBalances(
        expenses,
        groupMembers,
      );
      setBalances(calculatedBalances);
    } else {
      setBalances([]);
    }
  }, [groupMembers, expenses]);

  const loadGroupMembers = async () => {
    if (!currentGroup) return;

    try {
      const members = await FirestoreService.getUsers(currentGroup.members);
      setGroupMembers(members);
    } catch (error) {
      console.error('Error loading group members:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshExpenses();
    await loadGroupMembers();
    setRefreshing(false);
  };

  const generatePDFReport = async () => {
    if (!currentGroup || expenses.length === 0) {
      Alert.alert('No Data', 'There are no expenses to export');
      return;
    }

    setGenerating(true);
    try {
      const totalExpenses = CalculationService.getTotalExpenses(expenses);
      const categoryTotals = CalculationService.getExpensesByCategory(expenses);
      const settlements = CalculationService.calculateSettlements(balances);

      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .header { text-align: center; margin-bottom: 30px; }
              .title { color: #333; font-size: 24px; margin-bottom: 10px; }
              .subtitle { color: #666; font-size: 16px; }
              .section { margin-bottom: 30px; }
              .section-title { color: #333; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #eee; padding-bottom: 5px; }
              .expense-item { margin-bottom: 10px; padding: 10px; border: 1px solid #eee; border-radius: 5px; }
              .expense-header { display: flex; justify-content: space-between; font-weight: bold; }
              .expense-details { color: #666; font-size: 14px; margin-top: 5px; }
              .balance-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
              .positive { color: #10b981; }
              .negative { color: #ef4444; }
              .total { font-size: 20px; font-weight: bold; color: #333; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">SplitMate - Expense Report</div>
              <div class="subtitle">${currentGroup.name}</div>
              <div class="subtitle">Generated on ${new Date().toLocaleDateString()}</div>
            </div>

            <div class="section">
              <div class="section-title">Summary</div>
              <p class="total">Total Expenses: ${
                currentGroup.currency
              } ${totalExpenses.toFixed(2)}</p>
              <p>Number of Expenses: ${expenses.length}</p>
              <p>Group Members: ${groupMembers.length}</p>
            </div>

            <div class="section">
              <div class="section-title">Balances</div>
              ${balances
                .map((balance) => {
                  const member = groupMembers.find(
                    (m) => m.id === balance.userId,
                  );
                  const isPositive = balance.amount >= 0;
                  return `
                  <div class="balance-item">
                    <span>${member?.displayName || 'Unknown'}</span>
                    <span class="${isPositive ? 'positive' : 'negative'}">
                      ${isPositive ? '+' : ''}${
                        currentGroup.currency
                      } ${balance.amount.toFixed(2)}
                    </span>
                  </div>
                `;
                })
                .join('')}
            </div>

            <div class="section">
              <div class="section-title">Recent Expenses</div>
              ${expenses
                .slice(0, 20)
                .map((expense) => {
                  const payer = groupMembers.find(
                    (m) => m.id === expense.paidBy,
                  );
                  return `
                  <div class="expense-item">
                    <div class="expense-header">
                      <span>${expense.title}</span>
                      <span>${currentGroup.currency} ${expense.amount.toFixed(
                        2,
                      )}</span>
                    </div>
                    <div class="expense-details">
                      Paid by: ${payer?.displayName || 'Unknown'} • 
                      Category: ${expense.category} • 
                      Date: ${expense.date.toLocaleDateString()}
                    </div>
                  </div>
                `;
                })
                .join('')}
            </div>

            <div class="section">
              <div class="section-title">Category Breakdown</div>
              ${Object.entries(categoryTotals)
                .map(
                  ([category, amount]) => `
                <div class="balance-item">
                  <span>${
                    category.charAt(0).toUpperCase() + category.slice(1)
                  }</span>
                  <span>${currentGroup.currency} ${amount.toFixed(2)}</span>
                </div>
              `,
                )
                .join('')}
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Expense Report',
        });
      } else {
        Alert.alert('Success', 'PDF report generated successfully');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF report');
    } finally {
      setGenerating(false);
    }
  };

  const getUserName = (userId: string) => {
    const member = groupMembers.find((m) => m.id === userId);
    return member?.displayName || 'Unknown';
  };

  const totalExpenses = CalculationService.getTotalExpenses(expenses);
  const categoryTotals = CalculationService.getExpensesByCategory(expenses);
  const settlements = CalculationService.calculateSettlements(balances);

  if (!user || !currentGroup) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const { isPro } = useApp();

  // Show interstitial ad before generating PDF report
  const handleDownloadReport = async () => {
    if (isPro) {
      generatePDFReport();
      return;
    }
    
    // Try to show interstitial ad
    const adShown = await interstitialAdManager.showAd();
    if (adShown) {
      // Ad was shown, wait a moment then generate report
      setTimeout(() => {
        generatePDFReport();
      }, 500);
    } else {
      // Ad not available, generate report immediately
      generatePDFReport();
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f0f0f', '#281f5a']} style={styles.gradient}>
        <View style={styles.header}>
          <GradientText
            style={styles.title}
            colors={['#ffffff', '#a1a1aa', '#71717a']}
          >
            Summary
          </GradientText>
          <Text style={styles.groupName}>{currentGroup.name}</Text>
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Export Button */}
          <Button
            title='Download PDF Report'
            icon={<Download size={20} color='#ffffff' />}
            onPress={handleDownloadReport}
            loading={generating}
            style={styles.exportButton}
          />

          {/* Summary Stats */}
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <View style={styles.statHeader}>
                <TrendingUp size={20} color='#6366f1' />
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <Text style={styles.statAmount}>
                {currentGroup.currency} {totalExpenses.toFixed(2)}
              </Text>
            </Card>

            <Card style={styles.statCard}>
              <View style={styles.statHeader}>
                <Calendar size={20} color='#10b981' />
                <Text style={styles.statLabel}>Expenses</Text>
              </View>
              <Text style={styles.statAmount}>{expenses.length}</Text>
            </Card>

            <Card style={styles.statCard}>
              <View style={styles.statHeader}>
                <Users size={20} color='#f59e0b' />
                <Text style={styles.statLabel}>Members</Text>
              </View>
              <Text style={styles.statAmount}>{groupMembers.length}</Text>
            </Card>
          </View>

          {/* Balances Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Member Balances</Text>
            <Card style={styles.sectionCard}>
              {balances.length === 0 ? (
                <Text style={styles.emptyText}>No balances to show</Text>
              ) : (
                balances.map((balance) => (
                  <BalanceItem
                    key={balance.userId}
                    balance={balance}
                    userName={getUserName(balance.userId)}
                    currency={currentGroup.currency}
                  />
                ))
              )}
            </Card>
          </View>

          {/* Settlements Section */}
          {settlements.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Suggested Settlements</Text>
              <Card style={styles.sectionCard}>
                {settlements.map((settlement, index) => (
                  <View key={index} style={styles.settlementItem}>
                    <Text style={styles.settlementText}>
                      <Text style={styles.settlementName}>
                        {getUserName(settlement.from)}
                      </Text>
                      <Text style={styles.settlementArrow}> → </Text>
                      <Text style={styles.settlementName}>
                        {getUserName(settlement.to)}
                      </Text>
                    </Text>
                    <Text style={styles.settlementAmount}>
                      {currentGroup.currency} {settlement.amount.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </Card>
            </View>
          )}

          {/* Category Breakdown */}
          {Object.keys(categoryTotals).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category Breakdown</Text>
              <Card style={styles.sectionCard}>
                {Object.entries(categoryTotals).map(([category, amount]) => (
                  <View key={category} style={styles.categoryItem}>
                    <Text style={styles.categoryName}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                    <Text style={styles.categoryAmount}>
                      {currentGroup.currency} {amount.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </Card>
            </View>
          )}
        </ScrollView>
        {!isPro && <BannerAdComponent />}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
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
    paddingVertical: 30,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  groupName: {
    fontSize: 12,
    color: '#a1a1aa',
    fontFamily: 'Inter-Regular',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
  },
  exportButton: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#262626',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#a1a1aa',
    fontFamily: 'Inter-Medium',
  },
  statAmount: {
    fontSize: 12,
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  sectionCard: {
    backgroundColor: '#262626',
  },
  emptyText: {
    fontSize: 14,
    color: '#a1a1aa',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    paddingVertical: 16,
  },
  settlementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  settlementText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  settlementName: {
    color: '#ffffff',
    fontFamily: 'Inter-Medium',
  },
  settlementArrow: {
    color: '#a1a1aa',
  },
  settlementAmount: {
    fontSize: 14,
    color: '#10b981',
    fontFamily: 'Inter-SemiBold',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  categoryName: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: 'Inter-Medium',
  },
  categoryAmount: {
    fontSize: 14,
    color: '#a1a1aa',
    fontFamily: 'Inter-Regular',
  },
  closeAdIcon: {
    position: 'absolute',
    right: 16,
    top: -10,
    padding: 8,
    zIndex: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 60,
    padding: 10,
    backgroundColor: '#1e1e1e',
    alignItems: 'center',
  },
  footerText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});
