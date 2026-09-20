// 提供 Kbd 跨适配器一致性判据。

import type { ConformanceSuite } from '../conformance/types'
import { kbdAnatomy, kbdKeyboard } from '@xihan-ui/headless'

export const kbdSuite: ConformanceSuite = {
  component: 'kbd',
  anatomy: kbdAnatomy,
  keyboard: kbdKeyboard,
  defaultProps: { keys: ['S'], platform: 'other' },
  fixture: { part: 'root', tag: 'kbd' },
  cases: [
    {
      name: '组合键由原生 kbd 承载一个读屏名称',
      spec: { apg: 'https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-kbd-element' },
      props: { keys: ['Mod', 'K'], platform: 'other' },
      initial: {
        counts: { root: 1, key: 2 },
        parts: {
          root: {
            'role': 'img',
            'aria-label': 'Control + K',
            'data-platform': 'other',
            'data-variant': 'default',
          },
          key: {
            'aria-hidden': 'true',
          },
        },
      },
      steps: [{
        kind: 'raw',
        why: '可见键名属于原生 kbd 文本，不在属性快照中',
        run: ({ root }) => {
          const kbd = root.querySelector('[data-scope="kbd"][data-part="root"]')
          if (kbd?.tagName !== 'KBD' || kbd.textContent !== 'CtrlK')
            throw new Error('Kbd 必须以原生 <kbd> 连排 Headless 格式化后的键名')
        },
      }],
    },
    {
      name: 'light 外观和显式注册事实如实投影',
      spec: { apg: 'https://www.w3.org/TR/uievents/#event-type-keydown' },
      covers: ['kbd.keydown.trigger'],
      props: { keys: ['Escape'], platform: 'other', variant: 'light', register: true },
      initial: {
        parts: {
          root: {
            'aria-label': 'Escape',
            'data-register': '',
            'data-variant': 'light',
          },
        },
      },
      steps: [{
        kind: 'raw',
        why: '归一化快照没有 defaultPrevented 通道，只能直接看事件对象：显式注册的热键要把 keydown 接管掉',
        run: ({ root }) => {
          const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
          root.dispatchEvent(event)
          if (!event.defaultPrevented)
            throw new Error('显式注册的 Escape 热键必须被 Kbd 接管')
        },
      }],
    },
    {
      name: '普通按键不接管输入区',
      spec: { apg: 'https://www.w3.org/TR/uievents/#event-type-keydown' },
      covers: ['kbd.keydown.typing'],
      props: { keys: ['S'], platform: 'other', register: true },
      steps: [{
        kind: 'raw',
        why: '输入目标必须是活的原生表单控件',
        run: ({ root }) => {
          const input = document.createElement('input')
          // 夹具里的输入框也要有可访问名，无障碍扫描连它一起扫
          input.setAttribute('aria-label', '输入区')
          root.append(input)
          const event = new KeyboardEvent('keydown', { key: 's', bubbles: true, cancelable: true })
          input.dispatchEvent(event)
          if (event.defaultPrevented)
            throw new Error('普通键位落在输入区时不应被 Kbd 接管')
        },
      }],
    },
  ],
}
