import React, { useCallback } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useBreakpointValue } from '@/components/ui/utils/use-break-point-value';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Box } from '@/components/ui/box';
import { useGetProductsQuery } from '@/src/store/api/productsApi';
import type { Product } from '@/types/product';
import type { RecommendedProduct } from '@/types/recommendation';
import { useFocusEffect } from '@react-navigation/native';
import ProductListItem from '@/components/ProductListItem';
import ProductCard from '@/components/ProductCard';
import { Spinner } from '@/components/ui/spinner';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/src/store/store';
import { AIChatFloatingButton } from '@/components/AIChatFloatingButton';

function getWidthClass(numColumns: number): string {
  const widthMap = {
    1: 'w-full',
    2: 'w-1/2',
    3: 'w-1/3',
    4: 'w-1/4',
    5: 'w-1/5',
    6: 'w-1/6',
  } as const;

  return widthMap[numColumns as keyof typeof widthMap] || 'w-full';
}

export default function HomeScreen() {
  const numColumns = useBreakpointValue({ default: 2, sm: 3, md: 4 }) as number;
  const widthClass = getWidthClass(numColumns);
  const dispatch = useDispatch();

  const { data: products, error, isLoading, isFetching, refetch } = useGetProductsQuery();

  const { recommendedProducts, hasRecommendations } = useSelector(
    (state: RootState) => state.recommendation
  );

  console.log('HomeScreen state:', {
    isLoading,
    isFetching,
    error: error ? JSON.stringify(error) : null,
    products: products ? `Received ${products.length} products` : 'No products received',
    recommendedProducts: recommendedProducts ? `Received ${recommendedProducts.length} recommended products` : 'No recommended products',
    hasRecommendations,
  });

  useFocusEffect(
    useCallback(() => {
      console.log('HomeScreen focused, refetching products data...');
      refetch();
    }, [refetch])
  );

  const flattenProduct = useCallback((product: Product) => {
    const isVariant = product.is_varians && product.variants?.length;
    const firstVariant = isVariant ? product.variants![0] : null;

    const thumbnail =
      product.thumbnails?.[0] || product.images?.[0] || 'https://via.placeholder.com/150';

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      images: product.thumbnails?.length ? product.thumbnails : product.images,
      thumbnail,
      price: isVariant ? firstVariant?.price ?? 0 : product.price ?? 0,
      isDiscounted: isVariant ? firstVariant?.is_discounted ?? false : product.is_discounted,
      discountPrice: isVariant
        ? firstVariant?.discount_price ?? null
        : product.discount_price ?? null,
    };
  }, []);

  const renderRecommendationSection = () => {
    if (!hasRecommendations || recommendedProducts.length === 0) {
      return null;
    }

    return (
      <Box className="p-2 mt-4">
        <Text className="text-xl font-bold text-gray-900 mb-3">Produk Rekomendasi AI</Text>
        <FlatList
          data={recommendedProducts.slice(0, 3)}
          key={`recommended-product-list-${numColumns}`}
          keyExtractor={(item) =>
            item?.id?.toString?.() ?? Math.random().toString()
          }
          numColumns={numColumns}
          contentContainerClassName="gap-2 w-full"
          columnWrapperClassName="gap-2"
          renderItem={({ item }) => (
            <Box className={`${widthClass} p-1`}>
              <ProductCard product={item as RecommendedProduct} />
            </Box>
          )}
          scrollEnabled={false}
        />
        <Box
          style={{
            height: 1,
            backgroundColor: '#E0E0E0',
            marginVertical: 10,
            marginTop: 60
          }}
        />
        <Text className="text-xl font-bold text-gray-900 mt-5">Produk Digiberkat lainnya</Text>
        <Box className="h-4" />
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Box className="flex-1">
        <LoadingView />
        <AIChatFloatingButton />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="flex-1">
        <ErrorView onRetry={refetch} />
        <AIChatFloatingButton />
      </Box>
    );
  }

  if (!products?.length && !hasRecommendations) {
    return (
      <Box className="flex-1">
        <EmptyView onRefresh={refetch} />
        <AIChatFloatingButton />
      </Box>
    );
  }

  return (
    <Box className="flex-1">
      <FlatList
        data={products}
        key={`product-list-${numColumns}`}
        keyExtractor={(item) =>
          item?.id?.toString?.() ?? Math.random().toString()
        }
        numColumns={numColumns}
        contentContainerClassName="gap-2 max-w-[960px] mx-auto w-full p-2"
        columnWrapperClassName="gap-2"
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        ListHeaderComponent={renderRecommendationSection}
        renderItem={({ item }) => (
          <Box className={`${widthClass} p-1`}>
            <ProductListItem product={flattenProduct(item)} />
          </Box>
        )}
        ListFooterComponent={<Box className="h-20" />}
      />
      <AIChatFloatingButton />
    </Box>
  );
}

