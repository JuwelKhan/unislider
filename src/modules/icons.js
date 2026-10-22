const svg = (path) =>
  `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="${path}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export const ICONS = {
  prev: svg('M15 18l-6-6 6-6'),
  next: svg('M9 18l6-6-6-6'),
  up: svg('M18 15l-6-6-6 6'),
  down: svg('M6 9l6 6 6-6'),
  play: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>',
  pause: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg>',
};
