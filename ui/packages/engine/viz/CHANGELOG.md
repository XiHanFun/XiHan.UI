# @xihan-ui/viz

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

- a4b5d20: **新增** `@xihan-ui/viz` 的 `FilterField`、`FilterParameter`、`FilterValueType`：可筛选字段、可引用参数与它们的值类型，与 `FilterCondition`、`FilterGroup` 同处。

  - `@xihan-ui/headless`：条件编辑器的 `fields`、`parameters` 用 viz 的 `FilterField`、`FilterParameter`、`FilterValueType`，从 `@xihan-ui/viz` 引入。

- 545df81: 新增表格数据处理函数，报表、表格汇总与列表筛选共用同一套缺失值与比较语义：

  - `isMissing(value)`：`null`、`undefined`、`NaN` 与无效 Date 是缺失值；空字符串、0、false 不是。
  - `compareMixed(a, b, { collate? })`：跨类型全序，boolean < number < Date < string < 其它，缺失值大于一切；字符串可传排序规则。
  - `valueKey(value)` / `tupleKey(keys)`：分组、去重与 in 匹配用的身份编码；-0 与 0 同键，Date 按时刻，`'1'` 与 `1` 不同键。
  - `createAccumulator(kind, { collate? })` / `aggregate(kind, values)`：按 `AGGREGATE_KINDS`（sum、avg、count、min、max、distinctCount）逐值聚合。sum / avg 与 `sum`、`mean` 结果相同；空集时 sum / avg / min / max 为 null，count / distinctCount 为 0；min / max 也可用于字符串与日期。
  - `sortBy(items, keys, { collate? })`：多键稳定排序，每个键各有 `direction` 与 `nulls`（缺失值排最前或最后，与方向无关）。
  - `compileFilter(tree, options)`：把 and / or 条件树编译成行谓词，运算符见 `FILTER_OPERATORS`。否定运算符（neq、notIn、notContains）匹配缺失值，操作数为空的条件不参与筛选；`read`、`operand`、`normalize` 可替换取值、操作数解析与比较前的换算。操作数形状不对时抛新错误码 `XH_VIZ_FILTER_OPERAND`。

- 14807fb: `@xihan-ui/viz/graph` 新增有向图基础算法，包入口新增两个折线路径函数。

  - `nodeDegrees(count, links)`：各节点的入度与出度，自环同时算一次入度与一次出度。
  - `reachableFrom(count, links, roots)`：沿连线方向从起点能到达的节点。
  - `findBackLinks(count, links)`：断环用的回边，把它们反向后图里不再有环；`layered` 内部改用它。
  - `topologicalOrder(count, links)`：拓扑序，有环时为 `undefined`。
  - `findCycle(count, links)`：找一条环，首尾是同一个节点；`sankey` 的成环检查改用它，报错内容不变。
  - 节点用 0 起的下标，连线是 `{ source, target }`（类型 `GraphLink`），下标越界立即报 `XH_VIZ_INVALID_ARGUMENT`。
  - `roundedPolylinePath(points, radius, digits?)`：折线的 SVG 路径，拐角倒成圆弧，切点不越过相邻两段的中点。
  - `arrowHeadPath(from, tip, { length, width?, digits? })`：箭头三角形的 SVG 路径，几何同 `arrowHead`。

- 2a07e44: `@xihan-ui/viz/graph` 新增分层有向图布局与直角连线路由，供流程图、依赖图这类有方向的关系图使用。

  - `layered(sizes, links, options)`：按节点宽高排出分层有向图。环路里的回边按反向处理并标出 `reversed`；跨层连线给出途经点 `bends`；`direction` 取 `TB` / `BT` / `LR` / `RL`，`nodeGap`、`linkGap`、`layerGap` 控制同层、途经点与层间的空隙；结果带每个节点的层号与层内次序，以及最终的交叉数 `crossings`。同样的输入得到同样的布局。
  - `routeOrthogonal({ source, target, obstacles, margin, bendCost })`：给出两端的点与离开、进入的方向，求一条只走水平与竖直线段、与障碍物保持 `margin` 间距的折线，拐弯越少越好；找不到通路时 `clear` 为 `false`，`points` 是不看障碍物的折线。

- 7c012a8: 新增 `pivotWider(rows, { key, by, value, columnName? })`：把长表转成宽表，供图表按某个维度拆出多条系列。

  - `key` 相同（按 `valueKey` 判同，可为多个字段）的行合成一行，结果行保留这些字段，次序是身份首次出现的次序。
  - `by` 的每个取值（缺失值也算一个）把 `value` 字段展开成一列；`value` 给多个字段时每个字段各展开一组列。
  - 返回 `{ rows, columns }`，`columns` 逐列给出列名、对应的取值与来源字段；没有对应长表行的格子不写。
  - 同一身份在同一取值上出现两次，或展开出的列名与身份字段、彼此重名时抛 `XH_VIZ_DUPLICATE_KEY`。

