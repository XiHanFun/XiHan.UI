/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tags input 相关实现。

import type { Params } from '@xihan-ui/core'
import type { TagsInputRejectCode, TagsInputRejection, TagsInputSchema, TagsInputValidateContext } from './tags-input.types'
import { resetDeclaredValue, setup, trackListMotion } from '@xihan-ui/core'
import { sameArray } from '../shared/array'
import { tagsInputEditInputId } from './tags-input.anatomy'

const { createMachine } = setup<TagsInputSchema>()

/** 默认断词符，同时是 hidden-input 拼串时的连接符。 */
export const TAGS_INPUT_DELIMITER = ','

/**
 * 生效的断词符列表。显式给空串或空数组是关掉断词，因此只能用 ?? 兜底：|| 会把空串当没给。
 */
export function tagsDelimiters(delimiter: string | readonly string[] | undefined): string[] {
  const list = typeof delimiter === 'string' ? [delimiter] : delimiter ?? [TAGS_INPUT_DELIMITER]
  return list.filter(item => item !== '')
}

/**
 * hidden-input 拼串用的连接符：给一组断词符时取第一个。关掉断词时为空串。
 */
export function tagsDelimiter(delimiter: string | readonly string[] | undefined): string {
  return tagsDelimiters(delimiter)[0] ?? ''
}

/** 按任何一个断词符切开，保留空段（断词符连打、首尾断词符都会留下空段，由调用方决定丢不丢）。 */
function splitRaw(raw: string, delimiters: readonly string[]): string[] {
  let chunks = [raw]
  for (const delimiter of delimiters)
    chunks = chunks.flatMap(chunk => chunk.split(delimiter))
  return chunks
}

/** 标签的规范形态：去掉首尾空白。空串代表"这不是一个标签"。 */
export function normalizeTag(raw: string): string {
  return raw.trim()
}

/**
 * 按断词符（一个或一组，任何一个都断）把一段文本拆成若干标签，丢掉空白段。
 * 断词符为空串或空数组时整串当一个标签，按空串 split 会把文本劈成单个字符。
 */
export function splitTags(raw: string, delimiter: string | readonly string[]): string[] {
  return splitRaw(raw, tagsDelimiters(delimiter)).map(normalizeTag).filter(tag => tag !== '')
}

/** 逐项比对：数组每次都是新引用，不比内容的话值没变也会通知一遍。 */
export function sameTags(a: readonly string[], b: readonly string[] | undefined): boolean {
  return sameArray(a, b)
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
  /** 作者的准入判定，见 TagsInputSchema 的同名 prop。 */
  validate?: (tag: string, context: TagsInputValidateContext) => string | string[] | null | undefined
}

export interface TagsAppendResult {
  /** 追加之后的集合。rejected 非空时它只是个假设，调用方不该落盘。 */
  value: string[]
  /** 挡住这一批的标签：到了上限或被 validate 拒收。空白项与"本来就在列表里"的不算。 */
  rejected: string[]
  /** 没进集合的全部标签与原因：rejected 之外还有照常消费掉的重复项（duplicate）。 */
  rejections: TagsInputRejection[]
}

/** 作者 validate 的返回值摊成拒绝码列表：空串、null、undefined 与空数组都是放行。 */
function rejectCodes(result: string | string[] | null | undefined): TagsInputRejectCode[] {
  if (result == null)
    return []
  return (Array.isArray(result) ? result : [result]).filter(code => typeof code === 'string' && code !== '')
}

/**
 * 往集合尾部追加一批标签：空白项丢弃；重复项跳过但记一笔 duplicate；
 * 其余先问 validate、再看上限，被挡住的进 rejected。
 */
export function appendTags(
  current: readonly string[],
  incoming: readonly string[],
  options: TagsAppendOptions = {},
): TagsAppendResult {
  const { max, allowOverflow, validate } = options
  const batch = incoming.map(normalizeTag).filter(tag => tag !== '')
  const value = [...current]
  const rejected: string[] = []
  const rejections: TagsInputRejection[] = []
  for (const tag of batch) {
    if (value.includes(tag)) {
      rejections.push({ tag, reasons: ['duplicate'] })
      continue
    }
    const reasons = validate ? rejectCodes(validate(tag, { value: [...value], tags: batch })) : []
    if (!reasons.length && !allowOverflow && isAtMax(value.length, max))
      reasons.push('too-many-tags')
    if (reasons.length) {
      rejected.push(tag)
      rejections.push({ tag, reasons })
      continue
    }
    value.push(tag)
  }
  return { value, rejected, rejections }
}

/**
 * 就地编辑的准入：改成空白（删掉）、没改、或改成另一个已有标签（并成一个）都不问 validate；
 * 其余改写后的文本交给 validate，被拒即返回这一笔拒收。
 */
export function editRejection(
  current: readonly string[],
  from: string,
  edited: string,
  validate: TagsAppendOptions['validate'],
): TagsInputRejection | null {
  const tag = normalizeTag(edited)
  if (!validate || tag === '' || tag === from || current.includes(tag))
    return null
  const reasons = rejectCodes(validate(tag, { value: current.filter(item => item !== from), tags: [tag] }))
  return reasons.length ? { tag, reasons } : null
}

/**
 * 追加的唯一写入口：有一个标签因上限进不去就整体不生效。
 * 返回这一次算不算数，输入框该不该清由调用方据此决定。
 */
function commitTags(params: Params<TagsInputSchema>, incoming: readonly string[]): boolean {
  const { context, prop } = params
  const current = context.get('value')
  const { value: next, rejected, rejections } = appendTags(current, incoming, {
    max: prop('max'),
    allowOverflow: prop('allowOverflow'),
    validate: prop('validate'),
  })
  if (rejections.length > 0)
    prop('onTagReject')?.({ tags: rejections })
  if (rejected.length > 0)
    return false
  if (!sameTags(next, current))
    context.set('value', next)
  return true
}

