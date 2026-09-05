import type { PropFn } from '@xihan-ui/core'
import type {
  JsonViewerFlattenOptions,
  JsonViewerNode,
  JsonViewerSchema,
  JsonViewerValueType,
  JsonViewerWalkOptions,
} from './json-viewer.types'
import { setup } from '@xihan-ui/core'

const { createMachine } = setup<JsonViewerSchema>()

/** 根行的路径。子行路径由它逐层拼出来。 */
export const JSON_VIEWER_ROOT_PATH = '$'

/**
 * 子行路径。键一律用 JSON 串包起来：直接拼 `.` 会让 `{ a: { b: 1 }, 'a.b': 2 }`
 * 这两条路径撞成同一个串，而路径同时是展开集合的元素与 DOM 身份。
 */
export function jsonChildPath(parent: string, key: string): string {
  return `${parent}[${JSON.stringify(key)}]`
}

/** 值的类型标签。JSON 之外的值归到最接近的那一档。 */
export function jsonValueType(value: unknown): JsonViewerValueType {
  if (value === null || value === undefined)
    return 'null'
  if (Array.isArray(value))
    return 'array'
  const kind = typeof value
  if (kind === 'object')
    return 'object'
  if (kind === 'number' || kind === 'bigint')
    return 'number'
  if (kind === 'boolean')
    return 'boolean'
  return 'string'
}

function truncateText(raw: string, maxStringLength: number | undefined): string {
  if (maxStringLength == null || maxStringLength < 0 || raw.length <= maxStringLength)
    return raw
  return `${raw.slice(0, maxStringLength)}…`
}

/**
 * 叶子行的显示文字。字符串带引号，好让 `"12"` 与 `12` 在没有颜色时也分得开；
 * 空对象与空数组不当分支，直接把括号写出来。
 */
export function jsonValueText(value: unknown, maxStringLength?: number): string {
  switch (jsonValueType(value)) {
    case 'array':
      return '[]'
    case 'boolean':
    case 'number':
      return String(value)
    case 'null':
      return value === undefined ? 'undefined' : 'null'
    case 'object':
      return '{}'
    default: {
      // 引号只加在真字符串上：函数与 symbol 落进这一档，按 JS 自带的字符串形式呈现
      const quoted = typeof value === 'string'
      const text = truncateText(quoted ? value : String(value), maxStringLength)
      return quoted ? `"${text}"` : text
    }
  }
}

function isContainer(value: unknown): value is object {
  return typeof value === 'object' && value !== null
}

function memberCount(value: unknown, type: JsonViewerValueType): number {
  if (type === 'array')
    return (value as unknown[]).length
  if (type === 'object')
    return Object.keys(value as object).length
  return 0
}

/** 一层成员：数组按下标，对象按自有可枚举键。 */
function jsonEntries(
  value: unknown,
  type: JsonViewerValueType,
  sortKeys: boolean,
): Array<{ key: string, value: unknown }> {
  if (type === 'array')
    return (value as unknown[]).map((item, index) => ({ key: String(index), value: item }))
  if (type !== 'object')
    return []
  const keys = Object.keys(value as Record<string, unknown>)
  if (sortKeys) {
    // 按码位比而不是 localeCompare：同一份数据在不同语言环境下要摊出同一个顺序
    keys.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
  }
  return keys.map(key => ({ key, value: (value as Record<string, unknown>)[key] }))
}

/**
 * 把值序列化成缩进过的 JSON 原文，供原文档视图直接显示。
 *
 * 不走 JSON.stringify 的 replacer：环路防护要与树一致取祖先链而不是见过的全部对象，
 * 而 replacer 只拿得到「见过」这一档，会把两条不相干分支共享的同一个对象误判成环。
 * 键序同样复用 jsonEntries，两个视图切过去不会换顺序。
 */
