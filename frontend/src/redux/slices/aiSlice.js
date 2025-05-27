import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const fetchRecommendations = createAsyncThunk(
  'ai/fetchRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/ai_features_test/recommendations');
      return response.data.recommendations;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchAnalytics = createAsyncThunk(
  'ai/fetchAnalytics',
  async (timeRange, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/ai_features_test/analytics?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const sendChatMessage = createAsyncThunk(
  'ai/sendChatMessage',
  async (message, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/ai_features_test/chatbot', { message });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  recommendations: [],
  analytics: null,
  chatHistory: [],
  loading: {
    recommendations: false,
    analytics: false,
    chat: false,
  },
  error: {
    recommendations: null,
    analytics: null,
    chat: null,
  },
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearChatHistory: (state) => {
      state.chatHistory = [];
    },
  },
  extraReducers: (builder) => {
    // Recommendations
    builder
      .addCase(fetchRecommendations.pending, (state) => {
        state.loading.recommendations = true;
        state.error.recommendations = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.loading.recommendations = false;
        state.recommendations = action.payload;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.loading.recommendations = false;
        state.error.recommendations = action.payload;
        state.recommendations = [];
      })

      // Analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading.analytics = true;
        state.error.analytics = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading.analytics = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading.analytics = false;
        state.error.analytics = action.payload;
        state.analytics = null;
      })

      // Chat
      .addCase(sendChatMessage.pending, (state) => {
        state.loading.chat = true;
        state.error.chat = null;
        const userMessage = state.chatHistory.length > 0 ? state.chatHistory[state.chatHistory.length - 1].type === 'user' ? state.chatHistory[state.chatHistory.length - 1] : { type: 'user', content: action.meta.arg } : { type: 'user', content: action.meta.arg };
        if (state.chatHistory.length === 0 || state.chatHistory[state.chatHistory.length - 1].content !== action.meta.arg) {
          state.chatHistory.push({ type: 'user', content: action.meta.arg });
        }
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.loading.chat = false;
        state.chatHistory.push({ type: 'bot', content: action.payload.response });
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.loading.chat = false;
        state.error.chat = action.payload;
        state.chatHistory.push({ type: 'bot', content: 'Error: Could not get a response.' });
      });
  },
});

export const { clearChatHistory } = aiSlice.actions;
export default aiSlice.reducer; 