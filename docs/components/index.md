# 组件总览

70 个组件，每个都同时提供**无头内核**（`@xihan-ui/headless`）、**Vue 组件**（`@xihan-ui/vue`）、**自定义元素**（`@xihan-ui/wc`）与**默认皮肤**（`@xihan-ui/styled`）四份产物。四者同源：内核是唯一的行为定义，另外三份不重新实现任何逻辑。

本册每个组件一页，页内固定为：产物 · 示例 · 解剖 · Props · 状态机 · connect API · 键盘。除示例外全部由组件源码生成，不会与代码对不上。

## 通用

不承载表单值、也不管理浮层的基础件。

| 组件 | 标识 | 部件数 | 键盘条目 | 示例 |
| --- | --- | --- | --- | --- |
| [按钮](./button) | `button` | 5 | 1 | — |
| [图标](./icon) | `icon` | 2 | 0 | — |
| [切换按钮](./toggle) | `toggle` | 1 | 1 | — |
| [切换按钮组](./toggle-group) | `toggle-group` | 2 | 6 | — |
| [徽标](./badge) | `badge` | 1 | 0 | — |
| [头像](./avatar) | `avatar` | 3 | 0 | — |
| [图片](./image) | `image` | 3 | 0 | — |
| [分隔线](./separator) | `separator` | 1 | 0 | — |
| [代码块](./code-block) | `code-block` | 5 | 1 | — |
| [剪贴板](./clipboard) | `clipboard` | 6 | 0 | — |

## 数据录入

承载表单值的组件，统一走受控/非受控两态与 name 表单集成。

| 组件 | 标识 | 部件数 | 键盘条目 | 示例 |
| --- | --- | --- | --- | --- |
| [表单字段](./field) | `field` | 5 | 0 | — |
| [表单](./form) | `form` | 6 | 0 | — |
| [文本输入](./text-field) | `text-field` | 4 | 1 | — |
| [数字输入](./number-field) | `number-field` | 5 | 6 | — |
| [分格输入](./pin-input) | `pin-input` | 4 | 6 | — |
| [就地编辑](./editable) | `editable` | 9 | 3 | — |
| [复选框](./checkbox) | `checkbox` | 2 | 1 | — |
| [复选框组](./checkbox-group) | `checkbox-group` | 7 | 3 | — |
| [单选组](./radio-group) | `radio-group` | 6 | 4 | — |
| [开关](./switch) | `switch` | 2 | 1 | 3 |
| [滑块](./slider) | `slider` | 7 | 6 | — |
| [评分](./rating) | `rating` | 5 | 5 | — |
| [选择器](./select) | `select` | 11 | 13 | — |
| [列表框](./listbox) | `listbox` | 8 | 10 | — |
| [组合框](./combobox) | `combobox` | 14 | 14 | — |
| [级联选择](./cascader) | `cascader` | 12 | 12 | — |
| [树选择](./tree-select) | `tree-select` | 19 | 14 | — |
| [标签输入](./tags-input) | `tags-input` | 11 | 13 | — |
| [穿梭框](./transfer) | `transfer` | 14 | 11 | — |
| [日期输入](./date-field) | `date-field` | 5 | 8 | — |
| [日期选择器](./date-picker) | `date-picker` | 9 | 5 | — |
| [时间输入](./time-field) | `time-field` | 5 | 9 | — |
| [时间选择器](./time-picker) | `time-picker` | 11 | 20 | — |
| [日历](./calendar) | `calendar` | 12 | 12 | — |
| [颜色选择器](./color-picker) | `color-picker` | 16 | 9 | — |
| [文件上传](./file-upload) | `file-upload` | 12 | 5 | — |

## 数据展示

把数据摆出来的组件：表格、树、折叠、虚拟滚动。

| 组件 | 标识 | 部件数 | 键盘条目 | 示例 |
| --- | --- | --- | --- | --- |
| [表格](./table) | `table` | 15 | 10 | — |
| [树](./tree) | `tree` | 12 | 10 | — |
| [虚拟滚动](./virtualizer) | `virtualizer` | 4 | 0 | — |
| [滚动区域](./scroll-area) | `scroll-area` | 6 | 5 | — |
| [手风琴](./accordion) | `accordion` | 6 | 6 | — |
| [折叠区域](./collapsible) | `collapsible` | 3 | 1 | — |
| [走马灯](./carousel) | `carousel` | 8 | 10 | — |
| [分栏](./splitter) | `splitter` | 3 | 7 | — |
| [骨架屏](./skeleton) | `skeleton` | 2 | 0 | — |
| [空状态](./empty-state) | `empty-state` | 5 | 0 | — |

## 导航

在页面与视图之间移动的组件。

| 组件 | 标识 | 部件数 | 键盘条目 | 示例 |
| --- | --- | --- | --- | --- |
| [菜单](./menu) | `menu` | 6 | 9 | — |
| [菜单栏](./menubar) | `menubar` | 10 | 15 | — |
| [右键菜单](./context-menu) | `context-menu` | 11 | 9 | — |
| [导航菜单](./navigation-menu) | `navigation-menu` | 8 | 7 | — |
| [标签页](./tabs) | `tabs` | 4 | 6 | — |
| [步骤条](./steps) | `steps` | 9 | 6 | — |
| [分页](./pagination) | `pagination` | 5 | 4 | — |
| [面包屑](./breadcrumb) | `breadcrumb` | 6 | 2 | — |
| [锚点](./anchor) | `anchor` | 5 | 2 | — |
| [工具栏](./toolbar) | `toolbar` | 4 | 6 | — |
| [引导](./tour) | `tour` | 13 | 4 | — |

## 反馈与浮层

向用户反馈状态、或浮在页面之上的组件。

| 组件 | 标识 | 部件数 | 键盘条目 | 示例 |
| --- | --- | --- | --- | --- |
| [对话框](./dialog) | `dialog` | 7 | 4 | — |
| [抽屉](./drawer) | `drawer` | 8 | 4 | — |
| [气泡卡片](./popover) | `popover` | 7 | 4 | — |
| [文字提示](./tooltip) | `tooltip` | 4 | 2 | — |
| [悬浮卡片](./hover-card) | `hover-card` | 5 | 2 | — |
| [警告提示](./alert) | `alert` | 5 | 1 | — |
| [轻提示](./toast) | `toast` | 5 | 2 | — |
| [轻提示容器](./toaster) | `toaster` | 2 | 0 | — |
| [进度条](./progress) | `progress` | 3 | 0 | — |
| [加载指示器](./spinner) | `spinner` | 2 | 0 | — |
| [加载条](./loading-bar) | `loading-bar` | 3 | 0 | — |

## AI 对话

AI 对话界面的组件。

| 组件 | 标识 | 部件数 | 键盘条目 | 示例 |
| --- | --- | --- | --- | --- |
| [会话线程](./thread) | `thread` | 5 | 2 | — |
| [消息编辑器](./composer) | `composer` | 3 | 4 | — |
