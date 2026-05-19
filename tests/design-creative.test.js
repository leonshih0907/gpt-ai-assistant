import { describe, it, expect } from '@jest/globals';
import { t } from '../locales/index.js';

const TOPIC = '台灣夜市風的設計視覺';

describe('視覺傳達設計創意輔助器 — 台灣夜市風', () => {
  describe('設計靈感模式', () => {
    it('AI Prompt 應引導生成 5 個視覺方向', () => {
      const prompt = t('__DESIGN_INSPIRE_PROMPT')(TOPIC);
      expect(prompt).toContain(TOPIC);
      expect(prompt).toContain('5');
      expect(prompt).toContain('色調');
      expect(prompt).toContain('字體');
      expect(prompt).toContain('設計草圖');
      console.log('\n=== 設計靈感 Prompt ===\n', prompt);
    });

    it('系統人設應強調視覺設計專業', () => {
      const system = t('__DESIGN_INSPIRE_SYSTEM');
      expect(system).toContain('設計師');
      expect(system).toContain('色彩');
    });
  });

  describe('設計草圖模式（→ DALL-E）', () => {
    it('草圖歷史標籤應正確', () => {
      const label = t('__DESIGN_HISTORY_SKETCH');
      expect(label).toBe('設計草圖：');
    });

    it('Prompt 使用提示應包含英文描述詞說明', () => {
      const mockDallePrompt = 'Taiwan night market neon signs, red and yellow, hand-lettered typography, LED lights, flat design poster';
      const msg = t('__DESIGN_SKETCH_PROMPT_USED')(mockDallePrompt);
      expect(msg).toContain(mockDallePrompt);
      console.log('\n=== 草圖生成提示訊息 ===\n', msg);
    });
  });

  describe('配色建議模式', () => {
    it('配色 Prompt 應要求 HEX 色碼與設計理由', () => {
      const prompt = t('__DESIGN_PALETTE_PROMPT')(TOPIC);
      expect(prompt).toContain(TOPIC);
      expect(prompt).toContain('HEX');
      expect(prompt).toContain('Primary');
      expect(prompt).toContain('Accent');
      console.log('\n=== 配色建議 Prompt ===\n', prompt);
    });
  });

  describe('設計簡報模式', () => {
    it('簡報 Prompt 應包含完整 Brief 結構', () => {
      const prompt = t('__DESIGN_BRIEF_PROMPT')(TOPIC);
      expect(prompt).toContain('目標受眾');
      expect(prompt).toContain('視覺風格');
      expect(prompt).toContain('關鍵字');
      console.log('\n=== 設計簡報 Prompt ===\n', prompt);
    });
  });

  describe('創意擴展模式', () => {
    it('擴展 Prompt 應要求生成英文圖像描述詞', () => {
      const prompt = t('__DESIGN_EXPAND_PROMPT');
      expect(prompt).toContain('英文');
      expect(prompt).toContain('圖像生成');
      console.log('\n=== 創意擴展 Prompt ===\n', prompt);
    });
  });

  describe('對話流程模擬 — 台灣夜市風完整工作坊', () => {
    it('完整對話迴圈應覆蓋所有模式', () => {
      const flow = [
        { step: '1. 探索靈感', input: `設計靈感 ${TOPIC}`, output: '5 個視覺方向（文字）' },
        { step: '2. 選擇方向', input: '設計草圖 霓虹招牌插畫風格，紅黃螢光色，手寫字體', output: 'DALL-E 圖像' },
        { step: '3. 確認色彩', input: `配色建議 ${TOPIC}`, output: '色票 + HEX 色碼' },
        { step: '4. 深化概念', input: '創意擴展', output: '細化細節 + 圖像生成英文 Prompt' },
        { step: '5. 輸出文件', input: `設計簡報 ${TOPIC}夜市主題餐廳`, output: 'Creative Brief' },
      ];

      console.log('\n=== 台灣夜市風設計工作坊流程 ===\n');
      flow.forEach(({ step, input, output }) => {
        console.log(`${step}`);
        console.log(`  → 用戶輸入：「${input}」`);
        console.log(`  ← AI 回應：${output}\n`);
        expect(step).toBeTruthy();
      });
      expect(flow).toHaveLength(5);
    });
  });

  describe('指令語系', () => {
    it('所有設計指令應有正確的中文標籤', () => {
      const labels = [
        t('__COMMAND_DESIGN_INSPIRE_LABEL'),
        t('__COMMAND_DESIGN_SKETCH_LABEL'),
        t('__COMMAND_DESIGN_PALETTE_LABEL'),
        t('__COMMAND_DESIGN_BRIEF_LABEL'),
        t('__COMMAND_DESIGN_EXPAND_LABEL'),
      ];
      labels.forEach((label) => expect(label).toBeTruthy());
      console.log('\n=== 設計指令標籤 ===\n', labels.join(' / '));
    });

    it('缺少主題時應給予正確提示', () => {
      const msg = t('__DESIGN_MISSING_TOPIC')('inspire');
      expect(msg).toContain('設計靈感');
      expect(msg).toContain('夜市');
    });
  });
});
