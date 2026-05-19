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

const fetchPinterestPins = async (query) => {
  if (config.APP_ENV !== 'production' || !config.PINTEREST_ACCESS_TOKEN) {
    return new PinterestResults({
      pins: [
        new PinResult({ title: '北歐簡約客廳', description: '白色基調搭配木質元素', link: 'https://www.pinterest.com/pin/demo1/' }),
        new PinResult({ title: '北歐風植物裝飾', description: '大量綠植點綴自然感', link: 'https://www.pinterest.com/pin/demo2/' }),
        new PinResult({ title: '北歐臥室設計', description: '中性色系與質感床品', link: 'https://www.pinterest.com/pin/demo3/' }),
      ],
      boards: [
        new BoardResult({ name: 'Scandinavian Interiors', description: 'Modern Nordic design ideas', url: 'https://www.pinterest.com/demo/scandinavian/' }),
      ],
    });
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
