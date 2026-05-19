import { describe, it, expect } from '@jest/globals';
import { PinterestResults } from '../utils/fetch-pinterest-pins.js';
import fetchPinterestPins from '../utils/fetch-pinterest-pins.js';

const TOPIC = '台灣夜市風的設計視覺';

describe('Pinterest 設計創意器 — 台灣夜市風', () => {
  it('應取得夜市相關 Pinterest 資料', async () => {
    const results = await fetchPinterestPins(TOPIC);
    expect(results).toBeInstanceOf(PinterestResults);
    expect(results.pins.length).toBeGreaterThan(0);
    expect(results.boards.length).toBeGreaterThan(0);
  });

  it('所有 Pin 應有標題或描述', async () => {
    const results = await fetchPinterestPins(TOPIC);
    results.pins.forEach((pin) => {
      expect(pin.title || pin.description).toBeTruthy();
    });
  });

  it('所有 Pin 應有 Pinterest 連結', async () => {
    const results = await fetchPinterestPins(TOPIC);
    results.pins.forEach((pin) => {
      expect(pin.link).toMatch(/^https:\/\/www\.pinterest\.com/);
    });
  });

  it('toSummaryText() 應生成可讀的摘要文字', async () => {
    const results = await fetchPinterestPins(TOPIC);
    const summary = results.toSummaryText();
    expect(summary).toBeTruthy();
    expect(summary).toContain('Pin 1:');
    console.log('\n=== Pinterest 摘要文字（將送入 AI 分析）===\n');
    console.log(summary);
  });

  it('toPinLinks() 應生成格式化連結清單', async () => {
    const results = await fetchPinterestPins(TOPIC);
    const links = results.toPinLinks();
    expect(links).toBeTruthy();
    expect(links).toContain('1.');
    console.log('\n=== 推薦 Pinterest 連結 ===\n');
    console.log(links);
  });

  it('AI 推薦模式 Prompt 應包含主題與 Pinterest 資料', async () => {
    const results = await fetchPinterestPins(TOPIC);
    const summary = results.toSummaryText();
    const prompt = `以下是 Pinterest 上關於「${TOPIC}」的精選內容：\n\n${summary}\n\n請根據這些 Pinterest 靈感，分析主要設計風格與元素，並推薦 3-5 個具體的創意方向，說明如何將這些靈感應用於實際設計中。`;
    expect(prompt).toContain(TOPIC);
    expect(prompt).toContain('Pin 1:');
    console.log('\n=== 完整 AI Prompt（推薦模式）===\n');
    console.log(prompt);
  });

  it('AI 啟發模式 Prompt 應要求深度創意解析', async () => {
    const results = await fetchPinterestPins(TOPIC);
    const summary = results.toSummaryText();
    const prompt = `以下是 Pinterest 上關於「${TOPIC}」的精選內容：\n\n${summary}\n\n請深度解析這些視覺靈感背後的設計哲學與趨勢，挖掘獨特的創意切入點，並提出 3 個突破性的設計概念，幫助使用者在此主題上創造出與眾不同的作品。`;
    expect(prompt).toContain('設計哲學');
    expect(prompt).toContain('突破性');
    console.log('\n=== 完整 AI Prompt（啟發模式）===\n');
    console.log(prompt);
  });
});
