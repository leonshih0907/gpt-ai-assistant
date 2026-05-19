import config from '../config/index.js';
import { createChatCompletion, createImage, ROLE_SYSTEM, ROLE_HUMAN, ROLE_AI } from '../services/openai.js';
import sessionManager from './design-session.js';

const MOCK_TEXT = '（測試模式）這是模擬的設計建議回應。';

const systemPrompts = {
  inspire: '你是一位資深視覺傳達設計師，精通品牌設計、插畫、排版與色彩理論。請用繁體中文回應。',
  palette: '你是精通色彩理論的視覺設計師，請提供具體配色方案含HEX色碼與設計理由。請用繁體中文回應。',
  brief: '你是創意總監，擅長撰寫清晰設計提案文件。請用繁體中文回應。',
  expand: '你是視覺創作導師，能根據對話脈絡深化設計概念。請用繁體中文回應。',
};

const buildUserPrompt = (mode, topic) => {
  if (mode === 'inspire') {
    return `請針對「${topic}」這個設計主題，提供 5 個具體的視覺創意方向。每個方向包含：\n1. 方向名稱（2-5字）\n2. 核心視覺概念（1句話）\n3. 色調建議\n4. 字體風格\n5. 一句可用來生成圖像的設計描述\n\n最後提示用戶可輸入「設計草圖 [方向描述]」來生成視覺圖像。`;
  }
  if (mode === 'palette') {
    return `請為「${topic}」設計完整品牌色彩系統：\n**主色（Primary）**：HEX + 命名 + 使用場景\n**輔助色（Secondary）**：2-3色 + HEX\n**強調色（Accent）**：HEX + 時機\n**中性色（Neutral）**：HEX + 用途\n\n說明整體色調傳遞的情感與品牌個性。`;
  }
  if (mode === 'brief') {
    return `請為「${topic}」撰寫完整設計簡報（Creative Brief）：\n**專案概述**\n**目標受眾**\n**設計目標**（3點）\n**視覺風格定調**\n**禁忌事項**\n**參考風格關鍵字**\n**交付物清單**`;
  }
  if (mode === 'expand') {
    return `請根據上述設計方向深化最有潛力的創意，提供更具體的視覺細節、材質質感描述，並生成一段可直接用於圖像生成的英文描述詞（Prompt）。`;
  }
  return topic;
};

const suggestedActionsFor = (mode) => {
  if (mode === 'expand') return ['sketch'];
  return ['sketch', 'expand'];
};

const chat = async (sessionId, mode, message) => {
  const isMock = config.APP_ENV !== 'production' || !config.OPENAI_API_KEY;

  if (mode === 'sketch') {
    if (isMock) {
      sessionManager.appendToSession(sessionId, ROLE_HUMAN, message);
      sessionManager.appendToSession(sessionId, ROLE_AI, '（測試模式）圖像生成已跳過，請在生產環境中使用。');
      return {
        type: 'text',
        text: '（測試模式）圖像生成已跳過，請在生產環境中使用。',
        suggestedActions: ['expand'],
      };
    }

    const { data: translateData } = await createChatCompletion({
      messages: [
        {
          role: ROLE_SYSTEM,
          content: 'You are a visual design expert. Convert the Chinese design concept into a concise English DALL-E image prompt. Focus on visual style, colors, composition, mood. Return only the prompt.',
        },
        { role: ROLE_HUMAN, content: message },
      ],
    });
    const dallePrompt = translateData.choices[0].message.content.trim();

    const { data: imageData } = await createImage({
      prompt: dallePrompt,
      n: 1,
      size: config.OPENAI_IMAGE_GENERATION_SIZE,
    });
    const imageUrl = imageData.data[0].url;

    sessionManager.appendToSession(sessionId, ROLE_HUMAN, message);
    sessionManager.appendToSession(sessionId, ROLE_AI, `[Image generated] ${dallePrompt}`);

    return { type: 'image', imageUrl, dallePrompt, suggestedActions: ['expand'] };
  }

  const history = sessionManager.getHistory(sessionId);
  const recentHistory = history.slice(-6);

  const messages = [
    { role: ROLE_SYSTEM, content: systemPrompts[mode] },
    ...recentHistory,
    { role: ROLE_HUMAN, content: buildUserPrompt(mode, message) },
  ];

  let text;
  if (isMock) {
    text = MOCK_TEXT;
  } else {
    const { data } = await createChatCompletion({ messages });
    text = data.choices[0].message.content.trim();
  }

  sessionManager.appendToSession(sessionId, ROLE_HUMAN, buildUserPrompt(mode, message));
  sessionManager.appendToSession(sessionId, ROLE_AI, text);

  return { type: 'text', text, suggestedActions: suggestedActionsFor(mode) };
};

export default { chat };
