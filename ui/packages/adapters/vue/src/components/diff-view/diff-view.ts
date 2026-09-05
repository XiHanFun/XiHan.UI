import type { DiffChange, DiffModel, DiffSide, DiffViewApi, DiffViewMode, DiffViewSchema, DiffViewTranslations } from '@xihan-ui/headless'
import type { CodeToken, Size } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideDiffView, useDiffViewContext } from './context'
import { useDiffView } from './use-diff-view'

type Props = DiffViewSchema['props']

/** 默认插槽的载荷：可见行序、增删统计与展开集合。 */
export type DiffViewRootSlotProps = Pick<
  DiffViewApi,
  'view' | 'rows' | 'expanded' | 'stats' | 'truncated' | 'truncatedLines' | 'isEmpty' | 'toggleGap' | 'setExpanded'
>

/** 单栏只有一列，恒为旧侧；并排两列都铺。 */
function sidesOf(view: DiffViewMode): readonly DiffSide[] {
  return view === 'split' ? ['old', 'new'] : ['old']
}

export const XhDiffViewRoot = defineComponent({
  name: 'XhDiffViewRoot',
  props: {
    model: { type: Object as PropType<DiffModel>, default: undefined },
    view: { type: String as PropType<DiffViewMode>, default: undefined },
    contextLines: { type: Number, default: undefined },
    expanded: { type: Array as PropType<readonly string[]>, default: undefined },
    defaultExpanded: { type: Array as PropType<readonly string[]>, default: undefined },
    wrap: { type: Boolean, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    translations: { type: Object as PropType<Partial<DiffViewTranslations>>, default: undefined },
  },
  emits: {
    'expanded-change': (_details: PayloadOf<Props, 'onExpandedChange'>) => true,
    'update:expanded': (_expanded: string[]) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: DiffViewRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const ctx = useDiffView(withXhConfig('diff-view', props) as Props, (details) => {
      emit('expanded-change', details)
      emit('update:expanded', details.expanded)
    })
    provideDiffView(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      view: ctx.api.value.view,
      rows: ctx.api.value.rows,
      expanded: ctx.api.value.expanded,
      stats: ctx.api.value.stats,
      truncated: ctx.api.value.truncated,
      truncatedLines: ctx.api.value.truncatedLines,
      isEmpty: ctx.api.value.isEmpty,
      toggleGap: ctx.api.value.toggleGap,
      setExpanded: ctx.api.value.setExpanded,
    }))
  },
})

