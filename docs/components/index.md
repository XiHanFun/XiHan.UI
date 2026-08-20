# 组件总览

118 个组件，每个都同时提供**无头内核**（`@xihan-ui/headless`）、**Vue 组件**（`@xihan-ui/vue`）、**自定义元素**（`@xihan-ui/web-components`）与**默认皮肤**（`@xihan-ui/styles`）四份产物。四者同源：内核是唯一的行为定义，另外三份不重新实现任何逻辑。

本册每个组件一页，页内小节固定：概述 · 何时使用 · 何时不用 · 特性 · 示例 · 产物 · 解剖 · Props · 事件 · 插槽 · 状态 · connect API · 键盘 · 无障碍 · 样式 · 数据属性 · CSS 变量 · 动效 · 响应式 · RTL · 组合 · 最佳实践 · 反模式。其中契约类的小节由组件源码、连接层与皮肤直接生成，不会与代码对不上；讲取舍的几节与组件源码同放，见各组件目录下的 doc.md。某一节没有内容时整节不出现，不留空标题。

不是组件、但同样由本库提供的东西——全局配置、命令式的对话框与轻提示、流式 Markdown 渲染、代码着色——收在[服务与运行时](../runtime/)。

## 通用

最小粒度的原子件：触发一个动作、显示一个图标、排好一段文字。不组织数据，也不划分版面。

| 组件 | 标识 | 部件数 | 键盘条目 | 示例 |
| --- | --- | --- | --- | --- |
| [按钮](./button) | `button` | 5 | 1 | 11 |
| [按钮组](./button-group) | `button-group` | 1 | 0 | 4 |
| [剪贴板](./clipboard) | `clipboard` | 6 | 0 | 3 |
| [下载触发器](./download-trigger) | `download-trigger` | 1 | 1 | 5 |
| [文本省略](./ellipsis) | `ellipsis` | 1 | 2 | 4 |
| [浮动按钮](./float-button) | `float-button` | 3 | 3 | 4 |
| [渐变文字](./gradient-text) | `gradient-text` | 1 | 0 | 4 |
| [快捷键](./hotkeys) | `hotkeys` | 3 | 2 | 5 |
| [图标](./icon) | `icon` | 2 | 0 | 6 |
| [图标块](./icon-wrapper) | `icon-wrapper` | 1 | 0 | 4 |
| [切换按钮](./toggle) | `toggle` | 1 | 1 | 9 |
| [切换按钮组](./toggle-group) | `toggle-group` | 2 | 6 | 7 |
| [排印](./typography) | `typography` | 5 | 0 | 5 |

## 布局

只分配空间、不承载内容语义的容器。

| 组件 | 标识 | 部件数 | 键盘条目 | 示例 |
| --- | --- | --- | --- | --- |
| [弹性布局](./flex) | `flex` | 1 | 0 | 5 |
| [栅格](./grid) | `grid` | 2 | 0 | 7 |
| [布局](./layout) | `layout` | 6 | 1 | 7 |
| [瀑布流](./masonry) | `masonry` | 3 | 0 | 5 |
| [滚动区域](./scroll-area) | `scroll-area` | 6 | 5 | 5 |
| [分隔线](./separator) | `separator` | 1 | 0 | 4 |
| [间距](./space) | `space` | 2 | 0 | 5 |
| [分栏](./splitter) | `splitter` | 3 | 7 | 6 |
| [水印](./watermark) | `watermark` | 2 | 0 | 4 |

## 导航

在页面与视图之间移动的组件。

