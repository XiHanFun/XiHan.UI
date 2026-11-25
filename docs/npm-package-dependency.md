# 包与依赖关系

XiHan.UI 是一个 pnpm workspace。`packages/*/*` 是对外发布的库包（按角色分 `adapters` / `design` / `features` / `engine` / `tools` 五组），`tooling/*` 是内部工具（不发布）。

## 全部库包

| 包 | 职责 | 依赖 | peer 依赖 | 层 |
| --- | --- | --- | --- | --- |
| `@xihan-ui/core` | 运行时底座：anatomy、`mergeProps`、`normalizeProps`、Scope、id；`createMachine` 状态机运行时；dismissable layer、焦点域、滚动锁、进出场、集合、typeahead | `motion` | — | 1 |
| `@xihan-ui/icons` | 首方图标集：`IconRecord` 结构化记录，渲染端逐节点建元素，运行期不解析 SVG 字符串 | — | — | 1 |
| `@xihan-ui/motion` | 动效原语：缓动单一真源、纯补间、帧循环、减弱动效偏好、解析解弹簧、Web Animations 薄封装 | — | — | 1 |
| `@xihan-ui/pointer` | 指针会话：一根指针从按下到抬起的跟手、过滤与收尾，自研，零依赖 | — | — | 1 |
| `@xihan-ui/viz` | 图表引擎：比例尺、刻度、形状、坐标轴布局、拾取与降采样，全部是纯函数，自研，零依赖 | — | — | 1 |
| `@xihan-ui/expression` | 受限表达式语言：解析成可序列化的语法树、静态检查、十进制精确与不带时区日期的确定性求值，不用 `eval`，见[受限表达式](/runtime/expression) | — | — | 1 |
| `@xihan-ui/xlsx` | 零依赖的 xlsx 写出：文本、数字、日期、布尔四类单元格，数字与日期格式、粗体与对齐、合并单元格与冻结窗格，见[表格导出](/runtime/xlsx) | — | — | 1 |
| `@xihan-ui/tokens` | 设计令牌（源自 DTCG）与主题运行时（明暗 / 品牌 / 密度 / 对比度 / 书写方向） | `core` | — | 2 |
| `@xihan-ui/position` | 浮层定位，自研实现，无第三方运行时依赖 | `core` | — | 2 |
| `@xihan-ui/code-highlight` | 代码着色，自研粗粒度词法器，无第三方运行时依赖；适配器的可选 peer | `core` | — | 2 |
| `@xihan-ui/chat-stream` | AI 协议内核：SSE 读取 → 协议归一 → parts 归约 → 会话 store（零 DOM、零框架） | `core` | — | 2 |
| `@xihan-ui/markdown` | 流式 Markdown 渲染内核：增量切块 + 稳定 key + 消毒（CommonMark 子集） | — | — | 2 |
| `@xihan-ui/sound` | 声音层：纯 Web Audio 程序化 UI 音效，零音频文件，框架无关 | `core` | — | 2 |
| `@xihan-ui/designer-kit` | 画布式设计器的内核：撤销重做历史栈、按路径的编辑操作、视口平移缩放、对齐吸附与参考线、对齐分布与框选、文档内唯一 id，见[设计器内核](/runtime/designer-kit) | `core` `pointer` `expression` `viz` | — | 2 |
| `@xihan-ui/animations` | 动画层：可序列化的动效配方、内置进场与注意动效、错开起播、文字拆分 | `core` `motion` | — | 2 |
| `@xihan-ui/headless` | 全部组件的 anatomy + machine + `connect`，无样式、无框架 | `core` `motion` `pointer` `viz` `expression` | — | 3 |
| `@xihan-ui/styles` | 默认皮肤，按 `@layer` 分层的 CSS | `tokens`（只取其 CSS 产物） | — | 3 |
| `@xihan-ui/backgrounds` | 背景层：WebGL2 效果与数据驱动的粒子云，框架无关 | `core` `motion` | — | 3 |
| `@xihan-ui/vue` | Vue 适配器 | `core` `motion` `pointer` `viz` `expression` `headless` `position` | `vue`、`backgrounds`（可选）、`sound`（可选）、`code-highlight`（可选） | 4 |
| `@xihan-ui/react` | React 适配器 | `core` `motion` `pointer` `viz` `expression` `headless` `position` | `react`、`react-dom`、`backgrounds`（可选）、`sound`（可选）、`code-highlight`（可选） | 4 |
| `@xihan-ui/web-components` | Web Components 适配器（自研响应式基类，无第三方运行时依赖） | `core` `motion` `pointer` `viz` `expression` `headless` `position` | `backgrounds`（可选）、`code-highlight`（可选） | 4 |
| `@xihan-ui/designer-shell` | 画布式设计器共用的界面零件，只出 Web Components：属性面板、标尺与参考线、变换覆盖层、物料面板与拖放、问题列表、小地图与外框，见[设计器零件](/runtime/designer-shell) | `core` `pointer` `viz` `tokens` `designer-kit` `web-components` | — | 5 |
| `@xihan-ui/cli` | 命令行与 MCP 服务端：组件 API、文档、示例、设计令牌与 design.md 的离线知识库，供 AI 编程工具查询，见 [AI 辅助开发](/ai/agents) | — | — | 5 |

