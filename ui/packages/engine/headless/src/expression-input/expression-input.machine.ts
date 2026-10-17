/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 expression input 相关实现。

import type { ExpressionInputIssue, PositionResult, PropFn } from '@xihan-ui/core'
import type { ExpressionInputItem, ExpressionInputSchema, ExpressionInputTranslations, ExpressionInputWord } from './expression-input.types'
import { caretClientRect, resetDeclaredValue, setTimeoutEffect, setup } from '@xihan-ui/core'
import { DEFAULT_FUNCTION_TABLE } from '@xihan-ui/expression'
import { EXPRESSION_INPUT_EN_US } from '../locale/en-US'
import { OVERLAY_OFFSET, OVERLAY_PLACEMENT_LIST } from '../shared/overlay'
import { trackOverlayLayer, trackOverlayPosition, trackPresenceResources } from '../shared/overlay-shell'
import { resolveTranslations } from '../shared/translations'
import { autoSizeTextarea } from '../text-field/text-field.autosize'
import { expressionInputAnatomy } from './expression-input.anatomy'
import { applyExpressionCompletion, collectExpressionCompletions, expressionWordAt, sameExpressionIssues } from './expression-input.text'

const { createMachine } = setup<ExpressionInputSchema>()

/** 未指定 placement 时的落位；定位引擎与 connect 共用这一个缺省。 */
export const EXPRESSION_INPUT_DEFAULT_PLACEMENT = OVERLAY_PLACEMENT_LIST

/** 输入后多久检查，单位毫秒。 */
export const EXPRESSION_INPUT_CHECK_DELAY = 150

const CONTROL_SELECTOR = expressionInputAnatomy.build().control.selector

const NO_ISSUES: readonly ExpressionInputIssue[] = Object.freeze([])

/** 当前文案：组件自带的英文缺省压上作者给的那份。 */
export function expressionInputTranslations(translations: Partial<ExpressionInputTranslations> | undefined): ExpressionInputTranslations {
  return resolveTranslations(EXPRESSION_INPUT_EN_US, translations)
}

/** 按名字收集补全条目；没有可补全的名字时为空。 */
export function expressionInputItems(
  prop: PropFn<ExpressionInputSchema>,
  value: string,
  caret: number,
  word: ExpressionInputWord | null,
): ExpressionInputItem[] {
  if (word === null)
    return []
  return collectExpressionCompletions({
    source: value,
    caret,
    word,
    completions: prop('completions'),
    functions: prop('functions') ?? DEFAULT_FUNCTION_TABLE,
    translations: expressionInputTranslations(prop('translations')),
  })
}

/**
 * 表达式输入框的值是整段源码；补全换掉的只是光标处的那个名字。
 * 开合由名字算出来：输入名字字符且有匹配就开，挪出名字或没有匹配就合；
 * Ctrl+Space 主动打开时没有匹配也开着，显示空态。
 * 检查在值变化后去抖执行，失焦时立即执行；值为空时不检查。
 */
