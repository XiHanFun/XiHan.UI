# @xihan-ui/headless

## 1.0.0-alpha.2

### Minor Changes

- 466f143: 新增两个包：`@xihan-ui/motion` 收动效原语，`@xihan-ui/animations` 收现成的动效。

  动效的东西原先散在三处：缓动表与减弱动效探测在 `behavior`，补间与帧循环在 `headless/src/shared`，两套缓动的档名和值还对不上。`@xihan-ui/motion` 把它们收成一处，并补上真正缺的两样——解析解弹簧与 Web Animations 的薄封装。缓动从此只有一份来源：CSS 侧的 cubic-bezier 串与 JS 侧的采样函数同名同源。弹簧按阻尼比分三支算沉降时长，与 dt=0.1ms 的四阶龙格-库塔积分逐点对拍。减弱动效在系统偏好之上叠了一层应用级 override，接得上产品自己的"减弱动效"设置项。

  `behavior` 与 `headless` 原样重新导出搬走的名字，公开面一个没少。

  `@xihan-ui/animations` 是建在上面的效果层：11 个进场预设、6 个注意预设、错开起播与文字拆分。一段动画是一份可 JSON 序列化的配方，能存进数据库、由界面下拉切换。减弱动效的降级由 `motion` 统一兜住，这一层不另开通道——降级只影响中间帧存不存在，不影响控制流。

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

- 52729a1: 104 个组件全部留出 `<Comp>Translations` 的位，哪怕眼下一句文案都没有。

  原先只有 32 个组件有 `Translations` 类型，其余 72 个什么都没有。将来某个组件要外露一句读屏文案时，
  得同时补：类型、子入口导出、包级 barrel、`XhTranslationOverrides` 的一行、两个适配器的全局配置能否命中。
  五处漏一处就是「配了没生效」，而且不报错。

  现在类型一律先在，空接口也是接口：

  ```ts
  /** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
  export interface BadgeTranslations {}
  ```

  `XhTranslationOverrides` 相应从 31 条扩到 104 条，全局配置对每个组件都有落点。
  `date-field` 与 `date-picker` 共用一份文案的既有映射原样保留。

  新增 `check-translations-slots` 门禁守住两件事：每个组件都有自己的 `Translations`、
  且都挂进了覆盖表。加了新组件却忘了留位，当场红。`pnpm gate` 二十项 → 二十一项。

- ba3b3aa: 自定义元素补上全局文案层：`setXhConfig`。

  `provideXhConfig` 一直只有 Vue 适配器有。自定义元素拿不到 provide/inject，文案又是对象、
  只能走 property 不能走 attribute，于是 31 个元素只能在 JS 里逐实例各设一次 `.translations`——
  一个中文应用要为此写几十行。而 `guide/i18n.md` 通篇把 `provideXhConfig` 当作「这套机制」讲，
  一次都没提 Web Components，读的人会以为两端通用。

  现在两端各有一处全局出口，取值优先级一致：**实例 → 全局 → 组件内建默认（英文）**，
  `translations` 逐键合并。切语言再调一次 `setXhConfig` 即可，已挂载的元素跟着重渲。

  接线落在 `MachineController` 一处——31 个元素的机器 props 都从那里过，不必逐个改。

  `XhTranslationOverrides` 那张 31 条的映射表下沉到 `@xihan-ui/headless`，两个适配器共用一份。
  在 WC 侧另抄一份是唯一的替代方案，而两份 31 条的表迟早会漂。Vue 侧原样再导出，导出名不变。

  与 Vue 侧的两处差别写进文档了：`setXhConfig` 是整份替换而非深合并；它是模块级的，
  没有「只在某棵子树里换语言」的能力。

- Updated dependencies [466f143]
- Updated dependencies [7a5d898]
  - @xihan-ui/motion@1.0.0-alpha.2
  - @xihan-ui/behavior@1.0.0-alpha.2
  - @xihan-ui/kernel@1.0.0-alpha.2
  - @xihan-ui/machine@1.0.0-alpha.2

