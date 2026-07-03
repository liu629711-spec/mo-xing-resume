export const STATES = {
  ROOM: 'ROOM',
  DESK: 'DESK',
  ENTER: 'ENTER',
  BOOT_SEQ: 'BOOT_SEQ',
  DIVE: 'DIVE',
  PLACEHOLDER: 'PLACEHOLDER',
};

const BOOT_ORDER = ['ROOM', 'DESK', 'ENTER', 'BOOT_SEQ', 'DIVE', 'PLACEHOLDER'];

const TRANSITIONS = new Map([
  ['ROOM', ['DESK']],
  ['DESK', ['ENTER']],
  ['ENTER', ['BOOT_SEQ']],
  ['BOOT_SEQ', ['DIVE']],
  ['DIVE', ['PLACEHOLDER']],
  ['PLACEHOLDER', ['ROOM']],
]);

export function canTransition(from, to) {
  const allowed = TRANSITIONS.get(from);
  return allowed ? allowed.includes(to) : false;
}

export function nextBootState(current) {
  const idx = BOOT_ORDER.indexOf(current);
  if (idx < 0 || idx >= BOOT_ORDER.length - 1) return null;
  return BOOT_ORDER[idx + 1];
}

export function skipTarget() {
  return 'PLACEHOLDER';
}
