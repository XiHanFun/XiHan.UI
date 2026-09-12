import type { VNode } from 'vue'
import { h } from 'vue'
import {
  XhButton,
  XhDialogBody,
  XhDialogContent,
  XhDialogDescription,
  XhDialogFooter,
  XhDialogHeader,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
} from '../../src'

/** 像素基线与性能采样共用的 Linux 字体。 */
export const VISUAL_BASELINE_FONT = 'DejaVu Sans'

/** 像素基线与性能采样共用的桌面视口。 */
export const VISUAL_BASELINE_VIEWPORT = { width: 800, height: 520 } as const

/**
 * M4 Dialog 是视觉样板里同时覆盖全屏遮罩与高层玻璃内容面的固定场景。
 * 性能采样直接复用它，避免另造一个只为跑分存在的材质假夹具。
 */
export function visualBaselineDialogFixture(): VNode[] {
  return [
    h(XhDialogRoot, { open: true, variant: 'blur', translations: { close: 'Close' } }, () => [
      h(XhDialogTrigger, { asChild: true }, () => h(XhButton, null, () => 'Open dialog')),
      h(XhDialogContent, null, () => [
        h(XhDialogHeader, null, () => [
          h(XhDialogTitle, null, () => 'Confirm publish'),
          h(XhDialogDescription, null, () => 'Once published this page is visible to everyone.'),
        ]),
        h(XhDialogBody, null, () => h('p', 'The protected body stays readable over the page.')),
        h(XhDialogFooter, null, () => h(XhButton, null, () => 'Publish')),
      ]),
    ]),
  ]
}
