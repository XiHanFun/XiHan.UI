# @xihan-ui/chat-stream

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

### Patch Changes

- Updated dependencies [7afc700]
- Updated dependencies [12026b1]
- Updated dependencies [0597fe4]
- Updated dependencies [b2d035f]
- Updated dependencies [8e5cb14]
- Updated dependencies [b1cec7e]
- Updated dependencies [a2eff7c]
- Updated dependencies [618b354]
- Updated dependencies [6c6a669]
- Updated dependencies [2f1f032]
- Updated dependencies [88a9bfa]
- Updated dependencies [6c7b077]
- Updated dependencies [b977c24]
- Updated dependencies [e97f80a]
- Updated dependencies [26c5a1f]
- Updated dependencies [bd8c498]
- Updated dependencies [0ad19a5]
- Updated dependencies [ee8a148]
- Updated dependencies [9e56caf]
- Updated dependencies [9553398]
- Updated dependencies [2dd6d2f]
- Updated dependencies [89fa2e4]
- Updated dependencies [e5bef70]
- Updated dependencies [fc568ed]
- Updated dependencies [c151baf]
- Updated dependencies [3170011]
- Updated dependencies [def27eb]
- Updated dependencies [8e8108e]
- Updated dependencies [2b8f101]
- Updated dependencies [1c1616d]
- Updated dependencies [85f6ab9]
- Updated dependencies [1ac7d41]
- Updated dependencies [d4f17ae]
- Updated dependencies [c833fbd]
  - @xihan-ui/core@5.0.0

## 4.2.0

### Patch Changes

- @xihan-ui/core@4.2.0

## 4.1.0

### Patch Changes

- @xihan-ui/core@4.1.0

## 4.0.1

### Patch Changes

- @xihan-ui/core@4.0.1

## 4.0.0

### Patch Changes

- Updated dependencies [0116647]
- Updated dependencies [2724f92]
- Updated dependencies [018b5b1]
- Updated dependencies [c2dc637]
- Updated dependencies [3473495]
- Updated dependencies [6cf0550]
  - @xihan-ui/core@4.0.0

## 3.2.0

### Patch Changes

- Updated dependencies [a566f82]
- Updated dependencies [3f54a40]
- Updated dependencies [b33ae37]
- Updated dependencies [831acc9]
  - @xihan-ui/core@3.2.0

## 3.1.0

### Patch Changes

- Updated dependencies [fc9c306]
  - @xihan-ui/core@3.1.0

## 3.0.0

### Minor Changes

- 6309422: 会话容器改为一棵消息树，补齐重新生成、失败重试、编辑重发、分支切换、附件提交与续写：

  - `UIMessage` 新增 `parentId`（会话第一条为 `null`，同一 `parentId` 下互为分支；缺席时按数组顺序相连）与 `status`（助手消息的结束方式：`streaming` / `complete` / `aborted` / `error`）。
  - `ThreadStore` 新增 `regenerate(messageId?)`、`retry()`、`edit(messageId, content)`、`continue(messageId?)`、`selectBranch(messageId, index)` 与 `getTree()`；`submit` 除纯文本外接受 parts（`text` / `file` / `data`），附件与 UIMessage 的 parts 同形。
  - 快照新增 `branches`：当前路径上每条消息在兄弟中的 `{ index, count }`；`messages` 是从根往下每个分叉取选中那一支的路径。
  - `createThreadStore` 新增 `messages` 选项，用线性历史或 `getTree()` 导出的整棵树恢复会话。
  - `ChatRequest` 新增 `trigger` 与 `messageId`，HTTP 传输把两者并进请求体；续写时 `messages` 的最后一条就是要接着写的那条助手消息，截断在半句上的正文接着长。
  - `stop()` 当场把在途的回复收尾并记为 `aborted`，不再等传输那头关流。
  - `createReduceState` 新增第三个参数 `from`：在已有消息上接着归约。