export function jsonText(value: unknown, sortKeys: boolean, indent = 2): string {
  const pad = (level: number): string => ' '.repeat(indent * level)

  const write = (raw: unknown, level: number, ancestors: ReadonlySet<object>): string => {
    const type = jsonValueType(raw)
    if (!isContainer(raw)) {
      const literal = typeof raw === 'bigint' ? raw.toString() : JSON.stringify(raw)
      // undefined / 函数 / symbol 在 JSON 里没有写法：退回树上那份文本并按字符串写出，整份仍解析得动
      return literal ?? JSON.stringify(jsonValueText(raw))
    }
    if (ancestors.has(raw))
      return '"[Circular]"'

    const entries = jsonEntries(raw, type, sortKeys)
    const [open, close] = type === 'array' ? ['[', ']'] : ['{', '}']
    if (entries.length === 0)
      return `${open}${close}`

    const nested = new Set(ancestors)
    nested.add(raw)
    const body = entries
      .map((entry) => {
        const head = type === 'array' ? '' : `${JSON.stringify(entry.key)}: `
        return `${pad(level + 1)}${head}${write(entry.value, level + 1, nested)}`
      })
      .join(`,\n`)
    return `${open}\n${body}\n${pad(level)}${close}`
  }

  return write(value, 0, new Set())
}

/**
 * 深度优先摊一遍值，按 shouldDescend 决定要不要往某个分支里走。
 * 环路防护取祖先链而不是见过的全部对象：同一个对象出现在两条不相干的分支里只是共享引用，
 * 照样该摊开；出现在自己的祖先链上才会无限递归。
 */
function collectRows(
  value: unknown,
  options: JsonViewerWalkOptions,
  shouldDescend: (node: JsonViewerNode) => boolean,
): JsonViewerNode[] {
  const out: JsonViewerNode[] = []
  const { maxItems, maxStringLength, sortKeys } = options

  const visit = (
    key: string | null,
    raw: unknown,
    path: string,
    level: number,
    posInSet: number,
    setSize: number,
    parent: string | null,
    ancestors: ReadonlySet<object>,
  ): void => {
    const type = jsonValueType(raw)
    const container = isContainer(raw)
    const circular = container && ancestors.has(raw)
    const count = circular ? 0 : memberCount(raw, type)
    // 空对象与空数组不当分支：展开它一行也看不到，箭头是白给的
    const branch = container && !circular && count > 0
    const node: JsonViewerNode = {
      value: path,
      key,
      type,
      text: branch ? '' : circular ? '[Circular]' : jsonValueText(raw, maxStringLength),
      branch,
      count,
      level,
      posInSet,
      setSize,
      parent,
      circular,
      truncated: false,
    }
    out.push(node)
    if (!branch || !shouldDescend(node))
      return

    const entries = jsonEntries(raw, type, !!sortKeys)
    const shown = maxItems != null && maxItems >= 0 && entries.length > maxItems
      ? entries.slice(0, maxItems)
      : entries
    const rest = entries.length - shown.length
    // 截断占位也占一个同层位次：不算进 setSize，读屏念出的总数就与看得见的行数对不上
    const size = shown.length + (rest > 0 ? 1 : 0)
    const nested: ReadonlySet<object> = new Set([...ancestors, raw])
    shown.forEach((entry, index) => {
      visit(entry.key, entry.value, jsonChildPath(path, entry.key), level + 1, index + 1, size, path, nested)
    })
    if (rest > 0) {
      out.push({
        value: `${path}[…]`,
        key: null,
        // 跟着容器走：这一行说的是「这个数组/对象还剩多少项」
        type,
        text: '',
        branch: false,
        count: rest,
        level: level + 1,
        posInSet: size,
        setSize: size,
        parent: path,
        circular: false,
        truncated: true,
      })
    }
  }

  visit(null, value, JSON_VIEWER_ROOT_PATH, 1, 1, 1, null, new Set())
  return out
}

/**
 * 把任意值摊成可见行序列：只有展开的分支才把子行算进去。
 * 收起分支的子行一行不出——它们根本不进 DOM，键盘导航因此不必再过滤一遍可见性。
 */
export function flattenJson(value: unknown, options: JsonViewerFlattenOptions = {}): JsonViewerNode[] {
  // 顶层没给值就是空视图，一行也不摊；对象内部真有一个 undefined 成员时仍照常摊成一行
  if (value === undefined)
    return []
  const expandedValue = new Set(options.expandedValue ?? [])
  return collectRows(value, options, node => expandedValue.has(node.value))
}

/** 层级号不超过 depth 的分支路径，用作 defaultExpandedValue 缺省时的初始展开集合。 */
export function jsonExpandedPathsToDepth(
  value: unknown,
  depth: number,
  options: JsonViewerWalkOptions = {},
): string[] {
  if (!(depth > 0))
    return []
  // 只往 depth 层以内走：再深的分支这一轮不展开，也就不必摊出来
  return collectRows(value, options, node => node.level < depth)
    .filter(node => node.branch && node.level <= depth)
    .map(node => node.value)
}

