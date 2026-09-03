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

## 像素基线

计算样式对不上会被令牌快照拦下，结构错位会被一致性套件拦下，但「值都对、看起来还是不一样」这一档没有任何判据管得住——层叠顺序、私有槽的覆盖时机、两条规则谁排在前面，这些只在最终那张位图上显形。像素基线守的就是这一档。

受管范围是母组件 `button` / `text-field` / `select` / `menu` / `popover` / `dialog` / `drawer` / `toast`，每件在五组轴上各出一张：`light×comfortable`、`dark×comfortable`、`light×compact`、`dark×compact`、`dark×more`。前四格是主题与密度的笛卡尔积；第五格是层叠最脆的一格——两块 `contrast` 取值块必须排在两个 `mode` 块之后，顺序一错就静默回归。`motion=reduce` 不在其中：静止帧与默认档没有差别，那一轴由令牌快照与 `check-infinite-motion` 承担。

基线文件在 `packages/adapters/vue/tests/browser/__screenshots__/` 下，具体几张以那个目录为准，这里不抄。

### 为什么必须在容器里生成

基线比的是逐像素的位图。字体、字形栅格化与子像素抹平在 Windows 与 Linux 上不是一回事，同一份 CSS 在两边渲出来的位图不同——在开发机上出的基线，CI 上一张都对不上。

字体是这里最大的不确定性：全库皮肤写的是 `font-family: inherit`，没有 sans 字体令牌，字体最终取文档根上的那一个。截图用例因此把根上的字体族按名字写死成 `DejaVu Sans`，不留给环境默认的 `sans-serif` 去解析。所以基线的成立条件不止「Linux」，还包括「`DejaVu Sans` 这个名字解析得到」，即装了 `fonts-dejavu-core`——CI 的 `browser` job 里有一步专门装它，删掉那一步基线会整体判红。

反过来，环境里多装几款字体不影响基线：字体族是按名字定的，默认 `sans-serif` 落到 Noto Sans 还是别的，画面一个像素都不变。核对字体时核对的是这个名字（`fc-match 'DejaVu Sans'`），不是默认 `sans-serif`。

```bash
pnpm visual:baseline            # 校验：与库里的基线逐像素比对
pnpm visual:baseline --update   # 生成 / 更新基线并写回库里
```

两条都在 `mcr.microsoft.com/playwright:v1.62.0-noble` 里跑，与 CI 同一套渲染栈。第一次要先 `docker pull` 这个镜像；镜像版本与 `pnpm-workspace.yaml` 里 `playwright` 的版本必须对上，浏览器二进制才配套。

运行器把仓库同步进容器里的工作副本再装依赖，不在宿主的 `node_modules` 上动手——宿主装的是 win32-x64 的原生二进制，容器里跑不起来，反过来在容器里装又会把宿主那份覆盖掉。pnpm store 与工作副本都落在一个命名卷上，重复运行不重装。

校验模式下基线目录**根本没挂进容器**，容器写不到它。要改基线只能显式走 `--update`。

比对失败时，实际截图与差异图落在 `packages/adapters/vue/.vitest-attachments/`（不入库）。CI 上同一批文件会作为 `visual-diffs` artifact 传出来，下载下来逐张看。

### 基线变更必须过人眼

基线的更新是无声的：`git diff` 只会说二进制文件变了，看不出变成了什么样。谁都能 `--update` 一把，把一次真实的视觉回归洗成「基线本来就长这样」。

所以规则是：**PR 里凡有 `__screenshots__/` 下的改动，作者必须逐张说明为什么该变，审阅者必须打开图看过**。改动张数与改动理由对不上的 PR 不合并。

基线文件名带浏览器与平台后缀（`…-chromium-linux.png`）。在 Windows 上直接跑 `pnpm test:browser` 不会与 Linux 基线比对，而是另出一套 `-win32` 的文件——这套不入库，看到了直接删，不要提交。

## 结构门禁

`pnpm gate` 跑 84 项结构检查，它们查的是**判据查不到的东西**——静默失效、悬空承诺、没被命名的决策：

