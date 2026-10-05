来源：https://ui.docs.xihanfun.com/changelog

# 更新日志 · XiHan.UI

本文件记录 XiHan.UI 各版本的变更。每条标注 **新增 / 修复 / 优化 / 调整 / 移除** 类别。只收录使用者可感知的变更，仓库自身的配置、CI、测试与门禁不列入。组件以 npm 包形式发布，升级前请留意「调整」类中的破坏性变更。

## v3.2.0 (2026-10-06)

本版新增十种常用语言的内建语言包（`locale` 子入口），组件不再自带英文，界面文字一律取语言包；Dialog 与 Drawer 新增 `unmountOnExit`，Select 新增 `lazyMount`，Carousel 与 ImageViewer 新增 `size`，浮动圆钮整体下移一档。另有一批面向大页面的性能优化：模态背景失活改为只打 `aria-hidden`，Portal 视觉桥只在浮层呈现期间存在，皮肤产物改以挂载类 `xh-scope-<组件名>` 领头。挂载类、浮动圆钮尺寸与模态背景的变化会影响自写标记、视觉快照与页内查找，升级前请看下方升级须知。

::: warning 升级须知
- **皮肤挂载类**：每个角色节点多带一个类 `xh-scope-<组件名>`，与 `data-scope` 一一对应，皮肤产物改以它领头。经 Vue / React / Web Components 使用组件的项目无需改动；只用 `@xihan-ui/styles`、自己书写标记的页面，要给每个带 `data-scope="x"` 的节点补上 `class="xh-scope-x"`，否则皮肤不命中。对 DOM 做快照或精确比对 `className` 的测试需要随之更新。`data-scope` / `data-part` 仍是公开的样式契约，覆盖写法不变
- **浮动圆钮尺寸**：Action Control 的 `floating` 档 sm / md / lg 由 40 / 48 / 56px 改为 32 / 40 / 48px（compact 28 / 36 / 44px）。BackTop、FloatButton 缺省由 48px 变为 40px、`size="lg"` 由 56px 变为 48px，ImageViewer 翻页钮由 48px 变为 40px、关闭钮由 40px 变为 32px，Carousel 翻页与播放钮为 40px；要保持原尺寸，把 `size` 调高一档
- **模态背景**：模态浮层的背景改为只打 `aria-hidden`、不再打 `inert`。键盘仍由焦点域收在浮层里，指针由遮罩或新加的透明底板拦下；页内查找（Ctrl+F）与文本选择现在能落到模态下面的内容上
:::

- **新增** 内建语言包 `zhCN`、`zhTW`、`enUS`、`jaJP`、`koKR`、`frFR`、`deDE`、`esES`、`ptBR`、`ruRU`，放在新的 `locale` 子入口（`@xihan-ui/headless/locale`、`@xihan-ui/vue/locale`、`@xihan-ui/react/locale`、`@xihan-ui/web-components/locale`），主入口体积不变，只打进用到的那几份。一份语言包即一份全局配置 `{ locale, translations }`（类型 `XhLocale`），直接交给 `provideXhConfig` / `XhConfigProvider` / `setXhConfig`，日期时间类组件的 `locale` 一并切换；语言包覆盖组件的每一条文案，含图表摘要、拖拽播报等函数式文案，个别文案仍可在实例上覆盖
- **新增** 原先写死的界面文字收进 `translations`，十种语言同步补齐：Dialog 新增 `ok` / `cancel` / `actionError`，命令式对话框服务没传 `okText` / `cancelText` / `actionErrorText` 时取服务所在配置的语言包，新增导出 `dialogServiceTranslations()`；Form 新增 `translations` 属性收进校验报错模板，取值顺序为规则的 `message` → `validateMessages` → `translations` → 英文语言包；Kbd 的 `keyName` 有了按平台区分的缺省，新增键帽字 `keyLabel`，`formatHotkey` 新增可选的第三个参数；Citation 新增 `previewLinkSource` / `previewLinkDocument`，API 新增 `previewLinkText(item)` 与 `sourceMetaText(source)`；Mention 新增空态文字 `empty` 与 API `emptyText`；Carousel、Sortable、Table 的读屏角色说明（`aria-roledescription`）可经 `translations` 翻译
- **新增** Dialog 与 Drawer 的 `unmountOnExit`（缺省 true，行为不变）：设为 false 时打开过之后收起只隐藏、不卸载，再打开不重挂，内容里的组件状态、输入与滚动位置都保留；Web Components 写进 content 里 `<template>` 的内容按同一规则挂卸，Headless connect 新增 `isContentMounted(present)`
- **新增** Select 的 `lazyMount`（缺省 false，行为不变）：列表内容第一次展开时才挂载，之后常驻；打开前的选中文字与收起态连打改按 `collection` 计算。300 个各带 20 个条目的 Select 挂载由约 530ms 降到约 183ms。Web Components 把条目写进 list 里的 `<template>`，第一次展开才克隆
- **新增** Carousel 与 ImageViewer 的 `size`（sm / md / lg，缺省 md），翻页与播放钮同档，ImageViewer 的关闭钮比它低一档；Log、MessageFeed 的回到底部钮随组件已有的 `size` 换档。新增的 `size` 接全局配置
- **新增** Carousel 分页点组件槽 `--xh-carousel-indicator-thickness`：垂直于轨道的粗细单独可调，缺省与 `--xh-carousel-indicator-size` 同值；调小即成细横条，粗指针下 44px 命中区不变
- **新增** core 导出 `SCOPE_CLASS_PREFIX`、`scopeClass()` 与 `stripScopeClass()`；诊断码 `portal.unreadable-stylesheet`：文档里有读不到规则的跨域样式表时点名报出，给它加 `crossorigin` 并让来源回 `Access-Control-Allow-Origin` 即可恢复浮层样式同步的增量判断；Web Components 的 `onXhConfigChange` 新增可选的第二个参数 `host`，只接收它所在子树的配置变化

- **修复** CartesianChart、PieChart、FunnelChart、RadarChart、GraphChart、HierarchyChart、SankeyChart 在根末尾追加的视觉隐藏数据表不再撑出祖先的滚动条，图表放进 `overflow: auto` 的卡片、面板、对话框正文时不再多出一截空滚动；新增部件 `table-region`（`getTableRegionProps()`），`table` 部件不再带隐藏样式
- **修复** HierarchyChart 的绘图区补上读屏角色说明，取 `translations.chartRoleDescription`，缺省为 `tree chart`，与其余六种图表一致
- **修复** CartesianChart 数据表的列名先取轴标题，全局配置里的 `translations.keyLabel` / `valueLabel` 不再盖掉作者写的轴标题；Heatmap 发散色阶的对照条两端恒写数值，`translations.legendLow` / `legendHigh` 只换顺序色阶两端的词
- **修复** Citation 来源副文字里没有媒体类型的文档不再写死 `Document`，改取 `translations.document`
- **修复** 自绘滚动条在 `disabled` 时容器暂缺不再报「找不到滚动容器」诊断

- **优化** 模态浮层的背景失活改为只打 `aria-hidden`：四千多个节点的页面上打开、关闭模态抽屉不再各多出 40–55 毫秒的长任务；实时区域照常播报；没有遮罩的模态层在定位层里垫一块透明底板（`data-xh-modal-underlay`）拦下背景点击；背景失活随宿主提交当场施加与撤下，关闭后焦点不再晚两帧回到触发器
- **优化** Vue 与 React 的 Portal 视觉桥只在浮层呈现期间存在：Tooltip、Popover、Select、DatePicker 等 19 种带退场闸门的浮层，以及菜单栏、侧栏与引用悬停卡常驻的定位层，关着时不建桥，展开时建、退场播完即撤；视觉桥按真正变了的自定义属性判断是否重算，模态浮层开合不再让全页浮层整批重算；滚动锁没让出宽度时不再往文档根写 `0px`
- **优化** 皮肤规则改以挂载类领头，挂在运行期状态后面的后代与兄弟规则主体带上组件特征：3500 个组件节点的容器上翻一次 `data-state` 由 150ms 降到 4ms，`data-current`、`data-disabled` 同量级下降
- **优化** 自绘滚动条首次测量按批读布局，粗指针探测全窗口共用一个媒体查询；Timestamp 的可见性监听与视口观察器全页共用；液态面协调器只在有液态成员时挂文档级监听
- **优化** Web Components 的 `<xh-config>` 只改视觉轴（mode、brand、density 等）时不再通知元素重新接线，改 locale / size / 文案时只叫醒它子树里的元素

- **调整** 组件不再自带英文：界面文字一律取语言包，没配语言包时取 `enUS`，英文输出与此前逐字相同；带英文缺省的公开常量（`CHART_TRANSLATIONS`、`HEATMAP_LEGEND_TEXT`、`SPINNER_DEFAULT_LABEL` 等）名字与签名不变，值改取自英文语言包
- **调整** 浮动圆钮整体下移一档、每个角色节点另带挂载类 `xh-scope-<组件名>`、模态背景不再 `inert`，详见升级须知

## v3.1.0 (2026-10-03)

本版补齐选择器的多选与表单字段接线：DatePicker、TimePicker、ColorPicker 多选时选中值在输入行里排成标签，与 Select 多选同一套；FloatButton 支持拖动与贴边，Menu 数据驱动支持多级，Tree 的连接线改为完整的树形连线；带清空钮的 15 个组件统一新增清空事件，组类控件直接放进表单字段也接上字段的标题与说明，并新增字段边界 FieldBoundary。另修复 Web Components 下 FloatButton、Marquee、Truncate、Watermark 盖掉作者写在 root 上的内联样式等问题。本版包含 TimePicker 与 ColorPicker 值类型的破坏性变更，按次版本发布，升级前请看下方升级须知。

::: warning 升级须知
**TimePicker**

- 值改为恒为 ISO 时间串数组：`onValueChange` / `value-change` 的 `value`、Vue `update:value`、`api.value` 由字符串改为 `string[]`，单选至多一项，还没填全时为空数组（此前是空串）；`setValue` 接收数组。宿主写入的 `value` / `defaultValue` 仍可写裸串，按一项处理。迁移：读值处取 `value[0] ?? ''`，写值处包一层数组

**ColorPicker**

- 值改为恒为颜色串数组：`onValueChange` / `value-change` 的 `value`、Vue `update:value`、`api.value` 由字符串改为 `string[]`，单选恒为一项；`setValue` 接收数组。宿主写入的 `value` / `defaultValue` 仍可写裸串，按一项处理。触发钮色块与值文字显示的工作色改由新增的 `api.color` 读出。迁移：读值处取 `value[0]`，写值处包一层数组
:::

- **新增** 多选成标签：DatePicker、TimePicker、ColorPicker 在 `selectionMode="multiple"` 下把选中值排成输入行里的标签，与 Select 多选同一套库内标签。新增 `tag-list` 部件与 `Tag` / `TagLabel` / `OverflowTag` / `ItemDeleteTrigger` 一组组件；点标签上的叉、或在展开钮（DatePicker 为日历钮）上按退格摘掉，超过 `maxTagCount`（默认 3）折进 +N，`translations` 新增 `deleteItem` / `overflowTag`；表单一个选中值一份同名隐藏输入；多选时段位收起。此前 DatePicker 多选只显示、只提交第一个日期
- **新增** TimePicker 与 ColorPicker 多选：面板里调出的是草稿，按新部件 `confirm-trigger`（文字由作者写）收进值、浮层不收；快捷选项与预设色板点一下切换选中，`maxSelected` 限制个数
- **新增** FloatButton 拖动与贴边：`draggable`（Web Components 为 `button-draggable`）打开后按住触发器拖到别处，松手按 `snap`（`inline` 缺省、`block`、`nearest`、`none`）贴边，甩一下贴到甩去的那一边；`position` / `defaultPosition` / `onPositionChange`（Vue `v-model:position`、Web Components `position-change`）以贴边比例 `{ edge, ratio }` 或像素坐标 `{ x, y }` 记位置，展开组恒朝页面中间长
- **新增** Menu、ContextMenu、Menubar 数据驱动支持多级：节点写 `children` 即为子菜单入口，Vue / React 的默认树按 `children` 递归铺出，深度不限；Vue 的 `XhContextMenuSub` 与两端的 `XhMenubarSub` 新增 `collection`
- **新增** 带清空钮的 15 个组件统一新增清空事件（Headless / React `onClear`、Vue `@clear`、Web Components `clear`）：用户按清空钮清掉值时，在值变化之后派发；程序化的 `clear()`、Escape 清空与本来就空时按清空钮都不派发
- **新增** 字段边界 `XhFieldBoundary`（Web Components 为 `<xh-field-boundary>`）：子树里的库内控件不再继承外层字段的标签、说明、状态与控件 id；Vue / React 的浮层内容经 Portal 搬走后自动断开；Vue 另导出 `clearFieldContext()`
- **新增** 组类控件直接放进表单字段也接上字段的标题与说明：RadioGroup、CheckboxGroup、ColorSwatchPicker、ToggleGroup、Rating、Slider、PinInput 把字段标题并进名字链，说明与错误文案进描述链；Vue / React 新增 `useFieldGroupWiring`
- **新增** DateField / DatePicker 的 `placeholder` 可写成一句整条占位，未填且未聚焦时显示、聚焦段位即换回；DatePicker 转发 `placeholder`，DateRangePicker 新增 `startPlaceholder` / `endPlaceholder`；新增组件槽 `--xh-date-picker-placeholder-fg` / `--xh-date-range-picker-placeholder-fg`
- **新增** Table 列的 `align`（`'start' | 'center' | 'end'`）；列的 `minWidth` / `maxWidth` 参与布局，与 `width` 写成同一个数即为定宽列
- **新增** Notification 正文限高：缺省 16rem（`--xh-viewport-h-md`），长文在正文里滚动，卡片不再被撑到整屏高；新增覆盖槽 `--xh-notification-description-max-h`
- **新增** 语义令牌 `--xh-overlay-toast-w`（28.75rem），toast 预设的卡宽改从它取值，像素不变
- **新增** Carousel 开发期核对张数：渲染出来的条目比 `slideCount` 多时，经诊断通道报 `carousel.slide-count-mismatch`；core 新增诊断码 `DIAGNOSTIC_CODES.carouselSlideCountMismatch`

- **修复** Web Components 下 FloatButton、Marquee、Truncate、Watermark 接线时整串写回 `style`，作者写在 root 上的内联样式被覆盖；现只写、只撤各自的内联自定义属性。Vue 的 `XhTruncate` 上作者写的 `style`、`class` 与监听器也改为与连接层逐条合并
- **修复** Dialog 与 Drawer 未给 `initialFocus` 时，初始焦点越过关闭钮、拖动把手与改尺把手，落在内容里第一个可聚焦的控件上
- **修复** Popconfirm 补上文档已列出的 `disabled` 与 `dir`：禁用时触发器转原生 `disabled`、点按不展开，`dir` 写在定位层上
- **修复** RadioGroup 的方向键只接条目与根自身的按键，组里行内编辑控件的方向键不再被当成切换选项；RadioGroup、CheckboxGroup、ColorSwatchPicker 只在 `label` 部件真渲染时才输出 `aria-labelledby`，Vue / React 的 `label` 属性在手写选项时同样铺出标题
- **修复** 日期选择器与日期范围选择器的浮层尺寸只按 px 结算：根字号不是 16px 时，时间列不再比日历网格短，带时刻的面板不再把确认钮挤进滚动里；浮层上限缺省改为定位引擎算出的可用高度
- **修复** 紧凑密度写在局部容器上时，引用收紧尺寸的派生令牌（`--xh-overlay-calendar-column-h` 等）在 compact 边界上重新声明，局部紧凑子树里日期浮层的时间列与网格对齐
- **修复** ImageViewer 放大后快甩越过边界时，越界量有上限、半秒内落定，不再冲出约 110px 露出视口底色

