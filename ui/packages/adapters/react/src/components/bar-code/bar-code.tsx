/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 bar code 相关实现。

import type { BarCodeFormat, BarCodeProps } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'
import { connectBarCode } from '@xihan-ui/headless'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'

export interface XhBarCodeProps extends Omit<ComponentPropsWithRef<'svg'>, 'children' | 'height'> {
  /** 码制，缺省 code128。 */
  format?: BarCodeFormat
  /** 要编码的内容；定长数字码制收不带或带校验位的两种长度。 */
  value?: string
  /** GS1-128：起始符后放 FNC1，内容里的 GS 编成分隔；只对 code128 有意义。 */
  gs1?: boolean
  /** 条下面是否印人读文字，缺省印。 */
  text?: boolean
  /** 附 mod 43 校验字符；只对 code39 有意义。 */
  checksum?: boolean
  /** 最窄条的像素宽，缺省 2。 */
  barWidth?: number
  /** 条的像素高，缺省 64。 */
  height?: number
  /** 两侧静区（模块数），缺省按码制的规范值。 */
  margin?: number
  /** 上下承载条，缺省画；只对 itf14 有意义。 */
  bearerBars?: boolean
  /** 可及名字，缺省用 value。 */
  label?: string
}

/**
 * 整张码画成一个 `<svg>`，`format` 选码制：全部条合成一条 `<path>`，人读文字每段一个 `<text>`，
 * 静区靠 viewBox 留出。条空序列由 connect 算一遍，这里只取现成的 path 与文字；
 * 没有可画的内容时不生成任何几何节点。
 */
export function XhBarCode({
  format,
  value,
  gs1,
  text,
  checksum,
  barWidth,
  height,
  margin,
  bearerBars,
  label,
  ...rest
}: XhBarCodeProps): ReactNode {
  const api = connectBarCode({
    format,
    value,
    gs1,
    text,
    checksum,
    barWidth,
    height,
    margin,
    bearerBars,
    label,
  } satisfies BarCodeProps, reactNormalize)

  const geometry: ReactElement[] = []
  if (api.path !== '')
    geometry.push(<path key="bars" data-xh-geom="bars" d={api.path} />)
  api.text.forEach((run, i) => {
    geometry.push(
      <text key={`text-${i}`} data-xh-geom="text" x={run.x} y={run.y} textAnchor={run.anchor} fontSize={api.fontSize}>
        {run.text}
      </text>,
    )
  })

  return (
    <svg {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {geometry}
    </svg>
  )
}