export const XhDiffViewHeader = defineComponent({
  name: 'XhDiffViewHeader',
  setup(_, { slots }) {
    const ctx = useDiffViewContext()
    return () => h('div', ctx.api.value.getHeaderProps() as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 头部右侧的增删统计位，增删各放一个。
 *
 * 数字取自模型，默认渲染成 `+N` / `−N`；给了插槽就由插槽自己排版。
 */
export const XhDiffViewSummary = defineComponent({
  name: 'XhDiffViewSummary',
  props: {
    change: { type: String as PropType<Extract<DiffChange, 'added' | 'removed'>>, required: true },
  },
  slots: Object as SlotsType<{
    default?: (props: { count: number }) => VNode[]
  }>,
  setup(props, { slots }) {
    const ctx = useDiffViewContext()
    return () => {
      const api = ctx.api.value
      const count = props.change === 'added' ? api.stats.added : api.stats.removed
      return h(
        'span',
        api.getSummaryProps({ change: props.change }) as Record<string, unknown>,
        slots.default?.({ count }) ?? `${props.change === 'added' ? '+' : '−'}${count}`,
      )
    }
  },
})

export const XhDiffViewViewport = defineComponent({
  name: 'XhDiffViewViewport',
  setup(_, { slots }) {
    const ctx = useDiffViewContext()
    // 唯一的 Tab 停靠点，横纵滚动交给浏览器
    return () => h('div', ctx.api.value.getViewportProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhDiffViewBody = defineComponent({
  name: 'XhDiffViewBody',
  setup(_, { slots }) {
    const ctx = useDiffViewContext()
    // 行是模型算出来的派生结构，作者写不出 N 行，由组件铺
    return () => {
      const api = ctx.api.value
      const sides = sidesOf(api.view)
      return h('div', api.getBodyProps() as Record<string, unknown>, [
        ...api.rows.map((row) => {
          if (row.kind === 'gap') {
            const gapId = row.gapId!
            return h('div', { ...api.getGapProps({ gapId }) as Record<string, unknown>, key: `gap:${gapId}` }, [
              h('div', api.getGapCellProps() as Record<string, unknown>, [
                h(
                  'button',
                  api.getGapTriggerProps({ gapId }) as Record<string, unknown>,
                  `⋯ ${row.hiddenCount}`,
                ),
              ]),
            ])
          }
          const { rowIndex } = row
          return h('div', { ...api.getRowProps({ rowIndex }) as Record<string, unknown>, key: `row:${rowIndex}` }, sides.flatMap(side => [
            h('span', { ...api.getLineNumberProps({ rowIndex, side }) as Record<string, unknown>, key: `n:${side}` }),
            h('span', { ...api.getLineContentProps({ rowIndex, side }) as Record<string, unknown>, key: `c:${side}` }, [
              // 变更类型的读屏文字住在内容格里面：变更不能只靠颜色传达
              h(
                'span',
                api.getChangeLabelProps({ change: row.line!.change }) as Record<string, unknown>,
                api.changeLabel(row.line!.change),
              ),
              ...renderCell(api, rowIndex, side),
            ]),
          ]))
        }),
        slots.default?.() ?? [],
      ])
    }
  },
})

/** 着色记号逐个铺成 span。 */
function renderTokens(api: DiffViewApi, tokens: readonly CodeToken[]): VNode[] {
  return tokens.map((token, i) => h(
    'span',
    { ...api.getTokenProps(token) as Record<string, unknown>, key: i },
    token.text,
  ))
}

/** 一格的正文：算了词级差异就先按片段裹一层，否则整行按记号铺；都没有就一个文本节点。 */
function renderCell(api: DiffViewApi, rowIndex: number, side: DiffSide): VNode[] {
  const segments = api.cellSegments({ rowIndex, side })
  if (segments.length > 0) {
    return segments.map((segment, i) => h(
      'span',
      { ...api.getInlineChangeProps({ rowIndex, changed: segment.changed }) as Record<string, unknown>, key: `s:${i}` },
      segment.tokens.length === 0 ? segment.text : renderTokens(api, segment.tokens),
    ))
  }
  const tokens = api.cellTokens({ rowIndex, side })
  if (tokens.length === 0) {
    const text = api.cellText({ rowIndex, side })
    return text === undefined ? [] : [h('span', text)]
  }
  return renderTokens(api, tokens)
}

export const XhDiffViewEmpty = defineComponent({
  name: 'XhDiffViewEmpty',
  setup(_, { slots }) {
    const ctx = useDiffViewContext()
    return () => h('div', ctx.api.value.getEmptyProps() as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 截断提示条：这份差异被上限砍掉过多少行。
 *
 * 文字默认由组件自己填——留给作者填的话，作者不填就又变回一份看着完整的残缺差异，
 * 而这正是这条提示要挡的事。给了插槽就由插槽自己排版，行数一并交出去。
 */
export const XhDiffViewTruncation = defineComponent({
  name: 'XhDiffViewTruncation',
  slots: Object as SlotsType<{
    default?: (props: { count: number }) => VNode[]
  }>,
  setup(_, { slots }) {
    const ctx = useDiffViewContext()
    return () => {
      const api = ctx.api.value
      return h(
        'div',
        api.getTruncationProps() as Record<string, unknown>,
        slots.default?.({ count: api.truncatedLines }) ?? api.truncationText,
      )
    }
  },
})