- **调整** 字段族控件（文本框、下拉、日期 / 时间族等 21 份皮肤）放进表单字段（Field）即铺满字段宽；单独摆放仍是 16rem 缺省宽，单类槽 `--xh-<组件>-control-w` 照旧优先，横排一行流的表单仍取缺省宽
- **调整** Tree 的 `lines` 由每层一道竖线改为完整连接线：子节点从竖线横出接到行首，最后一个子节点止于行中线并拐向行首，展开着的分支沿整棵子树接到下一个兄弟；顶层节点不画线，强制色下取 GrayText

## v3.0.0 (2026-09-29)

本版为主版本升级。主要变化：首发零依赖图表引擎 `@xihan-ui/viz`，并新增图表家族——直角坐标图 CartesianChart、饼图 PieChart、漏斗图 FunnelChart、雷达图 RadarChart、桑基图 SankeyChart、关系图 GraphChart、层级图 HierarchyChart 与迷你图 Sparkline，Heatmap 一并归入新的「图表」分类；另新增网格列表 GridList 与 AI 引用来源 Citation。四组组件合并：Toast 并入 Notification（`preset="toast"`）、Segmented 并入 RadioGroup（`variant="segmented"`）、IconWrapper 并入 Icon（`frame`）、GradientText 并入 Typography（`variant="gradient"`）。组件由 134 个增至 140 个（新增 10 个，并入删除 4 个），公开包由 17 个增至 18 个；日期族改用自研的 `@xihan-ui/core/date`，库包不再有运行时第三方依赖。视觉上新增墨色域、视觉环境的材质轴（liquid 导航层材质）以及加载环、选择卡片、标签行等家族配方；全库动效按角色取令牌，初始内容不播进场，减弱动效改为去掉位移、保留淡变。所有删除与更名均不保留别名、转发或兼容层，升级前请逐项看下方升级须知。

::: warning 升级须知
以下按组件与包列出本版全部破坏性变更。引用已删除或改名的导出、组件会直接报错；CSS 选择器、组件槽与关键帧名失配不会报错，请在代码库中检索旧名。只经 Vue / React / Web Components 使用组件、不直接调用 Headless 的项目，可跳过「Headless」一组。完整的逐项对照表见各包随 npm 发布的 `CHANGELOG.md`。

**Notification（Toast 并入）**

- Toast 整个组件删除，同一种「到期自行消失的消息」只保留 Notification，用 `preset` 区分：`card`（缺省）为两层卡片，`toast` 为一行操作结果；两种预设的缺省落位、条数、间距、时长、叠放与闲置暂停由 Headless 的 `NOTIFICATION_PRESETS` 统一给出，服务创建时均可改写
- 服务：`createToastService(options)` 改为 `createNotificationService({ preset: 'toast', ...options })`（Vue、React 与 `@xihan-ui/web-components/services` 同样改法），句柄方法不变；`ToastService` / `ToastServiceOptions` / `ToastCreateOptions` / `ToastMessageOptions` / `ToastPromiseOptions` 改为对应的 `Notification*`，服务选项 `toastTranslations` 改为 `translations`
- 组件：`XhToastRoot` 改为 `XhNotificationItem` 并写 `preset="toast"`，`XhToastIndicator` / `Content` / `Title` / `Description` / `ActionTrigger` / `Progress` / `CloseTrigger` 改为 `XhNotificationItemIndicator` 等同名后缀（React 的 `XhToast*Props` 同步），`useToast` / `ToastContext` 改为 `useNotificationItem` / `NotificationItemContext`（React `useToastContext` 改为 `useNotificationItemContext`），`ToastRootSlotProps` 改为 `NotificationItemSlotProps`；Web Components 的 `<xh-toast>` 改为 `<xh-notification-item preset="toast">`，作者节点的 `data-xh-part` 由 `indicator` / `content` / `title` / `description` / `action-trigger` / `progress` / `close-trigger` 改为加 `item-` 前缀；全局配置文案桶 `translations.toast` 改为 `translations.notification`。Vue 的 `action` 事件改为与另两端一样带 `{ id }`；单独使用的轻提示条目缺省在页面转入后台时暂停计时，要回到旧行为写 `pauseOnPageIdle={false}`（Web Components `pause-on-page-idle="false"`）
- 退场：Toast 与 Notification 删除固定退场窗口 `removeDelay`（Web Components 的 `remove-delay`、三端服务选项与 `TOAST_REMOVE_DELAY`），改为等退场动画播完再卸载；要调退场时长，覆盖 `--xh-motion-duration-exit`，或在 `xihan.overrides` 层改写卡片的 `animation-duration`
- 样式：删除子路径 `@xihan-ui/styles/toast.css`，轻提示皮肤在 `notification.css` 的 `[data-preset='toast']` 分支；`[data-scope='toast'][data-part='root']` 改认 `[data-scope='notification'][data-part='item'][data-preset='toast']`，其余部件改认 `item-<部件>`；组件槽 `--xh-toast-*` 改为 `--xh-notification-item-*` / `--xh-notification-*`（如 `--xh-toast-inline-size` → `--xh-notification-item-w`、`--xh-toast-icon-fg` → `--xh-notification-indicator-fg`、`--xh-toast-scale-collapsed` → `--xh-notification-stack-scale`），叠放测量槽（`--xh-toast-offset-collapsed`、`--xh-toast-height`、`--xh-toast-y` 等）不再公开；叠放收拢比例改由新令牌 `--xh-motion-scale-stack`（缺省 0.95，减弱动效下为 1）逐层计算；关键帧 `xh-toast-in` / `xh-toast-out` 改为 `xh-notification-stack-in` / `xh-notification-stack-out`
- Headless：`toastMachine` / `ToastSchema` / `ToastApi` / `connectToast` 改为 `notificationItemMachine` / `NotificationItemSchema` / `NotificationItemApi` / `connectNotificationItem`，`toastAnatomy` / `toastKeyboard` / `toastMeta` 改为 `notificationAnatomy` / `notificationKeyboard` / `notificationMeta`；`TOAST_DURATION` / `TOAST_GAP` / `TOAST_MAX` / `TOAST_PLACEMENT` 与 `NOTIFICATION_GAP` / `NOTIFICATION_MAX` / `NOTIFICATION_PLACEMENT` 改读 `NOTIFICATION_PRESETS.<preset>` 或 `notificationPresetOf(preset)`；`resolveToastDuration(loading, duration)` 改为 `resolveNotificationDuration(loading, duration, preset)`，`resolveToastId` 改为 `resolveNotificationItemId`；其余 `Toast*` 类型（如 `ToastTone`、`ToastRecord`、`ToastTranslations`）改为同名的 `Notification*`；机器事件 `TOAST.*` 改为 `ITEM.*`，`getRootProps` 等改为 `getItemProps` / `getItem<部件>Props`；删除 `createToastStackController`（含 `scaleFactor` 选项，叠放由 `notificationMachine` 的 `stacked` 接管）、`resolveToastServiceItem` / `ResolvedToastServiceItem` / `ToastServiceDefaults` 与 `createFeedbackServiceController` 的 `idPrefix` 选项
- 声音：`@xihan-ui/sound` 的 `withToastSoundService` / `ToastSoundServicePort` / `ToastSoundServiceOptions` / `ToastSoundKey` 改为 `withNotificationSoundService` / `NotificationSoundServicePort` / `NotificationSoundServiceOptions` / `NotificationSoundKey`；`@xihan-ui/vue/sound`、`@xihan-ui/react/sound` 的 `withToastSound` / `ToastSoundOptions` 改为 `withNotificationSound` / `NotificationSoundOptions`，选项、声音映射与返回值不变

**RadioGroup（Segmented 并入）**

- Segmented 删除：Headless 的 `connectSegmented`、`segmentedMachine` 等与全部 `Segmented*` 类型（含 `resolveSegmentedIndicator`、`SegmentedBox`）及 `translations.segmented`，三端的 `XhSegmented*`、`useSegmented*` 与 `<xh-segmented>`，`@xihan-ui/styles/segmented.css` 与全部 `--xh-segmented-*` 组件槽
- 迁移：`XhSegmentedRoot` 改为 `XhRadioGroupRoot variant="segmented"`，`collection`、`value`、`loop`、`block`、`tone`、`size` 等原样沿用；`XhSegmentedIndicator` 改为 `XhRadioGroupThumb`（部件 `thumb`），`XhSegmentedItemIcon` / `XhSegmentedItemText` 改为 `XhRadioGroupItemIcon` / `XhRadioGroupItemText`；隐藏输入改为每个条目一份原生 radio，不再有整组的 `hidden-input`。Web Components 写 `<xh-radio-group variant="segmented">`，滑块写 `data-xh-part="thumb"`，条目用 `<div data-xh-part="item">` 而不是 `<button>`。组件槽 `--xh-segmented-bg` / `-border` / `-radius` / `-track-padding` 改为 `--xh-radio-group-track-*`，`--xh-segmented-item-*` 改为 `--xh-radio-group-segment-*`，`--xh-segmented-indicator-*` 改为 `--xh-radio-group-thumb-*`，`--xh-segmented-icon-size` 改为 `--xh-radio-group-icon-size`
- 键盘统一为 APG 单选组：segmented 形态按 Enter 不再选中，Home / End 不再跳到首末段；RadioGroup 未传 `dir` 时，左右方向键按祖先的书写方向翻转（此前缺省按 ltr）

**Icon（IconWrapper 并入）**

- IconWrapper 删除：三端的 `XhIconWrapper` / `XhIconWrapperProps` / `<xh-icon-wrapper>` / `XhIconWrapperElement`，Headless 的 `connectIconWrapper`、`iconWrapperAnatomy` 等与 `IconWrapper*` 类型，`@xihan-ui/styles/icon-wrapper.css`，`--xh-icon-wrapper-*` 与 `data-scope="icon-wrapper"`
- 迁移：底框改写在图标自己身上，`variant` 改名 `frame`：`<XhIconWrapper variant="subtle" tone="brand" size="lg"><XhIcon :icon="FolderIcon" /></XhIconWrapper>` 写成 `<XhIcon :icon="FolderIcon" frame="subtle" tone="brand" size="lg" />`；原先不写 `variant` 的中性淡底对应 `frame="subtle"`。组件槽 `--xh-icon-wrapper-size` / `-glyph-size` / `-radius` / `-bg` / `-shadow` 改为 `--xh-icon-frame-*`，`--xh-icon-wrapper-fg` 改为 `--xh-icon-fg`

**Typography（GradientText 并入）**

- GradientText 删除：三端的 `XhGradientText` / `XhGradientTextProps` / `<xh-gradient-text>` / `XhGradientTextElement`，Headless 的 `connectGradientText`、`gradientTextAnatomy` 等与 `GradientText*` 类型，`@xihan-ui/styles/gradient-text.css`，`--xh-gradient-text-from` / `-to` 与 `data-scope="gradient-text"`
- 迁移：渐变字写成 `XhTypographyRoot` 里的 `XhTypographyText variant="gradient"`；`from` / `to` / `direction` 改为 text 部件上的覆盖槽 `--xh-typography-gradient-from` / `-to` / `-direction`，走向取 CSS 写法（`direction="to-bottom-right"` 写成 `to bottom right`）。Web Components 写 `<xh-typography>` 内的 `<span data-xh-part="text" variant="gradient">`

**其余组件**

- **Anchor**：滚动容器 `scrollElement` 改名 `target`，与 Affix、BackTop 一致（Vue `:target="el"`，React `target={() => ref.current}`，Web Components 的 property `el.target`）；Headless refs `getScrollEl` 改为 `getTargetEl`
- **Cascader**：浮层按内容定宽，不再随字段盒拉伸，改锚在字段盒上；材质由 frosted 改为实体的 floating 面；`--xh-cascader-content-max-w` 缺省改为不封顶，新增下界 `--xh-cascader-content-min-w`。删除组件槽 `--xh-cascader-content-backdrop`、`--xh-cascader-content-highlight`、`--xh-cascader-loading-min-w`、`--xh-cascader-empty-min-h`、`--xh-cascader-loading-min-h` 与 `--xh-cascader-input-py`（搜索框高度改由 `--xh-cascader-input-h` 给）
- **DownloadTrigger**：删除关键帧 `xh-download-trigger-content-hide`，在途时文字的隐去改由过渡承担
- **EmptyState**：页面首屏就在的空状态不再播放开幕，皮肤的开幕关键帧只写在 `:not([data-instant])` 下；React 的 `EmptyStateContext` 新增 `rootRef`，自行渲染根节点时要把它接到根元素上
- **ImageViewer**：删除 `--xh-image-viewer-loading-size`、`--xh-image-viewer-loading-radius`、`--xh-image-viewer-loading-bg`（取图占位面改为加载环，尺寸由新增的 `--xh-image-viewer-status-size` 给）
- **LoadingBar**：收尾改为等真实的淡出过渡播完；`fadeDuration` 的含义改为淡出时长（写进 `--xh-loading-bar-fade`，不给时取 `--xh-motion-duration-exit`，此前缺省 200ms）；删除 `LOADING_BAR_FADE_DURATION`，`resolveLoadingBarFadeDuration` 未给或非有限时返回 `undefined`；机器事件 `after.fadeDuration` 改名 `FADE.DONE`
- **Marquee**：`pauseOnHover` 缺省由关改为开，要关掉写 `pauseOnHover={false}`（Web Components `pause-on-hover="false"`）；`paused` 改为受控属性，给了它时暂停开关只发出 `onPausedChange`（Vue `update:paused`，Web Components `paused-change`），需由作者写回
- **NumberAnimation**：`easing` 改按 CSS 缓动函数解读，`"ease-out"` 这类写法由匀速改为按 CSS 曲线播放，认不出的写法在起跑时报错，要匀速写 `linear`；不写 `duration` / `easing` 时，缺省节奏由线性 1000ms 改为按数值角色取令牌（首次滚动取 `--xh-motion-duration-reveal`，换目标取 `--xh-motion-duration-morph`），首次滚动时不在视口里的停在起点；删除导出 `NUMBER_ANIMATION_DURATION` 与 `resolveNumberAnimationDuration`，要固定节奏照旧写 `duration`
- **Progress / LoadingBar / FileUpload**：填充改为铺满轨道、按比例平移，`range` 不再写内联 `inline-size`，改写私有槽 `--xh-_progress-value` / `--xh-_loading-bar-value`（0–1）；自带整套皮肤的项目改读这两个槽。Notification 倒计时条改为裁切收起，共享关键帧 `xh-countdown` 随之改写
- **SideNav**：分组改为合法的列表结构：`group` 不再输出 `role="group"` / `aria-labelledby`，新增部件 `group-list`（Vue / React `XhSideNavGroupList`，Web Components `<ul data-xh-part="group-list">`，Headless `getGroupListProps({ value })`）。在每个分组里把 `group-label` 之后的条目包进一层 `group-list`；依赖 `[data-part='group'][role='group']` 的样式或测试改认 `[data-part='group-list']`
- **Table**：删除关键帧 `xh-table-loading-pulse`（空表取数改为加载环），`--xh-table-loading-duration` 改为环转一圈的时长，`--xh-table-state-min-h` 缺省由 `8rem` 改为 `0`
- **Tabs / Anchor / NavigationMenu**：指示条改为量排布位、以 `transform` 摆放；Anchor 与 NavigationMenu 的连接层不再写内联的 `inset-*` 与尺寸，改写私有槽 `--xh-_anchor-indicator-x` / `-y` / `-w` / `-h` 与 `--xh-_navigation-menu-indicator-x` / `-y` / `-w` / `-h`，自带整套皮肤的项目改读这些槽
- **TimePicker / TimeRangePicker**：删除 `step`，改为按单位的 `timeStep: { hour?, minute?, second? }`：`step={15}` 改为 `timeStep` 传 `{ minute: 15 }`（Vue `:time-step="{ minute: 15 }"`，Web Components 属性 `step` 改为 `time-step='{"minute":15}'`），api 的 `step` 改为 `timeStep`。`isTimeUnavailable` 改为 `(value, unit, context)`：时列的 `value` 恒按 24 小时制给出（12 小时制下按显示值判定的改按 24 小时制），`context` 带已选的时与分；TimeRangePicker 原第三个参数 `index` 挪进 `context.index`，写成 `(value, unit, { index }) => …`
- **Timestamp**：用词与缺省日期写法改由 `Intl.RelativeTimeFormat` / `Intl.DateTimeFormat` 按 `locale` 给出，显示文本随之变化（如英文 datetime 为 `08/11/2026, 09:30:05`，中文相对说法为 `30分钟前`，一分钟以内为该语言的「现在」）；相对说法认将来时刻（`5分钟后`），离现在三十天及以上才退回绝对日期；相对型不给 `now` 时自动刷新。依赖旧文案的快照与断言需更新
- **Truncate**：开了 `expandable` 后文字盒子（root）不再是按钮，不再带 `role="button"`、`tabindex`、`aria-expanded`，点文字或在文字上按 Enter / Space 不再展开；展开改由 root 之后的原生按钮部件 `trigger` 承担。Vue / React 自动铺出这颗按钮（Vue 设 `inheritAttrs: false`，透传属性落在文字盒子上）；Web Components 需在 root 旁写一个 `<button data-xh-part="trigger">`

