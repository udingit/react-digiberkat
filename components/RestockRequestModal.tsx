
// // src/components/RestockRequestModal.tsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { ActivityIndicator, TextInput, Platform, StyleSheet } from 'react-native'; // Import StyleSheet
// import {
//   Button,
//   ButtonText,
// } from "@/components/ui/button";
// import {
//   Toast,
//   useToast,
//   ToastTitle,
//   ToastDescription,
// } from "@/components/ui/toast";
// import {
//   Icon,
//   CloseIcon,
//   CheckCircleIcon,
//   AlertCircleIcon,
// } from '@/components/ui/icon';
// import { VStack } from "@/components/ui/vstack";
// import { HStack } from "@/components/ui/hstack";
// import { Pressable } from "@/components/ui/pressable";
// import {
//   FormControl,
//   FormControlLabel,
//   FormControlLabelText,
//   FormControlError,
//   FormControlErrorIcon,
//   FormControlErrorText,
// } from '@/components/ui/form-control';
// import {
//   Modal,
//   ModalBackdrop,
//   ModalContent,
//   ModalHeader,
//   ModalCloseButton, // Menggunakan ModalCloseButton
//   ModalBody,
//   ModalFooter,
// } from '@/components/ui/modal';
// import { Heading } from "@/components/ui/heading";
// import { Text } from "@/components/ui/text"; // Pastikan Text diimpor

// import { useRestockProductMutation } from '@/src/store/api/productsApi';

// interface RestockRequestModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   productId: number;
//   productVariantId: number | null;
//   productName: string;
//   variantName?: string;
// }

// const RestockRequestModal: React.FC<RestockRequestModalProps> = ({
//   isOpen,
//   onClose,
//   productId,
//   productVariantId,
//   productName,
//   variantName,
// }) => {
//   const [message, setMessage] = useState('');
//   const [isMessageInvalid, setIsMessageInvalid] = useState(false);
//   const [sendRestockRequest, { isLoading, isSuccess, isError, error, reset }] = useRestockProductMutation();
//   const toast = useToast();

//   // Reset state saat modal dibuka atau ditutup
//   useEffect(() => {
//     if (!isOpen) {
//       setMessage(''); // Bersihkan input saat modal ditutup
//       setIsMessageInvalid(false); // Reset validasi
//       reset(); // Reset status mutasi RTK Query
//     }
//   }, [isOpen, reset]);

//   // Toast untuk sukses
//   const showSuccessToast = useCallback((msg: string) => {
//     toast.show({
//       placement: 'top',
//       duration: 3000,
//       render: ({ id }) => (
//         <Toast
//           nativeID={'toast-success-' + id}
//           action="success"
//           variant="solid"
//           className="p-4 gap-6 bg-success-500 w-full shadow-lg max-w-[443px] flex-row justify-between rounded-md"
//         >
//           <HStack space="md" className="items-center">
//             <Icon as={CheckCircleIcon} className="stroke-white" size="lg" />
//             <VStack space="xs">
//               <ToastTitle className="font-semibold text-white">Berhasil!</ToastTitle>
//               <ToastDescription size="sm" className="text-white">{msg}</ToastDescription>
//             </VStack>
//           </HStack>
//           <Pressable onPress={() => toast.close(id)}>
//             <Icon as={CloseIcon} size="md" className="stroke-white" />
//           </Pressable>
//         </Toast>
//       ),
//     });
//   }, [toast]);

//   // Toast untuk error
//   const showErrorToast = useCallback((msg: string) => {
//     toast.show({
//       placement: 'top',
//       duration: 5000,
//       render: ({ id }) => (
//         <Toast
//           nativeID={'toast-error-' + id}
//           action="error"
//           variant="solid"
//           className="p-4 gap-6 bg-error-500 w-full shadow-lg max-w-[443px] flex-row justify-between rounded-md"
//         >
//           <HStack space="md" className="items-center">
//             <Icon as={AlertCircleIcon} className="stroke-white" size="lg" />
//             <VStack space="xs">
//               <ToastTitle className="font-semibold text-white">Gagal!</ToastTitle>
//               <ToastDescription size="sm" className="text-white">{msg}</ToastDescription>
//             </VStack>
//           </HStack>
//           <Pressable onPress={() => toast.close(id)}>
//             <Icon as={CloseIcon} size="md" className="stroke-white" />
//           </Pressable>
//         </Toast>
//       ),
//     });
//   }, [toast]);

//   // Handle success/error state changes from the mutation
//   useEffect(() => {
//     if (isSuccess) {
//       showSuccessToast("Terima kasih, permintaan Anda telah terkirim.");
//       onClose(); // Tutup modal setelah berhasil
//     }

//     if (isError) {
//       const errorMessage = (error as any)?.data?.message || (error as any)?.error || "Terjadi kesalahan. Coba lagi nanti.";
//       showErrorToast(errorMessage);
//     }
//   }, [isSuccess, isError, error, showSuccessToast, showErrorToast, onClose]);


