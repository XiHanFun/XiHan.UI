# @xihan-ui/icons

## 5.1.0

## 5.0.0

### Major Changes

- d4f17ae: 全部包统一升到 5.0.0。

  4.2.0 之后，组件库为打印、流程、表单、报表四款设计器补齐了一批能力：多数组件改用标准结构（Vue 不写默认插槽、React 不给 children、Web Components 不写部件时，三端照同一个结构函数铺出整套部件），库内表单控件统一了命名（`ariaLabel`）与表单状态继承，新增条件编辑器、格式输入、表达式输入框，以及首发的 `@xihan-ui/designer-kit`、`@xihan-ui/designer-shell`、`@xihan-ui/expression`、`@xihan-ui/xlsx`。其中下列改动不兼容 4.x 的写法，按版本政策整组升 major，全部包同号发布。

  升级前逐条对照：

  1. **日历族周期视图按行渲染**（CalendarPicker、CalendarRangePicker、DatePicker、DateRangePicker）：面板与 `buildPeriodGrid` 返回值的 `cells` 改为按列数切好的 `rows`，网格底下必须是 `week-row`、格子放进行里。手写周、月、季度、年视图的，把 `panel.cells`（或平铺的 `periods`）换成 `panel.rows` / `rows`，一行写一个 `week-row`；自备格子列表的用 `calendarPeriodRows(periods, view)` 切行。
  2. **热力图事件与类型对齐图表家族**：`cell-press` / `onCellPress` → `datum-press` / `onDatumPress`，`cell-active` / `onCellActive` → `datum-active` / `onDatumActive`；删除 `cell-focus` / `onCellFocus`（改听 `datum-active`）；`HeatmapCellDetails` 改名 `HeatmapDatumDetails`，删除 `HeatmapCellFocusDetails`；`translations.cellLabel` / `matrixCellLabel` 的参数随之换类型。
  3. **表格表尾支持多行**：删除 `footer`（WC 属性 `footer`），改写 `footerRows: 1`（WC `footer-rows="1"`）；`getFooterRowProps()` 改为 `getFooterRowProps({ level })`，多行表尾的每一行写 `level`。
  4. **快捷键工具移到 core**：`formatHotkey`、`matchesHotkey`、`detectKbdPlatform`、`resolveKbdPlatform` 与类型 `KbdPlatform`、`KbdResolvedPlatform`、`HotkeySegment` 不再从 `@xihan-ui/headless` 导出，改从 `@xihan-ui/core/hotkey` 引入。
  5. **语言包删掉两句、改用一句**：Citation 的 `translations.openSource`、`translations.source` 删除，覆盖过的直接去掉。FileUpload 的 `translations.dropzone` 从「投放区的兜底可及名」改为标准结构里投放区那句看得见的说明（也是名字的后半句），覆盖过它的按新用途改写文字；手写结构的投放区不再取它，改由标题接上投放区里看得见的说明命名，请在投放区里写一句说明。
  6. **删除组件覆盖槽** `--xh-command-list-busy-opacity`：命令面板刷新时不再淡化列表，设过它的直接去掉。
  7. **HoverCard 在场判断改用 `parts`**：`HoverCardRefs` 删去 `getTitleEl`、`getDescriptionEl`；Vue 的 `HoverCardContext` 删去 `titleRef`、`descriptionRef`，React 的 `HoverCardContext`（`useHoverCardContext`）删去 `setTitleEl`、`setDescriptionEl`。用库内的 `XhHoverCardTitle` / `XhHoverCardDescription` 的不受影响；自写标题、说明部件的改为向 `parts` 报告在场。
  8. **表单必填的空值范围扩大**：只含空白的字符串、元素全为空的数组（如 `[null, null]`）算空，`required` 会拦下。确实允许只填空格的字段不要加 `required`，改在 `validator` 里判断。
  9. **表单规则的字符串长度按字素计数**：`min` / `max` 对字符串改按用户看到的字数（组合 emoji、国旗各算一个）。依赖 UTF-16 码元计数的（如贴合数据库列宽），改在 `validator` 里自行计数，并保留后端校验。
  10. **React `XhCardRoot` 的 `title`、`content`** 改为卡片的标题与正文（取 ReactNode），不再作为原生属性写到根节点上。原先拿 `title` 当原生提示的，改用 Tooltip 或写到外层节点。
  11. **Web Components `xh-file-upload` 的条目改按 `allFiles` 对应**：远程附件在前、本地文件在后，与 Vue / React 同一口径；`deleteFile` 也收远程附件。原先按 `acceptedFiles` 铺条目、远程附件另行自绘的，改成按 `allFiles` 每个文件铺一行；没有 `remoteFiles` 时写法不用改。
  12. **Web Components 的布尔 attribute 全部改为三态**：原先约一百三十个布尔属性（`disabled`、`default-open`、`loading`、`multiple`、`lazy-mount` 等）按 HTML 原生规矩，写出即为真；现在与其余属性一样，显式写 `="false"` 为假，不写交给组件缺省，写空串或别的值仍为真。写过 `disabled="false"` 这类「写了 false 却想要真」的地方改成 `disabled` 或 `disabled=""`；只有显式写成 `"false"` 才受影响。移除属性也改为回到组件缺省，不再固定为假：缺省为真的开关（如 `xh-citation` 的 `loop`）移除后回到开。自己写元素的，布尔属性改用 `@xihan-ui/web-components/authoring` 新导出的 `BOOLEAN_CONVERTER`。
  13. **ColorPicker 单选的空值改为未选**：原先单选给空数组按缺省色 `#000000` 显示、值是 `['#000000']`；现在是未选：色块画斜线、值文字显示 `placeholder`，`value` 为空数组、表单影子为空串，`required` 会拦下。依赖空数组得到黑色的改写 `['#000000']`；`value` 与 `defaultValue` 都不给时照旧从 `#000000` 起。单选有值时新增清空钮 `clear-trigger`，按下派 `clear`。
  14. **颜色换算函数挪到 core**：`colorParse`、`colorToString`、`colorCss`、`colorSameColor`、`colorSameRgba`、`colorHexToRgba`、`colorRgbaToHex`、`colorRgbaToHsva`、`colorHsvaToRgba`、`colorRgbaToHsla`、`colorHslaToRgba`、`colorRgbaToOklch`、`colorOklchToRgba`、`colorNormalizeRgba`、`colorNormalizeHsva` 与类型 `ColorFormat`、`ColorRgba`、`ColorHsva`、`ColorHsla`、`ColorOklch` 不再从 `@xihan-ui/headless` 导出，改从 `@xihan-ui/core/color` 引入，函数名不变。`colorParse` 改按 CSS Color 4 的语法认写法：分隔符混写（`rgb(1, 2 3)`）、逗号写法里数与百分数混用（`rgb(50%, 0, 0)`）、不带 `#` 的十六进制、色相写百分数这类浏览器不认的写法返回 `null`，此前会认下；依赖这些写法的改写成规范写法。取色器专用的通道与兜底色（`COLOR_CHANNELS`、`colorChannelRange`、`COLOR_FALLBACK` 等）留在 headless。
  15. **令牌的颜色换算改由 core 提供**：`@xihan-ui/tokens`（根入口与 `./runtime`）不再导出下表左列的名字，改从 `@xihan-ui/core/color` 引入右列。`colorParseOklch` 解析不了时返回 `null`，原 `parseColorToOklch` 是抛错；分量越界的写法（如 `oklch(120% 0.1 30)`、透明度大于 1）不再夹回范围，`colorParseOklch` 返回 `null`，令牌里其余颜色函数（`contrastRatio`、`mixColors`、`deriveBrandScale` 等）抛错。无彩色的色相取 0，白色写出 `oklch(1 0 0)`（原先 `oklch(1 0 89.88)`），颜色本身不变。合成、亮度、对比度、择色、混色与深浅函数照旧从 `@xihan-ui/tokens` 引入。

      | 4.x（`@xihan-ui/tokens`） | 5.0（`@xihan-ui/core/color`） |
      | ------------------------- | ----------------------------- |
      | `srgbToLinear`            | `colorSrgbToLinear`           |
      | `linearToSrgb`            | `colorLinearToSrgb`           |
      | `linearRgbToOklch`        | `colorLinearRgbToOklch`       |
      | `oklchToLinearRgb`        | `colorOklchToLinearRgb`       |
      | `parseColorToOklch`       | `colorParseOklch`             |
      | `inSrgbGamut`             | `colorInSrgbGamut`            |
      | `clampChroma`             | `colorClampChroma`            |
      | `formatOklch`             | `colorFormatOklch`            |
      | `Oklch`（类型）           | `ColorOklch`（字段相同）      |

  16. **Web Components 对话框与抽屉的语义角色改写 `dialog-role`**：`<xh-dialog>`、`<xh-drawer>` 不再把 `role` 当作配置，角色只落在 content 上，宿主不带 `role`。写过 `role="alertdialog"` 的改成 `dialog-role="alertdialog"`，代码里设 `role` 的改设 `dialogRole`；Vue 与 React 的 `role` 不变。
  17. **Web Components 通知条目的标题改写 `title-text`**：`<xh-notification-item>` 不再把 `title` 当作配置，宿主不带 `title`，悬停不出原生提示，读屏不再把标题念两遍。写过 `title="…"` 的改成 `title-text="…"`；property `titleText` 与通知服务不用改，Vue 与 React 的 `title` 不变。
  18. **树的多选改为选择模式 `selectionMode`**（Tree）：删除 `multiple`，改写 `selectionMode`（Web Components 为 `selection-mode`），取值与 Listbox 相同：`'single'`（缺省，单选不变）、`'multiple'`、新增的 `'extended'`（照文件管理器）。`multiple: true` 改写 `selectionMode: 'multiple'`（Vue 模板与 Web Components 写 `selection-mode="multiple"`）；`TreeApi` 的 `multiple` 改为 `selectionMode`，判断是否多选改读 `selectionMode !== 'single'`。TreeSelect 的 `multiple` 不变。
  19. **菜单族的选中事件改名 `item-select`**（Menu、ContextMenu、Menubar、Command、Mention）：原名 `select` 与原生 `select` 同名，输入框里选中文字时原生事件冒泡上来，Web Components 的监听会收到不带 `detail` 的「选中」。Vue 的 `@select` 改写 `@item-select`，React 的 `onSelect` 改写 `onItemSelect`，Web Components 的 `addEventListener('select', …)` 改监听 `item-select`；headless 的 `onSelect` 改为 `onItemSelect`，详情类型 `MenuSelectDetails`、`ContextMenuSelectDetails`、`MenubarSelectDetails`、`CommandSelectDetails`、`MentionSelectDetails` 改为 `MenuItemSelectDetails` 等（字段不变）。React 的 Menubar、ContextMenu、Mention 根上不再拦原生 `onSelect`，写了就照原生事件透传到根节点。Command 的 `select(value)` 方法不变。
  20. **Popconfirm 的取消事件改名 `cancel-press`**：原名 `cancel` 与原生 `cancel` 同名，文件输入框取消选择时原生事件冒泡上来，会被当成按了取消。Vue 的 `@cancel` 改写 `@cancel-press`，React 的 `onCancel` 改写 `onCancelPress`，Web Components 的 `addEventListener('cancel', …)` 改监听 `cancel-press`；headless 的 `onCancel` 改为 `onCancelPress`。React 根上不再拦原生 `onCancel`。确认事件 `confirm`、方法 `cancel()` 与部件 `cancel-trigger` 不变。
  21. **菜单族的 `item-indicator` 只当对号，行首归 `item-icon`**（Menu、ContextMenu、Menubar）：`item-indicator` 只在勾选与单选条目上出现，标准结构里由条目的第一个部件挪到最后（正文、说明、快捷键与 `item-suffix` 之后），落 Collection Item 的 `indicator` 列（`data-xh-collection-slot="indicator"`），与 Listbox、Tree 一致；`item-prefix` 插槽改落 `item-icon`，图标随条目字色走；删去条目数据里的 `indicator` 文字。迁移：给 `item-prefix` 内容写样式的改按 `item-icon` 选；手写 `ItemIndicator` 当行首图标的改用 `ItemIcon`；给 `item-indicator` 写样式改图标颜色的改写到 `item-icon`；数据里写 `indicator` 文字的改写 `icon`，要表达选中改用勾选或单选条目；按位置选部件的改按 `data-part` 选。

  另有几处不改 API、但升级后看得出来的变化：

  - 右键菜单（ContextMenu）的触发区里已有可聚焦的内容（画布、列表）时，触发区不再另占一个 Tab 位：菜单键与 Shift+F10 在那个元素上照常展开，关闭后焦点回到它。内容里没有 Tab 位时照旧由触发区占一个。
  - Web Components 的 `<xh-checkbox>`、`<xh-switch>` 宿主不再占一层盒子（`display: contents`），与 Vue / React 一样按行内排：原先在块级容器里一个宿主独占一行，要逐行排的给外层容器写排布，或给宿主写 `display`。
  - Web Components 放在 `<xh-config>` 里的对话框、抽屉与下拉，内容搬进 Portal 后照原位取配置：原先里面的元素只取全局的 `locale`、`size` 与文案，现在取包着浮层的那一层；浮层里的 `<xh-config>` 原先按系统偏好重算主题，现在承接外层的主题。
  - 组件根不写默认插槽 / 不给 children 时，原先渲出空的根，现在铺出整套缺省结构；Web Components 的元素不写部件时同样自己生成；`<xh-icon>` 只写一个空的 `root` 时也在里面生成图形，原先什么都不画。
  - Vue 的表单控件上写 `aria-label` 现在落到承担名字的部件（输入框、触发钮等）上，不再透传到根节点。
  - 渲染成 `<button>` 的部件由皮肤的 reset 层清掉浏览器缺省样式；Web Components 作者自写的 `<button data-xh-part="trigger">` 接线后同样是无壳样子，要按钮外观时把按钮（Button）当作这个部件写进去。
  - 十种内建语言包新增了若干键（如 `confirmTrigger`、`loading`、`empty`、`addTrigger`、`searchPlaceholder`）；自建语言包缺这些键时对应的字退回英文，照内建包补上即可。
  - FileUpload 点标题不再经原生激活直接弹出选择框，改为把焦点交给投放区（没写投放区时交给选择钮）；`label` 的 `for` 仍指向隐藏输入。
  - Fieldset 整组禁用时，组内 Field 的标题与说明随控件一起变淡；Scrollbar 不再随整组禁用，组内与选择器列表里的滚动条照常可用。

