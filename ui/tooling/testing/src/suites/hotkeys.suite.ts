import type { ConformanceSuite } from '../conformance/types'
import { hotkeysAnatomy, hotkeysKeyboard } from '@xihan-ui/headless'

// 组件自己就是键盘装置，不属于任何 APG 模式；组合怎么从一次按键上读出来归 UI Events。
const SPEC = 'https://www.w3.org/TR/uievents/#event-type-keydown'

/**
 * 派一次真按键并回答「组件接没接住」。
 *
 * 判据只能是 defaultPrevented：组合命中的回调是 hot-key，而两个 harness 的对外事件清单
 * 都不收它，快照里看不见；preventDefault 默认开着，拦没拦下正好是同一件事的可观察面。
 */
function pressed(key: string, init: KeyboardEventInit, target: EventTarget): boolean {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  target.dispatchEvent(event)
  return event.defaultPrevented
}

/** 造一个输入框当按键落点，用完即摘，不留给后面的用例。 */
function inTypingField(doc: Document, run: (field: HTMLElement) => void): void {
  const field = doc.createElement('input')
  doc.body.appendChild(field)
  try {
    run(field)
  }
  finally {
    field.remove()
  }
}

export const hotkeysSuite: ConformanceSuite = {
  component: 'hotkeys',
  anatomy: hotkeysAnatomy,
  keyboard: hotkeysKeyboard,
  // 键帽与连接符按 keys 铺开，作者只写一个空壳当 root
  fixture: { part: 'root', tag: 'span' },
  cases: [
    {
      name: '默认：root 是一张图并自带整组组合的名字，键帽与连接符按 keys 铺开',
      spec: { apg: 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/' },
      props: { keys: ['Mod', 'S'] },
      initial: {
        order: ['root', 'key[0]', 'separator', 'key[1]'],
        counts: { root: 1, key: 2, separator: 1 },
        parts: {
          root: {
            // 一串符号连起来才是一个意思，逐枚念出来没有用
            'role': 'img',
            // 平台没测出来之前按非 Mac 出，Mod 因此落在 Control 上
            'aria-label': 'Control + S',
            'data-platform': 'other',
            'data-disabled': null,
            'data-size': null,
          },
          key: [
            { 'data-modifier': '' },
            // 主键不带这个标记，不输出 data-modifier="false"
            { 'data-modifier': null },
          ],
          separator: { hidden: null },
        },
      },
    },
    {
      name: 'Mac 写法：键帽换成符号且连接符那一格收起',
      spec: { apg: 'https://www.w3.org/WAI/ARIA/apg/' },
      props: { keys: ['Mod', 'Shift', 'S'], platform: 'mac' },
      initial: {
        counts: { root: 1, key: 3, separator: 2 },
        parts: {
          root: {
            'aria-label': 'Command + Shift + S',
            'data-platform': 'mac',
          },
          separator: [{ hidden: '' }, { hidden: '' }],
        },
      },
    },
    {
      name: 'keys 空着时不出 role：没有名字的图读屏只念得出「图像」两个字',
      spec: { apg: 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/' },
      props: { keys: [] },
      initial: {
        counts: { root: 1, key: 0, separator: 0 },
        parts: {
          root: { 'role': null, 'aria-label': null },
        },
      },
    },
    {
      name: '尺寸原样落到根上；监听关掉才写 data-disabled',
      spec: { apg: 'https://www.w3.org/WAI/ARIA/apg/' },
      props: { keys: ['Mod', 'S'], size: 'lg', enabled: false },
      initial: {
        parts: {
          root: {
            'data-size': 'lg',
            'data-disabled': '',
          },
        },
      },
    },
    {
      name: '按下 keys 指定的组合即接住，并默认拦下浏览器的默认动作',
      spec: { apg: SPEC },
      covers: ['hotkeys.kbd.trigger'],
      props: { keys: ['Mod', 'S'] },
      steps: [
        {
          kind: 'raw',
          why: '组合的出口是 hot-key 回调，两个 harness 的事件清单都不收它；拦没拦下默认动作是同一件事的可观察面',
          run: ({ doc }) => {
            if (!pressed('s', { ctrlKey: true }, doc.body))
              throw new Error('Ctrl+S 没被接住：组合命中时应当拦下浏览器的默认动作')
            // 多按一个 Shift 就是另一条组合，不该命中
            if (pressed('S', { ctrlKey: true, shiftKey: true }, doc.body))
              throw new Error('Ctrl+Shift+S 被 Ctrl+S 接走了：修饰键要逐个全等比')
          },
        },
      ],
    },
    {
      name: '组合里没有命令修饰键时，落在输入区里的按键让给输入',
      spec: { apg: SPEC },
      covers: ['hotkeys.kbd.typing'],
      props: { keys: ['S'] },
      steps: [
        {
          kind: 'raw',
          why: '打字落点的判定要真实的活节点，快照里没有这条通道',
          run: ({ doc }) => {
            if (!pressed('s', {}, doc.body))
              throw new Error('单键组合在非输入区没被接住')
            inTypingField(doc, (field) => {
              if (pressed('s', {}, field))
                throw new Error('单键组合在输入框里被接走了：打字会因此丢字')
            })
          },
        },
      ],
    },
  ],
}