**Headless**

- Badge、EmptyState、Marquee、Skeleton、Spinner、Timestamp、Watermark 改由状态机驱动：`connectX(props, normalize)` 改为 `connectX(service, normalize)`，先用对应的 `badgeMachine`、`emptyStateMachine`、`marqueeMachine`、`skeletonMachine`、`spinnerMachine`、`timestampMachine`、`watermarkMachine` 建服务再连接；三端组件除上方已列出的变化外用法不变
- 日期族改用 `@xihan-ui/core/date`：`buildWeekDays`、`buildPeriodGrid`、`calendarPeriodOf`、`calendarPeriodValue` 删除 `timeZone` 选项（日历只按日期字段格式化，组件的 `timeZone` prop 不变）；删除导出 `parseCalendarDate`（改用 `PlainDate.from(v)`，非法串抛 `RangeError`）、`isoWeekNumber` / `isoWeekYear`（改用 `PlainDate.from(v).weekOfYear` / `.yearOfWeek`）、`isoWeekStart`（改用 `fromIsoWeek(year, week)`）、`isoWeeksInYear`（改用 `@xihan-ui/core/date` 的同名函数），以及 `calendarHeadingPieces`、`calendarPeriodStart`、`calendarWeekListedIn`、`isoWeekOf`、`blocksToDate`、`parseTimeValue`、`draftFromTime`、`timeFromDraft` 与类型 `CalendarHeadingPieces`
- 时间列算子收为共享的一份：删除 `timePickerColumns`、`timePickerColumnsFor`、`timePickerItemValue`、`TIME_PICKER_STEP` 与 `TimePickerColumnsOptions`，改用 `timeColumns`、`timeColumnsFor`、`timeItemValue` 与 `TimeColumnsOptions`（入参 `step: number` 改为 `timeStep: TimeStep`）；`resolveTimeStep` 的入参改为 `TimeStep`、返回三个单位的步进，`resolveTimeStep(15)` 写成 `resolveTimeStep({ minute: 15 }).minute`
- ColorPicker：`ColorPickerServices` 新增必填的 `recentSwatchPicker`，自行组装服务表的调用方用 `colorPickerRecentSwatchPickerProps` 再建一台色块选择器补上；`colorPickerMeta.requiredParts` 去掉 `trigger`（常驻形态不写触发器）
- Timestamp：`formatRelativeTime` 的 `locale` 改为必填，将来的时刻不再返回 `undefined`

**样式与令牌（`@xihan-ui/styles`、`@xihan-ui/tokens`）**

- 循环动画的周期令牌改名，旧名不再输出：`--xh-spin-duration` → `--xh-motion-loop-spin`、`--xh-caret-duration` → `--xh-motion-loop-caret`、`--xh-shimmer-duration` → `--xh-motion-loop-shimmer`，取值不变；`tokens.json`、`tokens` 对象与 `TokenName` 类型同样只有新名
- 组件私有的关键帧并入共享关键帧（`@xihan-ui/styles/motion.css`），旧名删除：各组件的旋转（`xh-spinner-rotate`、`xh-popconfirm-rotate`、`xh-switch-rotate`、`xh-toast-spin`、`xh-approval-rotate`、`xh-clipboard-rotate`、`xh-download-trigger-rotate`、`xh-notification-spin`）→ `xh-spin`；`xh-reasoning-shimmer`、`xh-tool-call-shimmer`、`xh-skeleton-shimmer` → `xh-shimmer`；`xh-approval-in`、`xh-message-feed-item-in`、`xh-question-flow-in`、`xh-tool-call-enter` → `xh-item-in`；`xh-approval-result-in`、`xh-message-feed-button-in`、`xh-question-flow-result-in`、`xh-log-button-in` → `xh-pop-in`；`xh-reasoning-fade-in`、`xh-clipboard-loading-reveal`、`xh-download-trigger-loading-reveal` → `xh-fade-in`；`xh-clipboard-loading-hide` → `xh-fade-out`；`xh-diff-view-reveal`、`xh-form-summary-enter` → `xh-drop-in`；`xh-dialog-in` / `-out`、`xh-notification-in` / `-out` → `xh-sheet-in` / `xh-sheet-out`；`xh-drawer-in-*` / `xh-drawer-out-*`（四个方向）→ `xh-slide-in` / `xh-slide-out`。在 `xihan.overrides` 层重定义过旧名的改为重定义新名，新名跨组件共享，只想换一个组件的动画就改写该部件的 `animation-name`

**`@xihan-ui/core`**

- 删除 `RuntimeConfig.reducedMotion` 与 `createRuntimeConfig` 的同名选项：减弱动效改按元素所在的作用域判断，容器上的 `data-motion` 对 JS 驱动的滚动同样生效；要强制减弱动效，在容器上写 `data-motion="reduce"` 或调用 `setMotionOverride('reduce')`
- `createPresence` 删除 `config` 选项，调用处去掉即可；减弱动效下 Presence 照样等退场动画播完，浮层、对话框、抽屉等先以 120ms 淡出再卸载，不再瞬时消失

**`@xihan-ui/motion`**

- 缓动表删除 `decelerate` 与 `accelerate`（`EasingName` 随之少了这两个名字），分别改写为 `'cubic-bezier(0, 0, 0, 1)'` 与 `'cubic-bezier(0.3, 0, 1, 1)'`
- `resolveEasing` 认不出写法时抛 `TypeError`，不再退回线性；新认下 `ease` / `ease-in` / `ease-out` / `ease-in-out`、`step-start` / `step-end`、`steps()` 与 `linear()`。此前写成 `'ease-out'` 一类、实际按匀速播放的，现在按 CSS 曲线播放，要匀速写 `'linear'`，要库里的曲线写命名缓动 `'easeOut'`；越界的 `cubic-bezier()`、带单位的分量与非字符串一律报错，`tweenValueAt` 规则相同。来自配置或后端的缓动串请在入口处用 `resolveEasing` 校验

**`@xihan-ui/animations`**

- 预设改取动效令牌：`fade` 取 200ms（原 240ms），带位移的淡入、缩放与模糊取 320ms、位移 16px（原 12px），`rise` / `drop-in` / `spin-in` 取 520ms、位移 24px 与强调曲线，注意类统一取 640ms（原 520–900ms）；`playAll` 缺省间隔由 60ms 改为 40ms
- 删除 `clampSpec`，新增 `validateMotionSpec`：越界配方不再被悄悄钳住，`play` / `playAll` 校验不通过时同步抛 `RangeError`（缓动写法不合法抛 `TypeError`）且不起播；任意一秒内闪烁超过三次同样拒播；`createMotionPlayer` 的 `speed` 不在 (0, 100] 内、`playAll` 的 `stagger` 为负或非有限时抛错。原先依赖钳制的配方先用 `validateMotionSpec` 找出越界字段；要保持旧节奏，给 `play` 传 `duration`、给 `playAll` 传 `stagger: 60`

**缺省值与外观**

以下变化不删改 API，但升级后画面或行为会不同：

- 减弱动效改为去掉位移、保留淡变：`--xh-motion-duration-micro` / `-enter` / `-exit` 在减弱档由 1ms 改为 120ms。把几何变化（位移、缩放、尺寸）挂在这三个时长上的自定义样式，改用 `--xh-motion-duration-move` / `-nudge` / `-expand` / `-collapse` 等几何时长；`--xh-motion-duration-nudge` 由 200ms 改为 120ms
- 缺省主题的描边与淡底令牌（`--xh-border-default` / `-subtle` / `-strong` / `-control-hover`，`--xh-bg-subtle` / `-subtle-hover` / `-subtle-active`，`--xh-bg-muted`）改为半透明墨色，缺省面上的对比度不变；拿它们当遮盖底（吸顶条、叠层）的自定义样式改用新增的不透明档 `--xh-bg-subtle-opaque`、`--xh-bg-subtle-hover-opaque`、`--xh-bg-subtle-active-opaque`、`--xh-bg-muted-opaque`、`--xh-border-default-opaque`
- Select、Combobox、TreeSelect 的候选面板改为与字段盒等宽，长选项在条目里截断；需要面板按内容撑宽的，改写 `--xh-select-content-min-w` 等对应的 `--xh-<组件>-content-min-w`
- Select、Combobox、TreeSelect 只传 `collection` 的自动结构在 `multiple` 下改为标签行，缺省最多显示 3 枚，其余折叠为 `+N`（`maxTagCount` 可调）
- Reasoning 缺省 `variant` / `size` 由 `subtle` / `sm` 改为 `outline` / `md`，要保持原样显式写回；CodeView、DiffView 缺省字号由 sm 档改为 md 档（写 `size="sm"` 保持原样）；Log 行高由 1.25rem 改为 1.5rem（`--xh-log-line-height` 可改回）
- SideNav 宽度改读侧栏令牌，折叠宽由 56px 改为 64px（写 `--xh-side-nav-collapsed-w: 56px` 保持原样），当前项不再加粗；Layout 侧栏里放 SideNav 时内衬缺省为 0
- Badge md / lg 计数盒由 28 / 32px 收为 20 / 24px；Spinner md / lg 直径由 24 / 32px 改为 20 / 24px
- NumberAnimation 改用 `Intl.NumberFormat` 输出，缺省按浏览器语言格式化（部分语言的小数点与数字系统会变），要固定写法写 `locale="en-US"`；Marquee 的 `speed` 改按实测内容长度换算为真正的每秒像素数，未写 `--xh-marquee-span` 的滚速会变
- DatePicker 的 `showTime` 小时制缺省改按 `locale` 推断，传了 12 小时制地区（如 `en-US`）时多出上下午列，写 `hourCycle={24}` 保持原样
- Tooltip 新增接替窗口 `skipDelayDuration`（缺省 300ms）：一个提示开着或刚收起时，指向下一个直接接替、不再等待也不播进场；要回到旧行为写 `skipDelayDuration={0}`
- Tour 当前步的目标取不到时先不露面、等它出现，等满 `targetTimeout`（缺省 3000ms）仍没有才按居中呈现（此前立即居中）；要回到旧行为写 `targetTimeout={0}`
- Heatmap 缺省播放填色动画（写 `animated={false}` 关闭）；数据含负数且未写 `scale` 时缺省按发散色阶（写 `scale="sequential"` 保持原口径）；`palette` 的 `green` / `blue` / `orange` / `red` 改取基础色板同名色相，要回到语气色写 `tone`

**升级时最容易漏的几处**