//   const handleSubmit = async () => {
//     if (!message.trim()) {
//       setIsMessageInvalid(true);
//       showErrorToast('Pesan permintaan tidak boleh kosong.');
//       return;
//     }
//     setIsMessageInvalid(false);

//     const payload: { product_id: number; product_variant_id?: number; message: string } = {
//       product_id: productId,
//       message: message,
//     };

//     if (productVariantId !== null) {
//       payload.product_variant_id = productVariantId;
//     }

//     try {
//       await sendRestockRequest(payload as any).unwrap();
//     } catch (err) {
//       // Error sudah ditangani di useEffect, jadi tidak perlu logika di sini
//       console.error("Error handled by useEffect:", err);
//     }
//   };

//   return (
//     <Modal
//       isOpen={isOpen}
//       onClose={onClose}
//       avoidKeyboard={Platform.OS === 'ios'} // Sama seperti AIChatFloatingButton
//     >
//       <ModalBackdrop />
//       <ModalContent className="bg-white rounded-lg p-6 w-full max-w-sm"> {/* Rounded corners, padding, max-width */}
//         <ModalHeader className="mb-4 flex-row justify-between items-center">
//           <Heading size="lg">Permintaan Restock Produk</Heading>
//           <ModalCloseButton onPress={onClose}> {/* Menggunakan ModalCloseButton */}
//             <Icon as={CloseIcon} size="md" />
//           </ModalCloseButton>
//         </ModalHeader>

//         <ModalBody className="mb-6">
//           <VStack space="sm" className="mb-4">
//             <Text size="sm" className="text-gray-700">
//               Anda akan meminta restock untuk:
//             </Text>
//             <Text size="md" className="font-semibold text-gray-900">
//               {productName} {variantName ? `- ${variantName}` : ''}
//             </Text>
//           </VStack>

//           <FormControl isInvalid={isMessageInvalid} size="md">
//             <FormControlLabel>
//               <FormControlLabelText className="text-gray-700 mb-2">
//                 Pesan Permintaan:
//               </FormControlLabelText>
//             </FormControlLabel>
//             <TextInput
//               className="border border-gray-300 rounded-md p-3 text-lg bg-white"
//               placeholder="Contoh: Saya suka produk ini tapi stok tinggal sedikit."
//               placeholderTextColor="#777777" // Warna placeholder yang lebih gelap
//               value={message}
//               onChangeText={(text) => {
//                 setMessage(text);
//                 setIsMessageInvalid(false); // Reset validasi saat teks berubah
//               }}
//               multiline
//               numberOfLines={4}
//               style={styles.textInput} // Gunakan style dari StyleSheet
//               editable={!isLoading} // Disable input saat loading
//             />
//             {isMessageInvalid && (
//               <FormControlError className="mt-2">
//                 <FormControlErrorIcon as={AlertCircleIcon} />
//                 <FormControlErrorText>
//                   Pesan permintaan tidak boleh kosong.
//                 </FormControlErrorText>
//               </FormControlError>
//             )}
//           </FormControl>
//         </ModalBody>

//         <ModalFooter className="flex-row justify-end">
//           <Button
//             variant="outline"
//             action="secondary"
//             onPress={onClose}
//             disabled={isLoading}
//             className="mr-2"
//           >
//             <ButtonText>Batal</ButtonText>
//           </Button>
//           <Button
//             onPress={handleSubmit}
//             disabled={isLoading || !message.trim()}
//           >
//             {isLoading ? (
//               <HStack space="sm" className="items-center">
//                 <ActivityIndicator color="#fff" />
//                 <ButtonText>Mengirim...</ButtonText>
//               </HStack>
//             ) : (
//               <ButtonText>Kirim Permintaan</ButtonText>
//             )}
//           </Button>
//         </ModalFooter>
//       </ModalContent>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   textInput: {
//     minHeight: 100, // Tinggi minimum untuk input yang lebih kotak
//     textAlignVertical: 'top', // Teks dimulai dari atas
//   },
// });

// export default RestockRequestModal;
// src/components/RestockRequestModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, TextInput, Platform, StyleSheet } from 'react-native';
import {
  Button,
  ButtonText,
} from "@/components/ui/button";
import {
  Toast,
  useToast,
  ToastTitle,
  ToastDescription,
} from "@/components/ui/toast";
import {
  Icon,
  CloseIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from '@/components/ui/icon';
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
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
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

import { useRestockProductMutation } from '@/src/store/api/productsApi';

interface RestockRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productVariantId: number | null;
  productName: string;
  variantName?: string;
}

