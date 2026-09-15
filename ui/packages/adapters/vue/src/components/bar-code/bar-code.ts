/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 bar code 相关实现。

import type { BarCodeFormat, BarCodeProps } from '@xihan-ui/headless'
import type { PropType, VNode } from 'vue'
import { connectBarCode } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'

/**
 * 整张码绘制为一个 `<svg>`，`format` 选择码制：全部条合成一条 `<path>`，人读文字每段一个 `<text>`，
 * 静区依靠 viewBox 留出。条空序列由 connect 计算一次，这里只取现成的 path 与文字；
 * 没有可绘制的内容时不生成任何几何节点。
 */
export const XhBarCode = defineComponent({
  name: 'XhBarCode',
  // 缺省值由 connect 给出；普通类型省略 default，Boolean 显式保留 undefined——
  // 没给与给了 false 在 connect 里是两回事（checksum / bearerBars 给了别的码制要报警告）
  props: {
    format: { type: String as PropType<BarCodeFormat> },
    value: { type: String },
    gs1: { type: Boolean, default: undefined },
    text: { type: Boolean, default: undefined },
    checksum: { type: Boolean, default: undefined },
    barWidth: { type: Number },
    height: { type: Number },
    margin: { type: Number },
    bearerBars: { type: Boolean, default: undefined },
    label: { type: String },
  },
  setup(props) {
    const api = computed(() => connectBarCode({
      format: props.format,
      value: props.value,
      gs1: props.gs1,
      text: props.text,
      checksum: props.checksum,
      barWidth: props.barWidth,
      height: props.height,
      margin: props.margin,
      bearerBars: props.bearerBars,
      label: props.label,
    } satisfies BarCodeProps, vueNormalize))

    return () => {
      const current = api.value
      const children: VNode[] = []
      if (current.path !== '')
        children.push(h('path', { 'data-xh-geom': 'bars', 'd': current.path }))
      for (const run of current.text) {
        children.push(h('text', {
          'data-xh-geom': 'text',
          'x': run.x,
          'y': run.y,
          'text-anchor': run.anchor,
          'font-size': current.fontSize,
        }, run.text))
      }
      return h('svg', current.getRootProps() as Record<string, unknown>, children)
    }
  },
})
