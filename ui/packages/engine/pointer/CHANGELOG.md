# @xihan-ui/pointer

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

- dd04e26: `@xihan-ui/pointer` 新增 `wheelPixels(event, { line?, page? })`：把按行、按页计量的滚轮滚动量折成像素（缺省一行 16、一页 400 像素），返回 `{ x, y }`。

  - `tabs` 的滚轮滚动、关系图与直角坐标图的滚轮缩放改用它，换算值不变。

## 4.2.0

## 4.1.0

## 4.0.1

## 4.0.0

## 3.2.0

## 3.1.0

## 3.0.0

### Minor Changes

- 0b00a9b: 多指会话 `createMultiPointerSession` 的 `onEnd` 新增 `velocity`：最后抬起的那根手指的松手速度（像素每秒），与单指会话同一算法，停住再抬起或被系统收走时为零。
- a6d52e5: 指针会话的结束回调新增 `velocity`：抬起前最近 80ms 内的移动按首尾位移与时间差求出的松手速度（像素每秒），可直接交给 `createSpringValue` 做手势松手。停住再抬起、或被系统收走（`pointercancel`）时为零。新增导出类型 `PointerVelocity`。
- 3469140: Sortable 支持跨列表拖放：写了同一个 `group` 的几个列表组成一组（每个列表另写组内不重复的 `listId`），条目能从一个列表拖进另一个列表并落在指定位置。

  - 指针：被拖项的中心进了组里别的列表，那个列表的根投影 `data-drop="inside"`，插入点及其后的项让出一格，末尾垫出同样大的一段让容器长高，落点线画在让出那一格的起始缘上；源列表里被拖项之后的各项合拢。中心落在列表之间的空白里时落点留在上一个列表。
  - 键盘：拿起后本轴方向键在列表内移动，另一条轴上的方向键在相邻列表间移动（竖排列表左右键、横排列表上下键，rtl 下竖排的左右键对调），Escape 取消。键盘表新增 `sortable.kbd.next-list` / `sortable.kbd.prev-list`。
  - 事件：落进别的列表时由源列表发一次 `transfer`（`onTransfer`），载荷 `{ id, fromList, toList, from, to, fromIds, toIds }` 给出两个列表各自的新顺序，写不写回归宿主；不写回时条目收回原位。入组时 `drag-end` 另带 `fromList` / `toList`。宿主接下转移后，落进来的那一项由目标列表从松手处以弹簧收进新位置。
  - 读屏：挪进别的列表时播报列表名、它在组里排第几与新位次，落下时播报落进了哪个列表；`translations` 新增 `movedToList` / `droppedInList`。列表名取列表容器的可及名（`aria-labelledby` 优先）。
  - 非法组合立即报错：写了 `group` 不写 `listId`、换行网格（`orientation="both"`）入组、组内 `listId` 重复。
  - `@xihan-ui/pointer` 新增跨列表插入的几何原语 `projectInsertion`、`insertionOffsets`、`insertionSlot`。
  - 高对比档里落点线改画系统高亮色，不再随底色一起消失。
  - Web Components：连接层写在角色节点上的内联样式改为「写过才撤」对账，下一帧不再给的一条会被撤掉，节点被作者挪进另一台同类宿主时由接管方撤掉前一台留下的位移；此前给 `undefined` 的内联样式会一直钉在节点上。

## 2.1.0

## 2.0.0

### Patch Changes

- 3f9c145: **修复**随包发到 npm 的文本。

  `@xihan-ui/pointer` 补上 README。它是唯一一个没有 README 的发布包，npm 页面此前只有 package.json 的一句 description。

  三份 README 的示例引了不存在的名字，照抄即解析失败：`@xihan-ui/chat-stream` 的 `createChatStore` / `httpSseTransport` 改成真名 `createThreadStore` / `createHttpSseTransport`；`@xihan-ui/behavior` 的 `createDismissableLayer` 改成 `createDismissLayer`；`@xihan-ui/vue` 的 `XhDialog` 改成组合式的 `XhDialogRoot` / `XhDialogTrigger` / `XhDialogContent`。

  `@xihan-ui/web-components` 的 README 把两处过期说法改写成结论：逐帧 parity 的覆盖面是 101 个套件（不是只有 Button 一个），收不进来的 26 个逐条登记在 `EXCLUDED` 里并各带理由，dialog 属两端 presence 模型不同的永久性差异；受控 open 的跨适配器一致性由两端各自跑同一份 conformance 规格覆盖。

  十份 CHANGELOG 里 38 处指向仓外文档目录的引用整体删掉——那些路径不随包发布，点过去是 404。

  三道门禁把这几类问题焊住：`check-package-manifests`（每个发布包必须有 README，16 张包清单与实际发布包双向对账）、`check-doc-imports`（README 与文档正文里的导入名必须在公开面里）、`check-published-refs`（包内文本不许指向仓外文档目录）。

