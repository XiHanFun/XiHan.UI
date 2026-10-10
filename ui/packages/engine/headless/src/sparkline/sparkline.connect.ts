/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 sparkline 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { Mark, Scene, ShapeMark } from '@xihan-ui/viz'
import type { SparklineApi, SparklineSchema } from './sparkline.schema'
import type { SparklineMarkerKind } from './sparkline.types'
import { createScene, markPath } from '@xihan-ui/viz'
import { sparklineAnatomy } from './sparkline.anatomy'
import { sparklineModelOf } from './sparkline.logic'

const parts = sparklineAnatomy.build()

/** 尚未测量时的空场景：根只输出摘要。 */
const EMPTY_SCENE: Scene = createScene({ version: 0, layers: {}, bounds: { x: 0, y: 0, width: 0, height: 0 } })

const NO_MARKERS: ReadonlyMap<number, SparklineMarkerKind> = new Map()

export function connectSparkline<T extends PropTypes>(
  service: Service<SparklineSchema>,
  normalize: NormalizeProps<T>,
): SparklineApi<T> {
  const { context, prop, scope } = service
  const ids = scope.ids('sparkline', 'summary')
  const model = sparklineModelOf(service)
  const size = context.get('size')
  // 过渡中画正在显示的那一帧
  const frame = context.get('frame')
  const scene = frame?.scene ?? model.scene?.scene ?? EMPTY_SCENE
  const invalid = model.issues.length > 0
  const empty = !invalid && model.spec.count === 0
  const markers = model.scene?.markers ?? NO_MARKERS

  return {
    model,
    scene,
    measured: size != null && model.scene != null,
    empty,
    summary: model.summary,

    // 整张图是一幅图像：可及名来自作者写在根上的 aria-label，描述指向自动生成的摘要；
    // 不占 Tab 位、没有提示框，要读具体的值就换直角坐标图
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': 'img',
      'aria-describedby': ids.summary,
      'data-variant': prop('variant') ?? 'line',
      'data-tone': prop('tone') ?? 'neutral',
      // 规格不合法时不画：诊断通道报出原因，根上留一个可观察的状态；没有一个有值的点时是空
      'data-state': invalid ? 'error' : empty ? 'empty' : undefined,
      'viewBox': size ? `0 0 ${size.width} ${size.height}` : undefined,
    }),

    getSummaryProps: () => normalize.element({
      ...parts.summary.attrs,
      id: ids.summary,
    }),

    getMarkProps: (mark: Mark) => {
      const part = parts[mark.part as keyof typeof parts]
      const props: Record<string, unknown> = {
        ...part?.attrs,
        d: markPath(mark as ShapeMark),
        opacity: mark.opacity,
      }
      const index = mark.datum?.index
      if (mark.part === 'line' && frame?.entering.has(mark.key) === true) {
        // 新出现的折线从头描到尾：路径长度归一成 1，样式用虚线偏移从 1 走到 0
        props.pathLength = 1
        props['data-drawing'] = ''
      }
      else if (mark.part === 'dot') {
        props['data-marker'] = index == null ? undefined : markers.get(index)
        // 标记点等描线的笔尖到了才淡入：内核换算出它占入场时长的比例，样式乘上时长得到延迟
        const at = frame?.revealAt.get(mark.key)
        if (at != null) {
          props['data-drawing'] = ''
          props.style = { '--xh-_chart-reveal-at': at.toFixed(3) }
        }
      }
      else if (mark.part === 'bar') {
        const trend = mark.paint?.trend
        props['data-trend'] = trend
        props['data-marker'] = trend == null && index != null ? markers.get(index) : undefined
      }
      return normalize.element(props)
    },
  }
}