- 0ed99b4: **新增** `Citation` 组件（引用来源）：Vue、React 与 Web Components 同时支持行内引用、来源预览、来源列表、方向键导航及完整可访问关系。

  `sources` 与 `@xihan-ui/chat-stream` 的 `SourcePart[]` 结构兼容；URL 来源也可携带 `anchors`。新增皮肤约 8 KB，包含预览 surface、引用编号和来源列表样式。

### Patch Changes

- 1ee904b: 传输在取消时直接抛错（而不是正常收尾）时，已被 `stop()` 或被新一轮顶掉的那一轮不再把会话记成 `error`，也不改写新一轮的状态；内置的 HTTP 传输不受影响。
- 8ca7eaa: 订阅通知改为直接遍历订阅表，不再先拷一份快照：`setMotionOverride`、视觉环境控制器、`onXhConfigChange`、对话线程仓库的订阅者，在通知途中退订、还没轮到的不再收到这一轮；通知途中新订阅的在同一轮里也会收到。回调里退订自己照旧安全。
- Updated dependencies [f660e16]
- Updated dependencies [25ccc68]
- Updated dependencies [6dec15e]
- Updated dependencies [a85b582]
- Updated dependencies [a72c5bb]
- Updated dependencies [41a393e]
- Updated dependencies [fac80f7]
- Updated dependencies [4e619a5]
- Updated dependencies [e19c0b4]
- Updated dependencies [3092b47]
- Updated dependencies [d210959]
- Updated dependencies [d1cca09]
- Updated dependencies [65d6fc3]
- Updated dependencies [467c967]
- Updated dependencies [bc8120d]
- Updated dependencies [f7cec9b]
- Updated dependencies [768b06f]
- Updated dependencies [6356589]
- Updated dependencies [94aee78]
- Updated dependencies [8a2b0fa]
- Updated dependencies [c292b0f]
- Updated dependencies [1b0701c]
- Updated dependencies [7878927]
- Updated dependencies [ad0b9da]
- Updated dependencies [25db668]
- Updated dependencies [8ca7eaa]
- Updated dependencies [0c8d389]
- Updated dependencies [e90cad8]
- Updated dependencies [f2e9fb0]
- Updated dependencies [4edea3b]
- Updated dependencies [7bf67f9]
- Updated dependencies [606ef8d]
- Updated dependencies [2f6e6b3]
- Updated dependencies [648c368]
- Updated dependencies [1b7ad21]
- Updated dependencies [d48dbf7]
- Updated dependencies [4920b59]
- Updated dependencies [6d95e8c]
- Updated dependencies [bfbf28b]
  - @xihan-ui/core@3.0.0

## 2.1.0

### Patch Changes

- Updated dependencies [1e7bc1d]
- Updated dependencies [abd9e8c]
  - @xihan-ui/core@2.1.0

## 2.0.0

### Major Changes

- c8790c8: **`@xihan-ui/kernel`、`@xihan-ui/machine`、`@xihan-ui/behavior` 三个包合并成 `@xihan-ui/core`。三个旧包名不再发布，也没有转发包。**

  三者原本是一条严格的链（`machine` 依赖 `kernel`，`behavior` 依赖 `kernel` 与 `motion`），从不单独安装：装了任意一个适配器就三个一起来。分成三个包对使用者没有取舍空间，只多出两份包名、两份版本号与两份 README。合并之后公开包从 18 个减到 16 个。

  **导出的名字一个都没有变。** 原先从三个包里导出的东西现在全部从 `@xihan-ui/core` 的主入口导出，签名与行为不变。两处例外：

  - `Dict` 本来就是结构原语那一段的类型，状态机那一段只是转手再导出一遍，现在只剩一处定义。
  - 锁步版本不一致那条诊断（`core.version-mismatch`）的 `detail` 字段由 `kernelVersion` 改名为 `coreVersion`，播报文案里的包名同步改口。读这条诊断做分流的要跟着改字段名。

  ## 包名怎么改

  | 从前                 | 现在             |
  | -------------------- | ---------------- |
  | `@xihan-ui/kernel`   | `@xihan-ui/core` |
  | `@xihan-ui/machine`  | `@xihan-ui/core` |
  | `@xihan-ui/behavior` | `@xihan-ui/core` |

  同一个文件里如果原来从两个或三个旧包各引一行，合并之后是同一个模块说明符，按自己的 lint 规则并成一行即可。

  ## 子路径怎么改

  子入口一条不少，名字原样平移：

  | 从前                          | 现在                        |
  | ----------------------------- | --------------------------- |
  | `@xihan-ui/kernel/metadata`   | `@xihan-ui/core/metadata`   |
  | `@xihan-ui/kernel/skin-check` | `@xihan-ui/core/skin-check` |
  | `@xihan-ui/kernel/vite`       | `@xihan-ui/core/vite`       |
  | `@xihan-ui/machine/vanilla`   | `@xihan-ui/core/vanilla`    |
  | `@xihan-ui/behavior/presence` | `@xihan-ui/core/presence`   |

  ## 依赖怎么改

  `package.json` 里把三个旧包名删掉，换成一条 `@xihan-ui/core`。装适配器的使用者不用动：`@xihan-ui/vue` 与 `@xihan-ui/web-components` 已经改成依赖 `@xihan-ui/core`，升级适配器就一并带过来。