- 7114660: 新增折线工具，供连线类图形放标签、画箭头与让出端点：

  - `polylineLength(points)`：折线总长。
  - `polylinePointAt(points, fraction)`：按总长比例取点，0 为起点、1 为终点、0.5 为总长一半处；总长为 0 时取起点。
  - `shortenPolyline(points, { start, end })`：两端沿折线各收回一段，跨过的点一并去掉；两端收回之和不小于总长时停在同一位置。
  - `arrowHead(from, tip, { length, width })`：尖端在 tip、沿 from → tip 方向的箭头三角形（闭合的 `PathSegment`），宽缺省为长度的 0.8 倍，交给 `segmentsPath` 写成路径。

  关系图的有向箭头与连线收线改由这几个函数计算，渲染结果不变。

- 543b66f: `@xihan-ui/viz` 的文字度量补齐打印等版面排版要用的三样：

  - `FontSpec` 新增可选的 `style`（`'normal'` | `'italic'`），Canvas 度量器把斜体写进 font 串，估算器不区分。
  - `wrapText` 的 `WrapOptions` 新增 `letterSpacing`（px），与 CSS `letter-spacing` 一样加在每个字符之后、可为负，折行与末行省略都计入。
  - 公开 `createCanvasMeasurer(document)`，返回带 `refresh()` 的 `CanvasMeasurer`；拿不到 2D 上下文时返回 `null`。此前它只在 headless 的图表内部使用，现在由 viz 统一提供，图表改为引用这一份。

- 8c15a6f: 新增 `wrapRuns(runs, maxWidth, measurer, { breakMode? })`：几段各带字体与字间距的文字连成一串折行，给打印、报表这类有混排样式的版面用。

  - 断行规则与 `wrapText` 是同一份：中日韩文字逐字可断、拉丁文按词断（单词跨两段样式时不拆开）、收尾标点不落到行首、单词比一行还宽时逐字断、显式换行强制断行，行首行尾的空白去掉。`wrapText` 改为调用它，结果不变。
  - 每行给出各截的所在段、段内起止下标、横向位置与宽度，以及这一行量出的最大上伸与下伸；空行是一截长度为 0 的文字，指明用哪一段的字体。行高怎么算由调用方决定。
  - 字间距不是有限数或最大宽度为负时抛 `VizError`。

## 4.2.0

### Minor Changes

- 5fcfdbe: 图表缺省的多彩分类色板改为浅色调：8 个色槽都取基础色板的一档往纯白里在 oklab 里混合（90% / 75% / 60% / 45%），柱、扇区、面积这类大块填充读起来更轻。

  - 明度带抬到亮色 0.72–0.84、暗色 0.68–0.80，彩度取 0.07–0.14；对承载面放宽到 ≥ 1.6:1，系列身份由图例、色块内文字与数据表补偿
  - 相邻色槽仍是正常视觉 ΔE ≥ 15、色觉障碍 ≥ 8，任意两色放宽到 ΔE ≥ 8；色块内文字全部换成深色
  - 柔和品牌、莫兰迪柔彩与主题单色三套配色方案取值不变，柔和品牌改为显式沿用标准明度带
  - `validateCategoricalPalette` 新增 `tone: 'light'`，按浅色调的明度带与彩度带复验色板；缺省仍是标准明度带

- 2a0c591: 图表的配色方案、有序色阶、涨跌色与亮色下的顺序、发散色阶都改为浅色调，与浅色调的多彩分类成一套；漏斗的阶段色随顺序色阶一起变浅。

  - 主题单色：亮色从品牌 500 起逐档变浅、末两档往承载面里混，暗色从 300 起往深走；色槽 1 对承载面放宽到 ≥ 1.6:1
  - 柔和品牌：与多彩分类同样往纯白里混、同一明度带；相邻色槽放宽到正常视觉 ΔE ≥ 12、色觉障碍 ≥ 6
  - 莫兰迪柔彩：基础色往浅灰（中性 300）里按 35% / 50% / 65% 混合，明度带亮色 0.70–0.82、暗色 0.64–0.76，原有的分离规则不变
  - 有序色阶（漏斗阶段、档位）：亮色品牌 500 起、暗色 300 起，相邻两档之间补半档，最弱一档放宽到 ≥ 1.5:1
  - 涨跌：成功色与危险色往纯白里混出的浅色调，对承载面 ≥ 1.6:1，色觉障碍模拟下仍靠明度拉开
  - 顺序色阶亮色锚点改取品牌 50 / 300 / 500，发散色阶亮色两臂改取 500，终点与两端仍 ≥ 3:1
  - 新增 `--xh-chart-on-sequential-low` / `-high`：压在顺序色阶两段上的文字色，亮色两段都写正文色、暗色高段写承载面色；层级图按值着色时的名字改读它们
  - `validateOrdinalRamp` 新增 `tone: 'light'`，按浅色调把最弱一档的下限放到 1.5:1

## 4.1.0

## 4.0.1

## 4.0.0

## 3.2.0

## 3.1.0

## 3.0.0

### Minor Changes

