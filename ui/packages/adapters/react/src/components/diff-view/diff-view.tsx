import type { CodeToken, Size } from '@xihan-ui/core'
import type { DiffChange, DiffModel, DiffSide, DiffViewApi, DiffViewMode, DiffViewSchema, DiffViewTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { Fragment } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { DiffViewProvider, useDiffViewContext } from './context'
import { useDiffView } from './use-diff-view'

type Props = DiffViewSchema['props']

/** 函数式 children 的载荷：可见行序、增删统计与展开集合。 */
export type DiffViewRootSlotProps = Pick<
  DiffViewApi,
  'view' | 'rows' | 'expandedValue' | 'stats' | 'truncated' | 'truncatedLines' | 'isEmpty' | 'toggleGap' | 'setExpandedValue'
>

/** 单栏只有一列，恒为旧侧；并排两列都铺。 */
function sidesOf(view: DiffViewMode): readonly DiffSide[] {
  return view === 'split' ? ['old', 'new'] : ['old']
}

/** 着色记号逐个铺成 span。 */
function renderTokens(api: DiffViewApi, tokens: readonly CodeToken[]): ReactNode[] {
  return tokens.map((token, i) => (
    <span key={i} {...api.getTokenProps(token) as Record<string, unknown>}>{token.text}</span>
  ))
}

/** 一格的正文：算了词级差异就先按片段裹一层，否则整行按记号铺；都没有就一个文本节点。 */
function renderCell(api: DiffViewApi, rowIndex: number, side: DiffSide): ReactNode[] {
  const segments = api.cellSegments({ rowIndex, side })
  if (segments.length > 0) {
    return segments.map((segment, i) => (
      <span
        key={`s:${i}`}
        {...api.getInlineChangeProps({ rowIndex, changed: segment.changed }) as Record<string, unknown>}
      >
        {segment.tokens.length === 0 ? segment.text : renderTokens(api, segment.tokens)}
      </span>
    ))
  }
  const tokens = api.cellTokens({ rowIndex, side })
  if (tokens.length === 0) {
    const text = api.cellText({ rowIndex, side })
    return text === undefined ? [] : [<span key="t">{text}</span>]
  }
  return renderTokens(api, tokens)
}

export interface XhDiffViewRootProps {
  /** 差异模型，唯一入口。补丁与新旧两版文本都先归一到它。 */
  model?: DiffModel
  /** 单栏 unified 还是并排 split。 */
  view?: DiffViewMode
  /** 变更两侧各露几行上下文，其余折起来；不给即不折叠。 */
  contextLines?: number
  /** 展开的折叠格 id 集合，给了即受控。 */
  expandedValue?: readonly string[]
  defaultExpandedValue?: readonly string[]
  /** 长行原地折行，不再横向滚动；默认关。 */
  wrap?: boolean
  size?: Size
  translations?: Partial<DiffViewTranslations>
  onExpandedValueChange?: Props['onExpandedValueChange']
  children?: SlotChildren<DiffViewRootSlotProps>
}

export function XhDiffViewRoot({ children, ...props }: XhDiffViewRootProps): ReactNode {
  const ctx = useDiffView(withXhConfig('diff-view', props) as Props)
  const { api } = ctx
  return (
    <DiffViewProvider value={ctx}>
      <div {...api.getRootProps() as Record<string, unknown>}>
        {renderSlot(children, {
          view: api.view,
          rows: api.rows,
          expandedValue: api.expandedValue,
          stats: api.stats,
          truncated: api.truncated,
          truncatedLines: api.truncatedLines,
          isEmpty: api.isEmpty,
          toggleGap: api.toggleGap,
          setExpandedValue: api.setExpandedValue,
        })}
      </div>
    </DiffViewProvider>
  )
}

XhDiffViewRoot.xhEvents = ['expanded-value-change'] as const

export interface XhDiffViewHeaderProps extends ComponentPropsWithRef<'div'> {}
export function XhDiffViewHeader({ children, ...rest }: XhDiffViewHeaderProps): ReactNode {
  const ctx = useDiffViewContext()
  return <div {...mergeReactProps(ctx.api.getHeaderProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhDiffViewSummaryProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  change: Extract<DiffChange, 'added' | 'removed'>
  children?: SlotChildren<{ count: number }>
}
/**
 * 头部右侧的增删统计位，增删各放一个。
 *
 * 数字取自模型，默认渲染成 `+N` / `−N`；给了 children 就由它自己排版。
 */
export function XhDiffViewSummary({ change, children, ...rest }: XhDiffViewSummaryProps): ReactNode {
  const ctx = useDiffViewContext()
  const { api } = ctx
  const count = change === 'added' ? api.stats.added : api.stats.removed
  return (
    <span
      {...mergeReactProps(
        api.getSummaryProps({ change }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children === undefined ? `${change === 'added' ? '+' : '−'}${count}` : renderSlot(children, { count })}
    </span>
  )
}

export interface XhDiffViewViewportProps extends ComponentPropsWithRef<'div'> {}
/** 唯一的 Tab 停靠点，横纵滚动交给浏览器。 */
export function XhDiffViewViewport({ children, ...rest }: XhDiffViewViewportProps): ReactNode {
  const ctx = useDiffViewContext()
  return <div {...mergeReactProps(ctx.api.getViewportProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhDiffViewBodyProps extends ComponentPropsWithRef<'div'> {}
/** 行是模型算出来的派生结构，作者写不出 N 行，由组件铺。 */
export function XhDiffViewBody({ children, ...rest }: XhDiffViewBodyProps): ReactNode {
  const ctx = useDiffViewContext()
  const { api } = ctx
  const sides = sidesOf(api.view)
  return (
    <div {...mergeReactProps(api.getBodyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {api.rows.map((row) => {
        if (row.kind === 'gap') {
          const gapId = row.gapId!
          return (
            <div key={`gap:${gapId}`} {...api.getGapProps({ gapId }) as Record<string, unknown>}>
              <div {...api.getGapCellProps() as Record<string, unknown>}>
                <button {...api.getGapTriggerProps({ gapId }) as Record<string, unknown>}>
                  {`⋯ ${row.hiddenCount}`}
                </button>
              </div>
            </div>
          )
        }
        const { rowIndex } = row
        return (
          <div key={`row:${rowIndex}`} {...api.getRowProps({ rowIndex }) as Record<string, unknown>}>
            {sides.map(side => (
              <Fragment key={side}>
                <span {...api.getLineNumberProps({ rowIndex, side }) as Record<string, unknown>} />
                <span {...api.getLineContentProps({ rowIndex, side }) as Record<string, unknown>}>
                  {/* 变更类型的读屏文字住在内容格里面：变更不能只靠颜色传达 */}
                  <span {...api.getChangeLabelProps({ change: row.line!.change }) as Record<string, unknown>}>
                    {api.changeLabel(row.line!.change)}
                  </span>
                  {renderCell(api, rowIndex, side)}
                </span>
              </Fragment>
            ))}
          </div>
        )
      })}
      {children}
    </div>
  )
}

export interface XhDiffViewEmptyProps extends ComponentPropsWithRef<'div'> {}
export function XhDiffViewEmpty({ children, ...rest }: XhDiffViewEmptyProps): ReactNode {
  const ctx = useDiffViewContext()
  return <div {...mergeReactProps(ctx.api.getEmptyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhDiffViewTruncationProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  children?: SlotChildren<{ count: number }>
}
/**
 * 截断提示条：这份差异被上限砍掉过多少行。
 *
 * 文字默认由组件自己填——留给作者填的话，作者不填就又变回一份看着完整的残缺差异，
 * 而这正是这条提示要挡的事。给了 children 就由它自己排版，行数一并交出去。
 */
export function XhDiffViewTruncation({ children, ...rest }: XhDiffViewTruncationProps): ReactNode {
  const ctx = useDiffViewContext()
  const { api } = ctx
  return (
    <div {...mergeReactProps(api.getTruncationProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children === undefined ? api.truncationText : renderSlot(children, { count: api.truncatedLines })}
    </div>
  )
}
