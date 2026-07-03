const gsap = window.gsap;

export function createPlaceholder(rootEl, cfg, { onReturn } = {}) {
  const el = rootEl.querySelector('#retro-placeholder');
  if (!el) return { show() {}, hide() {}, dispose() {} };

  let barFill = null;
  let returnBtn = null;
  let fakeProgressTl = null;

  function build() {
    el.innerHTML = `
      <div class="retro-placeholder__title">✦ ${escapeHtml(cfg.placeholder.title)} ✦</div>
      <div class="retro-placeholder__bar"><div class="retro-placeholder__bar-fill"></div></div>
      <div class="retro-placeholder__subtitle">${escapeHtml(cfg.placeholder.subtitle)}</div>
      <button class="retro-placeholder__return" type="button">${escapeHtml(cfg.placeholder.returnLabel)}</button>
    `;
    barFill = el.querySelector('.retro-placeholder__bar-fill');
    returnBtn = el.querySelector('.retro-placeholder__return');
    returnBtn.addEventListener('click', () => { if (onReturn) onReturn(); });
  }

  function show() {
    if (!barFill) build();
    el.hidden = false;
    gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' });
    if (fakeProgressTl) fakeProgressTl.kill();
    if (barFill) barFill.style.width = '0%';
    fakeProgressTl = gsap.to(barFill, { width: '99%', duration: 3, ease: 'power1.out' });
  }

  function hide() {
    if (fakeProgressTl) fakeProgressTl.kill();
    gsap.to(el, {
      opacity: 0, duration: 0.3,
      onComplete: () => { el.hidden = true; },
    });
  }

  function dispose() {
    if (fakeProgressTl) fakeProgressTl.kill();
    gsap.killTweensOf(el);
    if (returnBtn) returnBtn.removeEventListener('click', () => {});
    el.innerHTML = '';
    el.hidden = true;
  }

  return { show, hide, dispose };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
