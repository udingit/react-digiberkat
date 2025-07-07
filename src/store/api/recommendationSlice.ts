import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RecommendedProduct } from '@/types/recommendation';
import { productsApi } from '@/src/store/api/productsApi';

interface RecommendationState {
  recommendedProducts: RecommendedProduct[];
  lastUpdated: number | null;
  hasRecommendations: boolean;
}

const initialState: RecommendationState = {
  recommendedProducts: [], // ✅ Array kosong untuk aman saat .map()
  lastUpdated: null,
  hasRecommendations: false,
};

const recommendationSlice = createSlice({
  name: 'recommendation',
  initialState,
  reducers: {
    setRecommendations: (state, action: PayloadAction<RecommendedProduct[]>) => {
      const data = action.payload ?? []; // fallback
      state.recommendedProducts = data;
      state.lastUpdated = Date.now();
      state.hasRecommendations = data.length > 0;
    },
    clearRecommendations: (state) => {
      state.recommendedProducts = [];
      state.lastUpdated = null;
      state.hasRecommendations = false;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      productsApi.endpoints.getRecommendedProducts.matchFulfilled,
      (state, action: PayloadAction<RecommendedProduct[]>) => {
        const data = action.payload ?? []; // fallback defensif
        state.recommendedProducts = data;
        state.lastUpdated = Date.now();
        state.hasRecommendations = data.length > 0;
      }
    );
  },
});

export const { setRecommendations, clearRecommendations } = recommendationSlice.actions;

export default recommendationSlice.reducer;