| 组件 | 标识 | 部件数 | 键盘条目 | 示例 |
| --- | --- | --- | --- | --- |
| [固钉](./affix) | `affix` | 2 | 0 | 4 |
| [锚点](./anchor) | `anchor` | 5 | 2 | 9 |
| [回到顶部](./back-top) | `back-top` | 2 | 2 | 4 |
| [面包屑](./breadcrumb) | `breadcrumb` | 6 | 2 | 6 |
| [右键菜单](./context-menu) | `context-menu` | 11 | 9 | 9 |
| [菜单](./menu) | `menu` | 6 | 9 | 11 |
| [菜单栏](./menubar) | `menubar` | 10 | 15 | 9 |
| [导航菜单](./navigation-menu) | `navigation-menu` | 8 | 7 | 10 |
| [页头](./page-header) | `page-header` | 6 | 0 | 5 |
| [分页](./pagination) | `pagination` | 5 | 4 | 10 |
| [侧栏导航](./side-nav) | `side-nav` | 12 | 10 | 2 |
| [步骤条](./steps) | `steps` | 9 | 6 | 8 |
| [标签页](./tabs) | `tabs` | 4 | 6 | 13 |
| [工具栏](./toolbar) | `toolbar` | 4 | 6 | 7 |

## 数据录入

承载表单值的组件，统一走受控/非受控两态与 name 表单集成。

| 组件 | 标识 | 部件数 | 键盘条目 | 示例 |
| --- | --- | --- | --- | --- |
| [级联选择](./cascader) | `cascader` | 16 | 12 | 16 |
| [复选框](./checkbox) | `checkbox` | 5 | 1 | 8 |
| [复选框组](./checkbox-group) | `checkbox-group` | 7 | 3 | 8 |
| [颜色选择器](./color-picker) | `color-picker` | 17 | 9 | 10 |
| [组合框](./combobox) | `combobox` | 15 | 14 | 14 |
| [日期输入](./date-field) | `date-field` | 5 | 9 | 13 |
| [日期选择器](./date-picker) | `date-picker` | 12 | 7 | 10 |
| [动态录入](./dynamic-input) | `dynamic-input` | 8 | 0 | 5 |
| [就地编辑](./editable) | `editable` | 9 | 3 | 6 |
| [表单字段](./field) | `field` | 5 | 0 | 6 |
| [字段集](./fieldset) | `fieldset` | 4 | 0 | 5 |
| [文件上传](./file-upload) | `file-upload` | 12 | 5 | 11 |
| [表单](./form) | `form` | 6 | 0 | 13 |
| [图片裁切](./image-cropper) | `image-cropper` | 7 | 5 | 7 |
| [列表框](./listbox) | `listbox` | 8 | 10 | 7 |
| [提及](./mention) | `mention` | 6 | 9 | 5 |
| [数字输入](./number-field) | `number-field` | 6 | 6 | 14 |
| [密码输入](./password-input) | `password-input` | 6 | 2 | 8 |
| [分格输入](./pin-input) | `pin-input` | 4 | 6 | 11 |
| [弹出选择](./popselect) | `popselect` | 7 | 9 | 5 |
| [单选组](./radio-group) | `radio-group` | 6 | 4 | 7 |
| [评分](./rating) | `rating` | 5 | 5 | 9 |
| [分段控制器](./segmented) | `segmented` | 5 | 6 | 8 |
| [选择器](./select) | `select` | 17 | 13 | 19 |
| [签名板](./signature-pad) | `signature-pad` | 8 | 1 | 6 |
| [滑块](./slider) | `slider` | 10 | 6 | 11 |
| [开关](./switch) | `switch` | 5 | 1 | 11 |
| [标签输入](./tags-input) | `tags-input` | 11 | 13 | 12 |
| [文本输入](./text-field) | `text-field` | 4 | 1 | 16 |
| [时间输入](./time-field) | `time-field` | 5 | 9 | 9 |
| [时间选择器](./time-picker) | `time-picker` | 11 | 22 | 10 |
| [穿梭框](./transfer) | `transfer` | 14 | 11 | 8 |
| [树选择](./tree-select) | `tree-select` | 19 | 14 | 12 |

## 数据展示

把已有的数据摆出来：集合、媒体、身份标记与度量。

