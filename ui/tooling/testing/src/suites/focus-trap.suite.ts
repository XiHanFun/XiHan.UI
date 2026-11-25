// focus-trap 的一致性套件：锁「激活时焦点进来、Tab 在两端回绕、停用不再陷」。

import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { focusTrapAnatomy, focusTrapKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction'

// 里面的按钮是作者内容、不是部件，快照的焦点落点只认得到部件：认是哪一颗得直接读节点。
const WHY = '里面的按钮是作者内容不是部件，焦点落在哪一颗只能直接读节点'

function buttonOf(doc: Document, text: string): HTMLButtonElement {
  const button = [...doc.querySelectorAll('button')].find(el => el.textContent === text)
  if (!button)
    throw new Error(`fixture 里没有「${text}」按钮`)
  return button
}

/** 把焦点放到写着 text 的那颗按钮上。 */
function focusButton(text: string) {
  return async ({ doc, flush }: RawStepContext): Promise<void> => {
    buttonOf(doc, text).focus()
    await flush()
  }
}

/** 焦点此刻正落在写着 text 的那颗按钮上。 */
function expectFocused(text: string) {
  return ({ doc }: RawStepContext): void => {
    const active = doc.activeElement
    if (active !== buttonOf(doc, text))
      throw new Error(`焦点在 ${active?.outerHTML ?? 'null'} 上，期望在「${text}」按钮上`)
  }
}

/** 等两帧：焦点域挂载时的补试排在后续帧里，「没挪焦点」要等这几帧过去才算数。 */
async function frames({ doc, flush }: RawStepContext): Promise<void> {
  const win = doc.defaultView!
  for (let i = 0; i < 4; i++)
    await new Promise<void>(resolve => win.requestAnimationFrame(() => resolve()))
  await flush()
}

export const focusTrapSuite: ConformanceSuite = {
  component: 'focus-trap',
  anatomy: focusTrapAnatomy,
  keyboard: focusTrapKeyboard,
  fixture: {
    part: 'root',
    tag: 'div',
    children: [
      { tag: 'button', text: 'A' },
      { tag: 'button', text: 'B' },
    ],
  },
  cases: [
    {
      name: '缺省激活：根带 tabindex=-1 与 data-state=active、不写 role，焦点移到第一个可聚焦元素',
      spec: { apg: APG },
      initial: {
        order: ['root'],
        counts: { root: 1 },
        parts: { root: { 'role': null, 'tabindex': '-1', 'data-state': 'active' } },
      },
      steps: [
        { kind: 'settle', until: { activeElement: 'root' }, expect: { activeElement: { part: 'root', exact: false } } },
        { kind: 'raw', why: WHY, run: expectFocused('A') },
      ],
    },
    {
      name: 'Tab 在最后一个上回到第一个，Shift+Tab 在第一个上回到最后一个',
      spec: { apg: APG },
      covers: ['focus-trap.kbd.tab', 'focus-trap.kbd.shift-tab'],
      steps: [
        { kind: 'settle', until: { activeElement: 'root' } },
        { kind: 'raw', why: WHY, run: focusButton('B') },
        { kind: 'key', key: 'Tab' },
        { kind: 'raw', why: WHY, run: expectFocused('A') },
        { kind: 'key', key: 'Tab', modifiers: ['Shift'] },
        { kind: 'raw', why: WHY, run: expectFocused('B') },
      ],
    },
    {
      name: 'active=false：不陷焦点，根不带 tabindex、data-state=inactive，焦点不挪',
      spec: { apg: APG },
      props: { active: false },
      initial: {
        parts: { root: { 'tabindex': null, 'data-state': 'inactive' } },
        activeElement: null,
      },
      steps: [{ kind: 'raw', why: '「没挪焦点」要等焦点域的补试帧过去才算数', run: frames }],
      expect: { activeElement: null },
    },
    {
      name: '由激活转为停用：data-state=inactive、撤掉 tabindex',
      spec: { apg: APG },
      steps: [
        { kind: 'settle', until: { activeElement: 'root' } },
        { kind: 'setProps', props: { active: false } },
        {
          kind: 'settle',
          until: { attr: { part: 'root', name: 'data-state', value: 'inactive' } },
          expect: { parts: { root: { tabindex: null } } },
        },
      ],
    },
    {
      name: 'autoFocus=false：激活但不挪焦点',
      spec: { apg: APG },
      props: { autoFocus: false },
      initial: { parts: { root: { 'data-state': 'active' } } },
      steps: [{ kind: 'raw', why: '「没挪焦点」要等焦点域的补试帧过去才算数', run: frames }],
      expect: { activeElement: null },
    },
  ],
}