| 门禁 | 拦什么 |
| --- | --- |
| `check-runtime-deps` | 库包的运行时依赖引了未登记的第三方 |
| `check-exact-pins` | 库包依赖内联了版本号（只许 `catalog:` / `workspace:`） |
| `check-tokens-dist` | 令牌产物没入库 |
| `check-overlay-strategy` | 浮层坐标系在机器 / `connect` / 皮肤三处不一致 |
| `check-token-refs` | 皮肤引用了不存在的令牌名（整条声明会静默失效） |
| `check-shared-slots` | 同一字面量在多个组件里当默认值，却没立语义令牌 |
| `check-motion-easing` | 皮肤的缓动下探到 `--xh-ease-*` 原语、手写 `cubic-bezier()`，或用了没登记的字面曲线 |
| `check-motion-amplitude` | 位移与缩放的幅度写成字面量（减弱动效档把 `--xh-motion-distance-*` 压成 `0px`、`--xh-motion-scale-*` 压成 `1`，写死的那一处压不下去）；居中用的百分比与 `0` / `1` 是几何，不在此列 |
| `check-disabled-contrast` | 禁用态前景色令牌上又叠 `opacity`，对比度被压到读不出字 |
| `check-color-literals` | 颜色写死在 `background` 简写、`box-shadow` 颜色位或 `--xh-*` 槽赋值里——stylelint 的六个长属性白名单看不见这几处 |
| `check-print-surface` | 浮层定位层 / 遮罩 / 滚动条 / 钉在视口上的节点在打印时没收起，或投影没由令牌层取消 |
| `check-placeholder-fg` | 占位文字两条通道（`::placeholder` 与 `[data-placeholder]`）取了不同的默认前景，或用 `opacity` 表达深浅 |
| `check-autofill` | 渲染原生表单控件的输入框没写自动填充规则，或两个手段 / 两个引擎的选择器缺一 |
| `check-part-wiring` | 解剖声明、`connect` 产出、适配器却不接线的部件 |
| `check-dead-state-attr` | `connect` 发出的 `data-*` 在**本组件的作用域**里没有一条规则消费——别的组件有同名规则不算数，那条规则永远选不中它。信息钩子逐条登记，登记项过期同样判失败 |
| `check-breakpoints` | 皮肤 `@media` 里的断点字面量不在令牌清单里（自定义属性在媒体条件里不生效，只能写字面量） |
| `check-focus-ring` | 聚焦环的粗细、颜色、偏移写了字面量而不是令牌，主题与全局调整对它无效 |
| `check-exports` | 实现了却忘了从包级入口导出，包外拿不到它，而构建与类型检查照过 |
| `check-package-roles` | 包所在的角色组与它 `package.json` 里的依赖声明对不上 |
| `check-public-surface` | 公开面基线里有而当前没有的名字——被删了或改名了 |

另有分层依赖检查与八项单独的门禁：

```bash
pnpm boundaries   # 分层依赖 + 禁循环 + styles 不依赖 JS + 库包不引第三方
pnpm gate:tokens  # 重跑令牌生成后比对，改源忘了跑生成会被拦下
pnpm gate:styled  # 重新生成皮肤的无层版产物后比对
pnpm gate:cem     # 重新生成自定义元素清单后比对
pnpm gate:docs    # 重新生成组件文档页后比对
pnpm gate:exports # 重新生成子路径导出后比对 package.json
pnpm gate:surface # 公开面基线：基线里有而当前没有的名字判失败
pnpm gate:demos   # 真实 Chromium 里跑文档站的自定义元素示例
pnpm gate:publish # 逐包跑 publint 与 attw，校验 exports 条件与类型解析
```

`gate:publish` 按包声明的支持面校验：ESM-only、`engines.node >= 18`，不提供 CJS，也不承诺 node10 的旧式解析。

## 体积棘轮

```bash
pnpm size
```

28 条产物各有上限（gzip 后），涨过线就红。预算一律按实测留一成余量。逐条限额的真源是 `ui/.size-limit.json`，要看具体数字请翻那一份，这里不抄。

## 相关

- [无障碍与键盘规格](./a11y)
- [浮层定位](./position)
- [架构总览](../overview#分层与依赖矩阵)
