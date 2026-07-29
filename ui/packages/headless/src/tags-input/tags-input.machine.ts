import type { Params } from '@xihan-ui/machine'
import type { TagsInputSchema } from './tags-input.types'
import { setup } from '@xihan-ui/machine'
import { tagsInputEditInputId } from './tags-input.anatomy'

const { createMachine } = setup<TagsInputSchema>()

/** 默认断词符，同时是 hidden-input 拼串时的连接符。 */
export const TAGS_INPUT_DELIMITER = ','

/**
 * 生效的断词符。显式给空串是关掉断词，因此只能用 ?? 兜底：|| 会把空串当没给。
 */
export function tagsDelimiter(delimiter: string | undefined): string {
  return delimiter ?? TAGS_INPUT_DELIMITER
}

/** 标签的规范形态：去掉首尾空白。空串代表"这不是一个标签"。 */
export function normalizeTag(raw: string): string {
  return raw.trim()
}

/**
 * 按断词符把一段文本拆成若干标签，丢掉空白段。
 * 断词符为空串时整串当一个标签，按空串 split 会把文本劈成单个字符。
 */
export function splitTags(raw: string, delimiter: string): string[] {
  const chunks = delimiter === '' ? [raw] : raw.split(delimiter)
  return chunks.map(normalizeTag).filter(tag => tag !== '')
}

/** 逐项比对：数组每次都是新引用，不比内容的话值没变也会通知一遍。 */
export function sameTags(a: readonly string[], b: readonly string[] | undefined): boolean {
  return !!b && a.length === b.length && a.every((tag, i) => tag === b[i])
}

/** max 是否给了个能用的上限。负数与非有限值按"没给"处理。 */
function hasMax(max: number | undefined): max is number {
  return max != null && Number.isFinite(max) && max >= 0
}

/** 已顶到上限：再加一个就越界了。max 为 0 时空集合就已经到顶。 */
export function isAtMax(count: number, max: number | undefined): boolean {
  return hasMax(max) && count >= max
}

/** 已经越过上限。只有 allowOverflow 开着（或作者用 setValue 直接写超）才可能为真。 */
export function isOverflow(count: number, max: number | undefined): boolean {
  return hasMax(max) && count > max
}

/** 整份替换时的归一：去首尾空白、丢掉空白项、按首次出现去重。 */
export function normalizeTags(list: readonly string[]): string[] {
  const out: string[] = []
  for (const raw of list) {
    const tag = normalizeTag(raw)
    if (tag !== '' && !out.includes(tag))
      out.push(tag)
  }
  return out
}

export interface TagsAppendOptions {
  max?: number
  allowOverflow?: boolean
}

export interface TagsAppendResult {
  /** 追加之后的集合。rejected 非空时它只是个假设，调用方不该落盘。 */
  value: string[]
  /** 因上限而进不去的标签。空白项与"本来就在列表里"的不算被拒。 */
  rejected: string[]
}

/**
 * 往集合尾部追加一批标签：空白项丢弃、重复项跳过，只有被上限挡住的才进 rejected。
 */
export function appendTags(
  current: readonly string[],
  incoming: readonly string[],
  options: TagsAppendOptions = {},
): TagsAppendResult {
  const { max, allowOverflow } = options
  const value = [...current]
  const rejected: string[] = []
  for (const raw of incoming) {
    const tag = normalizeTag(raw)
    if (tag === '' || value.includes(tag))
      continue
    if (!allowOverflow && isAtMax(value.length, max)) {
      rejected.push(tag)
      continue
    }
    value.push(tag)
  }
  return { value, rejected }
}

/**
 * 追加的唯一写入口：有一个标签因上限进不去就整体不生效。
 * 返回这一次算不算数，输入框该不该清由调用方据此决定。
 */
function commitTags(params: Params<TagsInputSchema>, incoming: readonly string[]): boolean {
  const { context, prop } = params
  const current = context.get('value')
  const { value: next, rejected } = appendTags(current, incoming, {
    max: prop('max'),
    allowOverflow: prop('allowOverflow'),
  })
  if (rejected.length > 0)
    return false
  if (!sameTags(next, current))
    context.set('value', next)
  return true
}

/**
 * 标签集合与输入文本各住在自己的 cell 里，受控/非受控在 cell 收口，不需要影子事件与受控守卫。
 * FSM 只表达光标此刻在哪儿：在输入框、在标签之间、还是在改某个标签。
 */
