# @xihan-ui/position

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

- 1ac7d41: 引导新增 `boundary`，把引导限在一块区域里，写法同步骤的 `target`（选择器、元素或返回元素的函数；Web Components 的同名属性只收选择器）。遮罩只盖这块区域，高亮框连同暗幕裁在区域里，居中步摆在区域中间，气泡以区域为界避让。区域外照常可读可点，焦点不困在气泡里，对话框也不标 `aria-modal`。引导途中，区域里新开的层（如抽屉）排在引导之下，Esc 仍先收起引导。不给或取不到时照旧是整个视口。

  配套的两处底层能力：

  - 定位引擎的选项加 `boundary`：可用区域再与这块区域的矩形取交集，翻面、避让与可用空间都以交集为界。
  - 层栈的层加 `covers`：之后在这块区域里新开、又不开在本层内容里的层，排在本层之下。

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

### Patch Changes

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

- 19570ad: **移除** 25 条从未打算公开的子路径导出。

  这五个包用 `unbundle` 构建，产物按源文件逐个切块；exports 是构建后按 `dist/` 里的产物回写的，于是内部块被一并写成了公开子入口——它们不在任何一个包的 tsdown 入口表里，漏出与否只取决于源文件在不在 `src/` 根目录。被删的是：

  - `@xihan-ui/kernel`：`./anatomy` `./attrs` `./compose` `./constants` `./guards` `./id-generator` `./locale` `./merge-props` `./normalize-props` `./runtime-config` `./scope` `./types`
  - `@xihan-ui/machine`：`./create-machine` `./delay` `./errors` `./form-reset` `./guards` `./service` `./setup` `./state` `./transitions`
  - `@xihan-ui/behavior`：`./dispatch`
  - `@xihan-ui/position`：`./compute`
  - `@xihan-ui/code-highlight`：`./languages` `./tokenize`

  留下的是各包 tsdown 显式声明的入口：kernel 的 `.` `./metadata` `./skin-check` `./vite`、machine 的 `.` `./vanilla`、behavior 的 `.` `./presence`，position 与 code-highlight 只剩 `.`。

  **迁移**：这些子路径暴露的名字主入口全都有，把 `import { x } from '@xihan-ui/kernel/anatomy'` 改成 `import { x } from '@xihan-ui/core'` 即可，按需引入靠 tree-shaking。

  **新增** `@xihan-ui/machine` 主入口再导出类型 `Setup`。它是公开函数 `setup()` 的返回类型，此前只能从 `@xihan-ui/machine/setup` 拿到；随该子路径一起消失的话，`setup()` 的结果就写不出类型标注了。

  生成 exports 的脚本同时改了判据：只有 tsdown 入口表里声明的名字才写进 exports，不再按 `dist/` 里「有 .js 也有 .d.ts」推导——内部块开着类型生成时同样两样都有，旧判据挡不住。

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

### Minor Changes

- 239eb5d: 浮层箭头改为指向锚点，不再钉死在浮层中点。

  定位结果新增箭头落点：`PositionResult.arrow` 给出箭头中心距浮层起始缘的距离（上下两侧给 x、左右两侧给 y），由调用方在 `PositionOptions.arrow` 里交出箭头的尺寸与让开圆角的余量才计算，不要就缺席。落点算在翻面与挪位之后，两者的位移因此自动带上；锚点落在浮层之外时钳到最近的合法点。

  六个带箭头的浮层（popover / tooltip / hover-card / menu / context-menu / tour）接上这条链路：机器把箭头的量交给引擎，连接层把落点写成内联自定义属性，皮肤消费它、引擎没给时退回原来的居中。此前只要 placement 带 `-start` / `-end` 对齐、浮层比锚点宽、或引擎为避让把浮层挪了位，箭头就指向空处。

  tooltip 的箭头补了 `data-placement`，皮肤的四条侧向规则从挂祖先 positioner 改为挂箭头自己，与其余五个统一。

