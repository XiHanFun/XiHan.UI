/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 badge 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { BadgeApi, BadgeSchema } from './badge.types'
import { dataAttr } from '@xihan-ui/core'
import { badgeAnatomy } from './badge.anatomy'
import { badgeText, badgeVisible } from './badge.machine'

const parts = badgeAnatomy.build()

// 显不显示、写什么数字，都是由 props 直接算出来的；机器只管出现与消失的进退场。
export function connectBadge<T extends PropTypes>(
  service: Service<BadgeSchema>,
  normalize: NormalizeProps<T>,
): BadgeApi<T> {
  const { prop, context, scope } = service
  const dot = prop('dot')
  const placement = prop('placement') ?? 'top-end'
  const tone = prop('tone') ?? 'danger'

  // 没有未读就不该有角标；显式要求显示 0 的除外
  const visible = badgeVisible({ count: prop('count'), showZero: prop('showZero') })
  // 清零后先播完退场才藏起：这几帧里照清零前那一版写
  const exiting = !visible && context.get('rendered')
  const text = visible ? badgeText({ count: prop('count'), dot, max: prop('max') }) : context.get('shownText')

  return {
    visible,
    text,
    /**
     * 锚点。被标记的那个东西放进它里面——角标是挂在别的元素角上的一枚标记，
     * 不是一枚可以单独摆的药丸；行内的状态药丸请用 tag。
     */
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-placement': placement,
    }),

    getIndicatorProps: () => normalize.element({
      ...parts.indicator.attrs,
      // 机器按 id 找到它，等它的退场动画播完再藏起
      'id': scope.partId('badge', 'indicator'),
      'data-tone': tone,
      'data-size': prop('size'),
      'data-placement': placement,
      // 露面与收起：皮肤在 visible 上弹出、在 hidden 上缩小淡出
      'data-state': visible ? 'visible' : 'hidden',
      // 首帧就在的角标直接呈现：显隐换过之后才播出现与消失
      'data-instant': dataAttr(!context.get('moved')),
      // 皮肤据此收成一个圆点：不留内边距、不出文字
      'data-dot': dataAttr(dot),
      // 呼吸只给圆点：数字角标的明暗起伏会压低数字的对比度
      'data-pulse': dataAttr(dot && prop('pulse')),
      // 算出来是空的就整枚收起，作者不必自己判；退场播完才写
      'hidden': (!visible && !exiting) || undefined,
      // 光念数字听不出这是什么，宿主给了整句就用整句
      'aria-label': prop('label'),
      // 角标报的是宿主的状态而不是自己
      'role': prop('label') ? 'status' : undefined,
    }),
  }
}
