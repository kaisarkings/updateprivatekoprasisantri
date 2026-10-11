import { PrayerSchedule } from '../../types';

const CACHE_KEY_PREFIX = 'koperasi_prayer_cache_';

export interface PrayerAPIResponse {
  code: number;
  message: string;
  data: {
    provinsi: string;
    kabkota: string;
    bulan: number;
    tahun: number;
    jadwal: PrayerSchedule[];
  };
}

export const INDONESIAN_PROVINCES: string[] = [
  'Aceh',
  'Bali',
  'Banten',
  'Bengkulu',
  'D.I. Yogyakarta',
  'DKI Jakarta',
  'Gorontalo',
  'Jambi',
  'Jawa Barat',
  'Jawa Tengah',
  'Jawa Timur',
  'Kalimantan Barat',
  'Kalimantan Selatan',
  'Kalimantan Tengah',
  'Kalimantan Timur',
  'Kalimantan Utara',
  'Kepulauan Bangka Belitung',
  'Kepulauan Riau',
  'Lampung',
  'Maluku',
  'Maluku Utara',
  'Nusa Tenggara Barat',
  'Nusa Tenggara Timur',
  'Papua',
  'Papua Barat',
  'Papua Barat Daya',
  'Papua Pegunungan',
  'Papua Selatan',
  'Papua Tengah',
  'Riau',
  'Sulawesi Barat',
  'Sulawesi Selatan',
  'Sulawesi Tengah',
  'Sulawesi Tenggara',
  'Sulawesi Utara',
  'Sumatera Barat',
  'Sumatera Selatan',
  'Sumatera Utara',
];

export interface CityCoordinate {
  provinsi: string;
  kabkota: string;
  lat: number;
  lon: number;
  timezoneLabel: 'WIB' | 'WITA' | 'WIT';
}

