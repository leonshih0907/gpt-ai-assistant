import config from '../../config/index.js';
import { t } from '../../locales/index.js';
import { ROLE_AI, ROLE_HUMAN, ROLE_SYSTEM } from '../../services/openai.js';
import { createChatCompletion } from '../../services/openai.js';
import { generateCompletion, generateImage } from '../../utils/index.js';
import {
  COMMAND_DESIGN_INSPIRE,
  COMMAND_DESIGN_SKETCH,
  COMMAND_DESIGN_PALETTE,
  COMMAND_DESIGN_BRIEF,
  COMMAND_DESIGN_EXPAND,
  COMMAND_BOT_CONTINUE,
} from '../commands/index.js';
import Context from '../context.js';
import { updateHistory } from '../history/index.js';
import { getPrompt, setPrompt } from '../prompt/index.js';
import { Prompt } from '../prompt/index.js';

const MODES = {
  INSPIRE: 'inspire',
  SKETCH: 'sketch',
  PALETTE: 'palette',
  BRIEF: 'brief',
  EXPAND: 'expand',
};

/**
 * @param {Context} context
 * @returns {string|null}
 */
const detectMode = (context) => {
  if (context.hasCommand(COMMAND_DESIGN_SKETCH)) return MODES.SKETCH;
  if (context.hasCommand(COMMAND_DESIGN_PALETTE)) return MODES.PALETTE;
  if (context.hasCommand(COMMAND_DESIGN_BRIEF)) return MODES.BRIEF;
  if (context.hasCommand(COMMAND_DESIGN_EXPAND)) return MODES.EXPAND;
  if (context.hasCommand(COMMAND_DESIGN_INSPIRE)) return MODES.INSPIRE;
  return null;
};

/**
 * @param {Context} context
 * @returns {boolean}
 */
const check = (context) => detectMode(context) !== null;

const stripCommand = (text, command) => text
  .replace(new RegExp(`^(${command.text}|${command.aliases.join('|')})\\s*`, 'i'), '')
  .trim();

/**
 * Translate a Chinese design concept to an optimized English DALL-E prompt.
 * @param {string} concept
 * @returns {Promise<string>}
 */
const buildDallePrompt = async (concept) => {
  if (config.APP_ENV !== 'production') {
    return `Taiwan night market neon signs, street food stalls, vibrant red and yellow colors, traditional brush lettering, LED lights, bustling atmosphere, graphic design poster style, flat illustration`;
  }
  const { data } = await createChatCompletion({
    messages: [
      {
        role: ROLE_SYSTEM,
        content: 'You are a visual design expert. Convert the following Chinese design concept into a concise, vivid English prompt for DALL-E image generation. Focus on visual style, colors, composition, and mood. Return only the prompt, no explanation.',
      },
      {
        role: ROLE_HUMAN,
        content: `Design concept: ${concept}`,
      },
    ],
  });
  return data.choices[0].message.content.trim();
};

/**
 * @param {Context} context
 * @returns {Promise<Context>}
 */
const exec = (context) => check(context) && (
  async () => {
    const mode = detectMode(context);

    const commands = {
      [MODES.INSPIRE]: COMMAND_DESIGN_INSPIRE,
      [MODES.SKETCH]: COMMAND_DESIGN_SKETCH,
      [MODES.PALETTE]: COMMAND_DESIGN_PALETTE,
      [MODES.BRIEF]: COMMAND_DESIGN_BRIEF,
      [MODES.EXPAND]: COMMAND_DESIGN_EXPAND,
    };

    const topic = mode === MODES.EXPAND
      ? ''
      : stripCommand(context.trimmedText, commands[mode]);

    if (mode !== MODES.EXPAND && !topic) {
      context.pushText(t('__DESIGN_MISSING_TOPIC')(mode));
      return context;
    }

    // --- SKETCH mode: translate concept → DALL-E image ---
    if (mode === MODES.SKETCH) {
      const prompt = getPrompt(context.userId);
      prompt.write(ROLE_HUMAN, `${t('__DESIGN_HISTORY_SKETCH')}${topic}`).write(ROLE_AI);
      try {
        const dallePrompt = await buildDallePrompt(topic);
        const { url } = await generateImage({
          prompt: dallePrompt,
          size: config.OPENAI_IMAGE_GENERATION_SIZE,
        });
        prompt.patch(t('__DESIGN_SKETCH_GENERATED'));
        setPrompt(context.userId, prompt);
        updateHistory(context.id, (history) => history.write(config.BOT_NAME, t('__DESIGN_SKETCH_GENERATED')));
        context.pushText(t('__DESIGN_SKETCH_PROMPT_USED')(dallePrompt));
        context.pushImage(url, [COMMAND_DESIGN_EXPAND]);
      } catch (err) {
        context.pushError(err);
      }
      return context;
    }

    // --- Text-based modes: INSPIRE / PALETTE / BRIEF / EXPAND ---
    const systemPrompts = {
      [MODES.INSPIRE]: t('__DESIGN_INSPIRE_SYSTEM'),
      [MODES.PALETTE]: t('__DESIGN_PALETTE_SYSTEM'),
      [MODES.BRIEF]: t('__DESIGN_BRIEF_SYSTEM'),
      [MODES.EXPAND]: t('__DESIGN_EXPAND_SYSTEM'),
    };

    const userPrompts = {
      [MODES.INSPIRE]: t('__DESIGN_INSPIRE_PROMPT')(topic),
      [MODES.PALETTE]: t('__DESIGN_PALETTE_PROMPT')(topic),
      [MODES.BRIEF]: t('__DESIGN_BRIEF_PROMPT')(topic),
      [MODES.EXPAND]: t('__DESIGN_EXPAND_PROMPT'),
    };

    const analysisPrompt = new Prompt();
    analysisPrompt.write(ROLE_SYSTEM, systemPrompts[mode]);

    // For EXPAND mode, inject the conversation history as context
    if (mode === MODES.EXPAND) {
      const existingPrompt = getPrompt(context.userId);
      const recentMessages = existingPrompt.messages.slice(-6);
      recentMessages.forEach((msg) => {
        analysisPrompt.write(msg.role, msg.content);
      });
    }

    analysisPrompt.write(ROLE_HUMAN, userPrompts[mode]).write(ROLE_AI);

    try {
      const { text, isFinishReasonStop } = await generateCompletion({ prompt: analysisPrompt });

      const userPrompt = getPrompt(context.userId);
      userPrompt
        .write(ROLE_HUMAN, `${t('__DESIGN_HISTORY_LABEL')(mode)}${topic}`)
        .write(ROLE_AI, text);
      setPrompt(context.userId, userPrompt);
      updateHistory(context.id, (history) => history.write(config.BOT_NAME, text));

      const quickReplies = isFinishReasonStop
        ? [COMMAND_DESIGN_SKETCH, COMMAND_DESIGN_EXPAND]
        : [COMMAND_BOT_CONTINUE];

      context.pushText(text, quickReplies);
    } catch (err) {
      context.pushError(err);
    }

    return context;
  }
)();

export default exec;
