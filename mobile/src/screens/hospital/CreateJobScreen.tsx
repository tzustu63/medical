import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  useTheme,
  SegmentedButtons,
  Switch,
  Snackbar,
  Chip,
  Surface,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing } from '@/theme';
import apiClient from '@/services/api/client';

interface CreateJobFormData {
  professionalType: string;
  specialty?: string;
  numberOfPositions: number;
  jobType: string;
  serviceType: string;
  serviceStartDate: string;
  serviceEndDate: string;
  salaryAmount: number;
  salaryUnit: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  remarks?: string;
  requirements?: string;
}

const schema = yup.object().shape({
  professionalType: yup.string().required('請選擇職業類別'),
  numberOfPositions: yup.number().min(1, '人數至少為1').required('請輸入需求人數'),
  jobType: yup.string().required('請選擇職缺類型'),
  serviceType: yup.string().required('請選擇服務類型'),
  serviceStartDate: yup.string().required('請選擇開始日期'),
  serviceEndDate: yup.string().required('請選擇結束日期'),
  salaryAmount: yup.number().min(0, '薪資不能為負數').required('請輸入薪資'),
  salaryUnit: yup.string().required('請選擇薪資單位'),
  contactName: yup.string().required('請輸入聯絡人姓名'),
  contactPhone: yup.string().matches(/^\d{10}$/, '請輸入10碼手機號碼').required('請輸入聯絡電話'),
  contactEmail: yup.string().email('請輸入有效的電子郵件').required('請輸入聯絡信箱'),
});

const professionalTypes = [
  { value: 'doctor', label: '醫師', icon: 'stethoscope' },
  { value: 'nurse', label: '護理師', icon: 'heart-pulse' },
  { value: 'pharmacist', label: '藥師', icon: 'pill' },
  { value: 'medical_technologist', label: '醫檢師', icon: 'test-tube' },
];

const jobTypes = [
  { value: 'full_time', label: '全職' },
  { value: 'part_time', label: '兼職' },
  { value: 'temporary', label: '臨時' },
];

const serviceTypes = [
  { value: 'regular', label: '一般看診' },
  { value: 'emergency', label: '急診' },
  { value: 'home_care', label: '居家照護' },
  { value: 'other', label: '其他' },
];

const salaryUnits = [
  { value: 'hour', label: '時薪' },
  { value: 'day', label: '日薪' },
  { value: 'month', label: '月薪' },
  { value: 'total', label: '總計' },
];