export const CITY_COORDINATES: CityCoordinate[] = [
  // Jawa Tengah
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Banjarnegara', lat: -7.3987, lon: 109.6974, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Banyumas', lat: -7.4550, lon: 109.2818, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Purbalingga', lat: -7.3888, lon: 109.3639, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Cilacap', lat: -7.7180, lon: 109.0159, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Kebumen', lat: -7.6710, lon: 109.6548, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Wonosobo', lat: -7.3636, lon: 109.9000, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Tengah', kabkota: 'Kota Semarang', lat: -6.9666, lon: 110.4166, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Tengah', kabkota: 'Kota Surakarta', lat: -7.5755, lon: 110.8243, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Tengah', kabkota: 'Kota Magelang', lat: -7.4705, lon: 110.2178, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Tengah', kabkota: 'Kota Tegal', lat: -6.8694, lon: 109.1402, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Tengah', kabkota: 'Kota Pekalongan', lat: -6.8886, lon: 109.6753, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Tengah', kabkota: 'Kota Salatiga', lat: -7.3305, lon: 110.5084, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Kudus', lat: -6.8048, lon: 110.8405, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Pati', lat: -6.7494, lon: 111.0379, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Jepara', lat: -6.5944, lon: 110.6789, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Klaten', lat: -7.7056, lon: 110.6014, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Boyolali', lat: -7.5311, lon: 110.5956, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Batang', lat: -6.9075, lon: 109.7303, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Brebes', lat: -6.8703, lon: 109.0435, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Kendal', lat: -6.9249, lon: 110.2039, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Demak', lat: -6.8944, lon: 110.6385, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Pemalang', lat: -6.8924, lon: 109.3813, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Purworejo', lat: -7.7149, lon: 110.0076, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Temanggung', lat: -7.3168, lon: 110.1772, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Sukoharjo', lat: -7.6833, lon: 110.8333, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Karanganyar', lat: -7.5961, lon: 110.9515, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Sragen', lat: -7.4269, lon: 111.0224, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Wonogiri', lat: -7.8159, lon: 110.9255, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Rembang', lat: -6.7108, lon: 111.3411, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Tengah', kabkota: 'Kab. Blora', lat: -6.9698, lon: 111.4184, timezoneLabel: 'WIB' },

  // Jawa Barat
  { provinsi: 'Jawa Barat', kabkota: 'Kota Bandung', lat: -6.9175, lon: 107.6191, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Barat', kabkota: 'Kab. Bandung', lat: -7.0252, lon: 107.5198, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Barat', kabkota: 'Kab. Bandung Barat', lat: -6.8432, lon: 107.4939, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Barat', kabkota: 'Kota Cimahi', lat: -6.8722, lon: 107.5422, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Barat', kabkota: 'Kota Bogor', lat: -6.5971, lon: 106.8060, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Barat', kabkota: 'Kab. Bogor', lat: -6.5518, lon: 106.6291, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Barat', kabkota: 'Kota Bekasi', lat: -6.2383, lon: 106.9756, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Barat', kabkota: 'Kab. Bekasi', lat: -6.2482, lon: 107.1472, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Barat', kabkota: 'Kota Depok', lat: -6.4025, lon: 106.7942, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Barat', kabkota: 'Kota Cirebon', lat: -6.7320, lon: 108.5523, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Barat', kabkota: 'Kab. Cirebon', lat: -6.7616, lon: 108.4799, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Barat', kabkota: 'Kota Sukabumi', lat: -6.9277, lon: 106.9300, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Barat', kabkota: 'Kab. Sukabumi', lat: -7.0506, lon: 106.7139, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Barat', kabkota: 'Kota Tasikmalaya', lat: -7.3274, lon: 108.2207, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Barat', kabkota: 'Kab. Tasikmalaya', lat: -7.3506, lon: 108.1130, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Barat', kabkota: 'Kab. Garut', lat: -7.2279, lon: 107.9086, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Barat', kabkota: 'Kab. Ciamis', lat: -7.3255, lon: 108.3533, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Barat', kabkota: 'Kota Banjar', lat: -7.3687, lon: 108.5323, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Barat', kabkota: 'Kab. Pangandaran', lat: -7.7034, lon: 108.4947, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Barat', kabkota: 'Kab. Karawang', lat: -6.3042, lon: 107.3072, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Barat', kabkota: 'Kab. Purwakarta', lat: -6.5569, lon: 107.4433, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Barat', kabkota: 'Kab. Subang', lat: -6.5590, lon: 107.7607, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Barat', kabkota: 'Kab. Indramayu', lat: -6.3264, lon: 108.3200, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Barat', kabkota: 'Kab. Majalengka', lat: -6.8361, lon: 108.2278, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Barat', kabkota: 'Kab. Kuningan', lat: -6.9764, lon: 108.4831, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Barat', kabkota: 'Kab. Sumedang', lat: -6.8586, lon: 107.9266, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Barat', kabkota: 'Kab. Cianjur', lat: -6.8222, lon: 107.1394, timezoneLabel: 'WIB' },

  // DKI Jakarta & Banten
  { provinsi: 'DKI Jakarta', kabkota: 'Jakarta Pusat', lat: -6.1805, lon: 106.8284, timezoneLabel: 'WIB' },
  { provinsi: 'DKI Jakarta', kabkota: 'Jakarta Selatan', lat: -6.2615, lon: 106.8106, timezoneLabel: 'WIB' },
  { provinsi: 'DKI Jakarta', kabkota: 'Jakarta Timur', lat: -6.2250, lon: 106.9004, timezoneLabel: 'WIB' },
  { provinsi: 'DKI Jakarta', kabkota: 'Jakarta Barat', lat: -6.1683, lon: 106.7588, timezoneLabel: 'WIB' },
  { provinsi: 'DKI Jakarta', kabkota: 'Jakarta Utara', lat: -6.1384, lon: 106.8640, timezoneLabel: 'WIB' },
  { provinsi: 'DKI Jakarta', kabkota: 'Kota Jakarta', lat: -6.2088, lon: 106.8456, timezoneLabel: 'WIB' },
  { provinsi: 'Banten', kabkota: 'Kota Tangerang', lat: -6.1783, lon: 106.6319, timezoneLabel: 'WIB' },
  { provinsi: 'Banten', kabkota: 'Kota Tangerang Selatan', lat: -6.2888, lon: 106.7179, timezoneLabel: 'WIB' },
  { provinsi: 'Banten', kabkota: 'Kab. Tangerang', lat: -6.1969, lon: 106.4914, timezoneLabel: 'WIB' },
  { provinsi: 'Banten', kabkota: 'Kota Serang', lat: -6.1104, lon: 106.1640, timezoneLabel: 'WIB' },
  { provinsi: 'Banten', kabkota: 'Kab. Serang', lat: -6.1200, lon: 106.0100, timezoneLabel: 'WIB' },
  { provinsi: 'Banten', kabkota: 'Kota Cilegon', lat: -6.0174, lon: 106.0538, timezoneLabel: 'WIB' },
  { provinsi: 'Banten', kabkota: 'Kab. Pandeglang', lat: -6.3084, lon: 106.1065, timezoneLabel: 'WIB' },
  { provinsi: 'Banten', kabkota: 'Kab. Lebak', lat: -6.6111, lon: 106.2167, timezoneLabel: 'WIB' },

  // D.I. Yogyakarta
  { provinsi: 'D.I. Yogyakarta', kabkota: 'Kota Yogyakarta', lat: -7.7956, lon: 110.3695, timezoneLabel: 'WIB' },
  { provinsi: 'D.I. Yogyakarta', kabkota: 'Kab. Sleman', lat: -7.7161, lon: 110.3556, timezoneLabel: 'WIB' },
  { provinsi: 'D.I. Yogyakarta', kabkota: 'Kab. Bantul', lat: -7.8890, lon: 110.3289, timezoneLabel: 'WIB' },
  { provinsi: 'D.I. Yogyakarta', kabkota: 'Kab. Gunungkidul', lat: -7.9622, lon: 110.6033, timezoneLabel: 'WIB' },
  { provinsi: 'D.I. Yogyakarta', kabkota: 'Kab. Kulon Progo', lat: -7.7816, lon: 110.1600, timezoneLabel: 'WIB' },

  // Jawa Timur
  { provinsi: 'Jawa Timur', kabkota: 'Kota Surabaya', lat: -7.2575, lon: 112.7521, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kota Malang', lat: -7.9666, lon: 112.6326, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kab. Malang', lat: -8.1667, lon: 112.6667, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kota Batu', lat: -7.8712, lon: 112.5273, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kab. Sidoarjo', lat: -7.4478, lon: 112.7183, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kab. Gresik', lat: -7.1566, lon: 112.6555, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kota Kediri', lat: -7.8167, lon: 112.0167, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kab. Kediri', lat: -7.8480, lon: 112.1640, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kota Madiun', lat: -7.6298, lon: 111.5239, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kab. Madiun', lat: -7.5489, lon: 111.6548, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kota Pasuruan', lat: -7.6453, lon: 112.9075, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kab. Pasuruan', lat: -7.7289, lon: 112.8368, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kota Probolinggo', lat: -7.7543, lon: 113.2159, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kab. Probolinggo', lat: -7.8433, lon: 113.3167, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kota Blitar', lat: -8.0983, lon: 112.1681, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kab. Blitar', lat: -8.1333, lon: 112.2500, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kab. Banyuwangi', lat: -8.2192, lon: 114.3691, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kab. Jember', lat: -8.1724, lon: 113.7007, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kab. Bojonegoro', lat: -7.1502, lon: 111.8817, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kab. Tuban', lat: -6.8972, lon: 112.0649, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kab. Lamongan', lat: -7.1205, lon: 112.4158, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kab. Jombang', lat: -7.5460, lon: 112.2331, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kota Mojokerto', lat: -7.4726, lon: 112.4381, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kab. Mojokerto', lat: -7.5500, lon: 112.5000, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kab. Nganjuk', lat: -7.6047, lon: 111.9042, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kab. Tulungagung', lat: -8.0667, lon: 111.9000, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kab. Trenggalek', lat: -8.0500, lon: 111.7167, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kab. Ponorogo', lat: -7.8686, lon: 111.4623, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kab. Pacitan', lat: -8.2069, lon: 111.0921, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kab. Lumajang', lat: -8.1333, lon: 113.2167, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kab. Bangkalan', lat: -7.0306, lon: 112.7486, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kab. Sampang', lat: -7.1867, lon: 113.2394, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kab. Pamekasan', lat: -7.1608, lon: 113.4828, timezoneLabel: 'WIB' },
  { provinsi: 'Jawa Timur', kabkota: 'Kab. Sumenep', lat: -7.0167, lon: 113.8667, timezoneLabel: 'WIB' },

  // Bali & Nusa Tenggara (WITA)
  { provinsi: 'Bali', kabkota: 'Kota Denpasar', lat: -8.6705, lon: 115.2126, timezoneLabel: 'WITA' },
  { provinsi: 'Bali', kabkota: 'Kab. Badung', lat: -8.5819, lon: 115.1772, timezoneLabel: 'WITA' },
  { provinsi: 'Bali', kabkota: 'Kab. Gianyar', lat: -8.5444, lon: 115.3267, timezoneLabel: 'WITA' },
  { provinsi: 'Bali', kabkota: 'Kab. Buleleng', lat: -8.1120, lon: 115.0882, timezoneLabel: 'WITA' },
  { provinsi: 'Bali', kabkota: 'Kab. Tabanan', lat: -8.5392, lon: 115.1242, timezoneLabel: 'WITA' },
  { provinsi: 'Nusa Tenggara Barat', kabkota: 'Kota Mataram', lat: -8.5833, lon: 116.1167, timezoneLabel: 'WITA' },
  { provinsi: 'Nusa Tenggara Barat', kabkota: 'Kab. Lombok Barat', lat: -8.6833, lon: 116.1333, timezoneLabel: 'WITA' },
  { provinsi: 'Nusa Tenggara Barat', kabkota: 'Kab. Lombok Tengah', lat: -8.7000, lon: 116.2833, timezoneLabel: 'WITA' },
  { provinsi: 'Nusa Tenggara Barat', kabkota: 'Kab. Lombok Timur', lat: -8.6500, lon: 116.5333, timezoneLabel: 'WITA' },
  { provinsi: 'Nusa Tenggara Barat', kabkota: 'Kab. Sumbawa', lat: -8.5000, lon: 117.4333, timezoneLabel: 'WITA' },
  { provinsi: 'Nusa Tenggara Barat', kabkota: 'Kota Bima', lat: -8.4608, lon: 118.7269, timezoneLabel: 'WITA' },
  { provinsi: 'Nusa Tenggara Timur', kabkota: 'Kota Kupang', lat: -10.1772, lon: 123.6070, timezoneLabel: 'WITA' },
  { provinsi: 'Nusa Tenggara Timur', kabkota: 'Kab. Manggarai Barat', lat: -8.5912, lon: 119.9723, timezoneLabel: 'WITA' },
  { provinsi: 'Nusa Tenggara Timur', kabkota: 'Kab. Ende', lat: -8.8432, lon: 121.6623, timezoneLabel: 'WITA' },
  { provinsi: 'Nusa Tenggara Timur', kabkota: 'Kab. Sikka', lat: -8.6212, lon: 122.2111, timezoneLabel: 'WITA' },

  // Sumatera
  { provinsi: 'Sumatera Utara', kabkota: 'Kota Medan', lat: 3.5952, lon: 98.6722, timezoneLabel: 'WIB' },
  { provinsi: 'Sumatera Utara', kabkota: 'Kab. Deli Serdang', lat: 3.5500, lon: 98.7167, timezoneLabel: 'WIB' },
  { provinsi: 'Sumatera Utara', kabkota: 'Kota Binjai', lat: 3.6000, lon: 98.4833, timezoneLabel: 'WIB' },
  { provinsi: 'Sumatera Utara', kabkota: 'Kota Pematangsiantar', lat: 2.9583, lon: 99.0667, timezoneLabel: 'WIB' },
  { provinsi: 'Sumatera Barat', kabkota: 'Kota Padang', lat: -0.9471, lon: 100.4172, timezoneLabel: 'WIB' },
  { provinsi: 'Sumatera Barat', kabkota: 'Kota Bukittinggi', lat: -0.3056, lon: 100.3694, timezoneLabel: 'WIB' },
  { provinsi: 'Sumatera Selatan', kabkota: 'Kota Palembang', lat: -2.9761, lon: 104.7754, timezoneLabel: 'WIB' },
  { provinsi: 'Sumatera Selatan', kabkota: 'Kota Lubuklinggau', lat: -3.2936, lon: 102.8617, timezoneLabel: 'WIB' },
  { provinsi: 'Riau', kabkota: 'Kota Pekanbaru', lat: 0.5071, lon: 101.4478, timezoneLabel: 'WIB' },
  { provinsi: 'Riau', kabkota: 'Kota Dumai', lat: 1.6667, lon: 101.4500, timezoneLabel: 'WIB' },
  { provinsi: 'Kepulauan Riau', kabkota: 'Kota Batam', lat: 1.1301, lon: 104.0529, timezoneLabel: 'WIB' },
  { provinsi: 'Kepulauan Riau', kabkota: 'Kota Tanjung Pinang', lat: 0.9167, lon: 104.4500, timezoneLabel: 'WIB' },
  { provinsi: 'Lampung', kabkota: 'Kota Bandar Lampung', lat: -5.4292, lon: 105.2611, timezoneLabel: 'WIB' },
  { provinsi: 'Lampung', kabkota: 'Kota Metro', lat: -5.1139, lon: 105.3067, timezoneLabel: 'WIB' },
  { provinsi: 'Aceh', kabkota: 'Kota Banda Aceh', lat: 5.5483, lon: 95.3238, timezoneLabel: 'WIB' },
  { provinsi: 'Aceh', kabkota: 'Kota Lhokseumawe', lat: 5.1804, lon: 97.1408, timezoneLabel: 'WIB' },
  { provinsi: 'Jambi', kabkota: 'Kota Jambi', lat: -1.6101, lon: 103.6131, timezoneLabel: 'WIB' },
  { provinsi: 'Bengkulu', kabkota: 'Kota Bengkulu', lat: -3.8004, lon: 102.2655, timezoneLabel: 'WIB' },
  { provinsi: 'Kepulauan Bangka Belitung', kabkota: 'Kota Pangkal Pinang', lat: -2.1333, lon: 106.1167, timezoneLabel: 'WIB' },

  // Kalimantan
  { provinsi: 'Kalimantan Timur', kabkota: 'Kota Samarinda', lat: -0.5016, lon: 117.1265, timezoneLabel: 'WITA' },
  { provinsi: 'Kalimantan Timur', kabkota: 'Kota Balikpapan', lat: -1.2379, lon: 116.8289, timezoneLabel: 'WITA' },
  { provinsi: 'Kalimantan Timur', kabkota: 'Kota Bontang', lat: 0.1333, lon: 117.5000, timezoneLabel: 'WITA' },
  { provinsi: 'Kalimantan Timur', kabkota: 'Kab. Kutai Kartanegara', lat: -0.4414, lon: 117.0044, timezoneLabel: 'WITA' },
  { provinsi: 'Kalimantan Selatan', kabkota: 'Kota Banjarmasin', lat: -3.3167, lon: 114.5901, timezoneLabel: 'WITA' },
  { provinsi: 'Kalimantan Selatan', kabkota: 'Kota Banjarbaru', lat: -3.4400, lon: 114.8300, timezoneLabel: 'WITA' },
  { provinsi: 'Kalimantan Barat', kabkota: 'Kota Pontianak', lat: -0.0263, lon: 109.3425, timezoneLabel: 'WIB' },
  { provinsi: 'Kalimantan Barat', kabkota: 'Kota Singkawang', lat: 0.9083, lon: 108.9833, timezoneLabel: 'WIB' },
  { provinsi: 'Kalimantan Tengah', kabkota: 'Kota Palangka Raya', lat: -2.2088, lon: 113.9165, timezoneLabel: 'WIB' },
  { provinsi: 'Kalimantan Utara', kabkota: 'Kota Tarakan', lat: 3.3000, lon: 117.6333, timezoneLabel: 'WITA' },

  // Sulawesi (WITA)
  { provinsi: 'Sulawesi Selatan', kabkota: 'Kota Makassar', lat: -5.1477, lon: 119.4327, timezoneLabel: 'WITA' },
  { provinsi: 'Sulawesi Selatan', kabkota: 'Kota Parepare', lat: -4.0131, lon: 119.6247, timezoneLabel: 'WITA' },
  { provinsi: 'Sulawesi Selatan', kabkota: 'Kota Palopo', lat: -2.9942, lon: 120.1969, timezoneLabel: 'WITA' },
  { provinsi: 'Sulawesi Selatan', kabkota: 'Kab. Gowa', lat: -5.2000, lon: 119.4500, timezoneLabel: 'WITA' },
  { provinsi: 'Sulawesi Selatan', kabkota: 'Kab. Maros', lat: -5.0000, lon: 119.5667, timezoneLabel: 'WITA' },
  { provinsi: 'Sulawesi Utara', kabkota: 'Kota Manado', lat: 1.4748, lon: 124.8428, timezoneLabel: 'WITA' },
  { provinsi: 'Sulawesi Utara', kabkota: 'Kota Bitung', lat: 1.4449, lon: 125.1873, timezoneLabel: 'WITA' },
  { provinsi: 'Sulawesi Tengah', kabkota: 'Kota Palu', lat: -0.9000, lon: 119.8333, timezoneLabel: 'WITA' },
  { provinsi: 'Sulawesi Tenggara', kabkota: 'Kota Kendari', lat: -3.9722, lon: 122.5833, timezoneLabel: 'WITA' },
  { provinsi: 'Gorontalo', kabkota: 'Kota Gorontalo', lat: 0.5435, lon: 123.0568, timezoneLabel: 'WITA' },
  { provinsi: 'Sulawesi Barat', kabkota: 'Kab. Mamuju', lat: -2.6789, lon: 118.8890, timezoneLabel: 'WITA' },

  // Papua & Indonesia Timur (WIT)
  { provinsi: 'Papua', kabkota: 'Kota Jayapura', lat: -2.5337, lon: 140.7181, timezoneLabel: 'WIT' },
  { provinsi: 'Papua', kabkota: 'Kab. Jayapura', lat: -2.8021, lon: 139.9892, timezoneLabel: 'WIT' },
  { provinsi: 'Papua Selatan', kabkota: 'Kab. Merauke', lat: -8.4991, lon: 140.4045, timezoneLabel: 'WIT' },
  { provinsi: 'Papua Barat Daya', kabkota: 'Kota Sorong', lat: -0.8762, lon: 131.2558, timezoneLabel: 'WIT' },
  { provinsi: 'Papua Barat', kabkota: 'Kab. Manokwari', lat: -0.8614, lon: 134.0620, timezoneLabel: 'WIT' },
  { provinsi: 'Papua Tengah', kabkota: 'Kab. Nabire', lat: -3.3664, lon: 135.4967, timezoneLabel: 'WIT' },
  { provinsi: 'Papua Tengah', kabkota: 'Kab. Mimika', lat: -4.5447, lon: 136.8872, timezoneLabel: 'WIT' },
  { provinsi: 'Papua Pegunungan', kabkota: 'Kab. Jayawijaya', lat: -4.0833, lon: 138.9500, timezoneLabel: 'WIT' },
  { provinsi: 'Maluku', kabkota: 'Kota Ambon', lat: -3.6554, lon: 128.1908, timezoneLabel: 'WIT' },
  { provinsi: 'Maluku Utara', kabkota: 'Kota Ternate', lat: 0.7906, lon: 127.3820, timezoneLabel: 'WIT' },
  { provinsi: 'Maluku Utara', kabkota: 'Kota Tidore Kepulauan', lat: 0.6908, lon: 127.4042, timezoneLabel: 'WIT' },
];