/**
 * 没人碰过展开集合时它该是什么：显式给了 defaultExpandedValue 就用它，
 * 否则按 defaultExpandedDepth 从当下的 value 现算。
 *
 * 每次现算，不在挂载那一刻冻结：自定义元素常是先升级、再由脚本写 `.value`，
 * 挂载时数据还是空的，冻结下来的那一份永远只有一行。
 */
export function jsonSeedExpanded(prop: PropFn<JsonViewerSchema>): string[] {
  const declared = prop('defaultExpandedValue')
  if (declared)
    return declared
  return jsonExpandedPathsToDepth(prop('value'), prop('defaultExpandedDepth') ?? 1, {
    maxItems: prop('maxItems'),
    sortKeys: prop('sortKeys'),
  })
}

/** 路径集合按元素比：受控时 cell 每次读都产出新数组，默认的 Object.is 恒不相等。 */
function samePaths(a: string[] | null, b: string[] | null | undefined): boolean {
  if (a == null || b == null)
    return a === b
  return a.length === b.length && a.every((v, i) => v === b[i])
}

/** 去重且保序：展开集合是一个集合，重复元素没有意义。 */
function unique(values: readonly string[]): string[] {
  return [...new Set(values)]
}

// 展开集合住在 context 的 cell 里，受控/非受控在 cell 收口，不需要影子事件与受控守卫。
export const jsonViewerMachine = createMachine({
  name: 'json-viewer',
  context: ({ prop, cell }) => ({
    // null = 还没人碰过，读的时候按当下的数据现算（见 jsonSeedExpanded）；
    // 任何一次展开/收起都会把它落成具体的一份，从此不再跟着数据走
    expandedValue: cell<string[] | null>(() => ({
      value: prop('expandedValue'),
      defaultValue: null,
      isEqual: samePaths,
      onChange: (value) => {
        if (value)
          prop('onExpandedValueChange')?.({ value })
      },
    })),
    // 焦点锚点不受控、不对外通知：它只服务 roving tabindex 与方向键起点
    focusedValue: cell<string | null>(() => ({ defaultValue: null })),
    // 焦点在不在树内单独记：锚点要跨 Tab 往返留着，高亮不能留
    focusWithin: cell<boolean>(() => ({ defaultValue: false })),
  }),
  initialState: () => 'idle',
  states: {
    idle: {
      // 省略 target：只跑 actions，不换状态
      on: {
        'EXPANDED.SET': { actions: ['setExpanded'] },
        'BRANCH.EXPAND': { actions: ['expandBranch'] },
        'BRANCH.COLLAPSE': { actions: ['collapseBranch'] },
        'BRANCH.TOGGLE': { actions: ['toggleBranch'] },
        'NODE.FOCUS': { actions: ['setFocusedValue'] },
        'VIEWER.BLUR': { actions: ['clearFocusWithin'] },
      },
    },
  },
  implementations: {
    actions: {
      setExpanded: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'EXPANDED.SET')
          return
        context.set('expandedValue', unique(e.value))
      },
      expandBranch: ({ context, event, prop }) => {
        const e = event.current()
        if (e.type !== 'BRANCH.EXPAND')
          return
        const current = context.get('expandedValue') ?? jsonSeedExpanded(prop)
        if (current.includes(e.value))
          return
        context.set('expandedValue', [...current, e.value])
      },
      collapseBranch: ({ context, event, prop }) => {
        const e = event.current()
        if (e.type !== 'BRANCH.COLLAPSE')
          return
        const current = context.get('expandedValue') ?? jsonSeedExpanded(prop)
        context.set('expandedValue', current.filter(v => v !== e.value))
      },
      toggleBranch: ({ context, event, prop }) => {
        const e = event.current()
        if (e.type !== 'BRANCH.TOGGLE')
          return
        const current = context.get('expandedValue') ?? jsonSeedExpanded(prop)
        context.set(
          'expandedValue',
          current.includes(e.value) ? current.filter(v => v !== e.value) : [...current, e.value],
        )
      },
      setFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'NODE.FOCUS')
          return
        context.set('focusedValue', e.value)
        context.set('focusWithin', true)
      },
      // 焦点离场只落下高亮：锚点留着，Tab 回来才落得回上次那一行
      clearFocusWithin: ({ context }) => context.set('focusWithin', false),
    },
  },
})