### Minor Changes

- 9bd3cb6: **新增** 首方图标 `barcode`（导出名 `BarcodeIcon`），画法与现有图标相同：五根竖条，长短两种高度，其中一根是宽条，表示条形码。
- 2293893: **新增** 设计器画布与表格编辑命令用的 34 枚首方图标，与现有图标同一种画法（24 网格、单色描边、粗细 2、round 端点）：

  - 编辑：`redo`、`scissors`、`copy-plus`、`square-dashed`；
  - 对象对齐与分布：`align-objects-left`、`align-objects-center`、`align-objects-right`、`align-objects-top`、`align-objects-middle`、`align-objects-bottom`、`distribute-horizontal`、`distribute-vertical`（现有的 `align-*` 是文字对齐）；
  - 层级：`bring-to-front`、`bring-forward`、`send-backward`、`send-to-back`；
  - 视图：`zoom-reset`、`grid`、`magnet`、`tablet`；
  - 文件：`file-minus`、`file-image`、`file-code`；
  - 其他：`workflow`、`eraser`、`corner-left-up`；
  - 表格：`table-column-insert-left`、`table-column-insert-right`、`table-column-remove`、`table-row-insert-above`、`table-row-insert-below`、`table-row-remove`、`table-cells-merge`、`table-cells-split`。

  导出名照旧是大驼峰加 `Icon`，如 `AlignObjectsLeftIcon`。

