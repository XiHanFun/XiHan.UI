# @xihan-ui/motion

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

## 4.2.0

## 4.1.0

## 4.0.1

## 4.0.0

### Patch Changes

- b3153a4: 图表入场放慢：`--xh-motion-duration-reveal` 由 640ms 调到 960ms，柱长出、扇区扫开与漏斗、雷达、桑基、关系、层级图的入场曲线由 `enter-strong` 换成平缓的 `enter`。原来的强减速把位移压在头一两百毫秒，一张图一闪就画完；现在位移摊在整段里，看得清标记是长出来的。折线描出仍取 `continuous`，数据更新（`morph`，400ms）不变。数值动画不写 `easing` 时首次滚动与图表里的数字同一口径，一起换成 `enter`。

## 3.2.0

## 3.1.0

## 3.0.0

### Major Changes

- c17f6e3: 缓动表删去 `decelerate` 与 `accelerate`：组件库与令牌都不使用它们，也没有对应的令牌。引用过的改写成 `cubic-bezier()` 串：

  | 旧名                                 | 替代写法                       |
  | ------------------------------------ | ------------------------------ |
  | `easing.decelerate` / `'decelerate'` | `'cubic-bezier(0, 0, 0, 1)'`   |
  | `easing.accelerate` / `'accelerate'` | `'cubic-bezier(0.3, 0, 1, 1)'` |

  `EasingName` 类型随之少了这两个名字。

- 608cc0a: `resolveEasing` 认不出写法时抛 `TypeError`，不再退回线性（此前只在开发构建下警告）。消息里带原文与全部可用写法。

  字符串先查命名缓动，查不到再按 CSS 缓动函数的语法与取值解释，新认下 `ease` / `ease-in` / `ease-out` / `ease-in-out`、`step-start` / `step-end`、`steps()` 与 `linear()`；`readMotion(el).easing()` 读到样式里改写成的任何合法 CSS 缓动都能换成函数。

  迁移：

  - 此前写成 `'ease-out'` 一类 CSS 关键字、实际按匀速播放的，现在按 CSS 的曲线播放；要保持匀速写 `'linear'`，要库里的曲线写命名缓动 `'easeOut'`。
  - 写法不合 CSS 的一律报错，包括 x 分量越出 [0,1] 的 `cubic-bezier()`、带单位的分量、原型上的属性名（如 `'toString'`）与非字符串值。来自配置或后端的缓动串，请在入口处调用 `resolveEasing` 校验。
  - `tweenValueAt` 经 `resolveEasing` 取曲线，规则相同。

### Minor Changes

- c48171d: 新增呼吸动效：共享关键帧 `xh-breathe`（明暗与缩放起伏，峰值在 42%）与 `xh-breathe-halo`（外扩光环），令牌 `--xh-motion-loop-breathe`（3600ms）、`--xh-motion-ease-breathe`（正弦式缓入缓出，原语 `--xh-ease-sine-in-out`）、`--xh-motion-scale-breathe` 与 `--xh-motion-scale-halo`（减弱档归 1）；`@xihan-ui/motion` 的 `easing.sineInOut` 与 `motionEasings.breathe` 同源。

  Badge 新增 `pulse`（Web Components 为 `pulse` attribute）：圆点档呼吸，表达正在进行、给不出进度的状态（直播、录制、通话中）；光环播 3 轮后停，圆点持续到状态结束；数字角标不呼吸；减弱动效下两者都停，圆点停在满不透明度。badge.css 因此引入共享关键帧，体积基线随之上调。

