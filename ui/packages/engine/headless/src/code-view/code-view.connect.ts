/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 code view 相关实现。

import type { CodeToken, NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { CodeViewApi, CodeViewFoldRegion, CodeViewLineProps, CodeViewSchema } from './code-view.types'
import {
  dataAttr,
  focusItem,
  ITEM_VALUE_ATTR,
  itemQuerySelector,
  navigateItems,
  navIntentFromKey,
  queryItems,
  resolveLabelling,
} from '@xihan-ui/core'
import { pressHandlers } from '../shared/press'
import { codeViewAnatomy } from './code-view.anatomy'
import {
  CODE_VIEW_FALLBACK_LANG,
  CODE_VIEW_MAX_DIGITS,
  findCodeViewFoldRegions,
  isCodeViewFoldable,
  parseLineRanges,
  splitCodeLines,
} from './code-view.types'

const parts = codeViewAnatomy.build()

const CODE_QUERY = { scope: codeViewAnatomy.name, part: 'code' }
const LINE_QUERY = { scope: codeViewAnatomy.name, part: 'line' }
const LINE_FOLD_QUERY = { scope: codeViewAnatomy.name, part: 'line-fold-trigger' }

/** 同一段代码里看得见的行首折叠钮：藏在折叠块里的那些不算。 */
function visibleFoldTriggers(from: HTMLElement): HTMLElement[] {
  const code = from.closest<HTMLElement>(itemQuerySelector(CODE_QUERY))
  return queryItems(code, LINE_FOLD_QUERY)
    .filter(el => el.closest<HTMLElement>(itemQuerySelector(LINE_QUERY))?.hidden !== true)
}

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

  // 语法块按当前这份文本现算；折叠集合里不再是块头的行号（代码变了）一律忽略
  const blockFolding = prop('blockFolding') === true
  const foldRegions = blockFolding ? findCodeViewFoldRegions(lines.map(line => line.text)) : []
  const regionAt = new Map<number, CodeViewFoldRegion>(foldRegions.map(region => [region.start, region]))
  const foldedSet = new Set(context.get('folded'))
  const folded = foldRegions.map(region => lineNumberAt(region.start)).filter(line => foldedSet.has(line))
  const isFolded = (index: number): boolean => regionAt.has(index) && foldedSet.has(lineNumberAt(index))
  // 折叠块里的行收起；块是嵌套的，外层收起时里层折没折叠都跟着藏
  const hiddenLines = new Set<number>()
  for (const region of foldRegions) {
    if (!foldedSet.has(lineNumberAt(region.start)))
      continue
    for (let index = region.start + 1; index <= region.end; index++)
      hiddenLines.add(index)
  }
  // Tab 停靠点：记下的那颗钮仍是看得见的块头就留在它上面，否则落在第一颗看得见的钮上
  const foldFocus = context.get('foldFocus') ?? null
  const focusRegion = foldRegions.find(region => lineNumberAt(region.start) === foldFocus && !hiddenLines.has(region.start))
    ?? foldRegions.find(region => !hiddenLines.has(region.start))
  const toggleFold = (line: number): void => {
    if (regionAt.has(line - startLine))
      service.send({ type: 'FOLD.TOGGLE', line })
  }

  // 非正数与非有限值一律当没给；可折叠与否与机器的按压守卫共用同一份判据
  const clamp = Number.isFinite(prop('clamp')) && prop('clamp')! > 0 ? Math.floor(prop('clamp')!) : undefined
  const foldable = isCodeViewFoldable(code, clamp)
  const clamped = foldable && prop('clamped') === true
  // 键盘 / 触屏按住期间的按压面；指针按住由 :active 表出，家族配方两者同一档
  const press = pressHandlers(service)

  // 折叠时把 min 一并降到 clamp 行：CSS 用值是 max(min, min(max, …))，
  // min-block-size 恒压过 max-block-size，只叠 max 的话高度纹丝不动。
  // 语法块收起的行不占高度，预撑的行数按看得见的算
  const shownLines = lineCount - hiddenLines.size
  const visibleLines = clamped ? Math.min(shownLines, clamp!) : shownLines
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
    // 折叠着的块头：皮肤在正文后面画一枚省略号，示意下面收起了几行
    'data-folded': dataAttr(isFolded(index)),
  })

  const foldLabel = translations?.foldBlock
    ?? ((first: number, last: number) => (first === last ? `Line ${first}` : `Lines ${first}–${last}`))

  return {
    lang,
    lineCount,
    lines,
    lineNumberAt,
    lineNumbers,
    foldable,
    clamped,
    setClamped,
    foldRegions,
    folded,
    isFoldStart: index => regionAt.has(index),
    toggleFold,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-lang': lang,
      'data-complete': complete,
      'data-clamped': dataAttr(clamped),
      'data-foldable': dataAttr(foldable),
      'data-block-folding': dataAttr(blockFolding),
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
      hidden: hiddenLines.has(line.index) || undefined,
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
    // 白底承载 hover 100 → pressed 200，按下只换面不缩放；档位随 size 走
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

    // 行首折叠钮：一组钮只占一个 Tab 位，上下方向键在看得见的钮之间走，Home / End 到首末；
    // 名字写这个块收起的是哪几行、不随开合变，开合交给 aria-expanded。
    // 接 Action Control icon 档、ghost 形态，边长由皮肤压到一行高；它是 disclosure trigger，按下只换面不缩放
    getLineFoldTriggerProps: ({ index }) => {
      const region = regionAt.get(index)
      const line = lineNumberAt(index)
      const open = !isFolded(index)
      return normalize.button({
        ...parts['line-fold-trigger'].attrs,
        'type': 'button',
        [ITEM_VALUE_ATTR]: String(line),
        'data-xh-action-control': '',
        'data-xh-action-profile': 'icon',
        'data-xh-action-variant': 'ghost',
        'data-xh-action-display': 'always',
        'data-xh-action-size': size ?? 'md',
        'aria-expanded': open ? 'true' : 'false',
        'aria-label': region === undefined ? undefined : foldLabel(lineNumberAt(region.start + 1), lineNumberAt(region.end)),
        'data-state': open ? 'open' : 'closed',
        'tabindex': focusRegion?.start === index ? 0 : -1,
        // 不是块头的行没有折叠钮；适配器按 isFoldStart 本就不建，这里再兜一层
        'hidden': region === undefined || undefined,
        'onClick': () => {
          service.send({ type: 'FOLD.FOCUS', line })
          toggleFold(line)
        },
        'onKeyDown': (event: KeyboardEvent) => {
          const intent = navIntentFromKey(event, { axis: 'vertical' })
          if (intent === null)
            return
          // 行序是线性的，到头不回绕
          const target = navigateItems(visibleFoldTriggers(event.currentTarget as HTMLElement), String(line), intent, { loop: false })
          if (target === null) {
            // 到头了也吞掉方向键：不让它滚动外面的页面
            event.preventDefault()
            return
          }
          event.preventDefault()
          service.send({ type: 'FOLD.FOCUS', line: Number(target.getAttribute(ITEM_VALUE_ATTR)) })
          focusItem(target)
        },
      })
    },
  }
}