- 7044eb1: **新增** 五枚首方图标，给按元素种类区分的地方用（如设计器物料与页面结构里的种类）：`text-wrap`（长文本、折行文字）、`text-rich`（富文本）、`shape-rectangle`（矩形）、`shape-ellipse`（椭圆）、`page-number`（页码），导出名 `TextWrapIcon`、`TextRichIcon`、`ShapeRectangleIcon`、`ShapeEllipseIcon`、`PageNumberIcon`。画法与现有图标相同。
- 2f2d3aa: **新增** 两枚表单控件用的首方图标，画法与现有图标相同：`circle-dot`（圆圈里一个圆点，单选）、`square-chevron-down`（圆角方框里一个向下的折角，下拉选择）。导出名是 `CircleDotIcon`、`SquareChevronDownIcon`。
- 6ff5916: **新增** 首方图标 `hand`（`HandIcon`）：张开的手，给设计器的「拖动」工具用，画法与现有的同一种（24 网格、单色描边、粗细 2、round 端点）。
- 8997eb1: **新增** 六枚首方图标，给按图表、表格种类区分的地方用（如报表的卡片种类）：`chart-funnel`（漏斗图）、`chart-radar`（雷达图）、`chart-sankey`（桑基图）、`chart-heatmap`（热力图）、`chart-treemap`（矩形树图）、`table-group`（分组表），导出名 `ChartFunnelIcon`、`ChartRadarIcon`、`ChartSankeyIcon`、`ChartHeatmapIcon`、`ChartTreemapIcon`、`TableGroupIcon`。画法与现有图标相同。