/**
 * Fetch available cities/regencies for a given province
 */
export async function fetchCitiesForProvince(provinsi: string): Promise<string[]> {
  const matched = CITY_COORDINATES.filter(
    (c) => c.provinsi.toLowerCase() === provinsi.toLowerCase()
  ).map((c) => c.kabkota);

  if (matched.length > 0) {
    return Array.from(new Set(matched));
  }

  // Fallback to all cities in coordinate list
  return CITY_COORDINATES.map((c) => c.kabkota);
}

/**
 * Determine Indonesian timezone from longitude
 */
export function getTimezoneFromLon(lon: number): { timezone: string; timezoneLabel: 'WIB' | 'WITA' | 'WIT' } {
  if (lon >= 120.5) {
    return { timezone: 'Asia/Jayapura', timezoneLabel: 'WIT' };
  } else if (lon >= 114.5) {
    return { timezone: 'Asia/Makassar', timezoneLabel: 'WITA' };
  } else {
    return { timezone: 'Asia/Jakarta', timezoneLabel: 'WIB' };
  }
}

/**
 * Calculate distance between two coordinates in kilometers using Haversine formula
 */
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find nearest Indonesian city from GPS latitude and longitude
 */
export function findNearestCityFromCoords(lat: number, lon: number): CityCoordinate {
  let minDistance = Infinity;
  let nearest = CITY_COORDINATES[0];

  for (const city of CITY_COORDINATES) {
    const dist = getDistanceKm(lat, lon, city.lat, city.lon);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = city;
    }
  }

  return nearest;
}

