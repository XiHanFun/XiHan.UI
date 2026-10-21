# @xihan-ui/backgrounds

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
  - @xihan-ui/motion@5.0.0

## 4.2.0

### Patch Changes

- @xihan-ui/core@4.2.0
- @xihan-ui/motion@4.2.0

## 4.1.0

### Patch Changes

- @xihan-ui/core@4.1.0
- @xihan-ui/motion@4.1.0

## 4.0.1

### Patch Changes

- @xihan-ui/core@4.0.1
- @xihan-ui/motion@4.0.1

## 4.0.0

### Patch Changes

- Updated dependencies [b3153a4]
- Updated dependencies [0116647]
- Updated dependencies [2724f92]
- Updated dependencies [018b5b1]
- Updated dependencies [c2dc637]
- Updated dependencies [3473495]
- Updated dependencies [6cf0550]
  - @xihan-ui/motion@4.0.0
  - @xihan-ui/core@4.0.0

## 3.2.0

### Patch Changes

- Updated dependencies [a566f82]
- Updated dependencies [3f54a40]
- Updated dependencies [b33ae37]
- Updated dependencies [831acc9]
  - @xihan-ui/core@3.2.0
  - @xihan-ui/motion@3.2.0

## 3.1.0

### Patch Changes

- Updated dependencies [fc9c306]
  - @xihan-ui/core@3.1.0
  - @xihan-ui/motion@3.1.0

## 3.0.0

### Patch Changes

- 896a7c1: 减弱动效下换点云直接落到新形状，粒子不再卡在旧形状上。

  此前开启减弱动效（系统 `prefers-reduced-motion: reduce` 或 `setMotionOverride('reduce')`，且 `respectReducedMotion` 未关）时，画面的时间步恒为 0，`setCloud()` 之后的形变进度永远停在起点：粒子一直停在上一份点云的形状上，而且因为形变没走完，调度循环每帧都在空画。

  现在减弱动效下换点云与 `duration: 0` 同样处理，一步落到新形状，画完一帧即停；形变进行到一半时才切到减弱动效，也会立即收尾。未开启减弱动效时的过渡时长与节奏不变。

- cac2eaf: `animate()` 与背景层按宿主元素所在的 `data-motion` 作用域判断减弱动效。

  局部容器写了 `data-motion="reduce"` 时，其中的 `animate()` 调用（包括 `@xihan-ui/animations` 的预设播放）不再播放中间帧，背景画面冻结；写了 `data-motion="default"` 时，即使应用级偏好要求减弱也照常播放。没有 `data-motion` 的页面行为不变。

- Updated dependencies [c48171d]
- Updated dependencies [df3d2ac]
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
- Updated dependencies [9c6d582]
- Updated dependencies [c17f6e3]
- Updated dependencies [245995e]
- Updated dependencies [684cf13]
- Updated dependencies [7192b57]
- Updated dependencies [5c79ac0]
- Updated dependencies [608cc0a]
- Updated dependencies [cac2eaf]
- Updated dependencies [560242d]
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
  - @xihan-ui/motion@3.0.0
  - @xihan-ui/core@3.0.0

## 2.1.0

### Patch Changes

- Updated dependencies [1e7bc1d]
- Updated dependencies [abd9e8c]
  - @xihan-ui/core@2.1.0
  - @xihan-ui/motion@2.1.0

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

- Updated dependencies [317b582]
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
- Updated dependencies [dc64383]
- Updated dependencies [33c6805]
  - @xihan-ui/motion@2.0.0
  - @xihan-ui/core@2.0.0

## 1.1.0

### Patch Changes

- Updated dependencies [5b62d15]
- Updated dependencies [03fb633]
  - @xihan-ui/behavior@1.1.0
  - @xihan-ui/kernel@1.1.0
  - @xihan-ui/motion@1.1.0

## 1.0.0

### Major Changes

