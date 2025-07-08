
// app/_layout.tsx
import { Stack, router } from 'expo-router';
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { Provider } from 'react-redux'; // ✅ Hapus useSelector dan useDispatch dari sini
import { store, persistor } from '@/src/store/store';
import { PersistGate } from 'redux-persist/integration/react';
import React from 'react'; // ✅ Hapus useState dari sini, tidak perlu di RootLayout

// ✅ Import komponen HeaderActions
import { HeaderActions } from '../components/HeaderActions';

// Hapus semua import icon dan component Gluestack UI yang terkait dengan header/actionsheet/alertdialog
// karena sudah dipindahkan ke HeaderActions.tsx
// import { View, TouchableOpacity } from 'react-native';
// import { ShoppingCart, ShoppingBasket, LogIn, LogOut, Menu, Home } from 'lucide-react-native';
// import { HStack } from '@/components/ui/hstack';
// import {
//   Actionsheet, ActionsheetContent, ActionsheetItem, ActionsheetItemText,
//   ActionsheetDragIndicator, ActionsheetDragIndicatorWrapper, ActionsheetBackdrop, ActionsheetIcon
// } from "@/components/ui/actionsheet";
// import { Icon } from "@/components/ui/icon";
// import {
//   AlertDialog, AlertDialogBackdrop, AlertDialogContent, AlertDialogHeader,
//   AlertDialogCloseButton, AlertDialogFooter, AlertDialogBody,
// } from "@/components/ui/alert-dialog";
// import { Button, ButtonText } from "@/components/ui/button";
// import { Heading } from "@/components/ui/heading";
// import { Text } from "@/components/ui/text";
// import { logout, selectIsAuthenticated } from '@/src/store/api/authSlice';


export default function RootLayout() {
  // ✅ Hapus semua state dan fungsi yang terkait dengan Actionsheet/AlertDialog dari sini
  // const [showActionsheet, setShowActionsheet] = useState(false);
  // const handleCloseActionsheet = () => setShowActionsheet(false);
  // const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  // const handleCloseLogoutConfirm = () => setShowLogoutConfirm(false);
  // const isAuthenticated = useSelector(selectIsAuthenticated);
  // const dispatch = useDispatch();
  // const handleLogin = () => { router.push('/login'); handleCloseActionsheet(); };
  // const handleLogoutPress = () => { setShowLogoutConfirm(true); handleCloseActionsheet(); };
  // const confirmLogout = () => { dispatch(logout()); console.log("User logged out"); router.push('/'); handleCloseLogoutConfirm(); };


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

            {/* Screens lainnya tetap sama */}
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
          </Stack>

          {/* ✅ Hapus Actionsheet dan AlertDialog dari sini, sudah di HeaderActions */}

        </GluestackUIProvider>
      </PersistGate>
    </Provider>
  );
}