- ef5c1ea: 直角坐标图补齐行情看板要用的写法，大数据的几条主路径进了性能预算。

  - 坐标轴新增 `minSize`（px）：这根轴至少占这么厚，上下叠放的 K 线与成交量写同一个值，绘图区左边对齐；不是非负有限数时报 `chart.scale-param`。viz 的 `layoutAxis` / `solvePlotRect` 对应新增 `minThickness`。
  - 修正：缩放窗口整段落在自变量轴之外（数据还没到、窗口指着已经挤掉的时段）时不再抛错，自变量轴按整条画；viz 的 `domainToWindow` 这时落成贴着那一端的零宽窗口。
  - 刻度格式器按比例尺只建一次，viz 的 `createTimeFormat` 按语言与时区复用、UTC 不再经 Intl 拆字段：时间轴的一次布局快了一个量级，流式每帧与缩放一帧的耗时随之下降。
  - 列式数据的缩放条缩略线改为按列取最低与最高的一遍扫描。

- 89d611f: `@xihan-ui/viz` 新增无障碍模型：只算事实，文案模板由调用方按语言提供。

  - `buildSummaryModel` / `summarize`：系列数、自变量范围、各系列的最小值与最大值及其位置、首末值与变化率；缺失值不计，最值相同时取先出现的。
  - `buildTableModel`：第一列是自变量、其后每个系列一列，行是全部系列的键按首次出现的次序去重，缺失值显示调用方给的文字；数据表部件与作者自建的表格视图共用。`buildLinkTableModel` 输出 source / target / value 三列。
  - `buildTraversal` / `navigate`：数据层里可聚焦的标记按系列分行、行内按数据位置排序，折线与面积按点展开成遍历项（焦点代理以「标记键:点键」为 id）；系列内移动到头不回绕，换系列保持位置，支持首尾与翻页。

- 29b6d45: 弧的圆角延伸到尖端：内沿收成尖端（实心扇区，或间隙吃掉了内沿）时，尖端按 `cornerRadius` 倒圆，切点不越过外角圆角的起点；扇区不小于半圈时尖端是凹角，保持尖。
- 018c0e1: `@xihan-ui/viz` 新增数组统计与刻度。

  - 统计：`extent`、`sum`（Neumaier 补偿，`0.1` 加十次得 `1`）、`mean`、`median`、`quantile`（R-7，与 Excel `QUANTILE.INC`、NumPy 缺省一致）、`variance` / `deviation`（Welford 单遍，样本方差）、`cumsum`、`range`。`null`、`undefined`、`NaN` 视为缺失，一律跳过，不按 0 处理。
  - 查找与分组：`bisector` 的 `left` / `right` / `center`；`group`、`rollup`、`index`，值相等的 `Date` 键归入同一组，`index` 遇到重复键抛 `XH_VIZ_DUPLICATE_KEY`。
  - 刻度：`ticks`、`tickIncrement`、`tickStep`、`nice`。步长取 1、2、5 × 10 的幂，刻度值由整数下标算出，不出现 `0.30000000000000004`；`nice` 的结果总包含原区间，只要一个刻度又跨过 0 这类不收敛的输入退回第一轮取整，区间不会被越推越大。
  - 分箱：`bin` 支持箱数、显式边界与 Sturges / Scott / Freedman–Diaconis 规则，箱左闭右开，最后一个箱包含右端点。

- 200eccb: `@xihan-ui/viz` 新增坐标轴布局 `layoutAxis` 与绘图区求解 `solvePlotRect`，只算几何、不碰 DOM。

  - 刻度数量按像素密度推导：横轴按相邻标签实际需要的间距收缩刻度数，推导出的数值刻度水平放置也互不重叠；纵轴按 2.5 倍行高。也可以给数量提示或显式刻度值；类目轴每个类目一个刻度，位置在带中心。
  - 横轴标签放不下时按 `labelOverflow` 处理：`auto` 先转 −45°、仍冲突就隔几个显示；`rotate` 只旋转，−45° 放不下转 −90°；`truncate` 截断加「…」；`wrap` 折成至多两行。纵轴标签超宽时截断或折行。刻度线始终全部保留，截断的标签保留完整文字供 `<title>` 与可及名使用。
  - `solvePlotRect`：纵轴标签宽度取决于纵轴刻度、纵轴刻度取决于绘图区高度、高度又取决于横轴厚度，从零厚度出发迭代到稳定（至多 3 轮），同时返回按最终绘图区构造的比例尺。

- 1ce8606: `@xihan-ui/viz` 新增颜色解析、换算、度量与色板校验。

  - `parseColor`：十六进制、`rgb()`、`hsl()`、`oklab()`、`oklch()`，逗号与空格写法都认；越界按 CSS 规则钳制，无法解析返回 `null`，不认颜色关键字。
  - 换算：`toOklab`、`toOklch`、`fromOklch`、`fromOklab`、`formatHex`。OKLab 矩阵与令牌运行时同一组；超出 sRGB 色域时固定明度与色相、降低彩度收回，色相不漂移。
  - 度量：`relativeLuminance`、`contrastRatio`（WCAG 2.x，半透明前景先叠到背景上）、`deltaEOk`（OKLab 欧氏距离 × 100）、`simulateCvd`（Machado–Oliveira–Fernandes 2009，红 / 绿 / 蓝色弱，严重度 0–1）。
  - `validateCategoricalPalette`：分类色板的六项检查——两套色板同一色槽的色相一致、明度带（亮色 0.43–0.77，暗色 0.48–0.67）、彩度 ≥ 0.10、红绿色弱模拟下 ΔE ≥ 8（6–8 需非颜色通道补偿）、正常视觉 ΔE ≥ 15、标记对承载面 ≥ 3:1（不足需标签或数据表补偿）；相邻检查或前 3 个色槽全部两两检查。
  - `validateOrdinalRamp`：有序色阶单色相、明度严格单调、对比度最低的一档对承载面 ≥ 2:1。

