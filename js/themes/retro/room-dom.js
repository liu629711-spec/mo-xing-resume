// DOM 像素房间：构建家具 + 摆件，提供 GSAP 操作句柄
const PROP_COLORS = {
  desk: ['#4a8', '#a64', '#48a'],
  shelf: ['#a84', '#48a'],
  wall: ['#a64'],
};

/** @param {HTMLElement} stage @param {Array<object>} roomProps @returns {object} handles */
export function buildRoom(stage, roomProps = []) {
  stage.innerHTML = `
    <div class="retro-room" id="retro-room">
      <div class="retro-room__back"></div>
      <div class="retro-room__leftwall"></div>
      <div class="retro-room__floor"></div>
      <div class="retro-poster retro-poster--1"></div>
      <div class="retro-poster retro-poster--2"></div>
      <div class="retro-shelf"></div>
      <div class="retro-lamp"><div class="retro-lamp__glow"></div></div>
      <div class="retro-desk"></div>
      <div class="retro-monitor">
        <div class="retro-monitor__stand"></div>
        <div class="retro-monitor__frame"></div>
        <div class="retro-monitor__screen" id="retro-screen"></div>
      </div>
      <div class="retro-pc"><div class="retro-pc__led" id="retro-pc-led"></div></div>
      <div class="retro-keyboard" id="retro-keyboard"></div>
      <div class="retro-keyboard__enter" id="retro-enter-key">ENTER</div>
      <div class="retro-mouse"></div>
      <div class="retro-props" id="retro-props"></div>
    </div>
    <div class="retro-crt-overlay"></div>
    <p class="retro-boot-prompt" id="retro-boot-prompt"></p>
    <button type="button" class="retro-skip-boot" id="retro-skip-boot">跳过</button>
    <div class="retro-flash" id="retro-flash"></div>
    <div class="retro-prop-tooltip" id="retro-prop-tooltip"></div>
  `;

  buildKeyboardKeys(stage);

  const propEls = buildProps(stage, roomProps);
  bindPropTooltip(stage, propEls);

  return {
    room: stage.querySelector('#retro-room'),
    screen: stage.querySelector('#retro-screen'),
    pcLed: stage.querySelector('#retro-pc-led'),
    enterKey: stage.querySelector('#retro-enter-key'),
    prompt: stage.querySelector('#retro-boot-prompt'),
    skipBtn: stage.querySelector('#retro-skip-boot'),
    flash: stage.querySelector('#retro-flash'),
    tooltip: stage.querySelector('#retro-prop-tooltip'),
    propEls,
    dispose() {
      propEls.forEach((el) => {
        el.onmouseenter = null;
        el.onmouseleave = null;
        el.onclick = null;
      });
    },
  };
}

function buildKeyboardKeys(stage) {
  const kb = stage.querySelector('#retro-keyboard');
  if (!kb) return;
  for (let i = 0; i < 28; i++) {
    const key = document.createElement('div');
    key.className = 'retro-keyboard__key';
    kb.appendChild(key);
  }
}

function buildProps(stage, roomProps) {
  const host = stage.querySelector('#retro-props');
  if (!host) return [];

  const anchors = {
    desk: [
      { left: '32%', top: '55%' },
      { left: '60%', top: '55%' },
      { left: '50%', top: '54%' },
    ],
    shelf: [
      { left: '6%', top: '52%' },
      { left: '6%', top: '62%' },
    ],
    wall: [
      { left: '84%', top: '22%' },
    ],
  };

  return (roomProps || []).slice(0, 6).map((prop, i) => {
    const pos = prop.position || 'desk';
    const list = anchors[pos] || anchors.desk;
    const anchor = list[i % list.length];
    const color = (PROP_COLORS[pos] || PROP_COLORS.desk)[i % 3];

    const el = document.createElement('div');
    el.className = `retro-prop retro-prop--${pos}`;
    el.style.left = anchor.left;
    el.style.top = anchor.top;
    el.style.background = color;
    el.textContent = (prop.gameName || '?').slice(0, 2);
    el.dataset.gameName = prop.gameName || '';
    el.dataset.propLabel = prop.propLabel || '';
    el.dataset.tooltip = prop.tooltip || '';
    host.appendChild(el);
    return el;
  });
}

function bindPropTooltip(stage, propEls) {
  const tooltip = stage.querySelector('#retro-prop-tooltip');
  if (!tooltip) return;

  propEls.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      const game = el.dataset.gameName;
      const tip = el.dataset.tooltip;
      tooltip.innerHTML = `<strong>${escapeHtml(game)}</strong>${tip ? `<br>${escapeHtml(tip)}` : ''}`;
      tooltip.classList.add('is-visible');
    });
    el.addEventListener('mousemove', (e) => {
      tooltip.style.left = `${e.clientX + 14}px`;
      tooltip.style.top = `${e.clientY + 14}px`;
    });
    el.addEventListener('mouseleave', () => {
      tooltip.classList.remove('is-visible');
    });
    el.addEventListener('click', () => {
      const event = new CustomEvent('retro:prop-click', {
        detail: {
          gameName: el.dataset.gameName,
          propLabel: el.dataset.propLabel,
          tooltip: el.dataset.tooltip,
        },
      });
      stage.dispatchEvent(event);
    });
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
