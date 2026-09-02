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

## 相关

- [解剖与部件契约](./anatomy)：部件契约校验的内容
- [Web Components 适配器](../adapters/web-components)：三条 `wc.*` 码的来源
- [版本与兼容性政策](./versioning)：名字怎么改、怎么删