const CreateJobScreen = () => {
  const navigation = useNavigation<any>();
  const theme = useTheme();

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mealProvided, setMealProvided] = useState(false);
  const [accommodationProvided, setAccommodationProvided] = useState(false);
  const [transportationProvided, setTransportationProvided] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateJobFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      professionalType: '',
      numberOfPositions: 1,
      jobType: 'temporary',
      serviceType: 'regular',
      serviceStartDate: '',
      serviceEndDate: '',
      salaryAmount: 0,
      salaryUnit: 'day',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
    },
  });

  const selectedProfessionalType = watch('professionalType');

  const onSubmit = async (data: CreateJobFormData) => {
    setIsLoading(true);
    try {
      // TODO: 呼叫 API 建立職缺
      const jobData = {
        ...data,
        mealProvided,
        accommodationProvided,
        transportationProvided,
      };
      console.log('Creating job:', jobData);

      // 模擬 API 呼叫
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setShowSuccess(true);
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      console.error('Failed to create job:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Professional Type Selection */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          職業類別 *
        </Text>
        <Controller
          control={control}
          name="professionalType"
          render={({ field: { onChange, value } }) => (
            <View style={styles.typeGrid}>
              {professionalTypes.map((type) => (
                <Surface
                  key={type.value}
                  style={[
                    styles.typeCard,
                    value === type.value && { borderColor: theme.colors.primary, borderWidth: 2 },
                  ]}
                  elevation={1}
                >
                  <Button
                    mode="text"
                    onPress={() => onChange(type.value)}
                    style={styles.typeButton}
                    contentStyle={styles.typeButtonContent}
                  >
                    <View style={styles.typeInner}>
                      <Icon
                        name={type.icon}
                        size={32}
                        color={value === type.value ? theme.colors.primary : theme.colors.outline}
                      />
                      <Text
                        variant="bodyMedium"
                        style={[
                          styles.typeLabel,
                          value === type.value && { color: theme.colors.primary },
                        ]}
                      >
                        {type.label}
                      </Text>
                    </View>
                  </Button>
                </Surface>
              ))}
            </View>
          )}
        />
        {errors.professionalType && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {errors.professionalType.message}
          </Text>
        )}

        <Divider style={styles.divider} />

        {/* Job Details */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          職缺資訊
        </Text>

        <Controller
          control={control}
          name="numberOfPositions"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="需求人數 *"
              value={value?.toString()}
              onChangeText={(text) => onChange(parseInt(text) || 0)}
              mode="outlined"
              keyboardType="number-pad"
              error={!!errors.numberOfPositions}
              style={styles.input}
            />
          )}
        />

        <Text variant="labelLarge" style={styles.label}>
          職缺類型 *
        </Text>
        <Controller
          control={control}
          name="jobType"
          render={({ field: { onChange, value } }) => (
            <SegmentedButtons
              value={value}
              onValueChange={onChange}
              buttons={jobTypes}
              style={styles.segmented}
            />
          )}
        />

        <Text variant="labelLarge" style={styles.label}>
          服務類型 *
        </Text>
        <Controller
          control={control}
          name="serviceType"
          render={({ field: { onChange, value } }) => (
            <SegmentedButtons
              value={value}
              onValueChange={onChange}
              buttons={serviceTypes}
              style={styles.segmented}
            />
          )}
        />

        <Divider style={styles.divider} />

        {/* Service Period */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          服務期間
        </Text>

        <View style={styles.dateRow}>
          <Controller
            control={control}
            name="serviceStartDate"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="開始日期 *"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                placeholder="YYYY-MM-DD"
                error={!!errors.serviceStartDate}
                style={[styles.input, styles.dateInput]}
              />
            )}
          />
          <Controller
            control={control}
            name="serviceEndDate"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="結束日期 *"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                placeholder="YYYY-MM-DD"
                error={!!errors.serviceEndDate}
                style={[styles.input, styles.dateInput]}
              />
            )}
          />
        </View>

        <Divider style={styles.divider} />

        {/* Salary */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          薪資待遇
        </Text>

        <View style={styles.salaryRow}>
          <Controller
            control={control}
            name="salaryAmount"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="薪資金額 *"
                value={value?.toString()}
                onChangeText={(text) => onChange(parseInt(text) || 0)}
                mode="outlined"
                keyboardType="number-pad"
                left={<TextInput.Affix text="$" />}
                error={!!errors.salaryAmount}
                style={[styles.input, { flex: 1 }]}
              />
            )}
          />
        </View>

        <Text variant="labelLarge" style={styles.label}>
          薪資單位 *
        </Text>
        <Controller
          control={control}
          name="salaryUnit"
          render={({ field: { onChange, value } }) => (
            <SegmentedButtons
              value={value}
              onValueChange={onChange}
              buttons={salaryUnits}
              style={styles.segmented}
            />
          )}
        />

        {/* Benefits */}
        <Text variant="labelLarge" style={[styles.label, { marginTop: spacing.md }]}>
          提供福利
        </Text>
        <View style={styles.benefitsRow}>
          <View style={styles.switchRow}>
            <Text>提供餐食</Text>
            <Switch value={mealProvided} onValueChange={setMealProvided} />
          </View>
          <View style={styles.switchRow}>
            <Text>提供住宿</Text>
            <Switch value={accommodationProvided} onValueChange={setAccommodationProvided} />
          </View>
          <View style={styles.switchRow}>
            <Text>提供交通</Text>
            <Switch value={transportationProvided} onValueChange={setTransportationProvided} />
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Contact Info */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          聯絡資訊
        </Text>

        <Controller
          control={control}
          name="contactName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="聯絡人姓名 *"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              mode="outlined"
              error={!!errors.contactName}
              style={styles.input}
            />
          )}
        />

        <Controller
          control={control}
          name="contactPhone"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="聯絡電話 *"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              mode="outlined"
              keyboardType="phone-pad"
              error={!!errors.contactPhone}
              style={styles.input}
            />
          )}
        />

        <Controller
          control={control}
          name="contactEmail"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="聯絡信箱 *"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!errors.contactEmail}
              style={styles.input}
            />
          )}
        />

        <Divider style={styles.divider} />

        {/* Additional Info */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          其他資訊
        </Text>

        <Controller
          control={control}
          name="requirements"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="應徵條件"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          )}
        />

        <Controller
          control={control}
          name="remarks"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="備註說明"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          )}
        />

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          disabled={isLoading}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          發布職缺
        </Button>
      </ScrollView>

      <Snackbar
        visible={showSuccess}
        onDismiss={() => setShowSuccess(false)}
        duration={1500}
        style={{ backgroundColor: theme.colors.primary }}
      >
        職缺發布成功！
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontWeight: 'bold',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  typeButton: {
    width: '100%',
  },
  typeButtonContent: {
    height: 80,
  },
  typeInner: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  typeLabel: {
    marginTop: spacing.xs,
  },
  input: {
    marginBottom: spacing.sm,
  },
  label: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  segmented: {
    marginBottom: spacing.md,
  },
  divider: {
    marginVertical: spacing.lg,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dateInput: {
    flex: 1,
  },
  salaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  benefitsRow: {
    gap: spacing.sm,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  errorText: {
    fontSize: 12,
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
  submitButtonContent: {
    paddingVertical: spacing.sm,
  },
});

export default CreateJobScreen;