- df3d2ac: liquid 档的交互光：`data-material="liquid"` 下实心按钮在细指针悬停的一刻，一道光沿 1px 描边环扫过一次，光取面上前景色、不进面，文字对比不受影响；粗指针、强制色下不播，减弱动效下时长归 1ms。新增令牌 `--xh-motion-duration-glint`（640ms）与 motion 的 `motionDurations.glint`，共享关键帧 `xh-glint`，按钮新增覆盖槽 `--xh-button-glint-duration`。
- 1b0701c: `@xihan-ui/core/visual-environment` 新增液态组 `trackLiquidGoo(host, { source, members, domains })`：宿主的材质轴为 `liquid` 时，在宿主最前面插入装粘连滤镜的 `<svg>` 与一层装饰色块层（`aria-hidden`、不接指针），同组的块边缘相距约 15px 以内就连成一片；投影、底色、墨色细线与 1px 亮边都沿整组外形画，色调、通透档与光源方向跟源块走。`split(items, open)` 让块从源块中分离或融回，离源块近的先走、相邻两块错开交错步长，减弱动效下不播放。

  弹簧新增预设 `merge` 与令牌 `--xh-motion-spring-merge-stiffness / -damping`（320 / 24，超调 5.8%），供融合分离使用。液态层皮肤新增色块层与滤镜各段的填色规则，投影经私有槽 `--xh-_liquid-goo-shadow`，组件可在自己的宿主上接入使用者的投影槽。

- 9c6d582: 新增两枚数据动效的语义时长：`--xh-motion-duration-reveal`（640ms）给数据标记首次出现——柱从基线长出、折线描出、扇区扫开；`--xh-motion-duration-morph`（400ms）给数据更新——标记从旧位置走到新位置、坐标轴刻度滑动。减弱动效下两者都归 1ms。`motionDurations` 与 `reducedMotionDurations` 同步加入 `reveal`、`morph`，`readMotion(el).duration('reveal' | 'morph')` 可直接读取。
- 245995e: 新增表现性动效令牌：`--xh-motion-duration-attention`（注意动效播一遍，640ms，减弱档 1ms）、`--xh-motion-distance-lg`（16px，减弱档归零）、`--xh-motion-ease-emphasis`（取新原语 `--xh-ease-emphasized`）。它们供 `@xihan-ui/animations` 的预设使用，组件皮肤不用。`@xihan-ui/motion` 同步导出语义位移 `motionDistances`（sm / md / lg）与错开步长 `motionStaggerStep`，`motionDurations` 增加 `attention`、`motionEasings` 增加 `emphasis`，与令牌逐条对账。
- 684cf13: 新增手势松手的物理：`rubberBand(overshoot, dimension)` 越界跟手的橡皮筋衰减、`rubberClamp(value, min, max, dimension)` 只衰减越出区间的那段、`projectRelease(position, velocity, seconds)` 松手落点投影、`nearestSnap(points, position)` 最近吸附点，以及 `glideSpring(seconds)`——临界阻尼、固有频率 1 / seconds 的弹簧，以投影落点为目标时恰是指数减速的惯性滑行。
- 7192b57: JS 动画可以从元素读取语义动效令牌，减弱动效按元素的作用域判断。

  - 新增 `readMotion(el)`：按语义名读取 `--xh-motion-duration-*`（毫秒）与 `--xh-motion-ease-*`（采样函数）的实际取值，作者对组件槽的覆盖、容器上的 `data-motion` 与系统偏好都已算进计算样式；读不到时取与令牌同值的常量。
  - 新增与令牌同值的常量 `motionDurations`、`motionEasings` 及类型 `MotionDurationName`、`MotionEaseName`、`MotionReading`。
  - `resolveMotionPreference` 接受元素：最近祖先上的 `data-motion`（`reduce` / `default`）优先，其次是应用级 override 与系统设置。传入窗口或不传时行为不变。
  - 缓动表新增与令牌原语同值的 `outFluid`、`outBack`。
  - `resolveEasing` 遇到认不出的写法仍按匀速播放，开发构建下同一写法在控制台警告一次。

- 560242d: 新增有状态弹簧 `createSpringValue`：持有当前值、速度与目标，`to(target, { velocity })` 中途改目标时以当前位移与速度为初始条件重新求解，位置与速度都不跳变，手势松手的速度可以原样交给动画；在目标处带着速度松手也会运动。每一段运动是时间的闭式解，与帧率无关；减弱动效下直接落到终态；非法参数立即抛 `TypeError`。

  弹簧预设进入令牌：`--xh-motion-spring-<名>-stiffness / -damping`（snappy、smooth、gentle、bouncy、stiff，以及 liquid 档用的 toggle、lead、trail），`springPresets` 与令牌同源并由门禁双向对账。

