# @xihan-ui/styles

## 1.0.0-alpha.2

### Major Changes

- 934e126: 每份皮肤现在都能单独引入了，动画不再指望别处的文件在场。

  `styles` 的 exports 逐组件铺了一百多条子入口，`import '@xihan-ui/styles/dialog.css'` 是受支持的用法。但 `xh-fade-in`、`xh-fade-out`、`xh-spin`、`xh-dialog-in/out` 这五支关键帧住在 `motion.css` 里，被 15 份别的皮肤引用——单独引入其中任何一份，动画名都查不到。`@keyframes` 的名字查找只认「文档里有没有这个名字」，查不到既不报错也不降级，看上去就是「这个组件没做动效」。`spinner.css` / `switch.css` / `popconfirm.css` 三处注释早就写明了这条理由，只是这五支没照办。

  现在每份皮肤都自带它用到的关键帧。`motion.css` 因此空了，**已删除，`./motion.css` 子入口一并移除**——如果你显式引过它，删掉那行即可，它提供的关键帧已经跟着各组件走了。

  新增 `check-keyframe-refs` 门禁盯住三件事：引用的动画名必须在同一份皮肤里定义、同名的多份定义必须逐字一致（名字是全局的，两份不同内容会互相覆盖）、关键帧必须写在 `@layer xihan.motion` 里（使用者按层覆盖时才盖得住）。

  产物只大了 60 B：重复的关键帧对 gzip 几乎是免费的。

### Minor Changes

- 091bbef: 补上动效地基的四个缺口。

  **减弱动效此前基本是失效的。** `tokens.css` 里一个 `prefers-reduced-motion` 都没有，降级靠 19 份皮肤各写各的 `@media`，而它们只把 `animation-duration` 压到 `0.01ms`——位移与缩放是写死的字面量，压时长压不掉。前庭不适恰恰来自大位移与缩放，所以「减弱动效」的用户看到的是瞬间跳完整段位移。现在幅度走 `--xh-motion-distance-sm/-md` 与 `--xh-motion-scale-enter`，令牌层在 reduce 下把它们归零，皮肤不必自带 `@media`。删掉 8 份已经冗余的降级块（含 8 条 `!important`）；marquee / skeleton / spinner 那几处有讲得通的自定义降级，保留。

  **dialog 与 image-viewer 的退场动画从来没播过。** 皮肤给挂着退场动画的 `content` 补了 `[hidden]{display:none}`，收起时元素当场不生成盒子，动画不启动，退场探测器放弃申领租约、就地卸载。drawer 早就绕开了这个坑，它的注释还写着「与 dialog 一致」——而 dialog 恰恰是反的。现在真的一致了，四条退场动画同时补上 `forwards`。

  **Web Components 端全域没有退场动画。** 三个浮层元素把收起写死在展开态上，与 `data-state="closed"` 同帧写内联 `display:none`。现在收起跟着 presence 走；Light DOM 下被拉长的不是节点存在的时间，而是可见的时间。

  **破坏性程度**：进场缩放统一到 `0.96`（此前 0.98 与 0.96 混用），dialog / toast 进场 / color-picker 的起势略明显一点。button 的加载转圈不再被压成 `0.01ms`——转圈是「系统还在做事」的唯一可感知信号，压掉等于把加载态变成假死。

  回归测试进了 `tests/browser/`：jsdom 不把样式表里的 animation 算进 `getComputedStyle`，这三件事在 jsdom 里结构性测不到。

### Patch Changes

- 7a5d898: 漏引皮肤不再静默：新增 `startSkinCheck()` 开发期探测与 `styles.missing-skin` 诊断码。

  按需引皮肤时漏掉一行原本是这个库最难查的失效：那个组件的 `data-scope` / `data-part` 照常都在、
  别的皮肤也确实加载了，只有它渲染成没有内边距、没有底色的裸元素，看起来像组件坏了而不是少引了一行。
  这一条正是「按组件挑」在真实项目里立不住的根本原因。

  每份组件皮肤现在在自己的 `[data-scope='X']` 上落一个 `--xh-X-skin` 标记（104 份）。
  `startSkinCheck()` 扫页面上出现过的每个 scope，取不到标记就报诊断：

  ```ts
  if (import.meta.env.DEV) {
    const { startSkinCheck } = await import("@xihan-ui/kernel/skin-check");
    startSkinCheck();
  }
  ```

  ```
  [xh][button] [styles] button 的皮肤没引：import '@xihan-ui/styles/button.css'，或改引全量的 '@xihan-ui/styles'
  ```

  两处刻意的取舍：

  - **每个 scope 只探一次。** 探测要读计算样式，逐实例探是真实的强制样式重算；一个 scope 的皮肤
    在不在场与实例数无关，探一次就够。
  - **标记落在 `[data-scope='X']` 而不是 root 部件上。** 浮层族的 `content` 被 portal 到 body，
    不在 root 的子树里，只在 root 上声明的话自定义属性继承不过去，这些部件会误报。

  探测器走 `@xihan-ui/kernel/skin-check` 子路径而不是主入口：它是开发期工具，不该躺在每个消费方都会打包的那条入口里（放主入口会让 kernel 的体积棘轮超 118 B，那条棘轮量的正是整包）。

  新增 `check-skin-markers` 门禁守住 104 份皮肤的标记齐全——漏一份，那个组件就退回静默失效，
  而且探测器还一声不吭。`pnpm gate` 十九项 → 二十项。