## 1.0.0-alpha.1

### Major Changes

- d43624c: 把跨组件已经分叉的名字统一回一套。part 名与 prop 名在 1.0 之后就是公开 API——皮肤按
  `data-part` 选择、使用者按 prop 名调用——改名一律是破坏性变更，所以趁 alpha 一次改完。

  **time-picker 的列表条目由 `option` 改叫 `item`。** 另外 32 个组件的列表条目都叫 `item`，
  只有它是 `option`。ARIA 角色仍是 `role="option"`（那是角色不是部件名），列里的候选值集合
  `TimePickerColumn.options` 也不动（那是数据不是部件）。

  迁移点：

  - `data-part='option'` 改成 `data-part='item'`；皮肤覆盖槽 `--xh-time-picker-option-*`
    改成 `--xh-time-picker-item-*`（共 10 个）。
  - Vue 组件 `XhTimePickerOption` 改名 `XhTimePickerItem`。
  - WC 的 `::part(option)` 改成 `::part(item)`。
  - headless 导出：`timePickerOptionQuery` → `timePickerItemQuery`、`findTimePickerOption` →
    `findTimePickerItem`、`timePickerOptionValue` → `timePickerItemValue`、
    `TimePickerOptionProps` → `TimePickerItemProps`。
  - `TimePickerApi` 上：`getOptionProps` → `getItemProps`、`isOptionSelected` → `isItemSelected`、
    `isOptionDisabled` → `isItemDisabled`、`focusedOption` → `focusedItem`。
  - 键盘规格号 `time-picker.kbd.option-*` → `time-picker.kbd.item-*`。

  **transfer 的数据入口由 `items` 改叫 `collection`。** 另外 17 个集合组件的数据入口都叫
  `collection`。单条的类型名 `TransferItem`、某一侧看得见的条目 `visibleItems`、纯函数
  `transferVisibleItems` 都不动——它们说的是「条目」，不是「数据入口」。

  迁移点：

  - Vue：`<XhTransferRoot :items="…">` 改成 `:collection="…"`。
  - WC：`el.items = […]` 改成 `el.collection = […]`（这个入口表达不成属性，本来就只能走 property）。
  - `TransferApi.items` → `TransferApi.collection`。

  **checkbox-group 的组内子部件对齐 radio-group。** 同一语义两套名字：checkbox-group 用
  `item-control` / `item-hidden-input`，radio-group 用 `indicator` / `hidden-input`。裸名是全仓
  多数（`indicator` 13 处、`hidden-input` 10 处），checkbox-group 随大流。`item-text` 不动
  （21 份解剖都这么叫）。

  迁移点：

  - `data-part='item-control'` → `'indicator'`，`data-part='item-hidden-input'` → `'hidden-input'`。
  - 皮肤覆盖槽 `--xh-checkbox-group-control-*` → `--xh-checkbox-group-indicator-*`（10 个），
    与 radio-group 的 `--xh-radio-group-indicator-*` 对齐。
  - `CheckboxGroupApi.getItemControlProps` → `getIndicatorProps`，
    `getItemHiddenInputProps` → `getHiddenInputProps`（两个名字 radio-group 早就在用）。
  - Vue 组件 `XhCheckboxGroupItemControl` → `XhCheckboxGroupIndicator`。

  **table 的空态部件由 `empty-state` 改叫 `empty`。** 部件名不该与组件的 scope 名撞车——
  `empty-state` 是一个独立组件的 `data-scope`，再拿它当 table 的部件名，写皮肤时
  `[data-part='empty-state']` 与 `[data-scope='empty-state']` 混在一起读不出谁是谁。
  combobox 早就叫 `empty`。独立的 `empty-state` 组件本身不动。

  迁移点：

  - `data-part='empty-state'` → `'empty'`。
  - `TableApi.getEmptyStateProps` → `getEmptyProps`。
  - Vue 组件 `XhTableEmptyState` → `XhTableEmpty`（`XhEmptyState*` 那一族是另一个组件，不变）。
  - WC 的 `::part(empty-state)` → `::part(empty)`。

  **transfer 的 `onSelectedChange` 改叫 `onSelectionChange`。** table 与 tree 都叫
  `onSelectionChange`。受控的 `selected` prop 与载荷字段 `{ selected }` 不动——那是「被勾中的值」，
  与回调名说的不是一回事。

  - `TransferSelectedChangeDetails` → `TransferSelectionChangeDetails`。
  - Vue 事件 `@selected-change` → `@selection-change`；WC 的 `selected-change` 事件同改。
  - `v-model:selected` 不变。

  **`size` 不再一名两用。** 三轴里的 `size` 是语气枚举，而 qr-code 的 `size` 是像素数值、
  splitter 的 `size` 是百分比数组——两者占着同一个名字却是完全不同的类型，使用者写
  `size="md"` 得到的是静默的错。

  - qr-code：`size` → `pixelSize`（WC 属性 `size` → `pixel-size`）。中心 logo 挖空区的
    `QrCodeLogoArea.size` 是模块数标量，不动。
  - splitter：数组值的一律改复数——`size` → `sizes`、`defaultSize` → `defaultSizes`、
    `onSizeChange` → `onSizesChange`、`onSizeChangeEnd` → `onSizesChangeEnd`、载荷字段
    `{ size }` → `{ sizes }`、机器事件 `SIZE.SET` → `SIZES.SET`、Vue 的 `v-model:size` →
    `v-model:sizes`、WC 属性 `size` → `sizes`。标量的不动：每块面板的 `collapsedSize`、
    `BOUNDARY.SET` 的 `size`、`setPanelSize`、`SplitterPanelState.size`。

  **没有合并的一处，记在这里免得后人重新翻案。** 就绪度审计说 pin-input 的 `onValueComplete`、
  editable 的 `onValueCommit`、slider 的 `onValueChangeEnd` 是「三个名字表达同一语义」，
  逐条读过源码后判定不成立：`onValueComplete` 是「每格都填满的那一刻」（值的形状谓词），
  `onValueCommit` 是「提交那一刻」（用户显式确认），`onValueChangeEnd` 是「一次操作结束」
  （手势结束，splitter 的 `onSizesChangeEnd` 用的是同一套）。三件不同的事，合并会让 API 更差。

