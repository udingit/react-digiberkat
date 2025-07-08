import React, { useState, useEffect } from 'react';
import { Alert, AlertText, AlertIcon } from '@/components/ui/alert';
import { useRouter } from 'expo-router';
import { InfoIcon } from '@/components/ui/icon';
import { useRegisterUserMutation } from '@/src/store/api/registerApi';
import { selectIsAuthenticated } from '@/src/store/api/authSlice';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input'; // Import InputSlot dan InputIcon
import { Spinner } from '@/components/ui/spinner';
import { HStack } from '@/components/ui/hstack';
import { Link } from 'expo-router';
import { useSelector } from 'react-redux';
import { Eye, EyeOff } from 'lucide-react-native'; // Import ikon mata dari lucide-react-native

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<'error' | 'success'>('error');
  const [showPassword, setShowPassword] = useState(false); // State untuk toggle password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State untuk toggle konfirmasi password

  const [registerUser, { isLoading }] = useRegisterUserMutation();
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

  // Fungsi validasi format email
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Handler untuk proses registrasi
  const handleRegister = async () => {
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

    // Validasi kesesuaian password dan konfirmasi password
    if (password !== confirmPassword) {
      setAlertType('error');
      setErrorMessage('Password dan konfirmasi password tidak sama');
      setShowAlert(true);
      return;
    }

    try {
      // Panggil mutation registerUser dengan payload yang sesuai API
      // Mengirim nilai email sebagai 'username' ke API
      const response = await registerUser({
        username: email, // Menggunakan email sebagai username
        password,
      }).unwrap();

      setAlertType('success');
      setErrorMessage('Registrasi berhasil! Mengarahkan ke login...');
      setShowAlert(true);

      // Arahkan ke halaman login setelah 2 detik
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      console.log('Error detail:', err); // Log detail error untuk debugging

      setAlertType('error');
      // Tampilkan pesan error dari API jika ada, atau pesan default
      setErrorMessage(err.error || 'Terjadi kesalahan saat registrasi');
      setShowAlert(true);
    }
  };

  return (
    <Box style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, backgroundColor: '#f3f4f6' }}>
      <Card style={{ padding: 32, width: '100%', maxWidth: 420, backgroundColor: 'white', borderRadius: 16, elevation: 4 }}>
        <VStack space="lg">
          <VStack space="sm" style={{ alignItems: 'center' }}>
            <Heading size="xl" style={{ textAlign: 'center', color: '#1f2937', fontWeight: '700' }}>
              Buat Akun Baru
            </Heading>
            <Text style={{ color: '#6b7280', textAlign: 'center' }}>
              Isi form berikut untuk mendaftar
            </Text>
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

            {/* Input Password */}
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
                    color="$darkBlue500"
                  />
                </InputSlot>
              </Input>
            </VStack>

            {/* Input Konfirmasi Password */}
            <VStack space="xs">
              <Text style={{ fontWeight: '500', color: '#374151' }}>Konfirmasi Password</Text>
              <Input variant="rounded" size="md" style={{ borderColor: '#e5e7eb' }}>
                <InputField
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Ketik ulang password"
                  secureTextEntry={!showConfirmPassword} // Toggle secureTextEntry
                />
                {/* Tombol toggle lihat/sembunyikan konfirmasi password */}
                <InputSlot style={{ paddingRight: 12 }} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <InputIcon
                    as={showConfirmPassword ? Eye : EyeOff} // Ganti ikon berdasarkan state
                    color="$darkBlue500"
                  />
                </InputSlot>
              </Input>
            </VStack>
          </VStack>

          {/* Tombol Daftar */}
          <VStack space="sm">
            <Button
              onPress={handleRegister}
              isDisabled={isLoading}
              style={{
                backgroundColor: '#3b82f6',
                borderRadius: 12,
                height: 48,
              }}
            >
              {isLoading ? (
                <Spinner size="small" color="white" />
              ) : (
                <ButtonText style={{ fontWeight: '600', color: 'white' }}>Daftar</ButtonText>
              )}
            </Button>

            {/* Link ke halaman login */}
            <HStack style={{ justifyContent: 'center', marginTop: 16 }}>
              <Text style={{ color: '#6b7280' }}>Sudah punya akun? </Text>
              <Link href="/login" style={{ color: '#3b82f6', fontWeight: '500' }}>
                Masuk disini
              </Link>
            </HStack>
          </VStack>
        </VStack>
      </Card>
    </Box>
  );
}