export interface ReverseGeocodeResult {
  provinsi: string;
  kabkota: string;
  locationName: string;
  timezone: string;
  timezoneLabel: 'WIB' | 'WITA' | 'WIT';
  kampung?: string;
  subLocality?: string;
  district?: string;
  detailedAddress?: string;
}

/**
 * Attempt reverse geocoding with OpenStreetMap Nominatim or BigDataCloud,
 * and fallback to closest coordinate if network is limited
 */
export async function reverseGeocodeGPS(
  lat: number,
  lon: number
): Promise<ReverseGeocodeResult> {
  const nearest = findNearestCityFromCoords(lat, lon);
  const tzInfo = getTimezoneFromLon(lon);

  // 1. Try OpenStreetMap Nominatim (High precision for Indonesian cities)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=id`,
      {
        signal: controller.signal,
        headers: { 'User-Agent': 'KoperasiSantriPesantren/1.0' },
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const cityName = addr.city || addr.county || addr.municipality || addr.town || addr.state_district || '';
      const stateName = addr.state || '';

      if (stateName || cityName) {
        const matchedProv = INDONESIAN_PROVINCES.find(
          (p) => stateName && (stateName.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(stateName.toLowerCase()))
        ) || (stateName || nearest.provinsi);

        const cleanKabkota = cityName.startsWith('Kota') || cityName.startsWith('Kab')
          ? cityName
          : `Kota/Kab. ${cityName || nearest.kabkota}`;

        return {
          provinsi: matchedProv,
          kabkota: cleanKabkota,
          locationName: `${cleanKabkota}, ${matchedProv}`,
          timezone: tzInfo.timezone,
          timezoneLabel: tzInfo.timezoneLabel,
        };
      }
    }
  } catch {
    // Continue to next fallback
  }

  // 2. Try BigDataCloud Client Reverse Geocode (Fast & reliable)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.principalSubdivisionDistrict || '';
      const state = data.principalSubdivision || '';

      if (city || state) {
        const matchedProv = INDONESIAN_PROVINCES.find(
          (p) => state && (state.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(state.toLowerCase()))
        ) || (state || nearest.provinsi);

        const cleanKabkota = city.startsWith('Kota') || city.startsWith('Kab')
          ? city
          : `Kota/Kab. ${city || nearest.kabkota}`;

        return {
          provinsi: matchedProv,
          kabkota: cleanKabkota,
          locationName: `${cleanKabkota}, ${matchedProv}`,
          timezone: tzInfo.timezone,
          timezoneLabel: tzInfo.timezoneLabel,
        };
      }
    }
  } catch {
    // Continue to nearest city fallback
  }

  // 3. Fallback to closest pre-mapped city coordinate
  return {
    provinsi: nearest.provinsi,
    kabkota: nearest.kabkota,
    locationName: `${nearest.kabkota}, ${nearest.provinsi}`,
    timezone: tzInfo.timezone,
    timezoneLabel: nearest.timezoneLabel,
  };
}