发布走 changesets，所有库包同属一个 fixed 版本组，一起升到同一个版本号。

## 依赖图

依赖只从高层指向低层，层号见上表。同层之间只有 `core → motion` 一条横向依赖；三个适配器（`vue`、`react`、`web-components`）同在第 4 层，依赖完全相同，互不依赖；`designer-shell` 在第 5 层，只建在 `web-components` 之上。


五个包可以单独使用，不必装适配器：

- `@xihan-ui/tokens`：只需要设计令牌与主题运行时，不需要组件（它只带上 `core`）；
- `@xihan-ui/markdown`：只需要流式 Markdown 渲染内核；
- `@xihan-ui/expression`：只需要在模板里写公式与条件；
- `@xihan-ui/xlsx`：只需要把表格写成 Excel 文件；
- `@xihan-ui/styles`：纯 CSS，它对 `tokens` 的依赖只是为了 `@import` 令牌产物，不引入任何 JS。

## 依赖规则

分层拓扑写在 `tooling/eslint-config/src/layers.json` 中，由 dependency-cruiser 在 `pnpm boundaries` 时强制。层级越低越基础，只能依赖 `canDependOn` 列出的包。

除分层外还有四条规则：

| 规则 | 内容 |
| --- | --- |
| `no-circular` | 禁止循环依赖 |
| `no-unresolvable` | 无法解析的 import：最常见的成因是引用了邻层却未在 `package.json` 中声明依赖 |
| `styles-no-js-deps` | `styles` 是纯 CSS，不得依赖任何 JS 包 |
| `no-external-in-packages` | 库包的运行时代码不得引入第三方 |

## 第三方运行时依赖

没有。登记在案的例外只有适配器的宿主框架：`@xihan-ui/vue` 的 `vue`，`@xihan-ui/react` 的 `react` 与 `react-dom`。

以下能力均为自研，不引入第三方：

| 能力 | 包 | 常见的第三方选择 |
| --- | --- | --- |
| 日期运算、时区换算与按地区的周 | `core`（`@xihan-ui/core/date`） | date-fns / Day.js / @internationalized/date |
| 浮层定位 | `position` | Floating UI |
| 代码着色 | `code-highlight` | Shiki / Prism |
| Web Components 响应式基类 | `web-components` | Lit |
| Markdown 渲染 | `markdown` | markdown-it / marked |
| 状态机 | `core` | XState |

新增第三方运行时依赖必须逐条登记进白名单并写明理由与移除条件，由 `check-runtime-deps` 门禁保证。

::: tip 开发期第三方依赖另行处理
`@lit/reactive-element` 与 `commonmark-spec` 出现在 workspace catalog 中，但只供测试比对：前者用于差分校验自研响应式基类，后者用于读取 CommonMark 官方用例。两者都不进入任何包的运行时依赖。
:::

## 版本约定

- 内部运行时依赖一律 `workspace:^`（发布时展开为当前锁步版本的 `^` 区间），内部开发期依赖用 `workspace:*`；
- 第三方版本只从 workspace catalog 取，包内写 `catalog:`，不得内联版本号（`check-exact-pins` 门禁）；
- 升级只改 `pnpm-workspace.yaml` 的 catalog 一处。

## 产物契约

| 项 | 值 |
| --- | --- |
| 模块格式 | ESM only，不提供 CJS |
| Node | `>= 18` |
| 类型 | 每个入口一份 `.d.ts` |
| 副作用 | 全部 `sideEffects: false`，`styles`、`tokens/tokens.css` 与 `designer-shell/style.css` 除外 |

`pnpm gate:publish` 逐包运行 publint 与 attw，按 ESM-only 的支持面校验 exports 条件与类型解析（`node16-from-ESM` 与 `bundler` 两列）。

## 子路径导出

主入口之外另有子路径的包：

