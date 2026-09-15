/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 grid 相关实现。

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
import { connectGrid, normalizeGridCount, normalizeGridTier } from '@xihan-ui/headless'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { GridProvider, useGridContext } from './context'

export interface XhGridRootProps extends ComponentPropsWithRef<'div'> {
  /** 列数：1 至 12 的整数，或逐档写的断点对象；也接受字符串与 JSON 串。 */
  cols?: GridColumnCount | string | GridColsByBreakpoint
  /** 行数：1 至 12 的整数；也接受字符串。 */
  rows?: GridRowCount | string
  /** 每列最少多宽：xs / sm / md / lg 四档。 */
  minColWidth?: GridMinColWidth
  /** 行列间距档位：xs / sm / md / lg / xl。 */
  gap?: GridGap
  /** 只改行间距，档位同 gap。 */
  rowGap?: GridGap
  /** 只改列间距，档位同 gap。 */
  columnGap?: GridGap
  /** 每一项在自己格子中的块向对齐。 */
  align?: GridAlign
  /** 每一项在自己格子中的行内对齐。 */
  justifyItems?: GridJustifyItems
}

/** 二维排布容器：列数、间距档位与两条对齐轴写为根上的 data-*，换算为哪条 CSS 规则由皮肤决定。 */
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
    cols: normalizeGridTier(cols) as GridProps['cols'],
    rows: normalizeGridCount(rows) as GridRowCount | undefined,
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
  /** 跨几列：1 至 12 的整数，或逐档写的断点对象；也接受字符串与 JSON 串。 */
  span?: GridColumnCount | string | GridSpanByBreakpoint
  /** 向后偏移几列：1 至 11 的整数，或逐档写的断点对象；也接受字符串与 JSON 串。 */
  offset?: GridColumnOffset | string | GridOffsetByBreakpoint
}

/** 一格：跨列与偏移由每一格自行声明，落在自身上。 */
export function XhGridItem({ span, offset, children, ...rest }: XhGridItemProps): ReactNode {
  const ctx = useGridContext()
  const props = ctx.api.getItemProps({
    span: normalizeGridTier(span) as GridItemProps['span'],
    offset: normalizeGridTier(offset) as GridItemProps['offset'],
  }) as Record<string, unknown>
  return (
    <div {...mergeReactProps(props, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}
