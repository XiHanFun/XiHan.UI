# 组件总览

126 个组件，每个都同时提供**无头内核**（`@xihan-ui/headless`）、**Vue 组件**（`@xihan-ui/vue`）、**自定义元素**（`@xihan-ui/web-components`）与**默认皮肤**（`@xihan-ui/styles`）四份产物。四者同源：内核是唯一的行为定义，另外三份不重新实现任何逻辑。

本册每个组件一页，页内小节固定：概述 · 何时使用 · 何时不用 · 特性 · 示例 · 产物 · 解剖 · Props · 事件 · 插槽 · 状态 · connect API · 键盘 · 无障碍 · 样式 · 数据属性 · CSS 变量 · 动效 · 响应式 · RTL · 组合 · 最佳实践 · 反模式。其中契约类的小节由组件源码、连接层与皮肤直接生成，不会与代码对不上；讲取舍的几节与组件源码同放，见各组件目录下的 doc.md。某一节没有内容时整节不出现，不留空标题。

不是组件、但同样由本库提供的东西——全局配置、命令式的对话框与轻提示、流式 Markdown 渲染、代码着色——收在[服务与运行时](../runtime/)。

## 通用

最小粒度的原子件：触发一个动作、显示一个图标、排好一段文字。不组织数据，也不划分版面。

| 组件 | 标识 | 部件数 | 键盘条目 | 示例 |
| --- | --- | --- | --- | --- |
| [按钮](./button) | `button` | 5 | 1 | 11 |
| [按钮组](./button-group) | `button-group` | 2 | 0 | 4 |
| [剪贴板](./clipboard) | `clipboard` | 7 | 0 | 4 |
| [下载触发器](./download-trigger) | `download-trigger` | 1 | 1 | 6 |
| [文本截断](./truncate) | `truncate` | 1 | 2 | 4 |
| [浮动按钮](./float-button) | `float-button` | 3 | 3 | 5 |
| [渐变文字](./gradient-text) | `gradient-text` | 1 | 0 | 5 |
| [快捷键](./hotkeys) | `hotkeys` | 3 | 2 | 6 |
| [图标](./icon) | `icon` | 2 | 0 | 7 |
| [图标块](./icon-wrapper) | `icon-wrapper` | 1 | 0 | 4 |
| [滚动条](./scrollbar) | `scrollbar` | 4 | 7 | 4 |
| [切换按钮](./toggle) | `toggle` | 1 | 1 | 9 |
| [切换按钮组](./toggle-group) | `toggle-group` | 4 | 6 | 8 |
| [排印](./typography) | `typography` | 6 | 0 | 6 |
| [水印](./watermark) | `watermark` | 2 | 0 | 4 |

## 布局

只分配空间、不承载内容语义的容器。

| 组件 | 标识 | 部件数 | 键盘条目 | 示例 |
| --- | --- | --- | --- | --- |
| [弹性布局](./flex) | `flex` | 2 | 0 | 6 |
| [栅格](./grid) | `grid` | 2 | 0 | 7 |
| [布局](./layout) | `layout` | 7 | 2 | 8 |
| [瀑布流](./masonry) | `masonry` | 3 | 0 | 5 |
| [滚动区域](./scroll-area) | `scroll-area` | 4 | 5 | 6 |
| [分隔线](./separator) | `separator` | 3 | 0 | 4 |
| [排序](./sortable) | `sortable` | 5 | 5 | 4 |
| [可调容器](./resizable) | `resizable` | 2 | 6 | 4 |
| [分栏](./splitter) | `splitter` | 3 | 8 | 6 |

## 导航

在页面与视图之间移动的组件。

| 组件 | 标识 | 部件数 | 键盘条目 | 示例 |
| --- | --- | --- | --- | --- |
| [固钉](./affix) | `affix` | 2 | 0 | 4 |
| [锚点](./anchor) | `anchor` | 6 | 2 | 9 |
| [回到顶部](./back-top) | `back-top` | 2 | 2 | 5 |
| [面包屑](./breadcrumb) | `breadcrumb` | 7 | 2 | 6 |
| [右键菜单](./context-menu) | `context-menu` | 12 | 9 | 9 |
| [菜单](./menu) | `menu` | 11 | 9 | 11 |
| [菜单栏](./menubar) | `menubar` | 12 | 15 | 10 |
| [导航菜单](./navigation-menu) | `navigation-menu` | 9 | 7 | 10 |
| [页头](./page-header) | `page-header` | 8 | 0 | 7 |
| [分页](./pagination) | `pagination` | 10 | 6 | 11 |
| [分段控制器](./segmented) | `segmented` | 5 | 6 | 8 |
| [侧栏导航](./side-nav) | `side-nav` | 13 | 10 | 4 |
| [步骤条](./steps) | `steps` | 9 | 6 | 8 |
| [标签页](./tabs) | `tabs` | 8 | 7 | 14 |
| [工具栏](./toolbar) | `toolbar` | 4 | 6 | 8 |
| [引导](./tour) | `tour` | 15 | 4 | 4 |

