import config from '../config/index.js';
import { searchPins, searchBoards } from '../services/pinterest.js';

class PinResult {
  title;

  description;

  link;

  imageUrl;

  constructor({
    title = '',
    description = '',
    link = '',
    imageUrl = '',
  } = {}) {
    this.title = title;
    this.description = description;
    this.link = link;
    this.imageUrl = imageUrl;
  }
}

class BoardResult {
  name;

  description;

  url;

  pinCount;

  constructor({
    name = '',
    description = '',
    url = '',
    pinCount = 0,
  } = {}) {
    this.name = name;
    this.description = description;
    this.url = url;
    this.pinCount = pinCount;
  }
}

class PinterestResults {
  pins;

  boards;

  constructor({ pins = [], boards = [] } = {}) {
    this.pins = pins;
    this.boards = boards;
  }

  toSummaryText() {
    const pinLines = this.pins
      .filter((p) => p.title || p.description)
      .slice(0, 5)
      .map((p, i) => `Pin ${i + 1}: ${p.title || '(無標題)'}${p.description ? ` — ${p.description.slice(0, 80)}` : ''}`)
      .join('\n');
    const boardLines = this.boards
      .filter((b) => b.name)
      .slice(0, 3)
      .map((b) => `Board: ${b.name}${b.description ? ` — ${b.description.slice(0, 60)}` : ''}`)
      .join('\n');
    return [pinLines, boardLines].filter(Boolean).join('\n');
  }

  toPinLinks() {
    return this.pins
      .filter((p) => p.link)
      .slice(0, 5)
      .map((p, i) => `${i + 1}. ${p.title || '(無標題)'}\n   ${p.link}`)
      .join('\n');
  }
}

const parsePins = (items = []) => items.map((item) => new PinResult({
  title: item.title || '',
  description: item.description || '',
  link: item.link || (item.id ? `https://www.pinterest.com/pin/${item.id}/` : ''),
  imageUrl: item.media?.images?.originals?.url || item.media?.images?.['150x150']?.url || '',
}));

const parseBoards = (items = []) => items.map((item) => new BoardResult({
  name: item.name || '',
  description: item.description || '',
  url: item.url || '',
  pinCount: item.pin_count || 0,
}));

const MOCK_DATASETS = {
  default: {
    pins: [
      { title: '北歐簡約客廳', description: '白色基調搭配木質元素，打造溫暖北歐氛圍', link: 'https://www.pinterest.com/pin/demo1/' },
      { title: '北歐風植物裝飾', description: '大量綠植點綴自然感，搭配編織掛毯', link: 'https://www.pinterest.com/pin/demo2/' },
      { title: '北歐臥室設計', description: '中性色系與質感床品，極簡而不失溫度', link: 'https://www.pinterest.com/pin/demo3/' },
    ],
    boards: [
      { name: 'Scandinavian Interiors', description: 'Modern Nordic design ideas', url: 'https://www.pinterest.com/demo/scandinavian/' },
    ],
  },
  '夜市': {
    pins: [
      { title: '台灣夜市霓虹招牌設計', description: '紅黃相間螢光色招牌，手寫毛筆字體與LED燈管混搭，濃厚市井氣息', link: 'https://www.pinterest.com/pin/night-market-1/' },
      { title: '夜市攤位視覺包裝', description: '牛皮紙袋搭配印章LOGO，傳統與街頭文化融合的品牌識別', link: 'https://www.pinterest.com/pin/night-market-2/' },
      { title: 'Taiwan Street Food Brand Identity', description: '以台灣廟宇剪紙紋樣為主視覺，結合現代排版的品牌設計', link: 'https://www.pinterest.com/pin/night-market-3/' },
      { title: '熱炒文化視覺系統', description: '鐵皮屋頂、塑膠椅、喧鬧感轉化為設計語彙的潮流品牌', link: 'https://www.pinterest.com/pin/night-market-4/' },
      { title: '夜市小吃插畫風格', description: '臭豆腐、雞排、珍珠奶茶等元素的Q版插畫包裝設計', link: 'https://www.pinterest.com/pin/night-market-5/' },
    ],
    boards: [
      { name: 'Taiwan Night Market Aesthetics', description: '台灣夜市文化視覺設計合集', url: 'https://www.pinterest.com/demo/taiwan-night-market/' },
      { name: 'Asian Street Food Branding', description: 'Street food visual identities across Asia', url: 'https://www.pinterest.com/demo/street-food-branding/' },
    ],
  },
  '復古': {
    pins: [
      { title: '台灣復古海報設計', description: '1970年代台灣商業海報風格復刻，印刷感紋理與舊色調', link: 'https://www.pinterest.com/pin/retro-tw-1/' },
      { title: '昭和時代雜貨風視覺', description: '日治時代磁磚花色、格子紋路與手繪字體的融合', link: 'https://www.pinterest.com/pin/retro-tw-2/' },
      { title: 'Vintage Taiwan Typography', description: '老台灣黑體字與錯版印刷效果的現代應用', link: 'https://www.pinterest.com/pin/retro-tw-3/' },
    ],
    boards: [
      { name: 'Vintage Taiwan Design', description: 'Nostalgic Taiwanese visual culture', url: 'https://www.pinterest.com/demo/vintage-taiwan/' },
    ],
  },
};

const getMockData = (query) => {
  const key = Object.keys(MOCK_DATASETS).find((k) => k !== 'default' && query.includes(k));
  const dataset = MOCK_DATASETS[key] || MOCK_DATASETS.default;
  return new PinterestResults({
    pins: dataset.pins.map((p) => new PinResult(p)),
    boards: dataset.boards.map((b) => new BoardResult(b)),
  });
};

const fetchPinterestPins = async (query) => {
  if (config.APP_ENV !== 'production' || !config.PINTEREST_ACCESS_TOKEN) {
    return getMockData(query);
  }

  const [pinsRes, boardsRes] = await Promise.allSettled([
    searchPins({ query }),
    searchBoards({ query }),
  ]);

  const pins = pinsRes.status === 'fulfilled' ? parsePins(pinsRes.value.data?.items || []) : [];
  const boards = boardsRes.status === 'fulfilled' ? parseBoards(boardsRes.value.data?.items || []) : [];

  return new PinterestResults({ pins, boards });
};

export {
  PinterestResults,
  fetchPinterestPins,
};

export default fetchPinterestPins;
