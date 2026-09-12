import type { ConformanceSuite } from '../conformance/types'
import { hotkeysAnatomy, hotkeysKeyboard } from '@xihan-ui/headless'

const SPEC = 'https://www.w3.org/TR/uievents/#event-type-keydown'

function pressed(key: string, init: KeyboardEventInit, target: EventTarget): boolean {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  target.dispatchEvent(event)
  return event.defaultPrevented
}

export const hotkeysSuite: ConformanceSuite = {
  component: 'hotkeys',
  anatomy: hotkeysAnatomy,
  keyboard: hotkeysKeyboard,
  defaultProps: { keys: ['Mod', 'S'], platform: 'other' },
  // renderless：纯结构节点不属于组件，快照中应没有任何 part。
  fixture: { tag: 'span' },
  cases: [
    {
      name: '命中严格组合并默认阻止浏览器动作，全程不生成视觉 part',
      spec: { apg: SPEC },
      covers: ['hotkeys.keydown.trigger'],
      props: { keys: ['Mod', 'S'], platform: 'other' },
      initial: { order: [], counts: {} },
      steps: [{
        kind: 'raw',
        why: 'renderless 组件没有可派键的 part，直接向所属 Document 派真实 keydown',
        run: ({ doc }) => {
          if (!pressed('s', { ctrlKey: true }, doc.body))
            throw new Error('Ctrl+S 没被 Hotkeys 接住')
          if (pressed('S', { ctrlKey: true, shiftKey: true }, doc.body))
            throw new Error('Ctrl+Shift+S 不应误命中 Ctrl+S')
        },
      }],
    },
    {
      name: '没有命令修饰键时输入区优先',
      spec: { apg: SPEC },
      covers: ['hotkeys.keydown.typing'],
      props: { keys: ['S'], platform: 'other' },
      steps: [{
        kind: 'raw',
        why: '打字落点需要真实输入节点',
        run: ({ doc }) => {
          const input = doc.createElement('input')
          doc.body.append(input)
          try {
            if (pressed('s', {}, input))
              throw new Error('单键 Hotkeys 不应接走输入框字符')
            if (!pressed('s', {}, doc.body))
              throw new Error('单键 Hotkeys 在非输入区应当命中')
          }
          finally {
            input.remove()
          }
        },
      }],
    },
  ],
}