- 删掉或改了名的属性不会报错：Vue 与 Web Components 把它当成原生属性透传到根元素上，写了等于没写。Vue 项目建议开启 vue-tsc 的 `checkUnknownProps` 与 `checkUnknownEvents` 一次扫出来，透传的原生属性（`id`、`title`、`aria-*`）按 [Vue 适配器 · 原生属性透传与严格模板检查](/adapters/vue#原生属性透传与严格模板检查) 放行
- Select 只负责从固定选项里选，不带输入筛选与远程搜索；要边输入边筛选改用 Combobox，它只负责呈现，筛选结果与输入框里的文字由调用方掌管
- ImageViewer 的图片经 `collection` 传入，没给时打开只有工具条与空视口
- Button 的加载态与文字分别放进 `XhButtonIndicator` / `XhButtonLabel`；纯图标按钮要写 `iconOnly`（Vue 模板里 `icon-only`）并自带可及名
- Switch、Checkbox 的文字写进默认插槽才接得上可及名，写在组件外面的文字不会成为它的名字
- SideNav 的 `item` 部件必须写，链接条目要带 `href`：回车激活走浏览器原生的链接行为
- 合并与改名再提一次：轻提示并入通知（`preset="toast"`），分段控件并入单选组（`variant="segmented"`），令牌 `--xh-shimmer-duration` 改名 `--xh-motion-loop-shimmer`
:::

- **新增** `@xihan-ui/viz`：零运行时依赖、不碰 DOM 的图表引擎，以纯函数提供比例尺、刻度与时间间隔、统计与分箱、形状与曲线、坐标轴布局、场景与过渡、几何拾取、降采样、数字与时间格式、文字折行、颜色换算与色板校验，以及无障碍摘要与数据表模型；关系、层级、桑基布局与列式大数据工具放在子入口 `@xihan-ui/viz/graph`、`/hierarchy`、`/sankey`、`/columns`、`/canvas`，不用不计体积；非法输入抛 `VizError`。Headless 与三个适配器已依赖它，无需单独安装
- **新增** 8 个图表组件，三端同时提供：CartesianChart（直角坐标图）、PieChart（饼图）、FunnelChart（漏斗图）、RadarChart（雷达图）、SankeyChart（桑基图）、GraphChart（关系图）、HierarchyChart（层级图）、Sparkline（迷你图）；皮肤子路径 `@xihan-ui/styles/cartesian-chart.css` 等随组件提供
- **新增** CartesianChart 以 `mark` 组合画法：柱（分组、堆叠、百分比、浮柱、棒棒糖与哑铃、直方图、`waterfall` 瀑布）、折线与面积（区间带、`stackOffset` 流图）、`scatter` 散点与气泡（`color` 按值着色，配 `palette` 与色阶图例）、`candlestick` K 线、`boxplot` 箱线与小提琴；横竖两向，比例尺按数据推断，另可选 `sqrt` / `pow` / `symlog` 与时间轴 `timeZone`
- **新增** CartesianChart 读数辅助：数据标签 `labels`、堆叠合计 `totals`、线尾标签 `endLabel`；`annotations` 画参考线、参考带、极值与指定点标注、平均线、趋势线与移动平均；提示框缺省列出同一位置的全部系列，`tooltipOrder` 可按数值排序
- **新增** CartesianChart 缩放与刷选：`zoom` 支持 Ctrl / ⌘ 滚轮、拖动平移、双指捏合与 `+` / `−` 键，带缩略线缩放条，受控 `window` / `onWindowChange` 让多图联动；`brush` 用拖动或 Shift + 方向键刷选，`onBrushSelectionChange` 给出范围与框内数据
- **新增** CartesianChart 大数据与实时数据：`renderer` 取 `svg` / `canvas` / `auto`，`auto` 在标记超过 3000 个时数据层改用画布，键盘、读屏、主题、强制色与打印不受影响；`data` 可传 `createColumnStore` 建的列式数据仓，百万点经降采样仍流畅；多次追加合并到同一帧刷新，`follow` 让窗口随新数据右移；`xAxis.ordinal` 跳过休市，`yAxis.fit: 'window'` 按窗口内数据取值域，坐标轴 `minSize` 让上下叠放的图对齐
- **新增** PieChart 缺省为环形，中心显示合计并跟随激活的扇区，另有实心饼、`sweep="half"` 半环与 `rose` 玫瑰图，超过 `maxSlices` 的小扇区并为「其他」，`labelContent` 定制标签；FunnelChart 以 `conversion` 标出逐级或相对首级的转化率，可画成金字塔；RadarChart 比较 3–10 个 `indicators`，`rings` / `ringLabels` 调圈数并标值；SankeyChart 可横排或竖排，流带按 `linkColor` 取源色、目标色或渐变
- **新增** GraphChart 提供 `force`、`circular`、`tree`、`radial-tree`、`preset` 五种 `layout`，可拖动节点（`draggableNodes`）、给连线写 `label`，`zoom` 打开平移缩放，受控 `view` 让多图同步；HierarchyChart 提供矩形树图、旭日图、冰柱图与打包圆，点击或 Enter 逐层下钻（受控 `rootKey`），`colorBy="value"` 时每层一条色阶图例；Sparkline 提供折线、面积、柱与盈亏四种 `variant`，以及 `markers`、正常区间 `band` 与目标线 `reference`
- **新增** 图表共通能力：`pending` 且还没有数据时空态显示加载环与 `loadingText`，取完仍无数据才显示 `emptyText`；`animated`（缺省开）播放入场与更新过渡，数据更新与图例切换从原位插值，数值标签从旧值滚到新值，减弱动效下只保留淡变；受控 `hiddenSeries` / `activeKey` 让多图联动，`onDatumActive` / `onDatumPress` 报告悬停与按下的数据
- **新增** 图表无障碍：绘图区只占一个 Tab 位，方向键在数据之间移动，根内自动生成视觉隐藏的摘要与数据表；同一份表格模型以 `table` 交出（Vue 作用域插槽、React 函数式 children、Web Components 只读属性），可直接交给 Table 做可见的表格视图；数据或配置有误时经诊断通道报 `chart.*` 诊断码
- **新增** 图表配色与皮肤：`--xh-chart-*` 令牌提供亮暗两套分类色 1–8（经对比度与色弱区分度校验）、有序 / 顺序 / 发散色阶、涨跌色 `--xh-chart-rise` / `--xh-chart-fall`（缺省绿涨红跌，可覆盖）以及网格、轴线色与几何度量；强制色与打印下自动改用纹理与线型区分系列，祖先写 `data-xh-chart-patterns` 也可开启；图表共用部件的皮肤收为家族配方 `@xihan-ui/styles/chart.css`
- **新增** Heatmap 发散色阶 `scale="diverging"`（以 `midpoint` 为界）与按确切比例着色的 `continuous`；`onCellPress`（Web Components `cell-press`）报告点击或按 Enter 的格子；`animated` 入场时按日期顺序扫过填色，数据变化时各格渐变到新档；悬停时详情条所指的格子描边高亮
- **新增** GridList 网格列表：可选择的行、行主操作与独立的行内按钮，支持单选、多选（含 Shift 范围选）、方向键与连打检索，可与 Sortable 组合拖动排序，空态与加载态带加载环
- **新增** Citation 引用来源：行内引用编号、来源预览与来源列表，方向键导航并带完整的可及关系；`sources` 与 `@xihan-ui/chat-stream` 的 `SourcePart[]` 同形；预览缺省在正文内展开收起，`previewMode="hover"` 改为锚在编号旁的悬停卡片（`openDelay` / `closeDelay` / `placement` / `offset`），一处引用对应多个来源时写 `sourceIds` 在预览里轮换
- **新增** 子入口 `@xihan-ui/core/date`：Temporal 形的 `PlainDate` / `PlainTime` / `PlainDateTime` 与毫秒精度的 `ZonedDateTime`，提供公历加减、差值与取整，夏令时跳过或重复的时刻按 `disambiguation` 取舍；按地区划分的周（CLDR 48）、月 / 季 / 年边界与 ISO 周反查（`fromIsoWeek`）；IANA 时区的规范化与枚举；与时区无关的格式化器 `createDateFormatter`
- **新增** 动效令牌按角色补齐：几何时长 `--xh-motion-duration-move` / `-expand` / `-collapse`，整幅位移 `--xh-motion-travel` 与 `--xh-motion-travel-opacity`，数据动效 `-reveal` / `-morph`，表现性的 `-attention`、`--xh-motion-distance-lg`、`--xh-motion-ease-emphasis`，交互光 `--xh-motion-duration-glint`，呼吸 `--xh-motion-loop-breathe`，挤压下限 `--xh-motion-scale-squash`，以及弹簧预设 `--xh-motion-spring-<名>-stiffness` / `-damping`；`@xihan-ui/styles/motion.css` 新增共享关键帧 `xh-item-in`、`xh-drop-in`、`xh-sheet-in` / `-out`、`xh-slide-in` / `-out`、`xh-slide-fade-in` / `-out`、`xh-shimmer`、`xh-breathe`
- **新增** `@xihan-ui/motion` 与令牌同源：`readMotion(el)` 按元素读取实际生效的时长与缓动（组件槽覆盖、局部 `data-motion` 与系统偏好都已算进），`motionDurations` / `motionEasings` / `motionDistances` / `motionStaggerStep` 是读不到样式时的同值常量，`resolveMotionPreference` 接受元素；新增可中途改目标、承接松手速度的弹簧 `createSpringValue` 与手势松手工具 `rubberBand` / `rubberClamp` / `projectRelease` / `nearestSnap` / `glideSpring`；`@xihan-ui/pointer` 单指与多指会话的 `onEnd` 带出松手速度 `velocity`
- **新增** Core 行为原语：`trackArrivals`（新到的条目按顺序错开进场，首屏已有的直接呈现）、`trackListMotion`（接住条目的离场与换位）、`trackReorder`（宿主重排后补偿换位）、`trackAppearance`（首屏不播进场）、`glideBy` / `glideFrom`；`createFocusScope` 的返回值新增 `returnFocus()` / `reactivate()`，`PresenceHandle` 新增 `onReenter`；悬停意图的缺省时长导出为 `HOVER_INTENT_OPEN_DELAY` / `HOVER_INTENT_CLOSE_DELAY`
- **新增** 墨色域：彩色区块写 `data-xh-ink="dark"` / `"light"`，或配合 `--xh-ink-surface` 写 `"auto"` 按底色亮度自动选；域内的描边、分隔、淡底与交互阶梯取墨色按比例透明，正文、焦点环与主要动作取墨色本身，在黄、绿、橙等彩色底上描边的显著度保持一致；`data-xh-ink-margin="ample"` 让次要文字取墨色 72%。实心按钮、实心 Tag 与 Tooltip 里的快捷键、分隔和小徽标随之按所在底色取墨色
- **新增** 视觉环境第八轴 `material`（`standard` / `liquid`），经 `setPreference({ material: 'liquid' })`、`<xh-config material>` 或 Vue `provideXhConfig` 的 `initial.material` 设置，Portal 会带到浮层。liquid 档下导航层换成液态面（`--xh-material-liquid-*`，共享层 `@xihan-ui/styles/liquid.css`）：按下层深浅自动换色调与通透档（可用 `data-xh-backdrop` 声明下层）、按住时鼓出形变、同组块相近时粘连成片；覆盖 FloatButton 与展开组、BackTop、Layout 固定顶栏、Carousel 控制钮与分页、ImageViewer 工具条、MessageFeed 与 Log 的回到底部钮，实心 Button 与可交互 Card 悬停时描边扫过一道交互光，RadioGroup segmented、Tabs、Anchor、NavigationMenu 的指示器两沿由弹簧驱动。高对比、减少透明、强制色、打印与减弱动效下各有替代外观，standard 档外观不变
- **新增** 家族配方：`@xihan-ui/styles/material.css` 统一绘制 frosted 面（覆盖槽 `--xh-frosted-bg` / `-border` / `-fg` / `-shadow` / `-backdrop` / `-highlight`），12 个浮层与各浮动钮改由它提供材质与交互阶梯；`@xihan-ui/styles/loading-ring.css` 统一加载环画法，另有压在动作钮上、钮宽不变的一档；`@xihan-ui/styles/tag-list.css` 统一多选控件的已选标签行（只缩不涨、逐枚截断、+N 始终完整）；`@xihan-ui/styles/choice-card.css` 提供选择卡片；勾选标记配方让 Checkbox、CheckboxGroup、Transfer、Table、QuestionFlow 的勾与半选杠常驻并随状态淡变
- **新增** 方向与布局令牌：书写方向符号 `--xh-direction-sign`（ltr 为 `1`、rtl 为 `-1`）与行内起止缘 `--xh-direction-start` / `--xh-direction-end`，随就近的 `dir` 继承；侧栏宽 `--xh-sider-w`（15rem）/ `--xh-sider-collapsed-w`（4rem），Layout 与 SideNav 缺省读取；字段盒内输入框最小宽 `--xh-control-input-min-w`
- **新增** 虚拟滚动接入：Tree、Listbox、Select、Combobox、TreeSelect、Table、Log 新增 `virtualizer`，Transfer 新增按侧设置的 `virtualizers`，接入后只渲染窗口内的行，键盘、检索、选择与 ARIA 位置仍按完整集合计算；Virtualizer 新增随整页滚动（`scrollContainer: 'window'`）、贴底锚定（`anchor: 'end'`）与吸顶分组标题（`stickyIndices`），增删条目时视口不跳；InfiniteScroll 新增 `edge="start"` 向前加载；ScrollArea 新增 `scrollTo()` 与 `scroll-change` / `reach-end` 事件
- **新增** Collapsible、Accordion 与 Tabs 的 `lazyMount`（第一次展开或选中时才挂载内容）与 `unmountOnExit`（收起或选走后卸载），Web Components 把内容写在面板内的 `<template>` 里按需克隆
- **新增** Dialog 的 `draggable`（Web Components `panel-draggable`）：按住标题栏拖动面板，新增 `drag-trigger` 部件供键盘挪位与回中；Drawer 的 `resizable`：新增 `resize-trigger` 部件，拖动或用方向键调整面板厚度，范围由 `minPanelSize` / `maxPanelSize` 限定，支持受控 `panelSize`
- **新增** Tabs 与 Toolbar 的「更多」下拉：放一枚 `overflow-trigger` 部件，宽度不够时自动出现，Tabs 列出可见区外的标签，Toolbar 把放不下的条目收进菜单；Tabs 另新增 `close-trigger` 部件，指针与触屏也能关闭标签
- **新增** Menu、ContextMenu、Menubar 的选择型条目 CheckboxItem、RadioGroup、RadioItem（如 `XhMenuCheckboxItem`），支持受控 `checkboxValue` / `radioValue` 与逐条 `closeOnSelect`，缺省选中后不关闭菜单；ContextMenu 新增整张菜单的 `disabled`
- **新增** 导航：NavigationMenu 面板条目可再带一层子级（`NavigationMenuNode.children`，部件 `branch-trigger` / `branch-indicator` / `branch-content`）；Breadcrumb 新增 `ellipsis-trigger` 部件，折叠位可用键盘与读屏就地展开完整路径；Pagination 新增 `first-trigger` / `last-trigger` 部件与整组 `disabled`；SideNav 新增搜索过滤（`input` / `empty` 部件与 `filter`）与图标栏名称提示 `XhSideNavTooltip`；`XhBreadcrumbLink`、`XhNavigationMenuLink`、`XhSideNavLink` 支持 `asChild`，可直接借用路由链接渲染
- **新增** Tooltip 的接替窗口 `skipDelayDuration`（缺省 300ms，相邻提示直接接替），`XhTooltipProvider`（Web Components `<xh-tooltip-provider>`）把子树里的提示编成一组并提供组级延时缺省，`followCursor` 让提示跟随指针；Popover 新增 `disabled`；Tour 步骤的 `target` 可传元素或返回元素的函数，目标未挂载时等它出现，超过 `targetTimeout`（缺省 3000ms）仍未出现则该步居中呈现
- **新增** Alert 的 `banner`：页面顶部横幅，贴边铺满整行，只在朝向内容的一侧画描边；Notification 缺省的卡片预设也可用 `loading()` 与 `promise()` 以加载态弹出并随 Promise 落定改写；Notification 的叠放 `stacked` 由轻提示专有改为两种预设通用
- **新增** 日期与时间：CalendarPicker、CalendarRangePicker、DatePicker、DateRangePicker 新增 `firstDayOfWeek`；CalendarPicker、DatePicker 新增多选上限 `maxSelected`；CalendarRangePicker 新增 `activeIndex`；DateField 新增 `hourCycle`（12 小时制多出上下午段）；DateRangePicker 新增一体化时间 `showTime`，起止各一组时间列，由 `confirm-trigger` 收口；DatePicker 与 DateRangePicker 的时间列支持 `hourCycle`、按单位的 `timeStep` 与带上下文的 `isTimeUnavailable`，`min` / `max` 可以带时刻，同一天界外的时刻不可选
- **新增** 选择类：Combobox、TreeSelect、Cascader 多选时已选项排成标签（`tag-list` 部件与 `maxTagCount`），与 Select 一致；TreeSelect 新增浮层内搜索 `searchable`（`input` 部件与 `filter`）；Cascader 新增自定义匹配 `filter` 与懒加载分支（节点写 `hasChildren`，由 `loadChildren` 取子项，列末显示加载、失败与重试）；Transfer 新增分页 `pageSize`，全选与计数仍按整侧计算
- **新增** CheckboxGroup、RadioGroup 的卡片形态 `variant="card"` 与说明行部件 `item-description`；CheckboxGroup 新增选中数上下限 `min` / `max`；RadioGroup 新增 `variant="segmented"`、`loop`、`block` 与条目图标部件 `item-icon`
- **新增** Form 字段级接口 `dirty`、`isFieldDirty`、`isFieldTouched`、`resetField`，不提交的校验 `validateAll` / `validateField` / `validateFields`，规则可写 `deps` 联动重校；`onSubmit` 可返回 Promise，落定前表单处于忙态、不能重复提交，失败经 `onSubmitError` 报出；FieldArray 新增 `insert(index, item?)`，Web Components 补齐 `add`、`insert`、`removeItem`、`move` 等命令式方法
- **新增** FileUpload 的粘贴上传 `allowPaste`（缺省开）、准入判定 `validate`、并发上限 `maxConcurrentUploads`（超出的排队，状态 `queued`）与保留文件的 `cancelUpload`（状态 `canceled`）；TagsInput 新增准入判定 `validate` 与拒收事件 `onTagReject`，`delimiter` 可传一组断词符
- **新增** Slider 的反向 `inverted`、整段拖动 `draggableRange` 与 `trackFill`；NumberField 长按加减逐步加速（下限 `minChangeInterval`），新增 `clampValueOnBlur` 与越界状态 `outOfRange`；Switch 的滑块可以横向拖动切换
- **新增** 颜色：ColorPicker、ColorField、ColorSlider 支持 `oklch` 值串（`format="oklch"`）；ColorPicker 输入盒接入字段外壳并新增 `variant`（`outline` / `subtle` / `ghost`）；ColorPicker 新增常驻形态 `inline`（取色面直接铺在页面里）与最近使用色（`recentColors` / `defaultRecentColors` / `maxRecentColors`、`onRecentColorsChange`，部件 `recent-swatch-picker`）
- **新增** Mention 支持多行正文（`input` 部件写 `as="textarea"`），插入的引用按整体删除，新增 `mentions`；ImageCropper 新增水平 / 垂直翻转（`flip`、`flip-trigger` 部件）与按所见出图的 `toCanvas()`；SignaturePad 新增签名数据 `value` / `defaultValue` / `onValueChange`，可无损回显并续写，另有撤销 / 重做部件 `undo-trigger` / `redo-trigger`
- **新增** Table 的单元格合并 `cellSpan`、列定义 `children` 表头分组、树形表级联勾选 `cascade` 与 `checkedStrategy`；冻结列不再要求数字宽度，横向滚动压住内容时冻结列边缘出现描边提示；Tree 新增尺寸档 `size`、缩进参考线 `lines` 与节点级加载态 `loadingValue`
- **新增** Steps 的点状形态 `variant="dot"`、当前步进度环 `percent` 与只读展示 `readOnly`；Progress 在 `semantics="meter"` 下支持 `thresholds` 分段色带、`target` 目标刻度、`scale` 量程刻度与 `indicator="needle"` 指针（仪表盘、子弹图），线形新增 `steps` 分格、`striped` 条纹与 `buffer` 缓冲段
- **新增** Carousel 的 `effect="fade"` 淡变换页，滚出可视区或页面转入后台时自动播放暂停（`pausedBy` 新增 `visibility`）；Sortable 跨列表拖放：写同一 `group`（各列表另写 `listId`）的列表之间可用指针或键盘搬移条目，落进别的列表时触发 `transfer`
- **新增** Card 的整卡可点形态 `interactive`（新部件 `trigger` 承载链接或按钮）；Descriptions 新增 `header` / `title` / `extra`；Flex 的 `orientation` / `align` / `justify` / `gap` 接受断点对象；Grid 格子新增跨行 `rowSpan`
- **新增** 通用与展示：Icon 新增圆形底框 `frame`（`solid` / `subtle` / `outline` / `ghost`，覆盖槽 `--xh-icon-frame-*`）；Typography 新增渐变字 `variant="gradient"` 与行内 `strikethrough` / `underline` / `mark`；Truncate 新增中间省略 `position="middle"` 与展开按钮文案 `translations`；Spinner 新增 `delay`，等够时长才露面；Badge 新增呼吸圆点 `pulse` 与偏移槽 `--xh-badge-offset-inline` / `--xh-badge-offset-block`；Marquee 新增暂停开关部件 `autoplay-trigger`、`defaultPaused` / `onPausedChange` 与两端渐隐 `fade`；NumberAnimation 新增 `locale` 与 `formatOptions`（货币、百分比、单位、紧凑记数）；JsonViewer 新增 `search`，高亮命中并逐个跳转
- **新增** Timestamp 的 `timeZone`（按 IANA 时区的墙钟显示）、`refreshInterval` 与 `translations`（含 `justNow`），相对型自动刷新，页面隐藏或离开视口时暂停；Watermark 新增 `fullscreen`（固定铺满视口、压在模态之上，层号经 `--xh-watermark-layer` 覆盖），`image` 也接受 http(s)、`blob:` 与相对地址，删掉或改写水印节点会被原位放回
- **新增** `@xihan-ui/chat-stream` 的会话改为消息树：`ThreadStore` 新增 `regenerate`、`retry`、`edit`、`continue`、`selectBranch` 与 `getTree`，`submit` 可带文件与数据 parts，`UIMessage` 新增 `parentId` 与 `status`，`createThreadStore` 可经 `messages` 恢复会话；`stop()` 当场收尾并把这一轮记为 `aborted`
- **新增** 流式 Markdown：`@xihan-ui/markdown` 渲染任务列表与脚注，裸地址自动成链（`bareLinks`，缺省开），仍在生长的末块不再露出没闭合的强调、行内代码与链接符号；行内引用 `[@来源]` 与公式 `$…$` 渲成占位节点，MarkdownStream 经 Vue 的 `citation` / `math` 插槽、React 的 `renderCitation` / `renderMath`、Web Components 的 `inline-mount` 事件把引用角标（可直接接 Citation）与公式产物放进去
- **新增** 代码与日志：CodeView 按缩进折叠语法块（`blockFolding`、`folded` / `defaultFolded`，部件 `line-fold-trigger`）；DiffView 支持行评论（`commentable` 给每行一颗评论钮并发出 `comment-request`，`commentLines` 在指定行下铺出 `comment-thread`）；Log 支持 ANSI 着色（行上写 `ansi`）与按级别过滤 `levels`
- **新增** AI 对话：MessageFeed 新增日期分隔 `separator`、回到底部钮上的未读数 `unread-count` 与等待首个片段时的呼吸点 `pending-indicator`；Approval 新增 `requireReason`（拒绝必须写理由）与待决呼吸点 `pending-indicator`；QuestionFlow 的选项与题目可写 `description`，多选题新增 `minSelections` / `maxSelections`；Reasoning 给了 `startTime` 时思考中显示已用秒数

- **修复** 浮层关闭那一刻就把焦点交回触发器（Dialog、Drawer、Popover、Popconfirm、Command、Tour、ImageViewer、Select 等），退场动画期间焦点不再落到 `body`；退场中途重新打开时从当前透明度接着淡入，焦点按这一次的初始焦点落位；Accordion、Collapsible、Reasoning、ToolCall 展开或收起到一半反向时从当前开合程度接着走
- **修复** 动效作用域：系统开启减弱动效时，写了 `data-motion="default"` 的子树恢复完整 CSS 动效；`animate()`、`@xihan-ui/animations` 预设、`@xihan-ui/backgrounds` 与贴底滚动按宿主所在的 `data-motion` 作用域判断；`@xihan-ui/animations` 的 `bounce` 预设不再因逐帧缓动的写法被浏览器整段拒绝；`data-transparency="reduce"` 在嵌套的局部主题里不再失效；高对比档下关闭叉、箭头、对号、单选点等皮肤字形不再消失
- **修复** 书写方向：RTL 下行内居中的元素（居中的轻提示堆叠、Carousel 分页、ImageViewer 工具条、Slider 刻度与值气泡等）不再偏出；Switch 滑块、Tree 与 TreeSelect 分支箭头、Rating 星形、ColorSlider 与 Slider 值气泡、PasswordInput 强度条、SideNav 分支箭头改按就近的 `dir` 换向，RTL 页面里局部写回 `ltr` 时不再错位；Popover、HoverCard、Popconfirm 的缩放原点在较旧的浏览器里也按书写方向取对；Tabs 整页 RTL 而未传 `dir` 时指示条不再落错
- **修复** LoadingBar、Carousel、NumberAnimation 的 id 在服务端渲染与水合两侧一致；Web Components 连接之后才赋的 `defaultValue`、`defaultOpen` 等初值不再被忽略；TagGroup 放行输入法组合，按住 Enter / Space 只切换一次，点标签里的链接或按钮不再改变选中；按钮类触发器换面时字色与底色同步淡变；列表浮层的 1px 顶光不再随列表滚走；CheckboxGroup 勾中色与 Checkbox 一致，Table 禁用且勾中的勾选框显示置灰的勾
- **修复** 日期族不再依赖浏览器的周数据：同一个 locale 在各浏览器里排出同一张月历（此前少数地区的周首日因浏览器而异）；SideNav 分组改为合法的列表结构，读屏能念出列表项数与分组（需补 `group-list`，见升级须知）；分段形态（原 Segmented）的滑块在祖先带缩放（如对话框进场）时不再缩小偏位
- **修复** ImageViewer 取图失败时画面正中显示警示字形（此前没有任何表现），禁用的翻页、缩放钮改为换前景色；LoadingBar 改长淡出时长时，条子不再在淡出途中先缩回；Marquee 的 `speed` 改按实测内容长度换算，不再随容器宽度偏快或偏慢；纵向 Carousel 拖拽不再取错坐标轴；空 Tree 或随后才由脚本填充条目时，Web Components 不再误报 `wc.missing-part`；Sortable 落点线在强制颜色模式下不再消失；Heatmap 的 `thresholds` 含重复值或非有限值时不再多出空档，改为剔除并报 `chart.invalid-range`
- **修复** Anchor 点目录项平滑滚动途中，高亮不再被途经区块冲掉，改为锁到滚动停稳；Tour 收起时气泡与高亮框不再滑向视口左上角；同页多个 SideNav 的折叠态悬停弹出不再互相撤销等待；Toolbar 里的菜单触发器用上下键展开时工具条不再同时走位；Web Components 的 Breadcrumb `max-items` 恢复生效；Pagination 省略位浮层的非法延时不再被当作 0，改为报 `INVALID_DELAY`
- **修复** Layout 侧栏里放 SideNav 时导航右缘不再被裁掉；Pagination 每页条数下拉不再占满 16rem，改为按内容定宽；Command 面板进场的位移与缩放方向改正；Notification 轻提示预设的行首缺省字形改为按语气区分（此前四种语气都画成信息字形）；Toolbar 分组内相接的分段按下时不再缩放撕开接缝；Tabs 竖排限高时标签不再被压扁；PageHeader 在视口恰为 640px 时与其余组件同档换排布
- **修复** ImageCropper 出图不再忽略旋转与圆形外形，改为按所见导出，方向键跟随屏幕方向；TextField 的字数与 `maxLength` 改按字素计，组合 emoji、国旗各算一个字；Transfer 与 Virtualizer 组合时列表铺满面板、自绘滚动条跟随虚拟视口；DatePicker 手机档样式在 Safari 16.2 / 16.3 恢复生效；Slider、ColorSlider 的值气泡拖动时不再随拇指放大
- **修复** CodeView 的 `filename` 部件留空时显示根上的 `filename`；DiffView 没写头部时以文件路径为可及名；`parseUnifiedPatch` 不再把 `git diff` 末尾的换行多算成一行；React 的 MarkdownStream 重渲时不再冲掉选区；`@xihan-ui/chat-stream` 的传输在取消时抛错，不再把已停止的一轮记成 `error`

- **优化** 初始内容不播进场：挂载时已打开、已展开或已存在的内容直接呈现，之后的变化照常播动画。覆盖 Dialog、Drawer、Popover、Popconfirm、Tooltip、HoverCard、Menu、ContextMenu、Menubar、NavigationMenu、Command、FloatingPanel、FloatButton、Tour、ImageViewer，Select、Combobox、TreeSelect、Cascader、ColorPicker 与四个日期 / 时间选择器，Accordion、Collapsible、ToolCall、Reasoning，Layout 侧栏、Steps、TagGroup、Badge、EmptyState，以及 MessageFeed 首屏的历史消息与其中的 ToolCall、Approval、QuestionFlow 卡片
- **优化** 到达与换位：Command、Notification、MessageFeed 新到的条目按到达先后错开进场，Command 过滤后重新露出的结果不重播；TagsInput 标签、FieldArray 行、Select 多选标签、TagGroup、FileUpload 文件列表与 Notification 卡片增删时带进退场，其余项滑到新位置；Sortable、Table、Tree、Tabs 放下或换位后条目从原处滑到新位置，Sortable 带松手速度弹簧落位，键盘重排逐格滑动
- **优化** 进退场补齐：Badge 计数出现与清零原地弹出、缩小淡出；Skeleton 加载完后盖在真实内容上淡出；Avatar、Image 占位与图片交叉淡变，Avatar 新增 `fallbackDelay`（缺省 300ms），缓存命中时不再闪一下首字母；Alert 关闭先淡出再收起占位；BackTop、Tag、FloatButton 展开列表、MessageFeed 与 Log 的回到底部钮都在退场播完后才隐藏，FloatButton 触发器展开后「+」转成「×」；Form 错误摘要与字段错误文案淡入淡出，下方内容不再跳动；FileUpload 传完时进度条走满后淡出
- **优化** 加载与占位态：Button、Clipboard、DownloadTrigger、Popconfirm 确认钮在途时加载环居中压在钮上、钮宽不变，短请求不闪；Switch、Notification、Approval 在途改用同一副加载环，Notification 落定时与语气字形交叉淡变；Table、Tree、Cascader、Select、Combobox、Listbox、Mention、Transfer、TreeSelect、Command、GridList 首次加载显示加载环，已有内容时后台刷新保留上一帧并淡化；ImageViewer 取图时画面正中转一枚加载环；Spinner 三点档改为依次亮起
- **优化** 位置与尺寸过渡：Tabs、Anchor、NavigationMenu 与 RadioGroup segmented 的指示器只在换项时滑动，首次落位、窗口缩放与字体加载时直接到位；NavigationMenu 两张面板间切换改为瞬时；FloatingPanel 进出最大化、SideNav 折叠展开、Splitter 折叠、Tour 换步、Steps 推进平滑过渡；Progress、LoadingBar、FileUpload 的填充改为平移，进度变化不再重排；Popover、Popconfirm、HoverCard 在 `*-start` / `*-end` 对齐时从锚点一端涨开；Pagination 页码面板从省略位一侧滑入
- **优化** 手势与细节：ImageViewer 平移限定在图片范围内，拖出范围有阻尼、快甩有惯性，换图时新图直接淡入；Carousel 拖拽松手按速度判定翻页并由弹簧落位，首末页往外拖有阻尼，`loop` 回绕沿原方向接续；四个日期 / 时间选择器打开时时间列直接停在选中格；Cascader 悬停换列时不再反复重播进场；PromptInput 发送与停止的字形切换改为淡变；PasswordInput 强度条平滑增长，单选圆点缩放落位，DateField 当前段反白淡变，CalendarRangePicker 挑到一半时预览改为中性淡底

- **调整** 减弱动效改为去掉位移、保留淡变：换色与淡入淡出保留 120ms，位移、缩放与尺寸变化仍瞬时完成；Drawer、轻提示与 Layout 覆盖档侧栏在减弱档改为淡入淡出，浮层退场先淡出再卸载。几何过渡改取专属时长：展开箭头随正文开合同步，集合行与树行的底色过渡改为 `micro`，字段焦点环即时出现，行尾对号与勾选标记改为淡变（见升级须知）
- **调整** 缺省主题的描边与淡底改为半透明墨色，落在作者自己的彩色区块上会成为该底色的深浅变体；Table 吸顶表头与冻结列等要盖住下层的面改用不透明档（见升级须知）
- **调整** 浮层定宽：Select、Combobox、TreeSelect 的候选面板与字段盒等宽，Select、TreeSelect 的浮层锚在字段盒上；Cascader 归为面板型浮层，按内容定宽、改用实体的 floating 面；NavigationMenu 面板按内容自然宽度排开，超过 `--xh-navigation-menu-content-max-w` 才折行
- **调整** 面板内的搜索框统一：Command、Cascader、Transfer、TreeSelect 的内嵌搜索框改为通栏一行，高度与字号随尺寸档，只画一道面内分隔线，聚焦时不画焦点环，占位文字与其余字段同色
- **调整** 尺寸与排版统一：TimePicker、TimeRangePicker、DatePicker、DateRangePicker 的时间格随尺寸档定高与字号（此前固定 28px）；Steps 序号圆点随密度换档；InputGroup 未设尺寸时整组与单个字段同宽；TagsInput 计数改为 12px 说明字号；Menu、ContextMenu、Menubar 的条目说明改用控件次级字号；Alert、Notification 的指示符到正文统一为 12px；ImageViewer 关闭钮改为 40px 圆形；ToolCall、Approval、QuestionFlow 的状态标签统一语气色，与 Tag sm 等高；ToolCall 触发条改用标签字重
- **调整** 动作与面：FileUpload 的三颗按钮改用 Action Control 家族，悬停 / 按下降一档、不再抬影；outline 动作钮的禁用描边改取 `--xh-border-default`；Pagination 跳页框改用字段外观；ColorPicker 输入盒与 Select 等下拉选择同一副字段外壳；Table 表头下沿与表尾上沿改为内部分隔色（新增 `--xh-table-header-border` / `--xh-table-footer-border`）；Tree 落点线改为品牌色；Carousel 轨道、ImageViewer 图片、Sortable 条目的位移改写独立的 `translate` / `rotate` / `scale`，样式里写的 `transform` 改为与之叠加
- **调整** SideNav 宽度改读 `--xh-sider-w` / `--xh-sider-collapsed-w`，与 Layout 侧栏同宽，当前项不再加粗；Reasoning 缺省改为 `outline`、`md`，Reasoning 与 ToolCall 内距与 Accordion 同档；CodeView、DiffView 缺省字号改为 md 档，CodeView 高亮行改为中性淡底加行首强调条，Log 行高改为 1.5rem（见升级须知）
- **调整** 缺省值改按语言推断：DatePicker 的 `showTime` 小时制按 `locale` 推断；NumberAnimation 与 Timestamp 的输出改由 `Intl` 按语言生成；NumberAnimation 缺省节奏改按数值角色取动效令牌（见升级须知）
- **调整** Heatmap 并入图表家族：`palette` 扩为基础色板的十二个色相加 `gray`；详情条改为与其他图表一致的 frosted 提示框；缺省播放填色动画，数据含负数时缺省按发散色阶（见升级须知）
- **调整** 文档站新增「图表」分类，Heatmap 移入；组件总览改用 SVG 示意图；动效规范页按角色、令牌与编排规则重写；自定义元素版示例的模块脚本改由 Vite 编译，示例里可以直接 import 包

- **移除** Toast、Segmented、IconWrapper、GradientText 四个组件，分别并入 Notification、RadioGroup、Icon、Typography（见升级须知）
- **移除** 对 `@internationalized/date` 的依赖（连带 `@swc/helpers`），库包不再有运行时第三方依赖

## v2.1.0 (2026-09-24)

本版补齐集合类组件的条目契约：逐条语气、说明、快捷键与首尾两格的逐条钩子，菜单的 `collection` 可以直接铺出分组；选中标记统一为行尾对号。本版包含少量破坏性变更（Tree、Listbox、TagGroup 的选中外观与相关部件、槽名），按次版本发布，升级前请看下方升级须知。

::: warning 升级须知
**Tree**

- `expandOnClick` 缺省由 `true` 改为 `false`，与 TreeSelect 一致：点行与确认键只选中，展开交给展开箭头（`branch-trigger`）与左右方向键。需要「点目录即展开」的，显式打开 `expandOnClick`（Web Components 写 `expand-on-click`）；分支行只放了不可点的 `branch-indicator` 的树，缺省下只能用方向键展开，请在分支行补一枚 `branch-trigger`
- 勾选框部件删除：`item-checkbox` / `branch-checkbox`，三端的 `XhTreeItemCheckbox` / `XhTreeBranchCheckbox`（React 另有 `XhTreeItemCheckboxProps` / `XhTreeBranchCheckboxProps`），以及 connect 上的 `getItemCheckboxProps` / `getBranchCheckboxProps`。单选、多选与级联都改为在行尾画对号：把勾选框换成 `XhTreeItemIndicator`，分支行同样放一枚；Web Components 把 `data-xh-part="item-checkbox"` / `"branch-checkbox"` 换成 `data-xh-part="item-indicator"`
- 删除组件槽 `--xh-tree-checkbox-*`（8 个）与 `--xh-tree-row-bg-selected`；行的 `data-xh-collection-context` 由 `page` 改为 `overlay`

**Listbox**

- 选中行不再铺品牌淡底、不换字色，只在行尾亮对号；删除组件槽 `--xh-listbox-item-bg-selected`，`--xh-listbox-item-fg-selected` 保留但缺省回到条目自己的字色；条目的 `data-xh-collection-context` 由 `page` 改为 `overlay`

**TagGroup**

- 选中的标签不再换面、换字色与描边，只在文字后亮一枚对号；删除组件槽 `--xh-tag-group-item-bg-selected`、`--xh-tag-group-item-bg-selected-hover`、`--xh-tag-group-item-bg-selected-pressed`、`--xh-tag-group-item-fg-selected`、`--xh-tag-group-item-border-selected`；实心标签选中时不再描出字色描边

**Menu**

- 由 `collection` 代铺的条目，文字从 `item` 里的裸文本改放进 `item-text`（与 ContextMenu、Menubar 一致）。直接对条目文本节点写样式的自定义皮肤，请改为选中 `item-text`
:::

- **新增** 集合条目逐条语气：条目数据写 `tone`（`MenuNode` 与另外十二个集合组件的节点）即按该语气族着色，静息只换字色，悬停、键盘高亮与按下换语气淡底；选中与当前压过语气，禁用压过一切，强制颜色模式下退回系统色
- **新增** 条目说明与快捷键：`MenuNode` 补上 `indicator` / `description` / `shortcut`，Menu 新增 `item-shortcut` 部件；ContextMenu、Menubar 补上 `item-shortcut` 与 `shortcut`；另外九个集合组件补上 `item-description` 与 `description`；Command 补上快捷键提示。快捷键以次级字号显示且不换行，不进入读屏可及名与连打检索
- **新增** 首尾两格的逐条钩子：Menu、ContextMenu、Menubar 新增 `item-suffix` 部件与 `item-prefix` / `item-suffix` 插槽（React 为 `renderItemPrefix` / `renderItemSuffix`），给条目加图标或徽标不必再用 `item` 插槽整条重写；Listbox、Select、Combobox、Mention、Command 补上 `item-prefix` / `item-suffix`；Tree、TreeSelect、Cascader、Transfer 补上行尾一格
- **新增** `MenuNode` 的 `group` 与 `groupLabel`：`collection` 按相邻同值收成分组并输出分组标题
- **新增** 组件文档补充「React 适配器 props」表与条目数据表，插槽表写明 `item` / `item-prefix` / `item-suffix` 的分工

- **修复** 浮层打开后不再常驻 `will-change`：此前入场动画中途的栅格会被沿用，动画结束后文字与 1px 分隔线仍然发虚；浮层文字也与页面其余文字一样使用亚像素抗锯齿
- **修复** Vue 的 `XhKbd` 在平台探测之后不再丢失全局配置

- **优化** 三端状态机读取 props 不再按 prop 个数重复展开：Vue 200 个按钮的挂载由 29.5ms 降至 16.0ms，Web Components 100 个分页的挂载约由 112ms 降至 24ms
- **优化** Portal 视觉桥不再按「浮层数 × 自定义属性数」重读计算样式；焦点域的 Tab 判定不再按「候选数 × 容器层数」查询计算样式

- **调整** 选中标记统一为行尾对号：Collection Item 家族 page 语境的对号从行首移到行尾，与浮层内的列表同列；Listbox、Tree、TagGroup 的选中外观随之统一（见升级须知）

## v2.0.0 (2026-09-22)

本版为主版本升级。主要变化：`@xihan-ui/kernel`、`@xihan-ui/machine`、`@xihan-ui/behavior` 合并为 `@xihan-ui/core`；新增 React 19 适配器 `@xihan-ui/react`；组件由 121 个增至 134 个（新增 20 个，删除 3 个，合并 4 个，更名 5 个）。所有更名与删除均不保留别名、转发或兼容层，引用旧名会直接报错。

::: warning 升级须知
以下按包、组件、部件与属性、行为四类列出破坏性变更的范围与去向。完整对照表（旧名 → 新名，逐部件、逐槽名）见各包随 npm 发布的 `CHANGELOG.md`。

**包与依赖**

- `@xihan-ui/kernel`、`@xihan-ui/machine`、`@xihan-ui/behavior` 合并为 `@xihan-ui/core`，旧包不再发布，无转发包。导出名称不变，子入口按原名平移：`kernel/metadata` → `core/metadata`、`kernel/skin-check` → `core/skin-check`、`kernel/vite` → `core/vite`、`machine/vanilla` → `core/vanilla`、`behavior/presence` → `core/presence`。诊断 `core.version-mismatch` 的 `detail.kernelVersion` 更名为 `coreVersion`。仅安装适配器的项目无需改动
- `@xihan-ui/code-highlight` 由适配器的直接依赖改为可选 peer 依赖，使用代码着色的项目需自行安装；包由 `engine` 组移至 `features` 组，包名不变
- 新增 `@xihan-ui/react`。公开包由 18 个变为 17 个

**组件的增删与更名**

- 删除 `thread`、`composer`、`code-block`，分别由 `message-feed`（配合 `log`）、`prompt-input`、`code-view` 替代
- `result` 并入 `empty-state`（`live` 默认为 `polite`，默认尺寸档比原来小一号；保持原样需写 `live="off"` 与 `size="lg"`）；`space` 并入 `flex`（`XhSpace` 未写 `gap` 时默认有间距，`XhFlex` 默认为 0，迁移时需显式写 `gap="md"`）；`countdown` 并入 `timer`；`popselect` 退役，随表单提交的场景改用 `select`，仅切换视图参数的场景改用 `popover` 组合 `listbox`
- 更名：`ellipsis` → `truncate`、`dynamic-input` → `field-array`、`time` → `timestamp`、`qr-code` → `matrix-code`（新增 `format` 选择码制）、`calendar` → `calendar-picker`（区间选择拆为新组件 `calendar-range-picker`；`date-picker` 只保留单选与多选，区间改用新组件 `date-range-picker`）
- `color-picker` 重组为组合组件：色相与透明度滑块为内嵌的 `color-slider`，预设色板为内嵌的 `color-swatch-picker`；非法或越界的文本输入不再静默复原，改为保留状态并抛出错误
- `select`、`tags-input`、`tag-group` 的标签统一改用 `tag` 组件渲染：`item-delete-trigger`、`item-preview`、`item-text` 不再是这三个组件的部件，对应节点为 `tag` 的 `root` / `label` / `close-trigger`；`select` 多选未指定 `maxTagCount` 时最多显示 3 枚标签，其余折叠为 `+N`

**部件、属性与槽名**

- 32 个部件更名、1 个部件并入他处；10 处同一角色在不同组件中命名不一致的部件统一命名
- 14 组 prop 更名、2 组事件更名。例如 `resizable` / `floating-panel` 的像素尺寸 `size` 更名为 `dimensions`；`password-input` 的 `visible` / `defaultVisible` / `onVisibilityChange` 更名为 `revealed` / `defaultRevealed` / `onRevealedChange`；`virtualizer` 的 `onChange` 更名为 `onRangeChange`
- 13 个 `data-*` 属性名删除，每组只保留一个（如 `data-affixed` → `data-fixed`；`data-borderless` → `data-bordered`，取值反转）；`data-type` 拆分为 `data-value-type`、`data-severity`、`data-select-mode`、`data-reveal-mode`、`data-format`；`data-phase` 与六个组件的生命周期 `data-status` 并入 `data-state`；`table` 的 `expanded-row`、`tree` 的 `branch-content`、`heatmap` 的 `tooltip` 收起态由 `hidden` 属性改为 `data-state`。CSS 选择器不会因属性名失配而报错，请在代码库中检索旧属性名
- `dialog` / `drawer` 新增 `header` / `body` / `footer` 三个部件，`body` 为面板内唯一的滚动区域；文本输入的两套控件盒槽名合并为一套，被替代的槽名删除
- 形态轴收敛：字段类组件未传 `variant` 时显式输出 `data-variant="outline"`，自定义皮肤若以「无 `data-variant`」判定默认态，需改为匹配 `outline`；`button` / `float-button` 移除 `shape`；`loading-bar` 移除 `color`；`card` 收敛为 `default` / `secondary` / `tertiary` / `transparent` 四种表面，移除 `size` / `hoverable` / `split` 属性与 `media` / `body` 部件
- 轻提示与通知的 `type` 更名为 `tone`，取值收敛为 `info | success | warning | danger`，加载态独立为布尔 `loading`；通知队列 `max` 默认值由不限改为 5；`toast` / `alert` 的 `content` 改为必需；`empty-state` 的 `status` 只接受 `'404' | '403' | '500'`，语义改由 `tone` 表达；`steps` 的 `StepStatus` 收敛为 `completed | current | incomplete`，出错与警示改由逐步 `tones` 表达
- 读屏文案只接受函数，不再接受字符串；`flex` 的 `direction` 别名与 `FlexDirection` 类型删除，只保留 `orientation`；`listbox` 的 `multiple` 删除，只保留 `selectionMode`；`kbd` 的单键与组合键统一为 `keys` 数组，默认仅展示，显式 `register` 后才注册监听；`grid` 的 `cols` / `span` / `offset` 增加运行时取值范围校验

**行为**

- 部件上同名事件处理器的执行顺序统一为「使用者的处理器先执行，部件的处理器后执行」；此前是否使用 `asChild` 会导致顺序相反。依赖部件先更新状态再读取的代码需改为微任务或变更回调
- `pin-input` 改为按顺序录入，焦点落在第一个空格；`mention` 的输入框改为单行；`number-field` 的 `control` 部件改为必需
- `combobox`、`tree-select`、`cascader`、`transfer` 的原生表单提交改为每个选中值一个同名隐藏字段，不再以逗号拼接；`cascader` 的 `value` 对非数组、混合类型、空路径一律拒绝
- `FieldControl` 与 `asChild` 的组合宿主改为严格检查：Fragment 内唯一控件正常接线，零个或多个节点、非空文本混排时抛出错误，不再降级生成默认按钮
- `@xihan-ui/motion` 删除 `TweenEasing`、`tweenEasings`、`resolveTweenEasing`，统一使用 `EasingName`、`easing`、`resolveEasing`
- 三端 `XhConfig.motion` 的隐式全局覆盖移除，视觉环境统一由 `createVisualEnvironmentController` 管理；表单字段标识统一为 `FormPath`，`XhFormFieldGroup` 的 `value` 更名为 `name`
:::

- **新增** `@xihan-ui/react`：React 19 适配器，覆盖全部 134 个组件。组件名与 Vue 侧一致（`Xh*`），受控 / 非受控与变更载荷为同一份合同，带载荷的插槽以函数式 children 提供，无需安装 provider
- **新增** 20 个组件。数据录入：`calendar-range-picker`、`date-range-picker`、`time-range-picker`、`color-field`、`color-slider`、`color-swatch-picker`、`input-group`、`tag-group`；数据展示：`bar-code`（一维码，七种码制）、`color-swatch`；浮层：`command`（命令面板）；AI 对话：`approval`（危险动作执行前的人工确认）、`code-view`、`diff-view`（单栏与并排）、`markdown-stream`、`message-feed`、`prompt-input`、`question-flow`（执行前的澄清问卷）、`reasoning`、`tool-call`
- **新增** 七轴视觉环境 `createVisualEnvironmentController`：色彩模式、品牌、密度、书写方向、对比度、动效、透明材质统一解析、继承、持久化并投影到根元素，局部作用域只影响自身子树；Portal 按实例桥接来源处的局部视觉环境
- **新增** 按压通道：Space / Enter 与触屏按住时输出 `data-pressed`，与指针 `:active` 共用同一套按压样式，覆盖全库可按下的部件
- **新增** 浮层退场生命周期由 Presence 租约管理：逻辑关闭后 `content` 立即设为 `inert` 并退出可访问树，Layer、消解层与焦点域在退场动画结束后释放；`dialog` / `drawer` 新增 `onExitComplete`
- **新增** 集合类组件补齐三种非条目状态：`empty`、`loading`、`load-more-trigger`；`tree-select` 新增懒加载分支合同（`hasChildren`、`loadChildren({ node, signal })`）及 loading / error / retry / loaded-empty 状态结构
- **新增** `tabs` 标签溢出时不再折行，改为沿主轴滚动：新增 `prev-trigger` / `next-trigger`，支持滚轮、焦点跟随与触屏拖动；segment 档的指示条改为滑动式
- **新增** `layout` 的 `siderPresentation`（`inline` / `sheet`），`sheet` 档下侧栏以覆盖方式展开
- **新增** `dialog` / `drawer` / `image-viewer` 的遮罩形态轴 `variant`；`scroll-area` 的边缘渐隐与到头状态；`scrollbar` 的 `anchor`
- **新增** 浮层类与选择类组件的 Portal 部件支持实例级 `container`
- **新增** 命令式对话框服务的 `actionError` / `onActionError({ cause })` 与可本地化的 `actionErrorText`；`popconfirm` 的 `onConfirm` 支持返回 `PromiseLike`；`form` 新增 `validationError` 状态与校验异常事件，字段状态轴接入 `text-field` 控件
- **新增** Web Components 侧补齐四个命令式反馈服务；轻提示与通知的队列合并为一套
- **新增** `@xihan-ui/tokens` 十二色相基础色板；`matrix-code` 新增 `data-matrix`、`gs1`、`pdf417`、`aztec` 码制；`tag` 新增 `ghost` 形态与 `readOnly`；`form` 的 `layout` 新增 `grid` 档
- **新增** `cascader`、`transfer` 支持 `name` / `form` 原生表单提交，含禁用排除与原生重置
- **新增** `RenderedBlock.source`：代码块与公式块在已消毒的 `html` 之外提供未转义的原文

- **修复** 四个浮层以指针打开后关闭时，焦点未按键盘规格返回触发器
- **修复** 皮肤自绘的状态字形（勾选、半选、分支箭头）统一按指示符档取尺，compact 密度下与标记盒尺寸不一致的问题：select、combobox、listbox、cascader、menubar、context-menu、steps、file-upload 等
- **修复** 几何类过渡按角色选择曲线档；集合条目的描边色不再参与过渡，切换标签页时不再闪烁
- **修复** 补齐 11 处缺失的读屏文案；补齐两个适配器未暴露的 headless 能力（七个浮层的 `dir`、五个元素的 `translations`、分页省略位浮层的四项）
- **修复** Vue `date-picker` 挂载在 iframe 或其他 Document 时的运行时归属；`trackHoverIntent` 固定使用触发器所属的 Document
- **修复** `pin-input` 受控模式下输入一位跳过一格；`tags-input` 就地编辑框宽度随内容变化，不再按原生 input 的 20 字符宽度展开；`carousel` 在减弱动效档下不再自动播放
- **修复** 粗指针热区平移在 RTL 下行内方向反向，热区中心偏离宿主

- **调整** 带边框的控件盒统一为浅边框不填底，与浮层面板、卡片使用同一条边线；字段类组件未传尺寸时统一宽度为 16rem
- **调整** 侧栏导航当前项去掉起始侧 2px 竖线，只保留品牌淡底与字色；标签页 line / card 档的标签宽度随文字；导航菜单与锚点目录中指向当前页的链接绘制静态指示线
- **调整** `toggle-group` 默认外观改为浅色胶囊分段控件，选中项使用品牌淡底；`kbd` 收敛为固定 24px 键帽，新增 `default` / `light` 两种外观；徽标 sm 档收为 14px
- **调整** 菜单类组件接入集合条目配方：条目按压面由 300 改为 200，展开中的触发器改为中性面，浮层滚动条走 4px 档并增加 overscroll 隔离

## v1.1.0 (2026-08-31)

- **新增** `sortable` 组件：列表 / 网格拖拽排序，拖动中其余条目实时让位，`sort` 事件直接给出重排好的 `ids`，键盘路径默认开着
- **新增** `resizable` 组件：八条边都能推的可调容器，带上下限、宽高比与吸附步进，指针与键盘两条路都通
- **新增** `@xihan-ui/pointer`：指针会话、多指会话与双指几何、拖放几何、尺寸调整几何四层，自研零依赖
- **新增** `table` 的列拖拽排序：新增部件 `column-drag-trigger` 与 `live-region`，把手自占一个 Tab 位，落点按列 id 认
- **新增** `table` 的行拖拽排序：`rowReorderable` 打开后整行可拖，树形行支持换父，搬完发 `onRowMove`
- **新增** `table` 的列宽拖拽：标了 `resizable` 的列产出改宽把手，宽度落进列偏好可存可还原
- **新增** `tree` 的节点拖拽搬家：落点三档（前 / 后 / 落进去），`Alt` + 方向键改同层次序与缩进，搬完发 `onNodeMove`
- **新增** `tabs` 的标签拖拽换位：`reorderable` 打开后整个标签可拖，`Alt` + 主轴方向键可挪，搬完发 `onTabMove`
- **新增** 三个触屏拖动把手 `row-drag-trigger` / `node-drag-trigger` / `tab-drag-trigger`，不占 Tab 位
- **新增** 选中原语 `applySelection` / `toggleSelectAll` / `rangeBetween`；`table` / `tree` / `transfer` 接上 Shift 范围选，`table` 另加 `Ctrl` / `Cmd` + A 全选
- **新增** `image-viewer` 的双指缩放
- **新增** `@xihan-ui/kernel/vite` 子入口：开发服务器启动时在终端打一次横幅

- **调整** 浏览器控制台的启动摘要默认不打，要打显式 `setMetadataAutoPrint(true)`
- **调整** `XIHAN_UI_LOGO` 与 `XIHAN_UI_SEND_WORD` 从 `XIHAN_UI_METADATA` 摘出来单独导出，`getMetadataSummary()` / `getMetadataDetails()` 不再带寄语
- **调整** `tree` 的拖拽播报报出落脚处，新增 `movedInto` / `droppedInto` / `canceledInto` / `rootLevel` 四个文案键
- **调整** `tree` 对禁用节点只拦 `inside` 落点，在它前后插不再拦
- **调整** `carousel` 的划动与 `image-viewer` 的平移改走多指会话，不再逐个捕获指针

- **修复** `dialog` / `drawer` / `image-viewer` 的 `closeOnEscape` 与 `closeOnInteractOutside` 改为交互当时现读——浮层开着时改这两个开关此前不算数
- **修复** 按住切换类的按键会来回翻转（按住 `Ctrl` / `Cmd` + A 在全选与全不选之间闪、按住空格反复拾起放下），12 处补上自动重复守卫
- **修复** 八个 Vue 组件收不到全局配置里的读屏文案：`combobox` / `popselect` / `resizable` / `sortable` / `table` / `tabs` / `text-field` / `tree`
- **修复** `XhTableRoot` 丢掉作者写在它上面的 `class` / `aria-*` / 监听器
- **修复** `table` 与 `tree` 的键盘处理器吞掉落在可编辑单元格 / 节点内容里的按键
- **修复** 开着 `striped` 的表里，偶数行既不响应悬停也显不出选中

## v1.0.0 (2026-08-26)

::: warning 版本与兼容性
首个正式版。从这一版起，[版本与兼容性政策](/guide/versioning)的全部条款生效。
:::

- **新增** 框架无关的无头内核：状态、交互与无障碍逻辑住在 `@xihan-ui/headless`，适配器只把 `connect()` 产出挂到宿主元素上；同一份内核在两端行为一致
- **新增** 119 个组件，每个同时产出无头内核、Vue 组件、自定义元素与默认皮肤——通用 15、布局 8、导航 16、数据录入 32、数据展示 30、反馈 9、浮层 7、AI 对话 2，逐个见[组件总览](./components/)
- **新增** `@xihan-ui/vue` Vue 3 适配器，729 个部件：受控 / 非受控、`v-model`、带类型的作用域插槽；`behavior` 子入口出五个行为原语的组合式，另有四件命令式服务（轻提示、通知、对话框、顶部进度条）
- **新增** `@xihan-ui/web-components` 适配器，121 个自定义元素：元素不生成结构，作者写带 `data-xh-part` 的 Light DOM 子节点；随包出 `custom-elements.json`
- **新增** 引擎四包：`@xihan-ui/kernel` 结构原语、`@xihan-ui/machine` 状态机运行时、`@xihan-ui/behavior` 行为原语、`@xihan-ui/motion` 动效原语
- **新增** `@xihan-ui/position` 浮层定位：放置、翻转、贴边、箭头锚点、rtl，自研无第三方依赖
- **新增** 样式与逻辑解耦：皮肤只认 `data-scope` / `data-part` / `data-*`，不认框架也不认类名，整包换皮肤不用碰一行 JS
- **新增** `@xihan-ui/tokens` 设计令牌：DTCG 源在构建期产出 CSS 变量（原语 95、语义 158，另有紧凑 49、浅色 41、深色 44、减弱动效 8 条覆盖），运行时不做 CSS-in-JS
- **新增** `@xihan-ui/styles` 默认皮肤 125 份，按 `@layer` 分层（`xihan.reset` → `tokens` → `base` → `components` → `overrides`），使用者的覆盖恒排在最后
- **新增** 三条视觉轴：`variant` 管形态、`tone` 管语气（六族）、`size` 管尺寸；实心底上的前景与交互态由语气色按 WCAG 相对亮度现推
- **新增** 主题五个维度独立切换：明暗、品牌、密度、对比度、书写方向，带 `createThemeController` 与品牌色派生
- **新增** 浮层一律 Teleport 到单一落点 `#xh-portal-root`，层号不受宿主祖先影响；13 个滚动宿主自带自绘滚动条
- **新增** 兜底字形二十个 `--xh-glyph-mark-*` 令牌，构建期内联图标包 SVG，跨系统长相一致
- **新增** `@xihan-ui/icons` 首方图标集：`IconRecord` 结构化记录，运行期不解析 SVG 字符串，另有 SVG → `IconRecord` 的构建期转换器
- **新增** `@xihan-ui/animations` 可序列化动效配方、`@xihan-ui/sound` 程序化 UI 音效（三套主题，零音频文件）、`@xihan-ui/backgrounds` WebGL2 效果与粒子云
- **新增** `@xihan-ui/chat-stream` AI 协议内核：SSE 读取 → 协议归一 → parts 归约 → 会话 store，零 DOM 零框架
- **新增** `@xihan-ui/markdown` 流式 Markdown 渲染内核（CommonMark 子集一致率 489/652）与 `@xihan-ui/code-highlight` 自研词法着色
- **新增** 键盘交互依 W3C APG 落地，77 份机读键盘规格表共 463 行键位随包提供
- **新增** 焦点环、按下反馈、禁用态对比度与语气配色（2 档主题 × 6 族，158 组配对）逐条达标，无障碍扫描跑在真实 Chromium（axe）
- **新增** 119 个组件都留了文案位并挂进覆盖表，全局 `ConfigProvider` 一处注入；rtl 下浮层放置、方向键语义与图形朝向一并对调
- **新增** 24 个表单字段组件认原生表单重置；`field` 提供标签、描述、错误与 `asChild` 逃生口
- **新增** 17 个公开包同版发布，运行时第三方依赖只有一个（`@internationalized/date`，仅日期族使用）；混装两个版本在 dev 下报 `core.version-mismatch`
- **新增** 摇树是真的：只引一枚图标 149 B、整集合 7.37 kB，`XhButton` 1.38 kB、`XhDialogRoot` 15 kB（均 gzip）
- **新增** ESM-only，子路径导出都带类型
- **调整** 元数据的宿主行只报宿主与版本，不再报版本一致性

## v1.0.0-preview.0 (2026-08-26)

这一版的主线是**把 alpha 里遗留的形状问题一次改完**：两对做着同一件事的组件分家（toast / notification、badge / tag），三处与同族对不上的 prop 名归位，语气色从逐族写死改为按底色现推。

- **新增** `notification` 组件，与 `toast` 分家：前者是系统推来的卡片（左侧类型字形、右上角关闭钮、两列网格、九宫格落位），后者收窄成操作反馈（顶部居中、宽度包着内容、一行图标加一句话）
- **新增** 分页的省略号能摊开：折进去的那几页有了入口，分页因此升级成浮层族（新增 `positioner` / `content`）；每页条数从只读 prop 升成真状态，配 `XhPaginationPageSizeSelect` 与 `pageSizeOptions`
- **新增** 表格的前缀列（行号 / 勾选 / 展开，按给定顺序插在最前并占住列号）、树形子行，以及一份可序列化的列偏好（列序 / 隐藏列 / 列宽）
- **新增** 树的 `multiple`、`leafOrientation`（末端全是叶子的那层横排）与节点级 `childrenOrientation`
- **新增** json-viewer 的原文视图 `view="text"`：直接出缩进过的 JSON，可整段拷走，值不再受截断与折减
- **新增** 13 个宿主的滚动层自带自绘滚动条：12 个浮层族的 `content` 与 json-viewer 的两档，作者一个部件都不用写；滚动条同时新增 `scroll-hover` 档并定为缺省
- **新增** Vue 侧三条逃生口：`@xihan-ui/vue/behavior` 子入口（五个行为原语的组合式）、`useHotkeys`（只注册不渲染键帽）、`XhFieldControl` 的 `asChild` 与配套 `useFieldControl`
- **新增** 命令式服务补齐三件：`createLoadingBarService`（句柄上是在途计数而不是布尔开关）、取值型 `prompt`、配置源可运行期换（应用切语言后服务子树跟着变）
- **新增** `@xihan-ui/tokens` 导出颜色能力：相对亮度、对比度、择色、混色与深浅——这套数学此前在四处各写了一份，判据各走各的
- **新增** date-picker 的 `defaultFocusedValue`，决定展开时先落在哪一页
- **新增** thread 补 `provideThread` / `useThreadContext`，与孪生组件 log 对称

- **调整** **badge 收窄成「只做角标」**：删掉 `variant`，解剖从单层 `root` 拆成 `root`（锚点）+ `indicator`（角标），新增 `placement`，定位归组件自己管。**行内的状态药丸请改用 `tag`**
- **调整** **生命周期相位改走 `data-state`**，`data-status` 退回「结果种类」一轴——此前一条 `[data-status='error']` 会同时命中「加载失败的头像」和「一整页 500 报错」
- **调整** 树的 `selectionMode` 转为 `multiple` 的旧写法，与同族七家对齐
- **调整** 实心底上的前景色与交互态挪动方向改由语气色现推（WCAG 相对亮度，白字黑字的交叉点 `0.179` 是解析解），换肤下配对自动成立；装饰档 `--xh-_tone-soft` 从 500 提到与控件边界同一档，六族十二组都够到 3:1
- **调整** 描边档的标签改用「可操作区边界」那一档语气色，边相对面的对比从 1.44–2.18 抬到 4.56–7.83（浅色）
- **调整** 浮层里的条目之间加 2px 行距，新增语义令牌 `--xh-list-option-gap` 统一这把尺——此前库内自己就有 0 / 2 / 4px 三种方言
- **调整** select 的盒不再自带 320px 宽度上限，框宽交回布局
- **调整** 上一页 / 下一页默认就画两枚箭头，不再要每份示例手写「上一页 / 下一页」四个字
- **调整** 147 个注入键改用 `Symbol.for`：模块被加载成两份时不再整棵子树白屏

- **修复** 点字段的标题聚不到复合控件的焦点；套进字段的复合控件读屏**一个名字都没有**——标签的 `for` 指向 `div` 时什么也不会发生，而且不报错
- **修复** `useStickToBottom` 吞掉句柄，最常见的用法（两个 getter 读模板 ref）下根本没挂上
- **修复** `XhJsonViewerRoot` 的 `value` 在类型上被推成 `undefined`，任何跑 vue-tsc 的工程传真实数据都编译不过
- **修复** 命令式服务的宿主挂不起来时连累调用方：一条轻提示能让整次导航失败、整站白屏，现在退化成空操作并发一条说得清的诊断
- **修复** 日历的「大步翻」两颗钮被一条 `display: none` 无条件收掉，从来就没画出来过
- **修复** date-picker 展开态初值为真且铺了格子时抛 `SEND_BEFORE_MOUNT`
- **修复** 条目之间一有缝，select / combobox / popselect 的高亮就一跨一闪，读屏跟着一路播报
- **修复** 四处被祖先 `overflow` 裁掉的聚焦环改成往内收
- **修复** 树上三个对读屏隐藏的把手不再被指针聚焦（浏览器告警「aria-hidden 的后代仍持有焦点」）；叶子行补上箭头那一格的缩进，层级关系读得出来了
- **修复** 菜单族两家（context-menu / menubar）的勾选标记没跟着语气走

- **优化** 不可关闭的标签走快路不建状态机：400 枚从 39.1ms 降到 18.3ms
- **优化** 进度条服务的宿主自己渲染，不再经 provide/inject 拿 api

- **移除** `toaster`：轻提示不再需要额外的容器组件
- **移除** `@xihan-ui/kernel` 的 `DATA_SCROLL_SHARD`：配套的分片机制从未实现，声明处之外全库零引用

## v1.0.0-alpha.3 (2026-08-23)

这一版的主线是**一致性收口**：把「同一件事在不同组件里有几种做法」逐条查出来、裁一种、再钉住。

- **新增** `scrollbar` 组件：自绘滚动条可以挂在任意一个滚动容器上，不必是本组件的后代
- **新增** `date-picker` / `time-picker` 的快捷选项（`presets`）：给数据就在浮层里多排一列，自成一套 listbox 键盘
- **新增** 日历的多面板、按月 / 季度 / 年 / 周挑、快速翻年、周选整周预览；周序号成为一等部件 `week-number`
- **新增** select 浮层的底部操作区，「新建」「全选」这类按钮有了位置
- **新增** 热力图的 `palette` 色板轴（六色），与语气轴各管各的
- **新增** number-field 的 `parse` / `format` 与可选 `control` 部件；pin-input 的 `pattern`
- **新增** 全局配置做成真正的 ConfigProvider：全局默认 + 局部覆盖，两个适配器一份语义

- **调整** **浮层搬进单一落点**：19 个浮层的 positioner 一律 Teleport 到 `#xh-portal-root`。宿主祖先只要建了层叠上下文，原地渲染的浮层层号就退化成局部序号——这是库无法从自身约束的。**按 `wrapper.querySelector` 取浮层节点的代码要改从 `document` 取**
- **调整** **盒的定义统一**：有 `control` 部件就是盒，`trigger` 退化成盒内的 `flex: 1` 按钮。此前 16 个输入 / 选择控件有三种盒，盒是 `<button>` 的那五家没法把清空钮放进框里
- **调整** **清空 / 关闭 / 移除按钮收成四类契约**：焦点模型、空态、尺寸、圆角、互斥、文案键、键盘路径逐条统一；select / cascader / tree-select / popselect 补上了此前完全缺席的键盘清空
- **调整** **状态属性收成一套词汇**：当前项一律 `data-current`，`data-active` 的一名三义拆成 `data-in-path` 与 `data-passed`，组级混合态归 `checked | unchecked | indeterminate`
- **调整** **默认语言跟随运行时**：日期系兜底从写死 `zh-CN` 改成「显式 locale → 全局配置 → 宿主语言 → `en-US`」。**默认周首日随之从周一变成周日**，要固定就显式传 `locale` 或 `firstDayOfWeek`
- **调整** 「移除这一枚 chip / 这一行」统一叫 `item-delete-trigger`，四个文案键归成 `deleteItem`
- **调整** 选择态一族（table / tree / transfer）的选中集合统一叫 `selection`，载荷键统一 `{ value }`
- **调整** 兜底字形改用真图标（`--xh-glyph-mark-*` 二十个令牌），不再是跨系统长相各异的 Unicode 字符
- **调整** 减弱动效只剩一条通道，CSS 侧新增 `[data-motion='reduce']` 钩子；缓动与时长的真源是令牌
- **调整** 并排成对的面板定高——穿梭框搬走条目后整体不再变矮
- **调整** 菜单族三家（menu / menubar / context-menu）逐条同值：menubar 此前根本没有「子菜单触发项展开态」这条规则

- **修复** side-nav 折叠成图标栏后，行按钮与链接**没有可及名**——读屏用户完全不知道每一项是什么（真机 axe 扫出，critical）
- **修复** date-picker / time-picker / combobox 有值时下拉钮被藏掉：鼠标用户没有打开入口，Escape 收起时焦点掉到 `body`
- **修复** 日历周序号在周日起算时整列少 1（ISO 周里周日属于上一周）
- **修复** `TimeProps.locale` 的窄联合与全局 BCP 47 locale 对不上，配 `de-DE` 会拿到中文用词
- **修复** 4 条子路径导出的类型文件根本不存在，按这些子路径引入时类型全部解析不到

- **优化** 无障碍：真机 axe 覆盖到 dialog / drawer / image-viewer 三个模态，全部通过
- **优化** 版本策略页按实测重算：`data-state` 取值清单删掉 4 个库里已不存在的，WC 命令式方法从 22 条改成 29 条

## v1.0.0-alpha.2 (2026-08-16)

`@xihan-ui/motion` 与 `@xihan-ui/animations` 是新包，这一版首次发布。

- **新增** `@xihan-ui/motion` 动效原语与 `@xihan-ui/animations` 现成动效两个包，并补齐动效地基的四个缺口
- **新增** `@xihan-ui/icons` 的 SVG → `IconRecord` 构建期转换器：`xihan-icons` 命令与 `@xihan-ui/icons/codegen` 子路径，把任意 SVG 目录转成可摇树的运行期模块
- **新增** 首方图标集扩到覆盖中后台界面的常用语义，共 179 枚手绘图标，分九类；只引一枚仍是 149 B（gzip），集合变大不影响你的产物
- **新增** 自定义元素的全局文案层 `setXhConfig()`
- **新增** `startSkinCheck()` 开发期探测与 `styles.missing-skin` 诊断码——漏引皮肤不再静默

- **优化** 75 个组件的插槽写上真类型，`vue-tsc` 从此接得住插槽名与载荷键名的拼写错误
- **优化** 104 个组件全部留出 `<Comp>Translations` 的位，哪怕眼下一句文案都没有——后面要加时不必改结构
- **优化** 每份皮肤都能单独引入，动画不再指望别处的文件在场

- **修复** 官网作为第一个真实消费方落地时暴露的四条问题（宿主定位、图层序等），全部改代码而非只改文档

- **调整** collection 铺开的结构必须凑齐必备部件，三档语义写进文档

## v1.0.0-alpha.1 (2026-08-13)

`@xihan-ui/sound` 是新包，这一版首次发布；`@xihan-ui/icons` 在上一版没能发出去，这一版补齐。

- **新增** `@xihan-ui/sound` 声音层：纯 Web Audio 的程序化 UI 音效，零音频文件、零第三方依赖、框架无关；命令式反馈服务已接上
- **新增** 进度条的环形与仪表盘两种形态（`variant` 由 `line` 扩成 `line` / `circle` / `dashboard`）
- **新增** 级联选择的空态兜底：`empty` 部件、`data-empty` 标记与文案覆盖
- **新增** checkbox / switch / combobox / color-picker 能进 HTML 表单，表单字段组件由 18 个变 20 个，五个缺口清完
- **新增** 复合控件响应表单重置：机制本体加 17 个组件全部接上；Web Components 侧同步
- **新增** `--xh-border-control` / `--xh-border-control-hover` 两支控件边界令牌，`data-contrast` 随之接上
- **新增** popconfirm 与 float-button 的组件文档页第一次有了 Props 表

- **修复** 摇树第一次真的生效：只用一个组件不再拖来整个库。此前七个库包都是单入口打包，500+ 模块被摊平进一份 `dist/index.js`，`sideEffects: false` 随之失效。实测只用 `XhBadge` 由 168,947 B 降到 **538 B**
- **修复** RTL 下浮层的 `start` / `end` 第一次真的翻过来
- **修复** 浮层箭头指向锚点，不再钉死在浮层中点
- **修复** `index.css` 的级联层序：层序声明挪到入口最顶，此前令牌与部分组件皮肤抢先立层
- **修复** 四处只在真实宿主里才现形的缺陷（含首屏即展开的对话框与抽屉能服务端直出、无 window 的宿主里不再抛异常）
- **修复** 带语气的 outline 控件边框补到 3:1，控件边界切到 `border.control`，WCAG SC 1.4.11 第一次真的达标
- **修复** 补齐 4 处「边框改不动」的覆盖槽
- **修复** combobox 展开按钮翻面只转箭头字形，不再带着悬停底色一起转
- **修复** 级联选择的空态占位在 Web Components 侧补齐，两个适配器不再分叉

- **调整** 跨组件已经分叉的名字统一回一套（7 处）。part 名与 prop 名在 1.0 之后就是公开 API，趁 alpha 一次改完，逐条迁移点见各包 CHANGELOG
- **调整** 下拉与列表族的条目度量与高亮档位统一成两档制，分两批铺完 12 个组件
- **调整** 级联选择皮肤翻修：展开路径改品牌淡底加粗、分支条目补右向箭头、列改内容撑宽定高
- **调整** `hideOutside` 的入参形状随真实宿主那四处修复一并变化

## v1.0.0-alpha.0 (2026-08-11)

> 框架无关重写

### 基座

- **新增** `@xihan-ui/kernel` 结构原语：anatomy、`mergeProps`、`normalizeProps`、Scope、context、id 生成，以及浮层定位、虚拟滚动、代码着色三个端口的类型契约
- **新增** `@xihan-ui/machine` 自研薄状态机：定义层、`createService` 解释器与 vanilla 运行时，受控值绑定与效应生命周期
- **新增** `@xihan-ui/behavior` 交互行为原语：消解层、焦点域、滚动锁、进出场，随后补上条目集合导航（roving tabindex 底座）与首字母连打检索
- **新增** `@xihan-ui/tokens` 设计令牌体系与主题运行时，令牌从 DTCG 源产出 CSS / JSON / TS 三种形态
- **新增** `@xihan-ui/styles` 纯 CSS 皮肤层，后续补上 reset 层
- **新增** `@xihan-ui/kernel` 全局诊断通道，状态机错误投递进该通道而不是抛在使用者脸上

### 适配器

- **新增** `@xihan-ui/vue` Vue 3 适配器，Button / Dialog 纵切片先打穿全链路
- **新增** `@xihan-ui/web-components` Web Components 适配器，Light DOM 行为宿主；`xh-dialog` 把「有状态组件也能框架无关」这件事验证掉
- **新增** WC 侧观察 Light DOM 增删并重新接线，抹平「运行期增删条目」上的适配器分叉
- **新增** WC 角色节点契约校验与 Custom Elements Manifest 生成

### 组件

- **新增** 102 个组件逐批铺开，每个都同时产出无头内核、Vue 组件、自定义元素与默认皮肤：从 Button / Dialog 起，经 Switch、Checkbox / Collapsible / Separator、Toggle / Progress / Badge、RadioGroup / Tabs / Accordion、Tooltip / Popover、Menu、Select / Avatar / Field、NumberField，到日期族与最后一批，双适配器铺满
- **新增** alert / spinner / skeleton / empty-state 四个反馈类组件
- **新增** Checkbox 三态
- **调整** Select 支持多选，选中值由单值改为集合：`SelectValueChangeDetails.value` 由 `string | null` 变 `string[]`，`SelectApi` 的 `value` / `valueText` 变数组，`setValue` 签名变 `(next: string | string[]) => void`；Vue 侧 `update:value` 载荷与 WC 侧 `value-change` 的 `detail` 随之变化。见[选择器](./components/select)

### 视觉词汇表

- **新增** 三个正交的视觉轴：`variant` 形态（`solid` / `subtle` / `outline` / `ghost`）、`tone` 语气（`brand` / `neutral` / `success` / `warning` / `danger` / `info`）、`size` 尺寸（`sm` / 缺省 / `lg`）。语气做成与组件无关的共享一层，各组件的形态规则只消费它声明的私有槽——加一个语气改一处，不是逐个组件写六遍
- **新增** 34 个组件接入这套词汇表：按钮族与表单控件、十个输入类组件、以及标签页、步骤条、菜单族、分页、表格、对话框、抽屉等。没写轴的组件外观与接入前逐值一致
- **调整** 实心底上的前景色按实测对比度分派而非统一白字：600 档上白字对 brand 5.08、neutral 7.80、danger 4.83 达标，而 success 3.04、warning 2.70、info 3.47 都不到 4.5，这三族配深字
- **调整** 破坏性变更：`alert` 的 `variant` 改名为 `tone`。它原本的取值是 `success` / `warning` / `danger`——那是语气不是形态，与全库词汇表冲突。取值不变，只改属性名；同时移除公开导出的 `AlertVariant` 类型
- **调整** `toast` 的配色改走共享语气层，由 `type` 内部派生（`error` → `danger`，`loading` → 中性），公开 API 不变
- **调整** 三条轴由裸 `string` 收成联合类型，从 `@xihan-ui/kernel` 导出：`Tone`（六档）、`Size`（`sm` / `md` / `lg`）、`ControlVariant`（`outline` / `subtle` / `ghost`，十二个输入控件）与 `ActionVariant`（前者再加 `solid`，按钮族）
- **修复** `checkbox` 半选态的横杠此前不可见：方框只在全选时填色，半选保持画布底，而横杠用的是实心底上的前景色，白压白等于没画

### 自研替换第三方

- **新增** `@xihan-ui/position` 自研浮层定位引擎（包含块解析、缩放换算、翻面与避让、跟随更新），**移除** `@floating-ui/dom`
- **新增** 自研虚拟滚动内核，**移除** `@tanstack/virtual-core`
- **新增** WC 自研响应式基类，**移除** `@lit/reactive-element`
- **新增** `@xihan-ui/markdown` 自研解析与渲染，**移除** `markdown-it`
- **新增** 代码着色走端口，内置自研粗粒度词法器，可换 Shiki
- **调整** 至此全部库包的运行时第三方依赖只剩一个（`@internationalized/date`，仅日期族使用）。见[包与依赖关系](./npm-package-dependency)

### AI 与 Markdown

- **新增** `@xihan-ui/chat-stream` 协议内核与 AI 组件族第一批：SSE 读取、协议归一、parts 归约、会话 store，配 Thread / Composer / CodeBlock 三件与粘底原语，双适配器
- **新增** `@xihan-ui/markdown` 流式渲染内核，增量切块 + 稳定 key + 消毒
- **优化** Markdown 逐步实现缩进代码块、Setext 标题、跨行链接引用定义与列表松紧排布，CommonMark 官方用例一致率由 375 提升至 489

### 视觉层

- **新增** `@xihan-ui/backgrounds`：WebGL2 背景效果与数据驱动粒子点云，框架无关、零第三方依赖。流场跑片元着色器、粒子走 `gl.POINTS`，两通道共用同一段 GLSL；内置 14 个效果，不支持 WebGL2 时降级为 CSS 静态背景
- **新增** 两个适配器接上视觉层，各走独立子入口 `@xihan-ui/vue/backgrounds` 与 `@xihan-ui/web-components/backgrounds`，`@xihan-ui/backgrounds` 声明为可选 peer
- **修复** 修复画面在真实页面里一片空白的三个成因

### 图标

- **新增** Icon 原语：`IconRecord` / `IconNode` / `IconTag` 类型、`connectIcon`、`XhIcon`、`<xh-icon>` 与 `icon.css`。图标数据是结构化节点数组而非 SVG 字符串，渲染端逐节点建元素，运行期不经 HTML 解析器
- **移除** 旧 `@xihan-ui/icons`（27 个第三方图标集的聚合，约四万个图标）整包移除并在 npm 上弃用，重写为只收自研图标的首方集，第一批 29 个覆盖组件库自用的全部语义

### 无障碍

- **新增** 无障碍扫描接上真实浏览器与 axe，逐个组件扫
- **新增** 键盘规格表机读化，随包提供
- **修复** 存量无障碍违规清零，由 24 条降到 2 条（WC 侧 `steps` 一条，外加一条步骤重放豁免）
- **修复** 令牌 `fg-subtle` 达到 AA，并给对比度立下判据
- **修复** 焦点陷阱抓不住第一次逃逸；移除持有焦点的条目后不再让整组脱离 Tab 序列；删掉文件上传条目后把焦点交回投放区
- **修复** 浮层族改用 fixed 坐标系，不再被 overflow 祖先裁掉
- **修复** 挡住输入法组合态
- **修复** Dialog 三处：模态背景失活、非模态焦点域、收起态 hidden
- **修复** Field 的名字关联不再依赖 control 是可标注元素；Splitter root 不再输出 `aria-orientation`
- **修复** 消解层只在展开期间入栈，不再与开合无关地常驻
- **修复** 状态机停机后送入的事件一律静默丢弃，dev 下不再抛

### 令牌与发布

- **调整** 皮肤层令牌成为唯一事实源，删掉全部字面量兜底，跨组件共享的默认值全部令牌化
- **新增** 14 个公开包锁步同版发布
