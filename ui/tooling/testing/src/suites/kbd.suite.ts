/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 kbd.suite 相关实现。

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
            'data-variant': 'default',
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
      name: 'light 外观如实投影',
      spec: { apg: 'https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-kbd-element' },
      props: { value: 'Enter', platform: 'other', variant: 'light' },
      initial: {
        parts: {
          root: {
            'aria-label': 'Enter',
            'data-variant': 'light',
          },
        },
      },
    },
  ],
}