## 1.1.0

### Minor Changes

- 3d41890: **新增** `image-viewer` 的双指缩放：两指撑开放大、捏合缩小，两指整体平移时只动偏移不动缩放。

  **新增** `@xihan-ui/pointer` 的双指几何（间距、中点、连线角度，以及相对起始那一刻的缩放、位移、转角）与多指会话。

  `image-viewer` 的单指平移一并收进多指会话：监听改挂在文档上，手划出图片、划出窗口都跟得住，不再逐个捕获指针；会话跟着 `open` 状态生死，拖到一半把浮层关掉也不会把监听留在文档上（M0 记的两处遗留之一，另一处是 `carousel`）。

  缩放与位移都相对**起始那一刻**算，不相对上一帧——相对上一帧会把浮点误差一路累起来。点数一变就重拍基准：从双指退回单指时不重拍的话，剩下那根手指会带着上一段的缩放基准继续走，图会跳一下。

- fe95f03: **新增** `@xihan-ui/pointer` 指针会话：一根指针从按下到抬起的跟手、过滤与收尾收在一处，自研，零依赖，压缩后 316 B。

  七个需要跟手的组件（`slider` · `splitter` · `scrollbar` · `color-picker` · `image-cropper` · `floating-panel` · `signature-pad`）此前各自手写了一遍同样的文档监听循环，四个必须一次都不漏的点（监听挂文档、收 `pointercancel`、认 `pointerId`、拆卸摘干净）分散在七处，改一处不会带上另外六处。现在统一走会话，行为不变。

- 97482ad: **新增** `sortable` 组件：列表 / 网格拖拽排序，Vue 与 Web Components 两侧同时可用。

  落点走乐观投影——拖动过程中其余条目实时让位，松手即定，不是拖完才跳一下。判据是被拖项的中心越过了谁的中心，沿轴扫描一遇到没越过的就停，因此落点连续，不会从第 0 位跳到第 5 位。几何一律取按下那一刻的快照：让位之后布局已经变了，拿变形后的几何再算会自激振荡。

  **键盘路径默认开着且关不掉**：空格拾起、方向键挪一格、空格放下、Esc 取消，每一步都写进视觉隐藏的 `role=status` 区域。手柄带 `aria-roledescription="sortable"` 与 `aria-pressed`；拖动中的 Tab 被拦下，焦点一旦移走这一场就没有出口。

  `orientation` 三档：竖排、横排，以及换行网格用的 `both`（按最近中心判落点）。排版方向由首尾两项的先后推出，从右往左排时自动反向。按下之后要走够 `activationDistance`（默认 5px）才算拖动，因此条目本身仍然可以点击。拖到容器边缘会自动滚动，速度随入侵深度线性上升。

  `sort` 事件直接给出重排好的 `ids`，可以直接写回数据源，Vue 侧支持 `v-model:ids`。

  **新增** `@xihan-ui/pointer` 的拖放几何层：排序投影、让位计算、激活阈值与边缘滚动，全部是纯函数，零 DOM、零状态。

- 0a147ba: **新增** `table` 的列宽拖拽：列上标了 `resizable` 就产出改宽把手，拖动与方向键都能调。

  把手是可聚焦的分隔条，报出当前列宽与上下限；拖出表头仍跟手，系统收走指针时宽度退回按下那一刻。方向键一次 8px、按住 Shift 一次 40px，rtl 下左右两键对调而语义恒是「加宽 / 收窄」。列宽落在列偏好里，可以直接存起来下次还原。

  列宽写成百分比这类算不出 px 的写法时不认可改宽——读屏要一个数值，给不出就不该声称自己是可调控件，键盘本来也动不了它。

  **新增** `@xihan-ui/pointer` 的尺寸调整几何层：八向边推动加约束（上下限 / 宽高比 / 吸附步进 / 容器夹取），纯函数。`floating-panel` 的 `resizeFloatingPanel` 与 `clampFloatingPanelSize` 保留签名、内部改走它，行为不变。

