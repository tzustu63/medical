import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  Avatar,
  List,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { spacing } from '@/theme';

interface HospitalInfo {
  hospitalCode: string;
  name: string;
  county: string;
  township: string;
  address: string;
  phone: string;
  hospitalType: string;
  contactEmail: string;
  website?: string;
}

const hospitalTypeLabels: Record<string, string> = {
  medical_center: '醫學中心',
  regional_hospital: '區域醫院',
  district_hospital: '地區醫院',
  clinic: '診所/衛生所',
};

const HospitalProfileScreen = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { user } = useAppSelector((state) => state.auth);

  const [hospitalInfo, setHospitalInfo] = useState<HospitalInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHospitalInfo();
  }, []);

  const loadHospitalInfo = async () => {
    try {
      // TODO: 從 API 載入醫院資訊
      // 暫時使用模擬數據
      setHospitalInfo({
        hospitalCode: '111',
        name: '台東縣卑南鄉衛生所',
        county: '台東縣',
        township: '卑南鄉',
        address: '台東縣卑南鄉文化二街21號',
        phone: '089-381001',
        hospitalType: 'clinic',
        contactEmail: 'puyuma@health.gov.tw',
        website: 'https://www.ttshb.gov.tw',
      });
    } catch (error) {
      console.error('Failed to load hospital info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('確定要登出帳號嗎？')) {
        dispatch(logout());
      }
    } else {
      // Native 版本會使用 Alert
      dispatch(logout());
    }
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Header */}
        <Card style={styles.headerCard}>
          <Card.Content style={styles.headerContent}>
            <Avatar.Icon
              size={80}
              icon="hospital-building"
              style={{ backgroundColor: theme.colors.primary }}
            />
            <View style={styles.headerInfo}>
              <Text variant="headlineSmall">{user?.name}</Text>
              <Text variant="bodyMedium" style={styles.email}>
                {user?.email}
              </Text>
              <View style={styles.roleChip}>
                <Icon name="shield-account" size={16} color={theme.colors.primary} />
                <Text style={{ color: theme.colors.primary, marginLeft: spacing.xs }}>
                  醫院管理員
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Hospital Info */}
        {hospitalInfo && (
          <Card style={styles.card}>
            <Card.Title
              title="醫院資訊"
              left={(props) => <Avatar.Icon {...props} icon="hospital-building" />}
            />
            <Card.Content>
              <List.Item
                title="醫院名稱"
                description={hospitalInfo.name}
                left={(props) => <List.Icon {...props} icon="hospital-marker" />}
              />
              <Divider />
              <List.Item
                title="醫院代碼"
                description={hospitalInfo.hospitalCode}
                left={(props) => <List.Icon {...props} icon="identifier" />}
              />
              <Divider />
              <List.Item
                title="醫院類型"
                description={hospitalTypeLabels[hospitalInfo.hospitalType] || hospitalInfo.hospitalType}
                left={(props) => <List.Icon {...props} icon="domain" />}
              />
              <Divider />
              <List.Item
                title="地址"
                description={hospitalInfo.address}
                left={(props) => <List.Icon {...props} icon="map-marker" />}
              />
              <Divider />
              <List.Item
                title="電話"
                description={hospitalInfo.phone}
                left={(props) => <List.Icon {...props} icon="phone" />}
              />
              <Divider />
              <List.Item
                title="聯絡信箱"
                description={hospitalInfo.contactEmail}
                left={(props) => <List.Icon {...props} icon="email" />}
              />
              {hospitalInfo.website && (
                <>
                  <Divider />
                  <List.Item
                    title="網站"
                    description={hospitalInfo.website}
                    left={(props) => <List.Icon {...props} icon="web" />}
                  />
                </>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Statistics */}
        <Card style={styles.card}>
          <Card.Title
            title="統計數據"
            left={(props) => <Avatar.Icon {...props} icon="chart-bar" />}
          />
          <Card.Content style={styles.statsContent}>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                15
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                總職缺數
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                42
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                總申請數
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                28
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                已媒合
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Settings */}
        <Card style={styles.card}>
          <List.Item
            title="編輯醫院資訊"
            left={(props) => <List.Icon {...props} icon="hospital-building" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              // TODO: Navigate to edit hospital info
            }}
          />
          <Divider />
          <List.Item
            title="管理員設定"
            left={(props) => <List.Icon {...props} icon="account-cog" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              // TODO: Navigate to admin settings
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
            title="關於系統"
            left={(props) => <List.Icon {...props} icon="information-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              // TODO: Navigate to about
            }}
          />
        </Card>

        {/* Help Section */}
        <Card style={[styles.card, { backgroundColor: theme.colors.primaryContainer }]}>
          <Card.Content>
            <View style={styles.helpHeader}>
              <Icon name="help-circle-outline" size={24} color={theme.colors.primary} />
              <Text variant="titleSmall" style={{ marginLeft: spacing.sm }}>
                需要協助？
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.helpText}>
              如有任何問題或建議，請聯繫系統管理員。
            </Text>
            <Button
              mode="outlined"
              icon="email"
              onPress={() => {}}
              style={styles.helpButton}
            >
              聯絡客服
            </Button>
          </Card.Content>
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
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  card: {
    marginBottom: spacing.md,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    opacity: 0.7,
    marginTop: spacing.xs,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  helpText: {
    opacity: 0.8,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  helpButton: {
    alignSelf: 'flex-start',
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

export default HospitalProfileScreen;

