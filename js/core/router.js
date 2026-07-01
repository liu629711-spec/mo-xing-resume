// 板块路由：基于 ScrollTrigger 调度板块激活/卸载、金缮过渡、进度更新。
import { state } from './state.js';
import { playKintsugiTransition } from '../effects/kintsugi.js';
import { playInkRipple } from '../effects/ink-ripple.js';

let ST = null;
function getST() {
  if (ST) return ST;
  if (typeof ScrollTrigger !== 'undefined') { ST = ScrollTrigger; return ST; }
  return null;
}

// 注册每个 section 的进入/离开触发器
export function registerSections(sections, callbacks) {
  const ScrollTrigger = getST();
  if (!ScrollTrigger) {
    // 无 ScrollTrigger 时直接激活所有
    sections.forEach((s) => callbacks[s]?.activate?.());
    return;
  }
  sections.forEach((name) => {
    const el = document.querySelector(`[data-section="${name}"]`);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 60%',
      end: 'bottom 40%',
      onEnter: () => activate(name, callbacks),
      onEnterBack: () => activate(name, callbacks),
      onLeave: () => deactivate(name, callbacks),
      onLeaveBack: () => deactivate(name, callbacks),
    });
  });
}

let lastSection = null;
function activate(name, callbacks) {
  if (state.currentSection === name) return;
  const prev = lastSection;
  state.currentSection = name;
  lastSection = name;
  state.activatedSections.add(name);
  callbacks[name]?.activate?.();
  updateProgress();
  // 板块切换金缮过渡 + 墨晕（跳过首次及 reduced motion）
  if (prev && !state.reducedMotion) {
    playKintsugiTransition();
    playInkRipple();
  }
}

function deactivate(name, callbacks) {
  callbacks[name]?.deactivate?.();
}

function updateProgress() {
  const total = 7;
  const pct = Math.round((state.activatedSections.size / total) * 100);
  const el = document.querySelector('.progress-value');
  if (el) el.textContent = `${pct}%`;
}