### Patch Changes

- 5c79ac0: 减弱动效改为去掉位移、保留淡变。

  减弱动效下（系统 `prefers-reduced-motion: reduce` 或 `data-motion="reduce"`），`--xh-motion-duration-micro`、`--xh-motion-duration-enter`、`--xh-motion-duration-exit` 保留为 120ms：换色、浮层与提示的淡入不再瞬间跳变。位移、缩放、旋转与尺寸变化仍然瞬时完成——组件的几何过渡取 `move` / `nudge` / `expand` / `collapse` / `slide` / `press` / `release`，这些时长在减弱档下为 1ms，位移与缩放幅度归零。

  自定义样式如果把几何变化挂在 `micro` / `enter` / `exit` 上，减弱动效下会以 120ms 动起来，请改用上面的几何时长。`@xihan-ui/motion` 的 `readMotion` 在读不到样式时取同样的减弱档取值。

- cac2eaf: `animate()` 与背景层按宿主元素所在的 `data-motion` 作用域判断减弱动效。

  局部容器写了 `data-motion="reduce"` 时，其中的 `animate()` 调用（包括 `@xihan-ui/animations` 的预设播放）不再播放中间帧，背景画面冻结；写了 `data-motion="default"` 时，即使应用级偏好要求减弱也照常播放。没有 `data-motion` 的页面行为不变。

- 8ca7eaa: 订阅通知改为直接遍历订阅表，不再先拷一份快照：`setMotionOverride`、视觉环境控制器、`onXhConfigChange`、对话线程仓库的订阅者，在通知途中退订、还没轮到的不再收到这一轮；通知途中新订阅的在同一轮里也会收到。回调里退订自己照旧安全。

## 2.1.0

## 2.0.0

### Major Changes

- dc64383: **补间不再自带一套缓动曲线，改从共用的那张表取。** `tween.ts` 从前写死四条曲线（`ease-in` 是 `t³`、`ease-out` 是 `1-(1-t)³`），与 `easing.ts` 里同名的那几条**不是同一条曲线**——同一个动作用 CSS 声明和用 JS 逐帧算，走出来的路径不一样。现在补间经 `resolveEasing` 取曲线，JS 侧只剩 `easing.ts` 一张表，而它逐值对着设计令牌，由 `check-motion-source` 对账。

  **删掉的公开面（`@xihan-ui/motion`）**：

  | 删掉                  | 改用                                                  |
  | --------------------- | ----------------------------------------------------- |
  | `TweenEasing` 类型    | `EasingName`（曲线名）或 `EasingFunction`（自带函数） |
  | `tweenEasings` 曲线表 | `easing` 曲线串表 + `resolveEasing`                   |
  | `resolveTweenEasing`  | `resolveEasing`                                       |

  `TweenSpec.easing` 现在收三种写法：曲线名、`cubic-bezier(...)` / `linear` 串，或函数本身。`@xihan-ui/headless` 随之不再转出 `TweenEasing`，改转 `EasingName`。

  **破坏性：`number-animation` 的 `easing` 换了取值域。** 从前的四档 `linear` / `ease-in` / `ease-out` / `ease-in-out` 里，只有 `linear` 还认；另外三个不再是已知曲线名，会退回线性。逐条改成曲线表里的名字：

  | 从前          | 改成        |
  | ------------- | ----------- |
  | `ease-in`     | `easeIn`    |
  | `ease-out`    | `easeOut`   |
  | `ease-in-out` | `easeInOut` |

  同时可选的还有 `standard` / `emphasized` / `decelerate` / `accelerate` / `outStrong`，以及直接写一条 `cubic-bezier(...)` 串。曲线换过之后数字滚动的路径与同名 CSS 声明一致。

  **对账面加一条。** `check-motion-source` 从四对缓动常量扩到五对，把 `ease.in-out` ↔ `easing.easeInOut` 也纳入逐字比对——令牌那条 `$description` 早就写着两者同值，此前没人拦。

