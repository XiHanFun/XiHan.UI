import type { ConformanceSuite } from '../conformance/types'
import { buttonAnatomy, buttonKeyboard } from '@xihan-ui/headless'
import { nativeActivation } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/'

// 用例内挂的作者处理器调用次数，每条用例挂监听器时清零
let authorClicks = 0

export const buttonSuite: ConformanceSuite = {
  component: 'button',
  anatomy: buttonAnatomy,
  keyboard: buttonKeyboard,
  fixture: { part: 'root', tag: 'button', children: [{ text: '按钮' }] },
  cases: [
    {
      // Enter / Space 激活由平台负责，这里只验它是原生 <button type=button>
      name: 'Enter / Space 激活：角色节点是原生 <button type="button">，激活交给平台',
      spec: { apg: APG },
      covers: ['button.kbd.activate'],
      steps: [nativeActivation('button', 'root')],
    },
    {
      name: '默认：type=button，单一 root，无禁用/加载态',
      spec: { apg: APG },
      initial: {
        order: ['root'],
        counts: { root: 1, label: 0 },
        parts: {
          root: {
            'type': 'button',
            'disabled': null,
            'aria-disabled': null,
            'data-state': null,
            'data-disabled': null,
            'data-loading': null,
          },
        },
      },
    },
    {
      name: 'variant/size/type 属性接线到 data-* 与原生 type',
      spec: { apg: APG },
      props: { variant: 'solid', size: 'sm', type: 'submit' },
      initial: {
        parts: { root: { 'type': 'submit', 'data-variant': 'solid', 'data-size': 'sm' } },
      },
    },
    {
      name: 'disabled：原生 disabled + data-state=disabled，不上 aria-disabled',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { disabled: true },
      initial: {
        parts: {
          root: {
            'disabled': '',
            'data-disabled': '',
            'data-state': 'disabled',
            'aria-disabled': null,
            'data-loading': null,
          },
        },
      },
    },
    {
      name: 'loading：aria-disabled=true + data-state=loading，不上原生 disabled（保留焦点）',
      spec: { apg: APG },
      props: { loading: true },
      initial: {
        parts: {
          root: {
            'aria-disabled': 'true',
            'data-loading': '',
            'data-state': 'loading',
            'disabled': null,
          },
        },
      },
    },
    {
      // loading 走 aria-disabled + 拦事件，点击仍派发到节点上，须在同一节点上拦掉
      name: 'loading：点击不触达作者挂在同一节点上的处理器',
      spec: { apg: APG },
      props: { loading: true },
      steps: [
        {
          kind: 'raw',
          why: '"作者的处理器没被调用"要真挂一个上去才验得到',
          run: ({ doc }) => {
            authorClicks = 0
            const el = doc.querySelector<HTMLElement>('[data-scope="button"][data-part="root"]')
            if (!el)
              throw new Error('找不到 button 的 root 部件')
            el.addEventListener('click', () => {
              authorClicks++
            })
          },
        },
        { kind: 'click', part: 'root' },
        {
          kind: 'raw',
          why: '同上',
          run: () => {
            if (authorClicks !== 0)
              throw new Error(`loading 时作者的 click 处理器被调用了 ${authorClicks} 次，应当一次都不调用`)
          },
        },
      ],
    },
    {
      // 反面对照：非 loading 时照常触达
      name: '非 loading：点击照常触达作者的处理器',
      spec: { apg: APG },
      steps: [
        {
          kind: 'raw',
          why: '与上一条成对，验拦截没有误伤',
          run: ({ doc }) => {
            authorClicks = 0
            doc.querySelector<HTMLElement>('[data-scope="button"][data-part="root"]')!
              .addEventListener('click', () => {
                authorClicks++
              })
          },
        },
        { kind: 'click', part: 'root' },
        {
          kind: 'raw',
          why: '同上',
          run: () => {
            if (authorClicks !== 1)
              throw new Error(`正常按钮的 click 处理器被调用了 ${authorClicks} 次，应当恰好一次`)
          },
        },
      ],
    },
  ],
}
