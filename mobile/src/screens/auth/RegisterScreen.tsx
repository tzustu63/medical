import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Surface,
  useTheme,
  SegmentedButtons,
  Snackbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { register, clearError } from '@/store/slices/authSlice';
import { AuthStackParamList } from '@/navigation/types';
import { spacing } from '@/theme';
import type { UserType, ProfessionalType } from '@/types';

type RegisterNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;
type RegisterRouteProp = RouteProp<AuthStackParamList, 'Register'>;

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone: string;
  idNumber?: string;
  professionalType?: ProfessionalType;
  licenseNumber?: string;
  hospitalCode?: string;
}

const getSchema = (userType: UserType) => {
  const baseSchema = {
    email: yup.string().email('請輸入有效的電子郵件').required('電子郵件為必填'),
    password: yup.string().min(8, '密碼至少需要8個字元').required('密碼為必填'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], '密碼不一致')
      .required('請確認密碼'),
    name: yup.string().min(2, '姓名至少2個字').required('姓名為必填'),
    phone: yup.string().matches(/^\d{10}$/, '請輸入10碼手機號碼').required('手機號碼為必填'),
  };

  if (userType === 'healthcare_professional') {
    return yup.object().shape({
      ...baseSchema,
      idNumber: yup
        .string()
        .matches(/^[A-Z][12]\d{8}$/, '請輸入有效的身分證字號')
        .required('身分證字號為必填'),
      professionalType: yup.string().required('請選擇職業類別'),
      licenseNumber: yup.string().required('執照字號為必填'),
    });
  }

  return yup.object().shape({
    ...baseSchema,
    hospitalCode: yup.string().required('醫院代碼為必填'),
  });
};

const professionalTypes = [
  { value: 'doctor', label: '醫師' },
  { value: 'nurse', label: '護理師' },
  { value: 'pharmacist', label: '藥師' },
  { value: 'medical_technologist', label: '醫檢師' },
];

const RegisterScreen = () => {
  const navigation = useNavigation<RegisterNavigationProp>();
  const route = useRoute<RegisterRouteProp>();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [userType, setUserType] = useState<UserType>(
    route.params?.userType || 'healthcare_professional'
  );
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(getSchema(userType)),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      phone: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    dispatch(clearError());
    const result = await dispatch(
      register({
        email: data.email,
        password: data.password,
        userType,
        name: data.name,
        phone: data.phone,
        idNumber: data.idNumber,
        professionalType: data.professionalType,
        licenseNumber: data.licenseNumber,
        hospitalCode: data.hospitalCode,
      })
    );

    if (register.fulfilled.match(result)) {
      setShowSuccess(true);
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.formContainer} elevation={2}>
          <Text variant="headlineSmall" style={styles.formTitle}>
            註冊帳號
          </Text>

          {error && (
            <View style={[styles.errorBox, { backgroundColor: theme.colors.errorContainer }]}>
              <Text style={{ color: theme.colors.onErrorContainer }}>{error}</Text>
            </View>
          )}

          <Text variant="labelLarge" style={styles.label}>
            我是
          </Text>
          <SegmentedButtons
            value={userType}
            onValueChange={(value) => {
              setUserType(value as UserType);
              reset();
            }}
            buttons={[
              { value: 'healthcare_professional', label: '醫事人員' },
              { value: 'hospital_admin', label: '醫院管理員' },
            ]}
            style={styles.segmented}
          />

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="姓名"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                error={!!errors.name}
                style={styles.input}
              />
            )}
          />
          {errors.name && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.name.message}
            </Text>
          )}

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="電子郵件"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!errors.email}
                style={styles.input}
              />
            )}
          />
          {errors.email && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.email.message}
            </Text>
          )}

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="手機號碼"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                keyboardType="phone-pad"
                error={!!errors.phone}
                style={styles.input}
              />
            )}
          />
          {errors.phone && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.phone.message}
            </Text>
          )}

          {userType === 'healthcare_professional' && (
            <>
              <Controller
                control={control}
                name="idNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="身分證字號"
                    value={value}
                    onChangeText={(text) => onChange(text.toUpperCase())}
                    onBlur={onBlur}
                    mode="outlined"
                    autoCapitalize="characters"
                    error={!!errors.idNumber}
                    style={styles.input}
                  />
                )}
              />
              {errors.idNumber && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.idNumber.message}
                </Text>
              )}

              <Text variant="labelLarge" style={styles.label}>
                職業類別
              </Text>
              <Controller
                control={control}
                name="professionalType"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.typeButtons}>
                    {professionalTypes.map((type) => (
                      <Button
                        key={type.value}
                        mode={value === type.value ? 'contained' : 'outlined'}
                        onPress={() => onChange(type.value)}
                        compact
                        style={styles.typeButton}
                      >
                        {type.label}
                      </Button>
                    ))}
                  </View>
                )}
              />
              {errors.professionalType && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.professionalType.message}
                </Text>
              )}

              <Controller
                control={control}
                name="licenseNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="執照字號"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    error={!!errors.licenseNumber}
                    style={styles.input}
                  />
                )}
              />
              {errors.licenseNumber && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.licenseNumber.message}
                </Text>
              )}
            </>
          )}

          {userType === 'hospital_admin' && (
            <>
              <Controller
                control={control}
                name="hospitalCode"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="醫院代碼"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    error={!!errors.hospitalCode}
                    style={styles.input}
                  />
                )}
              />
              {errors.hospitalCode && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.hospitalCode.message}
                </Text>
              )}
            </>
          )}

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="密碼"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                secureTextEntry
                error={!!errors.password}
                style={styles.input}
              />
            )}
          />
          {errors.password && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.password.message}
            </Text>
          )}

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="確認密碼"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                secureTextEntry
                error={!!errors.confirmPassword}
                style={styles.input}
              />
            )}
          />
          {errors.confirmPassword && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.confirmPassword.message}
            </Text>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            註冊
          </Button>

          <View style={styles.footer}>
            <Text>已有帳號？</Text>
            <Button mode="text" onPress={() => navigation.navigate('Login')} compact>
              立即登入
            </Button>
          </View>
        </Surface>
      </ScrollView>

      <Snackbar
        visible={showSuccess}
        onDismiss={() => setShowSuccess(false)}
        duration={2000}
        style={{ backgroundColor: theme.colors.primary }}
      >
        註冊成功！正在跳轉到登入頁面...
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
  },
  formContainer: {
    padding: spacing.lg,
    borderRadius: 16,
  },
  formTitle: {
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  errorBox: {
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  label: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  segmented: {
    marginBottom: spacing.md,
  },
  input: {
    marginBottom: spacing.xs,
  },
  errorText: {
    fontSize: 12,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  typeButton: {
    marginBottom: spacing.xs,
  },
  button: {
    marginTop: spacing.lg,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
});

export default RegisterScreen;