/**
 * Fetch monthly prayer times from Aladhan API (using exact GPS coordinates & Kemenag Method 20)
 * with automatic fallback to equran.id
 */
export async function fetchPrayerTimes(
  provinsi: string,
  kabkota: string,
  bulan: number,
  tahun: number,
  lat?: number,
  lon?: number
): Promise<PrayerSchedule[]> {
  // If coordinates not given, find from CITY_COORDINATES
  let queryLat = lat;
  let queryLon = lon;

  if (queryLat === undefined || queryLon === undefined) {
    const matched = CITY_COORDINATES.find(
      (c) =>
        c.kabkota.toLowerCase().includes(kabkota.toLowerCase()) ||
        kabkota.toLowerCase().includes(c.kabkota.toLowerCase())
    );
    if (matched) {
      queryLat = matched.lat;
      queryLon = matched.lon;
    } else {
      const provMatch = CITY_COORDINATES.find(
        (c) => c.provinsi.toLowerCase() === provinsi.toLowerCase()
      );
      if (provMatch) {
        queryLat = provMatch.lat;
        queryLon = provMatch.lon;
      } else {
        queryLat = -7.3987;
        queryLon = 109.6974;
      }
    }
  }

  const cacheKey = `${CACHE_KEY_PREFIX}${queryLat.toFixed(2)}_${queryLon.toFixed(2)}_${bulan}_${tahun}`;

  // Check cache first
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as PrayerSchedule[];
      }
    }
  } catch {}

  const tzInfo = getTimezoneFromLon(queryLon);

  // 1. Primary: Fetch from Aladhan API (Kemenag RI Method 20, exact GPS lat/lon anywhere in Indonesia)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const aladhanUrl = `https://api.aladhan.com/v1/calendar/${tahun}/${bulan}?latitude=${queryLat}&longitude=${queryLon}&method=20`;
    const res = await fetch(aladhanUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json.code === 200 && Array.isArray(json.data) && json.data.length > 0) {
        const INDO_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

        const schedules: PrayerSchedule[] = json.data.map((item: any) => {
          const greg = item.date?.gregorian || {};
          const dayNum = parseInt(greg.day, 10) || 1;
          const monthNum = parseInt(greg.month?.number, 10) || bulan;
          const yearNum = parseInt(greg.year, 10) || tahun;

          const dateObj = new Date(yearNum, monthNum - 1, dayNum);
          const dayName = INDO_DAYS[dateObj.getDay()] || 'Senin';
          const fullDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

          const cleanTime = (tStr: string) => {
            const m = (tStr || '').match(/(\d{2}:\d{2})/);
            return m ? m[1] : tStr || '00:00';
          };

          const timings = item.timings || {};
          const subuhTime = cleanTime(timings.Fajr);
          const terbitTime = cleanTime(timings.Sunrise);

          // Imsak: Standard Kemenag RI is 10 minutes before Subuh
          let imsakTime = cleanTime(timings.Imsak);
          if (!imsakTime || imsakTime === '00:00' || imsakTime === subuhTime) {
            const [sh, sm] = (subuhTime || '04:30').split(':').map((n) => parseInt(n, 10) || 0);
            let totalMins = sh * 60 + sm - 10;
            if (totalMins < 0) totalMins += 24 * 60;
            const ih = Math.floor(totalMins / 60);
            const im = totalMins % 60;
            imsakTime = `${String(ih).padStart(2, '0')}:${String(im).padStart(2, '0')}`;
          }

          // Dhuha: Starts ~25 minutes after Sunrise (Syuruq)
          const [th, tm] = (terbitTime || '05:45').split(':').map((n) => parseInt(n, 10) || 0);
          const dhuhaTotal = th * 60 + tm + 25;
          const dh = Math.floor((dhuhaTotal % (24 * 60)) / 60);
          const dm = dhuhaTotal % 60;
          const dhuhaTime = `${String(dh).padStart(2, '0')}:${String(dm).padStart(2, '0')}`;

          return {
            tanggal: dayNum,
            tanggal_lengkap: fullDate,
            hari: dayName,
            imsak: imsakTime,
            subuh: subuhTime,
            terbit: terbitTime,
            dhuha: dhuhaTime,
            dzuhur: cleanTime(timings.Dhuhr),
            ashar: cleanTime(timings.Asr),
            maghrib: cleanTime(timings.Maghrib),
            isya: cleanTime(timings.Isha),
            timezone_label: tzInfo.timezoneLabel,
          };
        });

        try {
          localStorage.setItem(cacheKey, JSON.stringify(schedules));
        } catch {}

        return schedules;
      }
    }
  } catch (err) {
    console.warn('Aladhan API fetch error, trying equran.id fallback:', err);
  }

  // 2. Fallback: equran.id API
  try {
    const res = await fetch('https://equran.id/api/v2/shalat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provinsi, kabkota, bulan, tahun }),
    });

    if (res.ok) {
      const json: PrayerAPIResponse = await res.json();
      if (json.code === 200 && json.data && json.data.jadwal) {
        const enriched = json.data.jadwal.map((j) => ({
          ...j,
          timezone_label: tzInfo.timezoneLabel,
        }));
        try {
          localStorage.setItem(cacheKey, JSON.stringify(enriched));
        } catch {}
        return enriched;
      }
    }
  } catch (e) {
    console.warn('equran.id fallback failed:', e);
  }

  // 3. Fallback: Astronomical Solar Algorithm (Guaranteed offline / 100% uptime fallback)
  try {
    const tzOffset = tzInfo.timezoneLabel === 'WIT' ? 9 : tzInfo.timezoneLabel === 'WITA' ? 8 : 7;
    const computedSchedules = generateAstronomicalMonthSchedules(
      queryLat,
      queryLon,
      tahun,
      bulan,
      tzOffset,
      tzInfo.timezoneLabel
    );
    if (computedSchedules.length > 0) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(computedSchedules));
      } catch {}
      return computedSchedules;
    }
  } catch (err) {
    console.warn('Astronomical fallback calculation error:', err);
  }

  throw new Error(`Tidak dapat memuat jadwal shalat untuk wilayah ${kabkota}, ${provinsi}.`);
}

