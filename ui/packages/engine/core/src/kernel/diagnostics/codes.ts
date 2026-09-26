/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 诊断码。订阅方按码分流，文案可改，码不可改。

/** 通用告警码单项入口；窄消费者无需为它保留整张码表。 */
export const DIAGNOSTIC_WARN = 'core.warn'

export const DIAGNOSTIC_CODES = {
  /** 断言不成立。 */
  invariant: 'core.invariant',
  /** 条件告警。 */
  warn: 'core.warn',
  /** dispose 的层不是栈顶。 */
  layerDisposeNotTop: 'core.layer.dispose-not-top',
  /** 机器抛出 MachineError。 */
  machineError: 'machine.error',
  /** 作者未渲染必需的角色节点。 */
  wcMissingPart: 'wc.missing-part',
  /** 角色节点的 part 名不在组件解剖内。 */
  wcUnknownPart: 'wc.unknown-part',
  /** 角色节点用的标签不满足元素文档的要求，原生语义会静默失效。 */
  wcWrongPartTag: 'wc.wrong-part-tag',
  /** 二维码中心 logo 挖掉的码字超出所选纠错级别能恢复的量。 */
  matrixCodeLogoDamage: 'matrix-code.logo-damage',
  /** 二维码收到一个对当前码制没有意义的选项，按没给处理。 */
  matrixCodeOptionIgnored: 'matrix-code.option-ignored',
  /** 条形码收到一个对当前码制没有意义的选项，按没给处理。 */
  barCodeOptionIgnored: 'bar-code.option-ignored',
  /** 页面上出现了某个组件，但它那份皮肤没被引入。 */
  stylesMissingSkin: 'styles.missing-skin',
  /** 适配器与 core 的版本不一致，锁步发版被打破。 */
  versionMismatch: 'core.version-mismatch',
  /** 作者给了默认插槽，但该组件不渲染插槽内容。 */
  ignoredSlot: 'core.ignored-slot',
  /** 浮层的祖先建了层叠上下文，浮层的层号被困在其中。 */
  overlayStackingTrap: 'overlay.stacking-trap',
  /** 滚动条挂载时找不到它要管的滚动容器：作者没给 scrollable，也没给能查到节点的 controls。 */
  scrollbarMissingScrollable: 'scrollbar.missing-scrollable',
  /** 浮层展开了却没有锚点：坐标与触发区都缺席，位置无从算起。 */
  overlayMissingAnchor: 'overlay.missing-anchor',
  /** 图表没有可及名：caption 部件、aria-label、aria-labelledby 都没有。 */
  chartMissingName: 'chart.missing-name',
  /** 系列引用的字段在数据里不存在。 */
  chartUnknownField: 'chart.unknown-field',
  /** 两个系列的 id 相同。 */
  chartDuplicateSeries: 'chart.duplicate-series',
  /** 分类系列超过 8 个：没有第 9 色。 */
  chartTooManySeries: 'chart.too-many-series',
  /** 同一张图混用分类色与语气色。 */
  chartMixedColorRoles: 'chart.mixed-color-roles',
  /** 固定色槽越界，或两个系列固定到同一槽。 */
  chartInvalidSlot: 'chart.invalid-slot',
  /** 同一堆叠组的 stackOffset 不一致。 */
  chartStackOffsetConflict: 'chart.stack-offset-conflict',
  /** 对数轴的定义域含 0 或跨越正负。 */
  chartLogDomain: 'chart.log-domain',
  /** 柱系列所在的值轴不含 0。 */
  chartBarBaseline: 'chart.bar-baseline',
  /** 占比类图表出现负值。 */
  chartNegativeShare: 'chart.negative-share',
} as const

export type DiagnosticCode = (typeof DIAGNOSTIC_CODES)[keyof typeof DIAGNOSTIC_CODES]
