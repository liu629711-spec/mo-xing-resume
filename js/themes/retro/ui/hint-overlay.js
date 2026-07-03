const gsap = window.gsap;

export function createHintOverlay(rootEl, cfg) {
  const el = rootEl.querySelector('#retro-hint');
  if (!el) return { show() {}, hide() {}, dispose() {} };

  function show(state, { isMobile = false } = {}) {
    const text = state === 'room' ? cfg.hints.room
      : state === 'desk' ? (isMobile ? cfg.hints.deskMobile : cfg.hints.desk)
      : '';
    el.textContent = text;
    el.style.display = 'block';
    gsap.killTweensOf(el);
    gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
  }

  function hide() {
    gsap.killTweensOf(el);
    gsap.to(el, {
      opacity: 0, duration: 0.3, ease: 'power2.in',
      onComplete: () => { el.style.display = 'none'; },
    });
  }

  function dispose() {
    gsap.killTweensOf(el);
    el.textContent = '';
    el.style.display = 'none';
  }

  return { show, hide, dispose };
}