### Minor Changes

- 317b582: **新增**入场缓动令牌 `--xh-motion-ease-enter-strong`（原语 `--xh-ease-out-strong` = `cubic-bezier(0.23, 1, 0.32, 1)`）。位移与高度变化走这一条：起步快、收尾长，比 `--xh-motion-ease-enter` 看得清。JS 侧同值常量 `easing.outStrong` 一并加上，两边由门禁对账。

  **新增**正文行高令牌 `--xh-text-prose-leading`（原语 `--xh-leading-relaxed` = 1.625）。成段正文此前与控件文字共用 1.5 一个值。

  **新增**兜底字形令牌 `--xh-glyph-mark-arrow-up`。此前只能借语义不对的 `--xh-glyph-mark-sort-asc`。

  **修复** `code-view` 的行号被染成语法数字色。`--xh-code-view-number-fg` 一个名字被行号与数字记号两处消费，根上给它赋了语法色之后行号跟着变色。语法记号改用 `--xh-code-view-number-token-fg`，行号那个名字的语义不变。

  **修复** `prompt-input` 发送按钮禁用态的字底对比度（浅色 1.96:1、深色 2.08:1）。禁用时底色仍是品牌色而只把字变灰，现在底色一并降到 `--xh-bg-muted`。

  **修复** AI 族八处按下缩放是硬切。`approval` / `code-view` / `diff-view` / `message-feed` / `prompt-input` / `reasoning` / `tool-call` 的可点部件此前只声明了 `:active` 的缩放量、没有把 `scale` 写进 `transition`，按下与松手都不过渡；同批补齐悬停与描边的过渡。

## 1.1.0

## 1.0.0

### Minor Changes

- 8d35702: 动效与浮层口径收口。

  **减弱动效只剩一条通道。** 此前 kernel 的 `RuntimeConfig.reducedMotion` 只读系统 matchMedia、motion 包的 `setMotionOverride` 只有 animate / 滚动 / 数字动画在听，presence 与 stick-to-bottom 感知不到应用级覆盖；无 matchMedia 的宿主两包还给出相反答案（kernel 直接抛 TypeError、motion 报 reduce）。现在 kernel 依赖 motion，`reducedMotion` 缺省即 `resolveMotionPreference() === 'reduce'`（覆盖 ?? 系统偏好），没有 matchMedia 一律不减弱；glyph 转圈、backgrounds、滚动、数字动画全部走同一函数。CSS 侧 `tokens.css` 新增 `:where([data-motion='reduce'])` 块，与 `@media (prefers-reduced-motion: reduce)` 同源生成、逐条相同——作者把 `data-motion="reduce"` 打在任意容器即局部减弱。全局配置加 `motion?: 'reduce' | 'no-preference'`，Vue `provideXhConfig` / WC `<xh-config motion>` 收到即调 `setMotionOverride`。

  **缓动与时长的真源是令牌。** motion 包新增 `durations = { fast, normal, slow }`，`animate()` 缺省与 `@xihan-ui/animations` 的缺省时长都引它；`check-motion-source` 比对 primitive.json 与 easing.ts / durations.ts，值不等即红；`check-reduced-motion-channel` 禁止 motion 包之外再出现 `matchMedia('(prefers-reduced-motion')`。

  **皮肤的 reduce 块归口。** 只在两种情况自写：无限循环动画要整个停掉、有使用者时长槽的过渡要兜住穿透。image-viewer / side-nav / layout 三份纯重复令牌层的块删掉；table 的 `0.01ms !important` 改 `animation: none`；保留的 10 份每块配一份等价的 `[data-motion='reduce']` 规则。animation / transition 不再直引 `--xh-duration-*` 原语：spinner 走 `--xh-spin-duration`，skeleton 走新令牌 `--xh-shimmer-duration`（1600ms）。`check-infinite-motion` / `check-motion-primitives` 守住。

  **浮层的 placement / offset 默认值只有两种语义。** `OVERLAY_PLACEMENT_ANCHORED = 'bottom'`（气泡类）与 `OVERLAY_PLACEMENT_LIST = 'bottom-start'`（列表类）、`OVERLAY_OFFSET = 8` 从 headless 共享导出，各组件的 `<C>_DEFAULT_PLACEMENT` 改为引用它们（tooltip / hover-card / popover / popconfirm / popselect 新增导出常量），所有机器显式传 offset，不再隐式靠引擎兜底；`check-overlay-defaults` 守住。

  **层级覆盖槽齐全、后缀统一。** 22 个浮层族的 positioner / backdrop、toaster、navigation-menu 面板都有了 `--xh-<c>-layer` 槽（缺省仍是 `--xh-layer-*`）；tour / table / heatmap 的 `-z` 后缀槽改名 `-layer`（7 个，公开面变更，基线已推）。

  **进退场对称。** toast 退场位移从 distance-sm 改 distance-md（与进场、与 dialog 一致）；tour 的气泡改用 pop 族，聚光灯补退场；side-nav 折叠态弹出面板补进退场并在 Vue / WC 接上退场租约。

  **navigation-menu 的定位登记变成可验证的。** 三道浮层门禁此前按「anatomy 有 positioner」发现族，它从没被检查过；现在 `SKIN_POSITIONED` 名单要求它没有 positioner、不接引擎、面板由皮肤 absolute 排布，任一条不成立即红。`check-arrow-geometry` 增比对 JS 箭头常量（8·√2 / 8）与令牌（8px 边长 / 8px 圆角）。