- 516bd46: 浮层搬进单一落点，层号与背景失活跟着改口。

  ## 浮层不再原地渲染

  此前 20 个带 positioner 的浮层里只有 dialog / drawer / image-viewer 搬走，其余 16 个
  留在触发器旁边。坐标一直是对的（定位引擎特意处理了「祖先抢走包含块」），坏的是层叠序：
  宿主应用的祖先只要建了层叠上下文——`transform` / `translate` / `scale` / `filter` /
  `backdrop-filter` / `opacity` 小于 1 / `contain` / `will-change` / `position: sticky` /
  定位元素带 `z-index` / `isolation`——浮层的层号就退化成那个上下文里的局部序号，被任何
  上层兄弟盖住。这是库无法从自身约束的：宿主怎么写 DOM 不归库管。

  kernel 新增 `ensurePortalRoot(doc)`，在 body 末尾维护单一 `#xh-portal-root`，
  `RuntimeConfig.portalContainer` 的默认值指向它。Vue 侧 19 个浮层的 positioner
  （tour 连同 backdrop 与 spotlight）一律 Teleport 过去。落点自身一条样式都不写——
  子元素全是 `position: fixed`，不占布局，而任何 `position` / `transform` / `contain` /
  `isolation` 都会平白建出新的层叠上下文，正是要躲的东西。

  WC 适配器是 Light DOM，解剖契约就是「作者写在哪就在哪」，搬不动。改为在浮层展开时
  沿祖先链探一次层叠上下文，命中就投一条诊断，指名是哪个祖先的哪条属性。

  **破坏性**：浮层的 DOM 位置变了。按 `wrapper.querySelector` 之类以挂载根为基准取浮层
  节点的代码要改从 `document` 取。

  ## 遮罩式浮层并到同一档层号

  `--xh-z-drawer` 删除，`--xh-layer-drawer` 与 `--xh-layer-modal` 解析到同一个值。

  原先抽屉 1000 低于对话框 1100，而两者都在同一个栈上下文里，纯靠数字定序：从对话框里
  拉出抽屉时，抽屉连同自己的遮罩一起沉在对话框遮罩底下，用户只看到画面又暗一层、什么都
  没出现，而焦点已经陷进看不见的面板。反方向是对的，所以这是只在一个方向上炸的组合。
  并档之后先后交给 portal 顺序决定，与对话框套对话框的现有行为一致。

  **破坏性**：`--xh-z-drawer` 这个名字没有了。改用 `--xh-layer-drawer`。

  ## 背景失活改走祖先链

  `hideOutside` 此前只遍历 body 直接子元素，判据是「这个子元素包含 target 就整块放行」。
  WC 适配器的浮层长在作者写它的位置，应用只要有一层根容器（`#app` 之类）就会因包含浮层
  被整块豁免——模态对话框身后的整个应用对读屏依然完全可遍历，不认外点关闭的
  `alertdialog` 更是完全可点。改成沿每个 target 到 body 的祖先链逐层罩住其余兄弟。

  `data-xh-inert-exempt` 的语义随之扩大：带标记的元素及其后代不被罩住，**其祖先只递归、
  不整块罩住**。通知队列因此在任意嵌套深度都能保持可点，外点判定也一并豁免（点通知不再
  把模态关掉）。

  ## 其余

  - `--xh-editable-preview-line-height` 删除，改用 `--xh-editable-preview-min-h`：预览态
    原先拿行高冒充高度，实测比同组件的编辑态高 2px，切换时跳一下。
  - tooltip 与 navigation-menu 入层栈，Escape 不再连它们下面的对话框一起关掉。
  - 定位引擎新增 size 中间件，回报可用空间与锚点宽度；菜单族补上高度上限与内部滚动。
  - 包含块判定补齐 `translate` / `rotate` / `scale` 独立属性与 `backdrop-filter`。
  - 滚动锁补滚动条补偿与滚动根探测。

