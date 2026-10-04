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
  /** 进度条收到一个对当前形态或语义没有意义、或取值不合法的选项，按没给处理。 */
  progressOptionIgnored: 'progress.option-ignored',
  /** 步骤条收到一个对当前形态没有意义、或取值不合法的选项，按没给处理。 */
  stepsOptionIgnored: 'steps.option-ignored',
  /** 轮播渲染出来的条目比 slideCount 多：张数只看 slideCount，多出来的那几张翻不到。 */
  carouselSlideCountMismatch: 'carousel.slide-count-mismatch',
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
  /** 文档里有读不到规则的样式表（跨域且没以 CORS 加载）：Portal 视觉桥的样式索引整份作废，退回整表枚举与照旧重算。 */
  portalUnreadableStylesheet: 'portal.unreadable-stylesheet',
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
  /** 坐标轴的参数无效：幂轴的指数不是正的有限数、对称对数轴的常数不是正数、时区不是有效的 IANA 名，或最小厚度不是非负的有限数。 */
  chartScaleParam: 'chart.scale-param',
  /** 柱系列所在的值轴不含 0。 */
  chartBarBaseline: 'chart.bar-baseline',
  /** 占比类图表出现负值。 */
  chartNegativeShare: 'chart.negative-share',
  /** 区间不合法：两端不是有限数，或下界大于上界。 */
  chartInvalidRange: 'chart.invalid-range',
  /** Progress 在非 meter 语义下用了分段、目标、量程刻度或指示方式。 */
  chartMeterOnly: 'chart.meter-only',
  /** 图表注释指向的系列不存在，或指向的类目不在轴上：这条注释不画。 */
  chartAnnotationTarget: 'chart.annotation-target',
  /** K 线的开高低收对不上：最低价高于开盘或收盘，或最高价低于开盘或收盘。 */
  chartOhlcRange: 'chart.ohlc-range',
  /** 小提琴图要原始值才画得出密度：箱线系列写了 style: 'violin'，y 却是算好的五数字段。 */
  chartViolinRaw: 'chart.violin-raw',
  /** 雷达图的指标少于 3 个或多于 10 个：围不成面，或轴挤在一起读不出来。 */
  chartIndicatorCount: 'chart.indicator-count',
  /** 雷达图的实体多于 3 个：多边形互相遮挡，按两两配对检查只有前 3 个色槽都合格；图照常画，按提醒报。 */
  chartRadarOverlap: 'chart.radar-overlap',
  /** 层级图的数据组不成一棵树：扁平的行缺 idField / parentField，或 id 重复、父节点不存在、多个根、成环。 */
  chartHierarchyShape: 'chart.hierarchy-shape',
  /** 桑基图的流带不合法：成环、自环、端点不存在或节点重复；负值另报 chart.negative-share。 */
  chartSankeyShape: 'chart.sankey-shape',
  /** 关系图的数据不合法：节点重复、连线的端点不存在、自环，或树布局下数据不是一棵树。 */
  chartGraphShape: 'chart.graph-shape',
  /** 关系图的节点太多：多于 500 个时交互变慢，按提醒报；多于 2000 个时不画，先聚合。 */
  chartGraphSize: 'chart.graph-size',
  /** 列式数据用了它不支持的写法（堆叠、瀑布、箱线、类目轴、横向、逐点标签、刷选……），或与 svg 渲染器同写。 */
  chartColumnsOption: 'chart.columns-option',
  /** 列式数据里折线、K 线与柱共用的自变量列不是升序（追加了乱序的时间戳）。 */
  chartColumnsUnsorted: 'chart.columns-unsorted',
  /** 两种写法不能同时用：柱的涨跌取色（trend）与瀑布；等距排列（xAxis.ordinal）与对象数组。 */
  chartOptionConflict: 'chart.option-conflict',
} as const

export type DiagnosticCode = (typeof DIAGNOSTIC_CODES)[keyof typeof DIAGNOSTIC_CODES]
