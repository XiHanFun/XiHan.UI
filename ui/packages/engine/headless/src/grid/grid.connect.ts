import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { GridApi, GridBreakpoint, GridCols, GridColsByBreakpoint, GridOffset, GridProps, GridSpan } from './grid.types'
import { gridAnatomy } from './grid.anatomy'

const parts = gridAnatomy.build()

/** 断点档位，自窄到宽。 */
const BREAKPOINTS: readonly GridBreakpoint[] = ['sm', 'md', 'lg', 'xl']

/** 列数与跨列的取值上限，与皮肤逐值写出的那一批规则同一个范围。 */
const MAX_COLUMN_COUNT = 12
/** 错列的取值上限：最多把这一格推到最后一列起排。 */
const MAX_COLUMN_OFFSET = 11

/**
 * 档位数落成字符串，两个适配器写到 DOM 上的值一致；没给就不写这个属性。
 * 只有 1 到 max 的整数落得下去，0、负数、小数与超出上限的一律按没写算——
 * 类型只管得住 TypeScript 那一路，特性写的是字符串、property 也收得下任意数字，
 * 落一个皮肤没有规则接的值，等于既不生效又看不出写错在哪。
 */
function tier(value: number | undefined, max: number): string | undefined {
  if (value == null || !Number.isInteger(value) || value < 1 || value > max)
    return undefined
  return String(value)
}

/** 逐档落到 DOM 上的字符串，档位名与断点令牌同名。 */
type Tiers = Record<'base' | GridBreakpoint, string | undefined>

/**
 * 一个可逐档写的数归一成五档字符串：给整数或不给时只有 base 那一格有值；
 * 给断点对象时逐档取，没写的档是 undefined。
 * 属性名不由这里拼——它们是公开面，得在调用处按字面写着才盯得住改名。
 */
function tiers(value: GridCols | GridSpan | GridOffset | undefined, max: number): Tiers {
  const byTier: GridColsByBreakpoint = value != null && typeof value === 'object' ? value : { base: value }
  const out = { base: tier(byTier.base, max) } as Tiers
  for (const at of BREAKPOINTS)
    out[at] = tier(byTier[at], max)
  return out
}

// Grid 无状态机：二维排布不持有任何状态，列数、间距档位与两条对齐轴原样落成 data-*，
// 换算成哪条 CSS 规则由皮肤定。列数按断点分档时也只是多落几个 data-cols-<档>，
// 哪一档在多宽的视口上接管由皮肤的媒体查询定，这里不量视口。
// 根上不写 role：容器只做排布，里面装的是列表还是一组卡片由作者自己声明。
export function connectGrid<T extends PropTypes>(
  props: GridProps,
  normalize: NormalizeProps<T>,
): GridApi<T> {
  return {
    getRootProps: () => {
      const cols = tiers(props.cols, MAX_COLUMN_COUNT)
      return normalize.element({
        ...parts.root.attrs,
        // 列数恒有值：不写就是一列，读一眼 DOM 就知道这一层分几列
        'data-cols': cols.base ?? '1',
        'data-cols-sm': cols.sm,
        'data-cols-md': cols.md,
        'data-cols-lg': cols.lg,
        'data-cols-xl': cols.xl,
        'data-rows': tier(props.rows, MAX_COLUMN_COUNT),
        'data-min-col': props.minColWidth,
        'data-gap': props.gap,
        'data-row-gap': props.rowGap,
        'data-column-gap': props.columnGap,
        'data-align': props.align,
        'data-justify-items': props.justifyItems,
      })
    },

    // 跨列与错列是每一格自报的声明，都不写就按文档序占一格
    getItemProps: (item = {}) => {
      const span = tiers(item.span, MAX_COLUMN_COUNT)
      const offset = tiers(item.offset, MAX_COLUMN_OFFSET)
      return normalize.element({
        ...parts.item.attrs,
        'data-span': span.base,
        'data-span-sm': span.sm,
        'data-span-md': span.md,
        'data-span-lg': span.lg,
        'data-span-xl': span.xl,
        'data-offset': offset.base,
        'data-offset-sm': offset.sm,
        'data-offset-md': offset.md,
        'data-offset-lg': offset.lg,
        'data-offset-xl': offset.xl,
      })
    },
  }
}