- 24721f4: RTL 下浮层的 `start` / `end` 第一次真的翻过来了。

  皮肤层一直是干净的（108 份皮肤零物理方向属性），坏的是运行时那一半：定位引擎对文字方向完全无感，
  `alignOn` 把 `start` 直接算成物理左缘。于是 RTL 页面里 `placement="bottom-start"` 的浮层仍然贴着
  锚点左缘——而 `start` 在 RTL 里应当是右缘。15 个吃引擎坐标的浮层组件全受影响。

  - `PositionOptions` 与计算层新增 `dir`，缺省 `ltr`。
  - **只改写行内轴**：`top` / `bottom` 两侧的横向对齐随方向翻转；`left` / `right` 两侧的纵向对齐是块轴，
    与文字方向无关，一个像素都不动。这条有单独的判据钉着。
  - 15 个浮层组件把自己的 `dir` 接到引擎；其中 combobox、date-picker、mention、popover、time-picker、
    tooltip、tour 这 7 个此前连 `dir` 接口都没有，一并补上（可选 prop，纯增量）。

  不传 `dir` 与传 `'ltr'` 的结果逐字相同，所以既有用法一个像素都不变。

  仍未做完、如实记账：`Placement` 仍是物理的（`Side = 'top' | 'right' | 'bottom' | 'left'`），
  没有 `inline-start` 这类逻辑关键字；`RuntimeConfig.dir` 仍是死字段，方向还得逐组件传。
  这两件都是加法，不阻塞现在这一版。

- 4b949c2: 摇树第一次真的生效：只用一个组件不再拖来整个库。

  此前七个库包都是单入口打包，500+ 模块被摊平进一份 `dist/index.js`，`sideEffects: false` 随之失效——
  使用者只 `import { XhBadge }`，打出来的东西和全量 barrel 一样大。

  产物改为保留模块结构（每个源文件一份产物），实测（esbuild 打真实 dist，gzip）：

  | 用例                | 改前      | 改后         |
  | ------------------- | --------- | ------------ |
  | 只用 `XhBadge`      | 168,947 B | **538 B**    |
  | 只用 `XhButton`     | 168,947 B | **1,029 B**  |
  | 只用 `XhDialogRoot` | 168,947 B | **11,374 B** |
  | 全量 barrel         | 173,005 B | 178,768 B    |

  单组件占全量从 **97.7% 降到 0.3%**。全量 barrel 略涨 3%，是模块边界不再被合并的代价，值得。

  **判据补上了此前没有的分辨力。** `.size-limit.json` 原有 18 条全是整包 barrel，改回单入口不会让任何
  一条变红。新增三条带 `import` 字段的按组件预算（badge / button / dialog），退回打包形态时它们会
  立刻超标一个数量级。

  顺带修掉两处被这次改动照出来的既有缺陷：

  - **公开面基线虚高 81 个名字。** `build-public-surface.mjs` 抽类型名的正则里 `export` 是可选的，
    于是把打包版 d.ts 里那些**没有导出**的内部类型别名（`AccordionProps` 这类局部别名共 72 个）也算
    成了受 semver 约束的公开名。实测确认它们从来就 import 不到（`TS2305: has no exported member`）。
    正则补上 `export`，基线随之收敛。
  - **文档生成器只认 `declare`。** 拆包后 barrel 里不再有 `declare`，导致 102 页组件文档的
    「Vue 组件」整列凭空消失。改成 import 与 export 两种形态都收。

  新增一个公开类型 `TweenEasing`：`NumberAnimationEasing` 本就是它的别名，拆包后别名要能被命名，
  这一支就必须公开。

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

### Minor Changes

