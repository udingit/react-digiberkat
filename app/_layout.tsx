// app/_layout.tsx
import { Stack, router } from 'expo-router';
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { Provider } from 'react-redux';
import { store, persistor } from '@/src/store/store';
import { PersistGate } from 'redux-persist/integration/react';
import React from 'react';

// Import komponen HeaderActions
import { HeaderActions } from '../components/HeaderActions';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GluestackUIProvider>
          <Stack>
            <Stack.Screen
              name="index"
              options={{
                title: 'Product Digiberkat',
                headerShown: true,
                headerRight: () => <HeaderActions />
              }}
            />

            <Stack.Screen
              name="login"
              options={{
                title: 'Login',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="register"
              options={{
                title: 'Daftar',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="product/[id]"
              options={{
                headerBackTitle: 'Back'
              }}
            />
            <Stack.Screen
              name="cart"
              options={{
                title: 'Keranjang Saya',
                headerRight: () => <HeaderActions />
              }}
            />
            <Stack.Screen
              name="order"
              options={{
                title: 'Riwayat Pesanan',
                headerRight: () => <HeaderActions />
              }}
            />
            {/* --- NEW STACK SCREEN FOR ORDER DETAIL --- */}
            <Stack.Screen
              name="order/[id]" // Path sesuai dengan nama file: app/order/[id].tsx
              options={{
                title: 'Detail Pesanan', // Judul untuk halaman detail order
                headerBackTitle: 'Kembali', // Teks tombol kembali
              }}
            />
            {/* --- END NEW STACK SCREEN --- */}
          </Stack>
        </GluestackUIProvider>
      </PersistGate>
    </Provider>
  );
}