## 4.2.0

### Minor Changes

- 603001b: JsonViewer 新增内建工具条，按需打开：`tools` 不给即没有工具条（行为与此前一致）；`true` 铺出全部工具；数组只铺列出的几项（`expand` / `wrap` / `copy` / `view`），数组里有未知的工具名直接抛错。工具条是根的第一个孩子（新部件 `toolbar`，`role=group` 带名字），钮按组件定的次序排在条的末端：展开 / 收起全部是一颗切换钮（`expand-trigger`），只在树档出现，还有收着的分支时按下展开全部、已经全部展开时按下收回顶层，名字与字形随这一下要做的事变（`data-state` 为 `open` 即已全部展开），只有根一层分支时禁用；自动换行开关（`wrap-trigger`，`aria-pressed`）只在原文档出现；复制钮（`copy-trigger`）与树 / 原文切换钮（`view-trigger`，名字与字形取要切去的那一档、带 `data-view`）钉在末端、切形态时不挪位置；两颗切换钮名字随动作走，不报 `aria-pressed`。钮是 Action Control icon 档 ghost 面，比视图低一档、最低 sm，换行开关开着时取品牌淡底选中面。复制写入的是原文档那一份，成功后钮换成对钩、前景取成功色并停 3 秒，播报区（新部件 `status`，视觉隐藏的 polite 实时区）念出回执；写入失败回到常态并通知 `onCopyError`。打印时工具条收起。

  新增 `source`（值的原文，如后端下发的 JSON 文本）：提供时原文档与复制钮改用它，能解析成 JSON 就只按两格缩进重排、数字与字符串等字面量一字不改，超出安全整数的 ID 不再因解析失真；headless 另导出重排函数 `formatJsonSource`。

  `view` 改为受控 / 非受控一对：新增 `defaultView` 与 `onViewChange`（Vue `view-change` 与 `v-model:view`，Web Components `view-change` 事件与 `default-view` 属性），只给 `view` 的写法照旧生效。新增原文档自动换行 `wrap` / `defaultWrap` / `onWrapChange`（开启后原文部件投影 `data-wrap`，长行折到下一行）。headless API 新增 `tools`、`wrap`、`copyStatus`、`copied`、`announcement`、`allExpanded`、`setView()`、`setWrap()`、`expandAll()`、`collapseAll()`、`copy()` 与六个部件的 getter，并导出 `JSON_VIEWER_TOOLS` / `resolveJsonViewerTools`；剪贴板写入与停留时长的工具函数挪到共享模块，`writeToClipboard` / `resolveClipboardTimeout` / `CLIPBOARD_TIMEOUT` 的导出名不变。语言包的 json-viewer 桶新增 `toolbar`、`expandAll`、`collapseAll`、`wrap`、`copy`、`copied`、`showText`、`showTree` 八条文案。Vue 的 `useJsonViewer` 新增可选的第三个参数接工具条的三路通知。

  图标集新增 `list-tree`（`ListTreeIcon`，一条根线带两条缩进的子线）。新增字形令牌 `--xh-glyph-mark-copy`、`--xh-glyph-mark-expand-all`、`--xh-glyph-mark-collapse-all`、`--xh-glyph-mark-wrap`、`--xh-glyph-mark-source`、`--xh-glyph-mark-tree`；新增公开槽 `--xh-json-viewer-toolbar-gap` / `-toolbar-mb`、`--xh-json-viewer-tool-icon-size`、`--xh-json-viewer-tool-fg`、`--xh-json-viewer-tool-fg-copied`。

