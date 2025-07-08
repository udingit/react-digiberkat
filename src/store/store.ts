import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { registerApi } from '@/src/store/api/registerApi';
import { loginApi } from '@/src/store/api/loginApi';
import { productsApi } from '@/src/store/api/productsApi';
import { cartApi } from '@/src/store/api/cartApi';
import { orderApi } from '@/src/store/api/orderApi';

import authReducer from '@/src/store/api/authSlice';
import recommendationReducer from '@/src/store/api/recommendationSlice';

// ✅ Konfigurasi persist untuk slice 'auth'
const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['token', 'role', 'username', 'userId', 'expiresAt'],
};

// ✅ Konfigurasi persist untuk slice 'recommendation'
const recommendationPersistConfig = {
  key: 'recommendation',
  storage: AsyncStorage,
  whitelist: ['recommendedProducts', 'lastUpdated', 'hasRecommendations'],
};

// ✅ Buat reducer hasil persist
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedRecommendationReducer = persistReducer(
  recommendationPersistConfig,
  recommendationReducer
);

// ✅ Konfigurasi store
export const store = configureStore({
  reducer: {
    [loginApi.reducerPath]: loginApi.reducer,
    [registerApi.reducerPath]: registerApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    auth: persistedAuthReducer,
    recommendation: persistedRecommendationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // ✅ Hindari warning serializable redux-persist
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .concat(loginApi.middleware)
      .concat(registerApi.middleware)
      .concat(productsApi.middleware)
      .concat(cartApi.middleware)
      .concat(orderApi.middleware),
});

setupListeners(store.dispatch);

// ✅ Export persistor
export const persistor = persistStore(store);

// ✅ Export tipe
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

