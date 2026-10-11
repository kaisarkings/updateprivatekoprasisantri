import React from 'react';
import {
  Utensils,
  Coffee,
  Cookie,
  BookOpen,
  ShoppingBag,
  Tag,
  Package,
  Shirt,
  Apple,
  Pizza,
  Sandwich,
  IceCream,
  Milk,
  Sparkles,
  Smile,
  Gift,
  Box,
  Layers,
  Scissors,
  Briefcase,
  Heart,
  Star,
  Bookmark,
  Glasses,
  LucideIcon,
} from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
  Utensils,
  Coffee,
  Cookie,
  BookOpen,
  ShoppingBag,
  Tag,
  Package,
  Shirt,
  Apple,
  Pizza,
  Sandwich,
  IceCream,
  Milk,
  Sparkles,
  Smile,
  Gift,
  Box,
  Layers,
  Scissors,
  Briefcase,
  Heart,
  Star,
  Bookmark,
  Glasses,
};

export const AVAILABLE_CATEGORY_ICONS: Array<{ name: string; label: string }> = [
  { name: 'Utensils', label: 'Makanan / Alat Makan' },
  { name: 'Coffee', label: 'Minuman / Kopi' },
  { name: 'Cookie', label: 'Snack / Biskuit' },
  { name: 'BookOpen', label: 'ATK / Kitab / Buku' },
  { name: 'ShoppingBag', label: 'Toko / Serbaguna' },
  { name: 'Package', label: 'Paket / Sembako' },
  { name: 'Shirt', label: 'Pakaian / Laundry' },
  { name: 'Apple', label: 'Buah / Segar' },
  { name: 'Pizza', label: 'Roti / Pizza' },
  { name: 'Sandwich', label: 'Sarapan / Roti Bakar' },
  { name: 'IceCream', label: 'Es Krim / Manis' },
  { name: 'Milk', label: 'Susu / Minuman Kotak' },
  { name: 'Tag', label: 'Barang Promo' },
  { name: 'Sparkles', label: 'Spesial / Santri Hebat' },
  { name: 'Smile', label: 'Kebutuhan Santri' },
  { name: 'Gift', label: 'Hadiah / Bingkisan' },
  { name: 'Box', label: 'Kotak / Kardus' },
  { name: 'Scissors', label: 'Pangkas / Cukur' },
  { name: 'Briefcase', label: 'Peralatan Pribadi' },
  { name: 'Heart', label: 'Kesehatan / Obat' },
  { name: 'Star', label: 'Favorit Santri' },
  { name: 'Bookmark', label: 'Perlengkapan Ngaji' },
];

export const AVAILABLE_CATEGORY_COLORS = [
  { name: 'Emerald (Hijau)', bgClass: 'bg-emerald-500', textClass: 'text-emerald-500', hex: '#10b981' },
  { name: 'Blue (Biru)', bgClass: 'bg-blue-500', textClass: 'text-blue-500', hex: '#3b82f6' },
  { name: 'Amber (Kuning Keemasan)', bgClass: 'bg-amber-500', textClass: 'text-amber-500', hex: '#f59e0b' },
  { name: 'Purple (Ungu)', bgClass: 'bg-purple-500', textClass: 'text-purple-500', hex: '#a855f7' },
  { name: 'Rose (Merah Muda)', bgClass: 'bg-rose-500', textClass: 'text-rose-500', hex: '#f43f5e' },
  { name: 'Indigo (Indigo)', bgClass: 'bg-indigo-500', textClass: 'text-indigo-500', hex: '#6366f1' },
  { name: 'Teal (Hijau Toska)', bgClass: 'bg-teal-500', textClass: 'text-teal-500', hex: '#14b8a6' },
  { name: 'Orange (Oranye)', bgClass: 'bg-orange-500', textClass: 'text-orange-500', hex: '#f97316' },
  { name: 'Pink (Pink Fuchsia)', bgClass: 'bg-pink-500', textClass: 'text-pink-500', hex: '#ec4899' },
  { name: 'Slate (Abu-abu Slate)', bgClass: 'bg-slate-600', textClass: 'text-slate-600', hex: '#475569' },
];

interface CategoryIconProps {
  iconName?: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, className = 'w-4 h-4' }) => {
  if (!iconName) {
    return <ShoppingBag className={className} />;
  }

  const IconComponent = ICON_MAP[iconName] || ShoppingBag;
  return <IconComponent className={className} />;
};
