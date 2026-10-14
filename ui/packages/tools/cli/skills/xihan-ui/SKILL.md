---
name: xihan-ui
description: 在项目里用 XiHan.UI 写界面：选组件、写 Vue / React / Web Components 代码、改样式与主题。凡是代码里出现 @xihan-ui/*或 Xh 前缀组件、xh-* 自定义元素时使用。
---

# 在项目里使用 XiHan.UI

XiHan.UI 是框架无关的设计系统运行时：组件行为在无头内核里，Vue、React 与 Web Components 三个适配器只把属性铺到元素上，外观来自纯 CSS 皮肤与设计令牌。文档：https://ui.docs.xihanfun.com

## 先查证，再写代码

组件名、部件、Props、事件与令牌都以当前安装版本为准，不要凭记忆或别的组件库的习惯去写。

- 配了 MCP 时：`xihan_ui_list` 选组件，`xihan_ui_info` 查 API，`xihan_ui_demo` / `xihan_ui_doc` 取示例与文档，`xihan_ui_parts` 与 `xihan_ui_token` 查样式钩子与令牌。
- 没有 MCP 时用命令行（数据随包离线）：`npx -y @xihan-ui/cli info select`、`demo select 1`、`doc guide/theme`、`token bg-brand`、`parts select`。
- 版本要对齐：项目装的是哪一版，就用同号的 CLI，如 `npx -y @xihan-ui/cli@<版本> info select`。
- 也可以读机读文档：https://ui.docs.xihanfun.com/llms.txt（索引）与组件页的 `.md`（如 https://ui.docs.xihanfun.com/components/select.md）。

## 安装与接入

- Vue：`@xihan-ui/vue` + `@xihan-ui/styles`；React（只支持 19）：`@xihan-ui/react` + `@xihan-ui/styles`；原生页面：`@xihan-ui/web-components` + `@xihan-ui/styles`。全部包同一版本组、始终同号，ESM only。
- 样式在应用入口引一次：`import "@xihan-ui/styles"`。宿主有无层的 reset / normalize（Tailwind v3 preflight 等）时改引 `@xihan-ui/styles/index.unlayered.css`。
- Vue 与 React 不需要插件或 provider，按名称 import 即可；Web Components 必须调用一次 `defineXhElements()`（来自 `@xihan-ui/web-components/define`）。
- 中文界面：Vue 在根组件 `provideXhConfig(zhCN)`，React 用 `<XhConfigProvider config={zhCN}>` 包住应用，语言包从 `@xihan-ui/vue/locale`、`@xihan-ui/react/locale` 取；不要逐个实例传 `translations`。

## 组件写法

- 每个部件一个组件：`Xh` + 组件名 + 部件名，如 `XhDialogRoot` / `XhDialogTrigger` / `XhDialogContent`；只有一个部件的组件不带后缀（`XhButton`、`XhSwitch`）。Vue 与 React 同名。
- 不少组件的 Root 传入 `collection` 等数据即可自动铺出结构（如 `<XhSelectRoot :collection="items" />`），需要自定义时再按部件组合；以 `xihan_ui_info` 的部件与 Props 为准。
- 值类组件受控优先：Vue 用 `v-model:value` / `v-model:open` / `v-model:checked`，只传 `default*` 为非受控；React 用 `value` + `onValueChange={({ value }) => …}`，回调载荷是明细对象。
- Web Components 是 Light DOM 行为宿主：结构由作者写，用 `data-xh-part` 标出角色节点（`<xh-dialog><button data-xh-part="trigger">…</button>…</xh-dialog>`）。
- 视觉轴只有 `size`（sm / md / lg）、`variant`（outline / subtle / ghost，可按下的面多一档 solid）与 `tone`（brand / neutral / danger / warning / success / info）。不存在 `type="primary"`、`bordered`、`plain` 之类的属性。

## 样式与主题

- 不改类名、不写内联样式去改组件外观。覆盖写进 `@layer xihan.overrides`，选择器用部件属性：`[data-scope="select"][data-part="trigger"]`，状态用 `data-state`、`data-disabled` 等数据属性。
- 只用令牌，不写散值：颜色 `--xh-bg-*` / `--xh-fg-*` / `--xh-border-*`，间距 `--xh-space-*`（4px 网格），圆角 `--xh-shape-control` / `--xh-shape-surface` / `--xh-shape-overlay`，控件高 `--xh-control-h-*`，阴影 `--xh-elevation-*`，动效 `--xh-motion-*`。
- 只改某个组件时用它的覆盖槽 `--xh-<组件>-*`（`xihan_ui_parts` 列出全部），改全局时改语义令牌。
- 品牌色用 `@xihan-ui/tokens/runtime` 的 `registerBrand` 从一个种子色派生；明暗、密度、对比度、动效偏好用 `createVisualEnvironmentController` 写到根元素上。
- 设计取舍：中性克制，只有 Button 缺省品牌实心；边界由描边承担，阴影只表达抬升；品牌淡底只表示「选中 / 当前」；状态不能只靠颜色表达。完整规则见 `xihan_ui_design_md` 或 https://ui.docs.xihanfun.com/design.md 。

## 常见错误

- 照搬别的组件库的 API（`type="primary"`、`visible`、`onOk`、`dataSource`），或给组件起不存在的名字。
- 忘了引 `@xihan-ui/styles`，组件渲染成没有样式的裸元素；宿主有无层 reset 却引了有层版本，同样表现为样式失效。
- Web Components 没调用 `defineXhElements()`，或子节点漏写 `data-xh-part`。
- 在样式里写 `#1677ff`、`6px`、`box-shadow: 0 2px 8px …` 这类散值，或用 `!important` 压皮肤。
- 手写 `role`、`aria-expanded` / `aria-controls` 这类状态与关联属性或部件 `id`：它们由 connect 生成，重复写会冲突；可访问名称（`aria-label`）仍由作者提供。
