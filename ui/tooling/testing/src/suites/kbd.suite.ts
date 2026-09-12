import type { ConformanceSuite } from '../conformance/types'
import { kbdAnatomy, kbdKeyboard } from '@xihan-ui/headless'

export const kbdSuite: ConformanceSuite = {
  component: 'kbd',
  anatomy: kbdAnatomy,
  keyboard: kbdKeyboard,
  defaultProps: { value: 'S', platform: 'other' },
  fixture: { part: 'root', tag: 'kbd' },
  cases: [
    {
      name: '单枚键帽使用原生 kbd 角色并保留平台可读名称',
      spec: { apg: 'https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-kbd-element' },
      props: { value: 'Mod', platform: 'mac' },
      initial: {
        counts: { root: 1 },
        parts: {
          root: {
            'aria-label': 'Command',
            'data-platform': 'mac',
            'data-modifier': '',
            'data-size': null,
            'data-pressed': null,
            'data-disabled': null,
          },
        },
      },
      steps: [{
        kind: 'raw',
        why: '可见键名属于原生 kbd 文本，不在属性快照中',
        run: ({ root }) => {
          const key = root.querySelector('[data-scope="kbd"][data-part="root"]')
          if (key?.tagName !== 'KBD' || key.textContent !== '⌘')
            throw new Error('Kbd 必须以原生 <kbd> 显示 Headless 格式化后的键名')
        },
      }],
    },
    {
      name: '尺寸、禁用与真实按下事实分别投影',
      spec: { apg: 'https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-kbd-element' },
      props: { value: 'Enter', platform: 'other', size: 'lg', disabled: true, pressed: true },
      initial: {
        parts: {
          root: {
            'aria-label': 'Enter',
            'data-size': 'lg',
            'data-disabled': '',
            'data-pressed': '',
          },
        },
      },
    },
  ],
}
