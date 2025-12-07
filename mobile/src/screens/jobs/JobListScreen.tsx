import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  Text,
  Card,
  Chip,
  useTheme,
  Searchbar,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchJobs, setSearchParams } from '@/store/slices/jobsSlice';
import { JobsStackParamList } from '@/navigation/types';
import { spacing } from '@/theme';
import type { Job, ProfessionalType } from '@/types';

type JobListNavigationProp = NativeStackNavigationProp<JobsStackParamList, 'JobList'>;

const professionalTypeLabels: Record<ProfessionalType, string> = {
  doctor: '醫師',
  nurse: '護理師',
  registered_nurse: '護士',
  pharmacist: '藥師',
  pharmacy_technician: '藥劑生',
  medical_technologist: '醫檢師',
  medical_laboratory_technician: '醫檢生',
};

const JobCard = ({ job, onPress }: { job: Job; onPress: () => void }) => {
  const theme = useTheme();

  return (
    <Card style={styles.card} mode="elevated" onPress={onPress}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Chip mode="flat" compact style={{ backgroundColor: theme.colors.primaryContainer }}>
            {professionalTypeLabels[job.professionalType]}
          </Chip>
          {job.isPublicFunded && (
            <Chip mode="flat" compact style={{ backgroundColor: theme.colors.tertiaryContainer }}>
              公費
            </Chip>
          )}
        </View>

        <Text variant="titleMedium" style={styles.hospitalName}>
          {job.hospital?.name || '未知醫院'}
        </Text>

        <View style={styles.infoRow}>
          <Icon name="map-marker" size={16} color={theme.colors.onSurfaceVariant} />
          <Text variant="bodyMedium" style={styles.infoText}>
            {job.county} {job.township}
          </Text>
        </View>

        {job.specialty && (
          <View style={styles.infoRow}>
            <Icon name="stethoscope" size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyMedium" style={styles.infoText}>
              {job.specialty}
            </Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Icon name="calendar-range" size={16} color={theme.colors.onSurfaceVariant} />
          <Text variant="bodyMedium" style={styles.infoText}>
            {job.serviceStartDate} ~ {job.serviceEndDate}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.tags}>
            {job.mealProvided && (
              <Chip compact mode="outlined" style={styles.smallChip}>
                供餐
              </Chip>
            )}
            {job.accommodationProvided && (
              <Chip compact mode="outlined" style={styles.smallChip}>
                住宿
              </Chip>
            )}
            {job.transportationProvided && (
              <Chip compact mode="outlined" style={styles.smallChip}>
                交通
              </Chip>
            )}
          </View>
          {job.salary && (
            <Text variant="titleSmall" style={{ color: theme.colors.primary }}>
              ${job.salary.amount}/{job.salary.unit === 'daily' ? '日' : '月'}
            </Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const JobListScreen = () => {
  const navigation = useNavigation<JobListNavigationProp>();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { jobs, isLoading, pagination, searchParams } = useAppSelector((state) => state.jobs);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    dispatch(fetchJobs(searchParams));
  }, [dispatch, searchParams]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchJobs(searchParams));
    setRefreshing(false);
  }, [dispatch, searchParams]);

  const loadMore = useCallback(() => {
    if (pagination?.hasNextPage && !isLoading) {
      dispatch(
        fetchJobs({
          ...searchParams,
          page: (pagination?.currentPage || 1) + 1,
        })
      );
    }
  }, [dispatch, pagination, isLoading, searchParams]);

  const handleSearch = () => {
    dispatch(setSearchParams({ ...searchParams, hospitalName: searchQuery }));
  };

  const renderItem = ({ item }: { item: Job }) => (
    <JobCard job={item} onPress={() => navigation.navigate('JobDetail', { jobId: item.jobId })} />
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Icon name="briefcase-search-outline" size={64} color={theme.colors.onSurfaceVariant} />
      <Text variant="titleMedium" style={styles.emptyText}>
        目前沒有符合條件的職缺
      </Text>
      <Text variant="bodyMedium" style={styles.emptySubtext}>
        請嘗試調整搜尋條件
      </Text>
    </View>
  );

  const ListFooterComponent = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          職缺列表
        </Text>
        <View style={styles.searchRow}>
          <Searchbar
            placeholder="搜尋醫院名稱"
            onChangeText={setSearchQuery}
            value={searchQuery}
            onSubmitEditing={handleSearch}
            style={styles.searchbar}
          />
          <IconButton
            icon="filter-variant"
            mode="contained-tonal"
            onPress={() => {
              // TODO: 開啟篩選器
            }}
          />
        </View>
      </View>

      {pagination && (
        <Text variant="bodySmall" style={styles.resultCount}>
          共 {pagination.totalItems} 筆職缺
        </Text>
      )}

      <FlatList
        data={jobs}
        renderItem={renderItem}
        keyExtractor={(item) => item.jobId}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={!isLoading ? ListEmptyComponent : null}
        ListFooterComponent={ListFooterComponent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.md,
    paddingBottom: 0,
  },
  title: {
    marginBottom: spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchbar: {
    flex: 1,
  },
  resultCount: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    opacity: 0.7,
  },
  listContent: {
    padding: spacing.md,
    paddingTop: 0,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  hospitalName: {
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  infoText: {
    opacity: 0.8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  smallChip: {
    height: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    marginTop: spacing.md,
  },
  emptySubtext: {
    opacity: 0.7,
    marginTop: spacing.xs,
  },
  footer: {
    paddingVertical: spacing.md,
  },
});

export default JobListScreen;