- 59c86fa: 新增 `check-style-entries` 门禁：每份皮肤都必须进得了全量入口、也够得着按需入口。

  `index.css` 的 `@import` 清单是手工维护的，`package.json` 的子路径导出也是。两处任何一处漏了，
  结果都是静默的：漏进 `index.css`，全量引入的人拿不到那份皮肤，组件渲染成裸元素；
  漏了子路径导出，按需引入的人根本 import 不到它。今天 109 份皮肤两处齐全，但没有任何东西守着。

  门禁同时把「按需产物的顺序只能由 `index.css` 过滤得来」钉在这里。同一个 `@layer xihan.components`
  内，等特异性的规则靠源序定胜负；另起一套排序（按字母、按目录读取序）今天看不出差别——
  当前仅有的 3 处跨 scope 规则在两种排序下相对次序恰好一致——但那正是它危险的地方：
  将来加进第四处，按需引入的人就会与全量引入的人渲染不同，而且全绿。

  `installation.md` 的「样式的三种接法」如实补上第二种要自己扛的两条风险，并给出体积口径
  （全量 51 kB gzip，含令牌与 109 份皮肤），建议没有明确体积压力就用全量。

- Updated dependencies [3469066]
- Updated dependencies [091bbef]
  - @xihan-ui/tokens@1.0.0-alpha.2

## 1.0.0-alpha.1

### Major Changes

- 479bfcb: 级联选择皮肤全面翻修：展开路径改品牌淡底加粗、分支条目补右向箭头、列改内容撑宽定高、条目度量放宽。

  破坏性：4 个覆盖槽改名（不留旧名）：

  - `--xh-cascader-row-bg-highlight` → `--xh-cascader-row-bg-active`：展开路径的底色从中性灰二档改为品牌淡底（经 `--xh-_tone-subtle` 随语气、缺省 `--xh-bg-brand-subtle`）并加 `--xh-cascader-row-active-font-weight`（缺省 600）；悬停与键盘锚点保持中性灰轻档，两档靠色相分家。
  - `--xh-cascader-column-w` → `--xh-cascader-column-min-w`：列从定宽 11rem 改为内容撑宽 + 下限 7rem。
  - `--xh-cascader-column-max-h` → `--xh-cascader-column-h`：列高从内容撑（上限 16rem）改为定高 11.25rem，切换展开路径浮层不再上下跳动。
  - `--xh-cascader-indicator-size` → `--xh-cascader-item-indicator-size`：与既有 `--xh-cascader-item-indicator-fg` 配对，避免与触发器 indicator 部件混名。

  新增：

  - 分支条目行尾自动画右向小箭头（`data-branch`，纯 CSS，`--xh-cascader-branch-arrow-size/-fg/-stroke` 可覆写，rtl 自动翻转，禁用同灰）。
  - 触发器箭头与勾选标记的 `:empty` 兜底字形（▾ / ✓），与 select 同约定；级联勾选半选态皮肤自绘横杠。
  - 条目 padding 放宽为 6px / 12px（行内走 `--xh-control-px-md`，紧凑密度自动收窄）、上限宽 25rem、背景与文字色过渡。
  - 搜索候选与列内条目共用同一套行度量槽；搜索视图规则移入 `xihan.components` 层。
  - 三处聚焦环改固定 `--xh-ring-focus`（不再随语气）；浮层入场横移 rtl 翻转。

