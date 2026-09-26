/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 empty state 相关实现。

import type { Tone } from '@xihan-ui/core'
import type { EmptyStateLive, EmptyStateSchema, EmptyStateStatus } from '@xihan-ui/headless'
import { connectEmptyState, emptyStateAnatomy, emptyStateMachine, emptyStateMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * `<xh-empty-state>`：空状态行为宿主，把 connectEmptyState 产出的属性接到角色节点上。
 *
 * root 默认是 role=status 的活区：节点应当常驻、用 hidden 收起，
 * 整块插入文档的活区读屏通常不播报。首屏静态占位写 live="off"。
 *
 * 开幕只在出现时播：页面加载期间接上、此刻可见的空状态直接呈现；页面加载完之后插入的、
 * 或 root 从 hidden 翻成显出的，才逐段开幕。
 *
 * @customElement xh-empty-state
 * @attr {'sm'|'md'|'lg'} size - 尺寸档位，写到 root 的 data-size 上
 * @attr {'polite'|'off'} live - 播报方式，off 时 root 不带 role
 * @attr {'404'|'403'|'500'} status - 结果页的状态码，写到 root 的 data-status 上；通用结果使用 tone
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气，写到 root 的 data-tone 上
 * @csspart root - 承载 role 与 data-size / data-status / data-tone 的容器
 * @csspart media - 装饰插画，对读屏隐藏；与 indicator 二选一
 * @csspart indicator - 装饰图标，对读屏隐藏
 * @csspart title - 标题
 * @csspart description - 说明
 * @csspart action - 操作按钮槽
 */
export class XhEmptyStateElement extends XhElement {
  static override partContract = { anatomy: emptyStateAnatomy, meta: emptyStateMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开
  static override properties = {
    size: { converter: STRING_CONVERTER },
    live: { converter: STRING_CONVERTER },
    status: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
  }

  declare size?: 'sm' | 'md' | 'lg'
  declare live?: EmptyStateLive
  declare status?: EmptyStateStatus
  declare tone?: Tone

  private readonly ctrl = new MachineController<EmptyStateSchema>(this, emptyStateMachine, () => ({
    size: this.size,
    live: this.live,
    status: this.status,
    tone: this.tone,
  }), {
    onBuilt: (svc) => {
      // Light DOM 没有水合：随 HTML 解析进来、加载期间升级的元素，由页面加载进度判为首屏
      svc.refs.set('getRootEl', () => this.getPart('root'))
    },
  })

  protected wire(): void {
    // 读响应式 property，不回读 DOM 特性
    const api = connectEmptyState(this.ctrl.service, wcNormalize)

    const put = (name: string, attrs: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, attrs)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('media', api.getMediaProps() as Record<string, unknown>)
    put('indicator', api.getIndicatorProps() as Record<string, unknown>)
    put('title', api.getTitleProps() as Record<string, unknown>)
    put('description', api.getDescriptionProps() as Record<string, unknown>)
    put('action', api.getActionProps() as Record<string, unknown>)
  }
}
