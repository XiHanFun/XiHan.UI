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

const LINE = { name: 'line', viewBox: '0 0 24 24', nodes: [{ tag: 'path', attrs: { d: 'M4 12h16' } }] } as const

/** 行首内容只归 item-icon：普通条目带图标、还写着旧的 indicator 文字，勾选条目带图标，另一条什么都不带。 */
export const LEADING_ITEMS = [
  { value: 'open', label: '打开', icon: LINE, indicator: '✓', shortcut: 'Ctrl+O' },
  { value: 'bold', label: '粗体', kind: 'checkbox', icon: LINE },
  { value: 'plain', label: '纯文本' },
] as const

/** 上面那组条目的部件次序：数据里的 indicator 不再铺标记位，对号只在勾选条目上、排在最后。 */
export const LEADING_EXPECTED: Readonly<Record<string, readonly string[]>> = {
  open: ['item-icon', 'item-text', 'item-shortcut'],
  bold: ['item-icon', 'item-text', 'item-indicator'],
  plain: ['item-text'],
}

/** 子菜单入口按数据铺：带 children 的条目写了 icon，入口与普通条目一样铺 item-icon，文字在 item-text 里。 */
export const SUBMENU_ICON_ITEMS = [
  { value: 'open', label: '打开', icon: LINE },
  { value: 'more', label: '更多', icon: LINE, children: [{ value: 'about', label: '关于' }] },
] as const

/** 上面那组条目的部件次序：子菜单入口与普通条目同样是图标在前、文字在后。 */
export const SUBMENU_ICON_EXPECTED: Readonly<Record<string, readonly string[]>> = {
  open: ['item-icon', 'item-text'],
  more: ['item-icon', 'item-text'],
}
