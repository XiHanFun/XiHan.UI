/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 json viewer 相关实现。

import type { PropFn } from '@xihan-ui/core'
import type {
  JsonViewerFlattenOptions,
  JsonViewerNode,
  JsonViewerSchema,
  JsonViewerTextSegment,
  JsonViewerTokenKind,
  JsonViewerTool,
  JsonViewerValueType,
  JsonViewerWalkOptions,
} from './json-viewer.types'
import { setTimeoutEffect, setup } from '@xihan-ui/core'
import { uniqueArray as unique } from '../shared/array'
import { resolveClipboardTimeout, writeToClipboard } from '../shared/clipboard-write'

const { createMachine } = setup<JsonViewerSchema>()

/** 根行的路径。子行路径由它逐层拼出来。 */
export const JSON_VIEWER_ROOT_PATH = '$'

/**
 * 内建工具在条上的排列：随形态出没的几颗（展开 / 收起、换行）排在前，
 * 复制与原文开关钉在末端，两档切过去这两颗不挪位置。
 */
export const JSON_VIEWER_TOOLS: readonly JsonViewerTool[] = ['expand', 'wrap', 'copy', 'view']

/**
 * tools 归一成条上要铺的工具：不提供或 false 即没有工具条，true 即全部，数组按条上的排列取其中列出的几项。
 * 数组里有未知的工具名直接抛错：拼错一个名字，那颗钮会悄无声息地不见。
 */
export function resolveJsonViewerTools(tools: boolean | readonly JsonViewerTool[] | undefined): JsonViewerTool[] {
  if (!tools)
    return []
  if (tools === true)
    return [...JSON_VIEWER_TOOLS]
  const unknown = tools.filter(tool => !JSON_VIEWER_TOOLS.includes(tool))
  if (unknown.length)
    throw new Error(`[xh] JsonViewer 的 tools 只认 ${JSON_VIEWER_TOOLS.join(' / ')}，收到 ${unknown.map(String).join('、')}`)
  return JSON_VIEWER_TOOLS.filter(tool => tools.includes(tool))
}

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
 * 把一段 JSON 原文按缩进重排：只动字面量之外的空白，数字、字符串的写法一字不改。
 * 解析过的值会把超出安全整数的数字改成近似值，原文档要的是与来源一致的那一份，所以不经 JSON.parse 的结果重写。
 * 解析不了（不是合法 JSON）就原样返回。空对象与空数组写成一对括号，排版与 JSON.stringify(_, null, indent) 一致。
 */
export function formatJsonSource(source: string, indent = 2): string {
  try {
    JSON.parse(source)
  }
  catch {
    return source
  }
  const pad = (level: number): string => `\n${' '.repeat(indent * level)}`
  let out = ''
  let level = 0
  let inString = false
  let escaped = false
  for (let i = 0; i < source.length; i++) {
    const ch = source[i]!
    if (inString) {
      out += ch
      if (escaped)
        escaped = false
      else if (ch === '\\')
        escaped = true
      else if (ch === '"')
        inString = false
      continue
    }
    switch (ch) {
      case '"':
        inString = true
        out += ch
        break
      case '{':
      case '[': {
        const close = ch === '{' ? '}' : ']'
        let next = i + 1
        while (next < source.length && ' \t\n\r'.includes(source[next]!))
          next++
        if (source[next] === close) {
          out += ch + close
          i = next
          break
        }
        level++
        out += ch + pad(level)
        break
      }
      case '}':
      case ']':
        level--
        out += pad(level) + ch
        break
      case ',':
        out += `,${pad(level)}`
        break
      case ':':
        out += ': '
        break
      // JSON 的空白只有这四种，字面量之外的一律丢掉、由上面重新排
      case ' ':
      case '\t':
      case '\n':
      case '\r':
        break
      default:
        out += ch
    }
  }
  return out
}