// Views
function LoadingView() {
  return (
    <Box className="flex-1 items-center justify-center">
      <Spinner size="large" />
      <Text className="mt-4">Memuat produk...</Text>
    </Box>
  );
}

function ErrorView({ onRetry }: { onRetry: () => void }) {
  return (
    <Box className="flex-1 items-center justify-center">
      <Text className="text-red-500 mb-4">Gagal memuat data produk</Text>
      <Button onPress={onRetry}>Coba Lagi</Button>
    </Box>
  );
}

function EmptyView({ onRefresh }: { onRefresh: () => void }) {
  return (
    <Box className="flex-1 items-center justify-center">
      <Text className="mb-4">Tidak ada produk tersedia</Text>
      <Button onPress={onRefresh}>Refresh</Button>
    </Box>
  );
}

// // app/index.tsx
// import React, { useCallback } from 'react';
// import { FlatList, View, RefreshControl } from 'react-native'; // Hapus TouchableOpacity
// import { useBreakpointValue } from '@/components/ui/utils/use-break-point-value';
// import { Text } from '@/components/ui/text';
// import { Button } from '@/components/ui/button';
// import { Box } from '@/components/ui/box';
// import { useGetProductsQuery } from '@/src/store/api/productsApi';
// import type { Product } from '@/types/product';
// import type { RecommendedProduct } from '@/types/recommendation';
// import { useFocusEffect } from '@react-navigation/native';
// import ProductListItem from '@/components/ProductListItem';
// import ProductCard from '@/components/ProductCard'; // Import ProductCard untuk rekomendasi
// import { Spinner } from '@/components/ui/spinner';
// // Hapus import ShoppingCart, ShoppingBasket, SafeAreaView, router karena sudah di _layout.tsx
// // import { ShoppingCart, ShoppingBasket } from 'lucide-react-native';
// // import { SafeAreaView } from 'react-native-safe-area-context';
// // import { router } from 'expo-router';

// // Impor yang dibutuhkan untuk Redux
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState } from '@/src/store/store'; // Pastikan ini sesuai dengan path RootState Anda
// // clearRecommendations tetap diimpor jika ada kebutuhan lain untuk menggunakannya secara manual,
// // tetapi tidak lagi dipanggil di useFocusEffect untuk persistensi.
// import { clearRecommendations } from '@/src/store/api/recommendationSlice';

// // Import komponen baru untuk AI Chat
// import { AIChatFloatingButton } from '@/components/AIChatFloatingButton';

// // Fungsi helper untuk menentukan lebar kolom
// function getWidthClass(numColumns: number): string {
//   const widthMap = {
//     1: 'w-full',
//     2: 'w-1/2',
//     3: 'w-1/3',
//     4: 'w-1/4',
//     5: 'w-1/5',
//     6: 'w-1/6',
//   } as const;

//   return widthMap[numColumns as keyof typeof widthMap] || 'w-full';
// }

// export default function HomeScreen() {
//   const numColumns = useBreakpointValue({ default: 2, sm: 3, md: 4 }) as number;
//   const widthClass = getWidthClass(numColumns);
//   // dispatch tetap dibutuhkan jika ada actions lain yang perlu dipanggil dari component ini
//   const dispatch = useDispatch();

//   const { data: products, error, isLoading, isFetching, refetch } = useGetProductsQuery();

//   // Ambil data rekomendasi dari Redux store
//   const { recommendedProducts, hasRecommendations } = useSelector(
//     (state: RootState) => state.recommendation
//   );

//   // Debug: Log setiap perubahan state query dan rekomendasi
//   console.log('HomeScreen state:', {
//     isLoading,
//     isFetching,
//     error: error ? JSON.stringify(error) : null,
//     products: products ? `Received ${products.length} products` : 'No products received',
//     recommendedProducts: recommendedProducts ? `Received ${recommendedProducts.length} recommended products` : 'No recommended products',
//     hasRecommendations,
//   });

//   useFocusEffect(
//     useCallback(() => {
//       console.log('HomeScreen focused, refetching products data...');
//       refetch();
//       // ✅ clearRecommendations tidak lagi dipanggil di sini untuk menjaga persistensi
//     }, [refetch]) // ✅ Hapus 'dispatch' dari dependency array karena tidak digunakan di callback ini
//   );

//   // Fungsi untuk mem-flatten data Product agar kompatibel dengan ProductListItem
//   // Pertahankan ini jika ProductListItem memang memerlukan format ini.
//   const flattenProduct = (product: Product) => {
//     const isVariant = product.is_varians && product.variants?.length;
//     const firstVariant = isVariant ? product.variants![0] : null;

//     const thumbnail =
//       product.thumbnails?.[0] || product.images?.[0] || 'https://via.placeholder.com/150';