### Minor Changes

- a19bbaa: 级联选择补空态兜底：新增 empty 部件，搜索无候选或 collection 为空（根列没有条目）时露面，其余时候带 hidden。

  - headless：`getEmptyProps` 管空态占位的露面与收起；`getSearchListProps` 无候选时带 `data-empty`，`getContentProps` 根列没有条目时带 `data-empty`；新增 `translations` prop（`empty` / `noMatch` 两键，默认英文）与 api 上并入默认后的完整一份。
  - vue：`XhCascaderContent` 自动补渲空态占位，`empty` 插槽可换内容，缺省文案按视图取无匹配或无数据；`translations` prop 接入全局 `provideXhConfig` 注入点（`translations.cascader`）。
  - web-components：新增可缺省的 `empty` 部件，元素代管其 hidden，文案归作者。
  - styles：空态占位居中排版（`--xh-cascader-empty-min-h` / `--xh-cascader-empty-p` / `--xh-cascader-empty-fg` 可覆写）；无候选时候选列表不再占位，根列没有条目时空列让位。

- ea78591: checkbox 与 switch 能进 HTML 表单了。表单字段组件从 18 个变成 20 个，五个缺口清完。

  **先纠正一条我此前记错的约束**：我曾把这两个记为「要单独一轮，因为 HTML 内容模型禁止 button 有
  交互后代」。查规范后不成立——interactive content 的定义里 `input` 那条写的是「**type 属性不处于
  Hidden 状态时**」，所以 `<input type="hidden">` 不是交互内容，放进 `<button>` 里是合法的。
  DOM 不必重构，与 color-picker、combobox 同一条路。

  - 新增 `hidden-input` 部件、`name` 与 `value` 两个 prop（`value` 缺省 `'on'`，与原生一致）。
  - **勾上才带 `name`**：没勾就整条不参与提交，这是原生复选框的语义。
  - **半选按未勾处理**：原生里 indeterminate 只是外观，提交与否看 `checked`。
  - Vue 侧由组件自己渲染（单体控件没有子部件插槽，作者递不进来），**给了 `name` 才有这个节点**——
    没给就与从前逐字节相同。WC 侧照旧由作者写 `data-xh-part="hidden-input"`。

  **两者的重置走转移而不是写 context**：它们的值就是机器状态（`on` / `off` / `indeterminate`），
  没有值 cell 可 reset。`FORM.RESET` 因此是一组带守卫的转移，受控时只发意图、非受控才真的转过去；
  已经停在默认态就不白发一次通知。

  如实记一处限制：`onCheckedChange` 的载荷刻意只有布尔（「用户交互的落点只可能是全选或全不选」），
  表达不了半选。所以回落点是半选时状态照常转、通知不发；受控且默认半选的组合因此拿不到重置。
  不为这一处去改已公开的载荷类型。

