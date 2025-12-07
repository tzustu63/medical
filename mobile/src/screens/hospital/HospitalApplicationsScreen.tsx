import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  Chip,
  Avatar,
  SegmentedButtons,
  ActivityIndicator,
  Dialog,
  Portal,
  TextInput,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { spacing } from '@/theme';

interface Application {
  id: string;
  applicant: {
    id: string;
    name: string;
    professionalType: string;
    specialties: string[];
    yearsOfExperience: number;
    rating: number;
  };
  job: {
    id: string;
    title: string;
    serviceStartDate: string;
    serviceEndDate: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  appliedAt: string;
  message?: string;
}

const professionalTypeLabels: Record<string, string> = {
  doctor: '醫師',
  nurse: '護理師',
  pharmacist: '藥師',
  medical_technologist: '醫檢師',
};

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: '待審核', color: '#FF9800', icon: 'clock-outline' },
  approved: { label: '已錄取', color: '#4CAF50', icon: 'check-circle' },
  rejected: { label: '已婉拒', color: '#F44336', icon: 'close-circle' },
  withdrawn: { label: '已撤回', color: '#9E9E9E', icon: 'undo' },
};

const HospitalApplicationsScreen = () => {
  const navigation = useNavigation<any>();
  const theme = useTheme();

  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [rejectDialogVisible, setRejectDialogVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadApplications();
  }, [statusFilter]);

  const loadApplications = async () => {
    try {
      // TODO: 從 API 載入數據
      const mockApplications: Application[] = [
        {
          id: '1',
          applicant: {
            id: 'p1',
            name: '王大明',
            professionalType: 'doctor',
            specialties: ['內科', '家醫科'],
            yearsOfExperience: 10,
            rating: 4.8,
          },
          job: {
            id: 'j1',
            title: '內科支援醫師',
            serviceStartDate: '2024-12-15',
            serviceEndDate: '2024-12-20',
          },
          status: 'pending',
          appliedAt: '2024-12-07',
          message: '我有豐富的偏鄉醫療經驗，希望能為當地居民服務。',
        },
        {
          id: '2',
          applicant: {
            id: 'p2',
            name: '李小華',
            professionalType: 'nurse',
            specialties: ['急診', 'ICU'],
            yearsOfExperience: 5,
            rating: 4.5,
          },
          job: {
            id: 'j2',
            title: '急診護理支援',
            serviceStartDate: '2024-12-10',
            serviceEndDate: '2024-12-15',
          },
          status: 'pending',
          appliedAt: '2024-12-06',
        },
        {
          id: '3',
          applicant: {
            id: 'p3',
            name: '張醫師',
            professionalType: 'doctor',
            specialties: ['外科'],
            yearsOfExperience: 15,
            rating: 4.9,
          },
          job: {
            id: 'j1',
            title: '內科支援醫師',
            serviceStartDate: '2024-12-15',
            serviceEndDate: '2024-12-20',
          },
          status: 'approved',
          appliedAt: '2024-12-05',
        },
      ];

      if (statusFilter !== 'all') {
        setApplications(mockApplications.filter((app) => app.status === statusFilter));
      } else {
        setApplications(mockApplications);
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadApplications();
  };

  const handleApprove = async (applicationId: string) => {
    try {
      // TODO: 呼叫 API 核准申請
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: 'approved' as const } : app
        )
      );
    } catch (error) {
      console.error('Failed to approve application:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedApplication) return;

    try {
      // TODO: 呼叫 API 拒絕申請
      setApplications((prev) =>
        prev.map((app) =>
          app.id === selectedApplication.id ? { ...app, status: 'rejected' as const } : app
        )
      );
    } catch (error) {
      console.error('Failed to reject application:', error);
    } finally {
      setRejectDialogVisible(false);
      setSelectedApplication(null);
      setRejectReason('');
    }
  };

  const openRejectDialog = (application: Application) => {
    setSelectedApplication(application);
    setRejectDialogVisible(true);
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        <Icon name="star" size={14} color="#FFC107" />
        <Text variant="bodySmall" style={styles.ratingText}>
          {rating.toFixed(1)}
        </Text>
      </View>
    );
  };

  const renderApplicationCard = ({ item }: { item: Application }) => {
    const statusInfo = statusConfig[item.status];
    const isPending = item.status === 'pending';

    return (
      <Card style={styles.applicationCard} mode="outlined">
        <Card.Content>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.applicantInfo}>
              <Avatar.Text
                size={48}
                label={item.applicant.name.charAt(0)}
                style={{ backgroundColor: theme.colors.primary }}
              />
              <View style={styles.applicantDetails}>
                <Text variant="titleMedium">{item.applicant.name}</Text>
                <View style={styles.applicantMeta}>
                  <Chip compact style={styles.typeChip}>
                    {professionalTypeLabels[item.applicant.professionalType]}
                  </Chip>
                  {renderStars(item.applicant.rating)}
                </View>
              </View>
            </View>
            <Chip
              style={[styles.statusChip, { backgroundColor: statusInfo.color + '20' }]}
              textStyle={{ color: statusInfo.color }}
              icon={() => (
                <Icon name={statusInfo.icon} size={16} color={statusInfo.color} />
              )}
            >
              {statusInfo.label}
            </Chip>
          </View>

          {/* Applicant Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Icon name="medical-bag" size={16} color={theme.colors.outline} />
              <Text variant="bodySmall" style={styles.infoText}>
                專長：{item.applicant.specialties.join('、')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="clock-outline" size={16} color={theme.colors.outline} />
              <Text variant="bodySmall" style={styles.infoText}>
                年資：{item.applicant.yearsOfExperience} 年
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Job Info */}
          <View style={styles.jobSection}>
            <Text variant="labelMedium" style={styles.jobLabel}>
              申請職缺
            </Text>
            <Text variant="bodyMedium">{item.job.title}</Text>
            <Text variant="bodySmall" style={styles.jobDate}>
              {item.job.serviceStartDate} ~ {item.job.serviceEndDate}
            </Text>
          </View>

          {/* Message */}
          {item.message && (
            <View style={styles.messageSection}>
              <Text variant="labelMedium" style={styles.messageLabel}>
                申請留言
              </Text>
              <Text variant="bodySmall" style={styles.messageText}>
                {item.message}
              </Text>
            </View>
          )}

          {/* Actions */}
          {isPending && (
            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={() => openRejectDialog(item)}
                style={styles.rejectButton}
                textColor={theme.colors.error}
              >
                婉拒
              </Button>
              <Button
                mode="contained"
                onPress={() => handleApprove(item.id)}
                style={styles.approveButton}
              >
                錄取
              </Button>
            </View>
          )}

          <Text variant="bodySmall" style={styles.applyDate}>
            申請時間：{item.appliedAt}
          </Text>
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
      {/* Filter */}
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={statusFilter}
          onValueChange={setStatusFilter}
          buttons={[
            { value: 'pending', label: '待審核' },
            { value: 'approved', label: '已錄取' },
            { value: 'rejected', label: '已婉拒' },
            { value: 'all', label: '全部' },
          ]}
          style={styles.segmented}
        />
      </View>

      {/* Application List */}
      <FlatList
        data={applications}
        renderItem={renderApplicationCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon
              name={statusFilter === 'pending' ? 'inbox-outline' : 'file-document-outline'}
              size={64}
              color={theme.colors.outline}
            />
            <Text variant="bodyLarge" style={styles.emptyText}>
              {statusFilter === 'pending' ? '目前沒有待審核的申請' : '沒有符合條件的申請'}
            </Text>
          </View>
        }
      />

      {/* Reject Dialog */}
      <Portal>
        <Dialog visible={rejectDialogVisible} onDismiss={() => setRejectDialogVisible(false)}>
          <Dialog.Title>婉拒申請</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.dialogText}>
              確定要婉拒 {selectedApplication?.applicant.name} 的申請嗎？
            </Text>
            <TextInput
              label="婉拒原因（選填）"
              value={rejectReason}
              onChangeText={setRejectReason}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRejectDialogVisible(false)}>取消</Button>
            <Button onPress={handleReject} textColor={theme.colors.error}>
              確認婉拒
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  },
  segmented: {
    marginBottom: spacing.sm,
  },
  listContent: {
    padding: spacing.md,
    paddingTop: 0,
  },
  applicationCard: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  applicantInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  applicantDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  applicantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  typeChip: {
    height: 24,
  },
  statusChip: {
    height: 28,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    color: '#666',
  },
  infoSection: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    color: '#666',
  },
  divider: {
    marginVertical: spacing.md,
  },
  jobSection: {
    marginBottom: spacing.sm,
  },
  jobLabel: {
    color: '#666',
    marginBottom: spacing.xs,
  },
  jobDate: {
    color: '#666',
    marginTop: spacing.xs,
  },
  messageSection: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  messageLabel: {
    color: '#666',
    marginBottom: spacing.xs,
  },
  messageText: {
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  rejectButton: {
    borderColor: '#F44336',
  },
  approveButton: {},
  applyDate: {
    color: '#999',
    marginTop: spacing.md,
    textAlign: 'right',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    marginTop: spacing.md,
    opacity: 0.7,
  },
  dialogText: {
    marginBottom: spacing.md,
  },
  dialogInput: {
    marginTop: spacing.sm,
  },
});

export default HospitalApplicationsScreen;

