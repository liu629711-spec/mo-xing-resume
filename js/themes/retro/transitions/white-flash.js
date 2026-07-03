const gsap = window.gsap;

export function createWhiteFlash(rootEl) {
  const el = rootEl.querySelector('#retro-white-flash');
  if (!el) return { flash() {}, dispose() {} };

  function flash(duration = 1.5, onComplete) {
    gsap.killTweensOf(el);
    el.style.opacity = 0;
    const tl = gsap.timeline();
    tl.to(el, { opacity: 1, duration: duration * 0.8, ease: 'power2.in' })
      .add(() => { if (onComplete) onComplete(); })
      .to(el, { opacity: 0, duration: 0.5, ease: 'power2.out' });
    return tl;
  }

  function dispose() {
    gsap.killTweensOf(el);
    el.style.opacity = 0;
  }

  return { flash, dispose };
}
