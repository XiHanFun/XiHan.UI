/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 图标栏里的名称提示：一台内嵌的 Tooltip 状态机按受控跑。悬停延时、接替窗口、提示组、定位与消解层全归它，
// 侧栏只记对着哪一行、开没开，并把行上的指针与焦点事件转给它。

import type { Service } from '@xihan-ui/core'
import type { TooltipSchema } from '../tooltip'
import type { SideNavSchema } from './side-nav.types'
import { itemValue, queryItems } from '@xihan-ui/core'
import { sideNavLinkQuery } from './side-nav.anatomy'

/**
 * 喂给内嵌提示机的那份 props：开合受控于侧栏，只有落成图标栏时才开；贴在行的行尾一侧（rtl 在左）。
 * 延时与接替窗口不在这里给，取 Tooltip 自己的缺省、所在提示组与全局配置，与页面上其余提示同一套。
 */
export function sideNavTooltipProps(service: Service<SideNavSchema>): TooltipSchema['props'] {
  const { prop, context, send } = service
  const railed = !!prop('collapsed') && context.get('railed')
  return {
    open: railed && context.get('tooltipOpen'),
    placement: prop('dir') === 'rtl' ? 'left' : 'right',
    dir: prop('dir'),
    size: prop('size'),
    onOpenChange: ({ open }) => send({ type: 'TOOLTIP.OPEN_CHANGE', open }),
  }
}

/** 名称提示的锚点：对着的那一行（分支按钮按 id、链接按 data-value 在侧栏根下现查）；找不到为 null。 */
export function findSideNavRowEl(service: Service<SideNavSchema>, value: string | null): HTMLElement | null {
  if (value == null)
    return null
  const { scope } = service
  const trigger = scope.getById(scope.partId('side-nav', `trigger-${value}`))
  if (trigger)
    return trigger
  const root = scope.getById(scope.partId('side-nav', 'root'))
  return queryItems(root, sideNavLinkQuery).find(el => itemValue(el) === value) ?? null
}