| 包 | 子路径 |
| --- | --- |
| `@xihan-ui/core` | 运行时底座：anatomy、`mergeProps`、`normalizeProps`、Scope、id；`createMachine` 状态机运行时；dismissable layer、焦点域、滚动锁、进出场、集合、typeahead | `./metadata` `./skin-check` `./vite` `./vanilla` `./presence` `./json`（JSON 值的类型与纯函数，零依赖） `./options`（选项与选项树的结构校验，零依赖） `./hotkey`（快捷键的平台写法与按键命中，零依赖） `./url`（图片与链接地址的安全判定，零依赖） `./clipboard`（往系统剪贴板写文本，零依赖） `./template`（文本模板，占位只写数据路径） `./rich-text`（富文本模型、HTML 白名单解析与检查，零依赖） `./rich-text-dom`（按富文本模型生成 DOM） `./svg-export`（SVG 克隆成独立文件、序列化与栅格化成 PNG，只在浏览器里用） `./color`（颜色换算：十六进制、RGB、HSV、HSL、OKLCH 互转，CSS 颜色写法的解析与写出，零依赖） `./date`（不带时区的日期值、公历运算、按时区读写时刻与按地区的周） `./visual-environment`（八轴视觉环境的类型与解析） |
| `@xihan-ui/designer-kit` | 画布式设计器的内核：撤销重做历史栈、按路径的编辑操作、视口平移缩放、对齐吸附与参考线、对齐分布与框选、文档内唯一 id，见[设计器内核](/runtime/designer-kit) | `./field-inference`（从 JSON 样例与 JSON Schema 推断字段树、合并字段） `./properties`（属性描述、显示条件、取值检查与自定义编辑器接口） `./schema`（结构校验的问题形状与读取器） |
| `@xihan-ui/designer-shell` | 画布式设计器共用的界面零件，只出 Web Components：属性面板、标尺与参考线、变换覆盖层、物料面板与拖放、问题列表、小地图与外框，见[设计器零件](/runtime/designer-shell) | `./locale`（零件的中文文案） `./language`（按语言取组件库与零件的同语言包并成一份配置） `./style.css`（零件的样式） `./style.unlayered.css`（无层版样式） |
| `@xihan-ui/tokens` | 设计令牌（源自 DTCG）与主题运行时（明暗 / 品牌 / 密度 / 对比度 / 书写方向） | `./runtime` `./tokens.css` `./tokens.json` |
| `@xihan-ui/icons` | 首方图标集：`IconRecord` 结构化记录，渲染端逐节点建元素，运行期不解析 SVG 字符串 | `./codegen` |
| `@xihan-ui/viz` | 图表引擎：比例尺、刻度、形状、坐标轴布局、拾取与降采样，全部是纯函数，自研，零依赖 | `./hierarchy`（层级布局：层级节点、组树、矩形树图、分区与圆堆积） `./sankey`（桑基布局） `./graph`（关系图布局） `./columns`（列式数据仓、降采样与流式追加） `./canvas`（画布绘制的原语） |
| `@xihan-ui/headless` | 全部组件的 anatomy + machine + `connect`，无样式、无框架 | `./locale`（内建语言包） |
| `@xihan-ui/vue` | Vue 适配器 | `./backgrounds` `./behavior` `./locale` `./plugin`（全量注册与全局组件类型） `./resolver`（unplugin-vue-components 的组件解析器） `./sound` `./nuxt`（Nuxt 模块） |
| `@xihan-ui/react` | React 适配器 | `./backgrounds` `./behavior` `./locale` `./sound` |
| `@xihan-ui/web-components` | Web Components 适配器（自研响应式基类，无第三方运行时依赖） | `./define` `./backgrounds` `./locale` `./services` `./authoring`（第三方编写元素用的基类与辅助件） `./custom-elements.json` |
| `@xihan-ui/styles` | 默认皮肤，按 `@layer` 分层的 CSS | 每份皮肤一条 CSS，共 160 条（148 份组件皮肤 + 12 份共享层），另有 `./index.css`（主入口，生成的扁平有层文件，家族只内联一次）与 `./index.unlayered.css` 两个整包入口、`./global.css`（可选的全局入口）、`./vite`（按用到的组件自动注入皮肤的 Vite 插件）、`./component-tokens` 与 `./components.tokens.json`（组件覆盖槽的清单） |

其余十二个包（`motion` / `pointer` / `position` / `code-highlight` / `animations` / `backgrounds` / `chat-stream` / `markdown` / `sound` / `cli` / `expression` / `xlsx`）只有主入口。

组件没有单独的子路径导出：按需引入依靠 tree-shaking，不依靠手写路径。


## 相关

- [架构总览](./overview#分层与依赖矩阵)
- [安装与接入](./installation)
- [测试与质量门禁](./guide/testing#结构门禁)