- 9d7d703: 下拉/列表族条目度量与高亮档位统一（select / menu / listbox / combobox / popselect / tree / tree-select，向级联选择的两档制看齐）。

  破坏性：7 个覆盖槽改名或移除（不留旧名）：

  - `--xh-select-item-bg-highlight` → `--xh-select-item-bg-hover`、`--xh-combobox-item-bg-highlight` → `--xh-combobox-item-bg-hover`、`--xh-popselect-item-bg-highlight` → `--xh-popselect-item-bg-hover`、`--xh-menu-item-bg-highlight` → `--xh-menu-item-bg-hover`：悬停与键盘锚点统一为中性灰轻档（缺省 `--xh-bg-subtle`），不再随语气换色。
  - `--xh-listbox-item-bg-highlight`、`--xh-tree-row-bg-highlight`、`--xh-tree-select-row-bg-highlight` 移除：键盘锚点并入轻档，与悬停共用 `-bg-hover` 一个槽（键盘位置由聚焦环表达，选中仍是文字色 + ✓ 标记，互不挤占）。

  新增（menu）：

  - 打开子菜单的触发条目升为强档：品牌淡底（经 `--xh-_tone-subtle` 随语气、缺省 `--xh-bg-brand-subtle`）+ 600 字重，新增 `--xh-menu-item-bg-active` 与 `--xh-menu-item-active-font-weight` 槽；两档靠色相分家，与级联选择的展开路径同一套词汇。
  - 条目行高从 none 抬到 normal，新增 `--xh-menu-item-leading` 槽。

  度量：

  - 七家条目 padding 统一为 6px / 12px（`--xh-space-1_5` / `--xh-control-px-md`，行内随密度轴收窄），底色与文字色补 micro 过渡。
  - menu 尺寸阶梯重排：sm = `--xh-space-1` / `--xh-control-px-sm`，lg = `--xh-space-2` / `--xh-control-px-lg`。
  - listbox / combobox 分组标题行内内缩跟随条目改为 `--xh-control-px-md`，与条目文字保持同一条竖线。

- f7d53de: 列表族条目度量与高亮档位统一第二批（context-menu / menubar / mention / time-picker / transfer / table），与 select 族同一套两档词汇。

  破坏性：9 个覆盖槽改名或移除（不留旧名）：

  - `--xh-context-menu-item-bg-highlight` → `--xh-context-menu-item-bg-hover`、`--xh-menubar-item-bg-highlight` → `--xh-menubar-item-bg-hover`、`--xh-transfer-item-bg-highlight` → `--xh-transfer-item-bg-hover`、`--xh-table-row-bg-highlight` → `--xh-table-row-bg-hover`、`--xh-time-picker-item-bg-highlight` → `--xh-time-picker-item-bg-hover`：悬停与键盘锚点统一为中性灰轻档（缺省 `--xh-bg-subtle`），不再随语气换色。
  - `--xh-time-picker-item-bg-checked-highlight` → `--xh-time-picker-item-bg-checked-hover`：同一档位词汇；选中格保持品牌实底不变。
  - `--xh-mention-item-bg-highlight` → `--xh-mention-item-bg-hover`，`--xh-mention-item-fg-highlight` 与 `--xh-mention-item-font-weight-highlight` 移除：候选锚点回归纯轻档底色，不再借选中的文字色与字重。

  新增：

  - context-menu 打开子菜单的触发条目升强档：品牌淡底（经 `--xh-_tone-subtle` 随语气、缺省 `--xh-bg-brand-subtle`）+ 600 字重，新增 `--xh-context-menu-item-bg-active` 与 `--xh-context-menu-item-active-font-weight`。
  - menubar 展开着的菜单 trigger 升强档：`--xh-menubar-trigger-bg-active` 槽名不变、缺省从中性灰改为品牌淡底；不加字重（横排加粗会推挤相邻触发器）。悬停新增轻档槽 `--xh-menubar-trigger-bg-hover`。
  - 条目行高从 none 抬到 normal，新增 `--xh-context-menu-item-leading` 与 `--xh-menubar-item-leading`。

  度量：

  - context-menu / menubar / mention / transfer 条目与 time-picker 格 padding 统一 6px / 12px（`--xh-space-1_5` / `--xh-control-px-md`，行内随密度轴收窄），底色文字色补 micro 过渡；context-menu / menubar 尺寸阶梯重排（sm = `--xh-space-1` / `--xh-control-px-sm`，lg = `--xh-space-2` / `--xh-control-px-lg`）。
  - time-picker 格保持紧排行高：居中的单个数字格没有截断层，列内多露几格。
  - transfer 面板头与搜索框行内内缩跟随条目改 `--xh-control-px-md`，勾选列与全选框保持同一条竖线。
  - table 只统一行高亮档位词汇；行选中保持底色表达（宽行扫读依赖底色通道），单元格度量不动。
  - tags-input 不入组：其 data-highlighted 是退格/方向键的操作光标（整颗反白表示即将删除或编辑），语义与列表导航高亮不同，胶囊度量亦非列表行。

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

