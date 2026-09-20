/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 code view 相关实现。

import type { CodeToken, NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { CodeViewApi, CodeViewLineProps, CodeViewSchema } from './code-view.types'
import { dataAttr, resolveLabelling } from '@xihan-ui/core'
import { pressHandlers } from '../shared/press'
import { codeViewAnatomy } from './code-view.anatomy'
import {
  CODE_VIEW_FALLBACK_LANG,
  CODE_VIEW_MAX_DIGITS,
  isCodeViewFoldable,
  parseLineRanges,
  splitCodeLines,
} from './code-view.types'

const parts = codeViewAnatomy.build()

/**
 * 行高槽位与它的兜底值，兜底须与皮肤里 --xh-code-view-line-height 的兜底逐字一致，
 * 否则按行数算出的高度对不上行。
 */
const LINE_HEIGHT = 'var(--xh-code-view-line-height, var(--xh-text-code-leading))'

// 机器只承载按压通道：代码文本、着色结果与折叠态都来自 props，这里把它们投影成各 part 的属性。
export function connectCodeView<T extends PropTypes>(
  service: Service<CodeViewSchema>,
  normalize: NormalizeProps<T>,
): CodeViewApi<T> {
  const { prop, context, scope } = service
  const code = prop('code')
  const translations = prop('translations')
  const size = prop('size')
  // 空串与纯空白的语言标注一律落到 plaintext，保证 lang 非空
  const lang = prop('lang')?.trim() || CODE_VIEW_FALLBACK_LANG
  const ids = scope.ids('code-view', 'pre', 'filename')

  // 未闭合的块默认不着色；着色实现返回 null 时同样退回纯文本
  const streaming = prop('complete') !== true
  const highlighter = prop('highlighter')
  const tokens: readonly CodeToken[] = highlighter && (!streaming || prop('highlightWhileStreaming') === true)
    ? highlighter.highlight(code, lang) ?? []
    : []

  const lines = splitCodeLines(code, tokens)
  const lineCount = lines.length
  const startLine = Number.isInteger(prop('startLine')) && prop('startLine')! > 0 ? prop('startLine')! : 1
  const lineNumberAt = (index: number): number => startLine + index

  const highlighted = new Set(parseLineRanges(prop('highlightLines')))

  // 非正数与非有限值一律当没给；可折叠与否与机器的按压守卫共用同一份判据
  const clamp = Number.isFinite(prop('clamp')) && prop('clamp')! > 0 ? Math.floor(prop('clamp')!) : undefined
  const foldable = isCodeViewFoldable(code, clamp)
  const clamped = foldable && prop('clamped') === true
  // 键盘 / 触屏按住期间的按压面；指针按住由 :active 表出，家族配方两者同一档
  const press = pressHandlers(service)

  // 折叠时把 min 一并降到 clamp 行：CSS 用值是 max(min, min(max, …))，
  // min-block-size 恒压过 max-block-size，只叠 max 的话高度纹丝不动
  const visibleLines = clamped ? Math.min(lineCount, clamp!) : lineCount
  const blockSize = `calc(${LINE_HEIGHT} * ${visibleLines})`

  // 行号槽宽由皮肤按位数档设，连接层写不了 CSS 自定义属性，只能发这个枚举
  const digits = String(Math.min(
    String(lineNumberAt(lineCount - 1)).length,
    CODE_VIEW_MAX_DIGITS,
  ))

  const labelling = resolveLabelling({
    labelId: ids.filename,
    labelCount: prop('labelled') === true ? 1 : 0,
    descriptionCount: 0,
    ariaLabel: translations?.code ?? 'Code',
  })

  const lineNumbers = !!prop('lineNumbers')
  const complete = dataAttr(prop('complete'))
  const wrap = dataAttr(!!prop('wrap'))

  const setClamped = (next: boolean): void => {
    if (next !== clamped)
      prop('onClampToggle')?.({ clamped: next })
  }

  const lineAttrs = ({ index }: CodeViewLineProps): Record<string, unknown> => ({
    'data-line-number': String(lineNumberAt(index)),
    'data-highlighted': dataAttr(highlighted.has(lineNumberAt(index))),
  })

  return {
    lang,
    lineCount,
    lines,
    lineNumberAt,
    lineNumbers,
    foldable,
    clamped,
    setClamped,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-lang': lang,
      'data-complete': complete,
      'data-clamped': dataAttr(clamped),
      'data-foldable': dataAttr(foldable),
      'data-line-numbers': dataAttr(lineNumbers),
      'data-digits': digits,
      'data-size': size,
    }),

    getHeaderProps: () => normalize.element({
      ...parts.header.attrs,
    }),

    // 渲了它就是 pre 的可访问名，故要有 id
    getFilenameProps: () => normalize.element({
      ...parts.filename.attrs,
      id: ids.filename,
    }),

    // 纯装饰角标，对读屏隐藏
    getLangLabelProps: () => normalize.element({
      ...parts['lang-label'].attrs,
      'aria-hidden': true,
    }),

    getPreProps: () => normalize.element({
      ...parts.pre.attrs,
      ...labelling,
      'id': ids.pre,
      // <pre> 自身没有角色，光挂 aria-labelledby 是无效属性；给它一个能承载可访问名的角色，
      // 这个 Tab 停靠点才念得出文件名
      'role': 'group',
      // 提供 Tab 停靠点，横向滚动交给浏览器
      'tabindex': 0,
      'data-complete': complete,
      'data-wrap': wrap,
      // 按行数撑高度；写成 style 而非 CSS 自定义属性，WC 侧的属性铺设写不进 --* 变量
      'style': clamped
        ? { minBlockSize: blockSize, maxBlockSize: blockSize }
        : { minBlockSize: blockSize },
    }),

    getCodeProps: () => normalize.element({
      ...parts.code.attrs,
      'data-lang': lang,
      'data-wrap': wrap,
    }),

    getLineProps: line => normalize.element({
      ...parts.line.attrs,
      ...lineAttrs(line),
    }),

    // 行号由皮肤用 content: attr(data-line-number) 画：复制代码不带行号，读屏也不逐行念数字
    getLineNumberProps: line => normalize.element({
      ...parts['line-number'].attrs,
      ...lineAttrs(line),
      'aria-hidden': true,
    }),

    getLineContentProps: line => normalize.element({
      ...parts['line-content'].attrs,
      ...lineAttrs(line),
    }),

    // 记号只带种类，配色全交给皮肤按 data-kind 选择器给
    getTokenProps: token => normalize.element({
      ...parts.token.attrs,
      'data-kind': token.kind,
    }),

    // 折叠条是铺满一行的 disclosure trigger：接 Action Control 的 disclosure-trigger 档，ghost 形态、
    // 白底承载 hover 100 → pressed 200，按下只换面不缩放（§9.2）；档位随 size 走
    getFoldTriggerProps: () => normalize.button({
      ...parts['fold-trigger'].attrs,
      'type': 'button',
      'data-xh-action-control': '',
      'data-xh-action-profile': 'disclosure-trigger',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-display': 'always',
      'data-xh-action-size': size ?? 'md',
      'aria-controls': ids.pre,
      'aria-expanded': clamped ? 'false' : 'true',
      'aria-label': clamped
        ? translations?.expand ?? 'Expand code'
        : translations?.collapse ?? 'Collapse code',
      'data-state': clamped ? 'closed' : 'open',
      'hidden': !foldable || undefined,
      // Space / Enter 与触屏按住投影 data-pressed，家族的按下面同时认它与指针 :active；不可折叠时不进
      'data-pressed': dataAttr(context.get('pressed')),
      'onClick': () => setClamped(!clamped),
      'onKeyDown': press.onKeyDown,
      'onKeyUp': press.onKeyUp,
      'onBlur': press.onBlur,
      'onPointerDown': press.onPointerDown,
      'onPointerUp': press.onPointerUp,
      'onPointerCancel': press.onPointerCancel,
    }),
  }
}