- 516bd46: 浮层搬进单一落点，层号与背景失活跟着改口。

  ## 浮层不再原地渲染

  此前 20 个带 positioner 的浮层里只有 dialog / drawer / image-viewer 搬走，其余 16 个
  留在触发器旁边。坐标一直是对的（定位引擎特意处理了「祖先抢走包含块」），坏的是层叠序：
  宿主应用的祖先只要建了层叠上下文——`transform` / `translate` / `scale` / `filter` /
  `backdrop-filter` / `opacity` 小于 1 / `contain` / `will-change` / `position: sticky` /
  定位元素带 `z-index` / `isolation`——浮层的层号就退化成那个上下文里的局部序号，被任何
  上层兄弟盖住。这是库无法从自身约束的：宿主怎么写 DOM 不归库管。

  kernel 新增 `ensurePortalRoot(doc)`，在 body 末尾维护单一 `#xh-portal-root`，
  `RuntimeConfig.portalContainer` 的默认值指向它。Vue 侧 19 个浮层的 positioner
  （tour 连同 backdrop 与 spotlight）一律 Teleport 过去。落点自身一条样式都不写——
  子元素全是 `position: fixed`，不占布局，而任何 `position` / `transform` / `contain` /
  `isolation` 都会平白建出新的层叠上下文，正是要躲的东西。

  WC 适配器是 Light DOM，解剖契约就是「作者写在哪就在哪」，搬不动。改为在浮层展开时
  沿祖先链探一次层叠上下文，命中就投一条诊断，指名是哪个祖先的哪条属性。

  **破坏性**：浮层的 DOM 位置变了。按 `wrapper.querySelector` 之类以挂载根为基准取浮层
  节点的代码要改从 `document` 取。

  ## 遮罩式浮层并到同一档层号

  `--xh-z-drawer` 删除，`--xh-layer-drawer` 与 `--xh-layer-modal` 解析到同一个值。

  原先抽屉 1000 低于对话框 1100，而两者都在同一个栈上下文里，纯靠数字定序：从对话框里
  拉出抽屉时，抽屉连同自己的遮罩一起沉在对话框遮罩底下，用户只看到画面又暗一层、什么都
  没出现，而焦点已经陷进看不见的面板。反方向是对的，所以这是只在一个方向上炸的组合。
  并档之后先后交给 portal 顺序决定，与对话框套对话框的现有行为一致。

  **破坏性**：`--xh-z-drawer` 这个名字没有了。改用 `--xh-layer-drawer`。

  ## 背景失活改走祖先链

  `hideOutside` 此前只遍历 body 直接子元素，判据是「这个子元素包含 target 就整块放行」。
  WC 适配器的浮层长在作者写它的位置，应用只要有一层根容器（`#app` 之类）就会因包含浮层
  被整块豁免——模态对话框身后的整个应用对读屏依然完全可遍历，不认外点关闭的
  `alertdialog` 更是完全可点。改成沿每个 target 到 body 的祖先链逐层罩住其余兄弟。

  `data-xh-inert-exempt` 的语义随之扩大：带标记的元素及其后代不被罩住，**其祖先只递归、
  不整块罩住**。通知队列因此在任意嵌套深度都能保持可点，外点判定也一并豁免（点通知不再
  把模态关掉）。

  ## 其余

  - `--xh-editable-preview-line-height` 删除，改用 `--xh-editable-preview-min-h`：预览态
    原先拿行高冒充高度，实测比同组件的编辑态高 2px，切换时跳一下。
  - tooltip 与 navigation-menu 入层栈，Escape 不再连它们下面的对话框一起关掉。
  - 定位引擎新增 size 中间件，回报可用空间与锚点宽度；菜单族补上高度上限与内部滚动。
  - 包含块判定补齐 `translate` / `rotate` / `scale` 独立属性与 `backdrop-filter`。
  - 滚动锁补滚动条补偿与滚动根探测。

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

### Minor Changes

- 239eb5d: 浮层箭头改为指向锚点，不再钉死在浮层中点。

  定位结果新增箭头落点：`PositionResult.arrow` 给出箭头中心距浮层起始缘的距离（上下两侧给 x、左右两侧给 y），由调用方在 `PositionOptions.arrow` 里交出箭头的尺寸与让开圆角的余量才计算，不要就缺席。落点算在翻面与挪位之后，两者的位移因此自动带上；锚点落在浮层之外时钳到最近的合法点。

  六个带箭头的浮层（popover / tooltip / hover-card / menu / context-menu / tour）接上这条链路：机器把箭头的量交给引擎，连接层把落点写成内联自定义属性，皮肤消费它、引擎没给时退回原来的居中。此前只要 placement 带 `-start` / `-end` 对齐、浮层比锚点宽、或引擎为避让把浮层挪了位，箭头就指向空处。

  tooltip 的箭头补了 `data-placement`，皮肤的四条侧向规则从挂祖先 positioner 改为挂箭头自己，与其余五个统一。