- 3536b2b: 新增两条大数据子路径：`@xihan-ui/viz/columns` 与 `@xihan-ui/viz/canvas`，支撑几十万到百万点的行情与采集数据。

  - `createColumnStore({ fields, capacity, columns })`：列式数据仓。每个字段一列 `Float64Array`，缺失写 `NaN`，日期取时间值；`append` / `appendColumns` / `setLast`（改写正在形成的那一行）/ `shift` / `clear`，一次调用只通知一次订阅者。`capacity` 是行数上限：追加超出时从头部挤掉最旧的行，数据段追到尾整段挪回开头，列视图始终连续、零拷贝。只有最后一行可改写，按序号缓存的极值与合并对整块永久有效。数据仓是冻结对象，传进 Vue 的 props 不会被包成响应式代理。
  - `bisectLeft` / `bisectRight` / `nearestIndex` / `isAscending`：有序数值列上的二分与校验。
  - `createExtentIndex(source, low, high)`：分块（1024 行一块，按序号对齐）求区间极值，整块算一次缓存；100 万点首次全段约 1.3 ms，之后的区间查询约 8 µs。
  - `decimateLine(x, y, from, to, pixel, { y2, gaps })`：M4 降采样，每个像素列保留首、末、最小、最大（带 `y2` 时再加它的最小与最大），画出来与全量逐像素相同、尖峰不丢；缺失值写断点。100 万点 → 1000 px 约 6 ms。
  - `bucketSize` / `bucketOhlc` / `bucketPeak`：K 线与柱窄到画不出实体时按 2 的幂根一组合并（K 线开取首、收取末、高取最高、低取最低；柱取绝对值最大的一根），组边界按全局序号对齐，平移时画面不抖。
  - `thinPoints`：散点按像素格稀疏，每格留最上面的点，输出仍按数据次序；100 万点约 6.5 ms。`createPointIndex`：像素网格上的最近点查询。
  - `ordinalTimeTicks`：等距排列（跳过休市、周末）的时间轴刻度，仍落在整点、整天、月初这些边界之后的第一根上。
  - `tracePolyline` / `traceBand`：类型化数组上的像素坐标写成折线、面积与区间带（NaN 断开，含三种阶梯），写进 `PathSink`，Canvas 2D 上下文可直接传入。
  - `parseCssColor` / `mixCssColor` / `formatCssColor` / `formatSrgbColor` / `createColorRamp`：按 CSS `color-mix` 的规则（alpha 预乘、oklch 色相走较短的弧、无色相的一端取另一端的色相）解析与插值计算样式里的颜色，结果写回原空间的函数式；画布不认某种写法时 `formatSrgbColor` 按浏览器在 sRGB 屏上的画法逐通道截断。
  - 两条子路径不从包入口导出，各自计体积：columns 实测 4.8 kB（限额 5.3 kB），canvas 2.55 kB（限额 2.8 kB）。

- f40cf71: 新增 `@xihan-ui/viz`：图表引擎包，零运行时依赖、import 无副作用、不碰 DOM。比例尺、刻度、形状、坐标轴布局、拾取与降采样都以纯函数提供，工厂返回冻结对象。

  - 非法输入立即抛 `VizError`，`code` 以 `XH_VIZ_` 开头，`detail` 带着出问题的原始输入；`isVizError` 在重复安装时也能认出同形错误。
  - `@xihan-ui/headless` 与三个适配器把它列进 `dependencies`，安装适配器时一并装上，不需要单独安装。

- dd883d7: `@xihan-ui/viz` 新增数字、时间与时长格式。

  - `createNumberFormat(locale, spec)`：以 `Intl.NumberFormat` 为底，按参数缓存；支持百分比、货币、单位、紧凑记数（zh-CN 得到「1.2 万」「3.4 亿」，en 得到「12K」）、固定小数位与有效数字。参数不合法（缺货币代码、语言标签非法）抛 `XH_VIZ_INVALID_ARGUMENT`。
  - `tickFormat(step, locale, spec)`：精度由刻度步长推导，同一根轴上的标签小数位一致（`0.0`、`0.5`、`1.0`）；百分比先乘 100 再推导；紧凑记数写到步长最低一位，`12500` 不会被写成「13K」。
  - `roundToTotal(values, total, digits)`：最大余数法，取整后的合计恰为目标，三个三分之一得到 34、33、33。
  - `createTimeFormat(locale, timeZone)`：刻度标签按日期落在的最粗一级边界显示（1 月 1 日显示年份、月初显示月份、零点显示日期）；`full` 给提示框与可及名用，带到指定粒度的全部字段。
  - `createDurationFormat(locale, units)`：从最高的非零单位起连续取两个单位（可调），单位文字由调用方按语言提供。

