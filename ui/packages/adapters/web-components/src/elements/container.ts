/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 container 相关实现。

import type { ContainerMaxWidth, ContainerProps } from '@xihan-ui/headless'
import { connectContainer, containerAnatomy, containerMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

/**
 * `<xh-container>`：Light-DOM 行为宿主，无状态机，把 connectContainer 产出接到 root 角色节点。
 *
 * 作者写一个块级节点作为 root，版心里的内容直接放进 root。最大宽度档原样写为 data-max-width
 * （缺省档 lg 也写），宽度、居中与左右内衬由皮肤按档位与视口给出。
 * 宿主自身不占一层盒子（皮肤给它 display: contents），root 直接参与外层排布，与 Vue / React 渲染的结构一致。
 *
 * 根上不写 role：版心只是排版用的盒子，其中是页面主体还是一段区块由作者自行声明。
 *
 * @customElement xh-container
 * @attr {'sm'|'md'|'lg'|'xl'|'full'} max-width - 最大宽度档：sm / md / lg / xl 与同名断点同宽，full 不限宽；缺省 lg
 * @csspart root - 居中限宽的版心，承载 data-max-width
 */
export class XhContainerElement extends XhElement {
  static override partContract = { anatomy: containerAnatomy, meta: containerMeta }

  // 属性缺席翻成 undefined，缺省值由 connect 决定
  static override properties = {
    maxWidth: { converter: { fromAttribute: (v: string | null) => v ?? undefined }, attribute: 'max-width' },
  }

  declare maxWidth?: ContainerMaxWidth

  protected wire(): void {
    const root = this.getPart('root')
    if (!root)
      return

    // 读响应式 property，不回读 DOM 特性
    // 没有状态机，全局配置（组件级缺省）在这里并进来
    const api = connectContainer(this.configured('container', {
      maxWidth: this.maxWidth,
    } satisfies ContainerProps), wcNormalize)

    this.spreader.spread(root, api.getRootProps())
  }
}