const JSON_WHITESPACE = ' \t\n\r'
const JSON_PUNCTUATION = '{}[],:'
const JSON_NUMBER_CHARS = '0123456789+-.eE'

/**
 * 把一段 JSON 原文按类别切段，供原文档与树档同一套颜色着色；依次拼接恒等于原文。
 * 字符串后面紧跟冒号（中间只隔空白）就是键名；相邻的标点并成一段、连续空白并成一段，少铺几个节点。
 * 只认 JSON 的写法：遇到认不出的字符（原文不是 JSON，比如一段 User-Agent）就整段退回不着色，
 * 不按半截猜出来的类别乱上色。
 */
export function tokenizeJsonText(text: string): JsonViewerTextSegment[] {
  const out: JsonViewerTextSegment[] = []
  const push = (piece: string, kind: JsonViewerTokenKind | null): void => {
    const last = out[out.length - 1]
    // 同类的标点与空白接着上一段写；键名与标量各自成段
    if (last && last.kind === kind && (kind === null || kind === 'punctuation'))
      last.text += piece
    else
      out.push({ text: piece, kind })
  }
  const plain = (): JsonViewerTextSegment[] => (text ? [{ text, kind: null }] : [])

  let i = 0
  while (i < text.length) {
    const ch = text[i]!
    if (JSON_WHITESPACE.includes(ch)) {
      push(ch, null)
      i++
      continue
    }
    if (JSON_PUNCTUATION.includes(ch)) {
      push(ch, 'punctuation')
      i++
      continue
    }
    if (ch === '"') {
      let end = i + 1
      while (end < text.length && text[end] !== '"')
        end += text[end] === '\\' ? 2 : 1
      // 没有收口的引号：不是一段完整的 JSON
      if (end >= text.length)
        return plain()
      end++
      let next = end
      while (next < text.length && JSON_WHITESPACE.includes(text[next]!))
        next++
      push(text.slice(i, end), text[next] === ':' ? 'key' : 'string')
      i = end
      continue
    }
    if (ch === '-' || (ch >= '0' && ch <= '9')) {
      let end = i + 1
      while (end < text.length && JSON_NUMBER_CHARS.includes(text[end]!))
        end++
      push(text.slice(i, end), 'number')
      i = end
      continue
    }
    const literal = ['true', 'false', 'null'].find(word => text.startsWith(word, i))
    if (literal) {
      push(literal, literal === 'null' ? 'null' : 'boolean')
      i += literal.length
      continue
    }
    return plain()
  }
  return out
}

/**
 * 原文档展示、复制钮写入的那份文本：给了 source 就重排它，否则由 value 序列化。
 * 连接层与复制副作用共用这一处，两边拿到的永远是同一份。
 */
