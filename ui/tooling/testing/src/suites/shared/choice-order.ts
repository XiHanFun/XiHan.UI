import type { StepWithExpect } from '../../conformance/types'

/** 一组勾选与单选条目：一条带说明与快捷键，一组单选里一条只有文字、一条带快捷键。 */
export const CHOICE_ORDER_ITEMS = [
  { value: 'wrap', label: '自动换行', kind: 'checkbox', description: '长行折到下一行', shortcut: 'Alt+Z' },
  { value: 'comfortable', label: '宽松', kind: 'radio', group: 'density', separatorBefore: true },
  { value: 'compact', label: '紧凑', kind: 'radio', group: 'density', shortcut: 'Ctrl+2' },
] as const

/** 上面那组条目里各自的部件次序：对号（item-indicator）是条目的最后一个部件，排在正文、说明与快捷键之后。 */
export const CHOICE_ORDER_EXPECTED: Readonly<Record<string, readonly string[]>> = {
  wrap: ['item-text', 'item-description', 'item-shortcut', 'item-indicator'],
  comfortable: ['item-text', 'item-indicator'],
  compact: ['item-text', 'item-shortcut', 'item-indicator'],
}

/**
 * 按 value 逐条读条目里子部件的文档序。部件引用只认得出部件，比不出同一条目里子节点的先后，读屏与 DOM 的顺序靠这一步钉住。
 */
export function choicePartOrder(scope: string, expected: Readonly<Record<string, readonly string[]>> = CHOICE_ORDER_EXPECTED): StepWithExpect {
  return {
    kind: 'raw',
    why: '部件引用比不出同一条目里子节点的先后，按条目逐个读子部件的文档序',
    run: async ({ doc, flush }) => {
      const read = (): Record<string, string[] | null> => Object.fromEntries(Object.keys(expected).map((value) => {
        const item = doc.querySelector(`[data-scope="${scope}"][data-part="item"][data-value="${value}"]`)
        return [value, item ? [...item.children].map(child => child.getAttribute('data-part') ?? '').filter(Boolean) : null]
      }))
      const same = (actual: Record<string, string[] | null>): boolean =>
        Object.entries(expected).every(([value, parts]) => actual[value]?.join(' ') === parts.join(' '))
      let actual = read()
      for (let round = 0; round < 10 && !same(actual); round++) {
        await flush()
        actual = read()
      }
      if (!same(actual))
        throw new Error(`条目里的部件次序：期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`)
    },
  }
}
