import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  Text,
  Card,
  Chip,
  useTheme,
  SegmentedButtons,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { applicationsService } from '@/services/api/applications';
import { spacing } from '@/theme';
import type { Application, ApplicationStatus } from '@/types';

const statusLabels: Record<ApplicationStatus, string> = {
  pending: '待審核',
  reviewing: '審核中',
  approved: '已核准',
  rejected: '已拒絕',
  cancelled: '已取消',
  withdrawn: '已撤回',
};

const statusColors: Record<ApplicationStatus, string> = {
  pending: '#FFA000',
  reviewing: '#1976D2',
  approved: '#388E3C',
  rejected: '#D32F2F',
  cancelled: '#757575',
  withdrawn: '#757575',
};

const ApplicationCard = ({ application }: { application: Application }) => {
  const theme = useTheme();

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.cardHeader}>
          <Chip
            mode="flat"
            style={{ backgroundColor: `${statusColors[application.status]}20` }}
            textStyle={{ color: statusColors[application.status] }}
          >
            {statusLabels[application.status]}
          </Chip>
          <Text variant="bodySmall" style={styles.date}>
            {new Date(application.appliedAt).toLocaleDateString('zh-TW')}
          </Text>
        </View>

        <Text variant="titleMedium" style={styles.hospitalName}>
          {application.job?.hospital?.name || '未知醫院'}
        </Text>

        <View style={styles.infoRow}>
          <Icon name="map-marker" size={16} color={theme.colors.onSurfaceVariant} />
          <Text variant="bodyMedium" style={styles.infoText}>
            {application.job?.county} {application.job?.township}
          </Text>
        </View>

        {application.job?.specialty && (
          <View style={styles.infoRow}>
            <Icon name="stethoscope" size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyMedium" style={styles.infoText}>
              {application.job.specialty}
            </Text>
          </View>
        )}

        {application.reviewNote && (
          <View style={[styles.reviewNote, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text variant="bodySmall" style={{ opacity: 0.7 }}>
              審核備註：{application.reviewNote}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const ApplicationsScreen = () => {
  const theme = useTheme();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadApplications = useCallback(async () => {
    try {
      const params =
        statusFilter !== 'all' ? { status: statusFilter as ApplicationStatus } : undefined;
      const response = await applicationsService.getApplications(params);
      setApplications(response.data);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadApplications();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Application }) => (
    <ApplicationCard application={item} />
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Icon name="file-document-outline" size={64} color={theme.colors.onSurfaceVariant} />
      <Text variant="titleMedium" style={styles.emptyText}>
        沒有申請記錄
      </Text>
      <Text variant="bodyMedium" style={styles.emptySubtext}>
        前往職缺列表申請支援機會
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          我的申請
        </Text>

        <SegmentedButtons
          value={statusFilter}
          onValueChange={setStatusFilter}
          buttons={[
            { value: 'all', label: '全部' },
            { value: 'pending', label: '待審核' },
            { value: 'approved', label: '已核准' },
            { value: 'rejected', label: '已拒絕' },
          ]}
          style={styles.segmented}
        />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={applications}
          renderItem={renderItem}
          keyExtractor={(item) => item.applicationId}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={ListEmptyComponent}
        />
      )}
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
  segmented: {
    marginBottom: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  date: {
    opacity: 0.7,
  },
  hospitalName: {
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  infoText: {
    opacity: 0.8,
  },
  reviewNote: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
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
});

export default ApplicationsScreen;