export function jsonViewerText(prop: PropFn<JsonViewerSchema>): string {
  const source = prop('source')
  return source != null ? formatJsonSource(source) : jsonText(prop('value'), !!prop('sortKeys'))
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

/** 搜索词归一：去掉首尾空白、按不区分大小写比较；空串即没有搜索。 */
export function jsonSearchQuery(search: string | undefined): string {
  return (search ?? '').trim().toLowerCase()
}

export interface JsonSearchResult {
  /** 命中行的路径，按树序排列。 */
  matches: string[]
  /** 命中行的祖先分支路径：把它们都展开，命中行才看得见。 */
  ancestors: string[]
}

/**
 * 在整棵树里找含有搜索词的行：键名或值文本里含有它即命中（不区分大小写）。
 * 不看展开态，收起的分支里的行一样找得到；maxItems 折掉的成员不在其中，它们本来就不显示。
 * 截断占位行没有自己的内容，不参与命中。
 */
export function jsonSearch(value: unknown, search: string | undefined, options: JsonViewerWalkOptions = {}): JsonSearchResult {
  const query = jsonSearchQuery(search)
  if (!query || value === undefined)
    return { matches: [], ancestors: [] }
  const rows = collectRows(value, options, () => true)
  const byPath = new Map(rows.map(row => [row.value, row]))
  const matches: string[] = []
  const ancestors = new Set<string>()
  for (const row of rows) {
    if (row.truncated)
      continue
    const hit = (row.key ?? '').toLowerCase().includes(query) || row.text.toLowerCase().includes(query)
    if (!hit)
      continue
    matches.push(row.value)
    for (let parent = row.parent; parent != null; parent = byPath.get(parent)?.parent ?? null)
      ancestors.add(parent)
  }
  return { matches, ancestors: [...ancestors] }
}

/** 路径集合按元素比：受控时 cell 每次读都产出新数组，默认的 Object.is 恒不相等。 */
function samePaths(a: string[] | null, b: string[] | null | undefined): boolean {
  if (a == null || b == null)
    return a === b
  return a.length === b.length && a.every((v, i) => v === b[i])
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
    // 按压通道：正被按住的分支行，与展开集合互相独立（Enter 在 keydown 即翻面，按压面不能随之丢）
    pressedValue: cell<string | null>(() => ({ defaultValue: null })),
    activeMatch: cell<string | null>(() => ({ defaultValue: null })),
    // 两个开关与展开集合同一套受控收口：提供 prop 即 cell 直读，写入只发通知
    view: cell<JsonViewerSchema['context']['view']>(() => ({
      value: prop('view'),
      defaultValue: prop('defaultView') ?? 'tree',
      onChange: view => prop('onViewChange')?.({ view }),
    })),
    wrap: cell<boolean>(() => ({
      value: prop('wrap'),
      defaultValue: prop('defaultWrap') ?? false,
      onChange: wrap => prop('onWrapChange')?.({ wrap }),
    })),
    // 工具条的按压通道，与分支行那一路各记各的：一颗钮与一行不会同时被同一个手指按住
    pressedTool: cell<JsonViewerSchema['context']['pressedTool']>(() => ({ defaultValue: null })),
  }),
  initialState: () => 'idle',
  // 首帧就带着搜索词时同样要把命中行展开出来
  entry: ['revealMatches'],
  watch: ({ track, prop, action }) => {
    track([() => prop('search'), () => prop('value')], () => action(['syncSearch']))
  },
  // 树与两个开关的事件不分复制相位：写入在途、停留窗口里照常能展开、切形态
  // 省略 target：只跑 actions，不换状态
  on: {
    'EXPANDED.SET': { actions: ['setExpanded'] },
    'BRANCH.EXPAND': { actions: ['expandBranch'] },
    'BRANCH.COLLAPSE': { actions: ['collapseBranch'] },
    'BRANCH.TOGGLE': { actions: ['toggleBranch'] },
    'NODE.FOCUS': { actions: ['setFocusedValue'] },
    'VIEWER.BLUR': { actions: ['clearFocusWithin'] },
    // 按压通道：视图没有禁用态，没有守卫；分支行只是内容的一行，按住只记事实
    'PRESS.START': { actions: ['startPress'] },
    'PRESS.END': { actions: ['endPress'] },
    'MATCH.SET': { actions: ['setActiveMatch', 'scrollToActiveMatch'] },
    'SEARCH.SYNC': { actions: ['revealMatches'] },
    'VIEW.SET': { actions: ['setView'] },
    'WRAP.SET': { actions: ['setWrap'] },
    'TOOL.PRESS.START': { actions: ['startToolPress'] },
    'TOOL.PRESS.END': { actions: ['endToolPress'] },
  },
  // 状态只记复制钮的写入相位，与剪贴板组件同一条路：在途不接第二次，成功后停留一阵再回落
  states: {
    idle: {
      on: {
        'COPY.TRIGGER': { target: 'copying' },
      },
    },
    copying: {
      effects: ['writeText'],
      on: {
        'COPY.SUCCESS': { target: 'copied' },
        // 失败一律回 idle，不留下「已复制」的假象
        'COPY.ERROR': { target: 'idle', actions: ['invokeCopyError'] },
        // 不接 COPY.TRIGGER：写入在途，连点不重复发写请求
      },
    },
    copied: {
      effects: ['trackCopiedTimeout'],
      on: {
        'after.timeout': { target: 'idle' },
        // 停留窗口里再点一次重新写
        'COPY.TRIGGER': { target: 'copying' },
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
      startPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.START')
          context.set('pressedValue', e.value)
      },
      // 只收自己那一下：别的分支行的 keyup 不该把正按着的这一行松开
      endPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.END' && context.get('pressedValue') === e.value)
          context.set('pressedValue', null)
      },
      syncSearch: ({ send }) => send({ type: 'SEARCH.SYNC' }),
      /**
       * 命中行的祖先分支并进展开集合：写进去而不是只在渲染时临时摊开，
       * 用户随后照常能把它们收起，搜索词清空后展开的分支也留着。停在哪一条回到未选。
       */
      revealMatches: ({ context, prop }) => {
        context.set('activeMatch', null)
        const { ancestors } = jsonSearch(prop('value'), prop('search'), {
          maxItems: prop('maxItems'),
          sortKeys: prop('sortKeys'),
        })
        if (!ancestors.length)
          return
        const current = context.get('expandedValue') ?? jsonSeedExpanded(prop)
        const missing = ancestors.filter(path => !current.includes(path))
        if (missing.length)
          context.set('expandedValue', [...current, ...missing])
      },
      setActiveMatch: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'MATCH.SET')
          context.set('activeMatch', e.value)
      },
      // 停住的那一条滚进视野：它的祖先已经在搜索时展开，这一行就在树里
      scrollToActiveMatch: ({ context, scope }) => {
        const value = context.get('activeMatch')
        const tree = scope.getById(scope.partId('json-viewer', 'tree'))
        if (value == null || !tree)
          return
        const escape = scope.getWin().CSS?.escape ?? ((raw: string) => raw.replace(/["\\]/g, '\\$&'))
        tree.querySelector<HTMLElement>(`[data-value="${escape(value)}"]`)?.scrollIntoView?.({ block: 'nearest' })
      },
      setView: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'VIEW.SET')
          context.set('view', e.view)
      },
      setWrap: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'WRAP.SET')
          context.set('wrap', e.wrap)
      },
      invokeCopyError: ({ prop, event }) => {
        const e = event.current()
        if (e.type !== 'COPY.ERROR')
          return
        // 取事件带来的那份，不重读数据：写入途中宿主换了 value，报出去的就不是实际写入的那一份
        prop('onCopyError')?.({ error: e.error, value: e.value })
      },
      startToolPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'TOOL.PRESS.START')
          context.set('pressedTool', e.part)
      },
      // 只收自己那一颗：别的钮的 keyup 不该把正按着的这一颗松开
      endToolPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'TOOL.PRESS.END' && context.get('pressedTool') === e.part)
          context.set('pressedTool', null)
      },
    },
    effects: {
      /** 异步写入。原文在发起那一刻定死，不在兑现时重算：途中换了数据，写进去的仍是点下去那一刻看到的。 */
      writeText: ({ prop, scope, send }) => {
        let disposed = false
        const value = jsonViewerText(prop)

        writeToClipboard(scope, value).then(
          () => {
            if (!disposed)
              send({ type: 'COPY.SUCCESS' })
          },
          (error: unknown) => {
            if (!disposed)
              send({ type: 'COPY.ERROR', error, value })
          },
        )

        return () => {
          disposed = true
        }
      },
      // 停留时长与剪贴板组件的缺省同值：同一页里两种复制钮的对钩停一样久
      trackCopiedTimeout: ({ send }) => setTimeoutEffect(() => send({ type: 'after.timeout' }), resolveClipboardTimeout(undefined)),
    },
  },
})