### Patch Changes

- 3f9c145: **修复**随包发到 npm 的文本。

  `@xihan-ui/pointer` 补上 README。它是唯一一个没有 README 的发布包，npm 页面此前只有 package.json 的一句 description。

  三份 README 的示例引了不存在的名字，照抄即解析失败：`@xihan-ui/chat-stream` 的 `createChatStore` / `httpSseTransport` 改成真名 `createThreadStore` / `createHttpSseTransport`；`@xihan-ui/behavior` 的 `createDismissableLayer` 改成 `createDismissLayer`；`@xihan-ui/vue` 的 `XhDialog` 改成组合式的 `XhDialogRoot` / `XhDialogTrigger` / `XhDialogContent`。

  `@xihan-ui/web-components` 的 README 把两处过期说法改写成结论：逐帧 parity 的覆盖面是 101 个套件（不是只有 Button 一个），收不进来的 26 个逐条登记在 `EXCLUDED` 里并各带理由，dialog 属两端 presence 模型不同的永久性差异；受控 open 的跨适配器一致性由两端各自跑同一份 conformance 规格覆盖。

  十份 CHANGELOG 里 38 处指向仓外文档目录的引用整体删掉——那些路径不随包发布，点过去是 404。

  三道门禁把这几类问题焊住：`check-package-manifests`（每个发布包必须有 README，16 张包清单与实际发布包双向对账）、`check-doc-imports`（README 与文档正文里的导入名必须在公开面里）、`check-published-refs`（包内文本不许指向仓外文档目录）。

- Updated dependencies [bdf4028]
- Updated dependencies [c7966d3]
- Updated dependencies [9658294]
- Updated dependencies [f070bb8]
- Updated dependencies [249819e]
- Updated dependencies [589d192]
- Updated dependencies [7e512dc]
- Updated dependencies [09a1a45]
- Updated dependencies [2dd6293]
- Updated dependencies [d822ffd]
- Updated dependencies [3116bd3]
- Updated dependencies [b23b40a]
- Updated dependencies [19570ad]
- Updated dependencies [f0a2e34]
- Updated dependencies [19570ad]
- Updated dependencies [ce5d75a]
- Updated dependencies [d5576cb]
- Updated dependencies [9bf22c1]
- Updated dependencies [147daa4]
- Updated dependencies [ffe0797]
- Updated dependencies [add5b79]
- Updated dependencies [1540cc1]
- Updated dependencies [8b4d452]
- Updated dependencies [5982974]
- Updated dependencies [3577e4c]
- Updated dependencies [ab984e8]
- Updated dependencies [7640d5c]
- Updated dependencies [8e8d953]
- Updated dependencies [21b006a]
- Updated dependencies [bd67168]
- Updated dependencies [48d6b88]
- Updated dependencies [0d35f1a]
- Updated dependencies [ed347e1]
- Updated dependencies [db52f9b]
- Updated dependencies [1042c06]
- Updated dependencies [c8790c8]
- Updated dependencies [3f9c145]
- Updated dependencies [1f472ba]
- Updated dependencies [fc0ecaf]
- Updated dependencies [963fe2c]
- Updated dependencies [eabcc37]
- Updated dependencies [07e29f9]
- Updated dependencies [c544218]
- Updated dependencies [b991bb5]
- Updated dependencies [ff3593c]
- Updated dependencies [95ebc66]
- Updated dependencies [4babe65]
- Updated dependencies [80e6fdf]
- Updated dependencies [f45e0f7]
- Updated dependencies [5397ae3]
- Updated dependencies [82b5de5]
- Updated dependencies [842da07]
- Updated dependencies [a15f0f3]
- Updated dependencies [7f77bdd]
- Updated dependencies [00bca80]
- Updated dependencies [30a811b]
- Updated dependencies [d366e45]
- Updated dependencies [9c32ad7]
- Updated dependencies [33c6805]
  - @xihan-ui/core@2.0.0

