/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 timestamp 相关实现。

import type { TimestampProps, TimestampType, TimestampValue } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectTimestamp } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { slotPaints } from '../../runtime/slot-content'

/**
 * 渲染为 `<time datetime>`：文本供人阅读，datetime 供机器读取，两者取自同一个墙钟。
 *
 * 默认插槽中写了内容时使用作者的文本，datetime 仍由组件计算：这正是用它包裹一段
 * 自行排版的时间表述的用法。插槽为空时铺设组件格式化后的文本。
 */
export const XhTimestamp = defineComponent({
  name: 'XhTimestamp',
  // 缺省值由 connect 给出；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    value: { type: [String, Number, Date] as PropType<TimestampValue> },
    type: { type: String as PropType<TimestampType> },
    format: { type: String },
    locale: { type: String },
    now: { type: [String, Number, Date] as PropType<TimestampValue> },
  },
  setup(props, { slots }) {
    const merged = withXhConfig('timestamp', props)
    const api = computed(() => connectTimestamp({
      value: merged.value,
      type: merged.type,
      format: merged.format,
      locale: merged.locale,
      now: merged.now,
    } satisfies TimestampProps, vueNormalize))

    return () => {
      const content = slots.default?.()
      return h(
        'time',
        api.value.getRootProps() as Record<string, unknown>,
        // 插槽里只剩注释或空白时不算写过东西，那种情况仍铺组件的文本
        slotPaints(content) ? content : api.value.text,
      )
    }
  },
})
