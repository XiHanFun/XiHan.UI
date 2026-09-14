/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 matrix code 相关实现。

import type { MatrixCodeFormat, MatrixCodeLevel, MatrixCodeProps } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'
import { connectMatrixCode } from '@xihan-ui/headless'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { slotPaints } from '../../runtime/slot-content'
import { MatrixCodeProvider, useMatrixCodeContext } from './context'

type ModuleShape = NonNullable<MatrixCodeProps['moduleShape']>
type EyeShape = NonNullable<MatrixCodeProps['eyeShape']>

export interface XhMatrixCodeProps extends Omit<ComponentPropsWithRef<'svg'>, 'children'> {
  /** 码制，缺省 qr。 */
  format?: MatrixCodeFormat
  /** 要编码的内容；空串不画码。 */
  value?: string
  /** GS1 模式：最前面放 FNC1，即 GS1 QR / GS1 DataMatrix。 */
  gs1?: boolean
  /** 纠错级别：qr 是 L / M / Q / H，pdf417 是 0–8，aztec 是纠错百分比 5–95。 */
  level?: MatrixCodeLevel
  /** 从矩形尺寸里挑；只对 data-matrix 有意义。 */
  rectangular?: boolean
  /** PDF417 的数据列数 1–30；只对 pdf417 有意义。 */
  columns?: number
  /** 像素边长，写成根上的内联宽高。 */
  pixelSize?: number
  /** 静区宽度，单位是模块数；静区含在 viewBox 里，不额外占尺寸。 */
  margin?: number
  /** 可及名字，缺省用 value；全空白的名字等于没给。 */
  label?: string
  moduleShape?: ModuleShape
  eyeShape?: EyeShape
  children?: ReactNode
}

/**
 * 整张码画成一个 `<svg>`，`format` 选码制；QR 下数据模块与三个码眼各成一条 `<path>`，其余码制只有前一条，静区靠 viewBox 留出。
 * 矩阵由 connect 算一遍，这里只取现成的 path；没有可画的内容时不生成任何几何节点。
 *
 * children 里放 XhMatrixCodeLogo 就等于给码面正中放了一块 logo：那片模块底下先铺一个底色矩形挖空，
 * 挖空排在 children 之前，logo 画在它上面。
 */
export function XhMatrixCode({
  format,
  value,
  gs1,
  level,
  rectangular,
  columns,
  pixelSize,
  margin,
  label,
  moduleShape,
  eyeShape,
  children,
  ...rest
}: XhMatrixCodeProps): ReactNode {
  // children 里只剩注释或空白时不算放了 logo：挖空是拿底色盖住一片模块，白挖一块就是白毁一片
  const api = connectMatrixCode({
    format,
    value,
    gs1,
    level,
    rectangular,
    columns,
    pixelSize,
    margin,
    label,
    moduleShape,
    eyeShape,
    logo: slotPaints(children),
  } satisfies MatrixCodeProps, reactNormalize)

  const geometry: ReactElement[] = []
  if (api.path !== '')
    geometry.push(<path key="modules" data-xh-geom="modules" d={api.path} />)
  if (api.eyePath !== '')
    geometry.push(<path key="eyes" data-xh-geom="eyes" d={api.eyePath} />)
  const area = api.logoArea
  if (area) {
    geometry.push(
      <rect key="logo-clear" data-xh-geom="logo-clear" x={area.x} y={area.y} width={area.size} height={area.size} />,
    )
  }

  return (
    <MatrixCodeProvider value={{ api }}>
      <svg {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {geometry}
        {children}
      </svg>
    </MatrixCodeProvider>
  )
}

export interface XhMatrixCodeLogoProps extends Omit<ComponentPropsWithRef<'svg'>, 'x' | 'y' | 'width' | 'height'> {}

/**
 * 码面正中那块 logo：落位与尺寸由 connect 给出，作者只管往里放图形。
 * 渲染成嵌套 `<svg>`，里面写 `width="100%" height="100%"` 即铺满这块，溢出部分被它自己裁掉。
 */
export function XhMatrixCodeLogo({ children, ...rest }: XhMatrixCodeLogoProps): ReactNode {
  const ctx = useMatrixCodeContext()
  return (
    <svg {...mergeReactProps(ctx.api.getLogoProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </svg>
  )
}
