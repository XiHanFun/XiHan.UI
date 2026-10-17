/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 expression input 相关实现。

import type { NormalizeProps, PressHandlers, PropTypes, Service } from '@xihan-ui/core'
import type { ExpressionInputApi, ExpressionInputEl, ExpressionInputInputProps, ExpressionInputItemProps, ExpressionInputSchema } from './expression-input.types'
import { contains, createPressTracker, dataAttr, isComposingEvent } from '@xihan-ui/core'
import { overlayAnchorWidthVar, overlayAvailableSpaceVars, overlayFixedStyle, overlayPositioned } from '../shared/overlay'
import { expressionInputAnatomy } from './expression-input.anatomy'
import { EXPRESSION_INPUT_DEFAULT_PLACEMENT, expressionInputItems, expressionInputTranslations } from './expression-input.machine'
import { expressionSegments, viewExpressionIssues } from './expression-input.text'

const parts = expressionInputAnatomy.build()

/** 只有这些键单纯挪光标；值与它们无关，重取名字才有意义。 */
const CARET_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'])

/** 取光标位置；拿不到就当在末尾。 */
function caretOf(el: ExpressionInputEl): number {
  return el.selectionStart ?? el.value.length
}

export function connectExpressionInput<T extends PropTypes>(
  service: Service<ExpressionInputSchema>,
  normalize: NormalizeProps<T>,
): ExpressionInputApi<T> {
  const { state, prop, send, context, refs, scope } = service
  const open = state.get() === 'open'
  const ids = scope.ids('expression-input', 'label', 'input', 'content', 'issues')
  const t = expressionInputTranslations(prop('translations'))

  const value = context.get('value')
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const multiline = !!prop('multiline')
  const loop = prop('loop') ?? true
  const variant = prop('variant') ?? 'outline'
  const stateAttr = open ? 'open' : 'closed'
  const position = context.get('position')
  const placement = position?.placement ?? prop('placement') ?? EXPRESSION_INPUT_DEFAULT_PLACEMENT

  const items = open ? expressionInputItems(prop, value, context.get('caret'), context.get('word')) : []
  const highlighted = open ? context.get('highlightedKey') : null
  const empty = open && items.length === 0

  // 问题按检查时的源码算位置：值改过、下一次检查还没到时，列表照旧显示上一次的结果，
  // 高亮层只在源码与检查结果对得上时画波浪线，不把旧区间画到新文字上
  const checkedSource = context.get('checkedSource') ?? ''
  const issues = viewExpressionIssues(checkedSource, context.get('issues'), multiline, t)
  const fresh = context.get('checkedSource') === value
  const segments = expressionSegments(value, fresh ? issues : [])
  const hasError = issues.some(view => (view.issue.severity ?? 'error') === 'error')
  const invalid = !!prop('invalid') || hasError
  const describedByIssues = prop('issuesRendered') && issues.length > 0 ? ids.issues : undefined

  /** 条目 id。aria-activedescendant 只认单个 IDREF，key 里带空格会把它劈成两截，所以先编码再拼。 */
  const itemId = (key: string): string => scope.partId(expressionInputAnatomy.name, `item:${encodeURIComponent(key)}`)

  const itemStateAttrs = (props: ExpressionInputItemProps): Record<string, string | undefined> => ({
    'data-highlighted': dataAttr(highlighted === props.item.key),
  })

  const pressedKey = context.get('pressedKey')
  const press = (props: ExpressionInputItemProps): PressHandlers => createPressTracker({
    isPressed: () => context.get('pressedKey') === props.item.key,
    onChange: down => send(down ? { type: 'PRESS.START', key: props.item.key } : { type: 'PRESS.END', key: props.item.key }),
  })

  /** 按条目顺序移高亮；焦点不动，列表跟着滚，否则长列表里高亮会跑出可视区。 */
  const highlightBy = (step: 1 | -1): void => {
    if (items.length === 0)
      return
    const current = items.findIndex(item => item.key === highlighted)
    let next = current === -1 ? (step === 1 ? 0 : items.length - 1) : current + step
    if (next < 0 || next >= items.length) {
      if (!loop)
        return
      next = (next + items.length) % items.length
    }
    const key = items[next]!.key
    send({ type: 'ITEM.HIGHLIGHT', key })
    scope.getById(itemId(key))?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }

  const syncCaret = (el: ExpressionInputEl): void => {
    send({ type: 'CARET.SYNC', value: el.value, caret: caretOf(el) })
  }

  return {
    value,
    open,
    disabled,
    readOnly,
    invalid,
    items,
    highlightedKey: highlighted,
    empty,
    emptyText: t.noMatches,
    kindText: kind => (kind === 'function' ? t.kindFunction : t.kindVariable),
    issues,
    segments,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    insert: (text) => {
      const el = refs.get('getInputEl')()
      const end = context.get('value').length
      send({ type: 'TEXT.INSERT', text, selectionStart: el?.selectionStart ?? end, selectionEnd: el?.selectionEnd ?? end })
    },
    close: () => send({ type: 'CLOSE' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-state': stateAttr,
      'data-variant': variant,
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'data-empty': dataAttr(value === ''),
    }),

    getLabelProps: () => normalize.label({
      ...parts.label.attrs,
      'id': ids.label,
      // for 指向真正的输入框，不是外层包裹节点
      'for': ids.input,
      'data-disabled': dataAttr(disabled),
    }),

    // 视觉盒：描边与底色画在这里，输入框与镜像层叠在它里面
    getControlProps: () => normalize.element({
      ...parts.control.attrs,
      'data-xh-field-chrome': '',
      'data-xh-field-size': prop('size') ?? 'md',
      'data-variant': variant,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
    }),

    /**
     * 单行宿主写 combobox 角色与 aria-expanded；多行宿主是 textarea，允许的角色只有 textbox，
     * 浮层语义改由 aria-haspopup、aria-controls、aria-autocomplete 与 aria-activedescendant 表达。
     */
    getInputProps: (input: ExpressionInputInputProps = {}) => {
      const host = input.as ?? 'input'
      const autoSize = prop('autoSize')
      return normalize.input({
        ...parts.input.attrs,
        'id': ids.input,
        'name': prop('name'),
        'value': value,
        'placeholder': prop('placeholder'),
        'type': host === 'textarea' ? undefined : 'text',
        'role': host === 'textarea' ? undefined : 'combobox',
        'rows': host === 'textarea' && typeof autoSize === 'object' ? autoSize.minRows : undefined,
        // 关掉浏览器自带的历史补全与拼写检查：前者盖在补全列表上，后者把名字画满红线
        'autocomplete': 'off',
        'spellcheck': 'false',
        'disabled': disabled || undefined,
        'readonly': readOnly || undefined,
        'required': prop('required') || undefined,
        'aria-labelledby': prop('labelled') ? ids.label : undefined,
        'aria-describedby': describedByIssues,
        'aria-invalid': invalid ? 'true' : 'false',
        'aria-readonly': readOnly ? 'true' : 'false',
        'aria-required': prop('required') ? 'true' : 'false',
        'aria-haspopup': 'listbox',
        'aria-expanded': host === 'textarea' ? undefined : (open ? 'true' : 'false'),
        'aria-controls': ids.content,
        'aria-autocomplete': 'list',
        'aria-activedescendant': highlighted != null ? itemId(highlighted) : undefined,
        'data-xh-field-input': '',
        'data-xh-field-layout': host === 'textarea' ? 'textarea' : 'single-line',
        'data-xh-field-auto-size': dataAttr(host === 'textarea' && !!autoSize),
        'data-state': stateAttr,
        'data-disabled': dataAttr(disabled),
        'data-invalid': dataAttr(invalid),
        'onInput': (event: Event) => {
          const el = event.target as ExpressionInputEl
          send({ type: 'INPUT.CHANGE', value: el.value, caret: caretOf(el) })
        },
        'onCompositionStart': () => {
          send({ type: 'COMPOSITION.START' })
        },
        'onCompositionEnd': (event: CompositionEvent) => {
          const el = event.currentTarget as ExpressionInputEl
          send({ type: 'COMPOSITION.END', value: el.value, caret: caretOf(el) })
        },
        'onClick': (event: MouseEvent) => {
          syncCaret(event.currentTarget as ExpressionInputEl)
        },
        // 回车、Tab 这类在 keydown 里已经办完事的按键不进来：那一刻值刚换过，照框里的旧文重取会把列表又弹回来
        'onKeyUp': (event: KeyboardEvent) => {
          if (CARET_KEYS.has(event.key))
            syncCaret(event.currentTarget as ExpressionInputEl)
        },
        'onBlur': (event: FocusEvent) => {
          const el = event.currentTarget as HTMLElement
          const root = el.closest<HTMLElement>(parts.root.selector)
          // 焦点还在组件内部（点了补全之类）不算离场
          if (root && contains(root, event.relatedTarget as Node | null))
            return
          send({ type: 'CLOSE' })
          send({ type: 'CHECK.RUN' })
        },
        'onKeyDown': (event: KeyboardEvent) => {
          // 组合期间的按键属于输入法候选框，组件一律不接
          if (isComposingEvent(event) || disabled || readOnly)
            return
          if (event.ctrlKey && !event.metaKey && !event.altKey && (event.key === ' ' || event.code === 'Space')) {
            event.preventDefault()
            syncCaret(event.currentTarget as ExpressionInputEl)
            send({ type: 'OPEN.FORCE' })
            return
          }
          // 收起态其余按键一条都不接管：回车单行时归表单、多行时是换行
          if (!open || event.ctrlKey || event.metaKey || event.altKey)
            return
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            highlightBy(1)
            return
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault()
            highlightBy(-1)
            return
          }
          if (event.key === 'Enter' || (event.key === 'Tab' && !event.shiftKey)) {
            if (highlighted != null) {
              event.preventDefault()
              send({ type: 'ITEM.SELECT', key: highlighted })
              return
            }
            send({ type: 'CLOSE' })
            return
          }
          if (event.key === 'Escape') {
            // 收起由消解层收口；这里只拦掉 Escape 继续上冒去关掉外面的对话框
            event.preventDefault()
          }
        },
      })
    },

    // 镜像层：与输入框同字体、同内边距、同换行，位置与滚动由机器的效应跟着输入框写；纯视觉，对读屏隐藏
    getHighlightProps: () => normalize.element({
      ...parts.highlight.attrs,
      'aria-hidden': true,
      'data-multiline': dataAttr(multiline),
    }),

    getHighlightSegmentProps: ({ segment }) => normalize.element({
      ...parts['highlight-segment'].attrs,
      'data-issue': segment.issue == null ? undefined : String(segment.issue),
      'data-severity': segment.severity ?? undefined,
    }),

    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      'dir': prop('dir'),
      'data-variant': variant,
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-state': stateAttr,
      'data-placement': placement,
      'data-hidden': dataAttr(position?.hidden),
      'data-positioned': dataAttr(overlayPositioned(position)),
      'style': {
        ...overlayFixedStyle(position),
        ...overlayAvailableSpaceVars('expression-input', position),
        // 单行浮层与字段盒等宽；多行锚在光标上，宽度随内容
        ...(multiline ? {} : overlayAnchorWidthVar('expression-input', position?.anchorWidth)),
      },
    }),

    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'data-xh-material': 'frosted',
      'id': ids.content,
      'role': 'listbox',
      'aria-label': t.content,
      'tabindex': -1,
      'data-state': stateAttr,
      'data-placement': placement,
      'inert': !open || undefined,
      'aria-hidden': !open || undefined,
      'hidden': !open || undefined,
      'onPointerDown': (event: PointerEvent) => {
        // 不拦的话按下条目会让输入框失焦、补全随即收起
        event.preventDefault()
      },
    }),

    getItemProps: (props) => {
      const handlers = press(props)
      return normalize.element({
        ...parts.item.attrs,
        ...itemStateAttrs(props),
        'data-xh-collection-item': '',
        'data-xh-collection-size': prop('size') ?? 'md',
        'data-xh-collection-context': 'overlay',
        'id': itemId(props.item.key),
        'role': 'option',
        'aria-selected': highlighted === props.item.key ? 'true' : 'false',
        'data-pressed': dataAttr(pressedKey === props.item.key),
        'onPointerDown': handlers.onPointerDown,
        'onPointerUp': handlers.onPointerUp,
        'onPointerCancel': handlers.onPointerCancel,
        'onClick': () => {
          if (disabled || readOnly)
            return
          send({ type: 'ITEM.SELECT', key: props.item.key })
        },
        // 指针划过即高亮：不同步的话，鼠标停在 A 上、回车却接受了键盘高亮的 B
        'onPointerMove': () => {
          if (!disabled && highlighted !== props.item.key)
            send({ type: 'ITEM.HIGHLIGHT', key: props.item.key })
        },
      })
    },

    // 种类小标是视觉提示，函数条目的签名已经带出括号，读屏不重复念
    getItemPrefixProps: props => normalize.element({
      ...parts['item-prefix'].attrs,
      ...itemStateAttrs(props),
      'data-xh-collection-slot': 'prefix',
      'aria-hidden': true,
    }),

    getItemTextProps: props => normalize.element({
      ...parts['item-text'].attrs,
      ...itemStateAttrs(props),
      'data-xh-collection-slot': 'text',
    }),

    getItemSuffixProps: props => normalize.element({
      ...parts['item-suffix'].attrs,
      ...itemStateAttrs(props),
      'data-xh-collection-slot': 'suffix',
    }),

    getItemDescriptionProps: props => normalize.element({
      ...parts['item-description'].attrs,
      ...itemStateAttrs(props),
      'data-xh-collection-slot': 'description',
    }),

    // 空态必须待在 role=listbox 之外，放 positioner 里当 content 的兄弟
    getEmptyProps: () => normalize.element({
      ...parts.empty.attrs,
      'role': 'status',
      'data-state': stateAttr,
      'hidden': !empty || undefined,
    }),

    // 问题列表是常驻的活区：节点一直在，没有问题时收起，检查结果变了按 polite 播报
    getIssuesProps: () => normalize.element({
      ...parts.issues.attrs,
      'id': ids.issues,
      'role': 'status',
      'data-invalid': dataAttr(hasError),
      'hidden': issues.length === 0 || undefined,
    }),

    getIssueProps: ({ issue }) => normalize.element({
      ...parts.issue.attrs,
      'data-severity': issue.issue.severity ?? 'error',
      'data-issue': String(issue.index),
    }),
  }
}
