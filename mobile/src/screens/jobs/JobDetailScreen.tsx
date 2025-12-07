import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  useTheme,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchJob, clearCurrentJob } from '@/store/slices/jobsSlice';
import { JobsStackParamList } from '@/navigation/types';
import { spacing } from '@/theme';
import type { ProfessionalType } from '@/types';

type JobDetailRouteProp = RouteProp<JobsStackParamList, 'JobDetail'>;
type JobDetailNavigationProp = NativeStackNavigationProp<JobsStackParamList, 'JobDetail'>;

const professionalTypeLabels: Record<ProfessionalType, string> = {
  doctor: '醫師',
  nurse: '護理師',
  registered_nurse: '護士',
  pharmacist: '藥師',
  pharmacy_technician: '藥劑生',
  medical_technologist: '醫檢師',
  medical_laboratory_technician: '醫檢生',
};

const weekdayLabels: Record<string, string> = {
  monday: '週一',
  tuesday: '週二',
  wednesday: '週三',
  thursday: '週四',
  friday: '週五',
  saturday: '週六',
  sunday: '週日',
};

const JobDetailScreen = () => {
  const route = useRoute<JobDetailRouteProp>();
  const navigation = useNavigation<JobDetailNavigationProp>();
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const { currentJob: job, isLoading, error } = useAppSelector((state) => state.jobs);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchJob(route.params.jobId));

    return () => {
      dispatch(clearCurrentJob());
    };
  }, [dispatch, route.params.jobId]);

  const handleApply = () => {
    if (job) {
      navigation.navigate('ApplyJob', { jobId: job.jobId });
    }
  };

  const handleCall = () => {
    if (job?.contactInfo?.phone) {
      Linking.openURL(`tel:${job.contactInfo.phone}`);
    }
  };

  const handleEmail = () => {
    if (job?.contactInfo?.email) {
      Linking.openURL(`mailto:${job.contactInfo.email}`);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !job) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={48} color={theme.colors.error} />
        <Text variant="titleMedium" style={styles.errorText}>
          {error || '無法載入職缺資訊'}
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          返回
        </Button>
      </View>
    );
  }

  const canApply = user?.userType === 'healthcare_professional' && job.status === 'open';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.chipRow}>
              <Chip mode="flat" style={{ backgroundColor: theme.colors.primaryContainer }}>
                {professionalTypeLabels[job.professionalType]}
              </Chip>
              {job.isPublicFunded && (
                <Chip mode="flat" style={{ backgroundColor: theme.colors.tertiaryContainer }}>
                  公費
                </Chip>
              )}
              <Chip
                mode="flat"
                style={{
                  backgroundColor:
                    job.status === 'open'
                      ? theme.colors.secondaryContainer
                      : theme.colors.errorContainer,
                }}
              >
                {job.status === 'open' ? '招募中' : '已關閉'}
              </Chip>
            </View>

            <Text variant="headlineSmall" style={styles.hospitalName}>
              {job.hospital?.name}
            </Text>

            <View style={styles.infoRow}>
              <Icon name="map-marker" size={20} color={theme.colors.primary} />
              <Text variant="bodyLarge">
                {job.county} {job.township}
              </Text>
            </View>

            {job.specialty && (
              <View style={styles.infoRow}>
                <Icon name="stethoscope" size={20} color={theme.colors.primary} />
                <Text variant="bodyLarge">{job.specialty}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Details Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              職缺資訊
            </Text>
            <Divider style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>需求人數</Text>
              <Text>{job.numberOfPositions} 人</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>服務期間</Text>
              <Text>
                {job.serviceStartDate} ~ {job.serviceEndDate}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>服務時段</Text>
              <Text>{job.serviceDays.map((d) => weekdayLabels[d] || d).join('、')}</Text>
            </View>

            {job.salary && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>薪資待遇</Text>
                <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                  ${job.salary.amount} / {job.salary.unit === 'daily' ? '日' : '月'}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Benefits Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              福利項目
            </Text>
            <Divider style={styles.divider} />

            <View style={styles.benefitRow}>
              <View style={styles.benefitItem}>
                <Icon
                  name={job.mealProvided ? 'check-circle' : 'close-circle'}
                  size={24}
                  color={job.mealProvided ? theme.colors.primary : theme.colors.onSurfaceVariant}
                />
                <Text>膳食</Text>
              </View>
              <View style={styles.benefitItem}>
                <Icon
                  name={job.accommodationProvided ? 'check-circle' : 'close-circle'}
                  size={24}
                  color={
                    job.accommodationProvided
                      ? theme.colors.primary
                      : theme.colors.onSurfaceVariant
                  }
                />
                <Text>住宿</Text>
              </View>
              <View style={styles.benefitItem}>
                <Icon
                  name={job.transportationProvided ? 'check-circle' : 'close-circle'}
                  size={24}
                  color={
                    job.transportationProvided
                      ? theme.colors.primary
                      : theme.colors.onSurfaceVariant
                  }
                />
                <Text>交通</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Contact Card */}
        {job.contactInfo && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                聯絡方式
              </Text>
              <Divider style={styles.divider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>聯絡人</Text>
                <Text>{job.contactInfo.name}</Text>
              </View>

              <View style={styles.contactButtons}>
                <Button
                  mode="outlined"
                  icon="phone"
                  onPress={handleCall}
                  style={styles.contactButton}
                >
                  {job.contactInfo.phone}
                </Button>
                {job.contactInfo.email && (
                  <Button
                    mode="outlined"
                    icon="email"
                    onPress={handleEmail}
                    style={styles.contactButton}
                  >
                    發送郵件
                  </Button>
                )}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Remarks */}
        {job.remarks && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                備註說明
              </Text>
              <Divider style={styles.divider} />
              <Text>{job.remarks}</Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Apply Button */}
      {canApply && (
        <View style={[styles.applyContainer, { backgroundColor: theme.colors.surface }]}>
          <Button mode="contained" onPress={handleApply} style={styles.applyButton}>
            立即申請
          </Button>
        </View>
      )}
    </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    marginVertical: spacing.md,
    textAlign: 'center',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  headerCard: {
    marginBottom: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  hospitalName: {
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  divider: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  detailLabel: {
    opacity: 0.7,
  },
  benefitRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  benefitItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  contactButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  contactButton: {
    flex: 1,
  },
  applyContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  applyButton: {
    paddingVertical: spacing.sm,
  },
});

export default JobDetailScreen;

