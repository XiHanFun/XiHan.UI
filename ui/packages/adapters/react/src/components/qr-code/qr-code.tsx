import type { QrCodeProps, QrLevel } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'
import { connectQrCode } from '@xihan-ui/headless'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { slotPaints } from '../../runtime/slot-content'
import { QrCodeProvider, useQrCodeContext } from './context'

type ModuleShape = NonNullable<QrCodeProps['moduleShape']>
type EyeShape = NonNullable<QrCodeProps['eyeShape']>

export interface XhQrCodeProps extends Omit<ComponentPropsWithRef<'svg'>, 'children'> {
  /** 要编码的内容，按 UTF-8 走字节模式；空串不画码。 */
  value?: string
  /** 纠错级别 L / M / Q / H。 */
  level?: QrLevel
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
 * 整张码画成一个 `<svg>`：数据模块与三个码眼各成一条 `<path>`，静区靠 viewBox 留出。
 * 矩阵由 connect 算一遍，这里只取现成的 path；没有可画的内容时不生成任何几何节点。
 *
 * children 里放 XhQrCodeLogo 就等于给码面正中放了一块 logo：那片模块底下先铺一个底色矩形挖空，
 * 挖空排在 children 之前，logo 画在它上面。
 */
export function XhQrCode({
  value,
  level,
  pixelSize,
  margin,
  label,
  moduleShape,
  eyeShape,
  children,
  ...rest
}: XhQrCodeProps): ReactNode {
  // children 里只剩注释或空白时不算放了 logo：挖空是拿底色盖住一片模块，白挖一块就是白毁一片
  const api = connectQrCode({
    value,
    level,
    pixelSize,
    margin,
    label,
    moduleShape,
    eyeShape,
    logo: slotPaints(children),
  } satisfies QrCodeProps, reactNormalize)

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
    <QrCodeProvider value={{ api }}>
      <svg {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {geometry}
        {children}
      </svg>
    </QrCodeProvider>
  )
}

export interface XhQrCodeLogoProps extends Omit<ComponentPropsWithRef<'svg'>, 'x' | 'y' | 'width' | 'height'> {}

/**
 * 码面正中那块 logo：落位与尺寸由 connect 给出，作者只管往里放图形。
 * 渲染成嵌套 `<svg>`，里面写 `width="100%" height="100%"` 即铺满这块，溢出部分被它自己裁掉。
 */
export function XhQrCodeLogo({ children, ...rest }: XhQrCodeLogoProps): ReactNode {
  const ctx = useQrCodeContext()
  return (
    <svg {...mergeReactProps(ctx.api.getLogoProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </svg>
  )
}