- 27a61c2: 新增子路径 `@xihan-ui/viz/graph`：关系布局。

  - `forceSimulation(count, links, options, initial?)`：力导模拟。速度 Verlet 积分，α 约 300 轮从 1 衰减到 `alphaMin`；力有连线弹簧（强度缺省 1 / 两端较小的度数）、电荷（四叉树 Barnes–Hut，θ 缺省 0.9）、向心、碰撞（四叉树）与朝 x / y 定位。初始位置按叶序排开，重合时的微扰用种子随机数，同样的输入永远得到同样的布局。
  - `run()` 同步跑到收敛；`tick(n)` 逐轮推进；`fix` / `release` 钉住与松开节点，`reheat` / `setAlphaTarget` 供拖拽时局部重算。
  - 四叉树平铺在类型化数组里、逐轮复用缓冲：1 千个节点、2 千条连线同步跑完 300 轮实测约 290 ms。
  - `circular(count, { center, radius, group, groupGap })`：环形布局，按分组聚在一起、等角排在圆上，组间多留空当，自 12 点方向顺时针。
  - 不从包入口导出，子路径单独计体积：实测 3.18 kB（gzip），限额 3.5 kB。

- 02f3921: 新增子路径 `@xihan-ui/viz/hierarchy`：层级布局。

  - `hierarchy(data, children)` 把嵌套数据建成层级节点，`stratify(rows, { id, parentId })` 把扁平的行按父 id 组树；id 重复、父节点不存在、多个根、没有根、成环或共享子树一律报 `XH_VIZ_HIERARCHY`，不静默丢行。
  - 节点带深度、高度、父子与聚合值，提供 `each` / `eachBefore` / `eachAfter` 三种遍历、`sum`、`count`、`sort`、`ancestors`、`descendants`、`leaves`、`links`、`path`、`find`。
  - `treemap(root, { size, tile, paddingInner, paddingOuter, paddingTop, round })`：铺法 `squarify`（目标宽高比缺省黄金比）、`binary`、`slice`、`dice`、`slice-dice`，也可以传自定义铺法。
  - `partition(root, { size, padding })`：冰柱图的分区，旭日图把 x 当角度、y 当半径；`pack(root, { size, padding, radius })`：兄弟圆前链排布加最小外接圆，随机次序取固定种子，结果只由数据决定。
  - 不从包入口导出：只画直角坐标图的应用不为它付字节。子路径单独计体积，实测 4.39 kB（gzip），限额 4.5 kB。

- f74b290: 面积标记支持横向：`AreaMark` 新增 `orientation`（缺省 `vertical`），`horizontal` 时沿 y 铺开、以点上的 `x0` 为基线，供转置后的面积图使用。`KeyedPoint` 新增 `x0`，点序列插值与过渡的「从基线升起」同样按 `x0` 处理。
- 3501667: `@xihan-ui/viz` 新增缩放窗口的数学、种子随机与统计布局。

  - 窗口：`AxisWindow` 用定义域的比例 `[0, 1]` 表达一段窗口。`zoomAt` 以锚点为中心缩放，锚点对着的定义域值不动，跨度夹在 `minSpan` / `maxSpan` 内；`pan` 按跨度的倍数平移，到头停住；`clampWindow` 把窗口推回 `[0, 1]`。`windowToDomain` / `domainToWindow` 在连续轴上换算（linear、time、log、symlog）；`windowToIndexRange` / `indexRangeToWindow` 在类目轴上取整到类目边界；`pixelsToWindow` 把一段像素换成窗口，纵轴自下而上也得到 `start ≤ end`。
  - 随机：`createRandom`（mulberry32）同一个种子给出同一串数；`hashSeed`（FNV-1a）把字符串散成种子；`jitter(identity, amount)` 以数据身份为种子给出抖动偏移，重渲染、换序都落在同一处。
  - 统计布局：`waterfall` 逐步累计，小计从 0 画到累计值；`boxplotStats` 按 R-7 求四分位，须线到 1.5 倍四分距以内最远的点，其外为离群点；`kde` 核密度估计（高斯或 Epanechnikov，带宽缺省 `silvermanBandwidth`）；`linearRegression` 最小二乘与决定系数；`movingAverage` 尾随窗口平均。缺失值一律跳过，不按 0 处理。

- 1937ab6: `@xihan-ui/viz` 新增插值。

  - 基础：`interpolateNumber`、`interpolateRound`、`interpolateDate`、`interpolateArray`、`interpolateObject`、`interpolateString`（以终点为模板插值其中的数字），以及按终点类型分派的 `interpolate`；两端类型不一致时报错。`piecewise` 串联多段，`quantize` 等距取样。
  - 颜色：`interpolateOklab` 在 OKLab 里直线插值，`interpolateOklch` 走最短色相弧、一端是灰色时沿用另一端的色相。只用于构建期生成色阶、校验与 Canvas 渲染；SVG 运行时着色交给样式里的 `color-mix()`。
  - 几何：柱与扇区的参数（位置、尺寸、起止角、内外半径）用 `interpolateObject` 插值；折线与面积用 `interpolatePoints` 按数据键对齐点序列——两边都有的键从旧位置移到新位置，新增的键从相邻旧点的位置出现，删除的键并入相邻新点后消失，再由插好的点重新生成路径，路径命令结构不一致也不会形变跳变。