## 数据录入

承载表单值的组件，统一走受控/非受控两态与 name 表单集成。

| 组件 | 标识 | 部件数 | 键盘条目 | 示例 |
| --- | --- | --- | --- | --- |
| [级联选择](./cascader) | `cascader` | 21 | 25 | 16 |
| [复选框](./checkbox) | `checkbox` | 5 | 1 | 8 |
| [复选框组](./checkbox-group) | `checkbox-group` | 7 | 3 | 9 |
| [颜色选择器](./color-picker) | `color-picker` | 18 | 10 | 10 |
| [组合框](./combobox) | `combobox` | 16 | 14 | 14 |
| [日期输入](./date-field) | `date-field` | 7 | 9 | 13 |
| [日期选择器](./date-picker) | `date-picker` | 14 | 9 | 10 |
| [就地编辑](./editable) | `editable` | 8 | 3 | 7 |
| [表单字段](./field) | `field` | 5 | 0 | 7 |
| [字段数组](./field-array) | `field-array` | 9 | 0 | 5 |
| [字段集](./fieldset) | `fieldset` | 6 | 0 | 5 |
| [文件上传](./file-upload) | `file-upload` | 13 | 5 | 11 |
| [表单](./form) | `form` | 6 | 0 | 14 |
| [图片裁切](./image-cropper) | `image-cropper` | 9 | 5 | 7 |
| [输入组](./input-group) | `input-group` | 2 | 0 | 4 |
| [列表框](./listbox) | `listbox` | 11 | 10 | 9 |
| [提及](./mention) | `mention` | 9 | 9 | 6 |
| [数字输入](./number-field) | `number-field` | 8 | 6 | 14 |
| [密码输入](./password-input) | `password-input` | 7 | 2 | 8 |
| [分格输入](./pin-input) | `pin-input` | 6 | 6 | 11 |
| [单选组](./radio-group) | `radio-group` | 6 | 4 | 7 |
| [评分](./rating) | `rating` | 6 | 5 | 9 |
| [选择器](./select) | `select` | 20 | 15 | 20 |
| [签名板](./signature-pad) | `signature-pad` | 8 | 1 | 6 |
| [滑块](./slider) | `slider` | 11 | 6 | 11 |
| [开关](./switch) | `switch` | 5 | 1 | 11 |
| [标签组](./tag-group) | `tag-group` | 4 | 10 | 4 |
| [标签输入](./tags-input) | `tags-input` | 9 | 13 | 12 |
| [文本输入](./text-field) | `text-field` | 8 | 1 | 16 |
| [时间输入](./time-field) | `time-field` | 7 | 9 | 9 |
| [时间选择器](./time-picker) | `time-picker` | 14 | 24 | 11 |
| [穿梭框](./transfer) | `transfer` | 18 | 11 | 10 |
| [树选择](./tree-select) | `tree-select` | 23 | 16 | 13 |

## 数据展示

把已有的数据摆出来：集合、媒体、身份标记与度量。