//     return {
//       id: product.id,
//       name: product.name,
//       description: product.description,
//       images: product.thumbnails?.length ? product.thumbnails : product.images,
//       thumbnail,
//       price: isVariant ? firstVariant?.price ?? 0 : product.price ?? 0,
//       isDiscounted: isVariant ? firstVariant?.is_discounted ?? false : product.is_discounted,
//       discountPrice: isVariant
//         ? firstVariant?.discount_price ?? null
//         : product.discount_price ?? null,
//     };
//   };

//   // Fungsi untuk merender bagian rekomendasi AI
//   const renderRecommendationSection = () => {
//     // Hanya menampilkan bagian ini jika ada rekomendasi
//     if (!hasRecommendations || recommendedProducts.length === 0) {
//       return null;
//     }

//     return (
//       <View className="p-2 mt-4">
//         <Text className="text-xl font-bold text-gray-900 mb-3">Produk Rekomendasi AI</Text>
//         <FlatList
//           data={recommendedProducts.slice(0, 3)} // Tampilkan hanya 3 produk teratas
//           key={`recommended-product-list-${numColumns}`}
//           keyExtractor={(item) => `rec-${item.id.toString()}`} // Key unik untuk rekomendasi
//           numColumns={numColumns}
//           contentContainerClassName="gap-2 w-full"
//           columnWrapperClassName="gap-2"
//           renderItem={({ item }) => (
//             <View className={`${widthClass} p-1`}>
//               {/* Gunakan ProductCard yang sudah disiapkan untuk RecommendedProduct */}
//               <ProductCard product={item as RecommendedProduct} />
//             </View>
//           )}
//           scrollEnabled={false} // Penting: Jangan biarkan inner FlatList di-scroll jika ada di dalam FlatList lain
//         />
//         <Box
//           style={{
//             height: 1, // Tinggi garis (1 pixel untuk garis tipis)
//             backgroundColor: '#E0E0E0', // Warna abu-abu yang Anda inginkan
//             marginVertical: 10, // Opsional: Tambahkan margin atas dan bawah untuk pemisah
//             marginTop: 60
//           }}
//         />
//         <Text className="text-xl font-bold text-gray-900 mt-5">Produk Digiberkat lainnya</Text>
//         <View className="h-4" /> {/* Spacer */}
//       </View>
//     );
//   };

//   // Render kondisi loading
//   if (isLoading) {
//     return (
//       <View className="flex-1">
//         <LoadingView />
//         <AIChatFloatingButton />
//       </View>
//     );
//   }

//   // Render kondisi error
//   if (error) {
//     return (
//       <View className="flex-1">
//         <ErrorView onRetry={refetch} />
//         <AIChatFloatingButton />
//       </View>
//     );
//   }

//   // Render kondisi kosong (tidak ada produk biasa DAN tidak ada rekomendasi)
//   // Perhatikan: Rekomendasi AI tetap akan ditampilkan jika ada, bahkan jika produk utama kosong.
//   // Logika ini hanya untuk case di mana kedua-duanya kosong.
//   if (!products?.length && !hasRecommendations) {
//     return (
//       <View className="flex-1">
//         <EmptyView onRefresh={refetch} />
//         <AIChatFloatingButton />
//       </View>
//     );
//   }

//   // Render tampilan utama dengan daftar produk dan bagian rekomendasi (jika ada)
//   return (
//     <View className="flex-1">
//       <FlatList
//         data={products}
//         key={`product-list-${numColumns}`} // Ganti key jika numColumns berubah
//         keyExtractor={(item) => item.id.toString()}
//         numColumns={numColumns}
//         contentContainerClassName="gap-2 max-w-[960px] mx-auto w-full p-2"
//         columnWrapperClassName="gap-2"
//         refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
//         ListHeaderComponent={renderRecommendationSection} // Tampilkan rekomendasi di bagian header daftar
//         renderItem={({ item }) => (
//           <View className={`${widthClass} p-1`}>
//             {/* Pastikan ProductListItem menerima data yang sudah diflatten */}
//             <ProductListItem product={flattenProduct(item)} />
//           </View>
//         )}
//         ListFooterComponent={<View className="h-20" />} // Spacer di bagian bawah
//       />
//       <AIChatFloatingButton />
//     </View>
//   );
// }

// // Komponen pemisah untuk state views (Loading, Error, Empty)
// function LoadingView() {
//   return (
//     <View className="flex-1 items-center justify-center">
//       <Spinner size="large" />
//       <Text className="mt-4">Memuat produk...</Text>
//     </View>
//   );
// }

// function ErrorView({ onRetry }: { onRetry: () => void }) {
//   return (
//     <View className="flex-1 items-center justify-center">
//       <Text className="text-red-500 mb-4">Gagal memuat data produk</Text>
//       <Button onPress={onRetry}>Coba Lagi</Button>
//     </View>
//   );
// }

// function EmptyView({ onRefresh }: { onRefresh: () => void }) {
//   return (
//     <View className="flex-1 items-center justify-center">
//       <Text className="mb-4">Tidak ada produk tersedia</Text>
//       <Button onPress={onRefresh}>Refresh</Button>
//     </View>
//   );
// }