/**
 * 标签条目：库写的部件属性；Web Components 里作者刚插进来的节点只带 data-xh-part，
 * 下一轮接线才写上部件属性，到达得在插入的那一刻认出来。后者只认容器的直接子节点，标签里嵌的别的组件不算。
 */
const TAGS_INPUT_ITEM_SELECTOR = '[data-scope="tags-input"][data-part="item"], [data-scope="tags-input"][data-part="control"] > [data-xh-part="item"]'

/** 此刻的编辑会不会被拒：编辑锚点还在集合里时才判。 */
function pendingEditRejection({ context, prop }: Params<TagsInputSchema>): TagsInputRejection | null {
  const from = context.get('focusedValue')
  const current = context.get('value')
  if (from == null || !current.includes(from))
    return null
  return editRejection(current, from, context.get('editedValue'), prop('validate'))
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
    // 按压通道：清空按钮被 Space / Enter 或触屏按住期间为 true
    pressed: cell<boolean>(() => ({ defaultValue: false })),
    listTracked: cell<boolean>(() => ({ defaultValue: false })),
  }),
  refs: () => ({ getControlEl: () => null }),
  initialState: () => 'idle',
  effects: ['trackListMotion'],
  // 按住途中转入禁用 / 只读，或标签与文本都被清空：清空按钮随即藏起，不会再来 keyup，按压面由机器自己收
  watch: ({ track, prop, context, action }) => {
    track([() => prop('disabled'), () => prop('readOnly'), context.dep('value'), context.dep('inputValue')], () => action(['releaseWhenInert']))
  },
  // 这几条从哪个状态发出都一样，挂根级
  on: {
    'FORM.RESET': { actions: ['resetToDefault'] },
    'VALUE.SET': { actions: ['setValue'] },
    'TAG.ADD': { guard: 'canEdit', actions: ['addTags'] },
    'VALUE.CLEAR': { guard: 'canEdit', target: 'idle', actions: ['clearAll'] },
    // 清空按钮的按压与 connect 里它的显隐同一口径：可编辑且有标签或有文本；藏起的按钮不该有按下的回执
    'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
    'PRESS.END': { actions: ['endPress'] },
    // 承载焦点的标签节点没了，一律退回输入框
    'ITEM.FOCUS_LOST': { target: 'idle', actions: ['cancelEdit'] },
    'LIST.TRACKED': { actions: ['markListTracked'] },
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
        'EDIT.SUBMIT': [
          // 编辑框失焦时被拒：就此撤销，焦点已经走了，留在编辑态只会剩一个没人管的编辑框
          { guard: 'isBlurEditRejected', target: 'idle', actions: ['reportEditReject', 'cancelEdit'] },
          // Enter 时被拒：留在编辑态，文本原样留在编辑框里等用户改
          { guard: 'isEditRejected', actions: ['reportEditReject'] },
          { target: 'idle', actions: ['commitEdit'] },
        ],
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
      canPress: ({ prop, context }) =>
        !prop('disabled') && !prop('readOnly') && (context.get('value').length > 0 || context.get('inputValue') !== ''),
      isEditRejected: params => pendingEditRejection(params) != null,
      isBlurEditRejected: (params) => {
        const e = params.event.current()
        return e.type === 'EDIT.SUBMIT' && !!e.blur && pendingEditRejection(params) != null
      },
    },
    actions: {
      resetToDefault: (params) => {
        resetDeclaredValue(params, 'value', 'value', 'defaultValue')
        resetDeclaredValue(params, 'inputValue', 'inputValue', 'defaultInputValue')
        params.context.reset('focusedValue')
        params.context.reset('editedValue')
      },

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
        const delimiters = tagsDelimiters(prop('delimiter'))
        const raw = e.value
        if (!delimiters.some(delimiter => raw.includes(delimiter))) {
          context.set('inputValue', raw)
          return
        }
        // 打出断词符即断词：断词符之前的每一段各成一个标签，最后一段留在框里接着打
        const parts = splitRaw(raw, delimiters)
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
        const tags = splitTags(raw, prop('delimiter') ?? TAGS_INPUT_DELIMITER)
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
      reportEditReject: (params) => {
        const rejection = pendingEditRejection(params)
        if (rejection)
          params.prop('onTagReject')?.({ tags: [rejection] })
      },

      startPress: ({ context }) => context.set('pressed', true),
      endPress: ({ context }) => context.set('pressed', false),
      markListTracked: ({ context }) => context.set('listTracked', true),
      releaseWhenInert: ({ context, prop }) => {
        if (prop('disabled') || prop('readOnly') || (context.get('value').length === 0 && context.get('inputValue') === ''))
          context.set('pressed', false)
      },
    },
    effects: {
      /**
       * 标签的到达、离场与换位：首帧就在的标签直接呈现，新落下的播进场、同一批按到达顺序错开，
       * 删掉的在原处播完退场，其余标签滑到新位置。React 的祖先 ref 在子组件 layout effect 之后才附着，
       * 延到提交后的微任务再取，仍在首帧绘制之前。没有 DOM 的宿主里取不到容器，不接。
       */
      trackListMotion: ({ refs, send, flush }) => {
        let disposed = false
        let stop: (() => void) | undefined
        flush(() => {
          queueMicrotask(() => {
            const control = refs.get('getControlEl')()
            if (disposed || !control)
              return
            stop = trackListMotion(control, { item: TAGS_INPUT_ITEM_SELECTOR })
            send({ type: 'LIST.TRACKED' })
          })
        })
        return () => {
          disposed = true
          stop?.()
        }
      },
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
