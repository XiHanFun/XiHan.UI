import type { IconNode, IconRecord, Tone } from '@xihan-ui/core'
import type { IconFlip, IconProps, IconRotate, IconSize, IconWeight } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'
import { connectIcon } from '@xihan-ui/headless'
import { createElement } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { slotPaints } from '../../runtime/slot-content'

/**
 * 把一个图元节点建成元素，递归到底。
 * 标签与属性名逐字透传（连字符与大小写都保留），命名空间由 React 从父 svg 往下带。
 */
function renderNode(node: IconNode, key: number): ReactElement {
  return createElement(
    node.tag,
    { ...node.attrs, key },
    node.children?.map((child, index) => renderNode(child, index)),
  )
}

export interface XhIconProps extends Omit<ComponentPropsWithRef<'svg'>, 'rotate'> {
  /** 要画的图标，传的是记录本身而不是名字。 */
  icon?: IconRecord
  /** 可及名字；给了非空白文本就是有名字的图像，缺席或全空白算装饰。 */
  label?: string
  size?: IconSize
  weight?: IconWeight
  tone?: Tone
  /** 旋转档位：90 / 180 / 270，不是这三档的一律不写出。 */
  rotate?: IconRotate | string
  flip?: IconFlip
}

/**
 * 根 svg 加一层 g 空壳，图元铺在空壳里。
 *
 * children 给出了内容时改由它填充根，元素不再生成 glyph 与图元；
 * 判据是 children 里有真会画出东西的节点，而不是 children 存不存在——
 * 条件渲染落空时留下的空白与布尔值不算内容。
 */
export function XhIcon({
  icon,
  label,
  size,
  weight,
  tone,
  rotate,
  flip,
  children,
  ...rest
}: XhIconProps): ReactNode {
  const configured = withXhConfig('icon', { icon, label, size, weight, tone, rotate, flip } as IconProps)
  const api = connectIcon(configured, reactNormalize)
  return (
    <svg {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {slotPaints(children)
        ? children
        : (
            <g {...api.getGlyphProps() as Record<string, unknown>}>
              {api.nodes.map((node, index) => renderNode(node, index))}
            </g>
          )}
    </svg>
  )
}
