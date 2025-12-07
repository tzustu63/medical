import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  Chip,
  FAB,
  Menu,
  Divider,
  ActivityIndicator,
  Searchbar,
  SegmentedButtons,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { spacing } from '@/theme';
import apiClient from '@/services/api/client';

interface Job {
  id: string;
  professionalType: string;
  county: string;
  township: string;
  serviceStartDate: string;
  serviceEndDate: string;
  status: 'open' | 'closed' | 'filled';
  applicationsCount: number;
  viewsCount: number;
  salaryAmount: number;
  salaryUnit: string;
}

const professionalTypeLabels: Record<string, string> = {
  doctor: '醫師',
  nurse: '護理師',
  pharmacist: '藥師',
  medical_technologist: '醫檢師',
};

const statusLabels: Record<string, { label: string; color: string }> = {
  open: { label: '招募中', color: '#4CAF50' },
  closed: { label: '已關閉', color: '#9E9E9E' },
  filled: { label: '已額滿', color: '#2196F3' },
};

const HospitalJobsScreen = () => {
  const navigation = useNavigation<any>();
  const theme = useTheme();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
  }, [statusFilter]);

  const loadJobs = async () => {
    try {
      // TODO: 從 API 載入數據
      // 暫時使用模擬數據
      const mockJobs: Job[] = [
        {
          id: '1',
          professionalType: 'doctor',
          county: '台東縣',
          township: '卑南鄉',
          serviceStartDate: '2024-12-15',
          serviceEndDate: '2024-12-20',
          status: 'open',
          applicationsCount: 5,
          viewsCount: 120,
          salaryAmount: 15000,
          salaryUnit: 'day',
        },
        {
          id: '2',
          professionalType: 'nurse',
          county: '台東縣',
          township: '卑南鄉',
          serviceStartDate: '2024-12-10',
          serviceEndDate: '2024-12-15',
          status: 'open',
          applicationsCount: 3,
          viewsCount: 85,
          salaryAmount: 4500,
          salaryUnit: 'day',
        },
        {
          id: '3',
          professionalType: 'pharmacist',
          county: '台東縣',
          township: '卑南鄉',
          serviceStartDate: '2024-11-01',
          serviceEndDate: '2024-11-05',
          status: 'filled',
          applicationsCount: 8,
          viewsCount: 200,
          salaryAmount: 6000,
          salaryUnit: 'day',
        },
      ];

      if (statusFilter !== 'all') {
        setJobs(mockJobs.filter((job) => job.status === statusFilter));
      } else {
        setJobs(mockJobs);
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadJobs();
  };

  const handleCloseJob = async (jobId: string) => {
    try {
      // TODO: 呼叫 API 關閉職缺
      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId ? { ...job, status: 'closed' as const } : job
        )
      );
    } catch (error) {
      console.error('Failed to close job:', error);
    }
    setMenuVisible(null);
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      // TODO: 呼叫 API 刪除職缺
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (error) {
      console.error('Failed to delete job:', error);
    }
    setMenuVisible(null);
  };

  const formatSalary = (amount: number, unit: string) => {
    const unitLabels: Record<string, string> = {
      hour: '/時',
      day: '/日',
      month: '/月',
      total: '(總計)',
    };
    return `$${amount.toLocaleString()}${unitLabels[unit] || ''}`;
  };

  const renderJobCard = ({ item }: { item: Job }) => {
    const statusInfo = statusLabels[item.status];

    return (
      <Card style={styles.jobCard} mode="outlined">
        <Card.Content>
          <View style={styles.jobHeader}>
            <View style={styles.jobTitleRow}>
              <Chip
                style={[styles.typeChip, { backgroundColor: theme.colors.primaryContainer }]}
                textStyle={{ color: theme.colors.primary }}
              >
                {professionalTypeLabels[item.professionalType]}
              </Chip>
              <Chip
                style={[styles.statusChip, { backgroundColor: statusInfo.color + '20' }]}
                textStyle={{ color: statusInfo.color }}
              >
                {statusInfo.label}
              </Chip>
            </View>
            <Menu
              visible={menuVisible === item.id}
              onDismiss={() => setMenuVisible(null)}
              anchor={
                <Button
                  mode="text"
                  onPress={() => setMenuVisible(item.id)}
                  compact
                >
                  <Icon name="dots-vertical" size={20} />
                </Button>
              }
            >
              <Menu.Item
                onPress={() => {
                  setMenuVisible(null);
                  navigation.navigate('EditJob', { jobId: item.id });
                }}
                title="編輯"
                leadingIcon="pencil"
              />
              {item.status === 'open' && (
                <Menu.Item
                  onPress={() => handleCloseJob(item.id)}
                  title="關閉職缺"
                  leadingIcon="close-circle"
                />
              )}
              <Divider />
              <Menu.Item
                onPress={() => handleDeleteJob(item.id)}
                title="刪除"
                leadingIcon="delete"
                titleStyle={{ color: theme.colors.error }}
              />
            </Menu>
          </View>

          <View style={styles.jobInfo}>
            <View style={styles.infoRow}>
              <Icon name="map-marker" size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodyMedium" style={styles.infoText}>
                {item.county} {item.township}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="calendar-range" size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodyMedium" style={styles.infoText}>
                {item.serviceStartDate} ~ {item.serviceEndDate}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="currency-usd" size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodyMedium" style={styles.infoText}>
                {formatSalary(item.salaryAmount, item.salaryUnit)}
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="eye" size={16} color={theme.colors.outline} />
              <Text variant="bodySmall" style={styles.statText}>
                {item.viewsCount} 次瀏覽
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="account-multiple" size={16} color={theme.colors.outline} />
              <Text variant="bodySmall" style={styles.statText}>
                {item.applicationsCount} 人申請
              </Text>
            </View>
            <Button
              mode="text"
              onPress={() => navigation.navigate('JobApplications', { jobId: item.id })}
              compact
            >
              查看申請者
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
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
      {/* Search & Filter */}
      <View style={styles.filterContainer}>
        <Searchbar
          placeholder="搜尋職缺"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        <SegmentedButtons
          value={statusFilter}
          onValueChange={setStatusFilter}
          buttons={[
            { value: 'all', label: '全部' },
            { value: 'open', label: '招募中' },
            { value: 'filled', label: '已額滿' },
            { value: 'closed', label: '已關閉' },
          ]}
          style={styles.segmented}
        />
      </View>

      {/* Job List */}
      <FlatList
        data={jobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="briefcase-off-outline" size={64} color={theme.colors.outline} />
            <Text variant="bodyLarge" style={styles.emptyText}>
              尚無職缺
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              點擊下方按鈕發布新職缺
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <FAB
        icon="plus"
        label="發布職缺"
        onPress={() => navigation.navigate('CreateJob')}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
      />
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
  filterContainer: {
    padding: spacing.md,
    paddingBottom: 0,
  },
  searchbar: {
    marginBottom: spacing.sm,
  },
  segmented: {
    marginBottom: spacing.md,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  jobCard: {
    marginBottom: spacing.md,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  jobTitleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  typeChip: {
    height: 28,
  },
  statusChip: {
    height: 28,
  },
  jobInfo: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
  },
  divider: {
    marginVertical: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    marginTop: spacing.md,
    opacity: 0.7,
  },
  emptySubtext: {
    marginTop: spacing.xs,
    opacity: 0.5,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
  },
});

export default HospitalJobsScreen;

