import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, useTheme, Chip, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '@/store/hooks';
import { spacing } from '@/theme';

const HomeScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { user } = useAppSelector((state) => state.auth);

  const quickActions = [
    {
      icon: 'magnify',
      title: '搜尋職缺',
      description: '找尋適合的偏鄉支援機會',
      onPress: () => navigation.navigate('Jobs' as never),
      color: theme.colors.primary,
    },
    {
      icon: 'file-document-outline',
      title: '我的申請',
      description: '查看申請狀態',
      onPress: () => navigation.navigate('Applications' as never),
      color: theme.colors.secondary,
    },
    {
      icon: 'account-circle-outline',
      title: '個人檔案',
      description: '完善您的專業資訊',
      onPress: () => navigation.navigate('Profile' as never),
      color: theme.colors.tertiary,
    },
  ];

  const stats = [
    { label: '開放職缺', value: '156', icon: 'briefcase' },
    { label: '偏鄉地區', value: '48', icon: 'map-marker' },
    { label: '已媒合', value: '892', icon: 'handshake' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
              您好，{user?.name || '使用者'}
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              歡迎回到醫事人力媒合平台
            </Text>
          </View>
          <Avatar.Icon
            size={56}
            icon="account"
            style={{ backgroundColor: theme.colors.primaryContainer }}
          />
        </View>

        {/* Stats */}
        <Card style={styles.statsCard} mode="elevated">
          <Card.Content style={styles.statsContent}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Icon name={stat.icon} size={24} color={theme.colors.primary} />
                <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                  {stat.value}
                </Text>
                <Text variant="labelSmall" style={styles.statLabel}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Text variant="titleLarge" style={styles.sectionTitle}>
          快速功能
        </Text>
        {quickActions.map((action, index) => (
          <Card
            key={index}
            style={styles.actionCard}
            mode="elevated"
            onPress={action.onPress}
          >
            <Card.Content style={styles.actionContent}>
              <View style={[styles.iconContainer, { backgroundColor: `${action.color}20` }]}>
                <Icon name={action.icon} size={28} color={action.color} />
              </View>
              <View style={styles.actionTextContainer}>
                <Text variant="titleMedium">{action.title}</Text>
                <Text variant="bodySmall" style={styles.actionDescription}>
                  {action.description}
                </Text>
              </View>
              <Icon name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
            </Card.Content>
          </Card>
        ))}

        {/* Hot Regions */}
        <Text variant="titleLarge" style={styles.sectionTitle}>
          熱門支援地區
        </Text>
        <View style={styles.chipContainer}>
          {['屏東縣', '台東縣', '花蓮縣', '澎湖縣', '金門縣', '連江縣'].map((region) => (
            <Chip
              key={region}
              mode="outlined"
              style={styles.chip}
              onPress={() =>
                navigation.navigate('Jobs', {
                  screen: 'JobList',
                  params: { county: region },
                } as never)
              }
            >
              {region}
            </Chip>
          ))}
        </View>

        {/* CTA */}
        <Card style={[styles.ctaCard, { backgroundColor: theme.colors.primaryContainer }]}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: spacing.sm }}>
              🏥 偏鄉需要您的支援
            </Text>
            <Text variant="bodyMedium" style={{ marginBottom: spacing.md, opacity: 0.8 }}>
              您的專業可以為偏鄉醫療帶來改變，立即加入我們的行列！
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Jobs' as never)}
              style={{ alignSelf: 'flex-start' }}
            >
              查看職缺
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: spacing.xs,
  },
  statsCard: {
    marginBottom: spacing.lg,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statLabel: {
    opacity: 0.7,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  actionCard: {
    marginBottom: spacing.sm,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionDescription: {
    opacity: 0.7,
    marginTop: 2,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    marginBottom: spacing.xs,
  },
  ctaCard: {
    marginTop: spacing.md,
  },
});

export default HomeScreen;