| 组件 | 标识 | 部件数 | 键盘条目 | 示例 |
| --- | --- | --- | --- | --- |
| [手风琴](./accordion) | `accordion` | 7 | 6 | 12 |
| [头像](./avatar) | `avatar` | 3 | 0 | 11 |
| [头像组](./avatar-group) | `avatar-group` | 2 | 0 | 4 |
| [日历](./calendar) | `calendar` | 17 | 12 | 4 |
| [卡片](./card) | `card` | 7 | 0 | 5 |
| [走马灯](./carousel) | `carousel` | 9 | 10 | 9 |
| [折叠区域](./collapsible) | `collapsible` | 5 | 1 | 7 |
| [描述列表](./descriptions) | `descriptions` | 4 | 0 | 6 |
| [空状态](./empty-state) | `empty-state` | 6 | 0 | 6 |
| [热力图](./heatmap) | `heatmap` | 13 | 10 | 11 |
| [文本高亮](./highlight) | `highlight` | 2 | 0 | 5 |
| [图片](./image) | `image` | 4 | 0 | 8 |
| [图片预览](./image-viewer) | `image-viewer` | 18 | 11 | 4 |
| [无限滚动](./infinite-scroll) | `infinite-scroll` | 3 | 0 | 5 |
| [JSON 视图](./json-viewer) | `json-viewer` | 14 | 9 | 9 |
| [列表](./list) | `list` | 7 | 0 | 5 |
| [跑马灯](./marquee) | `marquee` | 2 | 0 | 4 |
| [数值动画](./number-animation) | `number-animation` | 1 | 0 | 4 |
| [二维码](./qr-code) | `qr-code` | 2 | 0 | 8 |
| [统计数值](./statistic) | `statistic` | 6 | 0 | 6 |
| [表格](./table) | `table` | 23 | 18 | 24 |
| [标签](./tag) | `tag` | 3 | 1 | 7 |
| [时间线](./timeline) | `timeline` | 9 | 0 | 6 |
| [计时器](./timer) | `timer` | 5 | 1 | 7 |
| [时间戳](./timestamp) | `timestamp` | 1 | 0 | 4 |
| [树](./tree) | `tree` | 18 | 12 | 13 |
| [虚拟滚动](./virtualizer) | `virtualizer` | 4 | 0 | 6 |

## 反馈

报告系统状态：正在进行、已经完成、出了错。

| 组件 | 标识 | 部件数 | 键盘条目 | 示例 |
| --- | --- | --- | --- | --- |
| [警告提示](./alert) | `alert` | 7 | 1 | 5 |
| [徽标](./badge) | `badge` | 2 | 0 | 4 |
| [加载条](./loading-bar) | `loading-bar` | 4 | 0 | 6 |
| [进度条](./progress) | `progress` | 5 | 0 | 10 |
| [骨架屏](./skeleton) | `skeleton` | 2 | 0 | 4 |
| [加载指示器](./spinner) | `spinner` | 2 | 0 | 7 |
| [通知](./notification) | `notification` | 9 | 0 | 6 |
| [轻提示](./toast) | `toast` | 7 | 2 | 6 |

## 浮层

portal 到统一落点、由定位引擎摆位的一层，共用浮层容器与焦点归还契约。

| 组件 | 标识 | 部件数 | 键盘条目 | 示例 |
| --- | --- | --- | --- | --- |
| [命令面板](./command) | `command` | 13 | 8 | 4 |
| [对话框](./dialog) | `dialog` | 11 | 4 | 9 |
| [抽屉](./drawer) | `drawer` | 11 | 4 | 8 |
| [浮动面板](./floating-panel) | `floating-panel` | 11 | 6 | 6 |
| [悬浮卡片](./hover-card) | `hover-card` | 7 | 2 | 6 |
| [弹出确认](./popconfirm) | `popconfirm` | 9 | 4 | 5 |
| [气泡卡片](./popover) | `popover` | 7 | 4 | 11 |
| [文字提示](./tooltip) | `tooltip` | 4 | 2 | 8 |

## AI 对话

AI 对话界面的组件。

| 组件 | 标识 | 部件数 | 键盘条目 | 示例 |
| --- | --- | --- | --- | --- |
| [审批](./approval) | `approval` | 14 | 4 | 4 |
| [代码视图](./code-view) | `code-view` | 11 | 2 | 8 |
| [差异视图](./diff-view) | `diff-view` | 16 | 2 | 5 |
| [日志](./log) | `log` | 6 | 2 | 7 |
| [流式正文](./markdown-stream) | `markdown-stream` | 4 | 1 | 5 |
| [消息流](./message-feed) | `message-feed` | 7 | 7 | 7 |
| [提示输入框](./prompt-input) | `prompt-input` | 4 | 8 | 10 |
| [澄清问卷](./question-flow) | `question-flow` | 18 | 6 | 4 |
| [思考过程](./reasoning) | `reasoning` | 7 | 1 | 4 |
| [工具调用](./tool-call) | `tool-call` | 12 | 1 | 5 |
