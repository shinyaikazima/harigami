/**
 * 張り紙メーカー v0.9.1 - プリセットデータ定義
 */

const PRESETS = [
  {
    id: 'oem',
    title: 'OEM受注可能',
    subtitle: 'Take Orders\nfor OEM',
    icon: '🏭',
    category: 'ビジネス・営業',
    description: '展示会や商談会でOEM対応をアピール'
  },
  {
    id: 'lot',
    title: 'ロット相談可能',
    subtitle: 'Consult\nProduction Lot',
    icon: '📦',
    category: 'ビジネス・営業',
    description: '小ロット〜大ロット対応の訴求に'
  },
  {
    id: 'forsale',
    title: '購入可能',
    subtitle: 'For Sale',
    icon: '🛒',
    category: '販売・店舗',
    description: '展示品や商品の即売アピール'
  },
  {
    id: 'ownfactory',
    title: '自社工場あり',
    subtitle: 'Have Own\nFactory',
    icon: '🏢',
    category: 'ビジネス・営業',
    description: '自社製造・品質の信頼感アピール'
  },
  {
    id: 'newproduct',
    title: '新製品',
    subtitle: 'NEW PRODUCT',
    icon: '✨',
    category: '販売・店舗',
    description: '新製品・新サービスの目立たせ用に'
  },
  {
    id: 'distributor',
    title: '代理店募集',
    subtitle: 'Distributor\nWanted',
    icon: '🤝',
    category: 'ビジネス・営業',
    description: '代理店・パートナー募集アピール'
  },
  {
    id: 'english',
    title: '英語対応可能',
    subtitle: 'English\nAvailable',
    icon: '🌐',
    category: '案内・対応',
    description: '英語での応対・案内が可能であることをアピール'
  },
  {
    id: 'chinese',
    title: '中国語対応可能',
    subtitle: 'Chinese\nAvailable',
    icon: '🈴',
    category: '案内・対応',
    description: '中国語での応対・案内が可能であることをアピール'
  },
  {
    id: 'japanese',
    title: '日本語対応可能',
    subtitle: 'Japanese\nAvailable',
    icon: '🗾',
    category: '案内・対応',
    description: '日本語での応対・案内が可能であることをアピール'
  },
  {
    id: 'japanfirst',
    title: '日本初上陸',
    subtitle: 'First Time\nin Japan',
    icon: '🚀',
    category: '販売・店舗',
    description: '日本初上陸・話題の新商品アピール'
  },
  {
    id: 'soldout',
    title: '売約済',
    subtitle: 'SOLD OUT',
    icon: '🏷️',
    category: '販売・店舗',
    description: '成約済み・完売商品の掲示用'
  },
  {
    id: 'nophoto',
    title: '撮影不可',
    subtitle: 'NO PHOTOGRAPHY',
    icon: '🚫',
    category: '案内・注意',
    description: '試作品や撮影禁止エリアの掲示用'
  },
  {
    id: 'photook',
    title: '撮影OK',
    subtitle: 'PHOTO OK',
    icon: '📷',
    category: '案内・注意',
    description: 'SNS拡散や写真撮影の許可表示'
  },
  {
    id: 'sample',
    title: 'サンプル配布中',
    subtitle: 'FREE SAMPLE',
    icon: '🎁',
    category: '展示会・イベント',
    description: '試供品・配布資料の案内用'
  },
  {
    id: 'consult',
    title: 'お気軽にご相談ください',
    subtitle: 'FEEL FREE\nTO ASK',
    icon: '💬',
    category: '展示会・イベント',
    description: 'ブース呼び込み・相談促進用'
  }
];

const COLOR_PALETTES = [
  { id: 'red', name: 'サンセットレッド', bg: '#E53935', text: '#FFFFFF', isDefault: true },
  { id: 'navy', name: 'ディープネイビー', bg: '#1A237E', text: '#FFFFFF' },
  { id: 'green', name: 'エメラルドグリーン', bg: '#2E7D32', text: '#FFFFFF' },
  { id: 'black', name: '漆黒ブラック', bg: '#18181B', text: '#FFFFFF' },
  { id: 'orange', name: 'ビビッドオレンジ', bg: '#F57C00', text: '#FFFFFF' },
  { id: 'yellow', name: '警告イエロー', bg: '#FBC02D', text: '#18181B' },
  { id: 'white', name: 'シンプルホワイト', bg: '#FFFFFF', text: '#18181B' }
];

const PAPER_SIZES = [
  { id: 'A4', name: 'A4', width: 297, height: 210, label: '297 × 210 mm (標準)' },
  { id: 'A3', name: 'A3', width: 420, height: 297, label: '420 × 297 mm (大型)' },
  { id: 'B4', name: 'B4', width: 364, height: 257, label: '364 × 257 mm (中型)' },
  { id: 'B5', name: 'B5', width: 257, height: 182, label: '257 × 182 mm (小型)' }
];

if (typeof window !== 'undefined') {
  window.PRESETS = PRESETS;
  window.COLOR_PALETTES = COLOR_PALETTES;
  window.PAPER_SIZES = PAPER_SIZES;
}