export const tagsInputMachine = createMachine({
  name: 'tags-input',
  context: ({ prop, cell }) => ({
    value: cell<string[]>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? [],
      // 逐项比内容而不是比引用：每次写入都产出新数组，不给 isEqual 会重复通知宿主
      isEqual: sameTags,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    inputValue: cell<string>(() => ({
      value: prop('inputValue'),
      defaultValue: prop('defaultInputValue') ?? '',
      onChange: inputValue => prop('onInputValueChange')?.({ inputValue }),
    })),
    // 光标锚点与编辑缓冲都不受控、不对外通知：它们是交互过程，不是组件的值
    focusedValue: cell<string | null>(() => ({ defaultValue: null })),
    editedValue: cell<string>(() => ({ defaultValue: '' })),
  }),
  initialState: () => 'idle',
  // 这几条从哪个状态发出都一样，挂根级
  on: {
    'VALUE.SET': { actions: ['setValue'] },
    'TAG.ADD': { guard: 'canEdit', actions: ['addTags'] },
    'VALUE.CLEAR': { guard: 'canEdit', target: 'idle', actions: ['clearAll'] },
    // 承载焦点的标签节点没了，一律退回输入框
    'ITEM.FOCUS_LOST': { target: 'idle', actions: ['cancelEdit'] },
  },
  states: {
    idle: {
      on: {
        'INPUT.CHANGE': { guard: 'canEdit', actions: ['setInputValue'] },
        'INPUT.COMMIT': { guard: 'canEdit', actions: ['commitInput'] },
        'INPUT.BLUR': { guard: 'canEdit', actions: ['applyBlurBehavior'] },
        'TAG.HIGHLIGHT': { guard: 'canEdit', target: 'navigating', actions: ['setFocusedValue'] },
        'TAG.DELETE': { guard: 'canEdit', actions: ['deleteTag'] },
        'TAG.EDIT': { guard: 'canEditTag', target: 'editing', actions: ['startEdit'] },
      },
    },
    navigating: {
      on: {
        // 一开始打字就把光标交回输入框
        'INPUT.CHANGE': { guard: 'canEdit', target: 'idle', actions: ['clearFocusedValue', 'setInputValue'] },
        'INPUT.COMMIT': { guard: 'canEdit', target: 'idle', actions: ['clearFocusedValue', 'commitInput'] },
        'INPUT.BLUR': { guard: 'canEdit', target: 'idle', actions: ['clearFocusedValue', 'applyBlurBehavior'] },
        'TAG.HIGHLIGHT': [
          { guard: 'hasHighlightTarget', actions: ['setFocusedValue'] },
          // 走过末尾（value 为 null）即回到输入框
          { target: 'idle', actions: ['clearFocusedValue'] },
        ],
        'TAG.DELETE': [
          // 前面还有标签：光标落到它上面，接着按退格可以一路往回删
          { guard: 'canDeleteWithPrev', actions: ['deleteTag'] },
          // 删的是第一个：前面没得去了，光标交回输入框
          { guard: 'canEdit', target: 'idle', actions: ['deleteTag'] },
        ],
        'TAG.EDIT': { guard: 'canEditTag', target: 'editing', actions: ['startEdit'] },
      },
    },
    editing: {
      effects: ['focusEditInput'],
      on: {
        'EDIT.CHANGE': { actions: ['setEditedValue'] },
        'EDIT.SUBMIT': { target: 'idle', actions: ['commitEdit'] },
        'EDIT.CANCEL': { target: 'idle', actions: ['cancelEdit'] },
        // 编辑途中把这个标签删掉：编辑缓冲一并丢弃，别留下指向已消失标签的锚点
        'TAG.DELETE': { guard: 'canEdit', target: 'idle', actions: ['deleteTag', 'cancelEdit'] },
      },
    },
  },
  implementations: {
    guards: {
      canEdit: ({ prop }) => !prop('disabled') && !prop('readOnly'),
      // 就地编辑要三个条件：能改、开了 editable、且这个标签真的在列表里
      canEditTag: ({ prop, context, event }) => {
        if (prop('disabled') || prop('readOnly') || !prop('editable'))
          return false
        const e = event.current()
        return e.type === 'TAG.EDIT' && context.get('value').includes(e.value)
      },
      canDeleteWithPrev: ({ prop, context, event }) => {
        if (prop('disabled') || prop('readOnly'))
          return false
        const e = event.current()
        return e.type === 'TAG.DELETE' && context.get('value').indexOf(e.value) > 0
      },
      hasHighlightTarget: ({ event }) => {
        const e = event.current()
        return e.type === 'TAG.HIGHLIGHT' && e.value != null
      },
    },
    actions: {
      // 作者的整份替换：只做去重去空白，不夹 max
      setValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'VALUE.SET')
          context.set('value', normalizeTags(e.value))
      },
      addTags: (params) => {
        const e = params.event.current()
        if (e.type === 'TAG.ADD')
          commitTags(params, e.values)
      },
      clearAll: ({ context }) => {
        context.set('value', [])
        context.set('inputValue', '')
        context.set('focusedValue', null)
        context.set('editedValue', '')
      },
      setInputValue: (params) => {
        const e = params.event.current()
        if (e.type !== 'INPUT.CHANGE')
          return
        const { context, prop } = params
        const delimiter = tagsDelimiter(prop('delimiter'))
        const raw = e.value
        if (delimiter === '' || !raw.includes(delimiter)) {
          context.set('inputValue', raw)
          return
        }
        // 打出断词符即断词：断词符之前的每一段各成一个标签，最后一段留在框里接着打
        const parts = raw.split(delimiter)
        const trailing = parts.pop() ?? ''
        const tags = parts.map(normalizeTag).filter(tag => tag !== '')
        if (tags.length === 0) {
          // 连打两个断词符这类空白段全部吃掉，只留最后一段
          context.set('inputValue', trailing)
          return
        }
        // 顶到上限时这一次输入整体不生效，文本原样留在框里
        context.set('inputValue', commitTags(params, tags) ? trailing : raw)
      },
      commitInput: (params) => {
        const { context, prop } = params
        const raw = context.get('inputValue')
        const tags = splitTags(raw, tagsDelimiter(prop('delimiter')))
        if (tags.length === 0) {
          // 框里只有空白，清掉
          if (raw !== '')
            context.set('inputValue', '')
          return
        }
        if (commitTags(params, tags))
          context.set('inputValue', '')
      },
      applyBlurBehavior: (params) => {
        const behavior = params.prop('blurBehavior')
        if (behavior === 'add')
          params.action(['commitInput'])
        else if (behavior === 'clear')
          params.context.set('inputValue', '')
      },
      setFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'TAG.HIGHLIGHT')
          context.set('focusedValue', e.value)
      },
      clearFocusedValue: ({ context }) => {
        context.set('focusedValue', null)
      },
      deleteTag: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'TAG.DELETE')
          return
        const current = context.get('value')
        const index = current.indexOf(e.value)
        if (index < 0)
          return
        const next = [...current]
        next.splice(index, 1)
        context.set('value', next)
        // 光标落到前一个标签上；删的是第一个就交回输入框
        context.set('focusedValue', index > 0 ? current[index - 1]! : null)
      },
      startEdit: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'TAG.EDIT')
          return
        context.set('focusedValue', e.value)
        // 缓冲从原值起步，进来就空着的话按 Enter 会把标签删掉
        context.set('editedValue', e.value)
      },
      setEditedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'EDIT.CHANGE')
          context.set('editedValue', e.value)
      },
      commitEdit: ({ context }) => {
        const from = context.get('focusedValue')
        const current = context.get('value')
        const index = from == null ? -1 : current.indexOf(from)
        if (index >= 0) {
          const tag = normalizeTag(context.get('editedValue'))
          const next = [...current]
          if (tag === '')
            // 改成空白等于把这个标签删掉
            next.splice(index, 1)
          else if (tag !== from && current.includes(tag))
            // 改成了另一个已有标签，并成一个
            next.splice(index, 1)
          else
            next[index] = tag
          if (!sameTags(next, current))
            context.set('value', next)
        }
        context.set('focusedValue', null)
        context.set('editedValue', '')
      },
      cancelEdit: ({ context }) => {
        context.set('focusedValue', null)
        context.set('editedValue', '')
      },
    },
    effects: {
      /**
       * 进编辑态就把焦点送进编辑框。
       * 必须等宿主渲染完这一帧：进入编辑态这一刻编辑框还带着 hidden，聚焦隐藏元素是空操作。
       * disposed 挡住还没轮到就已退出编辑态那一路。
       */
      focusEditInput: ({ scope, context, flush }) => {
        let disposed = false
        flush(() => {
          if (disposed)
            return
          const value = context.get('focusedValue')
          if (value == null)
            return
          // 取节点走 getRootNode().getElementById 而不是 scope.getById：
          // 后者依赖的 CSS.escape 在无头 DOM 环境里常常缺席，缺了当场抛
          const el = scope.getRootNode().getElementById(tagsInputEditInputId(scope, value)) as HTMLInputElement | null
          if (!el)
            return
          el.focus()
          // 整段选中
          el.select?.()
        })
        return () => {
          disposed = true
        }
      },
    },
  },
})