## 4.1.0

### Minor Changes

- e3bdc1f: 看片工具条的复原钮不写内容时改由皮肤画图标，与其余六颗变换钮一致：此前 Vue / React 在钮里塞「1:1」文字，工具条上只有它是字。图标集新增 `undo`（U 形回转箭头，与旋转的整圈箭头区分开），令牌新增 `--xh-glyph-mark-undo`；可及名仍取语言包里的「复原」，高对比档与其余工具钮同一条系统色补救。Web Components 由作者写空的 `reset-trigger` 按钮即可。

## 4.0.1

## 4.0.0

## 3.2.0

## 3.1.0

## 3.0.0

## 2.1.0

## 2.0.0

## 1.1.0

## 1.0.0

### Major Changes

- 84b1aa3: 新增 Icon 原语，`@xihan-ui/icons` 整包重写为首方图标集。

  旧的 `@xihan-ui/icons` 是 27 个第三方图标集的聚合（约四万个图标），已整体移除并在
  npm 上弃用。新包只收自研图标，第一批 29 个覆盖组件库自用的全部语义，24×24 单色
  描边、`stroke-width` 2。

  用法：

  - `@xihan-ui/kernel` 导出 `IconRecord` / `IconNode` / `IconTag` 三个类型
  - `@xihan-ui/headless` 导出 `connectIcon` / `iconAnatomy` / `iconMeta` / `iconKeyboard`
  - `@xihan-ui/vue` 导出 `XhIcon`，`@xihan-ui/web-components` 注册 `<xh-icon>`
  - `@xihan-ui/styles` 新增 `icon.css`，`data-size` 与 `data-weight` 各三档

  图标记录是结构化节点数组而不是 SVG 字符串，渲染端逐节点建元素，运行期不经 HTML
  解析器。图标数据传的是记录本身而不是名字：按名字查表要把全表静态引进来，摇树会
  整个失效。

  WC 侧要在 `<svg data-xh-part="root">` 里留一个空的 `<g data-xh-part="glyph"></g>`
  作为授权点，元素只在它内部铺图元；不留这个空壳就一个节点都不动，手写内联 SVG 与
  `<use>` 引用两种写法因此都还能用。`icon` 是对象，只能走 property 传，属性里写不出来。

  可及名字两态互斥：`label` 给了非空白文本就输出 `role="img"` 与 `aria-label`，否则
  输出 `aria-hidden="true"`。只有图标的按钮请把名字写在按钮上而不是图标上，两处都写
  读屏会念两遍。