## 1.1.0

### Patch Changes

- Updated dependencies [03fb633]
  - @xihan-ui/kernel@1.1.0

## 1.0.0

### Major Changes

- bc65cb7: 首个公开版本：框架无关的 UI 基座。

  自研薄 FSM 内核 + headless（anatomy / machine / connect）+ 设计令牌与主题运行时 + 样式层，
  102 个组件在 Vue 与 Web Components 两套适配器上共用同一份内核，跨适配器一致性套件与
  真实 Chromium 里的无障碍扫描、浮层定位契约全绿。

  浮层定位、虚拟滚动、Web Components 响应式基类、代码着色、流式 Markdown 均为自研，
  运行时不带第三方依赖。

### Patch Changes

- Updated dependencies [e73b671]
- Updated dependencies [d0202b2]
- Updated dependencies [7da1272]
- Updated dependencies [bc65cb7]
- Updated dependencies [ed01a81]
- Updated dependencies [84b1aa3]
- Updated dependencies [a321a50]
- Updated dependencies
- Updated dependencies [8d35702]
- Updated dependencies [239eb5d]
- Updated dependencies [89d8c54]
- Updated dependencies [516bd46]
- Updated dependencies [24721f4]
- Updated dependencies [9548330]
- Updated dependencies [7a5d898]
- Updated dependencies [4b949c2]
  - @xihan-ui/kernel@1.0.0

## 1.0.0-preview.0

### Patch Changes

- Updated dependencies [e73b671]
  - @xihan-ui/kernel@1.0.0-preview.0

## 1.0.0-alpha.3

### Patch Changes

- Updated dependencies [d0202b2]
- Updated dependencies [7da1272]
- Updated dependencies [ed01a81]
- Updated dependencies [a321a50]
- Updated dependencies [8d35702]
- Updated dependencies [516bd46]
- Updated dependencies [9548330]
  - @xihan-ui/kernel@1.0.0-alpha.3

## 1.0.0-alpha.2

### Patch Changes

- Updated dependencies [7a5d898]
  - @xihan-ui/kernel@1.0.0-alpha.2

## 1.0.0-alpha.1

### Patch Changes

- Updated dependencies [239eb5d]
- Updated dependencies [89d8c54]
- Updated dependencies [24721f4]
- Updated dependencies [4b949c2]
  - @xihan-ui/kernel@1.0.0-alpha.1

## 1.0.0-alpha.0

### Major Changes

- bc65cb7: 首个公开版本：框架无关的 UI 基座。

  自研薄 FSM 内核 + headless（anatomy / machine / connect）+ 设计令牌与主题运行时 + 样式层，
  102 个组件在 Vue 与 Web Components 两套适配器上共用同一份内核，跨适配器一致性套件与
  真实 Chromium 里的无障碍扫描、浮层定位契约全绿。

  浮层定位、虚拟滚动、Web Components 响应式基类、代码着色、流式 Markdown 均为自研，
  运行时不带第三方依赖。

### Patch Changes

- Updated dependencies [bc65cb7]
- Updated dependencies [84b1aa3]
  - @xihan-ui/kernel@1.0.0-alpha.0