- 46b82b0: 新增视觉层：WebGL2 背景效果与数据驱动粒子点云，框架无关、零第三方依赖。

  一张画面两个绘制通道——流场跑片元着色器，粒子走 `gl.POINTS`。粒子有程序化与点云两种来源：
  前者位置由粒子序号在顶点着色器里实时算出，不占顶点缓冲也不需要 CPU 逐帧更新；后者位置来自
  顶点缓冲，两份点云之间自动形变。两个通道共用同一段 GLSL，粒子因此能精确落在流场的特征位置上。

  内置 14 个效果（fluid / glass / mesh / grain / plasma / aurora / beam / ripple / orb / wave /
  starfield / nebula / flow-field / particles）。每个效果只声明一次参数规格，取默认值、钳制越界、
  生成调参界面三件事都从它推出来。

  图片、文字、SVG、参数方程统一采样成 `PointCloud`，「换形态」就是换一份点云。

  不支持 WebGL2 时降级成 CSS 静态背景，接口保持一致。

### Patch Changes

- 3469066: 官网作为第一个真实消费方落地时暴露的四条问题，全部改代码，文档随后如实描述。

  **背景层不再压掉宿主用类名写的定位。** `createBackgroundSurface` 原先在建面时就无条件量一次宿主定位，
  量到 `static`（或算不出来的空串）就写一句内联 `position: relative`。而 Vue 的函数式 ref 在元素进文档
  之前触发，此时 `getComputedStyle` 什么都算不出，于是这一句必写——内联样式压过任何层里的规则，
  宿主用类名写的 `position: absolute` 从此再也赢不回来，塌成高度 0，画布跟着 100% × 0，
  不报错、不告警、什么都不画。

  改为：宿主自带定位（内联或类名）一个字不动；量出来是 `static` 才写兜底；**还没进文档时既不写定位、
  也不挂画布**——不在文档树里的画布逃不到别的祖先上，那句投机性写入因此整个不必发生。
  宿主进文档拿到盒子的那一刻由 `ResizeObserver` 定夺，销毁时撤销观察。
  没有 `ResizeObserver` 的环境退回原行为。

  **未注册的内置效果名，错误信息不再给行不通的建议。** 原先一律指向 `registerEffect()`，可它收的是
  效果对象不是名字，照着写连类型都不过，也不提示这个效果本就在包里、导出名叫什么。
  现在内置名单独给一条，点名 `registerBuiltinEffects()` / `registerEffects([xxxEffect])` 与直接传对象三条路。
  内置效果仍然不自动注册——注册表一旦静态引上这 14 个，每个用到 `createBackgroundSurface` 的应用都要
  多吃约 35 kB（gzip 约 8.6 kB），占整包四成。新增 `BUILTIN_EFFECT_NAMES` 纯字符串清单供校验用。

  **`TabsVariant` 补上 `line`。** 文档一直写「line / card / segment，缺省是 line」，类型里却只有两档，
  使用者自然写下的 `variant="line"` 编译不过。line 是缺省档、皮肤里没有它的选择器，
  显式写与不写渲染逐值相同。

  **`tokens.css` 自带完整层序声明。** 级联层的顺序由首次声明定死，而 `tokens.css` 原先只有
  `@layer xihan.tokens { }` 取值块。先引令牌再引皮肤（此前文档推荐的顺序）会让 `xihan.tokens`
  抢在 `xihan.reset` 前面注册，实际层序与 `layers.css` 声明的不符。现在两份入口各自带一份逐字相同的
  完整声明，谁先被引到层序都成立；重复声明幂等。新增 `check-layer-order` 门禁盯住两份不许漂移，
  `pnpm gate` 由十五项变十六项。

