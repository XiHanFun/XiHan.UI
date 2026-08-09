# 更新日志 · XiHan.UI

本文件记录 XiHan.UI 各版本的变更。每条标注 **新增 / 修复 / 优化 / 调整 / 移除** 类别。

::: tip 唯一事实源
本页就是变更记录本身，发版时直接在这里追加。仓库根目录不单独放一份 `CHANGELOG.md`。
:::

::: warning 尚未发布
13 个公开包（core / machine / behavior / system / headless / styled / vue / wc / ai / markdown / position / highlight / visual）由 changesets 的 `fixed` 组锁步同版，当前版本仍是 `0.0.0`，**一个版本都还没有发布到 npm**。下面「未发布」一节列的是已登记、等待随首个公开 alpha 一起发出去的变更。
:::

## 未发布

首个公开版本计划为 `1.0.0-alpha.0`，13 个包同号发布。由于此前没有任何版本发出去过，这里标为「调整」的破坏性变更只影响仓库内直接用过内核的代码（两个 playground 与自研组件），不涉及外部使用者。

### 内核与适配器

- **新增** 首个公开版本的 UI 基座：自研薄 FSM 内核、`headless`（anatomy / machine / connect）、设计令牌与主题运行时、样式层。69 个组件在 Vue 与 Web Components 两套适配器上共用同一份内核，跨适配器一致性套件、真实 Chromium 里的无障碍扫描与浮层定位契约全绿。见[架构总览](./overview)
- **新增** 浮层定位、虚拟滚动、Web Components 响应式基类、代码着色、流式 Markdown 全部自研，运行时不带第三方依赖。见[包与依赖关系](./npm-package-dependency)

### 视觉层

- **新增** `@xihan-ui/visual`：WebGL2 背景效果与数据驱动粒子点云，框架无关、零第三方依赖。一张画面两个绘制通道——流场跑片元着色器、粒子走 `gl.POINTS`，两者共用同一段 GLSL，粒子因此能精确落在流场的特征位置上。内置 14 个效果，不支持 WebGL2 时降级为 CSS 静态背景、接口保持一致。见[视觉层](./guide/visual)
- **新增** 两个适配器接上视觉层，各自走独立子入口 `@xihan-ui/vue/visual` 与 `@xihan-ui/wc/visual`。`@xihan-ui/visual` 声明为**可选 peer**，主入口一行都不引它，不用视觉效果的应用不会因为装了适配器而多出一个 WebGL 引擎

### 图标

- **新增** Icon 原语：`@xihan-ui/core` 导出 `IconRecord` / `IconNode` / `IconTag`，`@xihan-ui/headless` 导出 `connectIcon` 等，`@xihan-ui/vue` 导出 `XhIcon`，`@xihan-ui/wc` 注册 `<xh-icon>`，`@xihan-ui/styled` 新增 `icon.css`。图标数据是结构化节点数组而非 SVG 字符串，渲染端逐节点建元素，运行期不经 HTML 解析器
- **移除** 旧的 `@xihan-ui/icons`（27 个第三方图标集的聚合，约四万个图标）整包移除并在 npm 上弃用，重写为只收自研图标的首方图标集，第一批 29 个覆盖组件库自用的全部语义

### 组件

- **调整** Select 支持多选，选中值由单值改为集合。`SelectValueChangeDetails.value` 由 `string | null` 变 `string[]`，`SelectApi` 的 `value` 与 `valueText` 由单值变数组，`setValue` 签名变 `(next: string | string[]) => void`；Vue 侧 `update:value` 载荷与 `v-model:value` 绑定的变量类型随之变化，WC 侧 `value-change` 的 `detail` 由 `{ value: string | null }` 变 `{ value: string[] }`。见[数据录入](./components/form)
