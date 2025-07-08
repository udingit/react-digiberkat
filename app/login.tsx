import React, { useState, useEffect } from 'react';
import { Alert, AlertText, AlertIcon } from '@/components/ui/alert';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, Link } from 'expo-router';
import { InfoIcon, CheckIcon } from '@/components/ui/icon';
import { useLoginUserMutation } from '@/src/store/api/loginApi';
import { setCredentials, selectIsAuthenticated } from '@/src/store/api/authSlice';
import { RootState } from '@/src/store/store';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { HStack } from '@/components/ui/hstack';
import { Checkbox, CheckboxIndicator, CheckboxIcon, CheckboxLabel } from '@/components/ui/checkbox';
import { Eye, EyeOff } from 'lucide-react-native';


export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<'error' | 'success'>('error');
  const [showPassword, setShowPassword] = useState(false); // State baru untuk toggle password

  const [loginUser, { isLoading }] = useLoginUserMutation();
  const dispatch = useDispatch();
  const router = useRouter();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [isReady, setIsReady] = useState(false);

  // Tandai bahwa komponen sudah siap
  useEffect(() => {
    setIsReady(true);
  }, []);

  // Redirect jika sudah terautentikasi dan komponen siap
  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.push('/');
    }
  }, [isReady, isAuthenticated, router]);

  // Sembunyikan alert setelah 3 detik
  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => setShowAlert(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  // Muat kredensial yang tersimpan jika 'Ingat saya' aktif
  useEffect(() => {
    // Pastikan localStorage hanya diakses di lingkungan browser
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rememberedCredentials');
      if (saved) {
        const { email: savedEmail, password: savedPassword } = JSON.parse(saved);
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    }
  }, []);

  // Fungsi validasi format email
  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  // Handler untuk proses login
  const handleLogin = async () => {
    setShowAlert(false);
    setErrorMessage('');

    // Validasi input email
    if (!validateEmail(email)) {
      setAlertType('error');
      setErrorMessage('Format email tidak valid');
      setShowAlert(true);
      return;
    }

    // Validasi panjang password
    if (password.length < 6) {
      setAlertType('error');
      setErrorMessage('Password harus minimal 6 karakter');
      setShowAlert(true);
      return;
    }

    // Simpan atau hapus kredensial berdasarkan 'Ingat saya'
    if (typeof window !== 'undefined') { // Pastikan localStorage hanya diakses di lingkungan browser
      if (rememberMe) {
        localStorage.setItem('rememberedCredentials', JSON.stringify({ email, password }));
      } else {
        localStorage.removeItem('rememberedCredentials');
      }
    }

    try {
      // Panggil mutation loginUser dengan payload yang sesuai API
      // Mengirim email sebagai username
      const response = await loginUser({ username: email, password, role: 'user' }).unwrap();

      dispatch(setCredentials(response));
      setAlertType('success');
      setErrorMessage('Login berhasil! Mengarahkan...');
      setShowAlert(true);

      // Arahkan ke halaman utama setelah 1.5 detik
      setTimeout(() => router.push('/'), 1500);
    } catch (err: any) {
      setAlertType('error');
      // Tangani pesan error spesifik dari API
      if (err.data?.error === '❌ Email tidak ditemukan') {
        setErrorMessage('Email tidak ditemukan');
      } else if (err.data?.error === '❌ Password salah') {
        setErrorMessage('Password salah');
      } else {
        setErrorMessage(err.data?.error || 'Terjadi kesalahan saat login');
      }
      setShowAlert(true);
    }
  };

  return (
    <Box style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, backgroundColor: '#f3f4f6' }}>
      <Card style={{ padding: 32, width: '100%', maxWidth: 420, backgroundColor: 'white', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
        <VStack space="lg">
          <VStack space="sm" style={{ alignItems: 'center' }}>
            <Heading size="xl" style={{ textAlign: 'center', color: '#1f2937', fontWeight: '700' }}>Selamat Datang</Heading>
            <Text style={{ color: '#6b7280', textAlign: 'center' }}>Masuk untuk melanjutkan ke akun Anda</Text>
          </VStack>

          {/* Tampilkan alert jika ada pesan error/sukses */}
          {showAlert && (
            <Alert action={alertType}>
              <AlertIcon as={InfoIcon} />
              <AlertText>{errorMessage}</AlertText>
            </Alert>
          )}

          <VStack space="md">
            {/* Input Email */}
            <VStack space="xs">
              <Text style={{ fontWeight: '500', color: '#374151' }}>Email</Text>
              <Input variant="rounded" size="md" style={{ borderColor: '#e5e7eb' }}>
                <InputField
                  value={email}
                  onChangeText={setEmail}
                  placeholder="contoh@email.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </Input>
            </VStack>

            {/* Input Password dengan toggle lihat/sembunyikan */}
            <VStack space="xs">
              <Text style={{ fontWeight: '500', color: '#374151' }}>Password</Text>
              <Input variant="rounded" size="md" style={{ borderColor: '#e5e7eb' }}>
                <InputField
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Minimal 6 karakter"
                  secureTextEntry={!showPassword} // Toggle secureTextEntry
                />
                {/* Tombol toggle lihat/sembunyikan password */}
                <InputSlot style={{ paddingRight: 12 }} onPress={() => setShowPassword(!showPassword)}>
                  <InputIcon
                    as={showPassword ? Eye : EyeOff} // Ganti ikon berdasarkan state
                    color="#524b4e" // Sesuaikan warna ikon jika perlu
                  />
                </InputSlot>
              </Input>
            </VStack>

            {/* Checkbox Ingat Saya dan Link Lupa Password */}
            <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Checkbox value="remember" isChecked={rememberMe} onChange={setRememberMe}>
                <CheckboxIndicator><CheckboxIcon as={CheckIcon} /></CheckboxIndicator>
                <CheckboxLabel style={{ marginLeft: 8, color: '#4b5563' }}>Ingat saya</CheckboxLabel>
              </Checkbox>
            </HStack>
          </VStack>

          {/* Tombol Masuk */}
          <VStack space="sm">
            <Button
              onPress={handleLogin}
              isDisabled={isLoading}
              style={{ backgroundColor: '#3b82f6', borderRadius: 12, height: 48, shadowColor: '#3b82f6', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}
            >
              {isLoading ? (
                <HStack space="sm" style={{ alignItems: 'center' }}>
                  <Spinner size="small" color="white" />
                  <ButtonText style={{ fontWeight: '600', color: 'white' }}>Memproses...</ButtonText>
                </HStack>
              ) : (
                <ButtonText style={{ fontWeight: '600', color: 'white' }}>Masuk</ButtonText>
              )}
            </Button>

            {/* Link ke halaman registrasi */}
            <HStack style={{ justifyContent: 'center', marginTop: 16 }}>
              <Text style={{ color: '#6b7280' }}>Belum punya akun? </Text>
              <Link href="/register" style={{ color: '#3b82f6', fontWeight: '500' }}>Daftar sekarang</Link>
            </HStack>
          </VStack>
        </VStack>
      </Card>
    </Box>
  );
}