- 8d35702: 动效与浮层口径收口。

  **减弱动效只剩一条通道。** 此前 kernel 的 `RuntimeConfig.reducedMotion` 只读系统 matchMedia、motion 包的 `setMotionOverride` 只有 animate / 滚动 / 数字动画在听，presence 与 stick-to-bottom 感知不到应用级覆盖；无 matchMedia 的宿主两包还给出相反答案（kernel 直接抛 TypeError、motion 报 reduce）。现在 kernel 依赖 motion，`reducedMotion` 缺省即 `resolveMotionPreference() === 'reduce'`（覆盖 ?? 系统偏好），没有 matchMedia 一律不减弱；glyph 转圈、backgrounds、滚动、数字动画全部走同一函数。CSS 侧 `tokens.css` 新增 `:where([data-motion='reduce'])` 块，与 `@media (prefers-reduced-motion: reduce)` 同源生成、逐条相同——作者把 `data-motion="reduce"` 打在任意容器即局部减弱。全局配置加 `motion?: 'reduce' | 'no-preference'`，Vue `provideXhConfig` / WC `<xh-config motion>` 收到即调 `setMotionOverride`。

  **缓动与时长的真源是令牌。** motion 包新增 `durations = { fast, normal, slow }`，`animate()` 缺省与 `@xihan-ui/animations` 的缺省时长都引它；`check-motion-source` 比对 primitive.json 与 easing.ts / durations.ts，值不等即红；`check-reduced-motion-channel` 禁止 motion 包之外再出现 `matchMedia('(prefers-reduced-motion')`。

  **皮肤的 reduce 块归口。** 只在两种情况自写：无限循环动画要整个停掉、有使用者时长槽的过渡要兜住穿透。image-viewer / side-nav / layout 三份纯重复令牌层的块删掉；table 的 `0.01ms !important` 改 `animation: none`；保留的 10 份每块配一份等价的 `[data-motion='reduce']` 规则。animation / transition 不再直引 `--xh-duration-*` 原语：spinner 走 `--xh-spin-duration`，skeleton 走新令牌 `--xh-shimmer-duration`（1600ms）。`check-infinite-motion` / `check-motion-primitives` 守住。

  **浮层的 placement / offset 默认值只有两种语义。** `OVERLAY_PLACEMENT_ANCHORED = 'bottom'`（气泡类）与 `OVERLAY_PLACEMENT_LIST = 'bottom-start'`（列表类）、`OVERLAY_OFFSET = 8` 从 headless 共享导出，各组件的 `<C>_DEFAULT_PLACEMENT` 改为引用它们（tooltip / hover-card / popover / popconfirm / popselect 新增导出常量），所有机器显式传 offset，不再隐式靠引擎兜底；`check-overlay-defaults` 守住。

  **层级覆盖槽齐全、后缀统一。** 22 个浮层族的 positioner / backdrop、toaster、navigation-menu 面板都有了 `--xh-<c>-layer` 槽（缺省仍是 `--xh-layer-*`）；tour / table / heatmap 的 `-z` 后缀槽改名 `-layer`（7 个，公开面变更，基线已推）。

  **进退场对称。** toast 退场位移从 distance-sm 改 distance-md（与进场、与 dialog 一致）；tour 的气泡改用 pop 族，聚光灯补退场；side-nav 折叠态弹出面板补进退场并在 Vue / WC 接上退场租约。

  **navigation-menu 的定位登记变成可验证的。** 三道浮层门禁此前按「anatomy 有 positioner」发现族，它从没被检查过；现在 `SKIN_POSITIONED` 名单要求它没有 positioner、不接引擎、面板由皮肤 absolute 排布，任一条不成立即红。`check-arrow-geometry` 增比对 JS 箭头常量（8·√2 / 8）与令牌（8px 边长 / 8px 圆角）。

- Updated dependencies [e73b671]
- Updated dependencies [d0202b2]
- Updated dependencies [7da1272]
- Updated dependencies [bc65cb7]
- Updated dependencies [e50a7c9]
- Updated dependencies [ed01a81]
- Updated dependencies [84b1aa3]
- Updated dependencies [a321a50]
- Updated dependencies
- Updated dependencies [8d35702]
- Updated dependencies [239eb5d]
- Updated dependencies [89d8c54]
- Updated dependencies [516bd46]
- Updated dependencies [466f143]
- Updated dependencies [24721f4]
- Updated dependencies [9548330]
- Updated dependencies [7a5d898]
- Updated dependencies [4b949c2]
  - @xihan-ui/kernel@1.0.0
  - @xihan-ui/behavior@1.0.0
  - @xihan-ui/motion@1.0.0

## 1.0.0-preview.0

### Patch Changes

- Updated dependencies [e73b671]
  - @xihan-ui/kernel@1.0.0-preview.0
  - @xihan-ui/behavior@1.0.0-preview.0
  - @xihan-ui/motion@1.0.0-preview.0

## 1.0.0-alpha.3

### Patch Changes

