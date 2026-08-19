// 诊断码。订阅方按码分流，文案可改，码不可改。

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
  qrCodeLogoDamage: 'qr-code.logo-damage',
  /** 页面上出现了某个组件，但它那份皮肤没被引入。 */
  stylesMissingSkin: 'styles.missing-skin',
  /** 样式表里用到了已废弃的 CSS 自定义属性。 */
  deprecatedCssVar: 'deprecated.css-var',
  /** 样式表里用到了已废弃的 @layer 名。 */
  deprecatedLayer: 'deprecated.layer',
  /** 样式表里用到了已废弃的 data-* 选择器。 */
  deprecatedSelector: 'deprecated.selector',
  /** 自定义元素上挂了已废弃的 attribute。 */
  deprecatedAttribute: 'deprecated.attribute',
  /** 作者写了已废弃的 data-xh-part 角色名。 */
  deprecatedPart: 'deprecated.part',
  /** 适配器与 kernel 的版本不一致，锁步发版被打破。 */
  versionMismatch: 'core.version-mismatch',
  /** 作者给了默认插槽，但该组件不渲染插槽内容。 */
  ignoredSlot: 'core.ignored-slot',
  /** 浮层的祖先建了层叠上下文，浮层的层号被困在其中。 */
  overlayStackingTrap: 'overlay.stacking-trap',
  /** 浮层展开了却没有锚点：坐标与触发区都缺席，位置无从算起。 */
  overlayMissingAnchor: 'overlay.missing-anchor',
} as const

export type DiagnosticCode = (typeof DIAGNOSTIC_CODES)[keyof typeof DIAGNOSTIC_CODES]
