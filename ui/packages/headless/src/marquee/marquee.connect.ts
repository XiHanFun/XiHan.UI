import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { MarqueeApi, MarqueeDirection, MarqueeProps } from './marquee.types'
import { dataAttr } from '@xihan-ui/kernel'
import { marqueeAnatomy } from './marquee.anatomy'

const parts = marqueeAnatomy.build()

const DEFAULT_DIRECTION: MarqueeDirection = 'left'

/** 走横轴的两档，其余两档走纵轴。 */
const HORIZONTAL: readonly MarqueeDirection[] = ['left', 'right']

/** 每秒像素只收有限正数：0 与负数不是速度，往回走由 direction 表达。 */
function speedValue(speed: number | undefined): number | undefined {
  return typeof speed === 'number' && Number.isFinite(speed) && speed > 0 ? speed : undefined
}

// Marquee 无状态机：滚动整段交给皮肤里的 @keyframes，这里只把四个档位摊到根上。
// 速度写成根上的内联 CSS 变量而不是 data-*：皮肤要拿它做除法算时长，落成属性就参与不了计算。
// 根上不写 role：一条跑马灯里放的是公告、链接还是纯装饰，由作者自己声明。
export function connectMarquee<T extends PropTypes>(
  props: MarqueeProps,
  normalize: NormalizeProps<T>,
): MarqueeApi<T> {
  const direction = props.direction ?? DEFAULT_DIRECTION
  const autoFill = props.autoFill === true
  const speed = speedValue(props.speed)

  // 给了速度时根节点的内联 style 归本组件管，作者自己的内联样式写在外层元素上
  const rootAttrs = {
    ...parts.root.attrs,
    'data-direction': direction,
    'data-orientation': HORIZONTAL.includes(direction) ? 'horizontal' : 'vertical',
    'data-pause-on-hover': dataAttr(props.pauseOnHover),
    'data-auto-fill': dataAttr(autoFill),
    ...(speed === undefined ? {} : { style: `--xh-marquee-speed: ${speed}` }),
  }

  return {
    copies: autoFill ? 2 : 1,
    getRootProps: () => normalize.element(rootAttrs),
    getContentProps: () => normalize.element(parts.content.attrs),
  }
}
