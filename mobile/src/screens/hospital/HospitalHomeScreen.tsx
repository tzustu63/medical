import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  Avatar,
  Chip,
  Surface,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '@/store/hooks';
import { spacing } from '@/theme';
import apiClient from '@/services/api/client';

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  pendingApplications: number;
  totalApplications: number;
}

interface PendingApplication {
  id: string;
  applicantName: string;
  jobTitle: string;
  professionalType: string;
  appliedAt: string;
}

const HospitalHomeScreen = () => {
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const { user } = useAppSelector((state) => state.auth);

  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    pendingApplications: 0,
    totalApplications: 0,
  });
  const [pendingApplications, setPendingApplications] = useState<PendingApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // TODO: 實際從 API 載入數據
      // 暫時使用模擬數據
      setStats({
        totalJobs: 5,
        activeJobs: 3,
        pendingApplications: 8,
        totalApplications: 25,
      });

      setPendingApplications([
        {
          id: '1',
          applicantName: '王醫師',
          jobTitle: '內科支援醫師',
          professionalType: '醫師',
          appliedAt: '2024-12-07',
        },
        {
          id: '2',
          applicantName: '李護理師',
          jobTitle: '急診護理支援',
          professionalType: '護理師',
          appliedAt: '2024-12-06',
        },
      ]);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const professionalTypeLabels: Record<string, string> = {
    doctor: '醫師',
    nurse: '護理師',
    pharmacist: '藥師',
    medical_technologist: '醫檢師',
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
              您好，{user?.name}
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              台東縣卑南鄉衛生所
            </Text>
          </View>
          <Avatar.Icon
            size={50}
            icon="hospital-building"
            style={{ backgroundColor: theme.colors.primaryContainer }}
          />
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <Surface style={[styles.statCard, { backgroundColor: theme.colors.primaryContainer }]} elevation={1}>
            <Icon name="briefcase" size={24} color={theme.colors.primary} />
            <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
              {stats.activeJobs}
            </Text>
            <Text variant="bodySmall">進行中職缺</Text>
          </Surface>

          <Surface style={[styles.statCard, { backgroundColor: theme.colors.secondaryContainer }]} elevation={1}>
            <Icon name="clock-outline" size={24} color={theme.colors.secondary} />
            <Text variant="headlineMedium" style={{ color: theme.colors.secondary }}>
              {stats.pendingApplications}
            </Text>
            <Text variant="bodySmall">待審核申請</Text>
          </Surface>

          <Surface style={[styles.statCard, { backgroundColor: theme.colors.tertiaryContainer }]} elevation={1}>
            <Icon name="file-document-multiple" size={24} color={theme.colors.tertiary} />
            <Text variant="headlineMedium" style={{ color: theme.colors.tertiary }}>
              {stats.totalJobs}
            </Text>
            <Text variant="bodySmall">總職缺數</Text>
          </Surface>

          <Surface style={[styles.statCard, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
            <Icon name="account-check" size={24} color={theme.colors.onSurfaceVariant} />
            <Text variant="headlineMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {stats.totalApplications}
            </Text>
            <Text variant="bodySmall">總申請數</Text>
          </Surface>
        </View>

        {/* Quick Actions */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          快速操作
        </Text>
        <View style={styles.quickActions}>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => navigation.navigate('HospitalJobs', { screen: 'CreateJob' })}
            style={styles.actionButton}
          >
            發布新職缺
          </Button>
          <Button
            mode="outlined"
            icon="account-search"
            onPress={() => navigation.navigate('HospitalApplications')}
            style={styles.actionButton}
          >
            審核申請
          </Button>
        </View>

        {/* Pending Applications */}
        <View style={styles.sectionHeader}>
          <Text variant="titleMedium">待審核申請</Text>
          <Button
            mode="text"
            onPress={() => navigation.navigate('HospitalApplications')}
            compact
          >
            查看全部
          </Button>
        </View>

        {pendingApplications.length > 0 ? (
          pendingApplications.map((app) => (
            <Card key={app.id} style={styles.applicationCard} mode="outlined">
              <Card.Content style={styles.applicationContent}>
                <View style={styles.applicationInfo}>
                  <Avatar.Text
                    size={40}
                    label={app.applicantName.charAt(0)}
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <View style={styles.applicationDetails}>
                    <Text variant="titleSmall">{app.applicantName}</Text>
                    <Text variant="bodySmall" style={styles.jobTitle}>
                      申請：{app.jobTitle}
                    </Text>
                    <Chip compact style={styles.chip}>
                      {app.professionalType}
                    </Chip>
                  </View>
                </View>
                <View style={styles.applicationActions}>
                  <Button
                    mode="contained"
                    compact
                    onPress={() => {}}
                    style={styles.approveButton}
                  >
                    審核
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Icon name="check-circle-outline" size={48} color={theme.colors.primary} />
              <Text variant="bodyMedium" style={styles.emptyText}>
                目前沒有待審核的申請
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Tips */}
        <Card style={[styles.tipsCard, { backgroundColor: theme.colors.primaryContainer }]}>
          <Card.Content>
            <View style={styles.tipsHeader}>
              <Icon name="lightbulb-outline" size={24} color={theme.colors.primary} />
              <Text variant="titleSmall" style={{ marginLeft: spacing.sm }}>
                小提示
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.tipsText}>
              及時回覆申請者可以提高媒合成功率！建議在收到申請後 48 小時內完成審核。
            </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  applicationCard: {
    marginBottom: spacing.sm,
  },
  applicationContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  applicationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  applicationDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  jobTitle: {
    opacity: 0.7,
    marginVertical: spacing.xs,
  },
  chip: {
    alignSelf: 'flex-start',
  },
  applicationActions: {
    marginLeft: spacing.md,
  },
  approveButton: {
    borderRadius: 20,
  },
  emptyCard: {
    marginBottom: spacing.md,
  },
  emptyContent: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    marginTop: spacing.md,
    opacity: 0.7,
  },
  tipsCard: {
    marginTop: spacing.lg,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tipsText: {
    opacity: 0.8,
    lineHeight: 20,
  },
});

export default HospitalHomeScreen;