- 57922f2: 图表的路径类标记在数据更新时按几何参数插值，不再第一帧就跳到终态：

  - `@xihan-ui/viz` 新增 `PathSegment` 与 `segmentsPath()`；`PathMark` 可带 `segments`（由折线段拼成的几何参数），前后两帧段数与每段点数相同时过渡逐点插值并重新生成路径，形状不同时仍只淡变。
  - 直角坐标图的刻度线、棒棒糖的杆、箱线的须与中位线、小提琴轮廓、K 线的影线与美国线、瀑布连接线，以及关系图的箭头都带上折线段几何：值域变化或图例切换时与同一数据的点、实体、刻度字同步移动。刻度线拆成按刻度值键控的独立标记。

- a551a9a: `@xihan-ui/viz` 新增路径接收端 `PathSink` 与 SVG 路径构建器 `createSvgPath(digits)`。

  - `PathSink` 与 Canvas 2D 的路径方法同名同义（`moveTo`、`lineTo`、`bezierCurveTo`、`quadraticCurveTo`、`arc`、`arcTo`、`rect`、`closePath`），形状生成器只写入它：同一个生成器既能产出 SVG 的 `d`，也能直接驱动 `CanvasRenderingContext2D`。
  - SVG 构建器按 Canvas 语义画弧：有当前点时先直线接到弧起点，整圆拆成两个半圆，`arcTo` 画与两条边相切的圆角、三点共线时退成直线。数值缺省保留 2 位小数，控制大数据量时的 DOM 体积；半径为负时报错。

- 65efb60: 矩形标记与 `roundedBar` 的 `baseline` 新增 `'none'`：不贴基线的独立矩形（桑基图的节点、矩形树图的块、焦点环）四角都圆，半径夹到宽高较小者的一半；过渡里新出现时从中心展开。原有的 `'start'` / `'end'` 不变，柱子仍只圆远离基线的一端。
- a6d5ad7: `@xihan-ui/viz` 新增降采样，只作用于绘制，提示框、键盘遍历与数据表始终用原始数据。

  - `lttb`：Largest-Triangle-Three-Buckets，保留首尾，结果是原数据的子序列、长度恰为名额，形状最忠实。
  - `minMax`：每桶保留首、最小、最大、末四个点，全局的最大值与最小值一定保留，监控类数据的尖峰不会丢。
  - `average`：每桶取平均，得到新的点。
  - 缺失的点是折线的断点，`lttb` 与 `minMax` 采样后原样保留，两侧各自采样。`needsSampling(count, plotWidth)`：点数超过绘图区宽度两倍时才需要降采样。

- ad17b85: 新增子路径 `@xihan-ui/viz/sankey`：桑基布局。

  - `sankey(nodes, links, { size, nodeWidth, nodePadding, nodeAlign, nodeSort, iterations })`：节点值取流入与流出里较大的，深度按拓扑序的最长路径，`nodeAlign` 取 `justify`（缺省）/ `start` / `end` / `center` 分列；纵向比例由最挤的一列决定，几轮松弛把节点移向相连节点的流量加权中心，每轮后解开重叠；流带在节点两端按对端的位置排开。
  - `sankeyLinkPath(link, orientation)` 写出流带的中线（两端水平进出），以流带宽度为线宽描出来；`vertical` 横纵对调。
  - 成环报 `XH_VIZ_SANKEY_CYCLE`，`detail.cycle` 列出环路；未知节点、自环、负值报 `XH_VIZ_INVALID_ARGUMENT`，重复节点报 `XH_VIZ_DUPLICATE_KEY`。
  - 不从包入口导出，子路径单独计体积：实测 2.09 kB（gzip），限额 2.5 kB。