const RestockRequestModal: React.FC<RestockRequestModalProps> = ({
  isOpen,
  onClose,
  productId,
  productVariantId,
  productName,
  variantName,
}) => {
  const [message, setMessage] = useState('');
  const [isMessageInvalid, setIsMessageInvalid] = useState(false);
  const [sendRestockRequest, { isLoading, isSuccess, isError, error, reset }] = useRestockProductMutation();
  const toast = useToast();

  useEffect(() => {
    if (!isOpen) {
      setMessage('');
      setIsMessageInvalid(false);
      reset();
    }
  }, [isOpen, reset]);

  const showSuccessToast = useCallback((msg: string) => {
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
              <ToastTitle className="font-semibold text-white">Berhasil!</ToastTitle>
              <ToastDescription size="sm" className="text-white">{msg}</ToastDescription>
            </VStack>
          </HStack>
          <Pressable onPress={() => toast.close(id)}>
            <Icon as={CloseIcon} size="md" className="stroke-white" />
          </Pressable>
        </Toast>
      ),
    });
  }, [toast]);

  const showErrorToast = useCallback((msg: string) => {
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
              <ToastTitle className="font-semibold text-white">Gagal!</ToastTitle>
              <ToastDescription size="sm" className="text-white">{msg}</ToastDescription>
            </VStack>
          </HStack>
          <Pressable onPress={() => toast.close(id)}>
            <Icon as={CloseIcon} size="md" className="stroke-white" />
          </Pressable>
        </Toast>
      ),
    });
  }, [toast]);

  // Handle success/error state changes from the mutation
  useEffect(() => {
    if (isSuccess) {
      showSuccessToast("Terima kasih, permintaan Anda telah terkirim.");
      onClose(); // Tutup modal setelah berhasil
    }

    if (isError) {
      const errorMessage = (error as any)?.data?.message || (error as any)?.error || "Terjadi kesalahan. Coba lagi nanti.";
      showErrorToast(errorMessage);
      onClose(); // <--- TAMBAHKAN BARIS INI: Tutup modal juga saat ada error
    }
  }, [isSuccess, isError, error, showSuccessToast, showErrorToast, onClose]);


  const handleSubmit = async () => {
    if (!message.trim()) {
      setIsMessageInvalid(true);
      showErrorToast('Pesan permintaan tidak boleh kosong.');
      return;
    }
    setIsMessageInvalid(false);

    const payload: { product_id: number; product_variant_id?: number; message: string } = {
      product_id: productId,
      message: message,
    };

    if (productVariantId !== null) {
      payload.product_variant_id = productVariantId;
    }

    try {
      await sendRestockRequest(payload as any).unwrap();
    } catch (err) {
      console.error("Error handled by useEffect:", err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      avoidKeyboard={Platform.OS === 'ios'}
    >
      <ModalBackdrop />
      <ModalContent className="bg-white rounded-lg p-6 w-full max-w-sm">
        <ModalHeader className="mb-4 flex-row justify-between items-center">
          <Heading size="lg">Permintaan Restock Produk</Heading>
          <ModalCloseButton onPress={onClose}>
            <Icon as={CloseIcon} size="md" />
          </ModalCloseButton>
        </ModalHeader>

        <ModalBody className="mb-6">
          <VStack space="sm" className="mb-4">
            <Text size="sm" className="text-gray-700">
              Anda akan meminta restock untuk:
            </Text>
            <Text size="md" className="font-semibold text-gray-900">
              {productName} {variantName ? `- ${variantName}` : ''}
            </Text>
          </VStack>

          <FormControl isInvalid={isMessageInvalid} size="md">
            <FormControlLabel>
              <FormControlLabelText className="text-gray-700 mb-2">
                Pesan Permintaan:
              </FormControlLabelText>
            </FormControlLabel>
            <TextInput
              className="border border-gray-300 rounded-md p-3 text-lg bg-white"
              placeholder="Contoh: Saya suka produk ini tapi stok tinggal sedikit."
              placeholderTextColor="#777777"
              value={message}
              onChangeText={(text) => {
                setMessage(text);
                setIsMessageInvalid(false);
              }}
              multiline
              numberOfLines={4}
              style={styles.textInput}
              editable={!isLoading}
            />
            {isMessageInvalid && (
              <FormControlError className="mt-2">
                <FormControlErrorIcon as={AlertCircleIcon} />
                <FormControlErrorText>
                  Pesan permintaan tidak boleh kosong.
                </FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>
        </ModalBody>

        <ModalFooter className="flex-row justify-end">
          <Button
            variant="outline"
            action="secondary"
            onPress={onClose}
            disabled={isLoading}
            className="mr-2"
          >
            <ButtonText>Batal</ButtonText>
          </Button>
          <Button
            onPress={handleSubmit}
            disabled={isLoading || !message.trim()}
          >
            {isLoading ? (
              <HStack space="sm" className="items-center">
                <ActivityIndicator color="#fff" />
                <ButtonText>Mengirim...</ButtonText>
              </HStack>
            ) : (
              <ButtonText>Kirim Permintaan</ButtonText>
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const styles = StyleSheet.create({
  textInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default RestockRequestModal;