# 更新日志 · XiHan.UI

本文件记录 XiHan.UI 各版本的变更。每条标注 **新增 / 修复 / 优化 / 调整 / 移除** 类别。

::: warning 当前处于重写后、首发前
现在的 XiHan.UI 是 2026-07-25 起从零重写的框架无关设计系统运行时，13 个公开包（`@xihan-ui/*`）由 changesets 的 `fixed` 组锁步同版，当前版本 `0.0.0`，**尚未发布到 npm**，首个公开版本计划为 `1.0.0-alpha.0`。

npm 上的 `xihan-ui` 是重写前的旧实现，最后一版 `0.9.8` 发布于 2025-05-25，六个版本已全部在 npm 上标记弃用。两者不是同一套东西，旧包不会再有更新。
:::

## 未发布 · 框架无关重写（2026-07-25 起）

### 基座

- **新增** `@xihan-ui/core` 结构原语：anatomy、`mergeProps`、`normalizeProps`、Scope、context、id 生成，以及浮层定位、虚拟滚动、代码着色三个端口的类型契约
- **新增** `@xihan-ui/machine` 自研薄状态机：定义层、`createService` 解释器与 vanilla 运行时，受控值绑定与效应生命周期
- **新增** `@xihan-ui/behavior` 交互行为原语：消解层、焦点域、滚动锁、进出场，随后补上条目集合导航（roving tabindex 底座）与首字母连打检索
- **新增** `@xihan-ui/system` 设计令牌体系与主题运行时，令牌从 DTCG 源产出 CSS / JSON / TS 三种形态
- **新增** `@xihan-ui/styled` 纯 CSS 皮肤层，后续补上 reset 层
- **新增** `@xihan-ui/core` 全局诊断通道，状态机错误投递进该通道而不是抛在使用者脸上

### 适配器

- **新增** `@xihan-ui/vue` Vue 3 适配器，Button / Dialog 纵切片先打穿全链路
- **新增** `@xihan-ui/wc` Web Components 适配器，Light DOM 行为宿主；`xh-dialog` 把「有状态组件也能框架无关」这件事验证掉
- **新增** WC 侧观察 Light DOM 增删并重新接线，抹平「运行期增删条目」上的适配器分叉
- **新增** WC 角色节点契约校验与 Custom Elements Manifest 生成，两者都进门禁
- **新增** 跨适配器一致性套件（conformance）：同一批判据在两套宿主上逐帧比对归一化后的 DOM，套件数从 1 个扩到 42 个，排除项改为显式登记
- **调整** playground 拆成 `playground-vue` 与 `playground-wc` 两个独立包，一环境一包

### 组件

- **新增** 69 个组件逐批铺开，每个都同时产出无头内核、Vue 组件、自定义元素与默认皮肤：从 Button / Dialog 起，经 Switch、Checkbox / Collapsible / Separator、Toggle / Progress / Badge、RadioGroup / Tabs / Accordion、Tooltip / Popover、Menu、Select / Avatar / Field、NumberField，到日期族与最后一批，双适配器铺满
- **新增** alert / spinner / skeleton / empty-state 四个反馈类组件
- **新增** Checkbox 三态
- **调整** Select 支持多选，选中值由单值改为集合：`SelectValueChangeDetails.value` 由 `string | null` 变 `string[]`，`SelectApi` 的 `value` / `valueText` 变数组，`setValue` 签名变 `(next: string | string[]) => void`；Vue 侧 `update:value` 载荷与 WC 侧 `value-change` 的 `detail` 随之变化。见[数据录入](./components/form)

### 自研替换第三方

- **新增** `@xihan-ui/position` 自研浮层定位引擎（包含块解析、缩放换算、翻面与避让、跟随更新），**移除** `@floating-ui/dom`
- **新增** 自研虚拟滚动内核，**移除** `@tanstack/virtual-core`
- **新增** WC 自研响应式基类，**移除** `@lit/reactive-element`
- **新增** `@xihan-ui/markdown` 自研解析与渲染，**移除** `markdown-it`
- **新增** 代码着色走端口，内置自研粗粒度词法器，可换 Shiki
- **调整** 至此全部库包的运行时第三方依赖只剩一个（`@internationalized/date`，仅日期族使用）。见[包与依赖关系](./npm-package-dependency)

### AI 与 Markdown