- c57542d: 补齐 4 处「边框改不动」的覆盖槽。

  这几处的边框颜色绑在背景槽上，或者干脆没有槽——想只改边框改不了，一动就连底色一起变：

  - `form` 的提交按钮三态：`border-color` 直接读 `--xh-form-submit-bg`，没有 `--xh-form-submit-border`。
  - `editable` 的提交按钮 hover / active：静息态有 `--xh-editable-submit-border`，另两态回落到 bg 槽，
    覆盖被顶掉。
  - `table` 的行选中把手选中态：静息态有 `--xh-table-trigger-border`，选中态改用 bg 槽。
  - `steps` 的禁用态指示器：全皮肤唯一一条没有对外覆盖槽的边框声明，而且拿前景令牌
    `--xh-fg-disabled` 当边框色；同部件的 current / completed 两态都有各自的 border 槽。

  新增 8 个槽，都排在既有 bg 槽之前作为第一优先，未设置时求值链回落到原值——**渲染结果逐字不变**，
  既有的 `--xh-form-submit-bg` 之类覆盖照旧同时改动边框与底色。

- a19bbaa: 级联选择补空态兜底：新增 empty 部件，搜索无候选或 collection 为空（根列没有条目）时露面，其余时候带 hidden。

  - headless：`getEmptyProps` 管空态占位的露面与收起；`getSearchListProps` 无候选时带 `data-empty`，`getContentProps` 根列没有条目时带 `data-empty`；新增 `translations` prop（`empty` / `noMatch` 两键，默认英文）与 api 上并入默认后的完整一份。
  - vue：`XhCascaderContent` 自动补渲空态占位，`empty` 插槽可换内容，缺省文案按视图取无匹配或无数据；`translations` prop 接入全局 `provideXhConfig` 注入点（`translations.cascader`）。
  - web-components：新增可缺省的 `empty` 部件，元素代管其 hidden，文案归作者。
  - styles：空态占位居中排版（`--xh-cascader-empty-min-h` / `--xh-cascader-empty-p` / `--xh-cascader-empty-fg` 可覆写）；无候选时候选列表不再占位，根列没有条目时空列让位。

- 72dc39c: color-picker 能进 HTML 表单了。

  此前它既没有 `name` prop 也没有表单影子——放进 `<form>` 里提交，`FormData` 里没有这个字段。
  同仓 11 个组件早就做全了这件事，它是缺口之一。

  照仓内既成的形状补：新增 `hidden-input` 部件（`type=hidden`，排在解剖末位）、`name?: string` prop、
  `ColorPickerApi.getHiddenInputProps()`。影子产出的属性恰好五条——parts 属性、`type`、`name`、`value`、
  `disabled`——`type` 必须排在 `value` 前（改 type 会重置输入的值），`name` 不给就整条不产出、这份输入
  不参与提交，禁用时带原生 `disabled` 不提交值，只读照常提交。

  **这是纯增量**：影子是作者自己写的可选部件（Vue 侧新增 `XhColorPickerHiddenInput`，WC 侧新增
  `::part(hidden-input)`），不写它就不存在，既有 DOM 与皮肤选择器一个字节不变。

