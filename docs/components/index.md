# 组件总览

69 个组件，每个都同时提供**无头内核**（`@xihan-ui/headless`）、**Vue 组件**（`@xihan-ui/vue`）、**自定义元素**（`@xihan-ui/wc`）与**默认皮肤**（`@xihan-ui/styled`）四份产物。四者同源：内核是唯一的行为定义，另外三份不重新实现任何逻辑。

| 口径 | 数量 |
| --- | --- |
| 组件 | 69 |
| 带状态机的组件 | 59 |
| 解剖部件（part）总数 | 452 |
| 登记在案的键盘交互条目 | 344 |
| Vue 导出的组件 | 457 |

按用途分册：

- [通用组件](./general) — 按钮、徽标、头像等不承载值的基础件
- [数据录入](./form) — 承载表单值的组件
- [数据展示](./data-display) — 表格、树、折叠、虚拟滚动
- [导航](./navigation) — 菜单族、标签页、步骤条、分页
- [反馈与浮层](./feedback) — 对话框、气泡、提示、进度
- [AI 对话](./ai) — 会话线程与消息编辑器

## 全部组件

「部件」是解剖里声明的 `data-part` 数量，「键盘」是键盘规格表里登记的交互条目数——它同时是无障碍测试的分母，用例少覆盖一条即判失败。