- 466f143: 新增两个包：`@xihan-ui/motion` 收动效原语，`@xihan-ui/animations` 收现成的动效。

  动效的东西原先散在三处：缓动表与减弱动效探测在 `behavior`，补间与帧循环在 `headless/src/shared`，两套缓动的档名和值还对不上。`@xihan-ui/motion` 把它们收成一处，并补上真正缺的两样——解析解弹簧与 Web Animations 的薄封装。缓动从此只有一份来源：CSS 侧的 cubic-bezier 串与 JS 侧的采样函数同名同源。弹簧按阻尼比分三支算沉降时长，与 dt=0.1ms 的四阶龙格-库塔积分逐点对拍。减弱动效在系统偏好之上叠了一层应用级 override，接得上产品自己的"减弱动效"设置项。

  `behavior` 与 `headless` 原样重新导出搬走的名字，公开面一个没少。

  `@xihan-ui/animations` 是建在上面的效果层：11 个进场预设、6 个注意预设、错开起播与文字拆分。一段动画是一份可 JSON 序列化的配方，能存进数据库、由界面下拉切换。减弱动效的降级由 `motion` 统一兜住，这一层不另开通道——降级只影响中间帧存不存在，不影响控制流。

## 1.0.0-preview.0

## 1.0.0-alpha.3

### Minor Changes