- 4748212: 控件边界切到 `border.control`，WCAG SC 1.4.11 的 3:1 第一次真的达标。

  **这是一次观感变更**：输入框、选择器、复选框、单选、开关、步进钮这一类控件的边框会比以前明显一点
  （浅色 1.26 → 3.23，深色 1.91 → 3.59），悬停档 4.73 / 4.18。分隔线、卡片描边、表格行线、浮层外框
  一律不动——它们不在 SC 1.4.11 的范围内，跟着变重只会毁掉版面。

  131 处改动，判定规则是可机械执行的四问，其中决定性的一问是**焦点环画在谁身上**：环向下委派给
  后代（`outline: none` 且后代另有画环规则）的盒子是取景框不是控件，它的边框不承载「不看清就做不成事」
  的信息。`table` 的 root 与 `listbox` 的 content 因此同判装饰——两份文件里各自写着的注释就是依据
  （「纯容器：焦点落它身上不画环，高亮永远长在行上」／「落焦不画环：高亮永远长在条目上」）。

  **三处二阶效应，逐条处理过：**

  - `splitter` 的分隔条静息走 `background` 取 `border.default`，而它的悬停走的是 `bg-*` 族。只迁静息会让
    悬停比静息更淡，所以这一处不迁。
  - `text-field` / `number-field` 的**聚焦态描边**兜底仍是 `border.default`。静息提到 3.23 之后，控件一被
    聚焦边框反而掉回 1.26——比静息淡一大截。8 条聚焦槽一并迁走（含 subtle / ghost 两个变体：它们静息是
    `transparent`，聚焦那道边就是当下唯一的边界）。
  - `transfer` 的搜索框 `border: 0` 只留一条下边线，而它与面板共用 `--xh-transfer-panel-border`。新增
    `--xh-transfer-search-border` 单独承载，默认控件级。

  写了一份倒挂检查：13 个私有边框槽族 × 四个主题档位（浅、深、浅+高对比、深+高对比），逐档比对
  静息 / 悬停 / 聚焦的权重必须单调不减，现在零倒挂。

  **仍未达标、如实记账的一处**：带语气的 outline 形态（`<XhButton variant="outline" tone="danger">` 这类）
  走的是 `--xh-_tone-border`，它是语气色兑 40% 底色的结果，六种语气在两套主题下是 1.44–2.18，新令牌够不着。
  要治得另立一支控件级的语气边框槽，而那一支里 `warning` 对白底只有 2.70，仍需单独裁定——留待下一轮。

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

- 032f3fd: 带语气的 outline 控件边框补到 3:1，并修掉上一版留下的一处断链。

  上一版把控件边界迁到 `border.control` 时，如实记了一笔「带语气的 outline 形态够不着 3:1」——
  它走的是 `--xh-_tone-border`（语气色兑 40% 底色），六族在两套主题下是 1.44–2.18。这一版补上。

  新增 `--xh-_tone-border-control`：直接取语气主色本体，不再兑底色。两族在各自的底上仍不够，
  按主题各兜一次——语气色是固定原语、不随主题翻，这是唯一能表达的地方：

  - 黄在白底上只有 2.70，浅色态改取新增的 `--xh-color-warning-700`（3.75）；深色态 600 档就有 7.32，不动。
  - 中性在深色底上只有 2.54，深色态改取 `--xh-color-neutral-550`（3.59）；浅色态 600 档就有 7.80，不动。

  六族 × 两套主题现在最低 3.04（浅色 success），全部达标。

  **调色板新增一档** `--xh-color-warning-700 = oklch(0.62 0.15 70)`。步距 ΔL 0.085，落在同族 700 档的
  区间中间（brand 0.058 / danger 0.077 / success 0.138），色度按同族惯例微降，色相与 600 一致。
  黄族此前只有 500/600 两档，没有更深的档可取，所以必须新增。

  **顺带修掉一处断链**：上一版把 `toggle.css` 的 outline 边框改指了 `--xh-_tone-border-control`，
  而那个槽当时并不存在——`<XhToggle variant="outline" tone="danger">` 的边框一直退到中性色，语气丢了。
  这一版把槽真正建起来，`button` 与 `button-group` 一并接上。

  **新增门禁 `check-private-slots`**：皮肤里消费的每个 `--xh-_*` 私有槽都必须在某份皮肤里声明过，
  声明了没人用的也要删。上面那条断链正是它该拦下的——CSS 不报错、TS 不报错，
  而既有的 `check-token-refs` 整体放行 `--xh-_` 前缀，谁都看不见。拿改动前的仓库实跑过：它红在
  `toggle.css:71`，改完转绿。

### Patch Changes

- bae3231: combobox 展开按钮翻面改为只转箭头字形（或作者塞的图形），不再旋转按钮本体：按钮自带悬停底色，整体旋转会带着底色一起转出一个歪斜的方块。
- c8c7c18: 修复 `index.css` 的级联层序：`layers.css` 的层序声明挪到入口最顶。此前 tokens 与部分组件皮肤抢先立层，实际层序成了 `tokens < components < reset < motion < overrides`，`reset` 的 `font: inherit` 会压掉表单控件皮肤的 `font-size`。date-picker 的 showTime 皮肤同步从 motion 层归位 components 层。仅分层入口受影响，`index.unlayered.css` 行为不变。
- Updated dependencies [f72664d]
- Updated dependencies [89d8c54]
- Updated dependencies [032f3fd]
  - @xihan-ui/tokens@1.0.0-alpha.1

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

### Patch Changes

- Updated dependencies [bc65cb7]
  - @xihan-ui/tokens@1.0.0-alpha.0
