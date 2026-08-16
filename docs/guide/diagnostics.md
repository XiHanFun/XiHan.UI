# 诊断通道

组件在运行期发现「这里不对」时不直接 `console.warn`，而是往**诊断通道**投递一条结构化记录。宿主订阅后自行决定打印、收集还是上报。

## 为什么不直接打日志

因为契约违约需要被**处理**，不只是被看见。`wc.missing-part` 这类问题在开发时该显眼地报出来，在测试里该让用例失败，在生产环境该静默——同一条记录，三种归宿。写死 `console.warn` 只满足第一种。

## 记录的形状

```ts
interface DiagnosticRecord {
  code: string // 稳定标识，如 'wc.missing-part'
  level: 'error' | 'warn'
  message: string // 面向开发者的说明，文案可变
  scope?: string // 组件名，取解剖名
  instanceId?: string // 区分同一组件的多个实例
  part?: string
  node?: Element
  detail?: Record<string, unknown>
}
```

**`code` 稳定，`message` 不稳定。** 订阅方按码分流，不要匹配文案。

## 现有的码

```ts
export const DIAGNOSTIC_CODES = {
  invariant: 'core.invariant', // 断言不成立
  warn: 'core.warn', // 条件告警
  layerDisposeNotTop: 'core.layer.dispose-not-top', // dispose 的层不是栈顶
  machineError: 'machine.error', // 机器抛出 MachineError
  wcMissingPart: 'wc.missing-part', // 作者未渲染必需的角色节点
  wcUnknownPart: 'wc.unknown-part', // 角色节点的 part 名不在组件解剖内
  wcWrongPartTag: 'wc.wrong-part-tag', // 角色节点的标签不满足要求，原生语义会静默失效
  qrCodeLogoDamage: 'qr-code.logo-damage', // 中心 logo 挖掉的码字超出纠错级别能恢复的量
  stylesMissingSkin: 'styles.missing-skin', // 页面上出现了组件，但它那份皮肤没被引入
  deprecatedCssVar: 'deprecated.css-var', // 样式表里用到了已废弃的 CSS 自定义属性
  deprecatedLayer: 'deprecated.layer', // 样式表里用到了已废弃的 @layer 名
  deprecatedSelector: 'deprecated.selector', // 样式表里用到了已废弃的 data-* 选择器
  deprecatedAttribute: 'deprecated.attribute', // 自定义元素上挂了已废弃的 attribute
  deprecatedPart: 'deprecated.part', // 作者写了已废弃的 data-xh-part 角色名
}
```

三条 `wc.*` 是 Web Components 适配器的部件契约校验，也是日常最容易撞上的三条——手写 DOM 时漏一个 `data-xh-part` 或者写错名字，通道会明确告诉你哪个节点、哪个部件。

## 用法

```ts
import { onDiagnostic, setDiagnosticsLevel, setDiagnosticsConsoleOutput } from '@xihan-ui/kernel'

// 订阅
const off = onDiagnostic((record) => {
  if (record.code === 'wc.missing-part')
    reportToSentry(record)
})

// 调阈值：'error' | 'warn' | 'silent'
setDiagnosticsLevel('warn')

// 关掉内建 console 输出，只走自己的订阅
setDiagnosticsConsoleOutput(false)
```

其余可用的口子：

| 函数 | 作用 |
| --- | --- |
| `getDiagnostics()` | 拿到通道对象本身 |
| `reportDiagnostic(record)` | 投递一条（自定义组件里用） |
| `setDiagnosticsDedupe(on)` | 同一 `code + scope + instanceId + part + message` 是否只报一次 |
| `resetDiagnostics()` | 清空订阅者、去重记录与全部开关 |

## 默认行为

| 环境 | 阈值 | console 输出 | 去重 |
| --- | --- | --- | --- |
| 开发 | `warn` | 开 | 开 |
| 生产 | `silent` | 关 | 开 |

生产默认 `silent`，投递直接被丢弃，不产生任何开销。要在生产收集，显式调 `setDiagnosticsLevel('error')` 并挂自己的订阅。

去重键包含 message——同一个码下不同文案是不同的问题，只有逐帧重复的同一条才该被压掉。去重集有容量上限，超出即整体清空，长跑进程不会无界增长。

## 隔离性

- 通道挂在全局，同一页面里多份 `@xihan-ui/kernel` 副本共用一条通道；
- **订阅方抛错不会回流进组件**——你的上报逻辑炸了不会连累界面。

## 在测试里用

把阈值调到 `warn` 并订阅，就能把契约违约变成用例失败：

```ts
import { onDiagnostic, resetDiagnostics, setDiagnosticsLevel } from '@xihan-ui/kernel'

beforeEach(() => {
  resetDiagnostics()
  setDiagnosticsLevel('warn')
})

it('不应有契约违约', () => {
  const records: DiagnosticRecord[] = []
  onDiagnostic(r => records.push(r))
  render()
  expect(records).toEqual([])
})
```

## 废弃提示

四种**没有 IDE 提示**的介质——CSS 自定义属性、`data-*` 选择器、`@layer` 名、自定义元素 attribute——的废弃只能靠更新日志告知。现在有机器提示：维护者把废弃名登记进 `@xihan-ui/kernel` 的废弃登记表，dev 构建下消费方的旧用法会经诊断通道变成一条带迁移方向的 `warn`（五种 `deprecated.*` 码，见上表）。

登记表当前为空；发废弃时随 changeset 一起登记，格式：

```ts
import { registerDeprecation } from '@xihan-ui/kernel/deprecations'

// 五种介质：css-var / layer / selector / attribute / part
registerDeprecation({
  medium: 'css-var',
  match: '--xh-button-bg',            // 匹配串：旧名
  message: '--xh-button-bg 已废弃',   // 迁移说明，原样进诊断 message
  replaceWith: '--xh-button-surface', // 换成什么（没有就省略）
  until: '2.0.0',                     // 计划移除的版本，纯提示
})
```

探测面与两个适配器的启动方式：

| 介质 | 探测面 | 谁在查 |
| --- | --- | --- |
| `css-var` / `layer` / `selector` | 样式表（`<style>` 文本与 CSSOM，跨域样式表静默跳过） | `startDeprecationScan()` |
| `attribute` | DOM 里 `xh-*` 元素上的 attribute | `startDeprecationScan()` |
| `part` | 作者写的 `data-xh-part` 角色名 | Web Components 适配器的部件契约校验 |

**启动方式**：Web Components 在 `defineXhElements()` 里自动启动。Vue 侧不自动启动——扫描器挂在每个组件的共享路径上会进所有组件树摇入口（约 1.8 kB gzip），组件级体积棘轮量得出来；需要时两行手动启动（登记表为空时扫描器直接早退，零开销）：

```ts
import { startDeprecationScan } from '@xihan-ui/kernel/deprecations'

if (import.meta.env.DEV) {
  const stop = startDeprecationScan() // 返回停止函数
  stop()
}
```

DOM 侧先扫一遍已有节点，再用 MutationObserver 接住后续进来的节点与 `<style>`；跨域 `<link>` 样式表走 CSSOM 只扫一遍，之后动态注入的样式表不在观察范围内。同一个废弃名无论命中多少条规则只报一次（通道去重）。

## 相关

- [解剖与部件契约](./anatomy)：部件契约校验的内容
- [Web Components 适配器](../adapters/web-components)：三条 `wc.*` 码的来源
- [版本与兼容性政策](./versioning)：废弃流程与保留期
