/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 matrix code 相关实现。

import type { MatrixCodeFormat, MatrixCodeLevel, MatrixCodeProps } from '@xihan-ui/headless'
import type { PropType, VNode } from 'vue'
import { connectMatrixCode } from '@xihan-ui/headless'
import { computed, defineComponent, h, shallowRef } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { slotPaints } from '../../runtime/slot-content'
import { provideMatrixCode, useMatrixCodeContext } from './context'

type ModuleShape = NonNullable<MatrixCodeProps['moduleShape']>
type EyeShape = NonNullable<MatrixCodeProps['eyeShape']>

/**
 * 整张码绘制为一个 `<svg>`，`format` 选择码制；QR 下数据模块与三个码眼各成一条 `<path>`，其余码制只有前一条，静区依靠 viewBox 留出。
 * 矩阵由 connect 计算一次，这里只取现成的 path；没有可绘制的内容时不生成任何几何节点。
 *
 * 默认插槽中放置 XhMatrixCodeLogo 即在码面正中放置一块 logo：该片模块下方先铺一个底色矩形挖空，
 * 挖空排在插槽之前，logo 绘制在它上面。挖掉的码字超出所选 level 的纠错余量时，
 * connect 会向诊断通道报告一条警告，码照常绘制。
 */
export const XhMatrixCode = defineComponent({
  name: 'XhMatrixCode',
  // 缺省值由 connect 给出；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    format: { type: String as PropType<MatrixCodeFormat> },
    value: { type: String },
    // Boolean 显式保留 undefined：没给与给了 false 在 connect 里是两回事（rectangular 给了 qr 要报警告）
    gs1: { type: Boolean, default: undefined },
    // 取值域随码制：qr 是字母档，pdf417 是 0–8，aztec 是百分比
    level: { type: [String, Number] as PropType<MatrixCodeLevel> },
    rectangular: { type: Boolean, default: undefined },
    columns: { type: Number },
    pixelSize: { type: Number },
    margin: { type: Number },
    label: { type: String },
    moduleShape: { type: String as PropType<ModuleShape> },
    eyeShape: { type: String as PropType<EyeShape> },
  },
  setup(props, { slots }) {
    // 插槽里有没有东西是渲染期才知道的事实，进不了 computed 的依赖：先落到 ref 上，再让 api 依赖这个 ref。
    // 值没变时写入是空操作，不会多排一帧。
    const hasLogo = shallowRef(false)
    const api = computed(() => connectMatrixCode({
      format: props.format,
      value: props.value,
      gs1: props.gs1,
      level: props.level,
      rectangular: props.rectangular,
      columns: props.columns,
      pixelSize: props.pixelSize,
      margin: props.margin,
      label: props.label,
      moduleShape: props.moduleShape,
      eyeShape: props.eyeShape,
      logo: hasLogo.value,
    } satisfies MatrixCodeProps, vueNormalize))
    provideMatrixCode({ api })

    return () => {
      const content = slots.default?.() ?? []
      // 插槽里只剩注释或空白时不算放了 logo：挖空是拿底色盖住一片模块，白挖一块就是白毁一片
      hasLogo.value = slotPaints(content)

      const current = api.value
      const children: VNode[] = []
      if (current.path !== '')
        children.push(h('path', { 'data-xh-geom': 'modules', 'd': current.path }))
      if (current.eyePath !== '')
        children.push(h('path', { 'data-xh-geom': 'eyes', 'd': current.eyePath }))
      const area = current.logoArea
      if (area)
        children.push(h('rect', { 'data-xh-geom': 'logo-clear', 'x': area.x, 'y': area.y, 'width': area.size, 'height': area.size }))
      children.push(...content)

      return h('svg', current.getRootProps() as Record<string, unknown>, children)
    }
  },
})

/**
 * 码面正中的 logo：落位与尺寸由 connect 给出，作者只需放入图形。
 * 渲染为嵌套 `<svg>`，其中写 `width="100%" height="100%"` 即铺满该区域，溢出部分由它自身裁剪。
 */
export const XhMatrixCodeLogo = defineComponent({
  name: 'XhMatrixCodeLogo',
  setup(_, { slots }) {
    const ctx = useMatrixCodeContext()
    return () => h('svg', ctx.api.value.getLogoProps() as Record<string, unknown>, slots.default?.())
  },
})