- **新增** `@xihan-ui/ai` 协议内核与 AI 组件族第一批：SSE 读取、协议归一、parts 归约、会话 store，配 Thread / Composer / CodeBlock 三件与粘底原语，双适配器
- **新增** `@xihan-ui/markdown` 流式渲染内核，增量切块 + 稳定 key + 消毒
- **优化** Markdown 接上 CommonMark 官方用例的一致率棘轮，逐步实现缩进代码块、Setext 标题、跨行链接引用定义与列表松紧排布，一致率由 375 提升至 489

### 视觉层

- **新增** `@xihan-ui/visual`：WebGL2 背景效果与数据驱动粒子点云，框架无关、零第三方依赖。流场跑片元着色器、粒子走 `gl.POINTS`，两通道共用同一段 GLSL；内置 14 个效果，不支持 WebGL2 时降级为 CSS 静态背景
- **新增** 两个适配器接上视觉层，各走独立子入口 `@xihan-ui/vue/visual` 与 `@xihan-ui/wc/visual`，`@xihan-ui/visual` 声明为可选 peer
- **修复** 修复画面在真实页面里一片空白的三个成因

### 图标

- **新增** Icon 原语：`IconRecord` / `IconNode` / `IconTag` 类型、`connectIcon`、`XhIcon`、`<xh-icon>` 与 `icon.css`。图标数据是结构化节点数组而非 SVG 字符串，渲染端逐节点建元素，运行期不经 HTML 解析器
- **移除** 旧 `@xihan-ui/icons`（27 个第三方图标集的聚合，约四万个图标）整包移除并在 npm 上弃用，重写为只收自研图标的首方集，第一批 29 个覆盖组件库自用的全部语义

### 无障碍与质量门禁

- **新增** 无障碍扫描接上真实浏览器 runner 与 axe，逐个组件扫
- **新增** 键盘规格表机读化，作为测试的分母：用例少覆盖一条即判套件失败
- **新增** 产物契约门禁（publint + attw）、foundation 层框架无关门禁、依赖拓扑门禁
- **修复** 存量无障碍违规登记表清零，由 24 条降到 2 条（WC 侧 `steps` 一条，外加一条步骤重放豁免）
- **修复** 令牌 `fg-subtle` 达到 AA，并给对比度立下判据
- **修复** 焦点陷阱抓不住第一次逃逸；移除持有焦点的条目后不再让整组脱离 Tab 序列；删掉文件上传条目后把焦点交回投放区
- **修复** 浮层族改用 fixed 坐标系，不再被 overflow 祖先裁掉
- **修复** 挡住输入法组合态
- **修复** Dialog 三处：模态背景失活、非模态焦点域、收起态 hidden
- **修复** Field 的名字关联不再依赖 control 是可标注元素；Splitter root 不再输出 `aria-orientation`
- **修复** 消解层只在展开期间入栈，不再与开合无关地常驻
- **修复** 状态机停机后送入的事件一律静默丢弃，dev 下不再抛

### 工程

- **调整** 皮肤层令牌成为唯一事实源，删掉全部字面量兜底，跨组件共享的默认值全部令牌化
- **调整** 全仓注释改为只讲功能，不带设计过程引用
- **调整** 行尾一律 LF（`.gitattributes`），署名统一为 XiHanFun and contributors
- **新增** changesets 发布配置就绪：13 个公开包锁步同版，私有包不发布不计版

## 旧实现 · xihan-ui（2024-11 ~ 2025-07）

重写前的 XiHan.UI 是一套面向 Vue 的常规组件库，`ui/packages/` 下分 cli、components、constants、directives、hooks、locales、plugins、themes、utils 与聚合包 xihan-ui 共十个子包，对外只发一个 `xihan-ui`。

npm 上共发布过六个版本，**全部已标记弃用**，弃用说明为「该版本属重构前的旧实现，已停止维护」：

| 版本 | npm 发布日期 |
| --- | --- |
| 0.9.8 | 2025-05-25 |
| 0.9.7 | 2025-05-25 |
| 0.9.0 | 2025-03-23 |
| 0.8.20 | 2025-03-22 |
| 0.8.19 | 2025-03-22 |
| 0.8.18 | 2025-03-22 |

这一时期的提交信息绝大多数是「优化」「测试」这类无区分度的描述，不足以还原每个版本各自改了什么，因此不逐版展开。从可辨认的记录看，主要工作集中在：工程与打包架构搭建（turbo、子包拆分、发布脚本）、图标子包与图标生成脚本、插件 / 指令 / hooks / 主题 / locales 等子包的建立与重构、组件国际化、以及一个 EventBus 实现。