- 24721f4: RTL 下浮层的 `start` / `end` 第一次真的翻过来了。

  皮肤层一直是干净的（108 份皮肤零物理方向属性），坏的是运行时那一半：定位引擎对文字方向完全无感，
  `alignOn` 把 `start` 直接算成物理左缘。于是 RTL 页面里 `placement="bottom-start"` 的浮层仍然贴着
  锚点左缘——而 `start` 在 RTL 里应当是右缘。15 个吃引擎坐标的浮层组件全受影响。

  - `PositionOptions` 与计算层新增 `dir`，缺省 `ltr`。
  - **只改写行内轴**：`top` / `bottom` 两侧的横向对齐随方向翻转；`left` / `right` 两侧的纵向对齐是块轴，
    与文字方向无关，一个像素都不动。这条有单独的判据钉着。
  - 15 个浮层组件把自己的 `dir` 接到引擎；其中 combobox、date-picker、mention、popover、time-picker、
    tooltip、tour 这 7 个此前连 `dir` 接口都没有，一并补上（可选 prop，纯增量）。

  不传 `dir` 与传 `'ltr'` 的结果逐字相同，所以既有用法一个像素都不变。

  仍未做完、如实记账：`Placement` 仍是物理的（`Side = 'top' | 'right' | 'bottom' | 'left'`），
  没有 `inline-start` 这类逻辑关键字；`RuntimeConfig.dir` 仍是死字段，方向还得逐组件传。
  这两件都是加法，不阻塞现在这一版。

- 4b949c2: 摇树第一次真的生效：只用一个组件不再拖来整个库。

  此前七个库包都是单入口打包，500+ 模块被摊平进一份 `dist/index.js`，`sideEffects: false` 随之失效——
  使用者只 `import { XhBadge }`，打出来的东西和全量 barrel 一样大。

  产物改为保留模块结构（每个源文件一份产物），实测（esbuild 打真实 dist，gzip）：

  | 用例                | 改前      | 改后         |
  | ------------------- | --------- | ------------ |
  | 只用 `XhBadge`      | 168,947 B | **538 B**    |
  | 只用 `XhButton`     | 168,947 B | **1,029 B**  |
  | 只用 `XhDialogRoot` | 168,947 B | **11,374 B** |
  | 全量 barrel         | 173,005 B | 178,768 B    |

  单组件占全量从 **97.7% 降到 0.3%**。全量 barrel 略涨 3%，是模块边界不再被合并的代价，值得。

  **判据补上了此前没有的分辨力。** `.size-limit.json` 原有 18 条全是整包 barrel，改回单入口不会让任何
  一条变红。新增三条带 `import` 字段的按组件预算（badge / button / dialog），退回打包形态时它们会
  立刻超标一个数量级。

  顺带修掉两处被这次改动照出来的既有缺陷：

  - **公开面基线虚高 81 个名字。** `build-public-surface.mjs` 抽类型名的正则里 `export` 是可选的，
    于是把打包版 d.ts 里那些**没有导出**的内部类型别名（`AccordionProps` 这类局部别名共 72 个）也算
    成了受 semver 约束的公开名。实测确认它们从来就 import 不到（`TS2305: has no exported member`）。
    正则补上 `export`，基线随之收敛。
  - **文档生成器只认 `declare`。** 拆包后 barrel 里不再有 `declare`，导致 102 页组件文档的
    「Vue 组件」整列凭空消失。改成 import 与 export 两种形态都收。

  新增一个公开类型 `TweenEasing`：`NumberAnimationEasing` 本就是它的别名，拆包后别名要能被命名，
  这一支就必须公开。

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
