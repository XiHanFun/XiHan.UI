/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 progress 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// canvas 是承载环的 <svg>，label 是环心那一块；两个都只在环形下渲染，作者不写也成立。
// 量（meter）另有几样按数据生成的部件：threshold 是轨道上的分段色带，target 是目标刻度，
// scale 是刻度值的容器，scale-tick / scale-label 是刻度线与刻度值，needle 是仪表盘的指针。
export const progressAnatomy = createAnatomy('progress', [
  'root',
  'canvas',
  'track',
  'range',
  'label',
  'threshold',
  'target',
  'scale',
  'scale-tick',
  'scale-label',
  'needle',
])
