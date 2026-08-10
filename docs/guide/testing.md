# 测试与质量门禁

一个「框架无关」的组件库最容易出的问题是：两套适配器悄悄跑偏了。行为写在同一个内核里不代表两边表现一致——挂属性的时机、事件的派发形态、焦点的落点都可能各走各的。

XiHan.UI 的测试体系主要是为了防这件事。

## 三套判据

| 入口 | 回答什么问题 | 跑在哪 |
| --- | --- | --- |
| `@xihan-ui/testing` | 这个适配器的实现符合规格吗 | jsdom |
| `@xihan-ui/testing/a11y` | 渲出来的东西有无障碍违规吗 | 真实 Chromium |
| `@xihan-ui/testing/position` | 浮层最终落在屏幕上对的位置吗 | 真实 Chromium |

后两套必须在真浏览器里跑：jsdom 没有布局，对比度、目标尺寸、翻面与避让一概演不出来。

```bash
pnpm test         # 第一套
pnpm test:browser # 后两套（先 pnpm exec playwright install chromium）
```

## 一致性：一份规格喂两个适配器

**规格**（`ConformanceSuite`）声明组件的解剖部件、键盘表与用例；**适配器**各实现一个 `AdapterHarness`（挂载 fixture 树、取事件、卸载）。运行器把同一份规格喂给不同的 harness，逐帧采集归一化后的 `DomSnapshot` 并断言。

fixture 是框架无关的树：

```ts
interface FixtureNode {
  part?: string // 解剖 part 名，与 data-part 逐字相同
  tag?: string
  text?: string
  attrs?: Record<string, string> // 业务属性，不含 aria- / data-scope / data-part
  children?: FixtureNode[]
}
```

快照也是归一化的：

```ts
interface DomSnapshot {
  parts: Record<string, PartSnapshot[]> // part 名 → 全部实例（文档序）
  order: string[] // 文档序，集合项带下标：['trigger', 'content', 'item[0]']
  activeElement: ActiveElementRef | null // 焦点落在哪个 part、是否恰为该元素本身
  events: AdapterEvent[] // 自上一帧起适配器对外派发的事件
  strayParts: string[] // 带 data-scope 却不属于任何声明 part 的元素
}
```

### 五条契约不变量

这套判据能成立靠的是五条自我约束：

1. **规格零框架**——套件只从 `@xihan-ui/kernel` / `@xihan-ui/headless` 取纯数据（解剖、键盘表、类型），不 import 任何框架；
2. **只断言归一化快照**——断言对象只能是 `DomSnapshot`，不碰组件实例、内部 ref、`shadowRoot`；
3. **快照适配器无关**——id 的具体值、`data-v-*` 这类适配器痕迹在采集阶段抹掉，IDREF 属性翻译成 `@part(...)`。**抹不掉的差异即抽象泄漏**；
4. **单实例文档**——同一时刻文档内只有一个 harness 的一个挂载实例，卸载后该 scope 不得残留节点；
5. **状态断言归纯逻辑层**——harness 不暴露「当前机器状态」，`settle` 只等可观察的 DOM 事实。

第 3 条是关键：如果两个适配器的差异没法在归一化里抹掉，那说明抽象漏了，该修的是库不是测试。

### 分母外化

键盘规格表是可达性的**分母**。用例通过 `covers` 字段反查行 id，缺一行即套件失败。

想让键盘测试通过只能去写用例，不能去改分母。

## 无障碍

把一致性套件的 fixture 挂进真实 Chromium，对初始态与各用例终态跑 axe，终态按形态签名去重。

存量违规登记在 `tooling/testing/src/a11y/known.ts`：命中已登记的规则不判失败，但**一条都不再命中时判登记过期**——修好了必须从表里删掉，不许留着一份早已不成立的豁免。当前登记的清单见[无障碍与键盘规格](./a11y#存量违规登记表)。

## 浮层定位

`runPositionEngine(engine, hooks, name)` 是一份**引擎无关**的契约：判据只认浮层最终出现在屏幕的哪个位置，两个矩形都取视口坐标，因此不关心谁是谁的包含块、中间隔了几层 transform。换一个定位引擎实现照跑不误。

覆盖：十二种 placement 的贴边与对齐、offset、翻面与交叉轴避让（各配一条「关掉之后应当溢出」的对照）、虚拟锚点、缩放与 transform 容器、文档滚动、容器滚动跟随、裁剪后的 `hidden`、尺寸变化重算、静置不空转、停止跟随后不再回调。

## 结构门禁

`pnpm gate` 跑八项结构检查，它们查的是**判据查不到的东西**——静默失效、悬空承诺、没被命名的决策：

| 门禁 | 拦什么 |
| --- | --- |
| `check-runtime-deps` | 库包的运行时依赖引了未登记的第三方 |
| `check-exact-pins` | 库包依赖内联了版本号（只许 `catalog:` / `workspace:`） |
| `check-tokens-dist` | 令牌产物没入库 |
| `check-overlay-strategy` | 浮层坐标系在机器 / `connect` / 皮肤三处不一致 |
| `check-token-refs` | 皮肤引用了不存在的令牌名（整条声明会静默失效） |
| `check-shared-slots` | 同一字面量在多个组件里当默认值，却没立语义令牌 |
| `check-disabled-contrast` | 禁用态前景色令牌上又叠 `opacity`，对比度被压到读不出字 |
| `check-part-wiring` | 解剖声明、`connect` 产出、适配器却不接线的部件 |

另有四项单独的门禁：

```bash
pnpm boundaries   # 分层依赖 + 禁循环 + styled 不依赖 JS + 库包不引第三方
pnpm gate:tokens  # 重跑令牌生成后比对，改源忘了跑生成会被拦下
pnpm gate:cem     # 重新生成自定义元素清单后比对
pnpm gate:publish # 逐包跑 publint 与 attw，校验 exports 条件与类型解析
```

`gate:publish` 按包声明的支持面校验：ESM-only、`engines.node >= 24`，不提供 CJS，也不承诺 node10 的旧式解析。

## 体积棘轮

```bash
pnpm size
```

17 条产物各有上限（gzip 后），涨过线就红。几个参考值：`core` 3.3 kB、`machine` 5.5 kB、`position` 2.5 kB、`system/tokens.css` 1.6 kB、`headless` 138 kB、`wc/define` 149 kB。

## 相关

- [无障碍与键盘规格](./a11y)
- [浮层定位](./position)
- [架构总览](../overview#分层与依赖矩阵)
