# 组件总览

104 个组件，每个都同时提供**无头内核**（`@xihan-ui/headless`）、**Vue 组件**（`@xihan-ui/vue`）、**自定义元素**（`@xihan-ui/web-components`）与**默认皮肤**（`@xihan-ui/styles`）四份产物。四者同源：内核是唯一的行为定义，另外三份不重新实现任何逻辑。

本册每个组件一页，页内固定为：产物 · 示例 · 解剖 · Props · 状态机 · connect API · 键盘。除示例外全部由组件源码生成，不会与代码对不上。

## 通用

不承载表单值、也不管理浮层的基础件。

| 组件 | 标识 | 部件数 | 键盘条目 | 示例 |
| --- | --- | --- | --- | --- |
| [按钮](./button) | `button` | 5 | 1 | 11 |
| [图标](./icon) | `icon` | 2 | 0 | 6 |
| [切换按钮](./toggle) | `toggle` | 1 | 1 | 9 |
| [切换按钮组](./toggle-group) | `toggle-group` | 2 | 6 | 7 |
| [徽标](./badge) | `badge` | 1 | 0 | 9 |
| [头像](./avatar) | `avatar` | 3 | 0 | 10 |
| [图片](./image) | `image` | 3 | 0 | 8 |
| [图片预览](./image-viewer) | `image-viewer` | 18 | 6 | 3 |
| [分隔线](./separator) | `separator` | 1 | 0 | 4 |
| [代码块](./code-block) | `code-block` | 5 | 1 | 4 |
| [剪贴板](./clipboard) | `clipboard` | 6 | 0 | 3 |
| [按钮组](./button-group) | `button-group` | 1 | 0 | 4 |
| [头像组](./avatar-group) | `avatar-group` | 2 | 0 | 4 |
| [图标块](./icon-wrapper) | `icon-wrapper` | 1 | 0 | 4 |

## 数据录入

承载表单值的组件，统一走受控/非受控两态与 name 表单集成。

| 组件 | 标识 | 部件数 | 键盘条目 | 示例 |
| --- | --- | --- | --- | --- |
| [表单字段](./field) | `field` | 5 | 0 | 6 |
| [表单](./form) | `form` | 6 | 0 | 13 |
| [文本输入](./text-field) | `text-field` | 4 | 1 | 16 |
| [数字输入](./number-field) | `number-field` | 6 | 6 | 14 |
| [分格输入](./pin-input) | `pin-input` | 4 | 6 | 11 |
| [就地编辑](./editable) | `editable` | 9 | 3 | 6 |
| [复选框](./checkbox) | `checkbox` | 3 | 1 | 8 |
| [复选框组](./checkbox-group) | `checkbox-group` | 7 | 3 | 8 |
| [单选组](./radio-group) | `radio-group` | 6 | 4 | 7 |
| [开关](./switch) | `switch` | 3 | 1 | 11 |
| [滑块](./slider) | `slider` | 10 | 6 | 11 |
| [评分](./rating) | `rating` | 5 | 5 | 9 |
| [选择器](./select) | `select` | 17 | 13 | 19 |
| [列表框](./listbox) | `listbox` | 8 | 10 | 7 |
| [组合框](./combobox) | `combobox` | 15 | 14 | 14 |
| [级联选择](./cascader) | `cascader` | 16 | 12 | 16 |
| [树选择](./tree-select) | `tree-select` | 19 | 14 | 12 |
| [标签输入](./tags-input) | `tags-input` | 11 | 13 | 12 |
| [穿梭框](./transfer) | `transfer` | 14 | 11 | 8 |
| [日期输入](./date-field) | `date-field` | 5 | 8 | 12 |
| [日期选择器](./date-picker) | `date-picker` | 12 | 7 | 10 |
| [时间输入](./time-field) | `time-field` | 5 | 9 | 9 |
| [时间选择器](./time-picker) | `time-picker` | 11 | 22 | 10 |
| [日历](./calendar) | `calendar` | 15 | 12 | 4 |
| [颜色选择器](./color-picker) | `color-picker` | 17 | 9 | 10 |
| [文件上传](./file-upload) | `file-upload` | 12 | 5 | 11 |
| [弹出选择](./popselect) | `popselect` | 7 | 9 | 5 |
| [动态录入](./dynamic-input) | `dynamic-input` | 8 | 0 | 5 |
| [提及](./mention) | `mention` | 6 | 9 | 5 |

## 数据展示

把数据摆出来的组件：表格、树、折叠、虚拟滚动。

