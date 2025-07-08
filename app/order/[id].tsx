import React, { useState, useCallback } from 'react';
import { ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { Icon, InfoIcon } from "@/components/ui/icon";
import { Alert, AlertText, AlertIcon } from '@/components/ui/alert';
import { Heading } from '@/components/ui/heading';

import { useGetOrderDetailQuery } from '@/src/store/api/orderApi';
import { format, parseISO } from 'date-fns'; // Import format and parseISO
import { id as idLocale } from 'date-fns/locale'; // Import Indonesian locale for date-fns

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const orderId = typeof id === 'string' ? parseInt(id, 10) : null;

  const { data, error, isLoading, isFetching, refetch } = useGetOrderDetailQuery(
    orderId!,
    { skip: orderId === null || isNaN(orderId) }
  );

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Helper function to format date and time in Indonesian style
  const formatDateTimeIndonesia = (dateString: string) => {
    const date = parseISO(dateString);
    const hour = date.getHours();
    let timeOfDay = '';

    if (hour >= 0 && hour < 12) {
      timeOfDay = 'Pagi';
    } else if (hour >= 12 && hour < 17) {
      timeOfDay = 'Siang';
    } else {
      timeOfDay = 'Malam';
    }

    // Format date as "1 Juli 2025"
    const formattedDate = format(date, 'd MMMM yyyy', { locale: idLocale });
    // Format time as "HH.mm"
    const formattedTime = format(date, 'HH.mm');

    return `${formattedDate}, Jam ${formattedTime} ${timeOfDay}`;
  };

  if (isLoading || isFetching) {
    return (
      <Box style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F7F7' }}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Memuat detail order...</Text>
      </Box>
    );
  }

  if (error || !data) {
    const errorMessage = (error as any)?.message || (error as any)?.data?.message || 'Gagal memuat detail order. Order ID mungkin tidak valid atau terjadi kesalahan.';
    return (
      <Box style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: '#F7F7F7' }}>
        <Alert action="error" variant="outline" style={{ width: '100%', maxWidth: 400 }}>
          <AlertIcon as={InfoIcon} />
          <VStack space="xs">
            <Text style={{ fontWeight: 'bold', color: '#dc2626' }}>Error!</Text>
            <AlertText>{errorMessage}</AlertText>
          </VStack>
        </Alert>
        <Button onPress={onRefresh} style={{ marginTop: 20, backgroundColor: '#007bff', borderRadius: 8 }}>
          <ButtonText style={{ color: '#fff' }}>Coba Lagi</ButtonText>
        </Button>
      </Box>
    );
  }

  const orderDetails = data;
  const orderItems = orderDetails.data || [];
  const isEmpty = orderItems.length === 0;

  return (
    <Box style={{ flex: 1, backgroundColor: '#F7F7F7' }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <VStack space="md" style={{ flex: 1 }}>
          <HStack style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Heading size="lg" style={{ color: '#1f2937' }}>Detail Order #{orderId}</Heading>
            <Text style={{ color: '#6b7280' }}>Status: <Text style={{ fontWeight: 'bold', color: orderDetails.status === 'expired' ? '#ef4444' : '#22c55e' }}>{orderDetails.status.toUpperCase()}</Text></Text>
          </HStack>

          {/* Order Summary Card */}
          <Box
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
              marginBottom: 16,
            }}
          >
            <VStack space="sm">
              <HStack style={{ justifyContent: 'space-between' }}>
                <Text style={{ color: '#4b5563' }}>Tanggal Order:</Text>
                {/* Use the new formatting function here */}
                <Text style={{ fontWeight: '600', color: '#1f2937' }}>{formatDateTimeIndonesia(orderDetails.created_at)}</Text>
              </HStack>
              <HStack style={{ justifyContent: 'space-between' }}>
                <Text style={{ color: '#4b5563' }}>Total Harga Order:</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#22c55e' }}>
                  Rp {orderDetails.total_order_price.toLocaleString('id-ID')}
                </Text>
              </HStack>
            </VStack>
          </Box>

          <Heading size="md" style={{ color: '#1f2937', marginBottom: 12 }}>Item Pesanan</Heading>

          {isEmpty ? (
            <Box style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{ fontSize: 16, color: '#999', marginBottom: 8 }}>Tidak ada item dalam order ini.</Text>
              <Button variant="outline" onPress={() => router.push("/")}>
                <ButtonText>Kembali ke Beranda</ButtonText>
              </Button>
            </Box>
          ) : (
            <VStack space="sm">
              {orderItems.map((item) => (
                <Box
                  key={item.id}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 12,
                    padding: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <HStack space="md" style={{ alignItems: 'center' }}>
                    {item.thumbnails?.[0] && (
                      <Image
                        source={{ uri: item.thumbnails[0] }}
                        alt={item.name}
                        style={{ width: 80, height: 80, borderRadius: 8 }}
                        resizeMode="cover"
                      />
                    )}
                    <VStack space="xs" style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '600', fontSize: 16 }} numberOfLines={2}>
                        {item.name}
                      </Text>
                      {item.variants && item.variants.length > 0 && (
                        <Text size="sm" style={{ color: '#64748b' }}>
                          Varian: {item.variants[0].name}
                        </Text>
                      )}
                      <Text size="sm" style={{ color: '#64748b' }}>
                        Jumlah: {item.quantity}
                      </Text>
                      <Text style={{ color: '#007bff', fontWeight: 'bold', marginTop: 4 }}>
                        Harga Satuan: Rp {item.price_at_purchase.toLocaleString('id-ID')}
                      </Text>
                      <Text style={{ color: '#22c55e', fontWeight: 'bold', fontSize: 15 }}>
                        Subtotal: Rp {item.total_price.toLocaleString('id-ID')}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </VStack>
      </ScrollView>
    </Box>
  );
}
