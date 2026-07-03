// Win95 复古桌面
import { createWindowManager } from './window-manager.js';
import { renderAboutWindow } from './sections/about-window.js';
import { renderContactWindow, bindContactWindow } from './sections/contact-window.js';
import { renderProjectsWindow, bindProjectsWindow } from './sections/projects-window.js';
import { renderSkillsWindow } from './sections/skills-window.js';
import { renderTimelineWindow, bindTimelineWindow } from './sections/timeline-window.js';
import { renderMetricsWindow } from './sections/metrics-window.js';
import { renderGamesWindow, bindGamesWindow } from './sections/games-window.js';
import { SFX } from './sound.js';

/**
 * @param {HTMLElement} root
 * @param {object} data
 * @param {{ onOpenSection?: Function }} [options]
 */
export function createDesktop(root, data, options = {}) {
  const onOpen = options.onOpenSection || (() => {});
  const now = new Date();
  const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  root.innerHTML = `
    <div id="retro-desktop" class="retro-desktop">
      <div class="retro-desktop__wallpaper" aria-hidden="true"></div>
      <div class="retro-icons">
        <button type="button" class="retro-icon" data-open="about" aria-label="关于我">
          <span class="retro-icon__img">👤</span>
          <span class="retro-icon__label">关于我.exe</span>
        </button>
        <button type="button" class="retro-icon" data-open="skills" aria-label="技能树">
          <span class="retro-icon__img">🌳</span>
          <span class="retro-icon__label">技能树.dat</span>
        </button>
        <button type="button" class="retro-icon" data-open="projects" aria-label="项目副本">
          <span class="retro-icon__img">⚔️</span>
          <span class="retro-icon__label">副本挑战.log</span>
        </button>
        <button type="button" class="retro-icon" data-open="metrics" aria-label="成就殿堂">
          <span class="retro-icon__img">🏆</span>
          <span class="retro-icon__label">成就殿堂.sav</span>
        </button>
        <button type="button" class="retro-icon" data-open="games" aria-label="游戏库">
          <span class="retro-icon__img">🎮</span>
          <span class="retro-icon__label">游戏库.lib</span>
        </button>
        <button type="button" class="retro-icon" data-open="timeline" aria-label="经历">
          <span class="retro-icon__img">📜</span>
          <span class="retro-icon__label">冒险历程.txt</span>
        </button>
        <button type="button" class="retro-icon" data-open="contact" aria-label="组队招募">
          <span class="retro-icon__img">📧</span>
          <span class="retro-icon__label">组队招募.url</span>
        </button>
      </div>
      <div id="retro-windows" class="retro-windows"></div>
      <div class="retro-taskbar">
        <span class="retro-taskbar__start">⊞ START</span>
        <span class="retro-taskbar__title">${escapeHtml(data.profile?.name || 'PLAYER')} · DESKTOP</span>
        <span class="retro-taskbar__clock">${timeStr}</span>
      </div>
    </div>
  `;

  const windowsRoot = root.querySelector('#retro-windows');
  const wm = createWindowManager(windowsRoot);

  function place(win, leftPct, topPct) {
    win.style.left = `${leftPct}%`;
    win.style.top = `${topPct}%`;
  }

  function openAbout() {
    const win = wm.openWindow({
      id: 'about', title: '关于我.exe',
      contentHtml: renderAboutWindow(data.profile || {}),
      width: 480, height: 320,
    });
    place(win, 8, 8);
  }

  function openContact() {
    const win = wm.openWindow({
      id: 'contact', title: '组队招募.url',
      contentHtml: renderContactWindow(data.contact || {}),
      width: 400, height: 280,
    });
    bindContactWindow(win);
    place(win, 55, 18);
  }

  function openSkills() {
    const win = wm.openWindow({
      id: 'skills', title: '技能树.dat',
      contentHtml: renderSkillsWindow(data.skills || []),
      width: 520, height: 420,
    });
    place(win, 20, 10);
  }

  function openProjects() {
    const win = wm.openWindow({
      id: 'projects', title: '副本挑战.log',
      contentHtml: renderProjectsWindow(data.projects || []),
      width: 640, height: 420,
    });
    bindProjectsWindow(win, data.projects || []);
    place(win, 15, 12);
  }

  function openTimeline() {
    const win = wm.openWindow({
      id: 'timeline', title: '冒险历程.txt',
      contentHtml: renderTimelineWindow(data.timeline || []),
      width: 480, height: 360,
    });
    bindTimelineWindow(win);
    place(win, 30, 15);
  }

  function openMetrics() {
    const win = wm.openWindow({
      id: 'metrics', title: '成就殿堂.sav',
      contentHtml: renderMetricsWindow(data.metrics || {}),
      width: 560, height: 440,
    });
    place(win, 18, 14);
  }

  function openGames() {
    const win = wm.openWindow({
      id: 'games', title: '游戏库.lib',
      contentHtml: renderGamesWindow(data.games || []),
      width: 600, height: 380,
    });
    bindGamesWindow(win, data.games || []);
    place(win, 22, 16);
  }

  const openers = {
    about: openAbout, contact: openContact, skills: openSkills,
    projects: openProjects, timeline: openTimeline,
    metrics: openMetrics, games: openGames,
  };

  root.querySelectorAll('.retro-icon[data-open]').forEach((icon) => {
    icon.addEventListener('dblclick', () => {
      const id = icon.dataset.open;
      const fn = openers[id];
      if (fn) {
        onOpen(id);
        SFX.open();
        fn();
      }
    });
    icon.addEventListener('click', () => {
      root.querySelectorAll('.retro-icon').forEach((other) => {
        if (other !== icon) other.classList.remove('is-selected');
      });
      icon.classList.toggle('is-selected');
    });
  });

  const escHandler = (e) => {
    if (e.key === 'Escape') wm.closeTop();
  };
  document.addEventListener('keydown', escHandler);

  return {
    wm,
    openAbout, openContact, openSkills, openProjects,
    openTimeline, openMetrics, openGames,
    dispose() {
      document.removeEventListener('keydown', escHandler);
    },
  };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
