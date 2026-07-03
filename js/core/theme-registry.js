import * as ink from '../themes/ink/index.js';
import * as retro from '../themes/retro/index.js';

/** @typedef {{ id: string, init: Function, boot: Function, destroy?: Function }} ThemeModule */

/** @type {Record<string, ThemeModule>} */
export const themes = { ink, retro };

/**
 * @param {string} id
 * @returns {ThemeModule}
 */
export function getTheme(id) {
  const t = themes[id];
  if (!t) throw new Error(`Unknown theme: ${id}`);
  return t;
}