| 组件 | 标识 | 自定义元素 | 部件 | 状态机 | 键盘 | 分册 |
| --- | --- | --- | --- | --- | --- | --- |
| [手风琴](./data-display#accordion) | `accordion` | `<xh-accordion>` | 6 | 有 | 6 | 数据展示 |
| [警告提示](./feedback#alert) | `alert` | `<xh-alert>` | 5 | 有 | 1 | 反馈与浮层 |
| [锚点](./navigation#anchor) | `anchor` | `<xh-anchor>` | 5 | 有 | 2 | 导航 |
| [头像](./general#avatar) | `avatar` | `<xh-avatar>` | 3 | 有 | — | 通用组件 |
| [徽标](./general#badge) | `badge` | `<xh-badge>` | 1 | — | — | 通用组件 |
| [面包屑](./navigation#breadcrumb) | `breadcrumb` | `<xh-breadcrumb>` | 6 | — | 2 | 导航 |
| [按钮](./general#button) | `button` | `<xh-button>` | 5 | — | 1 | 通用组件 |
| [日历](./form#calendar) | `calendar` | `<xh-calendar>` | 12 | 有 | 12 | 数据录入 |
| [走马灯](./data-display#carousel) | `carousel` | `<xh-carousel>` | 8 | 有 | 10 | 数据展示 |
| [级联选择](./form#cascader) | `cascader` | `<xh-cascader>` | 12 | 有 | 12 | 数据录入 |
| [复选框](./form#checkbox) | `checkbox` | `<xh-checkbox>` | 2 | 有 | 1 | 数据录入 |
| [复选框组](./form#checkbox-group) | `checkbox-group` | `<xh-checkbox-group>` | 7 | 有 | 3 | 数据录入 |
| [剪贴板](./general#clipboard) | `clipboard` | `<xh-clipboard>` | 6 | 有 | — | 通用组件 |
| [代码块](./general#code-block) | `code-block` | `<xh-code-block>` | 5 | — | 1 | 通用组件 |
| [折叠区域](./data-display#collapsible) | `collapsible` | `<xh-collapsible>` | 3 | 有 | 1 | 数据展示 |
| [颜色选择器](./form#color-picker) | `color-picker` | `<xh-color-picker>` | 16 | 有 | 9 | 数据录入 |
| [组合框](./form#combobox) | `combobox` | `<xh-combobox>` | 14 | 有 | 14 | 数据录入 |
| [消息编辑器](./ai#composer) | `composer` | `<xh-composer>` | 3 | 有 | 4 | AI 对话 |
| [右键菜单](./navigation#context-menu) | `context-menu` | `<xh-context-menu>` | 11 | 有 | 9 | 导航 |
| [日期输入](./form#date-field) | `date-field` | `<xh-date-field>` | 5 | 有 | 8 | 数据录入 |
| [日期选择器](./form#date-picker) | `date-picker` | `<xh-date-picker>` | 9 | 有 | 5 | 数据录入 |
| [对话框](./feedback#dialog) | `dialog` | `<xh-dialog>` | 7 | 有 | 4 | 反馈与浮层 |
| [抽屉](./feedback#drawer) | `drawer` | `<xh-drawer>` | 8 | 有 | 4 | 反馈与浮层 |
| [就地编辑](./form#editable) | `editable` | `<xh-editable>` | 9 | 有 | 3 | 数据录入 |
| [空状态](./data-display#empty-state) | `empty-state` | `<xh-empty-state>` | 5 | — | — | 数据展示 |
| [表单字段](./form#field) | `field` | `<xh-field>` | 5 | — | — | 数据录入 |
| [文件上传](./form#file-upload) | `file-upload` | `<xh-file-upload>` | 12 | 有 | 5 | 数据录入 |
| [表单](./form#form) | `form` | `<xh-form>` | 6 | 有 | — | 数据录入 |
| [悬浮卡片](./feedback#hover-card) | `hover-card` | `<xh-hover-card>` | 5 | 有 | 2 | 反馈与浮层 |
| [图片](./general#image) | `image` | `<xh-image>` | 3 | 有 | — | 通用组件 |
| [列表框](./form#listbox) | `listbox` | `<xh-listbox>` | 8 | 有 | 10 | 数据录入 |
| [加载条](./feedback#loading-bar) | `loading-bar` | `<xh-loading-bar>` | 3 | 有 | — | 反馈与浮层 |
| [菜单](./navigation#menu) | `menu` | `<xh-menu>` | 6 | 有 | 9 | 导航 |
| [菜单栏](./navigation#menubar) | `menubar` | `<xh-menubar>` | 10 | 有 | 15 | 导航 |
| [导航菜单](./navigation#navigation-menu) | `navigation-menu` | `<xh-navigation-menu>` | 8 | 有 | 7 | 导航 |
| [数字输入](./form#number-field) | `number-field` | `<xh-number-field>` | 5 | 有 | 6 | 数据录入 |
| [分页](./navigation#pagination) | `pagination` | `<xh-pagination>` | 5 | 有 | 4 | 导航 |
| [分格输入](./form#pin-input) | `pin-input` | `<xh-pin-input>` | 4 | 有 | 6 | 数据录入 |
| [气泡卡片](./feedback#popover) | `popover` | `<xh-popover>` | 7 | 有 | 4 | 反馈与浮层 |
| [进度条](./feedback#progress) | `progress` | `<xh-progress>` | 3 | — | — | 反馈与浮层 |
| [单选组](./form#radio-group) | `radio-group` | `<xh-radio-group>` | 6 | 有 | 4 | 数据录入 |
| [评分](./form#rating) | `rating` | `<xh-rating>` | 5 | 有 | 5 | 数据录入 |
| [滚动区域](./data-display#scroll-area) | `scroll-area` | `<xh-scroll-area>` | 6 | 有 | 5 | 数据展示 |
| [选择器](./form#select) | `select` | `<xh-select>` | 11 | 有 | 13 | 数据录入 |
| [分隔线](./general#separator) | `separator` | `<xh-separator>` | 1 | — | — | 通用组件 |
| [骨架屏](./data-display#skeleton) | `skeleton` | `<xh-skeleton>` | 2 | — | — | 数据展示 |
| [滑块](./form#slider) | `slider` | `<xh-slider>` | 7 | 有 | 6 | 数据录入 |
| [加载指示器](./feedback#spinner) | `spinner` | `<xh-spinner>` | 2 | — | — | 反馈与浮层 |
| [分栏](./data-display#splitter) | `splitter` | `<xh-splitter>` | 3 | 有 | 7 | 数据展示 |
| [步骤条](./navigation#steps) | `steps` | `<xh-steps>` | 9 | 有 | 6 | 导航 |
| [开关](./form#switch) | `switch` | `<xh-switch>` | 2 | 有 | 1 | 数据录入 |
| [表格](./data-display#table) | `table` | `<xh-table>` | 15 | 有 | 10 | 数据展示 |
| [标签页](./navigation#tabs) | `tabs` | `<xh-tabs>` | 4 | 有 | 6 | 导航 |
| [标签输入](./form#tags-input) | `tags-input` | `<xh-tags-input>` | 11 | 有 | 13 | 数据录入 |
| [文本输入](./form#text-field) | `text-field` | `<xh-text-field>` | 4 | 有 | 1 | 数据录入 |
| [会话线程](./ai#thread) | `thread` | `<xh-thread>` | 5 | 有 | 2 | AI 对话 |
| [时间输入](./form#time-field) | `time-field` | `<xh-time-field>` | 5 | 有 | 9 | 数据录入 |
| [时间选择器](./form#time-picker) | `time-picker` | `<xh-time-picker>` | 11 | 有 | 20 | 数据录入 |
| [轻提示](./feedback#toast) | `toast` | `<xh-toast>` | 5 | 有 | 2 | 反馈与浮层 |
| [轻提示容器](./feedback#toaster) | `toaster` | `<xh-toaster>` | 2 | 有 | — | 反馈与浮层 |
| [切换按钮](./general#toggle) | `toggle` | `<xh-toggle>` | 1 | 有 | 1 | 通用组件 |
| [切换按钮组](./general#toggle-group) | `toggle-group` | `<xh-toggle-group>` | 2 | 有 | 6 | 通用组件 |
| [工具栏](./navigation#toolbar) | `toolbar` | `<xh-toolbar>` | 4 | 有 | 6 | 导航 |
| [文字提示](./feedback#tooltip) | `tooltip` | `<xh-tooltip>` | 4 | 有 | 2 | 反馈与浮层 |
| [引导](./navigation#tour) | `tour` | `<xh-tour>` | 13 | 有 | 4 | 导航 |
| [穿梭框](./form#transfer) | `transfer` | `<xh-transfer>` | 14 | 有 | 11 | 数据录入 |
| [树](./data-display#tree) | `tree` | `<xh-tree>` | 12 | 有 | 10 | 数据展示 |
| [树选择](./form#tree-select) | `tree-select` | `<xh-tree-select>` | 19 | 有 | 14 | 数据录入 |
| [虚拟滚动](./data-display#virtualizer) | `virtualizer` | `<xh-virtualizer>` | 4 | 有 | — | 数据展示 |

## 怎么读组件页

每个组件条目给出五件事：

1. **自定义元素**——Web Components 适配器注册的标签名；
2. **Vue 组件**——Vue 适配器导出的组件，均以 `Xh` 开头，按部件拆分；
3. **组合式函数**——直接拿 `connect` 产物自己渲染时用（Vue 适配器提供，纯展示型组件没有）；
4. **解剖**——部件清单，加粗的是必备部件；
5. **键盘**——按键、生效条件与行为，附 W3C APG 规格出处。

组件的 props 与事件请以 TypeScript 类型为准：`@xihan-ui/headless` 为每个组件导出 `XxxSchema`（含 `props` / `context`）与 `XxxApi`，编辑器里能直接跳转。
