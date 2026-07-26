# @xihan-ui/testing

跨适配器一致性套件的运行时。私有，不发布。

一份规格（`ConformanceSuite`）声明组件的解剖 part、键盘表与用例；每个适配器实现一个
`AdapterHarness`（挂载 fixture 树、取事件、卸载）。运行器把规格喂给某个 harness，逐帧
采集归一化后的 `DomSnapshot` 并断言，从而回答"这个适配器的实现符合规格吗"。

## 契约不变量

- **规格零框架**：`src/suites/**` 只从 `@xihan-ui/core` / `@xihan-ui/headless` 取纯数据
  （anatomy、键盘表、类型），不 import 任何框架。
- **只断言归一化快照**：断言对象只能是 `DomSnapshot`，不碰组件实例、内部 ref、shadowRoot。
- **快照适配器无关**：id 值、`data-v-*` 等适配器痕迹在采集阶段抹掉；IDREF 属性翻译成
  `@part(...)`，抹不掉的差异即抽象泄漏。
- **单实例文档**：同一时刻文档内只有一个 harness 的一个挂载实例；卸载后该 scope 不得残留节点。
- **状态断言归纯逻辑层**：harness 不暴露"当前机器状态"，`settle` 只等可观察的 DOM 事实。

## 分母外化

键盘表（`KeyboardTable`）是可达性的分母：用例通过 `covers` 反查行 id，缺一行即套件失败。
想让键盘测试通过只能去写用例，不能去改分母。