- 8d35702: 动效与浮层口径收口。

  **减弱动效只剩一条通道。** 此前 kernel 的 `RuntimeConfig.reducedMotion` 只读系统 matchMedia、motion 包的 `setMotionOverride` 只有 animate / 滚动 / 数字动画在听，presence 与 stick-to-bottom 感知不到应用级覆盖；无 matchMedia 的宿主两包还给出相反答案（kernel 直接抛 TypeError、motion 报 reduce）。现在 kernel 依赖 motion，`reducedMotion` 缺省即 `resolveMotionPreference() === 'reduce'`（覆盖 ?? 系统偏好），没有 matchMedia 一律不减弱；glyph 转圈、backgrounds、滚动、数字动画全部走同一函数。CSS 侧 `tokens.css` 新增 `:where([data-motion='reduce'])` 块，与 `@media (prefers-reduced-motion: reduce)` 同源生成、逐条相同——作者把 `data-motion="reduce"` 打在任意容器即局部减弱。全局配置加 `motion?: 'reduce' | 'no-preference'`，Vue `provideXhConfig` / WC `<xh-config motion>` 收到即调 `setMotionOverride`。

  **缓动与时长的真源是令牌。** motion 包新增 `durations = { fast, normal, slow }`，`animate()` 缺省与 `@xihan-ui/animations` 的缺省时长都引它；`check-motion-source` 比对 primitive.json 与 easing.ts / durations.ts，值不等即红；`check-reduced-motion-channel` 禁止 motion 包之外再出现 `matchMedia('(prefers-reduced-motion')`。

  **皮肤的 reduce 块归口。** 只在两种情况自写：无限循环动画要整个停掉、有使用者时长槽的过渡要兜住穿透。image-viewer / side-nav / layout 三份纯重复令牌层的块删掉；table 的 `0.01ms !important` 改 `animation: none`；保留的 10 份每块配一份等价的 `[data-motion='reduce']` 规则。animation / transition 不再直引 `--xh-duration-*` 原语：spinner 走 `--xh-spin-duration`，skeleton 走新令牌 `--xh-shimmer-duration`（1600ms）。`check-infinite-motion` / `check-motion-primitives` 守住。

  **浮层的 placement / offset 默认值只有两种语义。** `OVERLAY_PLACEMENT_ANCHORED = 'bottom'`（气泡类）与 `OVERLAY_PLACEMENT_LIST = 'bottom-start'`（列表类）、`OVERLAY_OFFSET = 8` 从 headless 共享导出，各组件的 `<C>_DEFAULT_PLACEMENT` 改为引用它们（tooltip / hover-card / popover / popconfirm / popselect 新增导出常量），所有机器显式传 offset，不再隐式靠引擎兜底；`check-overlay-defaults` 守住。

  **层级覆盖槽齐全、后缀统一。** 22 个浮层族的 positioner / backdrop、toaster、navigation-menu 面板都有了 `--xh-<c>-layer` 槽（缺省仍是 `--xh-layer-*`）；tour / table / heatmap 的 `-z` 后缀槽改名 `-layer`（7 个，公开面变更，基线已推）。

  **进退场对称。** toast 退场位移从 distance-sm 改 distance-md（与进场、与 dialog 一致）；tour 的气泡改用 pop 族，聚光灯补退场；side-nav 折叠态弹出面板补进退场并在 Vue / WC 接上退场租约。

  **navigation-menu 的定位登记变成可验证的。** 三道浮层门禁此前按「anatomy 有 positioner」发现族，它从没被检查过；现在 `SKIN_POSITIONED` 名单要求它没有 positioner、不接引擎、面板由皮肤 absolute 排布，任一条不成立即红。`check-arrow-geometry` 增比对 JS 箭头常量（8·√2 / 8）与令牌（8px 边长 / 8px 圆角）。

## 1.0.0-alpha.2

### Minor Changes

- 466f143: 新增两个包：`@xihan-ui/motion` 收动效原语，`@xihan-ui/animations` 收现成的动效。

  动效的东西原先散在三处：缓动表与减弱动效探测在 `behavior`，补间与帧循环在 `headless/src/shared`，两套缓动的档名和值还对不上。`@xihan-ui/motion` 把它们收成一处，并补上真正缺的两样——解析解弹簧与 Web Animations 的薄封装。缓动从此只有一份来源：CSS 侧的 cubic-bezier 串与 JS 侧的采样函数同名同源。弹簧按阻尼比分三支算沉降时长，与 dt=0.1ms 的四阶龙格-库塔积分逐点对拍。减弱动效在系统偏好之上叠了一层应用级 override，接得上产品自己的"减弱动效"设置项。

  `behavior` 与 `headless` 原样重新导出搬走的名字，公开面一个没少。

  `@xihan-ui/animations` 是建在上面的效果层：11 个进场预设、6 个注意预设、错开起播与文字拆分。一段动画是一份可 JSON 序列化的配方，能存进数据库、由界面下拉切换。减弱动效的降级由 `motion` 统一兜住，这一层不另开通道——降级只影响中间帧存不存在，不影响控制流。
