import type { ConformanceSuite } from '../conformance/types'
import { kbdGroupAnatomy, kbdGroupKeyboard } from '@xihan-ui/headless'

export const kbdGroupSuite: ConformanceSuite = {
  component: 'kbd-group',
  anatomy: kbdGroupAnatomy,
  keyboard: kbdGroupKeyboard,
  defaultProps: { keys: ['Mod', 'S'], platform: 'other' },
  fixture: { part: 'root', tag: 'span' },
  cases: [
    {
      name: '整组只由 root 的可读名称朗读一次',
      spec: { apg: 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/' },
      props: { keys: ['Mod', 'S'], platform: 'other' },
      initial: {
        order: ['root', 'key[0]', 'separator', 'key[1]'],
        counts: { root: 1, key: 2, separator: 1 },
        parts: {
          root: {
            'role': 'img',
            'aria-label': 'Control + S',
            'data-platform': 'other',
            'data-disabled': null,
            'data-pressed': null,
          },
          key: [
            { 'aria-hidden': 'true', 'data-modifier': '' },
            { 'aria-hidden': 'true', 'data-modifier': null },
          ],
          separator: { 'aria-hidden': 'true', 'hidden': null },
        },
      },
      steps: [{
        kind: 'raw',
        why: '键帽可见文本不在属性快照中，需核对三端都使用原生 kbd 与同一格式化结果',
        run: ({ root }) => {
          const keys = [...root.querySelectorAll('[data-scope="kbd-group"][data-part="key"]')]
          if (keys.some(key => key.tagName !== 'KBD') || keys.map(key => key.textContent).join(',') !== 'Ctrl,S')
            throw new Error('KbdGroup 必须生成 Ctrl、S 两枚原生 <kbd>')
        },
      }],
    },
    {
      name: 'Mac 符号连排时连接符节点明确收起',
      spec: { apg: 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/' },
      props: { keys: ['Mod', 'Shift', 'P'], platform: 'mac' },
      initial: {
        counts: { root: 1, key: 3, separator: 2 },
        parts: {
          root: { 'aria-label': 'Command + Shift + P', 'data-platform': 'mac' },
          separator: [
            { 'aria-hidden': 'true', 'hidden': '' },
            { 'aria-hidden': 'true', 'hidden': '' },
          ],
        },
      },
    },
    {
      name: '展示状态不暗中改变行为，只落到组根',
      spec: { apg: 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/' },
      props: { keys: ['S'], size: 'sm', disabled: true, pressed: true },
      initial: {
        parts: {
          root: { 'data-size': 'sm', 'data-disabled': '', 'data-pressed': '' },
          key: { 'data-disabled': null, 'data-pressed': null },
        },
      },
    },
  ],
}