- 8d35702: 动效与浮层口径收口。

  **减弱动效只剩一条通道。** 此前 kernel 的 `RuntimeConfig.reducedMotion` 只读系统 matchMedia、motion 包的 `setMotionOverride` 只有 animate / 滚动 / 数字动画在听，presence 与 stick-to-bottom 感知不到应用级覆盖；无 matchMedia 的宿主两包还给出相反答案（kernel 直接抛 TypeError、motion 报 reduce）。现在 kernel 依赖 motion，`reducedMotion` 缺省即 `resolveMotionPreference() === 'reduce'`（覆盖 ?? 系统偏好），没有 matchMedia 一律不减弱；glyph 转圈、backgrounds、滚动、数字动画全部走同一函数。CSS 侧 `tokens.css` 新增 `:where([data-motion='reduce'])` 块，与 `@media (prefers-reduced-motion: reduce)` 同源生成、逐条相同——作者把 `data-motion="reduce"` 打在任意容器即局部减弱。全局配置加 `motion?: 'reduce' | 'no-preference'`，Vue `provideXhConfig` / WC `<xh-config motion>` 收到即调 `setMotionOverride`。

  **缓动与时长的真源是令牌。** motion 包新增 `durations = { fast, normal, slow }`，`animate()` 缺省与 `@xihan-ui/animations` 的缺省时长都引它；`check-motion-source` 比对 primitive.json 与 easing.ts / durations.ts，值不等即红；`check-reduced-motion-channel` 禁止 motion 包之外再出现 `matchMedia('(prefers-reduced-motion')`。

  **皮肤的 reduce 块归口。** 只在两种情况自写：无限循环动画要整个停掉、有使用者时长槽的过渡要兜住穿透。image-viewer / side-nav / layout 三份纯重复令牌层的块删掉；table 的 `0.01ms !important` 改 `animation: none`；保留的 10 份每块配一份等价的 `[data-motion='reduce']` 规则。animation / transition 不再直引 `--xh-duration-*` 原语：spinner 走 `--xh-spin-duration`，skeleton 走新令牌 `--xh-shimmer-duration`（1600ms）。`check-infinite-motion` / `check-motion-primitives` 守住。

  **浮层的 placement / offset 默认值只有两种语义。** `OVERLAY_PLACEMENT_ANCHORED = 'bottom'`（气泡类）与 `OVERLAY_PLACEMENT_LIST = 'bottom-start'`（列表类）、`OVERLAY_OFFSET = 8` 从 headless 共享导出，各组件的 `<C>_DEFAULT_PLACEMENT` 改为引用它们（tooltip / hover-card / popover / popconfirm / popselect 新增导出常量），所有机器显式传 offset，不再隐式靠引擎兜底；`check-overlay-defaults` 守住。

  **层级覆盖槽齐全、后缀统一。** 22 个浮层族的 positioner / backdrop、toaster、navigation-menu 面板都有了 `--xh-<c>-layer` 槽（缺省仍是 `--xh-layer-*`）；tour / table / heatmap 的 `-z` 后缀槽改名 `-layer`（7 个，公开面变更，基线已推）。

  **进退场对称。** toast 退场位移从 distance-sm 改 distance-md（与进场、与 dialog 一致）；tour 的气泡改用 pop 族，聚光灯补退场；side-nav 折叠态弹出面板补进退场并在 Vue / WC 接上退场租约。

  **navigation-menu 的定位登记变成可验证的。** 三道浮层门禁此前按「anatomy 有 positioner」发现族，它从没被检查过；现在 `SKIN_POSITIONED` 名单要求它没有 positioner、不接引擎、面板由皮肤 absolute 排布，任一条不成立即红。`check-arrow-geometry` 增比对 JS 箭头常量（8·√2 / 8）与令牌（8px 边长 / 8px 圆角）。

- Updated dependencies [d0202b2]
- Updated dependencies [7da1272]
- Updated dependencies [ed01a81]
- Updated dependencies [a321a50]
- Updated dependencies [8d35702]
- Updated dependencies [516bd46]
- Updated dependencies [9548330]
  - @xihan-ui/kernel@1.0.0-alpha.3
  - @xihan-ui/motion@1.0.0-alpha.3
  - @xihan-ui/behavior@1.0.0-alpha.3

## 1.0.0-alpha.2

### Patch Changes