- 82b083b: `@xihan-ui/viz` 新增比例尺与定义域推断。全部比例尺冻结不可变，`nice()` 返回新的比例尺。

  - 连续：`scaleLinear`（可分段，`[0, 50, 100] → [a, b, c]`）、`scalePow`、`scaleSqrt`（气泡半径用它，面积才与数值成正比）、`scaleLog`（定义域含 0 或跨越正负时抛 `XH_VIZ_LOG_DOMAIN`；跨度不足 3 个数量级时补 2、5 倍刻度）、`scaleSymlog`。都有 `map`、`invert`、`ticks`、`tickFormat(locale, count, spec)`、`nice`，`clamp` 与 `round` 可选。缺失值映射为 `undefined`。
  - 时间：`scaleTime` / `scaleUtc`，刻度与取整按日历推进，标签多尺度；可传入其他时区的间隔与 `timeZone`。
  - 色阶位置：`scaleSequential` / `scaleDiverging` 输出 t ∈ [0, 1]（发散以 0.5 为中点），始终钳制，颜色交给样式在令牌之间插值。
  - 分档：`scaleQuantize`、`scaleQuantile`、`scaleThreshold` 输出档位序号，`invertExtent` 给出每档的取值区间。
  - 类目：`scaleBand` 与 `scalePoint` 共用步长，point 落在同参数 band 的中线上，柱线组合时点正落在柱中间；`invert` 按格子反查类目。`scaleOrdinal` 的定义域必须显式给出，没见过的键返回 `undefined`，值域比定义域短时报错、不循环复用。重复的键抛 `XH_VIZ_DUPLICATE_KEY`。
  - `inferDomain(values, options)`：数据为空时为 [0, 1]；`bars` 轴强制包含 0，被固定成不含 0 时抛 `XH_VIZ_BAR_BASELINE`；作者固定的一端不外扩、不取整。

- 017ed3c: `@xihan-ui/viz` 新增与渲染器无关的场景。

  - 标记：`rect`、`arc`、`line`、`area`、`symbol`、`path`、`text`、`group`，判别键为 `kind`。标记只带几何参数与语义着色引用（色槽 1–8、色阶位置、语气、涨跌、符号、纹理序号），不含任何颜色值；SVG 与 Canvas 消费同一份场景。
  - `createScene`：分为 back / data / front 三层，校验标记键在整个场景内唯一（含分组里的子标记）与着色引用的取值，然后整体冻结。`version` 只在几何变化时递增，过渡中的中间帧另带 `frame` 进度。
  - `diffScenes` 按键求出进入、更新、退出，更新标出有无变化；`sceneMarks` 按层序展开全部标记并累计分组平移；`markPath` 把形状标记转成绝对坐标的路径，`curveOf` 按名字取曲线。
  - `arc` 与 `roundedBar` 只校验自己的几何字段，带着其他字段的对象（如标记）也能直接传入。

- 6b02e77: `@xihan-ui/viz` 新增形状生成器。全部只写入 `PathSink`：不传 sink 返回 SVG 路径字符串，传入 Canvas 2D 上下文时直接绘制。

  - 曲线：`curveLinear`、`curveLinearClosed`、`curveMonotoneX` / `curveMonotoneY`（Fritsch–Carlson 单调三次插值，不越过数据点，是数据曲线「平滑」的唯一实现）、`curveStep` / `curveStepBefore` / `curveStepAfter`、`curveCatmullRom` / `curveCatmullRomClosed`（向心，不打结）、`curveBasis`、`curveBundle(beta)`、`curveBumpX` / `curveBumpY` / `curveBumpRadial`。不提供会制造不存在极值的自然三次样条。
  - `line`、`area`、`lineRadial`、`areaRadial`：缺失的点处断开，不按 0 连过去；面积的回程基线与上沿用同一条曲线对齐。
  - `arc` / `arcCentroid`：角度 0 在 12 点方向、顺时针为正。扇区间隙是与径向边平行的等宽条带，宽度不随半径变化，饼的尖端落在两条边线的交点；`cornerRadius` 夹到环厚一半，并缩到弧长容得下两侧圆角。
  - `pie`：间隙角计入每个扇区自己的角度范围，角度之和恰为一圈；负值抛 `XH_VIZ_NEGATIVE_SHARE`。`foldSmall` 按最大扇区数或最小占比把尾部并成「其他」，并入的条目原样保留供提示框列出。
  - `stack`：次序 none / appearance / ascending / descending / insideOut / reverse，偏移 none / expand / diverging / silhouette / wiggle；每段 `y1 − y0` 恒等于它的值，缺失值是不画的空段，每列朝上、朝下各标出最外层的段；百分比堆叠遇到负值报错。
  - `symbol`：circle、square、diamond、triangle、triangleDown、cross、star、wye 八种，以面积为尺寸，视觉等重，次序与色槽对齐（`SYMBOL_NAMES`）。
  - `roundedBar`：只在远离基线的一端做圆角，半径夹到 min(半径, 厚度 / 2, 长度)。`link` 画横向、纵向与径向的连线。

- 4403744: `@xihan-ui/viz` 新增几何拾取。命中走几何，不依赖 DOM，粗指针与 Canvas 渲染共用同一套逻辑。

  - `createQuadtree`：一次建好、不可变的四叉树，`find` 取半径内最近点（距离相同取输入里靠前的），`findAll` 按距离列出，`visit` 先序遍历。
  - `pointInArc`、`pointInPolygon`、`polygonArea`（屏幕坐标下顺时针为正）、`polygonCentroid`。
  - `createPicker(scene)`：只看数据层里未退场、可聚焦的标记。柱按整条带宽 × 绘图区值域命中，很短的柱也能命中，堆叠时指针落在哪段就是哪段；折线与面积沿对齐轴取最近的键、再按另一轴取最近系列；散点用四叉树，命中半径 = max(符号外延 + 2px, 最小半径)；扇区按极坐标判定。最小命中半径细指针 12、粗指针（touch、pen）22，即命中区 24px 与 44px。`axis` 模式报告同一自变量位置上的全部系列，每个系列一个。