- 72dc39c: color-picker 能进 HTML 表单了。

  此前它既没有 `name` prop 也没有表单影子——放进 `<form>` 里提交，`FormData` 里没有这个字段。
  同仓 11 个组件早就做全了这件事，它是缺口之一。

  照仓内既成的形状补：新增 `hidden-input` 部件（`type=hidden`，排在解剖末位）、`name?: string` prop、
  `ColorPickerApi.getHiddenInputProps()`。影子产出的属性恰好五条——parts 属性、`type`、`name`、`value`、
  `disabled`——`type` 必须排在 `value` 前（改 type 会重置输入的值），`name` 不给就整条不产出、这份输入
  不参与提交，禁用时带原生 `disabled` 不提交值，只读照常提交。

  **这是纯增量**：影子是作者自己写的可选部件（Vue 侧新增 `XhColorPickerHiddenInput`，WC 侧新增
  `::part(hidden-input)`），不写它就不存在，既有 DOM 与皮肤选择器一个字节不变。

- a7e8755: combobox 能进 HTML 表单了。

  此前它既没有 `name` prop 也没有表单影子——放进 `<form>` 提交，`FormData` 里没有这个字段。

  **形状照 tree-select，不另起一套**：单个 `hidden-input` 部件（`type=hidden`，排在解剖末位），
  多选按逗号拼成一串。同为多值浮层选择器的 tree-select 已经是这个形状，combobox 换一种（比如
  一值一个影子输入、或隐藏 `<select multiple>`）会凭空造出第二套约定。

  如实记一笔：逗号拼串对含逗号的值不可逆，也不是原生的多值 `FormData`（`name=a&name=b`）。
  这是 tree-select 已有的性质，要改得两个一起改，是另一件事。

  纯增量：影子是作者自己写的可选部件，不写它就不存在，既有 DOM 与皮肤选择器一个字节不变。
  判据也按这个形状加——只在本用例的 fixture 里挂影子，其余用例的 order/counts 一条没改。

  **顺带被门禁逼出来的一件事**：加了 `name` 之后 `check-form-reset` 当场变红——带 `name` 就是表单
  字段，就必须认表单重置。combobox 因此一并接上了 `FORM.RESET`：值与输入串是两条独立受控轴各判各的，
  高亮锚点一并清（它指向的条目可能已被过滤掉）。表单字段组件从 17 个变成 18 个。