### Minor Changes

- f154e07: 组件自带的兜底字形改为真正的图标：勾、半选横杠、展开箭头、清空与关闭的叉、排序方向、加减号、翻页箭头、图片查看器工具条这些，原先要么是皮肤里的 Unicode 字符（`✓ ▾ ✕`，跨字体跨系统长得各不一样），要么由作者在每个部件里手打一个字符。现在统一走 `--xh-glyph-mark-*` 一族二十个令牌，取值是图标包里对应 SVG 的 `url("data:image/svg+xml,…")`，皮肤拿它当 `mask-image`、用 `currentColor` 着色——随语气、悬停、禁用自动变色，与 `<XhIcon>` 画出来的一模一样。令牌的 `$type` 为 `icon`、`$value` 是图标名，构建期从图标包读 SVG 内联，改图标只改一处。

  使用者换图标有两条路：在 `:root` 上重声明令牌即全局换，写在任意容器上即只换那一块（任何 SVG 都行，着色一样走 `currentColor`）；或者往部件里放自己的节点，皮肤那条 `:empty` 守卫即不命中。兜底覆盖面从 14 份皮肤扩到 39 份：此前 tree / tree-select / table / toast / dialog / drawer / number-field / carousel / transfer / image-viewer 等二十个组件的把手空着就什么都不画，文档示例只好逐个手打字符；现在示例里的 960 处手打字符全部删掉，由皮肤画。命令式 toast / dialog 的类型徽记与 `XhToastCloseTrigger`、`XhImageViewer*Trigger` 的默认内容同样改走这族令牌。

  图标包新增 `info` / `rotate-left` / `rotate-right` / `flip-horizontal` / `flip-vertical` 五枚。`check-glyph-slots` 门禁禁止皮肤里再写字面字形，并双向核对令牌与用处（适配器里的 JS 默认模板也算）。

- 271cee6: `@xihan-ui/icons` 新增 SVG → `IconRecord` 的构建期转换器：`xihan-icons` 命令与 `@xihan-ui/icons/codegen` 子路径。首方集保持小而准，图标由使用者自带——把任意 SVG 目录交给转换器，产出可摇树的运行期模块（`--dts` 一并出类型）。属性层走宽松模式（`class` / `width` / `height` 等丢弃并记进 `notes`），标签层仍严格（`<use>` / `<text>` / `<style>` 报错，因为收下就是产出一枚画错的图标），非 24 网格的源按比例归一到 24。三套真实集实测：Lucide 2025/2025、Tabler outline 5130/5130、Bootstrap Icons 2077/2078。
- b261b5d: 首方图标集扩到覆盖中后台界面的常用语义：新增 134 枚手绘图标，分方向与布局、文件与文档、文本编辑、媒体与设备、通信、状态与安全、数据与图表、系统与账户、商业场景九类。全部走严格模式管线，24 网格、2 粗描边、round 端点与连接，与既有的 45 枚同一手感。摇树不受影响——只引一枚仍是 149 B（gzip），整集合体积门禁由 2.2 kB 调到 8 kB。

