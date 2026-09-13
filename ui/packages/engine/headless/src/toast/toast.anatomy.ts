/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 toast 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// 轻提示说明刚才那个操作的结果，然后自己消失；补充说明只能是一行短上下文，
// 需要持续阅读的长内容仍归 notification。
export const toastAnatomy = createAnatomy('toast', [
  'root',
  // 严重度指示符。作者不往里写东西时由皮肤按 data-severity 画一枚兜底字形；
  // 不渲染这个部件时字形仍由 root 的伪元素兜住。
  'indicator',
  // 标题与可选说明的统一文本列。
  'content',
  'title',
  'description',
  'action-trigger',
  // 倒计时条：机器算出的停留时长落在它的时长槽上，计时被按住时动画一并停住。
  'progress',
  'close-trigger',
  // 同时在场的几条叠成一摞。摞由服务档渲染，没有对应的容器组件，
  // 因此它没有 getter，属性直接从解剖里取。
  'group',
])