export const expressionInputMachine = createMachine({
  name: 'expression-input',
  context: ({ prop, cell }) => ({
    position: cell<PositionResult | null>(() => ({ defaultValue: null })),
    value: cell<string>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? '',
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    caret: cell<number>(() => ({ defaultValue: (prop('value') ?? prop('defaultValue') ?? '').length })),
    word: cell<ExpressionInputWord | null>(() => ({ defaultValue: null })),
    highlightedKey: cell<string | null>(() => ({ defaultValue: null })),
    issues: cell<readonly ExpressionInputIssue[]>(() => ({
      defaultValue: NO_ISSUES,
      isEqual: sameExpressionIssues,
      onChange: issues => prop('onIssuesChange')?.({ issues }),
    })),
    checkedSource: cell<string | null>(() => ({ defaultValue: null })),
    composing: cell<boolean>(() => ({ defaultValue: false })),
    forced: cell<boolean>(() => ({ defaultValue: false })),
    pressedKey: cell<string | null>(() => ({ defaultValue: null })),
  }),
  refs: () => ({
    config: null,
    registerLayer: null,
    presence: null,
    position: null,
    getFloatingEl: () => null,
    getInputEl: () => null,
    getHighlightEl: () => null,
  }),
  initialState: () => 'closed',
  // Layer 与消解资源跟着 Presence 走；检查与镜像层同步与开合无关
  effects: ['trackLayer', 'trackCheck', 'trackMirror'],
  watch: ({ track, prop, action }) => {
    track([() => prop('disabled'), () => prop('readOnly')], () => action(['releaseWhenInert']))
  },
  on: {
    'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
    'PRESS.END': { actions: ['endPress'] },
    'FORM.RESET': { actions: ['resetToDefault'] },
    'INPUT.CHANGE': { actions: ['setValue', 'syncWord'] },
    'CARET.SYNC': { actions: ['syncWord'] },
    'COMPOSITION.START': { actions: ['startComposition'] },
    'COMPOSITION.END': { actions: ['endComposition', 'setValue', 'syncWord'] },
    'OPEN.FORCE': { guard: 'canEdit', actions: ['forceWord'] },
    'VALUE.SET': { actions: ['replaceValue'] },
    'TEXT.INSERT': { guard: 'canEdit', actions: ['insertText'] },
    'CHECK.RUN': { actions: ['runCheck'] },
  },
  states: {
    closed: {
      on: {
        OPEN: { target: 'open', actions: ['invokeOnOpen'] },
      },
    },
    open: {
      entry: ['highlightFirst'],
      exit: ['clearHighlightedKey', 'clearForced', 'releasePress'],
      effects: ['trackPosition'],
      on: {
        'CLOSE': { target: 'closed', actions: ['invokeOnClose'] },
        'ESCAPE': { target: 'closed', actions: ['invokeOnClose'] },
        'WORD.CHANGED': { actions: ['ensureHighlight'] },
        'ITEM.HIGHLIGHT': { actions: ['setHighlightedKey'] },
        'ITEM.SELECT': { target: 'closed', actions: ['selectItem', 'invokeOnClose'] },
      },
    },
  },
  implementations: {
    guards: {
      canEdit: ({ prop }) => !prop('disabled') && !prop('readOnly'),
      canPress: ({ prop }) => !prop('disabled') && !prop('readOnly'),
    },
    actions: {
      resetToDefault: (params) => {
        resetDeclaredValue(params, 'value', 'value', 'defaultValue')
        params.context.set('word', null)
        params.send({ type: 'CLOSE' })
      },

      startPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.START')
          context.set('pressedKey', e.key)
      },
      endPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.END' && context.get('pressedKey') === e.key)
          context.set('pressedKey', null)
      },
      releasePress: ({ context }) => context.set('pressedKey', null),
      releaseWhenInert: ({ context, prop, send }) => {
        if (!prop('disabled') && !prop('readOnly'))
          return
        context.set('pressedKey', null)
        context.set('word', null)
        send({ type: 'CLOSE' })
      },

      invokeOnOpen: ({ prop }) => prop('onOpenChange')?.({ open: true }),
      invokeOnClose: ({ prop }) => prop('onOpenChange')?.({ open: false }),

      // 禁用或只读时值一动不动：原生属性已经挡住了打字，这条兜住程序化派进来的输入事件
      setValue: ({ context, prop, event }) => {
        const e = event.current()
        if ((e.type === 'INPUT.CHANGE' || e.type === 'COMPOSITION.END') && !prop('disabled') && !prop('readOnly')) {
          context.set('value', e.value)
          context.set('caret', e.caret)
        }
      },

      replaceValue: ({ context, send, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET')
          return
        context.set('value', e.value)
        context.set('caret', e.value.length)
        context.set('word', null)
        send({ type: 'CLOSE' })
      },

      startComposition: ({ context, send }) => {
        context.set('composing', true)
        context.set('word', null)
        send({ type: 'CLOSE' })
      },
      endComposition: ({ context }) => context.set('composing', false),

      /**
       * 按光标重取名字，并据此开合。
       * - 输入时：光标前是名字（或成员访问的点）且有匹配就开；
       * - 光标移动时：只在已经打开的前提下跟着更新；
       * - 挪出名字、名字为空、或没有匹配即收起；主动打开的这一轮没有匹配也开着，直到挪出名字。
       */
      syncWord: ({ context, prop, state, event, send }) => {
        const e = event.current()
        if (e.type !== 'INPUT.CHANGE' && e.type !== 'CARET.SYNC' && e.type !== 'COMPOSITION.END')
          return
        if (prop('disabled') || prop('readOnly') || context.get('composing')) {
          context.set('word', null)
          send({ type: 'CLOSE' })
          return
        }
        // 光标事件只在框里的值与本机记的一致时才算数：刚插完补全、适配器还没把新值渲进去的那一拍不作数
        if (e.type === 'CARET.SYNC') {
          if (e.value !== context.get('value'))
            return
          context.set('caret', e.caret)
        }
        const open = state.get() === 'open'
        if (!open && e.type === 'CARET.SYNC')
          return
        const value = context.get('value')
        const caret = context.get('caret')
        const word = expressionWordAt(value, caret)
        const forced = open && context.get('forced')
        if (word === null || (!forced && word.word === '' && word.member === null)) {
          context.set('word', null)
          send({ type: 'CLOSE' })
          return
        }
        context.set('word', word)
        if (!forced && expressionInputItems(prop, value, caret, word).length === 0) {
          send({ type: 'CLOSE' })
          return
        }
        send(open ? { type: 'WORD.CHANGED' } : { type: 'OPEN' })
      },

      /** Ctrl+Space：光标前没有名字也打开；光标在字符串或数字里时不开。 */
      forceWord: ({ context, state, send }) => {
        const word = expressionWordAt(context.get('value'), context.get('caret'))
        context.set('word', word)
        if (word === null) {
          send({ type: 'CLOSE' })
          return
        }
        context.set('forced', true)
        send(state.get() === 'open' ? { type: 'WORD.CHANGED' } : { type: 'OPEN' })
      },

      clearForced: ({ context }) => context.set('forced', false),

      highlightFirst: ({ context, prop }) => {
        const items = expressionInputItems(prop, context.get('value'), context.get('caret'), context.get('word'))
        context.set('highlightedKey', items[0]?.key ?? null)
      },

      /** 名字变了之后：高亮还在列表里就留着，被筛掉就改停到首条。 */
      ensureHighlight: ({ context, prop }) => {
        const items = expressionInputItems(prop, context.get('value'), context.get('caret'), context.get('word'))
        const highlighted = context.get('highlightedKey')
        if (highlighted === null || !items.some(item => item.key === highlighted))
          context.set('highlightedKey', items[0]?.key ?? null)
      },

      setHighlightedKey: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'ITEM.HIGHLIGHT')
          context.set('highlightedKey', e.key)
      },

      clearHighlightedKey: ({ context }) => context.set('highlightedKey', null),

      /** 用条目替换光标处的名字；值落定后再把光标挪到条目指定的位置。 */
      selectItem: ({ context, prop, event, refs, flush }) => {
        const e = event.current()
        if (e.type !== 'ITEM.SELECT')
          return
        const word = context.get('word')
        const value = context.get('value')
        const caret = context.get('caret')
        const item = expressionInputItems(prop, value, caret, word).find(candidate => candidate.key === e.key)
        if (word === null || item === undefined)
          return
        const next = applyExpressionCompletion(value, word, caret, item)
        context.set('value', next.value)
        context.set('caret', next.caret)
        context.set('word', null)
        prop('onCompletionSelect')?.({ completion: item })
        flush(() => {
          const el = refs.get('getInputEl')()
          if (!el || context.get('value') !== next.value)
            return
          if (el.value !== next.value)
            el.value = next.value
          el.setSelectionRange?.(next.caret, next.caret)
        })
      },

      /** 在选区处插入一段文本：替换选区，光标落在插入内容之后，补全收起。 */
      insertText: ({ context, event, refs, flush, send }) => {
        const e = event.current()
        if (e.type !== 'TEXT.INSERT')
          return
        const value = context.get('value')
        const start = Math.max(0, Math.min(e.selectionStart, value.length))
        const end = Math.max(start, Math.min(e.selectionEnd, value.length))
        const next = value.slice(0, start) + e.text + value.slice(end)
        const caret = start + e.text.length
        context.set('value', next)
        context.set('caret', caret)
        context.set('word', null)
        send({ type: 'CLOSE' })
        flush(() => {
          const el = refs.get('getInputEl')()
          if (!el || context.get('value') !== next)
            return
          if (el.value !== next)
            el.value = next
          el.focus?.()
          el.setSelectionRange?.(caret, caret)
        })
      },

      /** 按当前值检查；组合输入中不检查，值为空时清空问题。 */
      runCheck: ({ context, prop }) => {
        if (context.get('composing'))
          return
        const value = context.get('value')
        const check = prop('check')
        context.set('issues', check === undefined || value === '' ? NO_ISSUES : check(value))
        context.set('checkedSource', value)
      },
    },
    effects: {
      trackPosition: ({ refs, prop, context, flush, track }) => {
        let reattach: (() => void) | null = null
        // 多行时浮层锚在光标处：光标换了位置就重挂一轮
        track([context.dep('caret')], () => {
          if (prop('multiline'))
            reattach?.()
        })
        return trackOverlayPosition({
          engine: refs.get('position'),
          flush,
          clear: () => context.set('position', null),
          // 单行锚字段盒，浮层与它左缘对齐、等宽；多行锚光标
          getAnchor: () => {
            const input = refs.get('getInputEl')()
            if (!input)
              return null
            if (!prop('multiline'))
              return input.closest<HTMLElement>(CONTROL_SELECTOR) ?? input
            return { getBoundingClientRect: () => caretClientRect(input, context.get('caret')) ?? input.getBoundingClientRect() }
          },
          getFloating: () => refs.get('getFloatingEl')(),
          options: () => ({
            placement: prop('placement') ?? EXPRESSION_INPUT_DEFAULT_PLACEMENT,
            offset: prop('offset') ?? OVERLAY_OFFSET,
            strategy: 'fixed',
            dir: prop('dir'),
            size: true,
          }),
          onResult: result => context.set('position', result),
          onSchedule: (schedule) => {
            reattach = schedule
          },
        })
      },

      // 焦点全程留在输入框，因此不给焦点域
      trackLayer: ({ refs, send, flush, state, track }) => trackPresenceResources({
        presence: () => refs.get('presence'),
        open: () => state.get() === 'open',
        track,
        acquire: () => trackOverlayLayer({
          config: refs.get('config'),
          registerLayer: refs.get('registerLayer'),
          flush,
          active: () => state.get() === 'open',
          onDismiss: (reason) => {
            if (reason === 'escape-key') {
              send({ type: 'ESCAPE' })
              return
            }
            // 焦点跑到层外与输入框自己的 blur 是同一件事，只认后者
            if (reason === 'focus-outside')
              return
            send({ type: 'CLOSE' })
          },
        }),
      }),

      /** 值变化后去抖检查：每次变化重新计时，组合输入中不计时；挂上时已有值就先检查一次。 */
      trackCheck: ({ context, prop, send, track }) => {
        let stop: (() => void) | undefined
        const schedule = (delay: number): void => {
          stop?.()
          stop = undefined
          if (prop('check') === undefined || context.get('composing'))
            return
          if (context.get('checkedSource') === context.get('value'))
            return
          stop = setTimeoutEffect(() => {
            stop = undefined
            send({ type: 'CHECK.RUN' })
          }, delay)
        }
        track([context.dep('value'), context.dep('composing'), () => prop('check')], () => schedule(prop('checkDelay') ?? EXPRESSION_INPUT_CHECK_DELAY))
        schedule(0)
        return () => stop?.()
      },

      /**
       * 镜像层跟着输入框走：位置与内容盒尺寸写成私有槽，滚动同步到镜像层。
       * 没有高亮层或输入框时什么也不做；没有 ResizeObserver 的环境只跟随滚动与输入。
       */
      trackMirror: ({ refs, flush, track, context, prop }) => {
        let input: HTMLElement | null = null
        let observer: ResizeObserver | null = null
        const sync = (): void => {
          const field = refs.get('getInputEl')()
          const mirror = refs.get('getHighlightEl')()
          if (!field || !mirror)
            return
          // 行内起点按书写方向算：RTL 时是输入框右缘到外框内缘的距离
          const parent = field.offsetParent as HTMLElement | null
          const rtl = field.ownerDocument.defaultView?.getComputedStyle(field).direction === 'rtl'
          const start = rtl && parent ? parent.clientWidth - field.offsetLeft - field.offsetWidth : field.offsetLeft
          mirror.style.setProperty('--xh-_expression-input-mirror-inline', `${start}px`)
          mirror.style.setProperty('--xh-_expression-input-mirror-block', `${field.offsetTop}px`)
          mirror.style.setProperty('--xh-_expression-input-mirror-w', `${field.clientWidth}px`)
          mirror.style.setProperty('--xh-_expression-input-mirror-h', `${field.clientHeight}px`)
          mirror.scrollLeft = field.scrollLeft
          mirror.scrollTop = field.scrollTop
        }
        const attach = (): void => {
          const field = refs.get('getInputEl')()
          if (!field || field === input)
            return
          input?.removeEventListener('scroll', sync)
          input?.removeEventListener('input', sync)
          observer?.disconnect()
          input = field
          field.addEventListener('scroll', sync, { passive: true })
          field.addEventListener('input', sync)
          if (typeof ResizeObserver !== 'undefined') {
            observer = new ResizeObserver(sync)
            observer.observe(field)
          }
          sync()
        }
        flush(attach)
        // 值从哪条路变的都一样（打字、补全、程序化改写、受控写回）：等 DOM 落定后补测自动高度并对齐镜像层
        track([context.dep('value')], () => flush(() => {
          attach()
          const field = refs.get('getInputEl')()
          const autoSize = prop('autoSize')
          if (field?.tagName === 'TEXTAREA' && autoSize)
            autoSizeTextarea(field as HTMLTextAreaElement, autoSize)
          sync()
        }))
        return () => {
          input?.removeEventListener('scroll', sync)
          input?.removeEventListener('input', sync)
          observer?.disconnect()
          input = null
          observer = null
        }
      },
    },
  },
})