- 3469066: 官网作为第一个真实消费方落地时暴露的四条问题，全部改代码，文档随后如实描述。

  **背景层不再压掉宿主用类名写的定位。** `createBackgroundSurface` 原先在建面时就无条件量一次宿主定位，
  量到 `static`（或算不出来的空串）就写一句内联 `position: relative`。而 Vue 的函数式 ref 在元素进文档
  之前触发，此时 `getComputedStyle` 什么都算不出，于是这一句必写——内联样式压过任何层里的规则，
  宿主用类名写的 `position: absolute` 从此再也赢不回来，塌成高度 0，画布跟着 100% × 0，
  不报错、不告警、什么都不画。

  改为：宿主自带定位（内联或类名）一个字不动；量出来是 `static` 才写兜底；**还没进文档时既不写定位、
  也不挂画布**——不在文档树里的画布逃不到别的祖先上，那句投机性写入因此整个不必发生。
  宿主进文档拿到盒子的那一刻由 `ResizeObserver` 定夺，销毁时撤销观察。
  没有 `ResizeObserver` 的环境退回原行为。

  **未注册的内置效果名，错误信息不再给行不通的建议。** 原先一律指向 `registerEffect()`，可它收的是
  效果对象不是名字，照着写连类型都不过，也不提示这个效果本就在包里、导出名叫什么。
  现在内置名单独给一条，点名 `registerBuiltinEffects()` / `registerEffects([xxxEffect])` 与直接传对象三条路。
  内置效果仍然不自动注册——注册表一旦静态引上这 14 个，每个用到 `createBackgroundSurface` 的应用都要
  多吃约 35 kB（gzip 约 8.6 kB），占整包四成。新增 `BUILTIN_EFFECT_NAMES` 纯字符串清单供校验用。

  **`TabsVariant` 补上 `line`。** 文档一直写「line / card / segment，缺省是 line」，类型里却只有两档，
  使用者自然写下的 `variant="line"` 编译不过。line 是缺省档、皮肤里没有它的选择器，
  显式写与不写渲染逐值相同。

  **`tokens.css` 自带完整层序声明。** 级联层的顺序由首次声明定死，而 `tokens.css` 原先只有
  `@layer xihan.tokens { }` 取值块。先引令牌再引皮肤（此前文档推荐的顺序）会让 `xihan.tokens`
  抢在 `xihan.reset` 前面注册，实际层序与 `layers.css` 声明的不符。现在两份入口各自带一份逐字相同的
  完整声明，谁先被引到层序都成立；重复声明幂等。新增 `check-layer-order` 门禁盯住两份不许漂移，
  `pnpm gate` 由十五项变十六项。

- Updated dependencies [466f143]
- Updated dependencies [7a5d898]
  - @xihan-ui/behavior@1.0.0-alpha.2
  - @xihan-ui/kernel@1.0.0-alpha.2

## 1.0.0-alpha.1

### Patch Changes

- Updated dependencies [e50a7c9]
- Updated dependencies [239eb5d]
- Updated dependencies [89d8c54]
- Updated dependencies [24721f4]
- Updated dependencies [4b949c2]
  - @xihan-ui/behavior@1.0.0-alpha.1
  - @xihan-ui/kernel@1.0.0-alpha.1

## 1.0.0-alpha.0

### Major Changes

- 46b82b0: 新增视觉层：WebGL2 背景效果与数据驱动粒子点云，框架无关、零第三方依赖。

  一张画面两个绘制通道——流场跑片元着色器，粒子走 `gl.POINTS`。粒子有程序化与点云两种来源：
  前者位置由粒子序号在顶点着色器里实时算出，不占顶点缓冲也不需要 CPU 逐帧更新；后者位置来自
  顶点缓冲，两份点云之间自动形变。两个通道共用同一段 GLSL，粒子因此能精确落在流场的特征位置上。

  内置 14 个效果（fluid / glass / mesh / grain / plasma / aurora / beam / ripple / orb / wave /
  starfield / nebula / flow-field / particles）。每个效果只声明一次参数规格，取默认值、钳制越界、
  生成调参界面三件事都从它推出来。

  图片、文字、SVG、参数方程统一采样成 `PointCloud`，「换形态」就是换一份点云。

  不支持 WebGL2 时降级成 CSS 静态背景，接口保持一致。

### Patch Changes

- Updated dependencies [bc65cb7]
- Updated dependencies [84b1aa3]
  - @xihan-ui/kernel@1.0.0-alpha.0
  - @xihan-ui/behavior@1.0.0-alpha.0
