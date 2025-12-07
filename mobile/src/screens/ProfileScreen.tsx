import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  Avatar,
  List,
  Divider,
  ActivityIndicator,
  ProgressBar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { professionalsService } from '@/services/api/professionals';
import { spacing } from '@/theme';
import type { ProfessionalProfile, ProfessionalType } from '@/types';

const professionalTypeLabels: Record<ProfessionalType, string> = {
  doctor: '醫師',
  nurse: '護理師',
  registered_nurse: '護士',
  pharmacist: '藥師',
  pharmacy_technician: '藥劑生',
  medical_technologist: '醫檢師',
  medical_laboratory_technician: '醫檢生',
};

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { user } = useAppSelector((state) => state.auth);

  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.userType === 'healthcare_professional') {
      loadProfile();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const data = await professionalsService.getProfile();
      setProfile(data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      // Web 使用 window.confirm
      if (window.confirm('確定要登出帳號嗎？')) {
        dispatch(logout());
      }
    } else {
      // Native 使用 Alert.alert
      Alert.alert('確認登出', '確定要登出帳號嗎？', [
        { text: '取消', style: 'cancel' },
        {
          text: '登出',
          style: 'destructive',
          onPress: () => dispatch(logout()),
        },
      ]);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const isProfessional = user?.userType === 'healthcare_professional';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <Card style={styles.headerCard}>
          <Card.Content style={styles.headerContent}>
            <Avatar.Text
              size={80}
              label={user?.name?.charAt(0) || 'U'}
              style={{ backgroundColor: theme.colors.primary }}
            />
            <View style={styles.headerInfo}>
              <Text variant="headlineSmall">{user?.name}</Text>
              <Text variant="bodyMedium" style={styles.email}>
                {user?.email}
              </Text>
              {isProfessional && profile && (
                <View style={styles.typeChip}>
                  <Icon name="stethoscope" size={16} color={theme.colors.primary} />
                  <Text style={{ color: theme.colors.primary }}>
                    {professionalTypeLabels[profile.professionalType]}
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Profile Completion */}
        {isProfessional && profile && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.completionHeader}>
                <Text variant="titleMedium">檔案完整度</Text>
                <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
                  {profile.profileCompletionRate}%
                </Text>
              </View>
              <ProgressBar
                progress={profile.profileCompletionRate / 100}
                color={theme.colors.primary}
                style={styles.progressBar}
              />
              {profile.profileCompletionRate < 100 && (
                <Text variant="bodySmall" style={styles.completionHint}>
                  完善個人檔案可以提高申請成功率
                </Text>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Stats */}
        {isProfessional && profile && (
          <Card style={styles.card}>
            <Card.Content style={styles.statsContent}>
              <View style={styles.statItem}>
                <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                  {profile.totalApplications}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  總申請數
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                  {profile.totalCompletedJobs}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  已完成
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                  {profile.rating.toFixed(1)}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  評分
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Profile Info */}
        {isProfessional && profile && (
          <Card style={styles.card}>
            <List.Item
              title="執照字號"
              description={profile.licenseNumber}
              left={(props) => <List.Icon {...props} icon="card-account-details" />}
            />
            <Divider />
            <List.Item
              title="專科"
              description={profile.specialties?.join('、') || '未設定'}
              left={(props) => <List.Icon {...props} icon="medical-bag" />}
            />
            <Divider />
            <List.Item
              title="年資"
              description={profile.yearsOfExperience ? `${profile.yearsOfExperience} 年` : '未設定'}
              left={(props) => <List.Icon {...props} icon="clock-outline" />}
            />
            <Divider />
            <List.Item
              title="目前任職"
              description={profile.currentHospital || '未設定'}
              left={(props) => <List.Icon {...props} icon="hospital-building" />}
            />
            <Divider />
            <List.Item
              title="可支援地區"
              description={profile.availableRegions?.join('、') || '未設定'}
              left={(props) => <List.Icon {...props} icon="map-marker-multiple" />}
            />
          </Card>
        )}

        {/* Settings */}
        <Card style={styles.card}>
          <List.Item
            title="編輯個人資料"
            left={(props) => <List.Icon {...props} icon="account-edit" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              // TODO: Navigate to edit profile
            }}
          />
          <Divider />
          <List.Item
            title="通知設定"
            left={(props) => <List.Icon {...props} icon="bell-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              // TODO: Navigate to notification settings
            }}
          />
          <Divider />
          <List.Item
            title="關於我們"
            left={(props) => <List.Icon {...props} icon="information-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              // TODO: Navigate to about
            }}
          />
        </Card>

        {/* Logout Button */}
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor={theme.colors.error}
        >
          登出
        </Button>

        <Text variant="bodySmall" style={styles.version}>
          版本 1.0.0
        </Text>
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
  headerCard: {
    marginBottom: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  email: {
    opacity: 0.7,
    marginTop: spacing.xs,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  card: {
    marginBottom: spacing.md,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  completionHint: {
    opacity: 0.7,
    marginTop: spacing.sm,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    opacity: 0.7,
    marginTop: spacing.xs,
  },
  logoutButton: {
    marginTop: spacing.md,
    borderColor: '#D32F2F',
  },
  version: {
    textAlign: 'center',
    opacity: 0.5,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
});

export default ProfileScreen;

