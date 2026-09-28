<template>
  <svg viewBox="0 0 240 160" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="marquee-fade-start" x2="1">
        <stop stop-color="var(--xh-bg-page)" />
        <stop offset="1" stop-color="var(--xh-bg-page)" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="marquee-fade-end" x2="1">
        <stop stop-color="var(--xh-bg-page)" stop-opacity="0" />
        <stop offset="1" stop-color="var(--xh-bg-page)" />
      </linearGradient>
    </defs>
    <rect x="0" y="64" width="56" height="32" rx="8" fill="var(--xh-bg-subtle)" />
    <path d="M15 80h26" stroke="var(--xh-fg-default)" stroke-width="6" />
    <rect x="64" y="64" width="64" height="32" rx="8" fill="var(--xh-bg-subtle)" />
    <path d="M82 74q1 5 6 6q-5 1-6 6q-1-5-6-6q5-1 6-6z" stroke="var(--xh-fg-muted)" stroke-width="2" />
    <path d="M99 80h14" stroke="var(--xh-fg-default)" stroke-width="6" />
    <rect x="136" y="64" width="56" height="32" rx="8" fill="var(--xh-bg-subtle)" />
    <path d="M151 80h26" stroke="var(--xh-fg-default)" stroke-width="6" />
    <rect x="200" y="64" width="40" height="32" rx="8" fill="var(--xh-bg-subtle)" />
    <path d="M215 80h22" stroke="var(--xh-fg-default)" stroke-width="6" />
    <rect x="0" y="56" width="48" height="48" fill="url(#marquee-fade-start)" />
    <rect x="192" y="56" width="48" height="48" fill="url(#marquee-fade-end)" />
  </svg>
</template>