| 组件 | 标识 | 部件数 | 键盘条目 | 示例 |
| --- | --- | --- | --- | --- |
| [卡片](./card) | `card` | 7 | 0 | 5 |
| [表格](./table) | `table` | 15 | 10 | 16 |
| [树](./tree) | `tree` | 12 | 10 | 10 |
| [虚拟滚动](./virtualizer) | `virtualizer` | 4 | 0 | 4 |
| [滚动区域](./scroll-area) | `scroll-area` | 6 | 5 | 5 |
| [手风琴](./accordion) | `accordion` | 6 | 6 | 11 |
| [折叠区域](./collapsible) | `collapsible` | 3 | 1 | 6 |
| [走马灯](./carousel) | `carousel` | 8 | 10 | 9 |
| [分栏](./splitter) | `splitter` | 3 | 7 | 6 |
| [骨架屏](./skeleton) | `skeleton` | 2 | 0 | 4 |
| [空状态](./empty-state) | `empty-state` | 5 | 0 | 5 |
| [结果页](./result) | `result` | 5 | 0 | 5 |
| [无限滚动](./infinite-scroll) | `infinite-scroll` | 2 | 0 | 4 |
| [日志](./log) | `log` | 4 | 1 | 5 |
| [列表](./list) | `list` | 7 | 0 | 5 |
| [描述列表](./descriptions) | `descriptions` | 4 | 0 | 5 |
| [时间线](./timeline) | `timeline` | 8 | 0 | 5 |
| [统计数值](./statistic) | `statistic` | 5 | 0 | 5 |
| [二维码](./qr-code) | `qr-code` | 2 | 0 | 8 |
| [数值动画](./number-animation) | `number-animation` | 1 | 0 | 4 |
| [倒计时](./countdown) | `countdown` | 1 | 0 | 4 |
| [时间](./time) | `time` | 1 | 0 | 4 |
| [文本高亮](./highlight) | `highlight` | 2 | 0 | 4 |

## 导航

在页面与视图之间移动的组件。

| 组件 | 标识 | 部件数 | 键盘条目 | 示例 |
| --- | --- | --- | --- | --- |
| [菜单](./menu) | `menu` | 6 | 9 | 11 |
| [菜单栏](./menubar) | `menubar` | 10 | 15 | 9 |
| [右键菜单](./context-menu) | `context-menu` | 11 | 9 | 9 |
| [导航菜单](./navigation-menu) | `navigation-menu` | 8 | 7 | 10 |
| [侧栏导航](./side-nav) | `side-nav` | 11 | 10 | 2 |
| [标签页](./tabs) | `tabs` | 4 | 6 | 13 |
| [步骤条](./steps) | `steps` | 9 | 6 | 8 |
| [分页](./pagination) | `pagination` | 5 | 4 | 10 |
| [面包屑](./breadcrumb) | `breadcrumb` | 6 | 2 | 6 |
| [锚点](./anchor) | `anchor` | 5 | 2 | 9 |
| [工具栏](./toolbar) | `toolbar` | 4 | 6 | 7 |
| [引导](./tour) | `tour` | 13 | 4 | 3 |
| [固钉](./affix) | `affix` | 2 | 0 | 4 |
| [回到顶部](./back-top) | `back-top` | 2 | 2 | 4 |
| [页头](./page-header) | `page-header` | 6 | 0 | 5 |
| [浮动按钮](./float-button) | `float-button` | 3 | 3 | 4 |

## 反馈与浮层

向用户反馈状态、或浮在页面之上的组件。

| 组件 | 标识 | 部件数 | 键盘条目 | 示例 |
| --- | --- | --- | --- | --- |
| [对话框](./dialog) | `dialog` | 7 | 4 | 9 |
| [抽屉](./drawer) | `drawer` | 8 | 4 | 8 |
| [气泡卡片](./popover) | `popover` | 7 | 4 | 11 |
| [文字提示](./tooltip) | `tooltip` | 4 | 2 | 8 |
| [悬浮卡片](./hover-card) | `hover-card` | 5 | 2 | 6 |
| [警告提示](./alert) | `alert` | 5 | 1 | 5 |
| [轻提示](./toast) | `toast` | 5 | 2 | 5 |
| [轻提示容器](./toaster) | `toaster` | 2 | 0 | 7 |
| [进度条](./progress) | `progress` | 5 | 0 | 10 |
| [加载指示器](./spinner) | `spinner` | 2 | 0 | 6 |
| [加载条](./loading-bar) | `loading-bar` | 3 | 0 | 6 |
| [弹出确认](./popconfirm) | `popconfirm` | 8 | 4 | 5 |

## AI 对话

AI 对话界面的组件。

| 组件 | 标识 | 部件数 | 键盘条目 | 示例 |
| --- | --- | --- | --- | --- |
| [会话线程](./thread) | `thread` | 5 | 2 | 8 |
| [消息编辑器](./composer) | `composer` | 3 | 4 | 10 |

## 布局

不承载状态的排版容器，只把常用的一段 CSS 收成带默认皮肤的组件。

| 组件 | 标识 | 部件数 | 键盘条目 | 示例 |
| --- | --- | --- | --- | --- |
| [弹性布局](./flex) | `flex` | 1 | 0 | 5 |
| [栅格](./grid) | `grid` | 2 | 0 | 7 |
| [排印](./typography) | `typography` | 5 | 0 | 5 |
| [渐变文字](./gradient-text) | `gradient-text` | 1 | 0 | 4 |
| [布局](./layout) | `layout` | 6 | 1 | 7 |
| [跑马灯](./marquee) | `marquee` | 2 | 0 | 4 |
| [水印](./watermark) | `watermark` | 2 | 0 | 4 |
| [文本省略](./ellipsis) | `ellipsis` | 1 | 2 | 4 |