- e50a7c9: 复合控件开始响应表单重置。这一版落地机制本身与首个组件 radio-group，其余 16 个随后。

  实测过的缺陷：把本库的控件放进 `<form>`，调 `form.reset()`（或点 `XhFormResetTrigger`），
  显示与提交值都停在用户改后的状态——原生重置只还原原生控件，而这些控件的值攥在机器里，
  没有任何一处监听所属表单的 reset。

  **机制**：认重置的机器在根级声明一条无守卫、无载荷的 `FORM.RESET`，动作只做一件事——
  对若干个 cell 各调一次 `context.reset(key)`，即**重新求一遍那个 cell 自己的 `defaultValue` 表达式**
  再走原来的 `set`。落点因此与 cell 定义是同一份代码，不会各写一份而漂移；受控分支原样保留，
  所以「受控只发意图」是免费守住的。适配器侧只在唯一的机器接入点（Vue 的 `useMachine`）挂桥，
  组件文件零改动。

  一句话：`FORM.RESET` = 「把这个组件变回它此刻挂载会长成的样子」。

  **落点不取挂载时冻结的 `initial`，而是按当下 props 重算**。宿主换了 `defaultValue`（比如切去编辑
  另一条记录）就该回到新的那一份，这与原生 `reset()` 回到「当下的 default」一致。

  **受控且宿主没声明 `defaultValue` 时一动不动。** 这是最要紧的一条：cell 里那句 `?? 兜底` 把
  「宿主声明的默认值」和「组件的空值」烘在同一个表达式里（radio-group 是 `null`、rating 是 `0`、
  tags-input 是空数组）。照直落下去，受控分支会把这个空值当意图发给宿主——重置就从「没反应」
  变成「把宿主的数据抹掉」。`resetDeclaredValue` 把这一步挡住了，并有专门的判据钉着。
  **受控组件要拿到重置，必须显式传 `defaultValue`**，这是本库与「受控 reset 是纯空操作」的分歧点。

  **监听挂在锚点的 root node 上**，不挂在那个 form 上：form 会被条件渲染换掉、组件也会被搬走。
  归属在事件那一刻用 `closest('form')` 现算，因此嵌套表单不会误伤。重置被 `preventDefault` 拦下时
  不动——那时同表单的原生控件也没还原，组件单方面还原会拼出半份默认值。

  无 form、无 DOM、作者没写影子输入三种情形都不需要特别处理：归属判定不命中、服务端根本不挂效应、
  锚点是组件根节点而不是影子输入。

  BREAKING CHANGE: `Bindable` 新增必填成员 `reset()`，`ContextFacade` 新增 `reset(key)`。
  自建 `ReactiveRuntime`（写第三个适配器）的实现方需要补上 `reset`。仓内三处实现已全部跟进。

- 98d7ffe: 其余 16 个表单字段组件全部接上表单重置，并立一道门禁盯着以后新加的。

  现在 17 个带 `name` 的组件——checkbox-group、color-picker、date-field、date-picker、editable、
  file-upload、number-field、pin-input、radio-group、rating、select、slider、tags-input、text-field、
  time-field、time-picker、tree-select——放进 `<form>` 里点重置，都会回到各自的默认值。

  **逐组件不是一刀切**，几处照直做会错的地方分别绕开了：

  - `file-upload` 直写 cell，不走 `FILES.SET`：它的 intake 只在有文件通过校验时才写，空数组是空操作、清不掉列表。
  - `date-picker` 的重置不带 `src`：带了会命中 `closesOnSelect` 顺手收起浮层，或走进区间选择的截断分支。
  - `pin-input` 直写 cell，不走 `commitValue`：默认值是满格时它会白发一次「填完了」。
  - `color-picker` 的锚只在非受控时丢：锚是按值串缓存的色相，值受控时它还对应着宿主那份值，
    丢了会让灰度色的色相塌回 0°——值一个字节没变而色相滑块当场跳。
  - `rating` 一并清悬停缓冲，否则指针悬着会盖住重置后的显示。
  - `editable` 的 `committedValue`（Escape 撤销的落点）跟着值一起写：它的 cell 默认是 `prop('value') ?? …`，
    受控时直接重置会把它停在宿主旧值。
  - `tags-input` 的 `value` 与 `inputValue` 是两条独立受控轴，各判各的。
  - `tree-select` 的展开态不动：它不带 `name`、不参与提交，还原只会多派一次 `onExpandedChange`。
  - 焦点锚点、悬停位置、浮层开合、能力探测这类非表单 UI 状态一律不动——原生重置也不碰它们。

  **新增门禁 `check-form-reset`**：分母从源码扫出来（`*.types.ts` 的 props 里有 `name?: string` 即表单字段），
  不是手写名单——新加一个表单组件它自动进等式，忘了接线就红。豁免要写明理由，理由过期也报错。
  拿改动前的仓库实跑过它有分辨力。