| 组件 | 标识 | 部件数 | 键盘条目 | 示例 |
| --- | --- | --- | --- | --- |
| [手风琴](./accordion) | `accordion` | 6 | 6 | 11 |
| [头像](./avatar) | `avatar` | 3 | 0 | 10 |
| [头像组](./avatar-group) | `avatar-group` | 2 | 0 | 4 |
| [徽标](./badge) | `badge` | 1 | 0 | 9 |
| [日历](./calendar) | `calendar` | 17 | 12 | 4 |
| [卡片](./card) | `card` | 7 | 0 | 5 |
| [走马灯](./carousel) | `carousel` | 8 | 10 | 9 |
| [代码块](./code-block) | `code-block` | 5 | 1 | 4 |
| [折叠区域](./collapsible) | `collapsible` | 3 | 1 | 6 |
| [倒计时](./countdown) | `countdown` | 1 | 0 | 4 |
| [描述列表](./descriptions) | `descriptions` | 4 | 0 | 5 |
| [空状态](./empty-state) | `empty-state` | 5 | 0 | 5 |
| [热力图](./heatmap) | `heatmap` | 8 | 9 | 5 |
| [文本高亮](./highlight) | `highlight` | 2 | 0 | 4 |
| [图片](./image) | `image` | 3 | 0 | 8 |
| [图片预览](./image-viewer) | `image-viewer` | 18 | 8 | 3 |
| [无限滚动](./infinite-scroll) | `infinite-scroll` | 2 | 0 | 4 |
| [JSON 视图](./json-viewer) | `json-viewer` | 12 | 9 | 7 |
| [列表](./list) | `list` | 7 | 0 | 5 |
| [日志](./log) | `log` | 4 | 1 | 5 |
| [跑马灯](./marquee) | `marquee` | 2 | 0 | 4 |
| [数值动画](./number-animation) | `number-animation` | 1 | 0 | 4 |
| [二维码](./qr-code) | `qr-code` | 2 | 0 | 8 |
| [统计数值](./statistic) | `statistic` | 5 | 0 | 5 |
| [表格](./table) | `table` | 15 | 10 | 16 |
| [标签](./tag) | `tag` | 3 | 1 | 6 |
| [时间](./time) | `time` | 1 | 0 | 4 |
| [时间线](./timeline) | `timeline` | 8 | 0 | 5 |
| [计时器](./timer) | `timer` | 5 | 1 | 6 |
| [引导](./tour) | `tour` | 13 | 4 | 3 |
| [树](./tree) | `tree` | 12 | 10 | 10 |
| [虚拟滚动](./virtualizer) | `virtualizer` | 4 | 0 | 4 |

## 反馈

报告系统状态：正在进行、已经完成、出了错。

| 组件 | 标识 | 部件数 | 键盘条目 | 示例 |
| --- | --- | --- | --- | --- |
| [警告提示](./alert) | `alert` | 5 | 1 | 5 |
| [加载条](./loading-bar) | `loading-bar` | 3 | 0 | 6 |
| [进度条](./progress) | `progress` | 5 | 0 | 10 |
| [结果页](./result) | `result` | 5 | 0 | 5 |
| [骨架屏](./skeleton) | `skeleton` | 2 | 0 | 4 |
| [加载指示器](./spinner) | `spinner` | 2 | 0 | 6 |
| [轻提示](./toast) | `toast` | 5 | 2 | 5 |
| [轻提示容器](./toaster) | `toaster` | 2 | 0 | 7 |

## 浮层

portal 到统一落点、由定位引擎摆位的一层，共用浮层容器与焦点归还契约。

| 组件 | 标识 | 部件数 | 键盘条目 | 示例 |
| --- | --- | --- | --- | --- |
| [对话框](./dialog) | `dialog` | 7 | 4 | 9 |
| [抽屉](./drawer) | `drawer` | 8 | 4 | 8 |
| [浮动面板](./floating-panel) | `floating-panel` | 11 | 6 | 6 |
| [悬浮卡片](./hover-card) | `hover-card` | 5 | 2 | 6 |
| [弹出确认](./popconfirm) | `popconfirm` | 8 | 4 | 5 |
| [气泡卡片](./popover) | `popover` | 7 | 4 | 11 |
| [文字提示](./tooltip) | `tooltip` | 4 | 2 | 8 |

## AI 对话

AI 对话界面的组件。

| 组件 | 标识 | 部件数 | 键盘条目 | 示例 |
| --- | --- | --- | --- | --- |
| [消息编辑器](./composer) | `composer` | 3 | 4 | 10 |
| [会话线程](./thread) | `thread` | 5 | 2 | 8 |
