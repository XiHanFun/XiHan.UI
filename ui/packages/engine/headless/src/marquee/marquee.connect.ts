/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 marquee 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { MarqueeApi, MarqueeDirection, MarqueeSchema } from './marquee.types'
import { dataAttr } from '@xihan-ui/core'
import { pressHandlers } from '../shared/press'
import { marqueeAnatomy } from './marquee.anatomy'

const parts = marqueeAnatomy.build()

const DEFAULT_DIRECTION: MarqueeDirection = 'left'

/** 走横轴的两档，其余两档走纵轴。 */
const HORIZONTAL: readonly MarqueeDirection[] = ['left', 'right']

/** 每秒像素只收有限正数：0 与负数不是速度，往回走由 direction 表达。 */
function speedValue(speed: number | undefined): number | undefined {
  return typeof speed === 'number' && Number.isFinite(speed) && speed > 0 ? speed : undefined
}

// 滚动整段交给皮肤里的 @keyframes，这里把四个档位与暂停状态摊到根上。
// 速度写成根上的内联 CSS 变量而不是 data-*：皮肤要拿它做除法算时长，落成属性就参与不了计算。
// 根上不写 role：一条跑马灯里放的是公告、链接还是纯装饰，由作者自己声明。
export function connectMarquee<T extends PropTypes>(
  service: Service<MarqueeSchema>,
  normalize: NormalizeProps<T>,
): MarqueeApi<T> {
  const { context, prop, send, scope } = service
  const direction = prop('direction') ?? DEFAULT_DIRECTION
  const autoFill = prop('autoFill') === true
  const speed = speedValue(prop('speed'))
  const paused = context.get('paused')
  const translations = prop('translations')
  const label = {
    autoplayTriggerPause: translations?.autoplayTriggerPause ?? 'Pause scrolling',
    autoplayTriggerPlay: translations?.autoplayTriggerPlay ?? 'Resume scrolling',
  }
  const contentId = scope.partId('marquee', 'content')
  // 键盘 / 触屏按住期间的按压面；指针按住由 :active 表出，皮肤两者同一档
  const press = pressHandlers(service)

  // 给了速度时根节点的内联 style 归本组件管，作者自己的内联样式写在外层元素上
  const rootAttrs = {
    ...parts.root.attrs,
    'data-direction': direction,
    'data-orientation': HORIZONTAL.includes(direction) ? 'horizontal' : 'vertical',
    // 悬停与聚焦暂停缺省开：一段自己动个不停的内容，至少要能用指针停住、键盘进来时不被带走
    'data-pause-on-hover': dataAttr(prop('pauseOnHover') ?? true),
    'data-paused': dataAttr(paused),
    'data-auto-fill': dataAttr(autoFill),
    ...(speed === undefined ? {} : { style: `--xh-marquee-speed: ${speed}` }),
  }

  return {
    copies: autoFill ? 2 : 1,
    paused,
    setPaused: next => send({ type: 'PAUSED.SET', paused: next }),

    getRootProps: () => normalize.element(rootAttrs),

    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      // 暂停开关用它说明自己管的是哪一段
      id: contentId,
    }),

    /**
     * 暂停开关：一段用户没要求就一直动下去的内容，必须有一处能把它停住（WCAG 2.2.2）；
     * 悬停暂停在触屏上不存在，这颗按钮是指针、键盘与触屏共同的出口。
     *
     * 名字随动作走，不再加 aria-pressed：名字与按压态两个通道各说各的，
     * 会念成「暂停滚动 已按下」，听的人分不清此刻到底在走还是停着。
     */
    getAutoplayTriggerProps: () => normalize.button({
      ...parts['autoplay-trigger'].attrs,
      // 写死 button：不写的话放在表单里会当成提交按钮
      'type': 'button',
      'aria-label': paused ? label.autoplayTriggerPlay : label.autoplayTriggerPause,
      'aria-controls': contentId,
      'data-state': paused ? 'paused' : 'running',
      // 压在窗口一端的单图标方钮：盒型、四态面、0.97 按压由家族配方按 icon 档给出；
      // 组件没有 size 轴，固定 md；描边档给边与字色，不透明的底由皮肤补上
      'data-xh-action-control': '',
      'data-xh-action-profile': 'icon',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'md',
      'data-xh-action-variant': 'outline',
      'data-pressed': dataAttr(context.get('pressed')),
      'onClick': () => send({ type: 'PAUSED.TOGGLE' }),
      'onKeyDown': press.onKeyDown,
      'onKeyUp': press.onKeyUp,
      'onBlur': press.onBlur,
      'onPointerDown': press.onPointerDown,
      'onPointerUp': press.onPointerUp,
      'onPointerCancel': press.onPointerCancel,
    }),
  }
}