- 239eb5d: 浮层箭头改为指向锚点，不再钉死在浮层中点。

  定位结果新增箭头落点：`PositionResult.arrow` 给出箭头中心距浮层起始缘的距离（上下两侧给 x、左右两侧给 y），由调用方在 `PositionOptions.arrow` 里交出箭头的尺寸与让开圆角的余量才计算，不要就缺席。落点算在翻面与挪位之后，两者的位移因此自动带上；锚点落在浮层之外时钳到最近的合法点。

  六个带箭头的浮层（popover / tooltip / hover-card / menu / context-menu / tour）接上这条链路：机器把箭头的量交给引擎，连接层把落点写成内联自定义属性，皮肤消费它、引擎没给时退回原来的居中。此前只要 placement 带 `-start` / `-end` 对齐、浮层比锚点宽、或引擎为避让把浮层挪了位，箭头就指向空处。

  tooltip 的箭头补了 `data-placement`，皮肤的四条侧向规则从挂祖先 positioner 改为挂箭头自己，与其余五个统一。

- a41b931: 进度条新增环形与仪表盘两种形态。

  - 新增 `variant` 轴：`line`（缺省，行为逐字不变）/ `circle` / `dashboard`，以及 `canvas`（承载环的 svg）与 `label`（环心那一块）两个可缺省部件。
  - 新增 props：`strokeWidth`（环的线宽，viewBox 单位，缺省 6）、`gapDegree` 与 `gapPosition`（仪表盘的缺口，缺省 75 度朝下）、`valueText`（进度不是百分比时给读屏念的那句话）。线宽是 prop 不是令牌——它改的是几何，半径要跟着往里收；线形的厚度仍走 `--xh-progress-thickness`。
  - 环的直径、底槽色、进度色与端点形状走令牌（`--xh-progress-size` / `-track` / `-range` / `-linecap`），几何由连接层算好写进标记，皮肤只上色。

  顺带两处修正：

  - 退化输入不再算成满进度：`max` 不为正或不是数时回落 100，`value` 不是数时按 0 处理（此前 `max=0` 会让进度算成满格）。
  - 线形的长度不再取整：`value=3 / max=8` 由 38% 改为 37.5%，相邻两档不会再看起来一样长。

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

- 89d8c54: 修四处在真实宿主里才现形的缺陷，`hideOutside` 的入参形状随之变化。

  **嵌套浮层不再被外层罩死。** 对话框里再开一个对话框（或抽屉），内层 portal 到 `body` 之后也是
  `body` 的直接子元素，会被外层背景失活的 `MutationObserver` 一并打上 `inert`——看得见、点不动。
  层注册表新增 `elementsAbove(layer)`，给出栈中位于该层之上的各层全部节点；`dialog` 与 `drawer`
  把它并进背景失活的目标集。

  **破坏性变更**：`hideOutside(targets, scope, options)` 的第一个参数由 `Element[]` 改为
  `() => Element[]`。施加 `inert` 的时机横跨整个展开期，晚于调用时刻才挂载的节点必须也能被算进目标，
  定死的数组做不到。调用点把数组包成箭头函数即可。同时 `LayerRegistry` 新增 `elementsAbove` 成员，
  自行实现该接口的需要补上。

  **破坏性变更**：`@xihan-ui/machine` 的 `Dict` 改为从 `@xihan-ui/kernel` 转出。两个包此前对同一个
  名字给出不同泛型元数（`Record<string, T>` 与 `Record<string, any>`），从哪个包导入会决定
  `Dict<string>` 编不编得过。

  **首屏即展开的对话框与抽屉能服务端直出了。** `rendered` 的初值此前整块圈在「有 document」的分支里，
  服务端算不出它，只发一个 23 字节的空占位：首屏没有对话框、没有可被索引与读屏读到的正文，
  客户端水合时再整棵补出来。初值改取状态机的展开态。

  **没有 window 的宿主里不再抛异常。** `prefersReducedMotion`、`onReducedMotionChange`、
  `createEnvSignals` 的默认参数写的是裸 `window`，而默认参数在函数体的守卫之前求值——三者的注释都
  承诺 SSR 期回落，实际是 `ReferenceError`。改走 `globalThis.window`，签名不变。

