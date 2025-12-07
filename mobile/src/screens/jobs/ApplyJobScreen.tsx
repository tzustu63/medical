import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme, Surface } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { applicationsService } from '@/services/api/applications';
import { JobsStackParamList } from '@/navigation/types';
import { spacing } from '@/theme';

type ApplyJobRouteProp = RouteProp<JobsStackParamList, 'ApplyJob'>;

interface ApplyFormData {
  coverLetter: string;
  availableStartDate: string;
}

const ApplyJobScreen = () => {
  const route = useRoute<ApplyJobRouteProp>();
  const navigation = useNavigation();
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<ApplyFormData>({
    defaultValues: {
      coverLetter: '',
      availableStartDate: '',
    },
  });

  const onSubmit = async (data: ApplyFormData) => {
    setIsSubmitting(true);
    try {
      await applicationsService.createApplication({
        jobId: route.params.jobId,
        coverLetter: data.coverLetter || undefined,
        availableStartDate: data.availableStartDate || undefined,
      });

      Alert.alert('申請成功', '您的申請已送出，請等待醫院審核。', [
        {
          text: '確定',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        '申請失敗',
        error.response?.data?.error?.message || '申請時發生錯誤，請稍後再試。'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Surface style={styles.formContainer} elevation={1}>
        <Text variant="titleMedium" style={styles.title}>
          填寫申請資料
        </Text>

        <Controller
          control={control}
          name="coverLetter"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="申請說明（選填）"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              mode="outlined"
              multiline
              numberOfLines={6}
              placeholder="請簡述您的經歷、專長及申請此職缺的原因..."
              style={styles.input}
            />
          )}
        />

        <Controller
          control={control}
          name="availableStartDate"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="可開始服務日期（選填）"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              mode="outlined"
              placeholder="YYYY-MM-DD"
              style={styles.input}
            />
          )}
        />

        <Text variant="bodySmall" style={styles.hint}>
          * 醫院將根據您的個人檔案和申請說明進行審核
        </Text>

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          送出申請
        </Button>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  formContainer: {
    padding: spacing.lg,
    borderRadius: 12,
  },
  title: {
    marginBottom: spacing.lg,
  },
  input: {
    marginBottom: spacing.md,
  },
  hint: {
    opacity: 0.7,
    marginBottom: spacing.lg,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  submitButtonContent: {
    paddingVertical: spacing.sm,
  },
});

export default ApplyJobScreen;

