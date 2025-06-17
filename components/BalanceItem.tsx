import { Balance } from '@/types';
import { TrendingDown, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface BalanceItemProps {
  balance: Balance;
  userName: string;
  currency: string;
}

export default function BalanceItem({
  balance,
  userName,
  currency,
}: BalanceItemProps) {
  const isPositive = balance.amount >= 0;
  const isZero = Math.abs(balance.amount) < 0.01;

  return (
    <View style={styles.container}>
      <View style={styles.userSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userName}>{userName}</Text>
      </View>

      <View style={styles.balanceSection}>
        <View style={styles.balanceRow}>
          {!isZero && (
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: isPositive ? '#10b981' : '#ef4444' },
              ]}
            >
              {isPositive ? (
                <TrendingUp size={12} color="#ffffff" />
              ) : (
                <TrendingDown size={12} color="#ffffff" />
              )}
            </View>
          )}

          <Text
            style={[
              styles.balanceAmount,
              {
                color: isZero ? '#a1a1aa' : isPositive ? '#10b981' : '#ef4444',
              },
            ]}
          >
            {isZero
              ? 'Settled'
              : `${isPositive ? '+' : ''}${currency} ${balance.amount.toFixed(
                  2
                )}`}
          </Text>
        </View>

        <Text style={styles.balanceLabel}>
          {isZero ? 'All settled up' : isPositive ? 'Owed to them' : 'They owe'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: 'Inter-SemiBold',
  },
  userName: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'Inter-Medium',
  },
  balanceSection: {
    alignItems: 'flex-end',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  iconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceAmount: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#a1a1aa',
    fontFamily: 'Inter-Regular',
  },
});
