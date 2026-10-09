<template>
  <svg viewBox="0 0 240 160" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="color-picker-saturation" x2="1">
        <stop stop-color="var(--xh-color-neutral-0)" />
        <stop offset="1" stop-color="var(--xh-color-blue-500)" />
      </linearGradient>
      <linearGradient id="color-picker-value" y2="1" x2="0">
        <stop stop-color="var(--xh-color-neutral-950)" stop-opacity="0" />
        <stop offset="1" stop-color="var(--xh-color-neutral-950)" />
      </linearGradient>
      <linearGradient id="color-picker-hue" x2="1">
        <stop stop-color="var(--xh-color-red-500)" />
        <stop offset="0.17" stop-color="var(--xh-color-yellow-500)" />
        <stop offset="0.33" stop-color="var(--xh-color-green-500)" />
        <stop offset="0.5" stop-color="var(--xh-color-cyan-500)" />
        <stop offset="0.67" stop-color="var(--xh-color-blue-500)" />
        <stop offset="0.83" stop-color="var(--xh-color-purple-500)" />
        <stop offset="1" stop-color="var(--xh-color-red-500)" />
      </linearGradient>
    </defs>
    <rect x="24.5" y="16.5" width="95" height="31" rx="2" fill="var(--xh-bg-field)" stroke="var(--xh-border-control)" />
    <rect x="32" y="24" width="16" height="16" rx="2" fill="var(--xh-color-blue-500)" />
    <path d="M59 32h30" stroke="var(--xh-fg-default)" stroke-width="6" />
    <path d="M100 34l4-4 4 4" stroke="var(--xh-fg-muted)" stroke-width="2" />
    <rect x="24.5" y="52.5" width="191" height="91" rx="4" fill="var(--xh-bg-surface-raised)" stroke="var(--xh-border-default)" />
    <path d="M29 53h182a4 4 0 0 1 4 4v48h-190v-48a4 4 0 0 1 4-4z" fill="url(#color-picker-saturation)" />
    <path d="M29 53h182a4 4 0 0 1 4 4v48h-190v-48a4 4 0 0 1 4-4z" fill="url(#color-picker-value)" />
    <circle cx="160" cy="72" r="7" stroke="var(--xh-bg-surface-raised)" stroke-width="2" />
    <rect x="36" y="118" width="168" height="12" rx="6" fill="url(#color-picker-hue)" />
    <circle cx="140" cy="124" r="7.5" fill="var(--xh-bg-surface-raised)" stroke="var(--xh-border-default)" />
    <circle cx="140" cy="124" r="4" fill="var(--xh-color-blue-500)" />
  </svg>
</template>
