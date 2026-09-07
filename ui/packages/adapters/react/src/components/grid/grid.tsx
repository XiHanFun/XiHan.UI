import type {
  GridAlign,
  GridColsByBreakpoint,
  GridColumnCount,
  GridColumnOffset,
  GridGap,
  GridItemProps,
  GridJustifyItems,
  GridMinColWidth,
  GridOffsetByBreakpoint,
  GridProps,
  GridRowCount,
  GridSpanByBreakpoint,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectGrid } from '@xihan-ui/headless'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { GridProvider, useGridContext } from './context'

/** 列数的档位名，base 在前，其余自窄到宽。跨列与错列共用这一份。 */
const COLS_TIERS = ['base', 'sm', 'md', 'lg', 'xl'] as const

/** 特性写法拿到的是字符串，交给 connect 前统一转成数字；取值范围由 connect 判。 */
function count(value: number | string | undefined): GridColumnCount | undefined {
  return value == null ? undefined : Number(value) as GridColumnCount
}

/**
 * 逐档的数：整数与字符串按单个数走；断点对象逐档转数字，没写的档不带进去。
 * 特性写法（`span='{"base":1,"md":6}'`）拿到的是一串 JSON，解析不出对象时按没写算——
 * 半截对象进去，缺的那几档会安静地退回缺省，而作者看不出是哪里写坏了。
 */
function tierOf<T extends GridColsByBreakpoint | GridSpanByBreakpoint | GridOffsetByBreakpoint>(
  value: number | string | T | undefined,
): number | T | undefined {
  if (value == null)
    return undefined
  let source: unknown = value
  if (typeof source === 'string' && source.trimStart().startsWith('{')) {
    try {
      source = JSON.parse(source)
    }
    catch {
      return undefined
    }
  }
  if (source === null || typeof source !== 'object' || Array.isArray(source))
    return Number(source as number | string)
  const out = {} as T
  for (const name of COLS_TIERS) {
    const raw = (source as Record<string, number | string | undefined>)[name]
    if (raw != null)
      (out as Record<string, number>)[name] = Number(raw)
  }
  return out
}

export interface XhGridRootProps extends ComponentPropsWithRef<'div'> {
  /** 列数：1 至 12 的整数，或逐档写的断点对象；也收字符串与 JSON 串。 */
  cols?: GridColumnCount | string | GridColsByBreakpoint
  /** 行数：1 至 12 的整数；也收字符串。 */
  rows?: GridRowCount | string
  /** 每列最少多宽：xs / sm / md / lg 四档。 */
  minColWidth?: GridMinColWidth
  /** 行列间距档位：xs / sm / md / lg / xl。 */
  gap?: GridGap
  /** 只改行间距，档位同 gap。 */
  rowGap?: GridGap
  /** 只改列间距，档位同 gap。 */
  columnGap?: GridGap
  /** 每一项在自己那格里的块向对齐。 */
  align?: GridAlign
  /** 每一项在自己那格里的行内对齐。 */
  justifyItems?: GridJustifyItems
}

/** 二维排布容器：列数、间距档位与两条对齐轴落成根上的 data-*，换算成哪条 CSS 规则由皮肤定。 */
export function XhGridRoot({
  cols,
  rows,
  minColWidth,
  gap,
  rowGap,
  columnGap,
  align,
  justifyItems,
  children,
  ...rest
}: XhGridRootProps): ReactNode {
  const api = connectGrid({
    cols: tierOf<GridColsByBreakpoint>(cols) as GridProps['cols'],
    rows: count(rows),
    minColWidth,
    gap,
    rowGap,
    columnGap,
    align,
    justifyItems,
  }, reactNormalize)
  return (
    <GridProvider value={{ api }}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </GridProvider>
  )
}

export interface XhGridItemProps extends ComponentPropsWithRef<'div'> {
  /** 跨几列：1 至 12 的整数，或逐档写的断点对象；也收字符串与 JSON 串。 */
  span?: GridColumnCount | string | GridSpanByBreakpoint
  /** 往后错几列：1 至 11 的整数，或逐档写的断点对象；也收字符串与 JSON 串。 */
  offset?: GridColumnOffset | string | GridOffsetByBreakpoint
}

/** 一格：跨列与错列由每一格自报，落在自己身上。 */
export function XhGridItem({ span, offset, children, ...rest }: XhGridItemProps): ReactNode {
  const ctx = useGridContext()
  const props = ctx.api.getItemProps({
    span: tierOf<GridSpanByBreakpoint>(span) as GridItemProps['span'],
    offset: tierOf<GridOffsetByBreakpoint>(offset) as GridItemProps['offset'],
  }) as Record<string, unknown>
  return (
    <div {...mergeReactProps(props, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}
