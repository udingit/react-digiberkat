// @/components/ProductCard.tsx
import React from 'react';
import { Pressable, View } from 'react-native';
import { Card } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Link } from 'expo-router';
import type { RecommendedProduct } from '@/types/recommendation';

export default function ProductCard({ product }: { product: RecommendedProduct }) {
  // ❗ Proteksi awal jika product tidak valid
  if (!product || typeof product !== 'object') {
    return (
      <Card className="p-4 border border-gray-300 bg-gray-100 rounded-md">
        <Text className="text-center text-gray-500">Produk tidak tersedia</Text>
      </Card>
    );
  }

  const {
    id,
    name = 'Produk Tanpa Nama',
    is_discounted = false,
    discount_price = null,
    price = null,
    is_varians = false,
    variants = [],
    thumbnails = [],
    images = [],
  } = product;

  const variant = variants?.[0];
  const hasVariant = is_varians && variant;
  const hasDiscount = hasVariant
    ? variant.is_discounted && variant.discount_price !== null
    : is_discounted && discount_price !== null;

  const originalPrice = hasVariant ? variant.price ?? 0 : price ?? 0;
  const displayPrice = hasVariant
    ? variant.discount_price ?? variant.price ?? 0
    : discount_price ?? price ?? 0;

  const discountPercent =
    hasDiscount && originalPrice > 0
      ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
      : 0;

  const productImage =
    thumbnails?.[0] || images?.[0] || 'https://via.placeholder.com/150/0000FF/FFFFFF?text=No+Image';

  return (
    <Link href={{ pathname: '/product/[id]', params: { id: id?.toString() ?? '' } }} asChild>
      <Pressable className="flex-1">
        <Card
          className="p-5 rounded-lg flex-1 border border-gray-300 bg-white shadow-md relative"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 3,
          }}
        >
          <Image
            source={{ uri: productImage }}
            className="mb-4 h-[240px] w-full rounded-md aspect-[4/3]"
            alt={`${name} image`}
            resizeMode="contain"
          />

          {hasDiscount && (
            <View className="absolute top-3 left-3 bg-red-600 px-2 py-1 rounded-md z-10 shadow-lg">
              <Text className="text-white text-xs font-bold">{discountPercent}% OFF</Text>
            </View>
          )}

          <Text
            className="text-base font-semibold mb-3 text-typography-900"
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {name}
          </Text>

          <View className="mb-2">
            {hasDiscount ? (
              <>
                <Text className="text-sm text-gray-400 line-through">
                  Rp {originalPrice?.toLocaleString('id-ID')}
                </Text>

                <View className="flex-row items-center gap-2">
                  <Heading size="lg" className="text-red-600 font-bold">
                    Rp {displayPrice?.toLocaleString('id-ID')}
                  </Heading>
                  <View className="bg-red-100 rounded px-2 py-0.5">
                    <Text className="text-xs font-semibold text-red-600">-{discountPercent}%</Text>
                  </View>
                </View>
              </>
            ) : (
              <Heading size="lg" className="text-typography-900 font-bold">
                {typeof displayPrice === 'number'
                  ? `Rp ${displayPrice.toLocaleString('id-ID')}`
                  : 'Harga tidak tersedia'}
              </Heading>
            )}
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}
