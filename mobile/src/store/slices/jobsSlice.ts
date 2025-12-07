import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { jobsService, SearchJobsParams } from '@/services/api/jobs';
import type { Job, Pagination } from '@/types';

interface JobsState {
  jobs: Job[];
  currentJob: Job | null;
  pagination: Pagination | null;
  searchParams: SearchJobsParams;
  isLoading: boolean;
  error: string | null;
}

const initialState: JobsState = {
  jobs: [],
  currentJob: null,
  pagination: null,
  searchParams: {},
  isLoading: false,
  error: null,
};

// 非同步 thunks
export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (params: SearchJobsParams | undefined, { rejectWithValue }) => {
    try {
      const response = await jobsService.searchJobs(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || '取得職缺列表失敗');
    }
  }
);

export const fetchJob = createAsyncThunk(
  'jobs/fetchJob',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const job = await jobsService.getJob(jobId);
      return job;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || '取得職缺詳情失敗');
    }
  }
);

// Slice
const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setSearchParams: (state, action: PayloadAction<SearchJobsParams>) => {
      state.searchParams = action.payload;
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Jobs
    builder.addCase(fetchJobs.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchJobs.fulfilled, (state, action) => {
      state.isLoading = false;
      state.jobs = action.payload.data;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchJobs.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Job
    builder.addCase(fetchJob.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchJob.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentJob = action.payload;
    });
    builder.addCase(fetchJob.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setSearchParams, clearCurrentJob, clearError } = jobsSlice.actions;
export default jobsSlice.reducer;