- e14c407: **新增** `tree` 的节点拖拽搬家：`draggable` 打开后整个节点都是拖动源，拖到别的节点上换位或换父。
  焦点在树里时 `Alt` + 上下键在同层兄弟间挪，`Alt` + 左右键改缩进层级。
  搬完发 `onNodeMove`，载荷是 `{ value, parent, index }`——搬到哪个父下面的第几位，父为 `null` 即根层。

  **新增** `allowDrop` 与 `translations` 两个 prop、`live-region` 部件、
  节点上的 `data-dragging` / `data-drop` / `data-draggable`，以及 `api.dropTarget` / `api.announcement`。
  （`TreeTranslations` 以前只有类型没有对应的 prop，空接口所以一直没人发现，这次一并补上。）

  **落点三档**：`before` / `after` 插在同层，`inside` 落进这个分支。叶子上只有前后两档。
  「放进这个文件夹」和「插在这两行之间」是两件事，皮肤上必须一眼分得开。

  **分支量的是 `branch-control` 不是 `branch`**。后者是「这一行 + 整棵子层」的外壳，
  展开着的时候它的矩形把整棵子树都吞进去，落点会永远命中最外层那个分支，一辈子落不到子节点上。

  **自我后代判据用 `indexPath` 前缀，不沿 `parent` 上溯**。作者写出自引用的数据是被支持的
  （`collectNodes` 有祖先链防护），沿 `parent` 走会死循环；而同一个 value 挂在两个父下时
  `parent` 只留先出现的那一支，判出来的祖先也是错的。前缀比较 O(深度) 且天然无环。

  树的**状态树一行未改**：跟手的会话挂在根级效应上常驻，8 个既有事件原地不动。

  **修复** `@xihan-ui/pointer` 的 `createMultiPointerSession`：`onEnd` 现在带 `reason`
  （`pointerup` / `pointercancel`）。此前两者走同一条路、调用方分不开，于是**系统收走指针会被当成落定提交**。
  `carousel` 与 `image-viewer` 不受影响（它们本就把两者同等对待）。

  **修复** `tree` 的键盘处理器不再吞掉落在可编辑节点内容里的按键。处理器挂在 `tree` 部件上，
  节点里输入框冒上来的按键也经过它：打空格会被当成「选中这一项」，打字会被连打检索吃掉。
  `isEditableTarget` 从 `table` 提到 `shared/`——这是它的第二个消费者。

  **触屏不开拖**（与 table 行拖拽同因）。

  **改写** `tree/10-drag-move` 示例。它此前整个用 HTML5 `draggable` + `dataTransfer` 手写，
  只支持「拖进文件夹」、没有前后排序、落点提示是内联 style——正是 AntD 审计点名的那份样板。
  现在落点判定、三档落点、指示线、自我后代守卫全归库，宿主只留按 `{ value, parent, index }`
  搬数组这一段。

### Patch Changes

- fad7a5a: **修复** `createMultiPointerSession` 只能用一次：最后一根指针抬起就把会话整个闩死，
  `add()` 从此空转。会话是根级效应建的、整个生命周期只建一次，于是 `tabs` / `tree` /
  `carousel` 三处的拖动**第二次彻底起不来**。「本场收尾」与「会话作废」现在是两件事。

  **修复** `XhTableRoot` 丢掉作者写在它上面的 `class` / `aria-*` / 监听器。它渲的是
  Fragment（表格本体 + 播报区），而 Vue 只在单个元素根上自动透传 attrs——改成 Fragment
  那一批把这条通道弄断了，示例里已经有两处在用（分组表头传 `aria-rowcount`、
  虚拟滚动示例传 `@scroll`）。

  **修复** RTL 下指针与键盘互相矛盾：键盘三处早就跟着文字方向翻，指针这一路漏了。
  RTL 横排的 DOM 首项在最右，它的几何左半是逻辑末侧，而 `hitAlong` 一律按几何判。
  现在它收 `rtl`，横轴两处（列、横排标签）接上；行与树是纵轴，与文字方向无关。

  **修复** 禁用的项仍是拖动源，六处：`tabs` 的整块起手 / `data-draggable` / `Alt` 方向键、
  `tree` 的 `Alt` 方向键、`table` 行的整块起手 / `data-row-draggable` / `Alt` 方向键。
  判据统一成「这一项自己禁用了就不是拖动源」。

  **修复** `tabs` 的拖动轴钉死在挂载那一刻：跟手的会话由根级效应建、只在 INIT 挂一次，
  轴却在效应顶部就求了值。运行期把 `orientation` 从横排改成竖排之后，落点仍按横轴算。

  **修复** `tree` 把「本来就是这个父的末位孩子」也当成一次搬家：落进父节点里算下来还是原位，
  却仍报出一次空的 `onNodeMove`。与同文件 before / after 那一支同一条约定。

  **改动** `tree` 对禁用节点的落点判定收窄成只拦 `inside`。往一个禁用的分支里塞东西说不通，
  但在它前后插只是绕着它排序——`table` 与 `tabs` 那边本来就是这个口径，三处现在一致。