/**
 * Astronomical Solar Calculation based on Kemenag RI standards:
 * Fajr: -20°, Isha: -18°, Asr: Shafi'i shadow factor 1.0, 2-3 mins safety margin (ihtiyat).
 * Guarantees zero downtime even if offline or 3rd-party APIs are down.
 */
export function generateAstronomicalMonthSchedules(
  lat: number,
  lon: number,
  year: number,
  month: number,
  tzOffset: number,
  tzLabel: 'WIB' | 'WITA' | 'WIT'
): PrayerSchedule[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const INDO_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const results: PrayerSchedule[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month - 1, d);
    const dayName = INDO_DAYS[dateObj.getDay()] || 'Senin';
    const fullDate = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    // Day of Year
    const startOfYear = new Date(year, 0, 1);
    const dayOfYear = Math.floor((dateObj.getTime() - startOfYear.getTime()) / 86400000) + 1;

    // Solar calculation
    const rad = Math.PI / 180;
    const deg = 180 / Math.PI;

    // Solar Declination (degrees)
    const b = (360 / 365) * (dayOfYear - 81) * rad;
    const declination = 23.45 * Math.sin(b);

    // Equation of Time (minutes)
    const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);

    // Solar Transit (Noon in local standard time)
    const transit = 12 + tzOffset - lon / 15 - eot / 60;

    // Hour angle helper for altitude angle alpha
    const getHourAngle = (alphaDeg: number): number => {
      const cosH =
        (Math.sin(alphaDeg * rad) - Math.sin(lat * rad) * Math.sin(declination * rad)) /
        (Math.cos(lat * rad) * Math.cos(declination * rad));
      const clamped = Math.max(-1, Math.min(1, cosH));
      return Math.acos(clamped) * deg / 15;
    };

    // 1. Subuh (Fajr: -20° Kemenag RI)
    const hFajr = getHourAngle(-20);
    const subuhHours = transit - hFajr + 2 / 60; // +2 mins ihtiyat

    // 2. Terbit (Sunrise: -0.833°)
    const hSunrise = getHourAngle(-0.833);
    const terbitHours = transit - hSunrise;

    // 3. Dzuhur (Noon + 2 mins ihtiyat)
    const dzuhurHours = transit + 2 / 60;

    // 4. Ashar (Shadow factor = 1.0)
    const asrAltitude = Math.atan(1 / (1 + Math.tan(Math.abs(lat - declination) * rad))) * deg;
    const hAsr = getHourAngle(asrAltitude);
    const asharHours = transit + hAsr + 2 / 60;

    // 5. Maghrib (Sunset: -0.833° + 2 mins ihtiyat)
    const maghribHours = transit + hSunrise + 2 / 60;

    // 6. Isya (Isha: -18° Kemenag RI + 2 mins ihtiyat)
    const hIsha = getHourAngle(-18);
    const isyaHours = transit + hIsha + 2 / 60;

    // 7. Imsak (10 mins before Subuh)
    const imsakHours = subuhHours - 10 / 60;

    // 8. Dhuha (25 mins after sunrise)
    const dhuhaHours = terbitHours + 25 / 60;

    const formatTime = (hDecimal: number): string => {
      let totalMinutes = Math.round(hDecimal * 60);
      if (totalMinutes < 0) totalMinutes += 24 * 60;
      if (totalMinutes >= 24 * 60) totalMinutes -= 24 * 60;
      const hh = Math.floor(totalMinutes / 60);
      const mm = totalMinutes % 60;
      return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    };

    results.push({
      tanggal: d,
      tanggal_lengkap: fullDate,
      hari: dayName,
      imsak: formatTime(imsakHours),
      subuh: formatTime(subuhHours),
      terbit: formatTime(terbitHours),
      dhuha: formatTime(dhuhaHours),
      dzuhur: formatTime(dzuhurHours),
      ashar: formatTime(asharHours),
      maghrib: formatTime(maghribHours),
      isya: formatTime(isyaHours),
      timezone_label: tzLabel,
    });
  }

  return results;
}

export function getTodayPrayer(jadwalBulanan: PrayerSchedule[], date: Date): PrayerSchedule | null {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const targetDate = `${year}-${month}-${day}`;

  return jadwalBulanan.find((j) => j.tanggal_lengkap === targetDate) || jadwalBulanan[0] || null;
}
