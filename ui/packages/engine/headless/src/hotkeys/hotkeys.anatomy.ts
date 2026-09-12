import { createAnatomy } from '@xihan-ui/core'

// Hotkeys 是纯行为组件，不渲染任何 DOM，也就没有视觉部件。
export const hotkeysAnatomy = createAnatomy('hotkeys', [] as const)