- cc759f8: `@xihan-ui/viz` 新增文字度量、折行与省略。

  - `TextMeasurer` 协议以接口注入，`version` 在度量结果可能变化时递增，依赖度量的布局据此重算；挂载后可以换成基于 Canvas `measureText` 的精确度量器。
  - `createEstimatingMeasurer()`：确定性估算器，按字符类累加宽度（全角 1em、数字 0.6em、大写 0.68em、小写 0.55em、窄字符与空格 0.28em、宽字符 0.85em），服务端与首帧算出同一份布局。
  - `wrapText`：中日韩文字逐字可断、拉丁文按词断、单词本身过长时逐字断；收尾标点与前一个字一起换行，不单独落到行首；显式换行符强制断行；超过 `maxLines` 时余下的文字并进最后一行再截断。
  - `ellipsize`：截到能放下「前缀 + …」的最长前缀，连「…」都放不下时返回空串。

- 6e39397: `@xihan-ui/viz` 新增时间间隔与时间刻度。

  - `localIntervals` / `utcIntervals`：毫秒、秒、分、时、日、周、月、年，各带 `floor`、`ceil`、`round`、`offset`、`range`、`count`、`every`，全部返回新的 `Date`、不修改入参。时、分、秒按绝对时长推进；日、周、月、年按日历推进，跨夏令时的一天是 23 或 25 小时，日刻度始终落在当地零点。
  - `every(n)` 按上一级里的序号取余：每 15 分钟落在 0、15、30、45 分，每两日在月初重新起算。
  - `createTimeIntervalSet(calendar)`：间隔算法只经由 `TimeCalendar`（墙上时间与时间点互换）读写日期字段，本地与 UTC 两份日历已内建（`localCalendar`、`utcCalendar`），任意时区传入按同一接口实现的日历即可得到同一套间隔。
  - `timeTickInterval` / `timeTicks`：按目标间隔在 1、5、15、30 秒 / 分，1、3、6、12 时，1、2 日，1 周，1、3 月，1 年里取最近者；跨度超过一年按年数取刻度步长，不足一秒按毫秒取。周刻度缺省从星期一开始，`firstDayOfWeek` 可改。
  - 年份 0–99 按字面年份处理，不映射到 1900 年代；无效日期立即抛 `XH_VIZ_INVALID_ARGUMENT`。

- b2f213a: 过渡里的分组逐个子标记对齐：新出现的系列分组不再整组淡入，里面的柱各自从基线长出、扇区各自展开；整组退出时子标记各自收回基线并淡出；减弱动效下子标记照样淡入淡出。按系列错开时，分组按它里面的系列计算延迟。
- 1898319: `@xihan-ui/viz` 新增场景过渡 `planTransition` / `sceneAt`。按键把新旧场景对齐成进入、更新、退出三类轨迹，按几何参数插值，不插值路径字符串。

  - 更新：柱插值位置与尺寸，扇区插值起止角与内外半径，折线与面积按数据键对齐点序后重新生成路径，终点精确等于新场景。
  - 进入：`enterFrom` 为 baseline 时柱从基线长出、扇区结束角从起始角增长、面积从基线升起；center 从中心展开；fade 只淡入。折线、点、文字总是淡入。
  - 退出：收回基线并淡出，期间标为 `exiting`、不参与命中，到终点时移除。
  - 按系列错开，至多 5 步，同一系列内不错开；缓动由调用方提供，作用在每条轨迹的局部进度上。`reducedMotion` 下几何直接落到终态，只保留淡入淡出。
  - `sceneAt(plan, elapsed)` 以经过的毫秒数取那一帧，中间帧带着 `frame` 进度与新场景的 `version`，到达总时长后返回新场景本身。

- 30ac1bc: `@xihan-ui/viz/hierarchy` 加上整齐的树与树状图。

  - `tree(root, { size | nodeSize, separation })`：Reingold–Tilford 整齐的树，按 Buchheim、Jünger 与 Leipert 的线性时间做法实现；父节点落在第一个与最后一个子节点的正中，同层相邻节点至少隔开一份间隔（缺省同父 1 份、不同父 2 份），y 按深度排开。
  - `cluster(root, { size | nodeSize, separation })`：树状图，叶子一律落在最底一层、等距排开，父节点在子节点的正中、比最高的子节点高一层。
  - 两者只看结构，不需要先 `sum()`；`size` 缩放到整体尺寸，`nodeSize` 按固定间距排、根落在原点。
  - 子路径实测从 4.39 kB 涨到 5.58 kB（gzip），限额从 4.5 kB 调到 6 kB。

### Patch Changes

- 21e59f2: 顶层的冻结常量与曲线工厂标成纯调用：只用到直角坐标图常用路径（linear / band / time 比例尺、线与面积、堆叠、坐标轴、文字、拾取、降采样）时，没用到的曲线与常量能被摇树摇掉，gzip 后由 12.46 KB 降到约 11.3 KB。体积门禁新增这条路径，上限 12 KB。
