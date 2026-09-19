# 测试与质量门禁

框架无关的组件库最常见的问题是各适配器逐渐偏离。行为写在同一个内核中不代表各端表现一致：写入属性的时机、事件的派发形态、焦点的落点都可能不同。

XiHan.UI 的测试体系首先针对这一点。

## 三套判据

| 入口 | 回答的问题 | 运行环境 |
| --- | --- | --- |
| `@xihan-ui/testing` | 适配器的实现是否符合规格 | jsdom |
| `@xihan-ui/testing/a11y` | 渲染结果是否存在无障碍违规 | 真实 Chromium |
| `@xihan-ui/testing/position` | 浮层最终是否落在屏幕上正确的位置 | 真实 Chromium |

后两套必须在真实浏览器中运行：jsdom 没有布局，无法验证对比度、目标尺寸、翻面与避让。

```bash
pnpm test         # 第一套
pnpm test:browser # 后两套（先 pnpm exec playwright install chromium）
```

在 Windows / macOS 宿主上，`pnpm test:browser` 固定有一条失败：像素基线文件受字体守卫拦截，整文件判失败、40 条用例全部 skipped。这是预期结果，不是环境故障；本地验证像素改动的方式见下文「像素基线」。

## 一致性：一份规格驱动各适配器

规格（`ConformanceSuite`）声明组件的解剖部件、键盘表与用例；适配器各实现一个 `AdapterHarness`（挂载 fixture 树、获取事件、卸载）。运行器把同一份规格交给不同的 harness，逐帧采集归一化后的 `DomSnapshot` 并断言。

fixture 是框架无关的树：

```ts
interface FixtureNode {
  part?: string; // 解剖 part 名，与 data-part 逐字相同
  tag?: string;
  text?: string;
  attrs?: Record<string, string>; // 业务属性，不含 aria- / data-scope / data-part
  children?: FixtureNode[];
}
```

快照也是归一化的：

```ts
interface DomSnapshot {
  parts: Record<string, PartSnapshot[]>; // part 名 → 全部实例（文档序）
  order: string[]; // 文档序，集合项带下标：['trigger', 'content', 'item[0]']
  activeElement: ActiveElementRef | null; // 焦点落在哪个 part、是否恰为该元素本身
  events: AdapterEvent[]; // 自上一帧起适配器对外派发的事件
  strayParts: string[]; // 带 data-scope 却不属于任何声明 part 的元素
}
```

### 五条契约不变量

这套判据依赖五条约束：

1. 规格零框架：套件只从 `@xihan-ui/core` / `@xihan-ui/headless` 取纯数据（解剖、键盘表、类型），不 import 任何框架；
2. 只断言归一化快照：断言对象只能是 `DomSnapshot`，不接触组件实例、内部 ref、`shadowRoot`；
3. 快照适配器无关：id 的具体值、`data-v-*` 等适配器痕迹在采集阶段抹除，IDREF 属性翻译为 `@part(...)`。无法抹除的差异即抽象泄漏；
4. 单实例文档：同一时刻文档内只有一个 harness 的一个挂载实例，卸载后该 scope 不得残留节点；
5. 状态断言归纯逻辑层：harness 不暴露当前状态机状态，`settle` 只等待可观察的 DOM 事实。

第 3 条是关键：适配器之间的差异无法在归一化中抹除，说明抽象存在泄漏，应修改的是库而不是测试。

### 分母外化

键盘规格表是可达性的分母。用例通过 `covers` 字段反查行 id，缺一行即套件失败。

键盘测试只能通过补充用例通过，不能修改分母。

## 无障碍

把一致性套件的 fixture 挂载到真实 Chromium，对初始态与各用例终态运行 axe，终态按形态签名去重。

