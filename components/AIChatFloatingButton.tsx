// @/components/AIChatFloatingButton.tsx
import React, { useState, useCallback } from 'react';
import { StyleSheet, ActivityIndicator, TextInput, Platform } from 'react-native';
import {
  Button,
  ButtonIcon,
  ButtonText,
} from '@/components/ui/button';
import {
  Toast,
  useToast,
  ToastTitle,
  ToastDescription,
} from '@/components/ui/toast';
import {
  Icon,
  MessageCircleIcon,
  CloseIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from '@/components/ui/icon';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Box } from '@/components/ui/box';
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from '@/components/ui/form-control';

import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@/components/ui/modal';
import { Heading } from '@/components/ui/heading';

import { useGetProductsQuery, useGetRecommendedProductsMutation } from '@/src/store/api/productsApi';
import type { Product } from '@/types/product'; 
// Tidak perlu import RecommendedProduct di sini karena tidak langsung diproses

interface AIChatFloatingButtonProps {
  // Props jika diperlukan
}

export function AIChatFloatingButton(props: AIChatFloatingButtonProps) {
  const toast = useToast();
  const [userQuery, setUserQuery] = useState('');
  const [isQueryInvalid, setIsQueryInvalid] = useState(false);
  const [isChatModalVisible, setIsChatModalVisible] = useState(false);

  const { 
    data: productsData, 
    isLoading: productsLoading, 
    isError: productsError,
    error: productsFetchError 
  } = useGetProductsQuery();

  const [
    getRecommendedProducts,
    { isLoading: isAiLoading, error: aiError } 
  ] = useGetRecommendedProductsMutation();

  const showSuccessToast = useCallback((message: string) => {
    toast.show({
      placement: 'top',
      duration: 3000, 
      render: ({ id }) => (
        <Toast
          nativeID={'toast-success-' + id}
          action="success"
          variant="solid"
          className="p-4 gap-6 bg-success-500 w-full shadow-lg max-w-[443px] flex-row justify-between rounded-md"
        >
          <HStack space="md" className="items-center">
            <Icon as={CheckCircleIcon} className="stroke-white" size="lg" />
            <VStack space="xs">
              <ToastTitle className="font-semibold text-white">Rekomendasi AI!</ToastTitle>
              <ToastDescription size="sm" className="text-white">{message}</ToastDescription>
            </VStack>
          </HStack>
          <Pressable onPress={() => toast.close(id)}>
            <Icon as={CloseIcon} size="md" className="stroke-white" />
          </Pressable>
        </Toast>
      ),
    });
  }, [toast]);

  const showErrorToast = useCallback((message: string) => {
    toast.show({
      placement: 'top',
      duration: 5000,
      render: ({ id }) => (
        <Toast
          nativeID={'toast-error-' + id}
          action="error"
          variant="solid"
          className="p-4 gap-6 bg-error-500 w-full shadow-lg max-w-[443px] flex-row justify-between rounded-md"
        >
          <HStack space="md" className="items-center">
            <Icon as={AlertCircleIcon} className="stroke-white" size="lg" />
            <VStack space="xs">
              <ToastTitle className="font-semibold text-white">Error!</ToastTitle>
              <ToastDescription size="sm" className="text-white">{message}</ToastDescription>
            </VStack>
          </HStack>
          <Pressable onPress={() => toast.close(id)}>
            <Icon as={CloseIcon} size="md" className="stroke-white" />
          </Pressable>
        </Toast>
      ),
    });
  }, [toast]);

  const handleSendQuery = async () => {
    if (!userQuery.trim()) {
      setIsQueryInvalid(true);
      showErrorToast('Silakan masukkan pertanyaan Anda.');
      return;
    }
    setIsQueryInvalid(false);
    setIsChatModalVisible(false);

    if (productsLoading) {
      showErrorToast('Produk masih dimuat. Mohon tunggu sebentar.');
      return;
    }
    if (productsError) {
      const errorMessage = productsFetchError 
        ? (('data' in productsFetchError && typeof productsFetchError.data === 'string' ? productsFetchError.data : JSON.stringify(productsFetchError)))
        : 'Gagal memuat daftar produk. Tidak dapat memberikan rekomendasi.';
      showErrorToast(`Error memuat produk: ${errorMessage}`);
      return;
    }
    
    if (!productsData || !Array.isArray(productsData) || productsData.length === 0) {
      showErrorToast('Tidak ada data produk yang tersedia untuk rekomendasi.');
      return;
    }

    // Format productsData for AI API, ensuring nulls for undefined properties
    const formattedProducts = productsData.map(product => {
      const newProduct = { ...product };

      if (!newProduct.is_varians) {
        if (newProduct.price === undefined) {
          newProduct.price = null; 
        }
        if (newProduct.is_discounted && newProduct.discount_price === undefined) {
          newProduct.discount_price = null; 
        }
      }

      if (newProduct.is_varians && newProduct.variants) {
        if (!Array.isArray(newProduct.variants)) {
          console.warn('Product has variants flag but variants property is not an array:', newProduct);
          newProduct.variants = []; 
        } else {
          newProduct.variants = newProduct.variants.map(variant => {
            const newVariant = { ...variant };
            if (newVariant.price === undefined) {
              newVariant.price = null; 
            }
            if (newVariant.is_discounted && newVariant.discount_price === undefined) {
              newVariant.discount_price = null; 
            }
            if (newVariant.stock === undefined) {
              newVariant.stock = null;
            }
            return newVariant;
          });
        }
      }
      if (newProduct.stock === undefined) {
        newProduct.stock = null;
      }

      return newProduct;
    });

    try {
      console.log('Mengirim query pengguna:', userQuery);
      console.log('Jumlah produk yang dikirim:', formattedProducts.length);
      // Anda bisa uncomment ini jika ingin melihat payload yang dikirim
      // console.log('Payload produk yang dikirim ke AI:', JSON.stringify(formattedProducts, null, 2));

      // Panggil mutasi. Hasilnya akan diurus oleh extraReducers di recommendationSlice.
      const result = await getRecommendedProducts({ userQuery, products: formattedProducts }).unwrap();
      
      // result di sini adalah RecommendedProduct[] karena transformResponse di productsApi.ts
      console.log('Rekomendasi AI berhasil diambil dan disimpan ke store. Jumlah:', result.length);

      // Hanya tampilkan toast sederhana
      showSuccessToast('Rekomendasi berhasil diambil!');
      
    } catch (err: any) {
      console.error('Gagal mendapatkan rekomendasi AI (raw error):', err);
      
      let aiSpecificErrorMessage = 'Terjadi kesalahan tidak dikenal saat memproses rekomendasi.';

      if (aiError) {
        console.error('RTK Query aiError object (full):', aiError);
        console.error('RTK Query aiError.data:', (aiError as any)?.data);
        console.error('RTK Query aiError.status:', (aiError as any)?.status);
        console.error('RTK Query aiError.originalStatus:', (aiError as any)?.originalStatus);

        if ('data' in aiError && aiError.data) {
          if (typeof aiError.data === 'string') {
            aiSpecificErrorMessage = aiError.data;
          } else if (typeof aiError.data === 'object' && aiError.data !== null) {
            try {
              aiSpecificErrorMessage = JSON.stringify(aiError.data); 
            } catch (jsonErr: any) {
              console.error('Error stringifying aiError.data for toast:', jsonErr);
              aiSpecificErrorMessage = `Error stringifying AI response data: ${jsonErr.message || 'unknown'}. Cek konsol untuk detail error AI.`;
            }
          }
        } else if ('error' in aiError && typeof (aiError as any).error === 'string') {
             aiSpecificErrorMessage = (aiError as any).error; 
        } else {
             try {
                aiSpecificErrorMessage = JSON.stringify(aiError);
             } catch (jsonErr: any) {
                 console.error('Error stringifying entire aiError object for toast:', jsonErr);
                 aiSpecificErrorMessage = `Error processing AI response: ${jsonErr.message || 'unknown'}. Cek konsol untuk detail error AI.`;
             }
        }
      } else if (err?.message) {
        aiSpecificErrorMessage = err.message;
      }
      
      showErrorToast(`Error AI: ${aiSpecificErrorMessage}`);
    } finally {
      setUserQuery('');
    }
  };

  const handleOpenChatModal = useCallback(() => {
    setUserQuery('');
    setIsQueryInvalid(false);
    setIsChatModalVisible(true);
  }, []);

  const handleCloseChatModal = useCallback(() => {
    setIsChatModalVisible(false);
  }, []);

  return (
    <Box style={styles.floatingButtonContainer}>
      <Button
        size="lg"
        className="rounded-full p-4 shadow-lg bg-blue-600"
        onPress={handleOpenChatModal}
      >
        <ButtonIcon as={MessageCircleIcon} size="xl" className="stroke-white" />
      </Button>

      <Modal
        isOpen={isChatModalVisible}
        onClose={handleCloseChatModal}
        avoidKeyboard={Platform.OS === 'ios'}
      >
        <ModalBackdrop />
        <ModalContent className="bg-white rounded-lg p-6 w-full max-w-sm">
          <ModalHeader className="mb-4 flex-row justify-between items-center">
            <Heading size="lg">Asisten AI Rekomendasi</Heading>
            <ModalCloseButton onPress={handleCloseChatModal}>
              <Icon as={CloseIcon} size="md" />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody className="mb-6">
            <FormControl isInvalid={isQueryInvalid} size="md">
              <FormControlLabel>
                <FormControlLabelText className="text-gray-700 mb-2">
                  Apa yang Anda cari?
                </FormControlLabelText>
              </FormControlLabel>
              <TextInput
                className="border border-gray-300 rounded-md p-3 text-lg bg-white"
                placeholder="Contoh: Saya mencari headset gaming murah dengan kualitas suara jernih."
                value={userQuery}
                onChangeText={(text) => {
                  setUserQuery(text);
                  setIsQueryInvalid(false);
                }}
                multiline
                numberOfLines={4}
                style={styles.textInput}
                autoFocus={true}
                editable={!isAiLoading}
              />
              {isQueryInvalid && (
                <FormControlError className="mt-2">
                  <FormControlErrorIcon as={AlertCircleIcon} />
                  <FormControlErrorText>
                    Pertanyaan tidak boleh kosong.
                  </FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>
          </ModalBody>
          <ModalFooter className="flex-row justify-end">
            <Button
              variant="outline"
              action="secondary"
              onPress={handleCloseChatModal}
              disabled={isAiLoading}
              className="mr-2"
            >
              <ButtonText>Batal</ButtonText>
            </Button>
            <Button
              onPress={handleSendQuery}
              disabled={isAiLoading || !userQuery.trim()}
            >
              {isAiLoading ? (
                <HStack space="sm" className="items-center">
                  <ActivityIndicator color="#fff" />
                  <ButtonText>Mengirim...</ButtonText>
                </HStack>
              ) : (
                <ButtonText>Dapatkan Rekomendasi</ButtonText>
              )}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

const styles = StyleSheet.create({
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 100,
  },
  textInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});