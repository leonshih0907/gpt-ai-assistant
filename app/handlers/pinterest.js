import config from '../../config/index.js';
import { t } from '../../locales/index.js';
import { ROLE_AI, ROLE_HUMAN, ROLE_SYSTEM } from '../../services/openai.js';
import { generateCompletion } from '../../utils/index.js';
import fetchPinterestPins from '../../utils/fetch-pinterest-pins.js';
import {
  COMMAND_BOT_PINTEREST,
  COMMAND_BOT_PINTEREST_INSPIRE,
  COMMAND_BOT_CONTINUE,
} from '../commands/index.js';
import Context from '../context.js';
import { updateHistory } from '../history/index.js';
import { getPrompt, setPrompt } from '../prompt/index.js';
import { Prompt } from '../prompt/index.js';

/**
 * @param {Context} context
 * @returns {boolean}
 */
const check = (context) => (
  context.hasCommand(COMMAND_BOT_PINTEREST)
  || context.hasCommand(COMMAND_BOT_PINTEREST_INSPIRE)
);

/**
 * @param {Context} context
 * @returns {Promise<Context>}
 */
const exec = (context) => check(context) && (
  async () => {
    if (!config.PINTEREST_ACCESS_TOKEN) {
      context.pushText(t('__ERROR_MISSING_ENV')('PINTEREST_ACCESS_TOKEN'));
      return context;
    }

    const isInspireMode = context.hasCommand(COMMAND_BOT_PINTEREST_INSPIRE);
    const commandText = isInspireMode
      ? COMMAND_BOT_PINTEREST_INSPIRE.text
      : COMMAND_BOT_PINTEREST.text;

    const topic = context.trimmedText
      .replace(new RegExp(`^(${commandText}|/pinterest|/inspire|Pinterest|Inspire)\\s*`, 'i'), '')
      .trim();

    if (!topic) {
      context.pushText(t('__PINTEREST_MISSING_TOPIC'));
      return context;
    }

    context.pushText(t('__PINTEREST_SEARCHING')(topic));

    let results;
    try {
      results = await fetchPinterestPins(topic);
    } catch (err) {
      return context.pushError(err);
    }

    const summaryText = results.toSummaryText();
    if (!summaryText) {
      context.pushText(t('__PINTEREST_NO_RESULTS')(topic));
      return context;
    }

    const creativePrompt = isInspireMode
      ? t('__PINTEREST_INSPIRE_AI_PROMPT')(topic, summaryText)
      : t('__PINTEREST_RECOMMEND_AI_PROMPT')(topic, summaryText);

    const analysisPrompt = new Prompt();
    analysisPrompt.write(ROLE_SYSTEM, t('__PINTEREST_SYSTEM_PROMPT'));
    analysisPrompt.write(ROLE_HUMAN, creativePrompt).write(ROLE_AI);

    try {
      const { text, isFinishReasonStop } = await generateCompletion({ prompt: analysisPrompt });

      const userPrompt = getPrompt(context.userId);
      userPrompt
        .write(ROLE_HUMAN, `${t('__PINTEREST_HISTORY_LABEL')}${topic}`)
        .write(ROLE_AI, text);
      setPrompt(context.userId, userPrompt);
      updateHistory(context.id, (history) => history.write(config.BOT_NAME, text));

      context.pushText(text, isFinishReasonStop ? [] : [COMMAND_BOT_CONTINUE]);

      const pinLinks = results.toPinLinks();
      if (pinLinks) {
        context.pushText(`${t('__PINTEREST_LINKS_HEADER')}\n${pinLinks}`);
      }
    } catch (err) {
      context.pushError(err);
    }

    return context;
  }
)();

export default exec;