### Patch Changes

- 1e85f27: 补 16 枚常用图标，并把体积棘轮改成量使用者真正下载的那个数。

  原先 29 枚全是箭头 / 勾叉 / 增删这类结构性图元，给站点加一个主题开关——最普通不过的需求——
  太阳、月亮、显示器一枚都没有。曦寒官网因此在自己仓里手抄了三条 `IconRecord`。

  新增 16 枚，判据是真实界面的高频缺口，不求成套：

  | 用途               | 图标                             |
  | ------------------ | -------------------------------- |
  | 主题开关           | `sun` `moon` `monitor`           |
  | 导航与链接         | `menu` `external-link`           |
  | 分页首末           | `chevrons-left` `chevrons-right` |
  | 日期时间选择器触发 | `calendar` `clock`               |
  | 与 `upload` 配对   | `download`                       |
  | 密码显隐           | `eye` `eye-off`                  |
  | 表格列筛选         | `filter`                         |
  | 删除与重试         | `trash` `refresh`                |
  | 通知               | `bell`                           |

  体积条目同时改了形状。原先 `icons` 量的是整包 `dist/index.mjs`，而这个包 `sideEffects: false`、
  每枚一个顶层 `export const`，摇树是真的——实测集合 29 枚与 45 枚时，`import { CheckIcon }`
  都是 149 B，一字不差。也就是说那条棘轮量的是**任何使用者都不会下载的数**，却随集合线性增长，
  1.4 kB 的上限只够再放几枚，把「补图标」变成了体积违规。

  现在拆成两条，各自量一件有意义的事：`icons：只用 CheckIcon` 走贴身摇树写法（与适配器条目同款）
  守住使用者的实付成本，`icons：整集合` 保留整包口径守住「每枚图标的边际开销别失控」。

## 1.0.0-preview.0

## 1.0.0-alpha.3

### Minor Changes

- f154e07: 组件自带的兜底字形改为真正的图标：勾、半选横杠、展开箭头、清空与关闭的叉、排序方向、加减号、翻页箭头、图片查看器工具条这些，原先要么是皮肤里的 Unicode 字符（`✓ ▾ ✕`，跨字体跨系统长得各不一样），要么由作者在每个部件里手打一个字符。现在统一走 `--xh-glyph-mark-*` 一族二十个令牌，取值是图标包里对应 SVG 的 `url("data:image/svg+xml,…")`，皮肤拿它当 `mask-image`、用 `currentColor` 着色——随语气、悬停、禁用自动变色，与 `<XhIcon>` 画出来的一模一样。令牌的 `$type` 为 `icon`、`$value` 是图标名，构建期从图标包读 SVG 内联，改图标只改一处。

  使用者换图标有两条路：在 `:root` 上重声明令牌即全局换，写在任意容器上即只换那一块（任何 SVG 都行，着色一样走 `currentColor`）；或者往部件里放自己的节点，皮肤那条 `:empty` 守卫即不命中。兜底覆盖面从 14 份皮肤扩到 39 份：此前 tree / tree-select / table / toast / dialog / drawer / number-field / carousel / transfer / image-viewer 等二十个组件的把手空着就什么都不画，文档示例只好逐个手打字符；现在示例里的 960 处手打字符全部删掉，由皮肤画。命令式 toast / dialog 的类型徽记与 `XhToastCloseTrigger`、`XhImageViewer*Trigger` 的默认内容同样改走这族令牌。

  图标包新增 `info` / `rotate-left` / `rotate-right` / `flip-horizontal` / `flip-vertical` 五枚。`check-glyph-slots` 门禁禁止皮肤里再写字面字形，并双向核对令牌与用处（适配器里的 JS 默认模板也算）。

## 1.0.0-alpha.2

### Minor Changes

