// 反馈服务默认模板用的装饰图形：加载弧线。
// 纯装饰（aria-hidden），读屏内容由标题与描述承担。
import type { VNode } from 'vue'
import { h } from 'vue'

/** 旋转的加载弧线；转动动画由外层容器（如 XhButtonIndicator）或自带样式提供。 */
export function spinArc(size = '1em'): VNode {
  return h('svg', {
    'viewBox': '0 0 16 16',
    'width': size,
    'height': size,
    'aria-hidden': 'true',
    'style': { display: 'block' },
  }, [
    h('circle', {
      'cx': 8,
      'cy': 8,
      'r': 6.5,
      'fill': 'none',
      'stroke': 'currentColor',
      'stroke-width': 2,
      'stroke-linecap': 'round',
      'stroke-dasharray': '30',
      'stroke-dashoffset': '22',
    }),
  ])
}
