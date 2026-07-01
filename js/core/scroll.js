// 平滑滚动：Lenis + GSAP ticker + ScrollTrigger 集成
import { updatePaperBg } from '../effects/paper-bg.js';
import { state } from './state.js';

let lenis = null;

export function initSmoothScroll() {
  if (typeof Lenis === 'undefined') return null;
  lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    wheelMultiplier: 1,
  });

  if (typeof gsap !== 'undefined' && gsap.ticker) {
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }

  if (typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
  }

  // 滚动进度 + 宣纸视差
  lenis.on('scroll', ({ scroll, limit }) => {
    state.scrollProgress = limit > 0 ? scroll / limit : 0;
    updatePaperBg(scroll);
  });

  return lenis;
}

export function getLenis() { return lenis; }
export function getProgress() {
  if (!lenis) return 0;
  const limit = lenis.limit || 1;
  return lenis.scroll / limit;
}