存量违规登记在 `tooling/testing/src/a11y/known.ts`：命中已登记的规则不判失败，但一条都不再命中时判定登记过期：修复后必须从表中删除，不保留已不成立的豁免。当前登记的清单见[无障碍与键盘规格](./a11y#存量违规登记表)。

## 浮层定位

`runPositionEngine(engine, hooks, name)` 是一份引擎无关的契约：判据只认浮层最终出现在屏幕的位置，两个矩形都取视口坐标，因此不关心包含块关系与中间的 transform 层数。更换定位引擎实现后同样适用。

覆盖：十二种 placement 的贴边与对齐、offset、翻面与交叉轴避让（各配一条关闭后应当溢出的对照）、虚拟锚点、缩放与 transform 容器、文档滚动、容器滚动跟随、裁剪后的 `hidden`、尺寸变化重算、静置不空转、停止跟随后不再回调。

## 像素基线

计算样式不一致会被令牌快照拦截，结构错位会被一致性套件拦截，但值全部正确、外观仍然不同这一档没有其他判据覆盖：层叠顺序、私有槽的覆盖时机、两条规则的先后，只在最终位图上显现。像素基线负责这一档。

受管范围是母组件 `button` / `text-field` / `select` / `menu` / `popover` / `dialog` / `drawer` / `toast`，每件在五组轴上各出一张：`light×comfortable`、`dark×comfortable`、`light×compact`、`dark×compact`、`dark×more`。前四格是主题与密度的笛卡尔积；第五格是层叠最脆弱的一格：两块 `contrast` 取值块必须排在两个 `mode` 块之后，顺序错误即静默回归。`motion=reduce` 不在其中：静止帧与默认档没有差别，该轴由令牌快照与 `check-infinite-motion` 承担。

基线文件在 `packages/adapters/vue/tests/browser/__screenshots__/` 下，具体数量以该目录为准。

### 必须在容器中生成的原因

基线比对的是逐像素的位图。字体、字形栅格化与子像素平滑在 Windows 与 Linux 上不同，同一份 CSS 在两边渲染出的位图不同：在开发机上生成的基线，CI 上无法匹配。

字体是最大的不确定性：全库皮肤写的是 `font-family: inherit`，没有 sans 字体令牌，字体最终取文档根上的值。截图用例因此把根上的字体族按名字固定为 `DejaVu Sans`，不交给环境默认的 `sans-serif` 解析。因此基线的成立条件不止 Linux，还包括 `DejaVu Sans` 这个名字可以解析到，即安装了 `fonts-dejavu-core`：CI 的 `browser` job 中有一步专门安装它，删除该步骤基线会整体判红。

反过来，环境中多安装字体不影响基线：字体族按名字确定，默认 `sans-serif` 落到 Noto Sans 或其他字体，画面不变。核对字体时核对的是这个名字（`fc-match 'DejaVu Sans'`），不是默认 `sans-serif`。

```bash
pnpm visual:baseline            # 校验：与库里的基线逐像素比对
pnpm visual:baseline --update   # 生成 / 更新基线并写回库里
```

两条都在 `mcr.microsoft.com/playwright:v1.62.0-noble` 中运行，与 CI 使用同一套渲染栈。首次运行前先 `docker pull` 该镜像；镜像版本必须与 `pnpm-workspace.yaml` 中 `playwright` 的版本一致，浏览器二进制才配套。

运行器把仓库同步到容器内的工作副本再安装依赖，不使用宿主的 `node_modules`：宿主安装的是 win32-x64 原生二进制，容器内无法运行，而在容器内安装会覆盖宿主的副本。pnpm store 与工作副本都落在一个命名卷上，重复运行不重复安装。

校验模式下基线目录不挂载进容器，容器无法写入。修改基线只能显式使用 `--update`。

比对失败时，实际截图与差异图输出到 `packages/adapters/vue/.vitest-attachments/`（不入库）。CI 上同一批文件作为 `visual-diffs` artifact 输出，可下载逐张查看。

### 本地运行方式与固定失败项

`pnpm visual:baseline` 是本地唯一有效的入口，不使用宿主的渲染栈：源码同步进容器、依赖在容器内安装、用例在容器内运行，因此 Windows 与 macOS 上的结果与 CI 逐像素一致。前置条件只有 `docker pull`。

直接运行 `pnpm test:browser` 时，像素基线文件整文件判红：字体守卫在 `beforeAll` 中抛错，40 条用例全部 skipped，不生成任何位图，也不会在 `__screenshots__/` 下留下带 `-win32` 后缀的文件。在宿主上安装 DejaVu 无法解决：字体只是差异之一，字形栅格化与子像素平滑仍与 Linux 不同，比对结果没有意义。这条失败是预期结果，同一批浏览器态用例中的无障碍与浮层定位在宿主上照常通过。

修改皮肤的工作方式：

- 本地 `pnpm visual:baseline` 查看本次改动影响的截图，差异图在 `.vitest-attachments/` 下逐张打开；
- PR 的判据是 CI 的 `browser` job，本地 `pnpm test:browser` 的固定失败项可以忽略；
- CI 失败时先下载 `visual-diffs` artifact 查看，确认是有意的视觉改动，再 `pnpm visual:baseline --update` 重新生成基线并提交。

字体族名、安装它的 apt 包、容器镜像与运行命令分散在用例、容器脚本、CI 与本页中，任何一处不一致都只表现为四十张整体判红。`check-visual-baseline-env` 把四处对齐，并核对镜像版本与 `pnpm-workspace.yaml` 中 `playwright` 的版本一致、CI 的 `browser` job 中安装字体的步骤排在运行用例之前。

### 基线变更必须经人工审阅

基线的更新是无声的：`git diff` 只显示二进制文件变化，看不出变成了什么。任何人都可以 `--update`，把一次真实的视觉回归记录为新基线。

因此规则是：PR 中凡有 `__screenshots__/` 下的改动，作者必须逐张说明变更原因，审阅者必须打开图片查看。改动张数与改动理由不一致的 PR 不合并。

基线文件名带浏览器与平台后缀（`…-chromium-linux.png`），入库的只有 `linux` 一套。带其他平台后缀的文件不应出现（字体守卫会在生成之前拦截用例），出现时直接删除，不提交。

## 视觉样板性能预算

`pnpm visual:performance` 在与像素基线相同的 Playwright Linux 镜像中运行真实 Chromium，并把报告写到
`ui/packages/adapters/vue/.vitest-attachments/visual-performance.json`。这条用例不另建展示页：它直接复用
`visual-baseline.spec.ts` 的 Dialog `variant="blur"` 夹具与 800×520 视口，在对话框后方逐帧移动固定渐变背景，
让 `backdrop-filter` 参与真实合成。默认透明与 `data-transparency="reduce"` 交替采样，避免先后顺序把机器热态集中到某一档。

设备档固定为 `mcr.microsoft.com/playwright:v1.62.0-noble`、Chromium、800×520@1x、2 CPU、2 GiB，
并通过 CDP 对渲染进程施加 4× CPU throttle。每档先预热 30 帧，再采 120 帧，重复三轮。预算真源是
`tooling/scripts/visual-performance-budget.json`；容器镜像版本继续与 `pnpm-workspace.yaml` 的 Playwright catalog 对齐。

报告与门禁包含：

- `requestAnimationFrame` 相邻回调的 p50 / p95 / 最大间隔；每帧都会改变背景绘制位置，这个间隔包含该帧排队、样式、绘制与合成对下一帧的影响，不把纯 JS 计时冒充 GPU 时间；
- W3C Long Tasks `PerformanceObserver` 给出的长任务数量、最大值与合计时长；
- 每个可见且计算样式含 `blur(...)` 的 `backdrop-filter` 元素，在视口内裁切后的面积之和。重叠材质逐层计数，因为每一层都要独立取样；`reduce` 档必须严格为 0；
- 10 次交替挂载/卸载后，强制 GC 前后的 CDP `Memory.getDOMCounters` 差值，作为 documents / DOM nodes / JS listeners 的资源留存代理。

这里不输出伪内存数。浏览器目前没有稳定的标准轨页面内存 API；候选
`measureUserAgentSpecificMemory()` 仍是 WICG 草案，且要求跨源隔离。测试页不为获取一个数字而伪造隔离条件，
报告如实记录候选 API 与 `crossOriginIsolated` 状态，并用上述 DOM 资源留存代理监测泄漏。长任务定义见
[W3C Long Tasks](https://www.w3.org/TR/longtasks-1/)，内存候选 API 的标准状态见
[WICG Measure Memory](https://wicg.github.io/performance-measure-memory/)。

第一次建立或有意重定预算时，必须先运行：

```bash
pnpm visual:performance --record
```

`--record` 只写真实报告、不判断 `limits`。至少检查一份完整报告后，才按实测值与明确余量修改预算真源；常规
`pnpm visual:performance` 执行红线。CI 运行后者。像素基线仍由 `pnpm visual:baseline` 守护，本项不自动更新任何 PNG。

包体积不在性能 JSON 里复制数字：JavaScript / 发布产物继续由 `.size-limit.json` 与 `pnpm size` 守护，逐皮肤 CSS
继续由 `.size-limit.css.json` 与 `check-skin-size` 守护。性能预算门禁反查这两份真源；修改本项不得提高既有阈值。

## 结构门禁

`pnpm gate` 运行 122 项结构检查，它们检查的是判据无法覆盖的问题：静默失效、悬空承诺、未被命名的决策：

| 门禁 | 拦截内容 |
| --- | --- |
| `check-runtime-deps` | 库包的运行时依赖引入了未登记的第三方 |
| `check-exact-pins` | 库包依赖内联了版本号（只允许 `catalog:` / `workspace:`） |
| `check-tokens-dist` | 令牌产物未入库 |
| `check-overlay-strategy` | 浮层坐标系在机器 / `connect` / 皮肤三处不一致 |
| `check-token-refs` | 皮肤引用了不存在的令牌名（整条声明会静默失效） |
| `check-tone-tokens` | 语气轴对外的 `--xh-tone-*` 没声明在语气层的 `[data-tone]` 上，或与私有槽的取值分叉 |
| `check-shared-slots` | 同一字面量在多个组件中作为默认值，却未建立语义令牌 |
| `check-motion-easing` | 皮肤的缓动下探到 `--xh-ease-*` 原语、手写 `cubic-bezier()`，或使用了未登记的字面曲线 |
| `check-motion-amplitude` | 位移与缩放的幅度写成字面量（减弱动效档把 `--xh-motion-distance-*` 压成 `0px`、`--xh-motion-scale-*` 压成 `1`，写死的位置无法压缩）；居中用的百分比与 `0` / `1` 是几何，不在此列 |
| `check-disabled-contrast` | 禁用态前景色令牌上叠加 `opacity`，对比度被压到无法阅读 |
| `check-color-literals` | 颜色写死在 `background` 简写、`box-shadow` 颜色位或 `--xh-*` 槽赋值中：stylelint 的六个长属性白名单不覆盖这些位置 |
| `check-print-surface` | 浮层定位层 / 遮罩 / 滚动条 / 固定在视口上的节点在打印时未收起，或投影未由令牌层取消 |
| `check-placeholder-fg` | 占位文字两条通道（`::placeholder` 与 `[data-placeholder]`）取了不同的默认前景，或用 `opacity` 表达深浅 |
| `check-autofill` | 渲染原生表单控件的输入框未写自动填充规则，或两种手段 / 两个引擎的选择器缺一 |
| `check-part-wiring` | 解剖声明、`connect` 产出、适配器却未接线的部件 |
| `check-dead-state-attr` | `connect` 发出的 `data-*` 在本组件的作用域中没有任何规则消费：其他组件的同名规则不计入，该规则永远无法选中它。信息钩子逐条登记，登记项过期同样判失败 |
| `check-skin-parts` | 皮肤选择器中的 `[data-part]` 不在所属 scope 的解剖中：部件退役后遗留的规则永远无法选中节点，`surface:update` 还会把它的覆盖槽收回公开面。scope 按选择器计算（逐分支、逐复合：写在 `[data-part]` 前后的 `[data-scope]` 都约束这一节，未写的沿用左侧最近一节，`:is()` / `:where()` 中一致的 scope 带回外层，`:not()` / `:has()` 中各自计算），解剖外的名字逐条登记，登记项过期同样判失败；`data-scope` / `data-part` 的属性选择器无法读取的（转义、匹配符不是全等）同样判失败 |
| `check-breakpoints` | 皮肤 `@media` 中的断点字面量不在令牌清单中（自定义属性在媒体条件中不生效，只能写字面量） |
| `check-focus-ring` | 聚焦环的粗细、颜色、偏移写了字面量而不是令牌，主题与全局调整对它无效 |
| `check-focus-ring-surface` | 可聚焦部件的面与环的对比度不足 3:1（按计算结果，不按形态推断），该档却未把 `--xh-_ring-color` 设为 `currentColor`：键盘焦点在该面上等于未绘制。`currentColor` 覆盖到非实心档、`:focus-visible` 中关闭环（`outline: none` / `outline-width: 0`）却未登记环由谁绘制、绘制实心面却不接焦点也未登记的部件，同样判红；聚焦规则把环色写成透明的直接判红，没有登记表 |
| `check-focus-outline-reset` | 皮肤在 `:focus:not(:focus-visible)` 下复位 `outline`（含 `outline-style` / `outline-width` / `outline-color`）。UA 只在 `:focus-visible` 绘制环，这条复位是死代码，而 `outline` 简写会把 `outline-color` 复位成 `currentColor`，与家族配方的 `outline-color` 过渡叠加，焦点离开时闪出一圈近黑描边 |
| `check-exports` | 已实现却未从包级入口导出，包外无法获取，而构建与类型检查照常通过 |
| `check-package-roles` | 包所在的角色组与其 `package.json` 中的依赖声明不一致 |
| `check-public-surface` | 公开面基线中有而当前没有的名字：被删除或改名 |
| `check-visual-performance-budget` | 固定设备、默认/reduce 场景、真实浏览器入口与既有 JS/CSS 体积真源任一脱节 |
| `check-surface-edge` / `check-selection-marker` / `check-state-ladder` / `check-text-role` 与扩展后的 `check-elevation-role` / `check-shape-scale` / `check-press-feedback` / `check-family-parity` | 七条家族门禁：根面边界三选一、选中与当前态按语义分类、交互态按承载面阶梯、排版与图标按角色、raised 逐部件登记且必带描边、形状身份表、按压几何与换底、同族同值。尚未迁移的存量登在 `tooling/scripts/family-backlog.json`，每条必须真被放行过一次（登记了却没命中判过期），`check-family-backlog`（`gate:family` 里的 `family-backlog.spec.mjs`）把每段条目数钉在快照与 CEILING 上、键集合只许是快照的子集——表只减不增 |

另有分层依赖检查与十一项单独的门禁：

```bash
pnpm boundaries   # 分层依赖 + 禁循环 + styles 不依赖 JS + 库包不引入第三方
pnpm gate:tokens  # 重新运行令牌生成后比对，修改源文件未运行生成会被拦截
pnpm gate:styled  # 重新生成皮肤的无层版产物后比对
pnpm gate:cem     # 重新生成自定义元素清单后比对
pnpm gate:docs    # 重新生成组件文档页后比对
pnpm gate:exports # 重新生成子路径导出后比对 package.json
pnpm gate:surface # 公开面基线：基线中有而当前没有的名字判失败
pnpm gate:demos   # 在真实 Chromium 中运行文档站的自定义元素示例
pnpm gate:publish # 逐包运行 publint 与 attw，校验 exports 条件与类型解析
pnpm gate:llms    # 文档站的机读资产：页数、组件数、令牌数与库对账，示例不得保留站点标签
pnpm gate:family  # 逐家族豁免表只减不增（条目数快照 + 键集合子集），并用临时夹具证七条家族门禁会红
```

`gate:llms` 读取文档站的构建产物，运行前先在 `docs/` 下运行一次 `pnpm build`。

文档站是独立工作区，lint 也独立，在 `docs/` 下运行 `pnpm lint`。示例语料的引号与分号与库源码相反，规则固定在 `docs/eslint.config.js` 中：示例供使用者复制，不跟随库源码的写法。

`gate:publish` 按包声明的支持面校验：ESM-only、`engines.node >= 18`，不提供 CJS，也不承诺 node10 的旧式解析。

## 体积棘轮

```bash
pnpm size
```

37 条产物各有上限（gzip 后），超出即失败。预算一律按实测留一成余量。逐条限额的真源是 `ui/.size-limit.json`，具体数字以该文件为准。


## 相关

- [无障碍与键盘规格](./a11y)
- [浮层定位](./position)
- [架构总览](../overview#分层与依赖矩阵)
