/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 kbd group.suite 相关实现。

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
        order: ['root', 'key[0]', 'key[1]'],
        counts: { root: 1, key: 2 },
        parts: {
          root: {
            'role': 'img',
            'aria-label': 'Control + S',
            'data-platform': 'other',
            'data-variant': 'default',
          },
          key: [
            { 'aria-hidden': 'true' },
            { 'aria-hidden': 'true' },
          ],
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
      name: 'Mac 符号连排时只生成键名节点',
      spec: { apg: 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/' },
      props: { keys: ['Mod', 'Shift', 'P'], platform: 'mac' },
      initial: {
        counts: { root: 1, key: 3 },
        parts: {
          root: { 'aria-label': 'Command + Shift + P', 'data-platform': 'mac' },
        },
      },
    },
    {
      name: 'light 外观如实落到组根',
      spec: { apg: 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/' },
      props: { keys: ['S'], variant: 'light' },
      initial: {
        parts: {
          root: { 'data-variant': 'light' },
        },
      },
    },
  ],
}
