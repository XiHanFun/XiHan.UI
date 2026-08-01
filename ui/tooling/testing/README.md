# @xihan-ui/testing

三套判据的运行时。私有，不发布。三个入口各管一件事：

| 入口 | 回答什么问题 | 跑在哪 |
| --- | --- | --- |
| `@xihan-ui/testing` | 这个适配器的实现符合规格吗 | jsdom |
| `@xihan-ui/testing/a11y` | 渲出来的东西有无障碍违规吗 | 真实 Chromium |
| `@xihan-ui/testing/position` | 浮层最终落在屏幕上对的位置吗 | 真实 Chromium |

后两套必须在真浏览器里跑：jsdom 没有布局，对比度、目标尺寸、翻面与避让一概演不出来。

## 一致性（主入口）

一份规格（`ConformanceSuite`）声明组件的解剖 part、键盘表与用例；每个适配器实现一个
`AdapterHarness`（挂载 fixture 树、取事件、卸载）。运行器把规格喂给某个 harness，逐帧
采集归一化后的 `DomSnapshot` 并断言。

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

## 无障碍（`./a11y`）

把一致性套件的 fixture 挂进真实 Chromium，对初始态与各用例终态跑 axe，终态按形态签名去重。

存量违规登记在 `src/a11y/known.ts`：命中已登记的规则不判失败，但**一条都不再命中时判登记过期**——
修好了就必须从表里删掉，不许留着一份早已不成立的豁免。

## 浮层定位（`./position`）

`runPositionEngine(engine, hooks, name)` 是一份**引擎无关**的契约：判据只认浮层最终出现在
屏幕的哪个位置，两个矩形都取视口坐标，因此不关心谁是谁的包含块、中间隔了几层 transform。
换一个定位引擎实现照跑不误。

覆盖十二种 placement 的贴边与对齐、offset、翻面与交叉轴避让（各配一条"关掉之后应当溢出"
的对照）、虚拟锚点、缩放与 transform 容器、文档滚动、容器滚动跟随、裁剪后的 hidden、
尺寸变化重算、静置不空转、停止跟随后不再回调。