- 0a57e2f: popconfirm 与 float-button 的组件文档页第一次有了 Props 表。

  这两个组件没有自己的机器，props 写成 `Omit<PopoverSchema['props'], …> & …` 这样的类型别名；
  文档生成器只认 `interface`，于是 102 页里这两页的 Props 小节整段缺席——不是「暂缺」，是压根
  没生成，页面上看不出少了东西。生成器改走类型检查器解析，其余 100 页产出逐字不变。

- Updated dependencies [e50a7c9]
- Updated dependencies [239eb5d]
- Updated dependencies [89d8c54]
- Updated dependencies [24721f4]
- Updated dependencies [4b949c2]
  - @xihan-ui/machine@1.0.0-alpha.1
  - @xihan-ui/behavior@1.0.0-alpha.1
  - @xihan-ui/kernel@1.0.0-alpha.1

## 1.0.0-alpha.0

### Major Changes

- bc65cb7: 首个公开版本：框架无关的 UI 基座。

  自研薄 FSM 内核 + headless（anatomy / machine / connect）+ 设计令牌与主题运行时 + 样式层，
  102 个组件在 Vue 与 Web Components 两套适配器上共用同一份内核，跨适配器一致性套件与
  真实 Chromium 里的无障碍扫描、浮层定位契约全绿。

  浮层定位、虚拟滚动、Web Components 响应式基类、代码着色、流式 Markdown 均为自研，
  运行时不带第三方依赖。

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

- e788896: Select 支持多选，选中值由单值改为集合，公开 API 破坏性变更。

  多选打开方式是 `multiple`：点中条目即在集合里增删该项，列表不收起；单选行为不变，只是选中值
  的容器形状统一成了数组（单选恒为长度 ≤ 1）。

  迁移点：

  - `SelectValueChangeDetails.value` 由 `string | null` 变 `string[]`。原先判空写 `details.value === null`
    的，改判 `details.value.length === 0`；取单选值写 `details.value[0]`。
  - `SelectApi` 的 `value` 与 `valueText` 由单值变数组，两者逐项对应；`setValue` 签名变
    `(next: string | string[]) => void`，裸串按单选简写处理；新增 `multiple`。
    想拿「显示成什么字」不必自己拼，用 `displayText`：有选中取选中项文本（多选按半角逗号加空格连起来），
    否则取 `placeholder`。
  - Vue 默认插槽暴露的 `value` 与 `setValue` 随之变化；`update:value` 的载荷由单值变数组，
    因此 `v-model:value` 绑定的变量类型要一并改。`value` / `default-value` 两个 prop 仍接受裸串与 `null`。
  - WC `value-change` 事件的 `detail` 由 `{ value: string | null }` 变 `{ value: string[] }`；
    新增 `multiple` 属性。`value` 属性只递得进单值，多选集合请写 property。
    表单影子 `hidden-select` 不再写 `value`，选中态一律由 `option` 的 `selected` 表达（多选时开原生
    `multiple`）—— 靠读 `hidden-select.value` 反查选中项的代码要改成读 `selectedOptions`。

### Patch Changes

- Updated dependencies [bc65cb7]
- Updated dependencies [84b1aa3]
  - @xihan-ui/kernel@1.0.0-alpha.0
  - @xihan-ui/machine@1.0.0-alpha.0
  - @xihan-ui/behavior@1.0.0-alpha.0