- 271cee6: `@xihan-ui/icons` 新增 SVG → `IconRecord` 的构建期转换器：`xihan-icons` 命令与 `@xihan-ui/icons/codegen` 子路径。首方集保持小而准，图标由使用者自带——把任意 SVG 目录交给转换器，产出可摇树的运行期模块（`--dts` 一并出类型）。属性层走宽松模式（`class` / `width` / `height` 等丢弃并记进 `notes`），标签层仍严格（`<use>` / `<text>` / `<style>` 报错，因为收下就是产出一枚画错的图标），非 24 网格的源按比例归一到 24。三套真实集实测：Lucide 2025/2025、Tabler outline 5130/5130、Bootstrap Icons 2077/2078。
- b261b5d: 首方图标集扩到覆盖中后台界面的常用语义：新增 134 枚手绘图标，分方向与布局、文件与文档、文本编辑、媒体与设备、通信、状态与安全、数据与图表、系统与账户、商业场景九类。全部走严格模式管线，24 网格、2 粗描边、round 端点与连接，与既有的 45 枚同一手感。摇树不受影响——只引一枚仍是 149 B（gzip），整集合体积门禁由 2.2 kB 调到 8 kB。

### Patch Changes

- 1e85f27: 补 16 枚常用图标，并把体积棘轮改成量使用者真正下载的那个数。

  原先 29 枚全是箭头 / 勾叉 / 增删这类结构性图元，给站点加一个主题开关——最普通不过的需求——
  太阳、月亮、显示器一枚都没有。曦寒官网因此在自己仓里手抄了三条 `IconRecord`。

  新增 16 枚，判据是真实界面的高频缺口，不求成套：

  | 用途               | 图标                             |
  | ------------------ | -------------------------------- |
  | 主题开关           | `sun` `moon` `monitor`           |
  | 导航与链接         | `menu` `external-link`           |
  | 分页首末           | `chevrons-left` `chevrons-right` |
  | 日期时间选择器触发 | `calendar` `clock`               |
  | 与 `upload` 配对   | `download`                       |
  | 密码显隐           | `eye` `eye-off`                  |
  | 表格列筛选         | `filter`                         |
  | 删除与重试         | `trash` `refresh`                |
  | 通知               | `bell`                           |

  体积条目同时改了形状。原先 `icons` 量的是整包 `dist/index.mjs`，而这个包 `sideEffects: false`、
  每枚一个顶层 `export const`，摇树是真的——实测集合 29 枚与 45 枚时，`import { CheckIcon }`
  都是 149 B，一字不差。也就是说那条棘轮量的是**任何使用者都不会下载的数**，却随集合线性增长，
  1.4 kB 的上限只够再放几枚，把「补图标」变成了体积违规。

  现在拆成两条，各自量一件有意义的事：`icons：只用 CheckIcon` 走贴身摇树写法（与适配器条目同款）
  守住使用者的实付成本，`icons：整集合` 保留整包口径守住「每枚图标的边际开销别失控」。

## 1.0.0-alpha.1

## 1.0.0-alpha.0

### Major Changes

- 84b1aa3: 新增 Icon 原语，`@xihan-ui/icons` 整包重写为首方图标集。

  旧的 `@xihan-ui/icons` 是 27 个第三方图标集的聚合（约四万个图标），已整体移除并在
  npm 上弃用。新包只收自研图标，第一批 29 个覆盖组件库自用的全部语义，24×24 单色
  描边、`stroke-width` 2。

  用法：

  - `@xihan-ui/kernel` 导出 `IconRecord` / `IconNode` / `IconTag` 三个类型
  - `@xihan-ui/headless` 导出 `connectIcon` / `iconAnatomy` / `iconMeta` / `iconKeyboard`
  - `@xihan-ui/vue` 导出 `XhIcon`，`@xihan-ui/web-components` 注册 `<xh-icon>`
  - `@xihan-ui/styles` 新增 `icon.css`，`data-size` 与 `data-weight` 各三档

  图标记录是结构化节点数组而不是 SVG 字符串，渲染端逐节点建元素，运行期不经 HTML
  解析器。图标数据传的是记录本身而不是名字：按名字查表要把全表静态引进来，摇树会
  整个失效。

  WC 侧要在 `<svg data-xh-part="root">` 里留一个空的 `<g data-xh-part="glyph"></g>`
  作为授权点，元素只在它内部铺图元；不留这个空壳就一个节点都不动，手写内联 SVG 与
  `<use>` 引用两种写法因此都还能用。`icon` 是对象，只能走 property 传，属性里写不出来。

  可及名字两态互斥：`label` 给了非空白文本就输出 `role="img"` 与 `aria-label`，否则
  输出 `aria-hidden="true"`。只有图标的按钮请把名字写在按钮上而不是图标上，两处都写
  读屏会念两遍。
