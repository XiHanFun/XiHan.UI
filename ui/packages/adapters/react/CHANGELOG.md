# @xihan-ui/react

## 2.0.0

### Major Changes

- 8f810d8: Alert 将 `content` 收为必需文本列，标题与说明必须放在其中；图标、操作和关闭入口仍按需渲染。

  默认外观改为中性抬升表面，语气只强调标题与图标，说明保持次级前景；操作与关闭入口统一排在尾端。

- 08850a2: **按钮与悬浮按钮撤掉 `shape`：圆角是形态身份的一部分，不再另开一根轴。**

  `button` 的 `shape`（rounded / pill / square）与 `float-button` 的 `shape`（circle / square）都是在 variant · tone · size 三轴之外另开的一根视觉轴，与「形状身份不随主题、密度改变」的约定相悖，也让同一枚按钮在页面里出现三种圆角。现在按钮与开关、按钮组同为胶囊，悬浮按钮的触发器与展开的每一条动作固定圆形；确实要换档的在任意子树上重声明 `--xh-button-radius` / `--xh-float-button-radius`。三端同步：Vue / React 的 `shape` prop、自定义元素的 `shape` attribute、`data-shape` 状态属性、`ButtonShape` / `FloatButtonShape` / `FLOAT_BUTTON_DEFAULT_SHAPE` 导出一并撤掉；悬浮按钮的「外形」示例移除。

- 1fb94ea: 日历拆成两个组件：`calendar` 改名为 `calendar-picker`（日历选择器，单选 / 多选），区间选择拆到新组件 `calendar-range-picker`（日历范围选择器）。

  - **破坏**：`calendar` 不再存在。单选与多选改用 `calendar-picker`：Headless 的 `calendarMachine` / `connectCalendar` / `calendarAnatomy` / `calendarKeyboard` / `calendarMeta` 改名为 `calendarPickerMachine` / `connectCalendarPicker` / `calendarPickerAnatomy` / `calendarPickerKeyboard` / `calendarPickerMeta`，类型 `CalendarSchema` / `CalendarApi` / `CalendarTranslations` / `CalendarSelectionMode` / `CalendarValueChangeDetails` / `CalendarRefs` 改名为 `CalendarPicker*`；Vue 与 React 的 `XhCalendar*` 改名为 `XhCalendarPicker*`，`useCalendar` 改名为 `useCalendarPicker`；自定义元素 `<xh-calendar>` 改名为 `<xh-calendar-picker>`；皮肤 `calendar.css` 改名为 `calendar-picker.css`，覆盖槽前缀 `--xh-calendar-*` 改为 `--xh-calendar-picker-*`；`data-scope="calendar"` 改为 `data-scope="calendar-picker"`。文案表的键 `calendar` 改为 `calendar-picker`。
  - **破坏**：`calendar-picker` 的 `selectionMode` 只剩 `'single' | 'multiple'`；`isDateUnavailable` 只收一个参数；删除 `allowsNonContiguousRanges`、`rangeAnchor`、`setRangeAnchor`、`data-in-range` / `data-range-start` / `data-range-end` / `data-range-preview` / `data-dragging` 与键盘表里的 `cancel-range` / `commit-range` 两行。
  - **新增** `calendar-range-picker`：值恒为区间两端（升序、长度 2），承接原来 `selectionMode="range"` 的全部行为——先落起点再落终点、按住拖选、拖动已选区间的一端、`Escape` 撤起点、`Tab` 收口、`allowsNonContiguousRanges`、`isDateUnavailable(value, anchor)`、`invalid` 自判、`rangeAnchor` / `dragging` / `setRangeAnchor`。三端部件名与日历选择器逐一相同（`XhCalendarRangePicker*`、`<xh-calendar-range-picker>`），皮肤 `calendar-range-picker.css`，覆盖槽 `--xh-calendar-range-picker-*`。
  - 网格纯数学（`buildMonthGrid` / `calendarPeriodOf` / `calendarPeriodValue` / `parseCalendarDate` 等）与 `CalendarGranularity` / `CalendarView` / `CalendarPeriod` / `CalendarPanel` / `CalendarCellProps` 等领域类型保持原名，两个日历共用；新增 `visibleCountOf` 与 `CalendarPart` 公开导出。
  - **破坏**：`date-picker` 只剩单选与多选，内嵌 `calendar-picker`：删除 `selectionMode="range"`、`endName`、`allowsNonContiguousRanges`、`fieldEnd`、`range-separator` 部件、`getRangeSeparatorProps`、`getSegmentGroupProps({ index })` 的 `index`、`DatePickerSegmentGroupProps`、`datePickerFieldEndProps`、`datePickerFieldAt`、`resolveDatePickerFieldIndex`、`DatePickerFieldIndex`、`datePickerPresetRange` / `datePickerPresetMonth` / `datePickerPresetYear`；`DATE_PICKER_RANGE_SEPARATOR` 改名为 `DATE_PICKER_PRESET_SEPARATOR`；Vue / React 删除 `XhDatePickerRangeSeparator`，`XhDatePickerSegmentGroup` / `XhDatePickerHiddenInput` 不再收 `index`；自定义元素删除 `end-name` 属性、`fieldEndSegments` 只读属性；`DatePickerTranslations` 删除 `startDate` / `endDate`；`isDateUnavailable` 只收一个参数。区间日期由随后的 `date-range-picker` 承接。
  - 文档：两个日历在组件总览里归入「数据录入」，各有独立预览；示例拆成 `calendar-picker`（基础、多选、不可选的日子、格子里放内容）与 `calendar-range-picker`（基础、并排两个月、不可用的日子、按周挑）。

- edaa3dc: Card 收敛为 `default`、`secondary`、`tertiary`、`transparent` 四种语义表面，并将结构统一为 `root / header / title / description / content / footer`。

  移除 `size`、`hoverable`、`split` 属性以及 `media`、`body` 部件；媒体改为普通子节点，卡片统一使用 16px 内边距、12px 段间距与高层圆角。

- 10c198a: 级联选择增加 name/form 原生表单出口，三端自动将每条选中路径编码为独立同名 JSON 字符串数组字段，支持禁用排除与原生重置。

  破坏性变更：value/defaultValue、setValue 和 select 统一拒绝非数组、混合类型、空路径或非字符串段，不再隐式展开字符串或容忍非法路径；保留正式单路径数组简写，零选中使用 []，不使用 [[]]。路径无需预先存在于异步 collection 中。

- 6c20a6d: **取色器改为组合颜色家族的新组件：色相与透明度两条滑块是内嵌的 `color-slider`，预设色板是内嵌的 `color-swatch-picker`，触发钮里的色块走 Swatch 色块面家族。**

  此前取色器自己手写了两条通道滑杆（`channel-slider` / `channel-slider-track` / `channel-slider-thumb`）与一组色板按钮（`swatch-group` / `swatch-item`），键盘、拖动、渐变、读屏文案各是一份；家族里有了同样的独立组件之后，这些就是重复建设。现在取色器只留三个挂载点，里面跑的是那三件组件自己的机器与连接层，DOM 带各自的 `data-scope`，皮肤也各归各。

  破坏面逐条：

  - **五个部件撤掉，三个挂载点接上。** `channel-slider` / `channel-slider-track` / `channel-slider-thumb` / `swatch-group` / `swatch-item` 不再存在；新增 `hue-slider` / `alpha-slider` / `swatch-picker`，它们同时充当内嵌组件的根节点（内嵌组件自己的 `root` 部件不出现），挂载点之下写的是 `color-slider` 的 `control` / `track` / `thumb` / `label` / `value-text` / `hidden-input` 与 `color-swatch-picker` 的 `item` / `swatch` / `indicator` / `hidden-input`。Vue 的 `XhColorPickerChannelSlider*` / `XhColorPickerSwatchGroup` / `XhColorPickerSwatchItem` 换成 `XhColorPickerHueSlider` / `XhColorPickerAlphaSlider` / `XhColorPickerSwatchPicker`（不写子节点即自动铺开；要自己排就往里放 `XhColorSlider*` / `XhColorSwatchPickerItem`），React 同名；自定义元素照挂载点名写 `data-xh-part`。
  - **`ColorPickerServices` 变形。** `hueSlider` / `alphaSlider` 从一台 `slider` 服务换成 `ColorSliderServices`（`{ root, slider }`），新增 `swatchPicker`；props 由 `colorPickerHueSliderProps` / `colorPickerAlphaSliderProps` / `colorPickerSwatchPickerProps(rootService)` 现算，`colorPickerChannelSliderProps` 撤掉。
  - **API 与事件收窄。** `api.channelState` / `isSwatchSelected` / `getChannelSlider*Props` / `getSwatchGroupProps` / `getSwatchItemProps` 撤掉，换成 `api.hueSlider` / `alphaSlider` / `swatchPicker`（各是内嵌组件的完整 api）与 `getHueSliderProps` / `getAlphaSliderProps` / `getSwatchPickerProps`；机器事件 `CHANNEL.SET` / `CHANNEL.STEP` / `CHANNEL.TO_EDGE` 换成滑块送回的 `HSVA.SET`；键盘表撤掉四行 `color-picker.kbd.channel-*`（归 `color-slider` 那张表）。
  - **色板从一排按钮变成单选组。** 挂载点是 `role="radiogroup"`，每格 `role="radio"` 且 `aria-checked`（此前是 `aria-pressed` 的按钮）；整组只占一个 Tab 位，方向键在格子间走并选中，禁用用 `aria-disabled` 表达；当前颜色的那一格按颜色比选中。
  - **皮肤槽位变化。** `--xh-color-picker-thumb-size` 只剩取色面那一颗拇指用；`--xh-color-picker-track-thickness` / `--xh-color-picker-track-radius` / `--xh-color-picker-checker` / `--xh-color-picker-swatch-item-size` / `--xh-color-picker-swatch-ring` / `--xh-color-picker-swatch-border-hover` 撤掉，两条滑块与色板各读自己那份皮的槽（`--xh-color-slider-*` / `--xh-color-swatch-picker-*`）；挂载点同时充当内嵌根节点，根上那几把尺由取色器自己的槽给：两条滑块是 `--xh-color-picker-slider-thumb-size` / `--xh-color-picker-slider-track-thickness` / `--xh-color-picker-hue-slider-gap` / `--xh-color-picker-alpha-slider-gap`，色板是 `--xh-color-picker-swatch-cell` / `--xh-color-picker-swatch-gap` / `--xh-color-picker-swatch-picker-gap` / `--xh-color-picker-swatch-icon-size`（浮层里的色板缺省用小号格）。触发钮里的色块改由 Swatch 家族画：半透明色铺在棋盘格上，`--xh-color-picker-swatch-size` 缺省跟着色块面的尺寸档走。

  顺带补上的：`color-slider` 新增受控 `hsva` prop（几条并排的滑块共用同一份工作色，推色相时灰度处的色相与透明度都不丢），`onValueChange` / `onValueChangeEnd` 的载荷带上 `hsva`；串没变但工作色变了（灰度处推色相）也会通知一次。

- b908e0e: 建立 ColorPicker 显式错误合同：非法或越界文本不再静默复原、裁切，格式、输入、颜色解析与屏幕取色异常分别保留状态并发出 `color-error`，同时隔离旧输入与迟到取色结果。
- 3db8c7d: 命令式对话框服务用独立 actionError 与 onActionError({ cause }) 暴露同步/异步动作异常，提供可本地化的 actionErrorText 实时提示；false 只表示业务阻止关闭。重试、取消、卸载和请求切换隔离过期动作与通知。

  宿主初始化/挂载或正文渲染失败现明确 reject 原始原因，不再仅记录日志、解析成 false 或留下悬空 Promise；通知处理器失败拒绝所属请求。调用方必须处理服务 Promise 拒绝，并提供当前文档中已连接的 target。固定退场窗口将在独立任务中移除。

- 8e35021: **空状态的 `status` 只收 `'404' | '403' | '500'` 三个状态码；成功 / 警示 / 出错 / 提示改走 `tone`。**

  `status` 原来把结果页的状态码与通用结果的语气混在一根轴上：`'error'` 与 `tone="danger"` 说的是同一件事、写法却有两套，也与全库的语气轴对不上。现在 `status` 只表达结果页的状态码，皮肤仍把它们并进最接近的一族语气色；`'success' | 'warning' | 'error' | 'info'` 四档撤掉，改写 `tone="success" | "warning" | "danger" | "info"`，两者都写时以 `tone` 为准。三端同步：`EmptyStateStatus` 收窄，自定义元素的 `status` attribute 取值同步；皮肤撤掉四条按通用结果换色的规则；「结果类型」示例改成语气示例。

- 504d7e1: FieldControl 默认组合模式统一使用严格宿主检查：Fragment 内的唯一控件正常接线，零/多个节点及非空文本混排明确失败。需要作者自行绑定多个节点时必须显式设置 asChild=false，不再将无效结构默认为手工接线。
- 2e9ee9d: Form/Field 的四条状态轴现在会真正进入 TextField 控件机器，而不只停在包装节点的 data/ARIA 属性。

  `disabled`、`readOnly`、`required`、`invalid` 的统一优先级为「实例 > 最近 Field > Form > false」：
  控件未声明时从 FormFieldGroup 继承，Field 包装时继续把结果下传到实际可聚焦的 input。显式
  `false` 是正式的实例覆盖，不再会因为外层 Form 为 disabled 或有规则/错误而被重写。

  Web Components 的 `<xh-field>` 同步支持 `read-only`，并将 Form/Field 状态交给嵌套的
  `<xh-text-field>` 机器；直接放进 `<xh-form>` 字段组的 `<xh-text-field>` 也使用同一优先级。
  此前依赖「Form disabled 仍能编辑内置 TextField」或「显式 false 被外层状态强制改写」的写法需要调整。

- c60f032: Form 字段身份统一为 `FormPath`。`XhFormFieldGroup` 与 `XhFormErrorSummaryItem`
  的 `value` 改为必填 `name`；字符串始终是单个字段（`user.email` 不再被解释为
  层级），嵌套字段必须显式传数组路径。

  Headless 新增 `formPathKey`、`formPathDisplay`、`getFormPathValue`、
  `setFormPathValue` 与 `createFormPathRecord`。数组路径的 values、rules、errors、
  校验任务、DOM id、摘要和落焦均走同一条路径身份，绝不依赖数组隐式转成逗号字符串。
  Web Components 的字符串字段写 `name`；数组路径必须写严格 JSON `data-path`，
  运行期改写会自动重新接线。FieldArray 现在会在 Form 内自动接入路径真源；新增、删除、换序会同时迁移其子字段的 values、rules、errors、进行中的 validation 与已验证错误标记，行字段名改为显式数组 FormPath，绝不拼接或解析字符串下标。

- ab984e8: ToggleGroup 默认外观改为浅色胶囊分段控件，选中项使用品牌淡底；`solid` 继续提供强品牌选中态。组内按压不再缩放，分隔线改为覆盖接缝的半高细线。

  ButtonGroup 与 ToggleGroup 的 `outline` 改由组根绘制一条连续外框，子项不再各自绘制贯穿全高的边框；组内仍使用半高分隔线。

  移除 `--xh-toggle-group-separator-inset` 与 `--xh-toggle-group-separator-gap`，新增 separator size、opacity 与 disabled opacity 覆盖槽。

  ButtonGroup 与 ToggleGroup 默认自动生成相邻项分隔线，并新增 `separators` 属性控制显示。移除 `XhButtonGroupSeparator`、`XhToggleGroupSeparator` 及对应 Headless separator 部件与 connect API；分隔线改为适配器内部结构，不再要求作者手工维护。

  Button、ButtonGroup、Toggle 与 ToggleGroup 皮肤增加浅色/深色交互状态、连续外框和自动分隔线规则；同步更新 CSS 体积基线。

  视觉环境控制器迁入 Core，适配器不再硬依赖 Tokens；`@xihan-ui/tokens/runtime` 保持原导出入口。

- 5f18462: KbdGroup 改为多枚键名共享同一枚 24px 键帽表面，并新增 `default` 与 `light` 两种外观。

  移除分隔符部件与可见加号，同时删除 `size`、`pressed`、`disabled` 属性；整组可访问名称继续保留完整的组合键读法。

- 78ccfcb: 将快捷键展示与行为直接拆成唯一职责边界，不保留旧展示分支。

  新增无状态 `Kbd` / `KbdGroup` family：Vue 与 React 分别公开 `XhKbd`、`XhKbdGroup`，
  Web Components 新增 `<xh-kbd>`、`<xh-kbd-group>`。单枚键帽使用原生 `<kbd>`；组合由
  Headless 统一完成平台格式化、连接符、修饰键身份与整组可读名称，视觉键帽和连接符从无障碍树隐藏，
  整组只朗读一次。`value` / `keys` 必填，空声明和空读屏翻译直接报错。

  `Hotkeys`、`XhHotkeys`、`<xh-hotkeys>` 与 `useHotkeys` 现在只负责注册和匹配，不再生成 DOM。
  删除 `HotkeysApi.segments`、`separator`、`segmentOf`、三个视觉 getter、`HotkeysKeyProps`、
  `HotkeysTranslations` 以及 Hotkeys 的 `size` / `translations` props。`keys` 改为必填；空组合或
  包含多枚主键的组合直接报错。删除 `target='parent'`，局部范围改为返回真实 EventTarget 的显式 resolver；
  SSR 不读取 ambient document，卸载仍精确解绑监听。

  删除 `@xihan-ui/styles/hotkeys.css` 与全部 `--xh-hotkeys-*` 槽，新增 `kbd.css` / `kbd-group.css`。
  键帽使用 20 / 24 / 28px 三档中性实体面、等宽字与内嵌底缘压感；只有显式 `pressed`
  事实或真实可交互 owner 的 `:active` 才轻压。禁用、compact、RTL、forced-colors 与 200% 缩放
  均由新 family 独立承担。

  Command、Menu、ContextMenu 与快捷键文档示例已迁移为显式组合 Hotkeys + KbdGroup，
  没有 `XhHotkeys` 视觉别名或双轨兼容层。

- 66d7ad5: Kbd 收敛为固定 24px 的纯展示键帽，新增 `default` 与 `light` 两种外观。

  移除 `size`、`pressed`、`disabled` 属性以及按钮式压感、单独禁用状态和密度分支；组合与禁用语义继续由 KbdGroup 负责。

- 16f8296: **Kbd 统一为“键盘按键”。** 单键和组合键改用同一个 `keys` 数组输入；默认只展示，显式开启 `register` 后才安装快捷键监听，并继续支持 `target`、`enabled`、`preventDefault` 与 `hot-key`。

  移除重叠的 Hotkeys、KbdGroup、`useHotkeys`、`<xh-hotkeys>`、`<xh-kbd-group>` 和 `kbd-group.css`。对应展示与监听能力均并入 Kbd，不提供旧名称兼容层。

  组合键在同一表面内以 4px 间隙分隔，新增逐键部件、注册状态与禁用色，使 `kbd.css` 的压缩体积由 1185 字节增至 1654 字节；退役的 `kbd-group.css` 同步从体积基线移除。

- 0edf9bd: **加载条撤掉 `color` prop：进度段的颜色只走语气 `tone` 或皮肤槽 `--xh-loading-bar-range`。**

  `color` 是一个绕过令牌系统的内联颜色出口：给了之后暗色主题、增强对比与高对比模式都管不到它，与库里「不写颜色散值」的约定相悖，也与 `tone` 两头表达同一件事。现在进度段的内联样式只剩宽度那条轴；要换颜色，六种语气不够就在任意子树上重声明 `--xh-loading-bar-range`。三端同步：Vue / React 的 `color` prop、自定义元素的 `color` attribute、三个加载条服务的 `color` 选项一并撤掉。

- db52f9b: **`matrix-code` 新增 `data-matrix` 码制与 `gs1` 模式；根上的 `data-modules` 与 api 的 `count` 改为列、行两个数。**

  `format="data-matrix"` 画 Data Matrix ECC 200（ISO/IEC 16022，含 2024 版并入的矩形扩展 DMRE 共 48 档尺寸）：编码器自写，ASCII 模式（数字两两压缩、Latin-1 以外的字符按 UTF-8 并声明 ECI 26），多块交错的 52×52 以上与 144×144 的 8+2 分块都按规范处理；`rectangular` 从矩形尺寸里挑，窄条标签放得下。Data Matrix 没有码眼，只铺模块那一条 `<path>`，L 形定位图形随 `moduleShape` 一起换——点刻打标出来的 Data Matrix 就是一排点。缺省静区按码制的规范值（qr 4、data-matrix 1）。里德-所罗门抽成共享的 `createReedSolomon(primitive, firstRoot)`，QR 与 Data Matrix 各自建域。

  `gs1` 三端同名（自定义元素 attribute `gs1`）：QR 在字节模式段前放 FNC1 首位指示符、Data Matrix 最前面放 FNC1 码字，即 GS1 QR / GS1 DataMatrix；变长 AI 之间用内容里的 GS（U+001D）分隔。`qrEncode` 与 `qrCapacityBytes` 各多一个可选参数。

  破坏性：一张码不再恒是正方形，`MatrixCodeApi.count` 拆成 `columns` 与 `rows`，根上的 `data-modules` 改为 `data-columns` 与 `data-rows`；`pixelSize` 现在是宽度，高按含静区的模块比例算出（正方形码不变）。`data-level` 与 `data-version` 只在 qr 下写。对当前码制没有意义的选项（`level` / `eyeShape` / `logo` 给了 data-matrix、`rectangular` 给了 qr）往诊断通道报一条新的 `matrix-code.option-ignored` 警告，按没给处理，码照画。

- 0daae33: **`mention` 的输入框从可变多行改成单行输入框，与其它输入控件一致。**

  原先 `getInputProps` 走 `normalize.textarea`，三家适配器各自渲一个 `<textarea>`，皮肤给它 `min-block-size` 与 `resize: vertical`——框高按行数撑、还能拖着往下拉。现在它是一个 `<input type="text">`：框高定在控件档（`--xh-mention-input-h` 回退 `--xh-control-h-*`），纵向内距归零，与 `text-field` 的单行档并排时等高。

  破坏面逐条：

  - **渲出来的元素换了。** Vue 的 `XhMentionInput`、React 的 `XhMentionInput` 都渲 `<input>`；Web Components 侧作者自己摆的那个 `input` 角色节点必须从 `<textarea>` 改成 `<input>`。按 `HTMLTextAreaElement` 取件、或用 `rows` / `resize` 之类只有多行才有的属性去接的代码要改。
  - **`as` 入口整个撤掉。** `getInputProps` 不再收参数；`MentionInputHost` 与 `MentionInputProps` 两个类型不再导出；Vue 与 React 的 `XhMentionInput` 不再有 `as` prop；`MentionInputEl` 从 `HTMLTextAreaElement | HTMLInputElement` 收窄成 `HTMLInputElement`。
  - **无障碍属性从「多行那一档」翻到「单行那一档」。** 之前多行宿主上 `role` / `aria-expanded` / `type` 三条一并缺席（`textarea` 的允许角色只有 textbox，而 `aria-expanded` 不在 textbox 的支持属性里）；现在恒发 `role="combobox"`、`type="text"` 与 `aria-expanded="true" | "false"`。断言过这三条为空的用例要改。
  - **回车那一行的说法变了。** 有高亮可提交时照旧吞掉按键；一条候选都提交不了时仍然不吞——只是单行输入框里这一发不再是换行，而是留给表单做隐式提交。键盘表里 `mention.kbd.newline` 随之更名为 `mention.kbd.enter-pass`。
  - **使用者覆盖槽 `--xh-mention-input-py` 撤销**（连同它背后的私有槽 `--xh-_mention-py`）。这两个槽只喂输入框那条 `padding-block`，纵向内距归零之后没有使用者，改它已经不起作用。框高仍走 `--xh-mention-input-h`，尺寸档照旧由 `data-size` 换。

  **需要在多行正文里 @ 人的，本库现在没有替代品。** `prompt-input` 是 AI 场景的提示输入框，形态、键位与提交语义都不是一回事，不能当多行提及用；`text-field` 的多行档没有提及能力。这条能力就是被去掉了，不是搬去了别处。

  浮层落位不受影响：定位引擎的锚点一直是输入框本身（`refs.getInputEl`），从来不按插入符算——换掉宿主标签之后，候选面板照旧贴着整个框的下缘、左缘与框对齐。输入法组合期的行为也没动：组合中的按键一律不接，那一发归输入法候选框。

- f12bee3: 将 Menu、ContextMenu 与 Menubar 的多级子菜单所有权下沉到 headless：直属子节点登记、
  递归 Portal 悬停区域、叶到根关闭顺序与唯一根选择通知现在由 `createMenuTreeNode` 统一维护，
  三端适配器只连接宿主上下文、DOM getter、Portal 和生命周期。

  React 与 Vue 删除仅供旧适配器内部收链使用、但曾被误导出的 `MenuChain`、
  `ContextMenuChain`、`MenubarChain` 及对应 Provider / provide / use API。组合部件无需作者接入这些接口。

- 14b9dcd: 组合框与树选择删除逗号拼接表单协议，每个选中值生成一个同名原生隐藏字段；零选中不提交空字符串，含逗号的值保持原样。读取多值请使用 FormData.getAll(name)。

  无头 getHiddenInputProps 现要求显式传入 { value }，调用方按 api.value 逐个生成 input，不保留旧无参调用。Vue/React HiddenInput 自动铺开；Web Components 保留一个作者声明节点并管理额外字段。两组件根新增 form 属性，显式关联表单的提交与 reset 使用同一所有者。

- e3abd75: **通知队列的 `max` 缺省从不限改成 5，与轻提示服务同一个数。**

  此前 `notification` 不给 `max` 就没有上限：连发多少条，队列里就留多少条、DOM 里就挂多少张卡片。那一摞是一整面固定定位的 flex 列，既不滚动也不折叠，第六张往后直接堆出视口，看不见也关不掉，只能等它们自己到点走。轻提示服务那边一直是「不写 `max` 缺省留 5 条」，同一台队列机器两个出口两种口径。

  现在缺省上限住在 headless 机器里，新增导出常量 `NOTIFICATION_MAX = 5`，`visibleNotifications()` 与 `ITEMS.CREATE` 在 `max` 为 `undefined` 时都取它。三条路一并跟着变：声明式的 `XhNotificationRoot` / `<xh-notification>`、三个适配器的 `createNotificationService()`，谁不写 `max` 谁就是每个位置留 5 条。挤条规则不变：先挤低优先级、同级里挤最旧的，非受控队列被挤掉的那条直接从队列删掉、不排队等位；受控队列只是不显示窗口外的，宿主那份 `items` 原样。

  **破坏面**：依赖「不写 `max` 就全部显示」的调用方，第六条起会被挤掉。要回到不限，显式写 `max: Infinity`（HTML 属性写 `max="Infinity"`）。`max <= 0` 与 `NaN` 仍按不限处理，这一段没动。

  `createToastService()` 的入参、行为与 DOM 全部照旧——它本来就显式传 5；三个适配器的轻提示服务现在改读 `NOTIFICATION_MAX`，同一个数只写在机器一处。

- db84441: 数字字段统一使用 `control` 作为必需的唯一输入壳，不再支持输入与加减按钮脱离 `control` 的三件并排结构。迁移时将 `input` 与可选的两颗动作按钮放进 `control`。

  随旧结构删除的输入框盒与独立动作样式槽不再生效：`--xh-number-field-input-bg*`、`--xh-number-field-input-border*`、`--xh-number-field-input-h`、`--xh-number-field-input-radius`、`--xh-number-field-input-shadow`、`--xh-number-field-trigger-bg*`、`--xh-number-field-trigger-border*` 与 `--xh-number-field-trigger-radius`。

  `subtle` 变体改用无投影的扁平填充面；加减动作与输入之间的分割线缩短为半高并垂直居中。

- 6b4c5d0: **分页的每页条数控制器换成库里的下拉，省略位补上字形。**

  **`pagination` 的 `page-size-select` 此前是一个抹掉了系统外观的原生 `<select>`**，与库里其它下拉两个长相：文档站上它顶着系统的下拉箭头、展开出来的是操作系统那份列表，旁边的 `select` / `combobox` / `cascader` 却都是自己的浮层。现在它就是 `select`：分页内嵌一台 select 机器（档位与当前档受控于分页机，换档经回调送回来），`page-size-select` 降为挂载点，里头的角色节点带的是 `data-scope="select"`，吃 select 那份皮肤，浮层、键盘、连打检索与三视觉轴一并跟着它走。

  - 档位仍来自 `pageSizeOptions`，每一档的文字改由 `translations.pageSizeOption` 给（此前这条文案在库里声明着却没人用，档位文字只能靠作者自己渲染 `<option>`）。
  - 控件的可及名仍是 `translations.pageSizeSelect`：下拉自己把名字指向「标签 + 当前值」两个节点，而分页行里不摆可见标签，只剩当前值那一段会被念成控件名，所以 `trigger` 与 `list` 两处的名字链在这里换成直给的 `aria-label`。
  - 清空（下拉在收起态收的 Delete / Backspace）不改档位：分页没有「不分页」这一档，落空即不发事件。

  **破坏性变更：**

  - `connectPagination(service, normalize)` 改收两台机器：`connectPagination({ root, pageSizeSelect }, normalize)`。新增导出 `paginationPageSizeSelectProps`（喂给内嵌下拉的那份 props）、`paginationLabels`、`pageSizeOptionsOf` 与类型 `PaginationServices`。
  - `api.getPageSizeSelectProps()` 从 `T['select']` 变成 `T['element']`，只剩挂载点该有的那几个属性；控件本体走新增的 `api.pageSizeSelect`（整份 `SelectApi`）。
  - Vue 的 `XhPaginationPageSizeSelect` 与 React 的同名组件不再收渲染 `<option>` 的插槽（React 侧的 `PaginationPageSizeSelectSlotProps` 一并去掉），它们自己铺完下拉的角色节点；React 侧新增 `container` prop，与 `XhPaginationPositioner` 同义。
  - Web Components 侧作者写的 `<select data-xh-part="page-size-select">` 改成一个空 `<div data-xh-part="page-size-select">`，里头那套角色节点由元素自己建（与自绘滚动条同一条路，自建节点不打 `data-xh-part`）。
  - 皮肤里 `--xh-pagination-page-size-bg` / `-bg-hover` / `-border` / `-border-hover` 四个覆盖槽随原生下拉一并去掉，改用 select 自己那批槽。

  **省略位不写内容时此前是一格空白**：库里没有省略号字形令牌，`ellipsis-trigger` 空着就只剩一个看不出能点的空位。新增 `--xh-glyph-mark-ellipsis`，皮肤按兜底字形那套 `:empty::before` 的 mask 块画三点；作者往部件里塞了自己的图形或文字照旧让位。

- 5bd9ec2: **密码框的明暗态改名：`visible` / `defaultVisible` / `onVisibilityChange` → `revealed` / `defaultRevealed` / `onRevealedChange`。**

  `visible` 在库里是浮层与派生显隐那一轴的词（toast、滚动条、回到顶部），密码框这一位说的却是「明文有没有揭开」——不是开合、也不是显隐，与它们混用会让作者把它当成浮层的 open 去接。现在按这一位真正的含义取名：headless 的 props / context / api（`api.revealed` / `setRevealed` / `toggleRevealed`）与机器事件（`REVEALED.SET` / `REVEALED.TOGGLE`）、Vue 的 `v-model:revealed` 与 `@revealed-change`、React 的 `revealed` / `onRevealedChange`、自定义元素的 `revealed` / `default-revealed` attribute 与 `revealed-change` 事件；载荷类型 `PasswordInputRevealedChangeDetails { revealed }`。部件名 `visibility-trigger`、文案 `visibilityTriggerShow` / `visibilityTriggerHide` 与触发钮上的 `data-state="visible|hidden"`（词表里的派生显隐）不变。

- 680e9a2: 重构 Calendar 与 DatePicker 的周期选择契约。

  - `view` 更名为 `granularity`，支持 `day / week / month / quarter / year`。
  - 删除 `weekSelection`；周成为一级粒度，可独立搭配 single、multiple 或 range。
  - 日期格与粗粒度格统一为 `CalendarPeriod`，包含 `key / start / end / label / outside`。
  - `CalendarDay.value` 改为 `start`，`inMonth` 改为 `outside`；面板与根插槽新增统一的 `periods`。
  - 新增 `calendarPeriodValue`，把单选或区间锚点转换成 `{ granularity, start, end, keys }`。
  - 切换粒度会清空旧选择；切换选择模式会按新模式收口现值。
  - 周面板改为一列一个整周周期格；区间选择仍默认单栏，多面板只由 `visibleCount` 显式开启。
  - 周字段与周面板统一使用 ISO 周历，固定周一到周日，不再随 `locale` 改变周边界。
  - `showTime` 明确只在 `granularity=day + selectionMode=single` 下生效。

  迁移：把 `view="day" + weekSelection` 改为 `granularity="week"`；其他 `view` 用法直接改名为 `granularity`。渲染日期矩阵时使用 `day.start` 作为格子值，以 `day.outside` 判断相邻月份。

- b81590f: **分格输入改成按顺序录入：焦点落在第一个空格上。** 从前每一格都是随手可点、随手可聚焦的原生输入框，前两格还空着也能一头扎到第三格上打字，打完得到一串中间带洞的值；机器那边只把「作者点了第几格」原样记进 `focusedIndex`，没有任何「该落在哪一格」的裁定。现在作者点/聚焦第 i 格时，若存在 j < i 且第 j 格为空，焦点落到第 j 格——一次性验证码这类控件的通行做法。

  **裁定在机器里，连接层只负责搬。** 新增两个纯函数：`firstEmptyPinIndex(value)` 报第一个空格（填满得 -1），`pinFocusTarget(value, index)` 给出该落焦的那一格——还有空格时取 `min(index, 第一个空格)`，填满后原样返回，下标一并夹回格子范围。`INPUT.FOCUS` 记的从此是裁定后的落点。这个函数是幂等的（结果再裁一次仍是它自己），所以连接层照着搬一次就停，不会两格之间来回弹；用例里数过焦点事件的发数，一共两发。

  **还轮不到的格子退出 Tab 序列。** 只把焦点拨回来是不够的：那些格子若仍留在 Tab 序列里，Tab 一停上去就被拨回第一个空格，键盘与读屏用户按多少下都走不出这一组——反向验证里把这条摘掉，Tab 当场卡在 `input[0]` 上出不去。所以第一个空格之后的格子发 `tabindex="-1"`。可落焦的那一段（首格到第一个空格）与填满之后的每一格都不带 `tabindex`，原生 Tab 序列照旧。

  **四条边界的裁决：**

  - **粘贴整串仍从落点那一格起铺开**，这条没变，变的只是落点本身越不过第一个空格。真实交互下作者根本站不到「前面还空着」的格子上，所以从落点铺开与按顺序录入不冲突；铺完之后焦点同样按裁定走，铺出空洞时回到那个洞上。
  - **退格与删除**照旧：`Backspace` 清本格、焦点不动，本格为空则退回上一格并清掉它；`Delete` 清本格、焦点不动。被清空的那一格随即成为第一个空格，焦点就停在它上面——不抢焦点，也不会把用户推到别处。
  - **方向键仍能在已填区间里左右移动**，「改上一格」这条路没堵：左键照走，右键与 `End` 越不过第一个空格。填满之后左右键与 `Home` / `End` 恢复整段自由。
  - **全部填满之后点任意一格就落在那一格**，改哪一位都行；此时没有空格，裁定不介入。

  **`readOnly` 与 `disabled` 不设这道限。** 那两档值本来就改不动，把焦点往回拽只会挡住读与复制，所以点哪一格就落哪一格，`tabindex` 也一律不摘。

  **破坏性变更，会失配的地方：**

  - 断言「点第 i 格焦点就在第 i 格」的用例，值没填满时一律改判。库内三条既有判据按此更新：`data-focus` 那条改用填满的值起手，「一次塞进多个字符」与「粘贴从当前格起铺」两条先把前面的格子填上——它们原本的起手式（前面空着却站在后面）在新规矩下走不到。
  - 方向键判据：没填值的一组里，`ArrowRight` 与 `End` 不再走得到末格。共用套件里那两条改成从填满的值起手，另立一条专管「越不过第一个空格」。
  - 依赖「每一格都是 Tab 停靠点」的脚本会少走几站。
  - `End` 的语义从「移到末格」改成「移到最后一格可落焦的格子」，键盘表照此重写。

  `PinInputApi` 没有增删条目，`focusedIndex` 的含义从「焦点在哪一格」变成「焦点该落在哪一格」（值仍是同一个数，只是它现在经过裁定）。

- b991bb5: **Portal 按实例桥接逻辑来源的局部视觉环境，局部主题不再在搬到共享落点后丢失。**

  Core 新增 `createPortalVisualBridge`、`PortalVisualBridge` 与 `PortalVisualBridgeOptions`。桥只复制仓库当前真实存在的六个 DOM 环境轴：`data-theme`、`data-brand`、`data-density`、`data-contrast`、`data-motion` 与 `dir`。每一轴独立读取来源 composed 祖先链中最近的显式声明；来源未声明时，实例壳不写该属性，继续继承业务显式 portalContainer 的环境。

  桥不会复制计算后的 CSS 自定义属性，也不会凭规格文字虚构 `data-transparency`。当前 transparency 只有系统媒体查询，没有 DOM 控制轴；`shape` 是组件自身形态轴，不属于主题环境。后续只有在 VisualEnvironmentController 真正建立对应 DOM 合同时才会扩充名单。

  Vue 与 React 的每个 Portal 增加独占的 `display: contents` 壳；共享 `xh-portal-root` 不写任何主题属性，因此同页多个局部 dark/light、compact/comfortable 或 contrast 档不会互相覆盖。祖先属性改值、删除、来源换父、ShadowRoot 与 slot 重新分配均会异步同步；观察器取自来源 Document 的 Window，跨 Document 来源与壳直接失败。

  已有触发器或控件 ref 的锚定浮层直接以该节点作为 source，不生成来源 marker，避免改变 ButtonGroup 的 `:first-child` / `:last-child`、`root > *` 与 Toolbar 的直接子项。没有现成来源节点的模态/浮动组合使用无布局的 `template[data-xh-portal-source]`。React 的 `XhPortalProps` 新增可选 `source`；Vue 的桥组件保持内部实现，不新增公开组件家族。Web Components 声明式浮层仍在 Light DOM 原位，继续通过真实祖先链自然继承，不为了这一缺陷引入节点搬运。

  **破坏面：** Vue 与 React 的 portalContainer 直接子节点现在是 `div[data-xh-portal-shell]`，实际浮层位于壳内；React SSR 的原位输出也带 source/shell。按 `#xh-portal-root > [data-scope]` 或假定浮层部件直接父节点就是业务容器的样式和测试，应改为通过公开部件属性匹配后代；`data-xh-portal-shell` 仍是库内部标记。壳不产生布局盒，不改变定位包含块与层叠上下文。

- 80e6fdf: **`qr-code` 改名 `matrix-code`，新增 `format` 选码制：二维码不再只有 QR 一种身份。**

  QR Code 之外还有 Data Matrix、PDF417、Aztec 这些同样常用的二维码制，它们与 QR 共用一张码面、一套命名、一块 logo 位与同一份皮肤，只是编码器不同。把组件名钉在 `qr-code` 上就没有地方放它们，于是整个公开面改名：Headless 的 `connectQrCode` / `qrCodeAnatomy` / `qrCodeKeyboard` / `qrCodeMeta` 与 `QrCode*` 类型改为 `connectMatrixCode` / `matrixCodeAnatomy` / `matrixCodeKeyboard` / `matrixCodeMeta` 与 `MatrixCode*`（`QrModuleShape` / `QrEyeShape` 改为 `MatrixCodeModuleShape` / `MatrixCodeEyeShape`）；Vue 与 React 的 `XhQrCode` / `XhQrCodeLogo` 改为 `XhMatrixCode` / `XhMatrixCodeLogo`，上下文与 provide / use 同步；自定义元素 `<xh-qr-code>` 改为 `<xh-matrix-code>`；皮肤子路径 `qr-code.css` 改为 `matrix-code.css`，覆盖槽 `--xh-qr-code-*` 改为 `--xh-matrix-code-*`；`data-scope` 改为 `matrix-code`；诊断码 `qr-code.logo-damage` 改为 `matrix-code.logo-damage`（`DIAGNOSTIC_CODES.qrCodeLogoDamage` → `matrixCodeLogoDamage`）。QR 编码器本身的导出（`qrEncode` / `qrCapacityBytes` / `qrAlignmentPositions` / `QR_MAX_VERSION` / `QrLevel` / `QrMatrix`）不改名，它们描述的就是 QR。

  新增 `format` prop（三端同名，自定义元素 attribute `format`），缺省 `qr`，根上落 `data-format`。给了不认识的值不静默退回 QR：一个模块都不铺，根落到 `error` 态并在 `error` 里说明只认哪些码制——按错码制画出来的码扫得出内容但对不上，作者却看不出哪里错了。当前只有 `qr` 一种取值，其余码制随后各自补上。

- 9c43f67: 重构 Calendar 与 DatePicker 的区间选择模型：起点只记在组件里，两端都落定才写值。

  - **破坏**：区间模式下点第一下不再把 `[起点]` 写进 `value`，`onValueChange` 只在两端齐全时通知（长度恒为 2）；`Escape` 撤掉起点后原来的区间原样还在。原来靠长度为 1 的中间态渲染「起点 → 待定」的用法，改读 `api.rangeAnchor`。
  - 区间支持按住拖选：按下即落起点、拖到另一格松开即收尾；按住已选区间的一端拖动可直接改写那一端，原地松开则从那一端重新开始；触屏按住片刻才开始拖，轻点仍是普通点选。指针在日历（日期选择器则是浮层与输入行）之外松开时，区间就地收在起点到最后悬停的那一格；`Tab` 离开网格同样收口。
  - 确认键落起点后焦点自动前进一格（挑不了就退一格），方向键走到哪儿预览就铺到哪儿。
  - 新增 `allowsNonContiguousRanges`：默认关，落了起点之后可挑范围被夹在两侧最近的不可用日之间；开着时允许跨过，只是那些日子不铺轨道。`isDateUnavailable` 多了第二个参数——当前起点，可据此限制区间长度。
  - 新增 `invalid`（Calendar）：根带 `data-invalid`，已选区间里的格子报 `aria-invalid`；已选区间某一端越界或不可用时也会自己判。DatePicker 的 `invalid` 现在还会在区间终点早于起点时自己置真，`api.invalid` 与根节点同一口径。
  - 区间里两端之间的每一格都报 `aria-selected="true"` 并带 `data-selected`；新增 `CalendarTranslations`（挑区间的两句提示、区间两端的名字、今天），DatePicker 的 `translations` 原样转交。
  - 皮肤：挑到一半的预览与已落定的区间同一副长相（去掉更淡的预览轨道与淡面端点）；实心面按下再压深一档；轨道在行首行尾的圆角与控件同档；日期格一律中等字重；命中区铺满整格；拖动中网格保持手型。区间输入行里起点那组只占自己的宽度，分隔符紧跟在起点后面。

  覆盖槽变动：新增 `--xh-calendar-cell-bg-selected-active`、`--xh-calendar-cell-font-weight`、`--xh-date-picker-range-separator-mx`；删除 `--xh-calendar-range-preview-bg`、`--xh-calendar-range-preview-cap-bg`、`--xh-calendar-range-preview-cap-fg`。

- 3ef5a6e: **`select` 标签里的删除钮退役成 `tag` 的 `close-trigger`：`item-delete-trigger` 不再是本组件的部件，渲出来的节点是 `tag` 的关闭钮（`data-scope="tag" data-part="close-trigger"`），样子归 `tag.css`。**

  上一笔把 `select` 的标签与 `+N` 套成了 `tag` 的 `root`，删除钮却还是 `select` 自己画的一颗——`tag` 本来就有关闭钮，第二份就是另起一套。现在：

  - **连接层**：触发器外的每一枚标签在 `connectSelect` 里各是一份 `connectStaticTag`（受控 `open: true`、`closable: true`、`disabled` 与 `readOnly` 随控件、`translations.close` 取 `translations.deleteItem(标签文字)`；形态由 `tag` 导出的 `tagVariantForControl` 按控件的面派）。删除钮就是这份实例的 `getCloseTriggerProps()`：按它时 `tag` 只发 `onOpenChange({ open: false })`，`select` 在那里送 `VALUE.SET` 把这个值摘掉。`api.getTagProps({ value })` 与 `api.getItemDeleteTriggerProps({ value })` 共用同一份实例，`root` 的产出不看 `closable`，触发器里的标签照旧不渲钮。
  - **禁用 / 只读矩阵由 `tag` 给**：禁用时钮留在原地、原生 `disabled` 并带 `data-disabled`，标签本体置灰；只读时钮同样留位、原生 `disabled`，标签本身不置灰——与 `tag-group` / `tags-input` 里的标签同一条规矩。
  - **可及名**：仍走 `select` 的 `translations.deleteItem`（缺省 `Delete <标签文字>`），只是现在经 `tag` 的 `translations.close` 落到那颗钮上。
  - **三家适配器**：Vue / React 的 `XhSelectItemDeleteTrigger` 名字与用法不变，渲出来的 `<button>` 换成 `tag` 的 `close-trigger`；Web Components 侧作者写法不变（`data-xh-part="item-delete-trigger"`，仍放在 `data-xh-part="tag"` 里），这个作者名以 `delegates` 登记为归 `tag` 的 scope 管。
  - **皮肤**：`select.css` 里 `item-delete-trigger` 的全部规则（尺寸、圆角、悬停、按压、聚焦环、禁用色、兜底字形）整段删掉；那颗钮吃 `tag.css` 的 `close-trigger` 规则——命中区 `--xh-tag-close-size`（缺省不分档的 `--xh-control-indicator-size`）、圆角 `--xh-tag-close-radius`（缺省 `--xh-shape-inset`）、悬停与按压底色从当前前景色兑、`solid` 标签里环取 `currentColor`。

  **破坏面：**

  - `select` 的解剖少一个部件（21 → 20）：`item-delete-trigger` 删除。按 `[data-scope='select'][data-part='item-delete-trigger']` 选择过的皮肤、测试与作者样式要改成 `[data-scope='tag'][data-part='close-trigger']`（要限定在 `select` 里就前缀 `[data-scope='select'][data-part='root']`）。
  - `select.css` 的六个覆盖槽随之删除：`--xh-select-item-delete-size` / `-radius` / `-fg` / `-fg-hover` / `-bg-hover` / `-bg-active`，改用 `tag` 的 `--xh-tag-close-size` / `--xh-tag-close-radius` / `--xh-tag-close-fg` / `--xh-tag-close-bg-hover` / `--xh-tag-close-bg-active`。
  - 禁用时那颗钮从「只标 `data-disabled`、仍可聚焦」变成原生 `disabled`（不可聚焦、不占 Tab 位），与 `tag` 的关闭钮同一条规矩；只读时那颗钮从「可按但不动值」变成原生 `disabled`。
  - 悬停 / 按压底色从 `--xh-bg-subtle-hover` / `-active` 换成由当前前景色兑出的 `color-mix`，与 `tag` 的关闭钮同一副长相；缺省字色从 `--xh-fg-subtle` 换成标签自己的文字色（`currentColor`）。
  - 聚焦环不再由 `select.css` 画，走 `focus.css` 的通用环加 `tag.css` 的 `solid` 上下文规则。

- e3abd75: **`select` 多选标签行封顶：不给 `maxTagCount` 时最多摆 3 枚，其余合成一枚 `+N`；标签行成为部件，`+N` 是一枚 `tag`，三家适配器都渲出来。**

  从前 `maxTagCount` 缺省是「全摆」：选中几项，`api.tags` 就给几枚，`overflowCount` 恒 0；`+N` 没有部件，作者自己拿一个 span 画。触发器是一行控件（盒高钉在 `--xh-control-h-*`，这一点没变），标签排不下就往盒外冲——实测 320px 栏里选 10 项，最后一枚标签的右缘越过盒的右缘 195px，选 30 项越过 1315px，展开箭头一并被推出盒外；600px 栏里选 30 项也越过 1035px。

  现在：

  - **`maxTagCount` 缺省 3**，导出常量 `SELECT_DEFAULT_MAX_TAG_COUNT`。选中 4 项起 `api.tags` 只给前 3 枚，其余进 `overflowCount`。要回到从前的「全摆」，显式传 `maxTagCount: Infinity`。
  - **新增部件 `tag-list`**（`api.getTagListProps()`）：触发器里收着可见标签与 `+N` 的那一行。无选中时带 `hidden`。
  - **`+N` 那一枚**（`api.getOverflowTagProps()`）：折起的标签合成的一枚 `tag`（`data-scope="tag"`，带 `data-count`）；没有折起的标签时是 `tag` 的收起态（`data-state="closed"` + `hidden`），不留空位。文字由 `api.overflowText` 给，走新增的 `translations.overflowTag(count)`，默认 `+N`。与触发器里的标签一样套的是 `tag` 组件，见同批「选择器的标签套 `tag`」那份变更集。
  - **三家适配器**：Vue 新增 `XhSelectTagList` / `XhSelectOverflowTag`，React 同名两件；`+N` 那一枚不写内容即显示 `overflowText`。Web Components 侧作者写 `<span data-xh-part="tag-list">` 与 `<span data-xh-part="overflow-tag">`（后者由元素接成 `tag` 的 root），`+N` 由元素填字（留空归元素、写了内容归作者，与 `value-text` 同一条规矩）。根插槽 / 函数式 children 的载荷多一项 `overflowText`。
  - **皮肤**：`tag-list` 是触发器里可压缩、裁溢出的一行（`flex: 0 1 auto; min-inline-size: 0; overflow: hidden`），行里的标签装不下时各自缩短带省略号，`+N` 不缩；标签与 `+N` 的样子归 `tag.css`，按 `[data-scope="tag"][data-part="root"][data-count]` 覆盖 `--xh-tag-bg` / `--xh-tag-fg` 即可把 `+N` 与选中值区分；新增覆盖槽 `--xh-select-tag-list-gap`。标签行露面时 `value-text` 让位（`display: none`），无选中时反过来——两者同时写在触发器里即可，不必再按 `tags.length` 二选一；`value-text` 留在 DOM 里，触发器的可及名仍从它取到完整的选中项文本。

  同一组量测改后：320px 栏里选 10 项、30 项，标签行、每枚标签与 `+N` 的右缘都不越过盒的右缘，展开箭头留在盒里；192px 的最小盒里三枚长标签都带省略号，`+N` 完整可见；盒高在 0 / 3 / 10 / 30 枚下都是一行控件高。

  **破坏面：**

  - 缺省下选中超过 3 项的多选，`api.tags` 少了、`overflowCount` 不再恒 0。断言过「全摆」的用例要改，或显式传 `maxTagCount: Infinity`。
  - `SelectTranslations` 多一个必填键 `overflowTag`；自己整份实现该接口的要补上。
  - `SelectApi` 多 `overflowText` / `getTagListProps` / `getOverflowTagProps` 三个成员；自己按 `SelectApi` 造对象的要补上。
  - 解剖多一个部件：`tag-list`（`+N` 与标签是 `tag` 的 root，不算 select 的部件）。按部件数断言过的用例要改。
  - 皮肤新增了 `trigger:has(tag-list:not([hidden])) value-text { display: none }` 这条让位规则：从前把标签直接摆在触发器里、又同时渲着 `value-text` 的写法不受影响（没有 `tag-list` 就不让位）；换成 `tag-list` 之后 `value-text` 会在有选中时收起。

- 1f6da9d: **`select` 触发器里的标签与 `+N` 改成套库里的 `tag`：每一枚都是 `tag` 的 `root`（`data-scope="tag"`），样子归 `tag.css`，`select.css` 不再自己画标签。**

  此前 `select` 的多选标签与 `+N` 那一枚是本组件自己的两个部件（`tag` / `overflow-tag`），`select.css` 另画了一副药丸：三档都是 18px 高、12px 字、不随 `size` 变，与库里 `tag` 组件（sm 22 / md 26 / lg 30，字 12 / 13 / 14）是两套长相；`+N` 还另配了一副压一档的配色。现在：

  - **连接层套 `tag` 的连接层**：`connectSelect` 调 `connectStaticTag`（不建机器的那条路）产出标签的 props——触发器里的标签与 `+N` 没有任何能改状态的事件，显隐由 `select` 的选中值决定，一枚一台机器纯属开销。`tone` / `size` 与 `disabled` 从 `select` 传下去，`closable` 恒为假（触发器是按钮，按钮不能套按钮）。标签的 `variant` 不照抄控件的，按控件的面派且恒有值：`outline` / `ghost` 与缺省（控件缺省即 `outline`）的面是画布色或透明，标签摆 `subtle`；`subtle` 控件的面本身就是淡底，标签摆 `outline` 才看得出是一枚标签。形态恒有值，`tone` 才有落点——`tag.css` 的语气规则都挂在形态之下，只给 `tone` 不给 `variant` 的 `select` 标签照样着色，且不写 `variant` 与写 `outline` 的标签一样。
  - **DOM 契约**：`api.getTagProps({ value })` 与 `api.getOverflowTagProps()` 产出的是 `tag` 的 `root`（`data-scope="tag" data-part="root"`），前者另带 `data-value`，后者另带 `data-count`；没有折起的标签时 `+N` 是 `tag` 的收起态（`data-state="closed"` + `hidden`）。新增 `api.getTagLabelProps()`：标签文字所在的块（`tag` 的 `label`），截断落在这一层，标签与 `+N` 共用。
  - **三家适配器**：Vue / React 的 `XhSelectTag` / `XhSelectOverflowTag` 名字不变，渲出来的节点换成 `tag` 的 `root`；插槽 / children 只有文字时替它包一层新增的 `XhSelectTagLabel`（与 `XhTagRoot` 同一条规矩），作者自己写了节点就原样放行。Web Components 侧作者写法不变（`data-xh-part="tag"` / `"overflow-tag"`），两个角色节点接的是 `tag` 的 `root`，元素替只有文字的节点包一层 `label`，`+N` 的文字填进那层 `label`；这两个作者名以 `delegates` 登记为归 `tag` 的 scope 管，不再进 `select` 的解剖。
  - **皮肤**：`select.css` 里画标签与 `+N` 的规则整段删掉，只留标签行（`tag-list`）与行里子项怎么排：行里的 `tag` 允许缩短（`flex: 0 1 auto; min-inline-size: 0`），`+N`（带 `data-count`）不缩。`tag.css` 的覆盖槽（`--xh-tag-bg` / `--xh-tag-fg` / `--xh-tag-radius` 等）写在 `select` 外层即生效。
  - **档位**：标签跟着控件的 `size` 走同一档——sm 控件 28（内 26）里的标签 22、md 32（内 30）里 26、lg 40（内 38）里 30，三档都在盒的内侧，盒高不变。

  **破坏面：**

  - `select` 的解剖少两个部件（23 → 21）：`tag`、`overflow-tag` 删除。按部件数或 `[data-scope='select'][data-part='tag']` / `[data-part='overflow-tag']` 选择过的皮肤、测试与作者样式要改成 `[data-scope='tag'][data-part='root']`（`+N` 加 `[data-count]`）。
  - `select.css` 的十一个覆盖槽随之删除：`--xh-select-tag-bg` / `-fg` / `-font-size` / `-gap` / `-px` / `-radius` 与 `--xh-select-overflow-tag-bg` / `-fg` / `-font-size` / `-px` / `-radius`，改用 `tag` 自己那批槽；`--xh-select-tag-list-gap` 留着（它是标签行自己的间隙）。
  - `+N` 那一枚不再另配压一档的配色，与标签同一副长相；要区分它就按 `[data-scope='tag'][data-part='root'][data-count]` 覆盖 `--xh-tag-bg` / `--xh-tag-fg`。
  - 标签的形态按控件的面派：`subtle` 控件里的标签从淡底变成描边（此前与盒同一块淡底、只剩文字）；写了 `tone` 的 `select` 其标签现在跟着着色。
  - `SelectApi` 多 `getTagLabelProps` 一个成员；自己按 `SelectApi` 造对象的要补上。Vue / React 各多一个 `XhSelectTagLabel`。
  - Web Components 侧 `tag` / `overflow-tag` 节点里只有文字时，元素会把文字挪进一层新建的 `<span data-scope="tag" data-part="label">`；按 `textContent` 读仍是原文，按 `firstChild` 读到的是那层 label。
  - 标签的高度与字号随本次一并变大（三档 18 → 22 / 26 / 30，字 12 → 12 / 13 / 14），圆角从药丸（`--xh-shape-pill`）改为 `tag` 的 `--xh-shape-control`。

- f7495fd: **步骤条的 `StepStatus` 收成 `'completed' | 'current' | 'incomplete'`；出错 / 警示改为逐步语气 `tones`。**

  `'error'` 与 `'warning'` 原来混在状态里：一步被打回时它仍然是「当前那一步」或「走过的那一步」，状态位却被语气占掉，皮肤只好另写两套颜色。现在状态只说步序，语气另走全库同一根轴：根上的 `tone` 给整组配色，新增 `tones?: Record<number, Tone>`（以及 collection 单步的 `tone`）给某一步单独标语气，落成 `item` 的 `data-tone`，那一步的标记、标题与连接线在这一级重新从语气层取色，还没走到的那一步也以空心描边加同色数字被看见。三端同步：Vue / React 新增 `tones` prop，自定义元素新增 `tones` property；皮肤撤掉 `data-state='error' | 'warning'` 的规则与对应的 `--xh-steps-*-error / -warning` 槽，改为 `--xh-steps-indicator-*-toned` 与 `--xh-steps-title-fg-toned`；「错误状态」示例改用 `tones`。

- 9c4a5db: CORE-15：组合宿主不合法时明确抛错；asChild 的零个或多个可挂载子节点不再报警后生成默认按钮。请提供唯一实际宿主，或在需要默认元素时移除 asChild。

  元素旁并列的非空文本和数字同样明确拒绝，仅忽略空白、注释和条件占位，不再静默丢弃可见内容。React 按正式 peer 版本 19 从 props.ref 合并引用，删除 element.ref 废弃访问。

  作者写在部件或 asChild 子节点上的事件处理器调用 preventDefault 后，不再执行部件内部动作。普通回调、通用 props 合并和 ref 生命周期保留原语义。

- 3ef5a6e: **`tag-group` 的条目套成 `tag`：一枚标签就是 `tag` 的 `root`，文字是 `tag` 的 `label`，摘除钮是 `tag` 的 `close-trigger`；`item` / `item-text` / `item-delete-trigger` 不再是本组件的部件，`tag-group.css` 不再自己画标签。**

  此前 `tag-group` 自己画了一整套标签（三档尺寸、三种形态、语气、置灰、截断、摘除钮、兜底字形），与 `tag.css` 是第二份拷贝。现在：

  - **连接层**：每一枚标签在 `connectTagGroup` 里各是一份 `connectStaticTag`（受控 `open: true`、三轴与 `readOnly` 从整组传下去、`disabled` 与 `closable` 逐枚定、`translations.close` 取 `translations.deleteItem(标签文字)`）。`api.getItemProps()` 是这份实例的 `root` 叠上集合里的那几件事——`role="row"`、`data-value`、roving `tabindex`、`aria-selected` / `aria-disabled`、`data-selectable` / `data-deletable` / `data-highlighted` / `data-selected`、点选与聚焦处理器；`api.getItemTextProps()` 是它的 `label`；`api.getItemDeleteTriggerProps()` 是它的 `close-trigger` 再叠 `tabindex="-1"` 与「主键按下不夺焦」。按叉时 `tag` 只发 `onOpenChange({ open: false })`，`tag-group` 在那里把焦点交给相邻的一枚再送 `ITEM.DELETE`，与键盘 `Delete` / `Backspace` 走同一条路。
  - **选中改成布尔 `data-selected`**（词汇表里 `row` + `aria-selected` 配的就是它），`data-state` 只剩 `tag` 的 `open` 族（宿主根上恒为 `open`）；`cell` 同步带 `data-selected` / `data-highlighted` / `data-disabled`。
  - **禁用 / 只读矩阵由 `tag` 给**：整组或这一枚禁用时标签置灰、钮留位并原生 `disabled`；整组只读时钮留位、原生 `disabled`，标签本身不置灰；没开放摘除时钮连位置一起收起。
  - **三家适配器**：Vue / React 的 `XhTagGroupItem` / `XhTagGroupItemText` / `XhTagGroupItemDeleteTrigger` 名字与用法不变，渲出来的节点换成 `tag` 的 `root` / `label` / `close-trigger`；Web Components 侧作者写法不变（`data-xh-part="item" / "item-text" / "item-delete-trigger"`），这三个作者名以 `delegates` 登记为归 `tag` 的 scope 管。
  - **皮肤**：`tag-group.css` 里画标签的全部规则整段删掉（尺寸三档、形态、语气、置灰、截断、打印、摘除钮、兜底字形、聚焦环的 `solid` 上下文），只留集合层的事——`root` / `label` / `list` 怎么排、`cell` 那一格、以及叠在 `tag` 根上的可点（`cursor` 与按压回执）、锚点与悬停的中性灰轻档（实心档不进）、选中的描边与字色（实心档改用面配对的前景色描边，字不换）、只读的光标。聚焦环全归 `focus.css` 的通用环加 `tag.css` 的 `solid` 上下文规则，`tag-group.css` 不再另写。标签的样子归 `tag.css`，`--xh-tag-*` 覆盖槽在组里照样生效。
  - **新导出 `tagGroupItems(list)`**：按文档序取列表里担 `row` 角色的 `tag` 根（作者塞进格子里的独立标签没有这个角色，不算条目；嵌套的标签组互不吞并），代替原来的 `tagGroupItemQuery`。

  **破坏面：**

  - `tag-group` 的解剖少三个部件（7 → 4）：`item` / `item-text` / `item-delete-trigger` 删除。按 `[data-scope='tag-group'][data-part='item']` 选择过的皮肤、测试与作者样式要改成 `[data-scope='tag-group'][data-part='list'] > [data-scope='tag'][data-part='root']`；`item-text` 改成 `[data-scope='tag'][data-part='label']`，`item-delete-trigger` 改成 `[data-scope='tag'][data-part='close-trigger']`。
  - 选中态从 `data-state="checked" | "unchecked"` 改成布尔 `data-selected`：按 `[data-state='checked']` 写过的样式与断言要改成 `[data-selected]`。
  - `@xihan-ui/headless` 不再导出 `tagGroupItemQuery`（`core` 的 `queryItems` 按容器 scope 过滤，对上不了 `tag` 的 scope），改用 `tagGroupItems(list)`。
  - `tag-group.css` 的这些覆盖槽随之删除：`--xh-tag-group-item-icon-size` / `-px` / `-py` / `-px-deletable` / `-radius` / `-bg` / `-fg` / `-font-size` / `-font-weight` / `-border` / `-shadow` / `-border-disabled` / `-bg-disabled`、`--xh-tag-group-cell-gap`、`--xh-tag-group-item-delete-size` / `-radius` / `-fg` / `-bg-hover` / `-bg-active`；改用 `tag` 的 `--xh-tag-icon-size` / `--xh-tag-gap` / `--xh-tag-px` / `--xh-tag-py` / `--xh-tag-radius` / `--xh-tag-bg` / `--xh-tag-fg` / `--xh-tag-font-size` / `--xh-tag-font-weight` / `--xh-tag-border` / `--xh-tag-shadow` / `--xh-tag-border-disabled` / `--xh-tag-bg-disabled` / `--xh-tag-close-size` / `--xh-tag-close-radius` / `--xh-tag-close-fg` / `--xh-tag-close-bg-hover` / `--xh-tag-close-bg-active`。留下的只有集合层的三个：`--xh-tag-group-item-bg-hover` / `--xh-tag-group-item-border-selected` / `--xh-tag-group-item-fg-selected`。`cell` 那一格的间距照抄所在标签的那一档（`gap: inherit`），改 `--xh-tag-gap` 即可。
  - 标签的尺寸走 `tag` 的三档：md 从 12px 字号、2px 竖向内衬变成 `tag` 的 13px 字号、4px 竖向内衬与不低于指示符的行框（同档标签有没有关闭钮一样高）；sm / lg 同理。
  - 悬停与键盘锚点的中性灰轻档现在也落到写了语气的淡底标签上（此前被形态规则的源序盖住而不生效）；实心标签不论有无语气都不进轻档，面不换（此前没写语气的实心标签会换成灰底、字仍是实心底上的浅字，1.26:1）。
  - 选中的实心标签字不换（仍是 `tag.css` 给的面配对前景色，作者的 `--xh-tag-fg` 照旧生效），描边取字色（`currentColor`）在实心底上描出一圈（此前没写语气的那一档把字换成 `--xh-fg-brand-strong` 压在品牌底上读不出来，写了语气的那一档被形态规则盖住、选中看不出来）。`--xh-tag-group-item-border-selected` 在实心档上照样先于字色生效，`--xh-tag-group-item-fg-selected` 只落到非实心档。
  - 摘除钮的样子不变（此前已与 `tag` 的关闭钮同一副长相），只是覆盖槽换成 `--xh-tag-close-*`；标签与摘除钮的聚焦环改走 `focus.css` 的通用环加 `tag.css` 的 `solid` 上下文规则，`tag-group.css` 不再画环。
  - `tag.css` 的实心档环规则（标签根与关闭钮的 `--xh-_ring-color: currentColor`）排掉置灰档：组里置灰的标签仍是 roving 锚点、落得上焦点，它的字已换成置灰色，环退回默认那一支（此前由 `tag-group.css` 自己的规则排掉，现在归 `tag.css`）。

- 3ef5a6e: **`tags-input` 的标签预览退役成 `tag`：`item-preview` / `item-text` / `item-delete-trigger` 不再是本组件的部件，渲出来的是 `tag` 的 `root` / `label` / `close-trigger`（`data-scope="tag"`），样子归 `tag.css`。**

  标签输入里每一枚标签此前是本组件自己画的一颗胶囊（底色、圆角、字号、删除钮、悬停与按压都另写一套）——`tag` 本来就是这枚胶囊，第二份就是另起一套。现在：

  - **连接层**：每一枚标签在 `connectTagsInput` 里各是一份 `connectStaticTag`（`variant` 按控件的面派：`subtle` 控件里是描边标签，其余含缺省是淡底标签；`tone` / `size` / `disabled` / `readOnly` 随控件；`closable: true`；`translations.close` 取 `translations.deleteItem(标签值)`）。预览就是这份实例的 `getRootProps()`，`open` 只看这一枚是不是正被就地编辑：编辑时 `tag` 按 `open=false` 给 `hidden` 与 `data-state="closed"`，与 `item-input` 的 `hidden` 互斥。文字是 `getLabelProps()`，删除钮是 `getCloseTriggerProps()` 再合上 `tabindex="-1"` 与「按下不夺焦」——按它时 `tag` 只发 `onOpenChange({ open: false })`，`tags-input` 在那里送 `TAG.DELETE` 并把焦点交回输入框（仅当焦点当下正落在这一枚里）。
  - **状态标记留在 `item` 上**：`data-value` / `data-highlighted` / `data-editing` / `data-disabled` / `data-readonly` 仍打在本组件的 `item` 包裹层上，`tag` 的 `root` 只带 `tag` 自己的属性（三轴、`data-state`、`data-disabled`、`hidden`）。光标走到标签上的反白由 `[data-scope='tags-input'][data-part='item'][data-highlighted] > [data-scope='tag'][data-part='root']` 这条跨 scope 规则画在 `tag` 的 `root` 上，覆盖槽仍是 `--xh-tags-input-item-bg-highlight` / `-fg-highlight`。
  - **禁用 / 只读矩阵由 `tag` 给**：禁用时钮留在原地、原生 `disabled` 并带 `data-disabled`，整枚标签置灰；只读时钮同样留位、原生 `disabled`，标签本身不置灰。
  - **可及名**：仍走 `translations.deleteItem`（缺省 `Delete <标签值>`），经 `tag` 的 `translations.close` 落到那颗钮上。
  - **三家适配器**：Vue / React 的 `XhTagsInputItemPreview` / `XhTagsInputItemText` / `XhTagsInputItemDeleteTrigger` 名字与用法不变，渲出来的节点换成 `tag` 的三个部件；Web Components 侧作者写法不变（`data-xh-part="item-preview"` / `"item-text"` / `"item-delete-trigger"`），三个作者名以 `delegates` 登记为归 `tag` 的 scope 管。
  - **皮肤**：`tags-input.css` 里画胶囊的规则整段删掉（`item` 的底色 / 圆角 / 字号 / 反白 / 置灰 / 编辑态透底，`item-preview` 的内衬，`item-text` 的截断，`item-delete-trigger` 的尺寸 / 圆角 / 悬停 / 按压 / 聚焦环 / 禁用色 / 兜底字形）；`item` 只剩「在行里怎么占位」（不缩、不超过一行）。标签吃 `tag.css`：三档高 22 / 26 / 30 装进控件的 28 / 32 / 40 里，框仍是一行控件高；就地编辑框的行框、内衬与字号照 `tag` 那一档写，换进换出时与标签一样高、行不跳。

  **破坏面：**

  - `tags-input` 的解剖少三个部件（12 → 9）：`item-preview` / `item-text` / `item-delete-trigger` 删除。按 `[data-scope='tags-input'][data-part='item-preview' | 'item-text' | 'item-delete-trigger']` 选择过的皮肤、测试与作者样式要改成 `[data-scope='tag'][data-part='root' | 'label' | 'close-trigger']`（要限定在 `tags-input` 里就前缀 `[data-scope='tags-input'][data-part='item']`）。
  - `tags-input.css` 的这些覆盖槽随之删除：`--xh-tags-input-item-bg` / `-fg` / `-gap`，`--xh-tags-input-delete-size` / `-radius` / `-bg` / `-fg` / `-font-size` / `-fg-highlight` / `-bg-hover` / `-fg-hover` / `-bg-active`，改用 `tag` 的 `--xh-tag-bg` / `--xh-tag-fg` / `--xh-tag-gap` / `--xh-tag-close-size` / `--xh-tag-close-radius` / `--xh-tag-close-fg` / `--xh-tag-close-bg-hover` / `--xh-tag-close-bg-active`（写在 `tags-input` 的根上即对整框的标签生效）。`--xh-tags-input-item-radius` / `-py` / `-px` / `-font-size` 只剩就地编辑框在用，`-radius` 的缺省从 `--xh-shape-pill` 改成 `--xh-shape-control`（与 `tag` 同）。
  - 标签的高从随字号算的一档变成 `tag` 的三档 22 / 26 / 30，圆角从胶囊圆改成 `--xh-shape-control`，字重取 `tag` 的 `--xh-font-weight-medium`；反白档描边收成透明。
  - 悬停 / 按压底色从 `--xh-bg-subtle-hover` / `-active` 换成由当前前景色兑出的 `color-mix`；缺省字色从 `--xh-fg-muted` 换成标签自己的文字色。
  - 聚焦环不再由 `tags-input.css` 画，走 `focus.css` 的通用环；反白标签里的叉取 `currentColor`。
  - 只读时删除钮从「原生 `disabled`（由整组只读推得）」保持原生 `disabled` 不变，但现在是 `tag` 的 `readOnly` 给的：钮带 `data-disabled`，标签的 `root` 不带。

- fb01380: Toast 新增必需的 `content` 文本列与可选 `description`，并将默认卡片改为中性浮层；语气只落到标题和状态图标。

  全局服务默认落在底部，最多显示 3 条、间距 12px；默认停留与退场窗口分别改为 4000ms 和 300ms，关闭入口默认可用，全局服务在页面转入后台时自动暂停计时。

  移除中部三种落位，只保留顶部与底部的六种边缘落位。

- a16f7f2: **轻提示与通知的 `type` 改名 `tone`，取值收成全库语气轴的 `info | success | warning | danger`；加载中从语气里拆出来，独立成 `loading?: boolean`。**

  原来的 `type` 一位说了两件事：既是配色语气，又用 `'loading'` 表达"事情还没完"，于是 `'error'` 得先翻译成语气层的 `danger`，`'loading'` 又得偷偷派生成中性色。现在语气与加载态各占一位：`tone` 直接落到 `data-tone`，决定配色、行首字形与实时区级别（`danger` 走 alert + assertive）；`loading` 落到 `data-loading`，字形换成转圈且不自动消失，配色照语气走，完事后写 `{ loading: false, tone: 'success' }` 收尾。皮肤不再读 `data-severity`。

  三端与服务同步：Vue / React 的 `type` prop、自定义元素的 `type` attribute 改为 `tone` + `loading`；`ToastType` / `NotificationType` 改名 `ToastTone` / `NotificationTone`；轻提示与通知服务的 `error()` 糖改名 `danger()`，`loading()` 糖改为打开 `loading` 位，`promise()` 落定后以 `{ loading: false, tone }` 改写；`@xihan-ui/sound` 的 `withToastSound` 端口同步改成 `danger`，`sounds` 覆盖表的键从 `error` 改为 `danger`（缺省仍发主题里那把 `error` 声）。

- 61773be: 完成 TreeSelect 懒分支反馈与自动空态合同：公开 loading/error/retry/loaded-empty 结构和请求事件，收起、重试、节点移除或换代时严格作废旧请求，并为 collection 与手写树自动渲染空态和首次加载态。
- 3284947: **统一部件上同名事件处理器的先后：作者的先跑，部件的后跑。**

  此前同一个部件，只因为写不写 `asChild`，同名处理器的顺序就反过来：带 `asChild` 那条路是作者的先跑，直接把属性写在部件上那条路是部件的先跑。同一份心智模型下写出来的两段代码，行为不一样。

  判据是「作者传的处理器能不能拦住部件的默认动作」——能拦才是有用的口子，所以两条路统一成作者的先跑。Web Components 那一侧本来就是这个顺序（Light DOM 里先后就是 DOM 监听器的注册顺序，作者的标记先在页面上），这次只补了用例把它钉住，没有改动。

  `class` / `className` / `style` 与其余普通值的取舍没有变化。

  **破坏性**：如果你依赖「部件先跑完再轮到自己」——例如在自己的 `onClick` 里读部件刚写进去的状态——顺序反了。改法是把那段逻辑挪到微任务里，或改用组件的变更回调（`onOpenChange` 这类），那才是「部件动作之后」的正规出口。

  这处不一致是铺 React 适配器时对照出来的：React 侧当时照 Vue 抄了，所以两家都带着。

- 33c6805: **形态轴收敛为一套词。**

  **字段类默认落 `outline`。** text-field 的 `variant` 未提供时由 connect 落成 `data-variant="outline"`
  （root 与 control 两处一致；此前不发属性，由皮肤基础规则按缺省档绘制）。Field Chrome 家族的基础规则已是
  描边式（canvas 底 + `--xh-border-control` 描边 + 无影），显式落值后皮肤不再依赖缺省档，外观不变；
  自定义皮肤若以"无 `data-variant`"判定默认态需改为读取 `outline`。

  **number-field 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，
  皮肤基础规则按缺省档绘制）。默认外观从「透明描边 + raised 落影」改为「`--xh-bg-canvas` 底 +
  `--xh-border-control` 描边」；皮肤未改，outline 档仍保留 raised 落影，与 Field Chrome 家族的无影对齐留给
  后续配方矩阵。自定义皮肤若以「无 `data-variant`」判定默认态需改为读取 `outline`。

  **color-field 默认落 `outline`。** `variant` 未提供时 root 与 control 都落 `data-variant="outline"`（此前
  不发属性，由 Field Chrome 家族基础规则按缺省档绘制）。家族基础规则与 outline 逐值相同，外观不变；
  自定义皮肤若以「无 `data-variant`」判定默认态需改为读取 `outline`。

  **password-input 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，
  由皮肤基础规则按缺省档绘制）。基础规则与 outline 档逐值相同（`--xh-bg-canvas` 底 +
  `--xh-border-control` 描边，raised 落影两处都保留），外观不变；自定义皮肤若以「无 `data-variant`」
  判定默认态需改为读取 `outline`。

  **pin-input 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，由皮肤
  基础规则按缺省档绘制）。基础规则与 outline 档逐值相同（`--xh-bg-canvas` 底 +
  `--xh-border-control` 描边，raised 落影保留），外观不变；自定义皮肤若以「无 `data-variant`」判定默认态
  需改为读取 `outline`。

  **date-field 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，由皮肤
  基础规则按缺省档绘制）。基础规则的常态描边是透明、悬停才浮出 `--xh-border-default`；outline 档把常态
  描边换成 `--xh-border-control`、悬停换成 `--xh-border-control-hover`，底色仍是 `--xh-bg-canvas`，raised
  落影保留。默认外观因此从「透明描边 + 轻影」变为「描边式 + 轻影」；自定义皮肤若以「无 `data-variant`」
  判定默认态需改为读取 `outline`。

  **time-field 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，由皮肤
  基础规则按缺省档绘制）。基础规则的常态描边是透明、悬停才浮出 `--xh-border-default`；outline 档把常态
  描边换成 `--xh-border-control`、悬停换成 `--xh-border-control-hover`、悬停底换成 `--xh-bg-subtle`，
  底色仍是 `--xh-bg-canvas`，raised 落影保留。默认外观因此从「透明描边 + 轻影」变为「描边式 + 轻影」；
  自定义皮肤若以「无 `data-variant`」判定默认态需改为读取 `outline`。

  **editable 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，由皮肤
  基础规则按缺省档绘制）。editable 的基础规则本就是 `--xh-bg-canvas` 底 + `--xh-border-control` 描边 +
  raised 落影，与 outline 档逐值相同，默认外观不变；自定义皮肤若以「无 `data-variant`」判定默认态需改为
  读取 `outline`。

  **tags-input 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，由皮肤
  基础规则按缺省档绘制）。基础规则与 outline 档逐值相同（`--xh-bg-canvas` 底 + `--xh-border-control`
  描边，raised 落影保留），外观不变；内嵌标签仍按 `tagVariantForControl(outline)` 落 subtle，与此前一致。
  自定义皮肤若以「无 `data-variant`」判定默认态需改为读取 `outline`。

  **prompt-input 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，由皮肤
  基础规则按 M1 柔和实体面绘制）。默认外观从「`--xh-material-soft-bg` 底 + `--xh-material-soft-border`
  描边 + 顶光与背景模糊」改为「`--xh-bg-canvas` 底 + `--xh-border-control` 描边，关掉顶光与背景模糊」，
  `--xh-material-soft-shadow` 落影保留；皮肤未改，去掉 soft 材质本身留给后续配方矩阵。自定义皮肤若以
  「无 `data-variant`」判定默认态需改为读取 `outline`。

  **select 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前不发
  属性，由皮肤基础规则按缺省档绘制）。默认外观从「`--xh-bg-canvas` 底 + 透明描边 + raised 落影」改为
  「`--xh-bg-canvas` 底 + `--xh-border-control` 描边 + 无影」；皮肤未改，由既有 outline 规则承担。内嵌标签
  仍按 `tagVariantForControl(outline)` 落 subtle，与此前一致。自定义皮肤若以「无 `data-variant`」判定默认态
  需改为读取 `outline`。

  **combobox 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前不发
  属性，由皮肤基础规则按缺省档绘制）。基础规则与 outline 档逐值相同（`--xh-bg-canvas` 底 +
  `--xh-border-control` 描边，raised 落影保留），外观不变；自定义皮肤若以「无 `data-variant`」判定默认态需
  改为读取 `outline`。

  **cascader 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前不发
  属性，由皮肤基础规则按缺省档绘制）。基础规则与 outline 档逐值相同（`--xh-bg-canvas` 底 +
  `--xh-border-control` 描边，raised 落影保留），外观不变；自定义皮肤若以「无 `data-variant`」判定默认态需
  改为读取 `outline`。

  **tree-select 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前不发
  属性，由皮肤基础规则按缺省档绘制）。基础规则与 outline 档逐值相同（`--xh-bg-canvas` 底 +
  `--xh-border-control` 描边，raised 落影保留），外观不变；自定义皮肤若以「无 `data-variant`」判定默认态需
  改为读取 `outline`。

  **mention 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前不发
  属性，由皮肤基础规则按缺省档绘制）。基础规则与 outline 档逐值相同（`--xh-bg-canvas` 底 +
  `--xh-border-control` 描边，raised 落影保留），外观不变；自定义皮肤若以「无 `data-variant`」判定默认态需
  改为读取 `outline`。

  **date-picker 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前
  不发属性，由皮肤基础规则按缺省档绘制）。基础规则的输入行常态描边是透明；outline 档把常态描边换成
  `--xh-border-control`、悬停换成 `--xh-border-control-hover`，底色仍是 `--xh-bg-canvas`，raised 落影保留。
  默认外观因此从「透明描边 + 轻影」变为「描边式 + 轻影」；自定义皮肤若以「无 `data-variant`」判定默认态需
  改为读取 `outline`。

  **date-range-picker 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前
  不发属性，由皮肤基础规则按缺省档绘制）。基础规则的输入行常态描边是透明；outline 档把常态描边换成
  `--xh-border-control`、悬停换成 `--xh-border-control-hover`、悬停底换成 `--xh-bg-subtle`，底色仍是
  `--xh-bg-canvas`，raised 落影保留。默认外观因此从「透明描边 + 轻影」变为「描边式 + 轻影」；自定义皮肤若以
  「无 `data-variant`」判定默认态需改为读取 `outline`。

  **time-picker 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前
  不发属性，由皮肤基础规则按缺省档绘制）。基础规则的输入行常态描边是透明；outline 档把常态描边换成
  `--xh-border-control`、悬停换成 `--xh-border-control-hover`、悬停底换成 `--xh-bg-subtle`，底色仍是
  `--xh-bg-canvas`，raised 落影保留。默认外观因此从「透明描边 + 轻影」变为「描边式 + 轻影」；自定义皮肤若以
  「无 `data-variant`」判定默认态需改为读取 `outline`。

  **time-range-picker 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`
  （此前不发属性，由皮肤基础规则按缺省档绘制）。基础规则的输入行常态描边是透明；outline 档把常态描边换成
  `--xh-border-control`、悬停换成 `--xh-border-control-hover`、悬停底换成 `--xh-bg-subtle`，底色仍是
  `--xh-bg-canvas`，raised 落影保留。默认外观因此从「透明描边 + 轻影」变为「描边式 + 轻影」；自定义皮肤若以
  「无 `data-variant`」判定默认态需改为读取 `outline`。

  **input-group 改用 `outline` / `subtle` / `ghost`。** `primary` → `outline`、`secondary` → `subtle`，新增
  `ghost`（静息不画底、描边与落影，悬停与聚焦沿用现有规则浮出）；`variant` 未提供时 root 落
  `data-variant="outline"`（此前不发属性，皮肤基础规则按缺省档绘制，与 outline 逐值相同，外观不变）。
  `InputGroupVariant` 类型删除，改用 `ControlVariant`，与组内字段同一套词。皮肤只把 `secondary` 选择器映射到
  `subtle`，outline 基础规则仍是 `--xh-border-subtle` 假边 + raised 落影，回归 `--xh-border-control` 留给后续
  Field Chrome 配方矩阵。

  **card 改用 `outline` / `subtle` / `ghost`。** `default` → `outline`、`secondary` → `subtle`、`tertiary` → `ghost`、
  `transparent` → `ghost`；`variant` 未提供时 root 落 `data-variant="outline"`（此前落 `default`，皮肤基础规则即
  该档，默认外观不变）。`CardVariant` 类型删除，三端改用 `ControlVariant`。皮肤只把 `secondary` / `transparent`
  选择器映射到 `subtle` / `ghost`，规则体不动；`tertiary` 的 `--xh-bg-subtle-hover` 底色档退役，原 tertiary 作者
  迁到 `ghost` 后卡面不再画底与影。本节覆盖未发布 changeset `card-semantic-surfaces.md` 里的四值旧词。

  **tree 改用 `outline` / `subtle` / `ghost`。** `surface` → `outline`、`plain` → `ghost`；`variant` 未提供时 root 落
  `data-variant="outline"`（此前落 `surface`，皮肤基础规则即该档，默认外观不变）。`TreeVariant` 类型删除，三端改用
  `ControlVariant`。皮肤只把 `plain` 选择器映射到 `ghost`，规则体不动；`subtle` 为新增最小规则（描边透明 +
  `--xh-bg-subtle` 底），此前没有对应外观。

  **json-viewer 改用 `outline` / `subtle` / `ghost`。** `surface` → `outline`、`plain` → `ghost`；`variant` 未提供时 root 落
  `data-variant="outline"`（此前落 `surface`，皮肤基础规则即该档，默认外观不变）。`JsonViewerVariant` 类型删除，三端改用
  `ControlVariant`。皮肤只把 `plain` 选择器映射到 `ghost`，规则体不动；`subtle` 为新增最小规则（描边透明 +
  `--xh-bg-subtle` 底），此前没有对应外观。

  **toolbar 改用 `outline` / `subtle` / `ghost`。** `plain` → `ghost`、`surface` → `outline`；`variant` 未提供时 root 落
  `data-variant="ghost"`（此前不发属性，皮肤基础规则即该档，默认外观不变）。`ToolbarVariant` 类型删除，三端改用
  `ControlVariant`。皮肤只把 `plain` / `surface` 选择器映射到 `ghost` / `outline`，规则体不动：outline 本阶段仍是
  `--xh-bg-surface` 底 + raised 落影、无描边，补 `--xh-border-default` 留给后续配方矩阵；`subtle` 为新增最小规则
  （带内距 + `--xh-bg-subtle` 底，无描边无影），此前没有对应外观。

  **accordion 改用 `outline` / `subtle` / `ghost`。** `plain` → `ghost`、`surface` → `outline`、`bordered` → `outline`；
  `variant` 未提供时 root 落 `data-variant="ghost"`（此前不发属性，皮肤基础规则即该档，默认外观不变）。
  `AccordionVariant` 类型删除，三端改用 `ControlVariant`。皮肤把 `surface` 选择器映射到 `outline`，规则体不动；
  `bordered` 的逐条外框形态退役（其 `gap` 与条目 `border` / `border-radius` 规则删除，公开覆盖槽
  `--xh-accordion-item-gap` 随之退役），原 bordered 作者迁到 `outline` 后得到单一连续表面；`subtle` 为新增最小规则
  （同 outline 的连续表面，底换成 `--xh-bg-subtle`），此前没有对应外观。

  **list 的 `bordered` 并入形态轴。** `bordered` → `variant="outline"`；新增 `variant` 轴，取值 `outline` / `subtle` /
  `ghost`，未提供时 root 落 `data-variant="ghost"`（此前不发属性，皮肤基础规则即该档，默认外观不变）。DOM 属性
  `data-bordered` 不再由 list 发出；三端的 `bordered` prop / attribute 删除。皮肤把 `[data-bordered]` 选择器映射到
  `[data-variant='outline']`，规则体不动；`subtle` 为新增最小规则（不画描边，surface 圆角 + `--xh-bg-subtle` 底），
  此前没有对应外观。示例 `list/03-bordered-hoverable` 改名 `list/03-outline-hoverable`。

  **descriptions 的 `bordered` 并入形态轴。** `bordered` → `variant="outline"`；新增 `variant` 轴，取值 `outline` /
  `subtle` / `ghost`，未提供时 root 落 `data-variant="ghost"`（此前不发属性，皮肤基础规则即该档，默认外观不变）。DOM
  属性 `data-bordered` 不再由 descriptions 发出；三端的 `bordered` prop / attribute 删除。皮肤把 `[data-bordered]`
  选择器（含逐档网格线共 17 处）映射到 `[data-variant='outline']`，规则体不动；`subtle` 为新增最小规则（不画描边也不补
  网格线，surface 圆角 + `--xh-bg-subtle` 底），此前没有对应外观。示例 `descriptions/04-bordered` 改名
  `descriptions/04-outline`。

  **table 的 `borderless` 并入形态轴。** `borderless` → `variant="ghost"`；新增 `variant` 轴，取值 `outline` /
  `subtle` / `ghost`，未提供时 root 落 `data-variant="outline"`（此前由 `borderless` 取反发 `data-bordered`，皮肤
  外框规则即该档，默认外观不变）。DOM 属性 `data-bordered` 不再由 table 发出；三端的 `borderless` prop /
  attribute 删除。皮肤把 `[data-bordered]` 选择器映射到 `[data-variant='outline']`，规则体不动；`subtle` 为新增
  最小规则（不画描边，surface 圆角 + `--xh-bg-subtle` 底），此前没有对应外观。

  **page-header 改用 `outline` / `subtle` / `ghost`，`bordered` 改名 `split`。** `plain` → `ghost`、`surface` →
  `outline`、`raised` → `outline`；`variant` 未提供时 root 落 `data-variant="ghost"`（此前不发属性，皮肤基础规则
  即该档，默认外观不变）。`PageHeaderVariant` 类型删除，三端改用 `ControlVariant`。`bordered` 改名 `split`：
  它画的是页头与下方内容之间的分隔线而非有框/无框，DOM 属性 `data-bordered` 改 `data-split`，且只在 `ghost` 上
  画；有面的两档由描边承担边界。皮肤把 `surface` 映射到 `outline` 并合并原 `raised` 的整圈描边，outline 因此恒带
  `--xh-border-subtle` 描边（原 surface 不写 bordered 时无描边）；`raised` 的抬起投影退役，公开覆盖槽
  `--xh-page-header-shadow` 随之删除；`subtle` 为新增最小规则（描边透明 + `--xh-bg-subtle` 底 + 无影），此前没有
  对应外观。示例 `page-header/02-bordered-footer` 改名 `page-header/02-split-footer`。

  **layout 的 `bordered` 改名 `split`。** 它画的是头部、侧栏、脚部与内容之间的分隔线而非有框/无框（layout 根本身
  无壳），与 `data-split` 既有语义一致，因此不加 `variant` 轴；三端的 `bordered` prop / attribute 改名 `split`，DOM
  属性 `data-bordered` 改 `data-split`，皮肤只把 `[data-bordered]` 选择器映射到 `[data-split]`，规则体不动，外观不变。
  至此库内不再有任何组件发出 `data-bordered`，该属性名进入退役清单。

  **tabs 默认变体改为 `line`。** `variant` 未提供时 root 落 `data-variant="line"`（此前不发属性，皮肤基础规则按
  segment 绘制）。默认外观从「浅色标签带 + 浮起选中面」改为「透明标签带 + 底部指示条 + 品牌字色」；原默认外观写
  `variant="segment"` 取得。皮肤基础规则改为 line 取值（Web Components 升级前无 `data-variant` 的一帧与默认一致），
  `segment` 与 `card` 块补齐原来靠基础规则继承的私有槽（触发器描边、选中描边、选中字色），显式写这两档的外观逐值不变。
  指示条不再对「无 `data-variant`」的根隐藏，只对 `segment` / `card` 隐藏。示例 `tabs/03-variant` 改为展示 segment。

  **text-field 清空钮改走 field-inset ghost 档，标签字号不随档。** connect 在 clear-trigger 上补投影
  `data-xh-action-variant="ghost"`；皮肤删除自写的 `--xh-action-bg-rest/-hover/-pressed` 取值（原悬停
  `--xh-bg-subtle-hover`、按下 `--xh-bg-subtle-active` 属淡底承载阶梯），改由家族 ghost 档给：字段底是 canvas，
  清空钮悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）；使用者槽 `--xh-text-field-action-bg`
  /`-bg-hover`/`-bg-active` 保留为覆盖入口，缺省指向家族档值。label 的私有 `--xh-_text-field-label-font-size` 删除，
  `--xh-text-field-label-font-size` 缺省改为 `--xh-text-label-size`：sm 档标签由 13px 升为 14px、lg 档由 16px 降为
  14px，md 不变。control 上补映射 `--xh-field-glyph-size`，`--xh-text-field-icon-size` 使用者槽在视觉盒内重新生效
  （此前被家族 chrome 的 `--xh-icon-size` 覆盖）；清空钮内字形改按 field-inset 档取 `--xh-_action-profile-glyph-size`。

  **color-field 清空钮改走 field-inset ghost 档，标签字号不随档。** connect 在 clear-trigger 上补投影
  `data-xh-action-variant="ghost"`；皮肤不再自写 200/300 的淡底阶梯，清空钮悬停 `--xh-bg-subtle`（100）、按下
  `--xh-bg-subtle-hover`（200），使用者槽 `--xh-color-field-action-bg`/`-bg-hover`/`-bg-active` 保留为覆盖入口。
  label 的私有 `--xh-_color-field-label-font-size` 删除，`--xh-color-field-label-font-size` 缺省改为
  `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。control 补映射 `--xh-field-glyph-size`，
  `--xh-color-field-icon-size` 在视觉盒内重新生效；清空钮内字形按 field-inset 档取 `--xh-_action-profile-glyph-size`。

  **number-field 接入 Field Chrome 与 Action Control，默认去 raised 落影，加减钮改为 field-inset 正方盒。**
  connect 在 control 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省
  `outline`），input 上投影 `data-xh-field-input` / `data-xh-field-layout="single-line"` / `data-readonly`，
  prefix / suffix 投影 `data-xh-field-affix`，increment / decrement 投影 `data-xh-action-control` +
  `field-inset` + `ghost` + `always` + size。皮肤删除 control 自画盒与五态、input / affix 自写重置、三档
  variant 块与 `--xh-_number-field-*` 形态私有槽，改为向家族桥接槽映射。默认外观变化：outline 档不再带
  `--xh-elevation-raised` 落影（字段家族不消费 raised）；focus 与 invalid 时底色保持 canvas（原聚焦换
  `--xh-bg-subtle` 底）；焦点描边一律 `--xh-border-control-focus`，不再随 `tone`；加减钮由「占满控件高度、
  圆角 0、悬停透明、按下 `--xh-bg-subtle-active`（300）」改为 field-inset 档正方盒（sm 24 / md 32 / lg 36px，
  compact 依令牌）、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压，
  粗指针下不再放大真实按钮盒与控件最小高度，改由家族伪元素外扩 44px 命中区，control 不再 `overflow: hidden`；
  输入与动作组之间的半高分隔线改画在减钮的 `background-image` 上（`::after` 让给粗指针热区），RTL 由
  `[dir='rtl']` 换边，forced-colors 用 `ButtonText` 重画。label 的 `--xh-number-field-label-font-size` 缺省改为
  `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。公开覆盖槽退役：`--xh-number-field-touch-target-size`
  （家族热区不读组件槽）、`--xh-number-field-control-bg-focus`、`--xh-number-field-control-bg-invalid`（家族聚焦与
  无效态不换底）；新增 `--xh-number-field-control-fg`、`--xh-number-field-trigger-radius`；
  `--xh-number-field-trigger-bg-active` 改指向家族按压桥接槽，`--xh-number-field-trigger-divider-h` 改按钮高的
  百分比解析（缺省仍 50%）。

  **password-input 接入 Field Chrome 与 Action Control，默认去 raised 落影，无 control 结构不再画盒。**
  connect 在 control 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省
  `outline`），input 上投影 `data-xh-field-input` / `data-xh-field-layout="single-line"` / `data-readonly`，
  visibility-trigger 投影 `data-xh-action-control` + `field-inset` + `ghost` + `always` + size。皮肤删除 control
  自画盒与五态、独立 input 自画盒与五态、四条 autofill、三档 variant 块、tone 语气块与 `--xh-_password-input-*`
  形态私有槽，改为向家族桥接槽映射。默认外观变化：outline 档不再带 `--xh-elevation-raised` 落影；焦点描边一律
  `--xh-border-control-focus`，不再随 `tone`（subtle / ghost 的语气淡底改由家族 `--xh-_tone-subtle` 链给）；不写
  `control` 时输入框与按钮是独立元素，不再绘制描边、底与落影的外壳；自动填充由家族用 `--xh-bg-canvas` 实体底
  与 `--xh-fg-default` 前景重绘，不再按形态 / 只读 / 禁用派生；切换钮由「`--xh-control-action-size` 方盒、control
  圆角、悬停 `--xh-bg-subtle-hover`（200）、按下 `--xh-bg-subtle-active`（300）」改为 field-inset 档正方盒（sm 24 /
  md 32 / lg 36px，compact 依令牌）、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+
  0.97 按压，粗指针命中区由家族伪元素外扩 44px；切换钮占 Tab 位，control 内仍保留自己的焦点环以区分两个停靠点。
  输入与切换钮之间的半高分隔线改画在切换钮的 `background-image` 上（`::after` 让给粗指针热区），贴在靠输入的
  那一侧、长度按钮高的 50% 解析，RTL 由 `[dir='rtl']` 换边，forced-colors 用 `CanvasText` / `GrayText` 重画。
  label 的 `--xh-password-input-label-font-size` 缺省改为 `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。
  公开覆盖槽退役（独立 input 不再画盒）：`--xh-password-input-input-bg`、`-input-bg-disabled`、`-input-bg-hover`、
  `-input-bg-readonly`、`-input-border`、`-input-border-focus`、`-input-border-hover`、`-input-border-invalid`、
  `-input-h`、`-input-min-w`、`-input-px`、`-input-radius`、`-input-shadow`；新增 `--xh-password-input-control-fg`。

  **pin-input 每格接入 Field Chrome，默认去 raised 落影，焦点边不随 tone。** connect 在每一格 input 上投影
  `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；格子自身就是视觉盒，
  不投影 `data-xh-field-input`（否则家族会重置格子的边框）。皮肤删除格子自画的描边、底、圆角、落影、悬停与
  invalid / readonly / disabled 面、三档 variant 块与 `--xh-_pin-input-box-*` 形态私有槽，改为向家族桥接槽映射
  （`--xh-pin-input-box-*` 使用者槽全部保留）；自动填充仍由皮肤自写（家族规则命不中），但不再叠加落影。默认
  外观变化：outline 档格子不再带 `--xh-elevation-raised` 落影；当前格与聚焦格的描边一律
  `--xh-border-control-focus`，不再随 `tone`（subtle / ghost 的语气淡底改由家族 `--xh-_tone-subtle` 链给）；
  填满态品牌描边不变。label 的 `--xh-pin-input-label-font-size` 缺省改为 `--xh-text-label-size`（sm 13px → 14px、
  lg 16px → 14px）。

  **date-field 接入 Field Chrome 与 Action Control，默认去 raised 落影，清空钮改走 field-inset ghost 档，段位前景改
  淡底前景。** connect 在 control 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、
  缺省 `outline`）；段位是 div 而非原生输入，不投影 `data-xh-field-input`；clear-trigger 投影 `data-xh-action-control` +
  `field-inset` + `ghost` + `has-value` + size 与 `data-xh-action-has-value`。皮肤删除 control 自画盒与悬停 / 聚焦 /
  invalid / readonly / disabled 五态、三档 variant 块与 `--xh-_date-field-control-*` 形态私有槽，改为向家族桥接槽映射
  （`--xh-date-field-control-*` 使用者槽全部保留，`--xh-date-field-control-shadow` 缺省改为 `none`）。默认外观变化：
  outline 档不再带 `--xh-elevation-raised` 落影；焦点描边一律 `--xh-border-control-focus`，不再随 `tone`（subtle / ghost
  的语气淡底改由家族 `--xh-_tone-subtle` 链给）；disabled 描边由家族落 `--xh-border-default`；盒上的指针改为
  `default`（段位靠键盘编辑，不是文本光标）。清空钮由「`--xh-control-action-size` 方盒、control 圆角、悬停
  `--xh-bg-subtle-hover`（200）、按下 `--xh-bg-subtle-active`（300）」改为 field-inset 档正方盒（sm 24 / md 32 /
  lg 36px，compact 依令牌）、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压，
  粗指针命中区由家族伪元素外扩 44px；使用者槽 `--xh-date-field-action-bg`/`-bg-hover`/`-bg-active`/`-action-radius`
  保留为覆盖入口，`--xh-date-field-action-radius` 缺省由 `--xh-shape-control` 改为 `--xh-shape-inset`。当前段反白的
  前景由 `--xh-fg-brand` 改为 `--xh-fg-on-brand-subtle`（淡底前景一律 on-brand-subtle）。label 的私有
  `--xh-_date-field-label-font-size` 删除，`--xh-date-field-label-font-size` 缺省改为 `--xh-text-label-size`
  （sm 13px → 14px、lg 16px → 14px）。

  **time-field 接入 Field Chrome 与 Action Control，默认去 raised 落影，清空钮改走 field-inset ghost 档，段位前景改
  淡底前景。** connect 在 control 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、
  缺省 `outline`）；段位是 div 而非原生输入，不投影 `data-xh-field-input`；clear-trigger 投影 `data-xh-action-control` +
  `field-inset` + `ghost` + `has-value` + size 与 `data-xh-action-has-value`。皮肤删除 control 自画盒与悬停 / 聚焦 /
  invalid / readonly / disabled 五态、三档 variant 块与 `--xh-_time-field-control-*` 形态私有槽，改为向家族桥接槽映射
  （`--xh-time-field-control-*` 使用者槽全部保留，`--xh-time-field-control-shadow` 缺省改为 `none`）。默认外观变化：
  outline 档不再带 `--xh-elevation-raised` 落影；焦点描边一律 `--xh-border-control-focus`，不再随 `tone`（subtle / ghost
  的语气淡底改由家族 `--xh-_tone-subtle` 链给）；disabled 描边由家族落 `--xh-border-default`；盒上的指针改为
  `default`。段位悬停底由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100，白底承载阶梯）；当前段反白的前景由
  `--xh-fg-brand` 改为 `--xh-fg-on-brand-subtle`。清空钮由「`--xh-control-action-size` 方盒、control 圆角、悬停
  `--xh-bg-subtle-hover`（200）、按下 `--xh-bg-subtle-active`（300）」改为 field-inset 档正方盒（sm 24 / md 32 /
  lg 36px，compact 依令牌）、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压，
  粗指针命中区由家族伪元素外扩 44px；使用者槽 `--xh-time-field-action-bg`/`-bg-hover`/`-bg-active`/`-action-radius`
  保留为覆盖入口，`--xh-time-field-action-radius` 缺省由 `--xh-shape-control` 改为 `--xh-shape-inset`。label 的私有
  `--xh-_time-field-label-font-size` 删除，`--xh-time-field-label-font-size` 缺省改为 `--xh-text-label-size`
  （sm 13px → 14px、lg 16px → 14px）。

  **editable 接入 Field Chrome 与 Action Control，默认去 raised 落影，三颗动作钮改为 field-inset 正方盒。** connect
  在 control 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）与
  `data-readonly`，input 上投影 `data-xh-field-input` / `data-xh-field-layout="single-line"` / `data-readonly`，
  edit / submit / cancel 三颗钮投影 `data-xh-action-control` + `field-inset` + `ghost` + `always` + size。皮肤删除
  control 自画盒与悬停 / 聚焦 / invalid / readonly / disabled 五态、input 自写重置 / 五态 / 两条 autofill、三档
  variant 块与 `--xh-_editable-control-*` 形态私有槽，改为向家族桥接槽映射。默认外观变化：outline 档不再带
  `--xh-elevation-raised` 落影；聚焦与 invalid 不再换底（此前聚焦底 `--xh-bg-subtle`）；焦点描边一律
  `--xh-border-control-focus`，不再随 `tone`；disabled 描边由 `--xh-border-subtle` 改为家族的 `--xh-border-default`；
  control 不再 `overflow: hidden`（家族粗指针热区伪元素会被它裁掉）。三颗钮由「占满控件高度、圆角 0、悬停透明、
  按下 `--xh-bg-subtle-active`（300）」改为 field-inset 档正方盒（sm 24 / md 32 / lg 36px，compact 依令牌）、inset
  圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压，粗指针下不再放大真实按钮盒与
  控件最小高度，改由家族伪元素外扩 44px 命中区；动作组与内容段之间的半高分隔线改画在编辑钮 / 确认钮的
  `background-image` 上（`::after` 让给粗指针热区），RTL 由 `[dir='rtl']` 换边，forced-colors 用 `ButtonText` 重画。
  label 的私有 `--xh-_editable-label-font-size` 删除，`--xh-editable-label-font-size` 缺省改为 `--xh-text-label-size`
  （sm 13px → 14px、lg 16px → 14px）。公开覆盖槽退役：`--xh-editable-touch-target-size`（家族热区不读组件槽）、
  `--xh-editable-control-bg-focus`、`--xh-editable-control-bg-invalid`（家族聚焦与无效态不换底）、`--xh-editable-input-h`
  （盒内 input 由家族撑满控件高度）；新增 `--xh-editable-control-fg`、`--xh-editable-control-px`（缺省 0）、
  `--xh-editable-trigger-radius`；`--xh-editable-trigger-bg` / `-bg-hover` / `-bg-active` / `-bg-disabled` 改指向家族
  ghost 档桥接槽。

  **tags-input 接入 Field Chrome 与 Action Control，默认去 raised 落影，清空钮改走 field-inset ghost 档，键盘走到的
  标签改为当前项淡底。** connect 在 control 上投影 `data-xh-field-chrome` / `data-xh-field-size` /
  `data-xh-field-layout="multi-tag"` / `data-variant`（与 root 同源、缺省 `outline`），input 上投影
  `data-xh-field-input`（布局落在 control 上，不重复投影），clear-trigger 投影 `data-xh-action-control` +
  `field-inset` + `ghost` + `has-value` + size 与 `data-xh-action-has-value`。皮肤删除 control 自画盒与悬停 / 聚焦 /
  invalid / readonly / disabled 五态、input 自写重置 / 两条 autofill、三档 variant 块与 `--xh-_tags-input-control-*`
  形态私有槽，改为向家族桥接槽映射（`--xh-tags-input-control-*` 使用者槽保留，`--xh-tags-input-control-shadow`
  缺省改为 `none`）。默认外观变化：outline 档不再带 `--xh-elevation-raised` 落影；焦点描边一律
  `--xh-border-control-focus`，不再随 `tone`（subtle / ghost 的语气淡底改由家族 `--xh-_tone-subtle` 链给）；disabled
  描边由家族落 `--xh-border-default`；纵向内衬由 `--xh-space-0_5` 改为家族 multi-tag 布局的 `--xh-space-1`，
  **公开覆盖槽 `--xh-tags-input-control-py` 退役**（纵向内衬由家族布局给，不再读组件槽）；新增
  `--xh-tags-input-input-fg`。键盘走到的标签（`data-highlighted`）由品牌实心 `--xh-bg-brand` + `--xh-fg-on-brand`
  改为当前项淡底 `--xh-bg-brand-subtle` + `--xh-fg-on-brand-subtle`（写了 `tone` 时取 `--xh-_tone-subtle` /
  `--xh-_tone-fg`），删除钮字色随之换成淡底前景；就地编辑框的焦点环改直接取 `--xh-ring-focus`，invalid 时
  `--xh-ring-invalid`。清空钮由「`--xh-control-action-size` 方盒、control 圆角、悬停 `--xh-bg-subtle-hover`（200）、
  按下 `--xh-bg-subtle-active`（300）」改为 field-inset 档正方盒（sm 24 / md 32 / lg 36px，compact 依令牌）、inset
  圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压，粗指针命中区由家族伪元素外扩
  44px；`--xh-tags-input-action-radius` 缺省由 `--xh-shape-control` 改为 `--xh-shape-inset`。label 的私有
  `--xh-_tags-input-label-font-size` 删除，`--xh-tags-input-label-font-size` 缺省改为 `--xh-text-label-size`
  （sm 13px → 14px、lg 16px → 14px）。

  **mention 输入框接入 Field Chrome，默认去 raised 落影；候选行接入 Collection Item，补上按下面。** connect 在
  input 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-xh-field-layout="single-line"` / `data-variant`
  （与 root 同源、缺省 `outline`）与 `data-readonly`；输入框自身就是视觉盒，不投影 `data-xh-field-input`。item 投影
  `data-xh-collection-item` / `data-xh-collection-size` / `data-xh-collection-context="overlay"`，item-text 投影
  `data-xh-collection-slot="text"`。皮肤删除 input 自画盒与悬停 / 聚焦 / invalid / readonly / disabled 五态、三档
  variant 块与 `--xh-_mention-input-*` 形态私有槽，改为向家族桥接槽映射（`--xh-mention-input-*` 使用者槽保留，
  `--xh-mention-input-shadow` 缺省改为 `none`）；自动填充仍由皮肤自写（家族按 input 角色给的规则命不中），不再叠
  落影。默认外观变化：outline 档不再带 `--xh-elevation-raised` 落影；焦点描边一律 `--xh-border-control-focus`，不再
  随 `tone`；disabled 描边由家族落 `--xh-border-default`。候选行删除自写的网格 / 内衬 / 圆角 / 字色 / 高亮底 / 禁用
  色，改为映射家族桥接槽：悬停与高亮 `--xh-bg-subtle`（100）不变，新增按下 `--xh-bg-subtle-hover`（200）与按压时长
  （此前零 `:active` 面）；新增 `--xh-mention-item-bg-pressed` 覆盖槽。候选面加 `overscroll-behavior: contain`；三端
  自绘条改传 `size: 'sm'`，条子厚度由 6px 改为浮层 4px 档。label 的 `--xh-mention-label-font-size` 缺省由随档的
  `--xh-_mention-font-size` 改为 `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

  **combobox 接入 Field Chrome / Action Control / Collection Item，默认去 raised 落影，`data-multiline` 视觉钩子与
  `--xh-combobox-control-py` 槽退役。** connect 在 control 上投影 `data-xh-field-chrome` / `data-xh-field-size` /
  `data-variant`（与 root 同源、缺省 `outline`）；input 投影 `data-xh-field-input` 与 `data-xh-field-layout`
  （单行 `single-line`、textarea 宿主 `textarea`），旧 `data-multiline` 属性不再产出，自定义皮肤改读布局值，不提供
  双写兼容。trigger（展开钮，`display="always"`）与 clear-trigger（`display="has-value"` + `data-xh-action-has-value`）
  投影 field-inset ghost 档；item 投影 `data-xh-collection-item` / `-size` / `-context="overlay"`，item-text 与
  item-indicator 各投影 `data-xh-collection-slot`。皮肤删除 control 自画盒与悬停 / 聚焦 / invalid / readonly /
  disabled 五态、三档 variant 块与 `--xh-_combobox-control-*` 形态私有槽，改为映射家族桥接槽（`--xh-combobox-control-*`
  使用者槽保留，`--xh-combobox-control-shadow` 缺省改为 `none`）；多行宿主的 `padding-block` 由家族 textarea 布局给
  （写在 textarea 自身），`--xh-combobox-control-py` 槽删除。input 删除自写重置、占位与两条 autofill，改映射
  `--xh-field-input-*` / `--xh-field-placeholder-fg` / `--xh-field-autofill-*`，新增 `--xh-combobox-input-fg` 覆盖槽。
  默认外观变化：outline 档不再带 `--xh-elevation-raised` 落影；焦点描边一律 `--xh-border-control-focus`，不再随
  `tone`；disabled 描边由家族落 `--xh-border-default`。展开钮与清空钮由「`--xh-control-action-size` 方盒、control
  圆角、悬停 `--xh-bg-subtle-hover`（200）、按下 `--xh-bg-subtle-active`（300）」改为 field-inset 档正方盒
  （sm 24 / md 32 / lg 36px）、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97
  按压，粗指针命中区由家族伪元素外扩；`--xh-combobox-action-radius` 缺省由 `--xh-shape-control` 改为
  `--xh-shape-inset`。候选行删除自写的排布 / 内衬 / 圆角 / 字色 / 高亮底 / 禁用色，改为映射家族桥接槽：悬停与高亮
  `--xh-bg-subtle`（100）不变，新增按下 `--xh-bg-subtle-hover`（200）与按压时长（此前零 `:active` 面）；新增
  `--xh-combobox-item-bg-pressed` 与 `--xh-combobox-item-check-fg` 覆盖槽（旧 `--xh-combobox-item-indicator-fg`
  留在兜底位）；对号显隐由家族按 `aria-selected` 给。候选面加 `overscroll-behavior: contain`；三端自绘条改传
  `size: 'sm'`，条子厚度由 6px 改为浮层 4px 档。label 的 `--xh-combobox-label-font-size` 缺省由随档的
  `--xh-_combobox-label-font-size` 改为 `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

  **select 接入 Field Chrome 与 Action Control，默认去 raised 落影，列表接自绘条。** connect 在 control 上投影
  `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；trigger 是撑满盒的
  按钮，不投影 `data-xh-field-input`；clear-trigger 投影 field-inset ghost 档（`display="has-value"` +
  `data-xh-action-has-value`）。皮肤删除 control 自画盒与悬停 / invalid / 聚焦 / readonly / disabled 五态、三档 variant
  块与 `--xh-_select-control-*` 形态私有槽，改为映射家族桥接槽（`--xh-select-control-*` 使用者槽保留，
  `--xh-select-control-shadow` 缺省改为 `none`，盒上指针 `pointer`）。默认外观变化：不写 variant 时描边由透明改为
  `--xh-border-control`（与 outline 档逐值相同），不再带 `--xh-elevation-raised` 落影；焦点描边一律
  `--xh-border-control-focus`，不再随 `tone`；disabled 描边由家族落 `--xh-border-default`。清空钮由
  「`--xh-control-action-size` 方盒、control 圆角、悬停 `--xh-bg-subtle-hover`（200）、按下 `--xh-bg-subtle-active`
  （300）」改为 field-inset 档正方盒（sm 24 / md 32 / lg 36px）、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下
  `--xh-bg-subtle-hover`（200）+ 0.97 按压，粗指针命中区由家族伪元素外扩；`--xh-select-action-radius` 缺省由
  `--xh-shape-control` 改为 `--xh-shape-inset`。list 三端接入自绘条（壳 positioner、浮层 4px 档）并加
  `overscroll-behavior: contain`；Vue / React 的 select 上下文新增 `controlRef` / `listRef`，层分支由 `[trigger]`
  改为 `[control, positioner]`（点清空钮与按住条子都算层内交互）。label 的 `--xh-select-label-font-size` 缺省由
  随档的 `--xh-_select-label-font-size` 改为 `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

  **tree-select 接入 Field Chrome / Action Control / Collection Item，默认去 raised 落影，
  `--xh-tree-select-item-selected-font-weight` 改名 `--xh-tree-select-item-font-weight-selected`。** connect 在
  control 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；
  clear-trigger 投影 field-inset ghost 档（`display="has-value"` + `data-xh-action-has-value`）；叶子 item 与分支
  branch-control 都投影 `data-xh-collection-item` / `-size` / `-context="overlay"`，item-text / branch-text 投影
  `data-xh-collection-slot="text"`，item-indicator 投影 `"indicator"`，branch-trigger / branch-indicator 投影
  `"prefix"`。皮肤删除 control 自画盒与五态、三档 variant 块与 `--xh-_tree-select-border/-bg/-shadow/-ring` 形态私有
  槽，改为映射家族桥接槽（`--xh-tree-select-control-*` 使用者槽保留，`--xh-tree-select-control-shadow` 缺省改为
  `none`，盒上指针 `pointer`）。默认外观变化：outline 档不再带 `--xh-elevation-raised` 落影；焦点描边一律
  `--xh-border-control-focus`，不再随 `tone`；disabled 描边由家族落 `--xh-border-default`。清空钮由
  「`--xh-control-action-size` 方盒、control 圆角、悬停 200、按下 300」改为 field-inset 档正方盒、inset 圆角、
  悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压；`--xh-tree-select-action-radius`
  缺省由 `--xh-shape-control` 改为 `--xh-shape-inset`。树行删除自写的排布 / 高亮底 / 选中字色字重 / 禁用色，改为
  映射家族桥接槽：悬停与高亮 `--xh-bg-subtle`（100）不变，新增按下 `--xh-bg-subtle-hover`（200）与按压时长
  （此前零 `:active` 面）；叶子的层级缩进由 `padding-inline-start` 改为家族网格首列的占位伪元素（文字起点不变）；
  新增 `--xh-tree-select-item-bg-pressed` 与 `--xh-tree-select-item-check-fg` 覆盖槽（旧
  `--xh-tree-select-item-indicator-fg` 留在兜底位）；分支行的选中对号与半选横线仍按 `data-selected` /
  `data-indeterminate` 显形；懒分支取数失败（`data-error`）的行面映射回常态，不引入家族告警面，该行仍可激活
  （Enter / 点行重试），悬停与键盘高亮 100、按下 200 与键盘焦点环由皮肤在家族解算点上接回。content 加
  `overscroll-behavior: contain`；三端自绘条改传 `size: 'sm'`，条子厚度由 6px 改为浮层 4px 档。label 的
  `--xh-tree-select-label-font-size` 缺省由随档的私有槽改为 `--xh-text-label-size`（sm 13px → 14px、
  lg 16px → 14px）。

  **cascader 接入 Field Chrome / Action Control / Collection Item，默认去 raised 落影，
  `--xh-cascader-item-selected-font-weight` 改名 `--xh-cascader-item-font-weight-selected`。** connect 在 control
  上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；
  clear-trigger 投影 field-inset ghost 档（`display="has-value"` + `data-xh-action-has-value`）；列内 item 与搜索
  search-item 都投影 `data-xh-collection-item` / `-size` / `-context="overlay"`，item-text 投影
  `data-xh-collection-slot="text"`，item-indicator 投影 `"indicator"`。皮肤删除 control 自画盒与五态、三档 variant
  块与 `--xh-_cascader-border/-bg/-shadow/-ring` 形态私有槽，改为映射家族桥接槽（`--xh-cascader-control-*`
  使用者槽保留，`--xh-cascader-control-shadow` 缺省改为 `none`，盒上指针 `pointer`）。默认外观变化：outline 档
  不再带 `--xh-elevation-raised` 落影；焦点描边一律 `--xh-border-control-focus`，不再随 `tone`；disabled 描边由
  家族落 `--xh-border-default`。清空钮由「`--xh-control-action-size` 方盒、control 圆角、悬停 200、按下 300」改为
  field-inset 档正方盒、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97
  按压；`--xh-cascader-action-radius` 缺省由 `--xh-shape-control` 改为 `--xh-shape-inset`。列内条目删除自写的
  排布 / 高亮底 / 展开路径底 / 选中字色字重 / 禁用色，改为映射家族桥接槽：悬停与高亮 `--xh-bg-subtle`（100）、
  展开路径 `--xh-cascader-item-bg-active` 缺省 `--xh-bg-subtle`（与悬停同档）不变，新增按下
  `--xh-bg-subtle-hover`（200）与按压时长（此前零 `:active` 面）；分支箭头落在家族网格的 suffix 列；新增
  `--xh-cascader-item-bg-pressed` 与 `--xh-cascader-item-check-fg` 覆盖槽（旧 `--xh-cascader-item-indicator-fg`
  留在兜底位）。搜索候选没有正文部件，行保持块级排版、对号仍在末端预留轨内绝对定位，状态面同走家族。
  content / column / search-list 加 `overscroll-behavior: contain`；content 横向自绘条改传 `size: 'sm'`
  （浮层 4px 档）；每一列与搜索列表各自接一路贴层（`anchor: 'layer'`）的自绘竖条，条子节点紧跟在该列 /
  列表之后、贴其行内末端，列的原生细条随之隐藏，列间分隔线改按 `column ~ column` 取后续列；content 上声明
  `--xh-scrollbar-track-bg: transparent`。label 的 `--xh-cascader-label-font-size` 缺省由随档的私有槽改为
  `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

  **date-picker 接入 Field Chrome / Action Control / Collection Item，浮层改 floating 材质，去 raised 落影，
  `--xh-date-picker-content-highlight` / `--xh-date-picker-content-backdrop` 槽退役。** connect 在 control 上投影
  `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；trigger（日历钮，
  `display="always"`）与 clear-trigger（`display="has-value"` + `data-xh-action-has-value`）投影 field-inset ghost 档；
  confirm-trigger 投影 Action Control `profile="text"` / `variant="solid"`（面板内唯一主要动作，固定 sm 档）；preset
  与 time-item 投影 `data-xh-collection-item` / `-size` / `-context="overlay"`。皮肤删除 control 自画盒与五态、
  三档 variant 块与 `--xh-_date-picker-control-*` 形态私有槽，改为映射家族桥接槽（`--xh-date-picker-control-*`
  使用者槽保留，`--xh-date-picker-control-shadow` 缺省改为 `none`，盒上指针 `default`）。默认外观变化：outline 档
  描边由透明改为 `--xh-border-control`，不再带 `--xh-elevation-raised` 落影；焦点描边一律 `--xh-border-control-focus`，
  不再随 `tone`；打开中的 control 不再另画焦点环；disabled 描边由家族落 `--xh-border-default`；段位反白前景由
  `--xh-fg-brand` 改为 `--xh-fg-on-brand-subtle`。日历钮与清空钮由「`--xh-control-action-size` 方盒、control 圆角、
  悬停 200、按下 300、打开中 300」改为 field-inset 档正方盒、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下
  `--xh-bg-subtle-hover`（200）+ 0.97 按压，打开中与悬停同档；`--xh-date-picker-action-radius` 缺省由
  `--xh-shape-control` 改为 `--xh-shape-inset`。确认钮的品牌实心、悬停 / 按下 / 按压 / 焦点环改由家族 solid 档给，
  `--xh-date-picker-confirm-trigger-shadow` 缺省由内高光改为 `none`。浮层 content 由「`--xh-border-subtle` 描边 +
  frosted 落影 + 透明顶光」改为 floating 三件套：`--xh-border-default` 描边 + `--xh-bg-surface` 底 +
  `--xh-elevation-floating` 落影，顶光伪元素与 backdrop 两行删除，`--xh-date-picker-content-highlight` /
  `--xh-date-picker-content-backdrop` 槽删除。time-item 选中面由「`--xh-bg-brand-subtle` 底 + `--xh-fg-brand` 字 +
  medium 字重」改为透明底 + 末端对号、正文与字重保持 rest（§7.3 浮层瞬态集合）；preset 与 time-item 新增按下
  `--xh-bg-subtle-hover`（200）与按压时长（此前零 `:active` 面），新增 `--xh-date-picker-preset-bg-pressed` /
  `--xh-date-picker-time-item-bg-pressed` 覆盖槽。content / preset-group / time-column 加
  `overscroll-behavior: contain`；三端自绘条改传 `size: 'sm'` 并补横轴（皮肤 `overflow: auto` 两轴都滚）；preset-group
  （竖 + 横）与每一 time-column（竖）各自接一路贴层（`anchor: 'layer'`）的自绘条，条子节点紧跟在该列之后、贴其盒子，
  列的原生细条随之隐藏，content 上声明 `--xh-scrollbar-track-bg: transparent`，选项列与日历之间的空当改按
  `preset-group ~ calendar` 取。time-item 的行字色与字重改按值选择族同一套映射：新增
  `--xh-date-picker-time-item-fg`（rest 字色，缺省家族行字色 `--xh-material-frosted-fg`，各主题与 forced-colors 下
  与 `--xh-fg-default` 同值）与 `--xh-date-picker-time-item-font-weight-selected`（缺省 regular）覆盖槽。label 的
  `--xh-date-picker-label-font-size` 缺省由随档的私有槽改为 `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

  **date-range-picker 接入 Field Chrome / Action Control / Collection Item，浮层改 floating 材质，去 raised 落影，
  `--xh-date-range-picker-content-highlight` / `--xh-date-range-picker-content-backdrop` 槽退役。** connect 在
  control 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；
  trigger（日历钮，`display="always"`）与 clear-trigger（`display="has-value"` + `data-xh-action-has-value`）投影
  field-inset ghost 档；preset 投影 `data-xh-collection-item` / `-size` / `-context="overlay"`。皮肤删除 control
  自画盒与五态、三档 variant 块与 `--xh-_date-range-picker-control-*` 形态私有槽，改为映射家族桥接槽
  （`--xh-date-range-picker-control-*` 使用者槽保留，`--xh-date-range-picker-control-shadow` 缺省改为 `none`，盒上
  指针 `default`）。默认外观变化：outline 档描边由透明改为 `--xh-border-control`，不再带 `--xh-elevation-raised`
  落影；焦点描边一律 `--xh-border-control-focus`，不再随 `tone`；打开中的 control 不再另画焦点环；disabled 描边由
  家族落 `--xh-border-default`；两组段位的反白前景由 `--xh-fg-brand` 改为 `--xh-fg-on-brand-subtle`。日历钮与清空钮
  由「`--xh-control-action-size` 方盒、control 圆角、悬停 200、按下 300、打开中 300」改为 field-inset 档正方盒、
  inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压，打开中与悬停同档；
  `--xh-date-range-picker-action-radius` 缺省由 `--xh-shape-control` 改为 `--xh-shape-inset`。浮层 content 由
  「`--xh-border-subtle` 描边 + frosted 落影 + 透明顶光」改为 floating 三件套：`--xh-border-default` 描边 +
  `--xh-bg-surface` 底 + `--xh-elevation-floating` 落影，顶光伪元素与 backdrop 两行删除，
  `--xh-date-range-picker-content-highlight` / `--xh-date-range-picker-content-backdrop` 槽删除。preset 新增按下
  `--xh-bg-subtle-hover`（200）与按压时长（此前零 `:active` 面），新增 `--xh-date-range-picker-preset-bg-pressed`
  覆盖槽。content 与 preset-group 加 `overscroll-behavior: contain`；三端 content 自绘条改传 `size: 'sm'` 并补横轴
  （皮肤 `overflow: auto` 两轴都滚）；preset-group 接一路贴层（`anchor: 'layer'`，竖 + 横）的自绘条，条子节点紧跟
  在该列之后、贴其盒子，列的原生细条随之隐藏，content 上声明 `--xh-scrollbar-track-bg: transparent`，选项列与
  日历之间的空当改按 `preset-group ~ calendar` 取；Vue 的 `XhDateRangePickerPresetGroup` 因此以片段作根，直通属性由
  组件自己接住落到列节点。label 的 `--xh-date-range-picker-label-font-size` 缺省由随档的私有槽改为
  `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

  **time-picker 接入 Field Chrome / Action Control / Collection Item，浮层改 floating 材质，去 raised 落影，
  时间格选中只留对号，`--xh-time-picker-content-highlight` / `-backdrop` 与 `--xh-time-picker-item-bg-checked` /
  `-bg-checked-hover` / `-fg-checked` / `-weight-checked` 槽退役。** connect 在 control 上投影 `data-xh-field-chrome`
  / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；trigger（展开钮，`display="always"`）与
  clear-trigger（`display="has-value"` + `data-xh-action-has-value`）投影 field-inset ghost 档；preset 与 item 投影
  `data-xh-collection-item` / `-size` / `-context="overlay"`。皮肤删除 control 自画盒与五态、三档 variant 块与
  `--xh-_time-picker-control-*` 形态私有槽，改为映射家族桥接槽（`--xh-time-picker-control-*` 使用者槽保留，
  `--xh-time-picker-control-shadow` 缺省改为 `none`，盒上指针 `default`）。默认外观变化：outline 档描边由透明改为
  `--xh-border-control`，不再带 `--xh-elevation-raised` 落影；焦点描边一律 `--xh-border-control-focus`，不再随
  `tone`；打开中的 control 不再另画焦点环；disabled 描边由家族落 `--xh-border-default`；段位反白前景由
  `--xh-fg-brand` 改为 `--xh-fg-on-brand-subtle`，段位悬停底由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`
  （100，canvas 承载）。展开钮与清空钮由「`--xh-control-action-size` 方盒、control 圆角、悬停 200、按下 300、打开中
  300」改为 field-inset 档正方盒、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+
  0.97 按压，打开中与悬停同档；`--xh-time-picker-action-radius` 缺省由 `--xh-shape-control` 改为 `--xh-shape-inset`。
  浮层 content 由「`--xh-border-subtle` 描边 + frosted 落影 + 透明顶光」改为 floating 三件套：`--xh-border-default`
  描边 + `--xh-bg-surface` 底 + `--xh-elevation-floating` 落影，顶光伪元素与 backdrop 两行删除，
  `--xh-time-picker-content-highlight` / `--xh-time-picker-content-backdrop` 槽删除。item 选中面由
  「`--xh-bg-brand-subtle` 底 + `--xh-fg-brand` 字 + medium 字重」改为透明底 + 末端对号、正文与字重保持 rest
  （§7.3 浮层瞬态集合）：`--xh-time-picker-item-bg-checked` / `-bg-checked-hover` / `-weight-checked` 槽删除，
  `--xh-time-picker-item-fg-checked` 改名为 `--xh-time-picker-item-fg-selected`（与值选择族同名），新增
  `--xh-time-picker-item-font-weight-selected`（缺省 regular）；item 的 rest 字色缺省由 `--xh-fg-default` 改为家族
  行字色 `--xh-material-frosted-fg`（各主题与 forced-colors 下同值）。preset 与 item 新增按下 `--xh-bg-subtle-hover`
  （200）与按压时长（此前零 `:active` 面），新增 `--xh-time-picker-preset-bg-pressed` / `--xh-time-picker-item-bg-pressed`
  覆盖槽。preset-group 与各 column 加 `overscroll-behavior: contain`，各自接一路贴层（`anchor: 'layer'`，竖）的
  自绘条：条子节点紧跟在该列之后、贴其盒子，列的原生细条随之隐藏，content 上声明
  `--xh-scrollbar-track-bg: transparent`，列与列之间的分隔线改按 `column ~ column` 取；Vue 的
  `XhTimePickerPresetGroup` / `XhTimePickerColumn` 因此以片段作根，直通属性由组件自己接住落到列节点。label 的
  `--xh-time-picker-label-font-size` 缺省由随档的私有槽改为 `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

  **time-range-picker 接入 Field Chrome / Action Control / Collection Item，浮层改 floating 材质，去 raised 落影，
  时间格选中只留对号，`--xh-time-range-picker-content-highlight` / `-backdrop` 与 `--xh-time-range-picker-item-bg-checked`
  / `-bg-checked-hover` / `-fg-checked` / `-weight-checked` 槽退役。** 与 time-picker 同构：connect 在 control 上投影
  `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；trigger（展开钮，
  `display="always"`）与 clear-trigger（`display="has-value"` + `data-xh-action-has-value`）投影 field-inset ghost
  档；preset 与 item 投影 `data-xh-collection-item` / `-size` / `-context="overlay"`。皮肤删除 control 自画盒与
  五态、三档 variant 块与 `--xh-_time-range-picker-control-*` 形态私有槽，改为映射家族桥接槽
  （`--xh-time-range-picker-control-*` 使用者槽保留，`--xh-time-range-picker-control-shadow` 缺省改为 `none`，盒上
  指针 `default`）。默认外观变化：outline 档描边由透明改为 `--xh-border-control`，不再带 `--xh-elevation-raised`
  落影；焦点描边一律 `--xh-border-control-focus`，不再随 `tone`；打开中的 control 不再另画焦点环；disabled 描边由
  家族落 `--xh-border-default`；两组段位的反白前景由 `--xh-fg-brand` 改为 `--xh-fg-on-brand-subtle`，段位悬停底由
  `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100）。展开钮与清空钮由「`--xh-control-action-size` 方盒、
  control 圆角、悬停 200、按下 300、打开中 300」改为 field-inset 档正方盒、inset 圆角、悬停 `--xh-bg-subtle`（100）、
  按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压，打开中与悬停同档；`--xh-time-range-picker-action-radius` 缺省由
  `--xh-shape-control` 改为 `--xh-shape-inset`。浮层 content 由「`--xh-border-subtle` 描边 + frosted 落影 + 透明
  顶光」改为 floating 三件套：`--xh-border-default` 描边 + `--xh-bg-surface` 底 + `--xh-elevation-floating` 落影，
  顶光伪元素与 backdrop 两行删除，`--xh-time-range-picker-content-highlight` / `--xh-time-range-picker-content-backdrop`
  槽删除。item 选中面由「`--xh-bg-brand-subtle` 底 + `--xh-fg-brand` 字 + medium 字重」改为透明底 + 末端对号、
  正文与字重保持 rest（§7.3 浮层瞬态集合）：`--xh-time-range-picker-item-bg-checked` / `-bg-checked-hover` /
  `-weight-checked` 槽删除，`--xh-time-range-picker-item-fg-checked` 改名为 `--xh-time-range-picker-item-fg-selected`
  （与值选择族同名），新增 `--xh-time-range-picker-item-font-weight-selected`（缺省 regular）；item 的 rest 字色缺省由
  `--xh-fg-default` 改为家族行字色 `--xh-material-frosted-fg`（各主题与 forced-colors 下同值）。preset 与 item 新增
  按下 `--xh-bg-subtle-hover`（200）与按压时长（此前零 `:active` 面），新增 `--xh-time-range-picker-preset-bg-pressed`
  / `--xh-time-range-picker-item-bg-pressed` 覆盖槽。content（横向）、preset-group 与各 column 加
  `overscroll-behavior: contain`；content 的横向自绘条三端接在浮层壳上（`size: 'sm'`，浮层壳记进层分支），
  preset-group 与各 column 各接一路贴层（`anchor: 'layer'`，竖）的自绘条：条子节点紧跟在该列之后、贴其盒子，列的
  原生细条随之隐藏，positioner 与 content 上声明 `--xh-scrollbar-track-bg: transparent`，列与列之间的分隔线改按
  `column ~ column` 取；Vue 的 `XhTimeRangePickerPresetGroup` / `XhTimeRangePickerColumn` 因此以片段作根，直通属性
  由组件自己接住落到列节点。label 的 `--xh-time-range-picker-label-font-size` 缺省由随档的私有槽改为
  `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

  **input-group 组壳改为字段描边式，去 raised 落影。** 组壳（root 的 `::before` 外轮廓）静息描边由 `--xh-border-subtle`
  改为 `--xh-border-control`、悬停由 `--xh-border-default` 改为 `--xh-border-control-hover`；`--xh-input-group-shadow`
  缺省由 `--xh-elevation-raised` 改为 `none`（槽保留）。`subtle` 档悬停浮出的描边由 `--xh-border-default` 改为
  `--xh-border-control`，`ghost` 档悬停同样浮出 `--xh-border-control`（此前 ghost 悬停边取基础规则的
  `--xh-border-default`）。子字段压平规则以 `[data-xh-field-chrome]` 为键，接入家族的字段在组内自动压平为透明，
  不另画一层。

  **prompt-input 接入 Field Chrome 与 Action Control，去 soft 材质与顶光 / 背景模糊，输入段改透明。** connect 在 root
  上投影 `data-xh-field-chrome` / `data-xh-field-size`（缺省 `md`，`data-variant` 已缺省 `outline`），input 投影
  `data-xh-field-input`（刻意不投影 `data-xh-field-layout`），submit-trigger 投影 Action Control `profile="text"` /
  `display="always"` / `size`，`variant` 按 loading 在 `solid`（发送，与 Button 缺省同为品牌实心）与 `subtle`（停止，
  中性淡底）间切换，并与原生 `disabled` 同步投影 `data-disabled`。皮肤删除 root 的 soft 材质私有槽、渐变顶光、
  backdrop 两行、自写 hover / focus-within / disabled 与三档 variant 块，改为映射家族桥接槽（`--xh-prompt-input-bg`
  / `-bg-hover` / `-bg-disabled` / `-border` / `-border-hover` / `-border-focus` / `-shadow` / `-radius` / `-p` /
  `-gap` / `-icon-size` 使用者槽保留为第一参数，`--xh-prompt-input-shadow` 缺省改为 `none`，`--xh-field-control-height`
  落 `auto` 随内容长高）。默认外观变化：root 由「M1 soft 底 + soft 描边 + 顶光 + 背景模糊 + soft 落影」（outline
  档已是 canvas + border-control）改为家族描边式，全部三档不再有落影与顶光；焦点描边一律 `--xh-border-control-focus`，
  不再随 `tone`；disabled 描边由家族落 `--xh-border-default`；生成中（`data-loading`）外框仍保持默认前景与文本光标。
  textarea 由「`--xh-material-soft-focus-surface` 实体阅读底 + `--xh-material-soft-fg` 字」改为透明底 + `--xh-fg-default`
  字（`--xh-prompt-input-input-fg` / `-input-font-size` / `-placeholder-fg` / `-input-autofill-bg` / `-input-autofill-fg`
  使用者槽保留，自动填充底缺省改为 `--xh-bg-canvas`）。发送钮的品牌实心 / 悬停 / 按下 / 0.97 按压 / 焦点环 / 禁用面
  改由家族 text solid 档给（`--xh-prompt-input-send-bg*` / `-send-fg` / `-send-bg-off` / `-stop-bg*` / `-stop-fg` /
  `-submit-px` / `-submit-radius` / `-submit-shadow` / `-submit-font-size` / `-submit-font-weight` 使用者槽保留），
  停止身份的悬停 / 按下由自写 200 / 300 改为家族 subtle 档 200 / 300。

  **field 的 control 接入 Field Chrome，去 raised 落影、加描边。** connect 在 control（作者自己的原生控件）上投影
  `data-xh-field-chrome` / `data-xh-field-size="md"` / `data-variant="outline"`（Field 没有 size / variant 轴，固定投这
  两档），控件自身即视觉盒。皮肤删除 control 自写的边、底、影、圆角、outline、transition 与 hover / focus-visible /
  invalid / disabled 四条规则，改为映射家族桥接槽：`--xh-field-control-h` / `-px` / `-bg` / `-bg-hover` / `-bg-disabled`
  / `-fg` / `-border` / `-border-hover` / `-border-focus` / `-border-invalid` / `-shadow` / `-radius` / `-font-size`
  使用者槽保留，新增 `--xh-field-control-bg-readonly`（只读底，缺省 `--xh-bg-subtle`）；`--xh-field-control-ring` 槽删除
  （焦点环一律公共 `--xh-ring-focus`）。默认外观变化：静息由「透明边 + `--xh-elevation-raised` 落影」改为
  `--xh-border-control` 描边 + `--xh-bg-canvas` 底 + 无影（`--xh-field-control-shadow` 缺省改为 `none`）；悬停描边由
  `--xh-border-default` 改为 `--xh-border-control-hover`；焦点描边一律 `--xh-border-control-focus`，不再随 `tone`；
  只读换 `--xh-bg-subtle` 底；禁用由家族落 `--xh-border-default` 描边 + `--xh-bg-subtle` 底 + `--xh-fg-disabled`。
  Vue / React 的 `XhFieldControl` 把属性合并到自带解剖的子节点（库内薄封装或写了 `data-scope` 的元素）时，与
  `data-scope` / `data-part` 一并剔除家族标记（`data-xh-*`）与 `data-variant`，封装根上不会再套一层字段外壳、作者在
  封装上写的形态也不被盖掉；`useFieldControl` 同样只交出接线属性。Web Components 的 `<xh-field>` 把 control 属性直接
  打在作者标出的节点上：`control` 应标在真控件（`<input>` / `<textarea>` / `<select>`）上，标在包裹层上会在真控件外
  多出一层外壳。

  **form 的提交 / 重置钮接入 Action Control，错误摘要去 raised 落影。** connect 在 submit-trigger 上投影
  `data-xh-action-control` / `profile="text"` / `variant="solid"`（表单提交是主要动作，与 Button 缺省同为品牌实心）/
  `display="always"` / `size="md"`，reset-trigger 同样投影但 `variant="outline"`（非 Button 的触发器缺省中性描边）。
  皮肤删除两颗钮自写的盒、底、边、字体、transition、hover / active / 缩放 / disabled 与提交钮的品牌底 / 高光规则，
  改为映射家族桥接槽（`--xh-form-trigger-h` / `-px` / `-radius` / `-font-size` / `-bg` / `-bg-hover` / `-bg-active` /
  `-bg-disabled` / `-fg` / `-border` / `-border-hover` / `-border-disabled` 与 `--xh-form-submit-bg` / `-bg-hover` /
  `-bg-active` / `-fg` / `-border` / `-border-hover` / `-border-active` / `-shadow` 使用者槽保留为第一参数）。默认外观
  变化：重置钮由「`--xh-bg-subtle` 淡底 + `--xh-border-control` 描边、悬停 200 / 按下 300」改为透明底 +
  `--xh-border-control` 描边、悬停 `--xh-bg-subtle`（100）/ 按下 `--xh-bg-subtle-hover`（200）；提交钮的品牌实心、
  悬停 / 按下、0.97 按压、currentColor 焦点环与顶边内高光改由家族给，禁用面由家族落 `--xh-bg-subtle` 底 +
  `--xh-fg-disabled`（`--xh-form-trigger-bg-disabled` / `-border-disabled` 仍可覆盖）；error-summary 的
  `--xh-form-summary-shadow` 缺省由 `--xh-elevation-raised` 改为 `none`（静态反馈面只靠描边分层）。

  **fieldset 的组标题归集合标题角色。** legend 的 `--xh-fieldset-legend-fg` 缺省由 `--xh-fg-default` 改为
  `--xh-fg-muted`（§6.4 集合标题：`--xh-fg-muted`，与组 `--xh-space-2`，字号字重同字段标签）；无效 / 禁用 /
  必填星、说明与错误文案不变。

  **field-array 的四颗把手接入 Action Control，阶梯改 100 / 200。** connect 在 item-delete-trigger /
  move-up-trigger / move-down-trigger 上投影 `data-xh-action-control` / `profile="icon"` / `variant="ghost"` /
  `display="always"` / `size="xs"`（24px 正方盒，与此前 `--xh-control-action-size` 同尺寸），add-trigger 投影
  `profile="text"` / `variant="outline"` / `display="always"` / `size="md"`。皮肤删除四颗钮自写的盒、底、边、字体、
  transition、hover / active / 缩放 / `[aria-disabled]` 规则，改为映射家族桥接槽（`--xh-field-array-trigger-size` /
  `-radius` / `-bg` / `-bg-hover` / `-bg-active` / `-fg` / `-fg-hover` / `-font-size`、`--xh-field-array-item-delete-fg-hover`、
  `--xh-field-array-add-height` / `-px` / `-radius` / `-bg` / `-bg-hover` / `-bg-active` / `-fg` / `-border` /
  `-border-hover` / `-border-disabled` / `-font-size`、`--xh-field-array-action-gap` 使用者槽保留为第一参数）；
  add-trigger 保留 `border-style: dashed`。默认外观变化：三颗行内把手与新增钮的悬停由 `--xh-bg-subtle-hover`（200）
  改为 `--xh-bg-subtle`（100）、按下由 `--xh-bg-subtle-active`（300）改为 `--xh-bg-subtle-hover`（200）（白底承载
  阶梯）；`--xh-field-array-icon-size` 由 root 上的 `--xh-glyph-size-text`（随文 1em）改为各钮按档取
  `--xh-_action-profile-glyph-size`（行内把手 16px、新增钮 20px），只在四颗钮上生效；粗指针下四颗钮由家族
  外扩 44px 热区；禁用面由家族按 `data-disabled` 给（透明底 + `--xh-fg-disabled`，新增钮描边 `--xh-border-subtle`）。

  **card 的 outline 卡面补 `--xh-border-default` 描边，subtle 去落影，标题与说明按 Surface 排版档。**
  `--xh-card-border` 缺省由 `transparent` 改为 `--xh-border-default`（Card 是唯一登记 raised 的静态面，raised
  必带描边，边界由描边承担、落影只是抬起的加成）；subtle 档改为 `--xh-bg-subtle` 淡底 + 透明占位边 + 无影
  （`--xh-card-shadow` 在 subtle 与 ghost 两档的缺省都是 `none`），ghost 档补透明占位边，三档几何一致。
  `--xh-card-title-font-weight` 缺省由 `--xh-font-weight-medium` 改为 `--xh-font-weight-semibold`（Surface 标题
  14/600）；`--xh-card-description-font-size` 缺省由 `--xh-text-label-size` 改为 `--xh-text-secondary-size`、
  `--xh-card-description-leading` 由 `--xh-text-body-leading` 改为 `--xh-leading-normal`（说明 13/fg-muted）；
  `--xh-card-p` 缺省由 `--xh-space-4` 改为 `--xh-surface-pad-lg`（同为 16px，Surface 内衬只走 `--xh-surface-*`）。

  **alert 改中性描边面去 raised 落影，关闭钮接入 Action Control，指示符统一 md 档。** 根面的
  `--xh-alert-border` 缺省由 `transparent` 改为 `--xh-border-default`、`--xh-alert-bg` 缺省直接落 `--xh-bg-surface`、
  `--xh-alert-shadow` 缺省由 `--xh-elevation-raised` 改为 `none`（静态反馈面只靠描边分层，私有槽
  `--xh-_alert-surface` / `--xh-_alert-edge` 删除）；`--xh-alert-icon-size` 在 root 上的缺省由 `--xh-glyph-size-sm`
  改为 `--xh-glyph-size-md`（Feedback 指示符统一 md）。connect 在 close-trigger 上投影 `data-xh-action-control` /
  `profile="icon"` / `variant="ghost"` / `display="always"` / `size="sm"`；皮肤删除关闭钮自写的盒、底、字体、
  transition、hover / active / 缩放 / disabled 规则与粗指针外扩伪元素，改为映射家族桥接槽（`--xh-alert-close-size` /
  `-radius` / `-bg-hover` / `-bg-active` / `-fg` / `-fg-hover` 使用者槽保留为第一参数，`--xh-alert-icon-size` 在关闭钮上
  按 sm 档取 16px）。默认外观变化：关闭钮悬停由 `--xh-_tone-subtle-hover`（20%）改为 `--xh-_tone-subtle`（12%）、按下由
  `--xh-_tone-subtle-active`（28%）改为 `--xh-_tone-subtle-hover`（20%）（白底承载阶梯，随语气）；粗指针热区与禁用面
  （透明底 + `--xh-fg-disabled`）改由家族给。

  **toast 改 sheet 三件套，两颗钮接入 Action Control，指示符统一 md 档，标题与说明按 Feedback 排版档。**
  `--xh-toast-border` 缺省由 `transparent` 改为 `--xh-material-elevated-border`、`--xh-toast-bg` 由 `--xh-bg-surface`
  改为 `--xh-material-elevated-bg`、`--xh-toast-fg` 由 `--xh-fg-default` 改为 `--xh-material-elevated-fg`、
  `--xh-toast-shadow` 由 `--xh-elevation-sheet` 改为 `--xh-material-elevated-shadow`（sheet 面必有 1px 描边，亮暗两档
  同源；亮色 `--xh-material-elevated-bg` 为 oklch 0.99 非纯白，与页面白底有极浅色差，属 sheet 三件套既定取值，与 dialog
  同）。`--xh-toast-icon-size` 在 root 上的缺省由 `--xh-glyph-size-sm` 改为 `--xh-glyph-size-md`；
  `--xh-toast-title-font-weight` 缺省 medium → semibold，`--xh-toast-description-font-size` 缺省 `--xh-text-label-size` →
  `--xh-text-secondary-size`、`--xh-toast-description-leading` `--xh-text-body-leading` → `--xh-leading-normal`。
  connect 在 action-trigger 上投影 `data-xh-action-control` / `profile="text"` / `variant="outline"` / `display="always"` /
  `size="sm"`，close-trigger 投影 `profile="icon"` / `variant="ghost"` / `display="always"` / `size="xs"`（24px，与此前
  `--xh-control-action-size` 同尺寸；显隐仍由皮肤按 root 悬停 / 焦点只压 opacity，不走家族的 hover-focus——那一档用
  visibility 收起，占 Tab 位的叉会被键盘漏掉）。皮肤删除两颗钮自写的盒、底、边、字体、transition、hover / active /
  缩放 / disabled 规则与粗指针外扩伪元素，改为映射家族桥接槽（`--xh-toast-action-h` / `-px` / `-radius` / `-bg` /
  `-bg-hover` / `-bg-active` / `-fg` / `-border` / `-font-weight` 与 `--xh-toast-close-size` / `-radius` / `-bg` /
  `-bg-hover` / `-bg-active` / `-border` / `-fg` / `-fg-hover` 使用者槽保留为第一参数）。默认外观变化：操作钮由
  「`--xh-bg-subtle` 淡底 + `--xh-border-default` 描边、悬停 200 / 按下 300、字号随条子 14px」改为透明底 +
  `--xh-border-control` 描边、悬停 `--xh-bg-subtle`（100）+ `--xh-border-control-hover` / 按下 `--xh-bg-subtle-hover`
  （200）、字号取 sm 档 `--xh-control-font-sm`，底 / 边 / 字钉在中性面上不随 `tone`；关闭钮由「`--xh-bg-subtle` 淡底 +
  `--xh-border-default` 描边、悬停 200 / 按下 300」改为静息透明无边、悬停 `--xh-_tone-subtle`（12%，随语气）/ 按下
  `--xh-_tone-subtle-hover`（20%）；粗指针热区与禁用面改由家族给；compact 密度下关闭钮固定 24px（此前 20px）。

  **notification 卡片改 sheet 三件套，两颗钮接入 Action Control，卡片内图标统一 md 档。**
  `--xh-notification-item-border` 缺省由 `--xh-border-default` 改为 `--xh-material-elevated-border`、`--xh-notification-item-bg`
  由 `--xh-bg-surface-raised` 改为 `--xh-material-elevated-bg`、`--xh-notification-item-fg` 由 `--xh-fg-default` 改为
  `--xh-material-elevated-fg`、`--xh-notification-item-shadow` 由 `--xh-elevation-sheet` 改为 `--xh-material-elevated-shadow`
  （与 toast 同一套 sheet 三件套）；`--xh-notification-icon-size` 在 item 上的缺省由 `--xh-control-indicator-size` 改为
  `--xh-glyph-size-md`（Feedback 指示符统一 md；叉与操作钮的字形改按各自按钮档取值）。connect 在 item-action-trigger 上
  投影 `data-xh-action-control` / `profile="text"` / `variant="outline"` / `display="always"` / `size="sm"`，
  item-close-trigger 投影 `profile="icon"` / `variant="ghost"` / `display="always"` / `size="sm"`（32px，钉在卡片角上的
  叉与浮层角落关闭钮同一档）。皮肤删除两颗钮自写的盒、底、边、字体、transition、hover / active / 缩放 / disabled 规则与
  粗指针外扩伪元素，改为映射家族桥接槽（`--xh-notification-action-h` / `-px` / `-radius` / `-bg` / `-bg-hover` /
  `-bg-active` / `-fg` / `-border` / `-font-weight` 与 `--xh-notification-close-size` / `-radius` / `-bg-hover` /
  `-bg-active` / `-fg` / `-fg-hover` 使用者槽保留为第一参数）。默认外观变化：操作钮由「`--xh-bg-subtle` 淡底 +
  `--xh-border-default` 描边、悬停 200 / 按下 300、字号随卡片 14px」改为透明底 + `--xh-border-control` 描边、悬停
  `--xh-bg-subtle`（100）+ `--xh-border-control-hover` / 按下 `--xh-bg-subtle-hover`（200）、字号取 sm 档
  `--xh-control-font-sm`，底 / 边 / 字钉在中性面上不随 `tone`；叉的悬停由 `--xh-bg-subtle-hover`（200）改为
  `--xh-_tone-subtle`（12%，随语气）/ 按下由 `--xh-bg-subtle-active`（300）改为 `--xh-_tone-subtle-hover`（20%）；
  粗指针热区与禁用面改由家族给。

  **empty-state 的标题与说明按 Surface 排版档。** md 档标题由 `--xh-control-font-lg`（16px）改为 `--xh-text-label-size`
  （14/600，Surface / Feedback 标题档；真源 §6.4 只有 14/600 与页面级 heading-3 两档），sm 档不再另给字号（同 14），
  lg 档仍为 `--xh-text-heading-3-size`；`--xh-empty-state-description-font-size` 缺省由 `--xh-text-body-size` 改为
  `--xh-text-secondary-size`、`--xh-empty-state-description-leading` 由 `--xh-text-body-leading` 改为 `--xh-leading-normal`
  （说明 13/fg-muted）。根面无壳，不画边、底与影，未变。

  **code-view 根面去 raised 落影，折叠条接入 Action Control disclosure-trigger 档。** `--xh-code-view-shadow` 缺省由
  `--xh-elevation-raised` 改为 `none`（静态内容面 = `--xh-border-default` 描边 + `--xh-bg-surface` + 无影，边与底未变）。
  connect 在 fold-trigger 上投影 `data-xh-action-control` / `profile="disclosure-trigger"` / `variant="ghost"` /
  `display="always"` / `size`（随 `size`，缺省 md）。皮肤删除折叠条自写的盒、底、字体、transition、hover 与整条缩放规则，
  改为映射家族桥接槽（`--xh-code-view-px` / `--xh-code-view-fold-py` / `--xh-code-view-header-font-size` /
  `--xh-code-view-fold-fg` / `--xh-code-view-fold-bg-hover` / `--xh-code-view-header-border` 使用者槽保留为第一参数，
  圆角归零贴住卡边，顶边分隔线经家族四个状态的边色槽映射保持在场）。默认外观变化：悬停由 `--xh-bg-subtle-hover`（200）
  改为 `--xh-bg-subtle`（100，白底承载），按下由整条缩放 0.97 改为只换面到 `--xh-bg-subtle-hover`（200）；折叠条的
  最小高度取 md 档 `--xh-control-h-md`（36px，此前随内容约 31px），字与内衬不变。

  **diff-view 根面改 border-default 描边去 raised 落影，折叠格按钮接入 Action Control disclosure-trigger 档，图标改 md 档。**
  `--xh-diff-view-border` 缺省由 `--xh-border-subtle` 改为 `--xh-border-default`、`--xh-diff-view-shadow` 缺省由
  `--xh-elevation-raised` 改为 `none`（静态内容面 = 描边 + `--xh-bg-surface` + 无影，`--xh-border-subtle` 不作根面外边）；
  头部下边、行号列右边与并排接缝的内部分隔线从 `--xh-diff-view-border` 拆出新槽 `--xh-diff-view-divider`（缺省
  `--xh-border-subtle`），此前一把 `--xh-diff-view-border` 同时改根边与分隔线的作者需再写 `--xh-diff-view-divider`。
  `--xh-diff-view-icon-size` 缺省由 `--xh-glyph-size-text` 改为 `--xh-glyph-size-md` 并随 `data-size` 换档
  （sm 16 / md 20 / lg 24；截断提示条的警告字形随之）。connect 在 gap-trigger 上投影 `data-xh-action-control` /
  `profile="disclosure-trigger"` / `variant="ghost"` / `display="always"` / `size`（随 `size`，缺省 md）；皮肤删除折叠格按钮
  自写的盒、底、字体、transition、hover 与整条缩放规则，改为映射家族桥接槽（`--xh-diff-view-px` / `--xh-diff-view-font-size` /
  `--xh-diff-view-gap-fg` / `--xh-diff-view-gap-bg-hover` 使用者槽保留为第一参数，高度锚在 `--xh-diff-view-line-height` 上
  与相邻代码行同高），gap 行作为淡底承载面下发 `--xh-action-host-bg-hover / -pressed`。默认外观变化：按下由整条缩放 0.97
  改为只换面到 `--xh-bg-subtle-active`（300，淡底承载），悬停仍为 `--xh-bg-subtle-hover`（200）。

  **log 根面改 surface 底，回底钮接入 Action Control floating 档并改 frosted 四件套。** `--xh-log-bg` 缺省由
  `--xh-bg-subtle` 改为 `--xh-bg-surface`（描边与淡底互斥：`--xh-border-default` 描边 + surface 底 + 无影，与
  code-view / diff-view / json-viewer 同走 solid），root 新增 `--xh-log-shadow` 槽（缺省 `none`）。connect 在
  scroll-to-end-trigger 上投影 `data-xh-action-control` / `profile="floating"` / `variant="ghost"` / `display="always"` /
  `size="xs"`（`--xh-control-box-sm` 32px，与此前 `--xh-control-h-sm` 同尺寸）。皮肤删除回底钮自写的盒、边、底、影、
  transition、hover 与缩放规则，改为映射家族桥接槽（`--xh-log-scroll-to-end-trigger-size` / `-radius` / `-bg` / `-bg-hover` /
  `-border` / `-shadow` / `-fg` 使用者槽保留为第一参数）；材质由「`--xh-bg-surface-raised` + `--xh-border-default` +
  `--xh-elevation-raised`」改为角落浮钮族的 frosted 四件套（`--xh-material-frosted-bg / -border / -shadow / -backdrop`，
  字色 `--xh-material-frosted-fg`；raised 只给 Card 与可抬起部件）。`--xh-log-icon-size` 从 root 移到回底钮上，缺省由
  `--xh-glyph-size-text` 改为家族 xs 档字形 `--xh-_action-profile-glyph-size`（16px）。默认外观变化：悬停由
  `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100，白底承载），按下换面到 `--xh-bg-subtle-hover`（200）并保留
  0.97 缩放；粗指针热区与禁用面改由家族给。

  **json-viewer 三端不再渲染自绘滚动条，分支行补按压换面，图标改 md 档。** 树档 / 原文档容器是页内结构容器
  （与 Tree 同类），真源 §6.6 把自绘条只给浮层与定高小列表：Vue / React / Web Components 删除 `useScrollbars` /
  `ScrollbarsController` 接线，root 下不再挂 `[data-scope="scrollbar"]` 节点、`tree` / `text` 不再带 `data-xh-scrollbar`，
  两档容器走 reset 层的原生细条（依赖 `[data-scope][data-part]` 节点或作者容器的 `data-xh-scroll`）；皮肤删除 root 上的
  `--xh-scrollbar-track-bg: transparent` 死声明与 `position: relative`。以「root 下有条子」为前提的 DOM 查询与样式需改。
  面的写法收敛：`tree` / `text` / `empty` 三块面直接写 `--xh-json-viewer-border` → `--xh-border-default`、
  `--xh-json-viewer-bg` → `--xh-bg-surface`，新增 `--xh-json-viewer-shadow`（缺省 `none`），subtle / ghost 两档改由
  root 的 `data-variant` 向三块面下发透明边与底（此前经私有槽 `--xh-_json-viewer-border` / `-bg` 中转，外观逐值不变）。
  分支行 `branch-control` 新增按下换面 `--xh-json-viewer-row-bg-active`（缺省 `--xh-bg-subtle-hover`，白底承载 hover 100 →
  pressed 200，集合行不允许零反馈）。`--xh-json-viewer-icon-size` 缺省由 `--xh-glyph-size-text` 改为 `--xh-glyph-size-md`
  并随 `data-size` 换档（sm 16 / md 20 / lg 24；展开箭头的兜底字形随之）。

  **tool-call 根面改 border-default 描边去 raised 落影，开关接入 Action Control disclosure-trigger 档，退场改 exit 曲线。**
  `--xh-tool-call-border` 缺省由 `--xh-border-subtle` 改为 `--xh-border-default`、`--xh-tool-call-shadow` 缺省由
  `--xh-elevation-raised` 改为 `none`（静态内容面 = 描边 + `--xh-bg-surface` + 无影；subtle 档随之无影；语气色条叠写时
  以 `0 0 0 transparent` 零影占位）；审批位与详情区的内部分隔线从 `--xh-tool-call-border` 拆出新槽 `--xh-tool-call-divider`
  （缺省 `--xh-border-subtle`），此前一把 `--xh-tool-call-border` 同时改根边与分隔线的作者需再写 `--xh-tool-call-divider`。
  connect 在 trigger 上投影 `data-xh-action-control` / `profile="disclosure-trigger"` / `variant="ghost"` / `display="always"` /
  `size`（随 `size`，缺省 md）；皮肤删除开关自写的盒、底、字体、transition、hover / 缩放 / disabled 规则，改为映射家族桥接槽
  （`--xh-tool-call-px` / `-py` / `-font-size` / `-trigger-gap` / `-trigger-fg` / `-trigger-bg-hover` / `-trigger-radius` 使用者槽
  保留为第一参数，内衬沿用卡片档位），subtle 档根面作为淡底承载面下发 `--xh-action-host-bg-hover / -pressed`。
  `--xh-tool-call-icon-size` 在 root 上的缺省由 `--xh-glyph-size-text` 改为 `--xh-glyph-size-md`，开关内的指示符改按家族档字形取值。
  详情区收起动画的曲线由 `--xh-motion-ease-enter-strong` 改为 `--xh-motion-ease-exit`（§9.4 退场 exit 档）。默认外观变化：
  outline 档悬停由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100，白底承载），按下由整条缩放 0.97 改为只换面到
  `--xh-bg-subtle-hover`（200）；subtle 档悬停 200 / 按下 300；开关最小高度取 md 档 `--xh-control-h-md`（36px，此前随内容约
  33px），行内文字行高改 `--xh-leading-none`；粗指针热区与禁用面改由家族给。

  **reasoning 淡底面去 raised 落影，outline 档改 border-default 描边，开关接入 Action Control disclosure-trigger 档。**
  `--xh-reasoning-shadow` 缺省由 `--xh-elevation-raised` 改为 `none`（缺省 subtle 淡底面无影；语气色条叠写时以
  `0 0 0 transparent` 零影占位），outline 档 `--xh-reasoning-border` 缺省由 `--xh-border-subtle` 改为 `--xh-border-default`
  （静态内容面 = 描边 + `--xh-bg-surface` + 无影）。connect 在 trigger 上投影 `data-xh-action-control` /
  `profile="disclosure-trigger"` / `variant="ghost"` / `display="always"` / `size`（随 `size`；不写时取 sm，与皮肤缺省字号
  `--xh-control-font-sm` 同档）；皮肤删除开关自写的盒、底、字体、transition、hover / 缩放 / disabled 规则，改为映射家族桥接槽
  （`--xh-reasoning-px` / `-py` / `-font-size` / `-trigger-gap` / `-trigger-fg` / `-trigger-bg-hover` / `-trigger-radius`
  使用者槽保留为第一参数，内衬沿用本组件档位），缺省 subtle 根面作为淡底承载面下发 `--xh-action-host-bg-hover / -pressed`
  （200 → 300），outline / ghost 档改回白底阶梯（100 → 200）。`--xh-reasoning-icon-size` 在 root 上的缺省由
  `--xh-glyph-size-text` 改为按 `data-size` 换档（缺省与 sm 档 `--xh-glyph-size-sm` 16px、md 20px、lg 24px，此前 1em），
  与开关的家族档位同步。
  默认外观变化：按下由整条缩放 0.97 改为只换面到 `--xh-bg-subtle-active`（300）；开关最小高度取 sm 档 `--xh-control-h-sm`
  （32px），行内文字行高改 `--xh-leading-none`；开关字色三态停在 `--xh-fg-muted`；粗指针热区与禁用面改由家族给。

  **approval 根面改 border-default 描边去 raised 落影，授权行接入 Action Control row 档，两颗钮接入 text 档。**
  `--xh-approval-border` 缺省由 `--xh-border-strong` 改为 `--xh-border-default`（语气色边只在作者打了 `tone` 时染上，
  拆成独立的 `[data-tone]` 规则）、落定后 `--xh-approval-border-settled` 缺省由 `--xh-border-subtle` 改为
  `--xh-border-default`、`--xh-approval-shadow` 缺省由 `--xh-elevation-raised` 改为 `none`（静态内容面 = 描边 +
  `--xh-bg-surface` + 无影；subtle 档随之无影）。connect 在 item 上投影 `data-xh-action-control` / `profile="row"` /
  `variant="ghost"` / `display="always"` / `size`，在 approve-trigger 上投影 `profile="text"` / `variant="solid"`、在
  deny-trigger 上投影 `profile="text"` / `variant="outline"`（档位随 `size`，缺省 md）；两颗钮新增 `data-disabled`
  （落定时两颗都投，必选项没勾满时只投批准；判定在途仍只走 `data-loading` + `aria-disabled`，家族给在途面）。
  皮肤删除授权行与两颗钮自写的盒、底、边、字体、transition、hover / 缩放 / disabled 规则，改为映射家族桥接槽
  （`--xh-approval-item-*`、`--xh-approval-action-*`、`--xh-approval-approve-*`、`--xh-approval-deny-*` 使用者槽保留为
  第一参数）；subtle 档根面作为淡底承载面下发 `--xh-action-host-bg-hover / -pressed`。默认外观变化：授权行悬停由
  `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100，白底承载），按下由整行缩放 0.97 改为只换面到
  `--xh-bg-subtle-hover`（200），行最小高度取 row 档 `--xh-control-h-md`（36px，此前随内容约 29px），行内文字行高由 UA
  `normal` 改为 `--xh-leading-normal`（皮肤在 item 上写正文行高，不吃家族单行档）；批准钮按下同时换底到 `--xh-bg-brand-active`、
  必选项没勾满时的置灰底 `--xh-approval-approve-bg-off`
  缺省由 `--xh-bg-muted` 改为 `--xh-bg-subtle`；拒绝钮悬停由 200 改为 100、按下换面 200 并浮出 `--xh-border-control-hover`
  描边，落定后的描边 `--xh-approval-deny-border-off` 缺省由 `--xh-border-default` 改为 `--xh-border-subtle`（家族 outline
  禁用面）。标题字重 `--xh-approval-title-font-weight` 缺省由 `--xh-text-label-weight`（500）改为
  `--xh-font-weight-semibold`（600），说明行高由 `--xh-text-body-leading` 改为 `--xh-leading-normal`。connect 在
  approve-trigger 上与根同值投影 `data-tone`（与 Button 同构）：家族的深色 solid 规则只看触发器自身的 `data-tone`，此前
  暗色下批准钮的实心面会落回品牌色，现在亮暗两态都随 `tone` 取语气色。
  `--xh-approval-icon-size` 缺省由 `--xh-glyph-size-text` 改为按 `data-size` 换档（sm 16 / md 20 / lg 24），勾选记号里的勾
  改按指示符盒比例量（0.75 盒宽），新增 `--xh-approval-indicator-icon-size` 覆盖它；在途圆环的圆角由 `--xh-shape-pill`
  改为 `--xh-shape-circle`（正方盒取圆）。

  **question-flow 根面改 border-default 描边去 raised 落影，选项行接入 Action Control row 档，四颗钮接入 icon / text 档。**
  `--xh-question-flow-border` 缺省由 `--xh-border-subtle` 改为 `--xh-border-default`、`--xh-question-flow-shadow` 缺省由
  `--xh-elevation-raised` 改为 `none`（静态内容面 = 描边 + `--xh-bg-surface` + 无影；subtle 档随之无影），三档形态改由
  `data-variant` 规则直接写底与边（此前经私有槽中转，outline / subtle / ghost 观感逐值不变）。connect 在 item 上投影
  `data-xh-action-control` / `profile="row"` / `variant="ghost"`，在 prev-trigger / next-trigger 上投影 `profile="icon"` /
  `variant="ghost"` / `size="xs"`（24px 方格），在 skip-trigger 上投影 `profile="text"` / `variant="ghost"`、在 submit-trigger 上
  投影 `profile="text"` / `variant="solid"`（档位随 `size`，缺省 md）；四颗钮新增 `data-disabled`（与原生 `disabled` 同步，
  家族按它给禁用面）。皮肤删除选项行与四颗钮自写的盒、底、边、字体、transition、hover / 缩放 / disabled 规则，改为映射家族
  桥接槽（`--xh-question-flow-item-*`、`-step-*`、`-action-*`、`-skip-*`、`-submit-*` 使用者槽保留为第一参数）；subtle 档
  根面作为淡底承载面下发 `--xh-action-host-bg-hover / -pressed`。默认外观变化：选项行、翻页钮与跳过钮悬停由
  `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100，白底承载），按下换面到 `--xh-bg-subtle-hover`（200）——选项行
  只换面不再缩放，行最小高度取 row 档 `--xh-control-h-md`（36px，此前随内容约 29px），行内文字行高仍是
  `--xh-leading-normal`（皮肤在 item 上写回正文行高，不吃家族单行档）；
  翻页钮字号取 xs 档 `--xh-control-font-sm`（箭头字形仍按根上的 `--xh-question-flow-icon-size` 量）；提交钮答不动时的置灰底
  `--xh-question-flow-submit-bg-off` 缺省由 `--xh-bg-muted` 改为 `--xh-bg-subtle`。题干字重 `--xh-question-flow-prompt-font-weight`
  缺省由 `--xh-text-label-weight`（500）改为 `--xh-font-weight-semibold`（600）。单选记号盒的圆角
  `--xh-question-flow-indicator-radius-single` 缺省由 `--xh-shape-pill` 改为 `--xh-shape-circle`（正方盒取圆）；记号盒里的勾
  `--xh-question-flow-indicator-icon-size` 缺省由 `--xh-glyph-size-text` 改为按盒比例量（0.75 盒宽）。connect 在
  submit-trigger 上与根同值投影 `data-tone`（与 Button 同构）：家族的深色 solid 规则只看触发器自身的 `data-tone`，此前
  暗色下提交钮的实心面会落回品牌色，现在亮暗两态都随 `tone` 取语气色。

  **message-feed 回底钮接入 Action Control floating 档并改 frosted 四件套，粘底视口补稳定滚动槽。** connect 在
  scroll-to-end-trigger 上投影 `data-xh-action-control` / `profile="floating"` / `variant="ghost"` / `display="always"` /
  `size="xs"`（`--xh-control-box-sm` 32px 正方盒，与此前 `--xh-control-h-sm` 同尺寸）；皮肤删除回底钮自写的盒、边、底、影、
  transition、hover / 缩放规则，改为映射家族桥接槽（`--xh-message-feed-scroll-to-end-trigger-*` 使用者槽保留为第一参数），
  材质由 raised 三件（`--xh-border-default` + `--xh-bg-surface-raised` + `--xh-elevation-raised`）改为 frosted 四件套
  （`--xh-material-frosted-bg` / `-border` / `-shadow` / `-backdrop`，字色 `--xh-material-frosted-fg`；角落浮钮族与
  log / back-top 同档）。默认外观变化：悬停由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100，白底承载），按下
  缩放并换面到 `--xh-bg-subtle-hover`（200）；`--xh-message-feed-icon-size` 从 root 移到回底钮，缺省由 `--xh-glyph-size-text`
  改为家族 xs 档字形 `--xh-_action-profile-glyph-size`（16px）。viewport 新增 `scrollbar-gutter: stable`（带 `data-xh-scrollbar`
  的容器除外）：流式视口的内容高度一直在变，原生条出现与消失时不再推动文字，右侧常留一条条宽的空道。

  **accordion outline 根面补 border-default 描边，标题栏接入 Action Control disclosure-trigger 档；collapsible 触发器同档接入。**
  accordion 的 outline 档新增使用者槽 `--xh-accordion-border`（缺省 `--xh-border-default`，1px 描边；此前只有底无边），
  与条与条之间的分隔线槽 `--xh-accordion-item-border` 各管各的；subtle 档补一圈透明边位（三档几何一致）并作为淡底承载面
  下发 `--xh-action-host-bg-hover / -pressed`（200 → 300）。两家的 connect 在 trigger 上投影 `data-xh-action-control` /
  `profile="disclosure-trigger"` / `variant="ghost"` / `display="always"` / `size`（随 `size`，缺省 md）；皮肤删除触发器自写的
  盒、底、边、字体、transition、hover / 缩放 / disabled 规则与三档私有槽，改为映射家族桥接槽（`--xh-accordion-trigger-*` /
  `--xh-collapsible-trigger-*` 使用者槽保留为第一参数，三档 gap / 高度 / 内衬 / 字号取家族 disclosure-trigger 档，与迁移前逐值
  相同）。默认外观变化：悬停由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100，白底承载），按下由整条缩放 0.97 改为
  只换面到 `--xh-bg-subtle-hover`（200）；展开态的标题栏不再排除悬停换面（open 与家族 hover 同档中性，字色仍走
  `-fg-open`）；粗指针热区与禁用面改由家族给。指示器转向由 `--xh-motion-duration-micro` 改为 `--xh-motion-duration-enter`
  （与正文展开同档）；`--xh-accordion-icon-size` / `--xh-collapsible-icon-size` 在 root 上的缺省由 `--xh-glyph-size-text` 改为
  `--xh-glyph-size-md`，触发器内的指示符改按家族档字形取值（sm 16 / md 20 / lg 24）。

  **toolbar outline 改 border-default 描边去 raised 落影，条目接入 Action Control text 档，选中字色改淡底前景。**
  outline 档由「边宽 0 + `--xh-elevation-raised` 落影」改为 `--xh-border-default` 1px 描边 + `--xh-bg-surface` + 无影
  （`--xh-toolbar-shadow` 缺省由 `--xh-elevation-raised` 改为 `none`，静态内容面 = 描边 + surface 底 + 无影）；subtle 档
  补一圈透明边位（与 outline 同一几何）并作为淡底承载面下发 `--xh-action-host-bg-hover / -pressed`（200 → 300）。
  connect 在 item 上投影 `data-xh-action-control` / `profile="text"` / `variant="ghost"` / `display="always"` / `size`（随
  `size`，缺省 md）；皮肤删除条目自写的盒、底、边、字体、transition、hover / 缩放 / disabled 规则与分组内的重复三态规则，
  改为映射家族桥接槽（`--xh-toolbar-item-*` 使用者槽保留为第一参数），分组作为淡底承载面下发 host 槽。`aria-pressed`
  选中态的字色 `--xh-toolbar-item-fg-pressed` 缺省由 `--xh-fg-brand-strong` 改为 `--xh-fg-on-brand-subtle`（无滑块开关 =
  品牌淡底 + 淡底前景，§7.3），新增 `--xh-toolbar-item-bg-pressed-active`（缺省 `--xh-bg-brand-subtle-active`）作为选中
  段的按下面（12% → 20% → 28%）。默认外观变化：ghost 根上散落的条目悬停由 `--xh-bg-subtle-hover`（200）改为
  `--xh-bg-subtle`（100，白底承载），按下换面到 `--xh-bg-subtle-hover`（200）并缩放 0.97；分组内条目悬停 200 / 按下 300
  且按下同样缩放（此前分组内不缩放）；条目改为定高盒（`block-size` 取档位，此前 `min-block-size`），
  边由 0 改为 1px 透明边位（与 Button 同构，border-box 下总高不变）。

  **page-header outline 描边改 border-default，subtle 补透明边位，标题字重走标题档令牌。** `--xh-page-header-border`
  在 outline 根面上的缺省由 `--xh-border-subtle` 改为 `--xh-border-default`（静态内容面 = 描边 + `--xh-bg-surface` + 无影；
  ghost 贴底 `split` 那条分隔线仍缺省 `--xh-border-subtle`）；subtle 档补一圈透明边位，与 outline 同一几何。
  `--xh-page-header-title-font-weight` 缺省由字重原语 `--xh-font-weight-semibold` 改为标题档令牌 `--xh-text-heading-3-weight`
  （同为 600，观感不变）。

  **layout 覆盖档侧栏改 sheet 三件套，折叠把手接入 Action Control text 档。** `data-presentation="sheet"` 的侧栏由只有
  `--xh-elevation-sheet` 落影改为 sheet 三件套：`--xh-layout-sider-bg` 在这一档的缺省由 `--xh-bg-subtle` 改为
  `--xh-material-elevated-bg`、`--xh-layout-sider-shadow` 缺省由 `--xh-elevation-sheet` 改为 `--xh-material-elevated-shadow`，
  并在贴着内容那一侧新描一条 `--xh-layout-border`（这一档缺省 `--xh-material-elevated-border`；`placement="end"` 时描在
  行首侧）；占位档的侧栏不变。connect 在 sider-trigger 上投影 `data-xh-action-control` / `profile="text"` / `variant="ghost"` /
  `display="always"` / `size="sm"`（把手是一枚装着文字的小档按钮，几何与此前的 `--xh-control-h-sm` / `--xh-control-px-sm` 逐值
  相同）；皮肤删除把手自写的盒、底、边、字体、transition、hover / 缩放规则，改为映射家族桥接槽（`--xh-layout-sider-trigger-*`
  使用者槽保留为第一参数）；占位档侧栏作为淡底承载面下发 `--xh-action-host-bg-hover / -pressed`，覆盖档侧栏换成 elevated
  白底后把阶梯写回 100 / 200。默认外观变化：把手摆在顶栏等白底上时悬停由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`
  （100），按下换面到 `--xh-bg-subtle-hover`（200）；摆进占位档侧栏时仍是 200 / 300，摆进覆盖档侧栏时同白底 100 / 200；
  把手字号由 `--xh-text-secondary-size` 改为家族 sm 档 `--xh-control-font-sm`（同为 13px）。

  **descriptions subtle 补透明边位，标签与取值的间距改 space-2。** subtle 档补一圈 `--xh-stroke-thin` 透明边位，与
  outline 同一边宽（淡底面 = `--xh-bg-subtle` + 透明边位 + 无影）；outline 档仍是 `--xh-border-default` 描边 +
  `--xh-bg-surface` + 无影，网格线 `--xh-border-subtle` 只作内部分隔。标签是每一格的集合标题（14 / 500 /
  `--xh-fg-muted`），叠着排时与取值的间距 `--xh-descriptions-pair-gap` 缺省由 `--xh-space-1`（4px）改为
  `--xh-space-2`（8px，§6.4 集合标题与集合的间距）；sm 档此前继承 md 的 4px，现同为 8px，lg 档不变。标签在左时的
  列间距不变。

  **list subtle 补透明边位，淡底档里的 hoverable 条目悬停抬到 200。** subtle 档补一圈 `--xh-stroke-thin` 透明边位，与
  outline 同一几何（淡底面 = `--xh-bg-subtle` + 透明边位 + 无影）；outline 档仍是 `--xh-border-default` 描边 +
  `--xh-bg-surface` + 无影，`split` 分隔线 `--xh-border-subtle` 只作内部分隔。`--xh-list-item-bg-hover` 的缺省改经根上的
  私有槽 `--xh-_list-item-bg-hover` 下发：白底 / ghost / outline 仍是 `--xh-bg-subtle`（100），subtle 档的根把它抬到
  `--xh-bg-subtle-hover`（200，§7.2 坐在淡底上的条目按承载面取阶梯；此前与淡底同色，悬停看不出来）。皮肤体积
  基线 list.css 3517 → 3883 字节：涨在 subtle 档的透明边位、根上的悬停面私有槽与淡底档对它的覆盖。

  **kbd 字号改次级标注档 12px。** `--xh-kbd-font-size` 缺省由 `--xh-text-label-size`（14px）改为
  `--xh-text-caption-size`（12px，§6.4 快捷键属次级标注）；键帽高 `--xh-space-6`（24px）、最小宽 24px、control 4px 圆角、
  subtle 材质（透明边位 + `--xh-bg-subtle` + 无影）与 `light` 档的透明底都不变，单行行高 `--xh-leading-none` 随字号缩到
  12px，键帽内的字在 24px 盒里仍居中。

  **tag 改胶囊。** `--xh-tag-radius` 缺省由 `--xh-shape-control`（4px）改为 `--xh-shape-pill`（§6.3 pill 只给状态 chip 与
  一维对象，Tag 是状态 chip），四种形态与三档尺寸同一身份；关闭钮 `--xh-tag-close-radius` 仍是 `--xh-shape-inset`
  （随文标记档的 16px 正方盒，与 checkbox 系方框同档，内层圆角不越过外层胶囊）。缺省 subtle 档仍是 soft 材质
  （`--xh-material-soft-border / -bg / -shadow`，§8 登记消费者），outline 描边 `--xh-border-default`、solid / ghost 不变。
  波及复用 tag 皮肤的 select 多选标签、tags-input 条目与 tag-group 成员：它们的默认圆角一并由 4px 变为胶囊；以
  `--xh-tag-radius` 覆盖过的作者不受影响。

  **statistic 涨跌箭头改按字形档取尺。** root 新增使用者槽 `--xh-statistic-icon-size`（映射 `--xh-icon-size`），缺省
  `--xh-glyph-size-sm`（16px，跟着前后缀那一档 14px 字走），lg 档抬到 `--xh-glyph-size-md`（20px）；趋势箭头的兜底字形
  与作者塞进 trend 的图标读同一把尺（此前箭头 `--xh-glyph-size-text` 随文 1em ≈ 14px，作者图标落 `--xh-icon-size` 缺省
  20px，两者不一致）。标签 / 数值 / 前后缀 / 涨跌的字号、字重与颜色不变，无壳无形状。

  **timeline 说明改说明档 13px。** `--xh-timeline-description-font-size` 缺省由 `--xh-text-body-size`（14px）改为
  `--xh-text-secondary-size`（13px，§6.4 说明 / helper 档：13 / `--xh-fg-muted` / `--xh-leading-normal`），字色与行高本就在档上；
  条目标题仍是 `--xh-text-label-weight` 500（它是每条事件的标题，不是 Surface 面板标题），label / time 的 12px 次级标注、
  圆点 circle 与连线 pill 的身份、tone 圆点的 `--xh-fg-muted` 兜底都不变。

  **badge 圆点档改取 circle。** `indicator[data-dot]` 新增使用者槽 `--xh-badge-dot-radius`，缺省 `--xh-shape-circle`
  （§6.3 宽高同槽的正方盒必须取 circle，不得用胶囊冒充圆）；此前圆点档沿用计数档的 `--xh-badge-radius`（`--xh-shape-pill`
  9999px），在 6 / 8 / 10px 的正方盒上画出的仍是圆，像素不变，但作者按圆点覆盖圆角时只能改动计数档那一槽。计数档的
  胶囊身份、`--xh-badge-ring` 切边环、13 / 500 字形与三档尺寸都不变。check-shape-scale 身份表新增
  `badge:indicator[data-dot]=circle`。

  **timer 起停钮接入 Action Control text outline 档，去抬升，阶梯改 100 / 200。** connect 在 control 上投影
  `data-xh-action-control` / `profile="text"` / `variant="outline"` / `display="always"` / `size`（随 `size` 取
  sm / md / lg，缺省 `md`，钮高 32 / 36 / 40px 与此前一致）。皮肤 `@import` 家族 action-control，删除起停钮自写的盒、底、
  边、transition、hover / active / 缩放 / focus-visible / `:disabled` 规则与粗指针 `::before` 外扩，改为映射家族桥接槽
  （`--xh-timer-control-h` / `-px` / `-gap` / `-radius` / `-bg` / `-bg-hover` / `-bg-active` / `-bg-disabled` / `-fg` /
  `-border` / `-border-hover` / `-border-focus` / `-border-disabled` / `-shadow-hover` / `-shadow-active` 使用者槽全部保留为
  第一参数），只留 `--xh-text-label-size` 字号与 `--xh-text-label-weight` 字重；新增使用者槽 `--xh-timer-icon-size`
  （映射 `--xh-icon-size`，缺省按档取 `--xh-_action-profile-glyph-size` 16 / 20 / 24px，作者塞进钮里的图标随档取尺）。
  默认外观变化：静息底由 `--xh-bg-surface` 改为透明（描边仍 `--xh-border-control`、control 圆角、无影）；悬停由
  `--xh-bg-subtle-hover`（200）+ `--xh-elevation-raised` 抬升改为 `--xh-bg-subtle`（100）+ `--xh-border-control-hover`、
  不抬升（§8 raised 只给 Card 与可抬起部件）；按下由 `--xh-bg-subtle-active`（300）改为 `--xh-bg-subtle-hover`（200）
  （白底承载阶梯），0.97 按压与 120 / 200ms 节奏不变；焦点边不再随 `--xh-_tone`，由家族给中性边 + `--xh-ring-focus`
  焦点环（§7.2.5）；粗指针热区由家族外扩到 44px；禁用面由家族按 `data-disabled` 给（透明底 + `--xh-fg-disabled` +
  `--xh-border-subtle`），作者直接写原生 `disabled` 的钮不再有专属禁用面（Headless 未定义该状态）。

  **tabs 按下改为只换面，segment 档选中标签改白色抬起面并补描边，line 档悬停 / 按下改字色三步。** 标签是铺开的一段
  （§9.2 Tabs trigger 归行级），皮肤删除 `:active` 的 0.97 缩放与 transition 里的 `scale` 项，按下改为按形态换面：`card`
  坐在画布上，悬停由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）；`segment`
  坐在淡底轨道里，悬停 200、按下 `--xh-bg-subtle-active`（300），标签带作为淡底承载面向内下发 `--xh-action-host-bg-hover / -pressed`；选中标签不叠按下面（§7.3 有滑块开关无叠加态）。新增使用者槽 `--xh-tabs-trigger-bg-pressed`（缺省按形态取
  私有槽）与 `--xh-tabs-trigger-fg-pressed`（line 档，缺省 `--xh-_tabs-accent-text`）。`line` 档无底，悬停与按下只换前景：
  `--xh-tabs-trigger-fg-hover` 缺省由 `--xh-_tabs-accent-text` 改为 `--xh-fg-default`，静息 muted → 悬停 default → 按下与
  当前页 `--xh-fg-brand-strong` 三步各一档（此前悬停即品牌字色，按住与悬停无可见差别）；当前页补 `--xh-font-weight-medium`
  字重（新增槽 `--xh-tabs-trigger-font-weight-active`，与静息 `--xh-text-label-weight` 同为 500，像素不变）。`segment` 档
  （§7.3 有滑块开关）：选中标签的底由 `--xh-bg-surface` 改为 `--xh-bg-surface-raised`，补 `--xh-stroke-thin` 的
  `--xh-border-default` 描边（未选中标签带同宽透明边位，盒高不变），`--xh-elevation-raised` 影保留；标签带补一圈
  `--xh-stroke-thin solid transparent` 占位边（§8.3 淡底面 = subtle 底 + 透明边位 + 无影，`--xh-tabs-list-border` 在这一档也
  可覆盖它），标签带的盒因此各向外扩 1px。高对比档补按下通道（Highlight / HighlightText）。皮肤体积基线随三条新增规则
  （segment 标签带、segment 选中面、line 按下前景）重落。

  **segmented 轨道改透明占位边，滑块补 border-default 描边，按下改只换面。** 轨道是淡底面（§8.3）：`--xh-segmented-border`
  缺省由 `--xh-border-subtle` 改为 `transparent`（`--xh-bg-subtle` 底 + 同宽透明边位 + 无影，`--xh-border-subtle` 只作内部
  分隔），轨道作为淡底承载面向内下发 `--xh-action-host-bg-hover / -pressed`（200 → 300）。滑块 indicator 是有滑块开关的白色
  抬起面（§7.3）：底由 `--xh-bg-surface` 改为 `--xh-bg-surface-raised`，新增 `--xh-stroke-thin` 的 `--xh-border-default`
  描边（新增使用者槽 `--xh-segmented-indicator-border`；`data-tone` 档描边与实心语气底同色），`--xh-elevation-raised` 影保留；
  描边吃进连接层量出的盒里，滑块与段仍是同一块矩形。段是轨道里铺开的一段（§9.2）：删除 `:active` 的 0.97 缩放与 transition
  里的 `scale` 项，未选中段按下改为换到 `--xh-bg-subtle-active`（300，新增使用者槽 `--xh-segmented-item-bg-pressed`），选中段
  不叠按下面（有滑块开关无叠加态）；悬停 `--xh-bg-subtle-hover`（200）不变。高对比档补按下通道（Highlight / HighlightText）。

  **toggle-group 段接入 Action Control text 档，选中改品牌淡底前景，阶梯按承载面分档。** connect 在 item 上投影
  `data-xh-action-control` / `profile="text"` / `display="always"` / `size`（随 `size`，缺省 md）/ `variant`（随 `variant`，
  缺省 subtle）；皮肤 `@import` 家族 action-control，删除段自写的盒、底、边、transition、hover / active / disabled 规则与粗指针
  `::after` 外扩，改为映射家族桥接槽（`--xh-toggle-group-item-*` 使用者槽全部保留为第一参数），`--xh-action-scale-pressed: none`
  保住共边接缝（按下只换面）。选中段是无滑块开关（§7.3）：`--xh-toggle-group-item-fg-on` 缺省由 `--xh-fg-brand` 改为
  `--xh-fg-on-brand-subtle`，subtle / outline / ghost 三档选中后的悬停与按下面由 `--xh-bg-brand-subtle` 改为
  `--xh-bg-brand-subtle-hover` / `-active`（12% → 20% → 28%，此前选中段悬停与按下不换面），solid 仍是品牌实心；solid 选中段的
  焦点环改经 `--xh-action-ring-color-focus-visible` 灌 currentColor。阶梯按承载面（§7.2）：缺省 subtle 档的段坐在自己的淡底
  上，悬停 200 → 按下 300 不变；outline / ghost 的段坐在画布上，悬停由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`
  （100）、按下由 `--xh-bg-subtle-active`（300）改为 `--xh-bg-subtle-hover`（200）。段改为定高盒并带 `min-inline-size`
  （与 Button 同构，text 档最小宽等于档位高度）；禁用段的光标由家族给 `not-allowed`。

  **radio-group 圆圈补悬停描边与按下换底，集合标题字号不随档、间距改 space-2。** 整行是命中区、回执落在圆圈上（§9.2
  集合行不允许零反馈）：未选中且未校验失败的圆圈在整行悬停时描边升到 `--xh-border-control-hover`（新增使用者槽
  `--xh-radio-group-indicator-border-hover`），整行按下时圆圈换底到 `--xh-bg-subtle-hover`（200，白底承载，新增
  `--xh-radio-group-indicator-bg-pressed`），圆点与几何不动，禁用与只读的行不给回执，选中圈与失败圈保住各自的描边；高对比档
  按下把描边换成 Highlight。集合标题（§6.4）：`--xh-radio-group-label-font-size` 缺省由随档的 `--xh-control-font-*` 改为
  `--xh-text-label-size`（14px 不随 size），单行行高 `--xh-leading-none`，整组禁用时标题落 `--xh-fg-subtle`（新增
  `--xh-radio-group-label-fg-disabled`）；`--xh-radio-group-gap` 缺省由 `--xh-stack-gap-md`（16px）改为 `--xh-space-2`
  （8px），标题到集合与条目之间同为一档紧密关系。皮肤体积基线随新增的四条规则重落。

  **checkbox-group 删除 `variant`，方框改字段家族控制盒，按下补换底，集合标题间距与条目字号归位。** 破坏性：`variant`
  （`primary | secondary`）从 Headless `CheckboxGroupProps`、Vue / React props 与 `<xh-checkbox-group>` 的 `variant` attribute
  中删除，root 不再投影 `data-variant`；它只剩「收掉控制盒海拔」一件事，海拔退出后为空 API（未发布的
  checkbox-group-secondary-variant changeset 一并撤回；独立 Checkbox 的 `CheckboxVariant` 随其自身迁移处理）。方框是字段
  家族的控制盒（§8.3）：`--xh-checkbox-group-indicator-bg` 缺省由 `--xh-material-soft-bg` 改为 `--xh-bg-canvas`，删除顶光
  渐变、静息 `--xh-material-soft-shadow` 与悬停 `--xh-elevation-raised` 抬升（使用者槽 `--xh-checkbox-group-indicator-highlight`
  / `-shadow-hover` / `-shadow-pressed` / `-shadow-disabled` / `-shadow-readonly` 随之删除，`-shadow` 保留、缺省 `none`），悬停时
  未勾选方框描边由语气色改为 `--xh-border-control-hover`（勾中方框悬停不换描边）；按下保留 0.97 缩放并补换底：未勾选换到
  `--xh-bg-subtle-hover`（新增 `--xh-checkbox-group-indicator-bg-pressed`），勾中 / 半选换到 `--xh-_tone-active`（缺省
  `--xh-bg-brand-active`，新增 `--xh-checkbox-group-indicator-bg-checked-pressed`）；禁用面改 `--xh-border-default` +
  `--xh-bg-subtle` + `--xh-fg-disabled`（此前 `--xh-border-control` + `--xh-bg-muted`）。`--xh-checkbox-group-gap` 缺省由
  `--xh-stack-gap-md`（16px）改为 `--xh-space-2`（8px，§6.4 集合标题与集合）；条目与全选格文字改随 size 档
  （`--xh-checkbox-group-item-font-size` / `-select-all-trigger-font-size` 缺省由 `--xh-text-label-size` 改为
  `--xh-control-font-sm / md / lg`，与 checkbox 标签、radio-group 条目统一），全选格圆角由 `--xh-shape-control` 改为
  `--xh-shape-inset`（同值 4px，身份归位）；`--xh-icon-size` 缺省改按方框比例取字形（与 checkbox 同一把尺）。示例
  `checkbox-group/05-tone-size`（变体）改为 `05-size`（尺寸）。

  **checkbox 删除 `variant`，方框改字段家族控制盒，按下补换底，禁用改中性面。** 破坏性：`CheckboxVariant`（`primary | secondary`）类型与 `variant` prop 从 Headless `CheckboxSchema`、Vue / React props 与 `<xh-checkbox>` 的 `variant` attribute 中
  删除，root 不再投影 `data-variant`；它只剩「收掉控制盒海拔」一件事，海拔退出后为空 API（未发布的
  checkbox-secondary-variant changeset 一并撤回）。方框是字段家族的控制盒（§8.3）：
  `--xh-checkbox-bg` 缺省由 `--xh-material-soft-bg` 改为 `--xh-bg-canvas`，删除顶光渐变、静息 `--xh-material-soft-shadow` 与
  悬停 `--xh-elevation-raised` 抬升（使用者槽 `--xh-checkbox-highlight` / `-shadow-hover` / `-shadow-pressed` /
  `-shadow-disabled` / `-shadow-readonly` 随之删除，`-shadow` 保留、缺省 `none`），悬停时未勾选方框描边由语气色改为
  `--xh-border-control-hover`（勾中方框悬停不换描边）；按下保留 0.97 缩放并补换底：未勾选换到 `--xh-bg-subtle-hover`（新增
  `--xh-checkbox-bg-pressed`），勾中 / 半选换到 `--xh-_tone-active`（缺省 `--xh-bg-brand-active`，新增
  `--xh-checkbox-bg-checked-pressed`），按压选择器改 `:is(:active, [data-pressed])`；禁用不再只降 opacity，改为
  `--xh-border-default` 描边 + `--xh-bg-subtle` 底 + `--xh-fg-disabled` 字形（新增 `--xh-checkbox-bg-disabled` /
  `-border-disabled` / `-fg-disabled`），勾中的禁用方框同样退回中性面、勾由置灰色画出；禁用标签色
  `--xh-checkbox-label-fg-disabled` 缺省由 `--xh-fg-disabled` 改为 `--xh-fg-subtle`（§6.4 禁用标签统一）。标签文字保持随
  size 档取 `--xh-control-font-*`（与 checkbox-group 条目同一把尺）。示例 `checkbox/03-tone` 由变体改为语气六档。

  **switch 滑块改 raised 抬起面，按下补换底，禁用改中性面，标签字号随档。** 滑块是可拖起部件（§5.3，逐部件登记 raised）：
  `--xh-switch-thumb` 缺省由 `--xh-material-soft-bg` 改为 `--xh-bg-surface-raised`，`--xh-switch-thumb-border` 缺省由
  `--xh-material-soft-border` 改为 `--xh-border-default`，`--xh-switch-thumb-shadow` 缺省由 `--xh-material-soft-shadow` 改为
  `--xh-elevation-raised`，`--xh-switch-thumb-fg` 缺省改 `--xh-fg-default`；删除顶光渐变（`--xh-switch-thumb-highlight` 随之删除）
  与悬停抬升规则（静息即 raised，`--xh-switch-thumb-shadow-hover` 随之删除）。轨道是定尺控件（§9.1）：按下保留 0.97 缩放并补
  换底——未选中轨道静息已是 `--xh-bg-subtle-active`（300），中性阶梯无更深一档，按下缺省仍取轨道面（新增
  `--xh-switch-bg-pressed`，换面通道由滑块拉伸与压平投影承担），选中轨道换到 `--xh-_tone-active`（缺省 `--xh-bg-brand-active`，
  新增 `--xh-switch-bg-checked-pressed`），按压选择器改 `:is(:active, [data-pressed])`，高对比档按下把轨道 outline 换成
  Highlight。禁用不再只降 opacity：轨道改 `--xh-bg-subtle` 底 + `--xh-border-default` 内描边 + `--xh-fg-disabled` 前景（新增
  `--xh-switch-bg-disabled` / `-border-disabled` / `-fg-disabled`），滑块前景置灰（新增 `--xh-switch-thumb-fg-disabled`），
  选中的禁用轨道同样退回中性面、值由滑块位置读出。只读选中轨道 `--xh-switch-bg-checked-readonly` 缺省由 `--xh-bg-muted` 改为
  `--xh-bg-subtle-active`（与未选中轨道同一中性面，§7.2 交互态的底只从语义面派生）；焦点环改为除禁用外一律灌 currentColor。
  加载环圆角由 `--xh-shape-pill` 改为 `--xh-shape-circle`（正方盒取 circle，像素不变）。标签：
  `--xh-switch-label-font-size` 缺省由 `--xh-text-label-size` 改为随 size 档的 `--xh-control-font-sm / md / lg`（与 checkbox
  标签同形），新增 `--xh-switch-label-leading`（缺省 `--xh-leading-normal`，长文字可换行），禁用标签色
  `--xh-switch-label-fg-disabled` 缺省由 `--xh-fg-disabled` 改为 `--xh-fg-subtle`。

  **calendar-picker 今天改品牌环，格子与钮的阶梯按白底承载分档，按下补换底，年网格滚动链改 auto。** 今天退出品牌淡底
  （§7.3）：`--xh-calendar-picker-today-bg` 缺省由 `--xh-bg-brand-subtle` 改为 `transparent`，`--xh-calendar-picker-today-border`
  缺省由 `transparent` 改为 `--xh-fg-brand`（格子自带的 1px 透明边位画成品牌环），品牌字保留；今天的悬停不再另给品牌淡底
  （`--xh-calendar-picker-today-bg-hover` 删除），走普通格子的阶梯。格子、四颗翻页钮与标题钮坐在日历的白底上：悬停由
  `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100），按下保留 0.97 缩放并补换底到 `--xh-bg-subtle-hover`（200，新增
  `--xh-calendar-picker-cell-bg-pressed` / `-nav-bg-pressed` / `-heading-trigger-bg-pressed`），选中格按下由 `--xh-bg-brand-hover`
  改为 `--xh-bg-brand-active`（§7.3 格状当前 pressed），按压选择器改 `:is(:active, [data-pressed])`，高对比档按下把边换成
  Highlight。不可用又选中的格由 `--xh-bg-muted` 改为 `--xh-bg-subtle` + `--xh-fg-disabled`（新增
  `--xh-calendar-picker-cell-bg-selected-disabled`）。快速选年的网格是页内结构容器（§6.6），删除
  `overscroll-behavior: contain`（嵌进 date-picker 浮层时由那份皮肤补）。翻页钮里的字形 `--xh-calendar-picker-icon-size` 缺省由
  `--xh-glyph-size-text` 改为 sm 档 `--xh-glyph-size-sm`（钮是 `--xh-control-h-sm` 见方的图标钮，§6.5）。

  **calendar-range-picker 今天改品牌环，格子与钮的阶梯按承载面分档，按下补换底，年网格滚动链改 auto。** 与 calendar-picker
  同构：`--xh-calendar-range-picker-today-bg` 缺省由 `--xh-bg-brand-subtle` 改为 `transparent`、`-today-border` 缺省由
  `transparent` 改为 `--xh-fg-brand`，今天的悬停不再另给品牌淡底（`-today-bg-hover` 删除），落在区间里的今天不再单独写透明底
  （环压在淡色带上）；格子、翻页钮与标题钮悬停 200 → 100、按下补换底 200 并保留缩放（新增 `-cell-bg-pressed` /
  `-nav-bg-pressed` / `-heading-trigger-bg-pressed`），端点按下由 `--xh-bg-brand-hover` 改为 `--xh-bg-brand-active`；区间中段的
  格坐在品牌淡底的轨道上，补悬停 `--xh-bg-brand-subtle-hover`（20%）与按下 `--xh-bg-brand-subtle-active`（28%，新增
  `-range-cell-bg-hover` / `-range-cell-bg-pressed`，§7.3 页内选中的叠加态）；按压选择器改 `:is(:active, [data-pressed])`，高对比档
  按下把边换成 Highlight；不可用又选中的格由 `--xh-bg-muted` 改为 `--xh-bg-subtle`（新增 `-cell-bg-selected-disabled`）；年网格删除
  `overscroll-behavior: contain`；翻页钮字形缺省改 `--xh-glyph-size-sm`。两份日历的日期格基础块、今天、选中、悬停与按下自此由
  check-family-parity 的「日历族」钉住同源。

  **pagination 四类格子接入 Action Control text 档，当前页经桥接槽画，面板补滚动隔离。** 上一页 / 下一页 / 页码 /
  省略位由 Headless 投影 `data-xh-action-control` + `data-xh-action-profile='text'` + `data-xh-action-variant='ghost'` +
  `data-xh-action-size`，盒型、三档几何、悬停 / 按下 / 禁用面、按压缩放与过渡改由家族配方给（§7.2 缺省中性；§9.1
  0.97 缩放并换底）：非当前页悬停由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100）、按下由 `--xh-bg-subtle-active`
  （300）改为 `--xh-bg-subtle-hover`（200，画布承载阶梯）；使用者槽 `--xh-pagination-item-bg / -bg-hover / -bg-active / -fg / -item-h / -item-px / -item-min-size / -item-radius / -font-size` 改为映射到 `--xh-action-*` 桥接槽，名字与语义不变。当前页
  （§7.3 格状当前）三态与描边、顶高光改经桥接槽交给家族画（`--xh-pagination-item-shadow` 缺省由顶高光改为 `none`，高光
  走家族的 highlight 通道），环色改经 `--xh-action-ring-color-focus-visible` 灌 `currentColor`；省略位三态都压
  `--xh-pagination-ellipsis-trigger-fg`。摊开的页码面板补 `overscroll-behavior: contain`（浮层滚动面，§6.6），三端自绘条改传
  `size: 'sm'`（浮层 4px 档）。`--xh-pagination-icon-size` 缺省由 `--xh-glyph-size-text` 改为随档的 `--xh-glyph-size-sm / md / lg`
  （§6.5）。三端 computed 快照里格子多出家族给的 `gap`（单子节点，像素不变）与 `transition-property`。

  **file-upload 文件条目与禁用投放区的外边改 `--xh-border-default`。** `--xh-file-upload-item-border` 缺省由
  `--xh-border-subtle` 改为 `--xh-border-default`：条目是 `--xh-bg-surface` 底上带四边描边的列表卡面，§8.3 规定
  `--xh-border-subtle` 只作内部分隔线，根面外边一律 `--xh-border-default`。禁用的投放区外边同样由 `--xh-border-subtle`
  改为 `--xh-border-default`（§7.2 第 9 条：disabled = `--xh-border-default` + `--xh-bg-subtle` + `--xh-fg-disabled`，
  与独立 Checkbox / Switch 的禁用边一致）。

  **steps 禁用步骤的指示器描边改 `--xh-border-default`。** `--xh-steps-indicator-border-disabled` 缺省由 `--xh-border-subtle`
  改为 `--xh-border-default`（§7.2 第 9 条：disabled 外边一律 `--xh-border-default`，与独立 Checkbox / Switch 的禁用边一致；
  `--xh-border-subtle` 只作内部分隔线）。

  **tag 禁用标签的描边改 `--xh-border-default`。** `--xh-tag-border-disabled` 缺省由 `--xh-border-subtle` 改为
  `--xh-border-default`（§7.2 第 9 条：disabled 外边一律 `--xh-border-default`；`--xh-border-subtle` 只作内部分隔线）。

  **table 三颗勾选框的禁用描边改 `--xh-border-default`。** select-all-trigger / column-visibility-trigger / row-select-trigger
  禁用时的 `border-color` 由 `--xh-border-subtle` 改为 `--xh-border-default`（§7.2 第 9 条，与独立 Checkbox 的禁用边一致）。

  **transfer 内嵌勾选框的禁用描边改 `--xh-border-default`。** `--xh-transfer-checkbox-border-disabled` 缺省由 `--xh-border-subtle`
  改为 `--xh-border-default`（§7.2 第 9 条，与独立 Checkbox 的禁用边一致；`--xh-border-subtle` 只作内部分隔线）。

  **tree 内嵌勾选框的禁用描边改 `--xh-border-default`。** `--xh-tree-checkbox-border-disabled` 缺省由 `--xh-border-subtle`
  改为 `--xh-border-default`（§7.2 第 9 条，与独立 Checkbox 的禁用边一致；`--xh-border-subtle` 只作内部分隔线）。

  **color-picker 面板改 floating 实体面，自绘条走浮层 4px 档。** content 是取色面域 + 色相 / 透明度滑杆 + 通道输入的
  表单型多列面板，按 §8.4「含网格或多列的锚定面板 → floating」由 frosted 改为 floating：`--xh-color-picker-content-border`
  缺省由 `--xh-material-frosted-border` 改为 `--xh-border-default`、`-content-bg` 由 `--xh-material-frosted-bg` 改为
  `--xh-bg-surface`、`-content-fg` 由 `--xh-material-frosted-fg` 改为 `--xh-fg-default`、`-content-shadow` 由
  `--xh-material-frosted-shadow` 改为 `--xh-elevation-floating`；不再透景、不再画顶部边界光，`--xh-color-picker-content-backdrop`
  与 `--xh-color-picker-content-highlight` 两个槽删除。面板补 `overscroll-behavior: contain`（浮层滚动面，§6.6），三端自绘条
  改传 `size: 'sm'`（浮层 4px 档）。

  **checkbox 方框接入 Action Control icon 档。** root 由 Headless 投影 `data-xh-action-control` + `data-xh-action-profile='icon'` +
  `data-xh-action-variant='outline'` + `data-xh-action-display='always'` + `data-xh-action-size`（随 size，缺省 md），盒型、悬停 /
  按下 / 禁用面、0.97 缩放与换底、粗指针 44px 热区、焦点环与过渡改由家族配方给（§9.1「方框」）；边长仍按
  `--xh-control-indicator-sm / md / lg`（皮肤把 `--xh-action-visual-size` 钉在 16px 档），面按字段静息形态取值（canvas 底 +
  `--xh-border-control` 描边 + 无影，悬停只升描边、按下换到 200 档中性面，勾中按下换语气 active 档）。使用者槽
  `--xh-checkbox-bg / -bg-checked / -bg-pressed / -bg-checked-pressed / -bg-disabled / -border / -border-hover / -border-checked / -border-invalid / -border-disabled / -fg / -fg-disabled / -shadow / -radius` 名字与语义不变，改为映射到 `--xh-action-*`
  桥接槽。只读方框由映射钉回静息面：悬停不升描边、按下不缩放不换底。粗指针命中区改由家族 `::after` 外扩到 44px（此前皮肤自写
  14 / 16px 外扩）。三端 computed 快照里方框多出家族给的 `gap: 0`、控件字号 14px 与 `transition-property` 的 box-shadow / opacity。

  **switch 轨道接入 Action Control text 档。** root 由 Headless 投影 `data-xh-action-control` + `data-xh-action-profile='text'` +
  `data-xh-action-variant='outline'` + `data-xh-action-display='always'` + `data-xh-action-size`（随 size，缺省 md），按下 /
  禁用面、0.97 缩放与换底、粗指针 44px 热区、焦点环与过渡改由家族配方给（§9.1「轨道」）；轨道宽高仍按
  `--xh-switch-track-h-sm / md / lg` 算（皮肤钉 `--xh-action-visual-size` / `-min-inline-size`），边界仍由内描边经 shadow 通道画、
  border 宽度归零，滑块贴 inline-start（覆盖家族的居中排布）。悬停不换面（静息已是 300 档，阶梯只给按下）。使用者槽
  `--xh-switch-bg / -bg-checked / -bg-pressed / -bg-checked-pressed / -bg-checked-readonly / -bg-disabled / -border / -border-checked / -border-checked-readonly / -border-invalid / -border-disabled / -fg / -fg-checked / -fg-checked-readonly / -fg-disabled / -radius` 名字与语义不变，改经私有槽映射到 `--xh-action-*` 桥接槽。只读与提交中的手型经
  `--xh-action-cursor-*` 给（只读另钉按下不缩放不换底）。forced-colors 下按住的轨道由家族按压块换 Highlight 底，皮肤删自写的
  outline 换色。三端 computed 快照里轨道的边色由描边色改为 transparent（宽度本就为 0）、控件字号 14px、过渡多出
  border-color / opacity。

  **rating 星接入 Action Control icon 档。** item 由 Headless 投影 `data-xh-action-control` + `data-xh-action-profile='icon'` +
  `data-xh-action-variant='ghost'` + `data-xh-action-display='always'` + `data-xh-action-size='xs'`（24px 正方盒，与此前
  `--xh-control-action-size` 同尺寸），按下 / 禁用面、0.97 缩放与换底、焦点环与过渡改由家族配方给（§9.1「星」）。静息透明；
  悬停不换底——悬停预览由点亮的星形（`data-highlighted`）表达，再给盒换面是重复的通道；按下换到 200 档中性面。使用者槽
  `--xh-rating-item-fg / -fg-highlighted / -bg-pressed / -radius / -font-size` 名字与语义不变，改为映射到 `--xh-action-*` 桥接槽；
  只读由映射钉回静息面（不缩放、不换底、手型 default）。粗指针下星本身不外扩热区（五颗星密排，44px 热区会压住相邻的星并让
  半颗判定串到邻星），家族 icon 档 `::after` 的 44px 下限在本皮肤归零。forced-colors 下家族把悬停 / 按下的盒填成
  Highlight，会吞掉同为 Highlight 的点亮星形：皮肤把盒钉回 Canvas 底，字色仍按点亮与否取 GrayText / Highlight，按住画一圈
  Highlight 内环。三端 computed 快照里星多出家族的 1px 透明描边与 `gap: 0`，`color` 不再在过渡列表里（作者图标的点亮换色
  改为即时；皮肤字形的点亮仍走 `::after` 的 clip-path 过渡）。皮肤体积基线 rating.css 6675 → 7907，涨在桥接槽映射与
  forced-colors 补救。

  **steps 触发器接入 Action Control row 档，序号圆点改读宿主 host 槽换面。** trigger 由 Headless 投影 `data-xh-action-control` +
  `data-xh-action-profile=row` + `data-xh-action-variant=ghost` + `data-xh-action-display=always` +
  `data-xh-action-size`（随 `size`，缺省 md）：序号 + 标题 + 说明的整块内容行按 §9.2 归行级，悬停 / 按下 / 禁用面、手型、过渡与
  焦点环改由家族给，按下只换面不缩放；悬停 / 按下面改经桥接槽（`--xh-steps-trigger-bg-hover / -bg-pressed` 名字与缺省不变：
  坐画布走 100 → 200）。圆点是格状当前的标记（§7.3），但不是激活宿主，不投影配方：trigger 以 `--xh-action-host-bg-hover / -pressed`
  向内声明自己是圆点的承载面（圆点静息就坐在 `--xh-bg-subtle` 上，阶梯 100 → 200 → 300），圆点在 trigger 的悬停 / 按压选择器下
  读 host 槽的同一来源换面：悬停 200（`--xh-steps-indicator-bg-hover / -bg-completed-hover` 缺省来源改为喂给 host 槽的私有槽
  `--xh-_steps-host-bg-hover`）、按下 300（`--xh-steps-indicator-bg-pressed`，缺省来源 `--xh-_steps-host-bg-pressed`），当前步按下
  换语气 active 档（`--xh-steps-indicator-bg-current-pressed`，缺省 `--xh-_tone-active` / `--xh-bg-brand-active`），不缩放。
  三端 computed 快照里 trigger 多出家族的过渡列表、`user-select: none` 与透明描边色位。

  **table 四颗把手接入 Action Control icon 档，排序把手接入 row 档。** select-all-trigger / row-select-trigger /
  column-visibility-trigger 由 Headless 投影 `data-xh-action-control` + `data-xh-action-profile='icon'` +
  `data-xh-action-variant='outline'`，expand-trigger 投 `ghost`，sort-trigger 投 `row` + `ghost`；五者都带
  `data-xh-action-display='always'` 与 `data-xh-action-size`（随 size，缺省 md）。四颗把手的盒型、按下 / 禁用面、0.97 缩放与换底、
  焦点环与过渡改由家族配方给（§9.1「方框」），边长仍钉在 `--xh-control-indicator-size`；三颗勾选框按字段静息形态取值
  （空框由透明底改为 `--xh-bg-canvas` 底 + `--xh-border-control` 描边，与独立 Checkbox 同值），勾中实心品牌面按下派生
  `--xh-bg-brand-active`；禁用底由 `--xh-bg-muted` 改为 `--xh-bg-subtle`（§7.2 第 9 条）。排序把手按表头 host 槽下发的淡底阶梯
  悬停 200 / 按下 300 只换面不缩放，内距与最小高度归零（列头自己已给）；不可排序列的把手手型改为 not-allowed（家族禁用面）。
  使用者槽 `--xh-table-trigger-size / -radius / -bg-pressed / -bg-checked / -bg-checked-pressed / -border / -border-checked / -fg / -expand-fg / -sort-bg-hover / -sort-bg-pressed / -sort-gap` 名字与语义不变，改为映射到 `--xh-action-*` 桥接槽。
  粗指针下四颗把手不外扩热区（coarse-target 登记的密排存量），家族 `::after` 的 44px 下限在本皮肤归零；排序箭头字形的
  `::after` 钉回行内位置。三端 computed 快照里把手多出家族的 1px 透明描边（展开箭头）、`gap: 0`、`line-height` 与过渡列表。

  **transfer 全选格接入 Action Control text 档。** select-all-trigger 由 Headless 投影 `data-xh-action-control` +
  `data-xh-action-profile='text'` + `data-xh-action-variant='ghost'` + `data-xh-action-display='always'` +
  `data-xh-action-size='xs'`：它是「方框 + 文案」的整行命中区（§9.2），悬停 / 按下 / 禁用面与过渡改由家族配方给
  （白底承载 hover 100 → pressed 200），按下只换面不缩放；盒随内容收宽、高度由内容高改为 xs 档的 24px 命中地板
  （16px 方框居中其间），text 档的内距与最小宽度归零。使用者槽 `--xh-transfer-select-all-gap / -radius / -bg-hover / -bg-pressed / -fg / -font-size` 名字与语义不变，改为映射到 `--xh-action-*` 桥接槽。三端 computed 快照里全选格多出家族的
  1px 透明描边与过渡列表。

  **calendar-picker 翻页钮、标题钮与日期格接入 Action Control。** prev-year / prev / next / next-year 四颗方向钮由 Headless 投影
  `data-xh-action-control` + `data-xh-action-profile='icon'` + `data-xh-action-variant='ghost'` + `data-xh-action-size='sm'`
  （32px 正方盒），heading-year / heading-month 两颗标题钮与 cell-trigger 投 `text` + `ghost` + `sm`，都带
  `data-xh-action-display='always'`；悬停 / 按下 / 禁用面、0.97 缩放与换底、焦点环与过渡改由家族配方给（§9.1「日期翻页按钮、日历格」；
  §4.1 格状当前）。日期格几何仍由网格给（家族的固定高归 auto，宽由等分轨道、高按 aspect-ratio），今天 / 选中 / 邻月 / 不可用
  经三支私有槽或桥接槽三态换值；标题钮悬停只换字色不换底，到顶那层手型 default 且不换面；只读日视图的格手型 default。
  使用者槽 `--xh-calendar-picker-nav-size / -nav-radius / -nav-bg / -nav-bg-hover / -nav-bg-pressed / -nav-fg / -nav-fg-hover / -heading-trigger-px / -heading-trigger-radius / -heading-trigger-bg-pressed / -heading-trigger-fg-hover / -heading-fg / -heading-font-size / -cell-size / -cell-radius / -cell-bg-hover / -cell-bg-pressed / -cell-fg / -cell-fg-outside / -cell-font-size / -today-bg / -today-border / -today-fg / -cell-bg-selected / -cell-bg-selected-active / -cell-bg-selected-disabled / -cell-fg-selected`
  名字与语义不变，改为映射到 `--xh-action-*` 桥接槽。粗指针下铺满整格的命中区 `::after` 钉回原几何（家族 text 档用它扩热区）。
  三端 computed 快照里方向钮的 UA 内距 6px 归 0、字号取 sm 档 13px、过渡列表随家族。

  **calendar-range-picker 翻页钮、标题钮与日期格接入 Action Control。** 与 calendar-picker 同构：四颗方向钮投 icon ghost sm、
  两颗标题钮与 cell-trigger 投 text ghost sm。区间中段的格经私有槽把悬停 / 按下换到品牌淡底阶梯（20% / 28%，§7.3 页内选中的
  叠加态），区间两端与单选的选中格重写桥接槽三态（实心品牌、按下 brand-active），邻月的区间格钉回透明底与透明边，不可用格映射
  置灰字与置灰底，只读日视图的格手型 default。使用者槽名字与语义不变，改为映射到 `--xh-action-*` 桥接槽；
  check-family-parity 的「日历族」改比日期格基础块、今天换的三支私有槽与选中格重写的桥接槽（两份皮肤不再各写 :hover / :active）。
  三端 computed 快照里方向钮的 UA 内距归 0、字号取 sm 档、过渡列表随家族。

  **checkbox-group 条目与全选格接入 Action Control row 档，方框改读宿主桥接槽换面、不再缩放。** item 与 select-all-trigger 由
  Headless 投影 `data-xh-action-control` + `data-xh-action-profile='row'` + `data-xh-action-variant='ghost'` +
  `data-xh-action-display='always'` + `data-xh-action-size='xs'`：整行是「方框 + 文案」的行级命中区（§9.2），悬停 / 按下 / 禁用面、
  手型、过渡与焦点环由家族给，按下只换面不缩放；行自己坐画布走 hover 100 → pressed 200（新增使用者槽
  `--xh-checkbox-group-item-bg-hover / -bg-pressed`、`--xh-checkbox-group-select-all-trigger-bg-hover / -bg-pressed`，缺省
  `--xh-bg-subtle` / `--xh-bg-subtle-hover`），同时以 `--xh-action-host-bg-hover / -pressed` 向内声明自己是方框的承载面
  （200 / 300）。方框（indicator 与全选格的 `::before`）不投影配方，在宿主的悬停 / 按压选择器下读宿主 host 槽的同一来源换面：
  按下由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle-active`（300，`--xh-checkbox-group-indicator-bg-pressed` 的缺省来源改为
  喂给 host 槽的私有槽 `--xh-_checkbox-group-host-bg-pressed`），勾中 / 半选按下仍换语气 active 档，不再 0.97 缩放（过渡列表去掉
  `scale`）。条目行高由 16px 变为 xs 档的 24px 命中地板（方框居中其间），组的纵向节奏每项多 8px；只读时从槽上收回整行的悬停 /
  按下面与手型；粗指针下家族 44px 热区归零（条目密排，热区会压进相邻条目）。三端 computed 快照里 item / select-all-trigger 多出
  家族的过渡列表与 `min-height: 24px`，描边色位归透明。皮肤体积基线 checkbox-group.css 11448 → 13421，涨在桥接槽映射。

  **radio-group 条目接入 Action Control row 档，圆圈改读宿主桥接槽换面、与 checkbox-group 逐档一致。** item 由 Headless 投影
  `data-xh-action-control` + `data-xh-action-profile='row'` + `data-xh-action-variant='ghost'` + `data-xh-action-display='always'` +
  `data-xh-action-size='xs'`：整行是「圆圈 + 文案」的行级命中区（§9.2），悬停 / 按下 / 禁用面、手型、过渡与焦点环由家族给，按下只换面
  不缩放；行自己坐画布走 hover 100 → pressed 200（新增使用者槽 `--xh-radio-group-item-bg-hover / -bg-pressed`，缺省 `--xh-bg-subtle` /
  `--xh-bg-subtle-hover`），同时以 `--xh-action-host-bg-hover / -pressed` 向内声明自己是圆圈的承载面（200 / 300）。圆圈不投影配方，在宿主的
  按压选择器下读宿主 host 槽的同一来源换面：按下由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle-active`（300，
  `--xh-radio-group-indicator-bg-pressed` 的缺省来源改为喂给 host 槽的私有槽 `--xh-_radio-group-host-bg-pressed`）；选中圈的描边保住，
  按下换的是圆点（新增 `--xh-radio-group-indicator-dot-pressed`，缺省语气 active / `--xh-bg-brand-active`，与 checkbox-group 勾中方框按下同档）；
  禁用圆圈补上与独立 checkbox 同档的面（新增 `--xh-radio-group-indicator-border-disabled` / `-bg-disabled` / `-dot-disabled`，缺省
  `--xh-border-default` / `--xh-bg-subtle` / `--xh-fg-disabled`），此前禁用只置灰文字、圆圈不变。条目行高由 16px 变为 xs 档的 24px 命中地板
  （圆圈居中其间），组的纵向节奏每项多 8px；只读时从槽上收回整行的悬停 / 按下面与手型；粗指针下家族 44px 热区归零（条目密排）。
  三端 computed 快照里 item 多出家族的过渡列表与 `min-height: 24px`，描边色位归透明。皮肤体积基线 radio-group.css 5328 → 7313，涨在桥接槽映射。

- 4f7ac7a: **虚拟列表的区间回调改名：`onChange` → `onRangeChange`，事件 `change` → `range-change`，载荷类型 `VirtualizerChangeDetails` → `VirtualizerRangeChangeDetails`。**

  `change` 在库里是「值变了」的名字，虚拟列表回的却是该渲哪一段——同一个名字两种含义，作者在表单里同时接 `@change` 时分不清是哪一路。现在按它真回的东西取名。三个适配器同步：Vue `@range-change`、React `onRangeChange`、自定义元素 `range-change` 事件；载荷不变（`virtualItems` / `totalSize` / `startIndex` / `endIndex`）。

- 80f9809: 新增单一 `VisualEnvironmentController`，统一解析、继承、持久化并投影 mode、brand、density、dir、contrast、motion、transparency 七轴；根作用域可显式注入 motion sink 同步 JS 动效，局部作用域只影响自身 DOM 与 Portal 壳。`createThemeController` 改为七轴控制器的五轴视图，`contrast` 基线由无效的 `base` 更正为 CSS 正式值 `default`，启用 `storageKey` 必须提供 `onStorageError`。

  移除三端 `XhConfig.motion` 隐式全局 override。React/Vue 配置改以带显式 root 的 `visualEnvironment` 绑定接线，Web Components 的全局配置接受同一绑定，`<xh-config>` 直接提供七轴局部 scope；嵌套配置不再污染兄弟树。

### Minor Changes

- 8cbcd83: **Accordion 的 trigger 接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（disclosure trigger 只换面不缩放）。**
  机器 context 新增 `pressedValue`（正被按住的条目 value），事件 `PRESS.START` / `PRESS.END`；整组或条目禁用时不进，按住途中整组转禁用
  时由机器松开。trigger 的方向键导航与按压跟踪合成为同一个 keydown 处理器。键盘表新增 `accordion.kbd.press`。三端公开 props 与事件不变。
- 80a814d: Affix 的 `target` 改为惰性取值函数。使用 `target={() => scrollRef.current}`，组件会在挂载效应执行时取得已经提交到 DOM 的滚动容器，避免首次渲染传入 `null` 后错误监听页面滚动。
- eb33c91: **Alert 的关闭按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END`；不可关闭时不进，提示收起（关闭按钮随 root 隐藏）或按住途中
  转成不可关闭时由机器松开。键盘表新增 `alert.kbd.press`。三端公开 props 与事件不变。
- 121caf3: **Anchor 链接接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器 context
  新增 `pressedValue`（正被按住的链接，按 value 记），事件 `PRESS.START { value }` / `PRESS.END { value }` 挂根级（按住
  Enter 点过去后机器在 `scrolling`，抬起在那里到达）；锚点没有禁用，守卫 `canPress` 恒放行。激活项与按压互相独立。键盘表
  新增 `anchor.kbd.press`。三端公开 props 与事件不变。
- c0d29ab: 将 `XhAnchorRoot.scrollElement` 改为挂载时求值的 getter，确保祖先滚动容器的 ref 已提交后再绑定滚动观察。
- b2e1edf: **Approval 的批准钮、拒绝钮与授权项接入按压通道：Space / Enter（授权项只认 Space）与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressed`（`ApprovalPressedKey`：`approve` / `deny` / `item:<value>`，按键记按住的那一个），事件 `PRESS.START` / `PRESS.END` 只在待决态接；判定在途、必选项未勾满的批准钮与禁用的授权项不进，判定落定或转入在途时由机器松开。
  键盘表新增 `approval.kbd.press` 与 `approval.kbd.item-press`；`ApprovalPressedKey` 进公开面。三端公开 props 与事件不变。
- f1c9a40: 将 `XhBackTopRoot.target` 改为挂载时求值的 getter，确保祖先滚动容器的 ref 已提交后再建立滚动观察。
- bdf4028: **新增 `bar-code`（条形码）：一维码七种常用码制，三端同时可用。**

  `matrix-code` 管二维码，`bar-code` 管一维码：货号、运单号、序列号、零售商品码、外箱码这些要让扫描枪一枪读出的内容。`format` 选码制——`code128`（缺省，任意 ASCII；`gs1` 打开即 GS1-128，起始符后放 FNC1，内容里的 GS 编成变长 AI 之间的分隔）、`ean13` / `ean8` / `upca` / `upce`（定长数字，校验位不给就补上、给了就核对）、`itf14`（缺省带上下承载条）、`code39`（`checksum` 附 mod 43 校验字符）。编码器自写（ISO/IEC 15417 / 15420 / 16390 / 16388），Code 128 按 GS1 通用规范的规则自动切换 A / B / C 子集与 shift；每种码制都配了独立重写的解码器做回环。

  几何走一个 `<svg>`：全部条合成一条 `<path>`，人读文字（`text`，缺省印）每段一个 `<text>`，EAN / UPC 的数字逐位落在自己那格下面、守卫条按规范延长 5X。`barWidth` 是最窄条的像素宽，整张码等比放大；`height` 是条高；`margin` 是静区，缺省按码制的规范值。内容不合码制规则（字符不在字符集、位数不对、校验位对不上）或码制不认识时一根条都不铺，根落到 `error` 态并在 `error` 里说明——画一张扫出错内容的码比不画更坏。对当前码制没有意义的选项（`gs1` 给了非 code128、`checksum` 给了非 code39、`bearerBars` 给了非 itf14）往诊断通道报一条 `bar-code.option-ignored` 警告，按没给处理。

  皮肤 `bar-code.css`：条色与底色取固定档（`--xh-bar-code-fg` / `--xh-bar-code-bg`），深色主题下不反相；人读文字走等宽字体（`--xh-bar-code-font-family`）。自定义元素 `<xh-bar-code>` 作者只写一个空的 `<svg data-xh-part="root">`。

- 0e7de3f: **Breadcrumb 链接接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  面包屑此前没有状态机，按 button 的先例补最小机器 `breadcrumbMachine`（state `idle`，context `pressedValue`
  按链接 value 记，事件 `PRESS.START { value, current }` / `PRESS.END { value }`，守卫 `canPress` 把当前页那条
  挡在外面——它带 `aria-current` 与 `aria-disabled`，是不可点的终点）。

  **破坏性：`connectBreadcrumb` 第一参由 props 改为 `Service<BreadcrumbSchema>`**，与其余跑机器的组件同构；
  `BreadcrumbProps` 仍导出（= `BreadcrumbSchema['props']`），新增导出 `breadcrumbMachine` 与 `BreadcrumbSchema`。
  `BreadcrumbLinkProps` 新增必填的 `value`（链接身份，按压通道按它记）。直接调用 headless 的使用者需改为先建机器。

  三端：Vue / React / Web Components 的 Breadcrumb 改跑 `breadcrumbMachine`（公开 props 不变）；Link 部件新增可选
  `value`（Vue / React prop、WC 的 `value` 属性），未声明时由适配器派生一个实例内稳定的键，只作按压通道的键、不写回 DOM；
  按 collection 铺开时取节点的 value。键盘表新增 `breadcrumb.kbd.press`。

- 09f8388: TreeSelect 新增 headless 懒分支加载合同：`hasChildren` 声明未取回的分支，`loadChildren({ node, signal })` 在首次展开时取得直接子项；失败保留 cause，并通过 `api.branchLoadState(value)` 与 `api.retryBranch(value)` 公开。重试、节点移除和卸载都会中止并作废旧请求，过期回调不能覆盖当前有效树。三端均透传 loader，React/Vue 默认树把懒节点渲染为 branch，Web Components 将相位接到既有 branch 属性。
- f408efb: **ButtonGroup 的 variant / tone / size 下发到组内每一段，缺省形态显式落 subtle。** `connectButtonGroup`
  的 api 新增只读的 `variant`（缺省 `subtle`，组缺省中性淡底）、`tone`、`size`，根的 `data-variant` 不传时
  投影 `subtle`。三端适配器按整组禁用同一条路把三轴落到每一段：Vue 的 `provideButtonGroupDisabled` /
  `useButtonGroupDisabled` 改为 `provideButtonGroupContext` / `useButtonGroupContext`（内部 API），React 的
  `ButtonGroupDisabledProvider` 改为 `ButtonGroupProvider`，Web Components 对未自写 `variant` / `tone` /
  `size` 属性的 `<xh-button>` 子节点写入组值并记住作者自写的那一档；段自己写了的优先，组值压过全局配置的
  `size`。段因此自带 `data-xh-action-variant`，颜色由家族形态矩阵给出。皮肤删除向段灌色的
  `--xh-button-bg / -bg-hover / -bg-active / -fg` 与依赖「段不带 data-variant」的选择器；outline 组内每一段
  的描边一律压平（外框由组根画）；solid 段成组时静息不落贴地软影、悬停不抬起，只留顶光；组内段的
  `scale: none` 兼认 `data-pressed`。视觉默认变化：组内 outline / ghost 段的按下面从 300 改家族阶梯的 200。
- 80c0cc0: **CalendarPicker 翻页钮、标题两截与日期格接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active`
  同一副按压面。** 机器 context 新增 `pressed`（`CalendarPickerPressedKey`：`prev-year` / `prev` / `next` / `next-year` /
  `heading-year:面板` / `heading-month:面板` / `cell:ISO`，类型进公开面），根级事件 `PRESS.START { key, disabled? }` /
  `PRESS.END { key }`；守卫 `canPress` 在整张禁用、到界 / 到顶 / 不可选的部件上不进，只读只挡日期格（翻页与钻层照常）；
  按住途中转入禁用或只读、钻层换视图、视窗挪动时由机器自行松开对应的那一个。DatePicker / DateRangePicker 内嵌的日历复用
  同一份 connect，随之接上。皮肤按压面由 Action Control 家族配方给出；键盘表新增 `calendar-picker.kbd.press`。三端公开
  props 与事件不变。
- 701a791: **CalendarRangePicker 翻页钮、标题两截与日期格接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针
  `:active` 同一副按压面。** 机器 context 新增 `pressed`（`CalendarRangePickerPressedKey`：`prev-year` / `prev` / `next` /
  `next-year` / `heading-year:面板` / `heading-month:面板` / `cell:ISO`，类型进公开面），根级事件 `PRESS.START { key, disabled? }`
  / `PRESS.END { key }`；守卫 `canPress` 在整张禁用、到界 / 到顶 / 不可选的部件上不进，只读只挡日期格（翻页与钻层照常）；
  按住途中转入禁用或只读、钻层换视图、视窗挪动、拖选结束时由机器自行松开对应的那一个。触屏按下先投影按压面，拖选起点仍按
  延时落下，两者互不打断；手指滑到另一格抬起时松开先前按住的那一格。DateRangePicker 内嵌的日历复用同一份 connect，随之接上。
  皮肤按压面由 Action Control 家族配方给出；键盘表新增 `calendar-range-picker.kbd.press`。三端公开 props 与事件不变。
- 3e5079c: Cascader 与 Combobox 的 Layer、DismissableLayer 及 Cascader FocusScope 现在由 Headless 共享 Presence 资源控制器持有：逻辑关闭立即令 content `inert` 并退出可访问树，行为资源延后到全部有限 CSS 退场完成后释放；退场中重开会复用原 Layer，并重新激活 Cascader 焦点域。
- c2ca771: **Carousel 的两端翻页钮、播放开关与指示点接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressed`（`CarouselPressedKey`：`prev` / `next` / `autoplay` / `indicator:<页码>`），事件 `PRESS.START` / `PRESS.END` 挂根级；到边界的翻页钮与没配自动播放的开关不进，按住途中翻到边界、关掉 `loop` 或去掉 `autoplay` 时由机器松开。
  指示点皮肤的按压规则改为 `:is(:active, [data-pressed])`，并补 `forced-colors: active` 下的系统前景描边。键盘表新增 `carousel.kbd.press`；`CarouselPressedKey` 进公开面。三端公开 props 与事件不变。
- a35d0b2: **级联选择补齐首次加载的默认状态面。** 此前 `Content` 只自动装配 Empty；`collection=[]` 且
  `loading=true` 时，连接层会把 Empty 隐藏，却没有 Loading 接住，浮层只剩一圈没有内容的边框。
  Vue、React 与 Web Components 现在都会在作者未写 Loading 时自动补一枚，并读取新增的
  `CascaderTranslations.loading`（缺省 `Loading`）；作者显式写了 Loading 时只保留作者这一枚，
  不会并排生成第二份。

  Loading 只在当前视图没有候选时占据状态区。已有候选或已展开的祖先列仍保持可见、可操作，
  浮层只用 `aria-busy` 报告后台刷新；空态与在途态都以 `role="status"` 独立于各列的 listbox 语义。

- 92b0a56: **Cascader 列内条目、检索候选与清空按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active`
  同一副按压面。** 机器 context 新增 `pressedPart`（`item` / `search-item` / `clear-trigger`）与 `pressedValue`（条目
  value 或候选整条路径的键，清空按钮记 null），根级事件 `PRESS.START { part, value?, disabled? }` / `PRESS.END { part, value? }` 两个状态都认；守卫 `canPress` 在禁用、只读或加载时三者都不进，条目或候选自身禁用时不进，清空按钮没有值可清
  时不进；`endPress` 只松开 part + value 对应的那一个，open 态 exit 时随浮层收起一并松开，按住途中转入禁用 / 只读 /
  加载或值被清空时由机器自行松开。列内条目自己接键盘与触屏；检索视图里焦点恒在检索框，候选的键盘按压由检索框代发
  （Enter 按住时高亮候选投影），候选自己只接触屏。trigger 与 control 是字段外壳，不接。Collection Item（overlay 语境）
  与 Action Control（field-inset 档）家族配方的按压选择器已是 `:is(:active, [data-pressed])`；键盘表新增
  `cascader.kbd.press` 与 `cascader.kbd.search.press`。三端公开 props 与事件不变。
- 3490b78: **CheckboxGroup 条目与全选格接入按压通道：Space 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（行换面、方框随行换底）。**
  机器 context 新增 `pressedPart`（`item` / `select-all-trigger`，类型 `CheckboxGroupPressedPart`）与 `pressedValue`（按住的条目
  value，全选格为 null），事件 `PRESS.START { part, value?, disabled? }` / `PRESS.END { part, value? }`；守卫 `canPress` 在整组禁用、
  只读或条目自身禁用时不进；`endPress` 只松开 part + value 对应的那一个；按住途中整组转入禁用或只读时由机器自行松开。
  `role=checkbox` 只有 Space 是激活键，Enter 不进按压面；选中与按压互相独立，Space 在 keydown 那一刻照旧翻转。皮肤的按压选择器
  已是 `:is(:active, [data-pressed])`（缩放归零，只换面）；键盘表新增 `checkbox-group.kbd.press`。三端公开 props 与事件不变。
- 4b0f2c0: **Checkbox 方框接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressed`，根级事件 `PRESS.START` / `PRESS.END`；守卫 `canPress` 在禁用或只读时不进；按住途中
  转入禁用或只读时由机器自行松开。方框是原生按钮，Space 与 Enter 都是激活键，两键都进按压面；按压与勾选态互相
  独立，按住途中勾选态翻转不会丢掉按压面。皮肤按压面由 Action Control 家族配方给出（选择器已是
  `:is(:active, [data-pressed])`）；键盘表新增 `checkbox.kbd.press`。三端公开 props 与事件不变。
- f204269: **CodeView 的折叠条接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（disclosure trigger 只换面不缩放）。**
  代码块此前没有状态机，按 button 的先例补最小机器 `codeViewMachine`（state `idle`，context `pressed`，事件 `PRESS.START` / `PRESS.END`，
  守卫 `canPress` 只在代码可折叠时放行——不可折叠时折叠条带 `hidden`；按住途中代码或阈值变了、折叠条随之收起时由机器松开）。

  **破坏性：`connectCodeView` 由 `(props, scope, normalize)` 改为 `(service, normalize)`**，与其余跑机器的组件同构；`CodeViewProps` 仍导出
  （= `CodeViewSchema['props']`），新增导出 `codeViewMachine`、`CodeViewSchema` 与 `isCodeViewFoldable`（connect 与守卫共用的可折叠判据）。
  直接调用 headless 的使用者需改为先建机器并把 scope 交给它。

  三端：Vue / React / Web Components 的 CodeView 改跑 `codeViewMachine`（公开 props、事件与部件不变）；`<xh-code-view>` 只在作者未给
  `highlighter` 时于 wire 阶段请求默认着色包，读 props 的路径不再触发加载。键盘表新增 `code-view.kbd.press`。

- 1e79021: **Collapsible 的 trigger 接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（disclosure trigger 只换面不缩放）。**
  机器 context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 在开合两态都接；禁用时不进，按住途中转禁用时由机器松开。
  键盘表新增 `collapsible.kbd.press`。三端公开 props 与事件不变。
- e124792: **ColorField 清空按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器
  context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级，按压与清空同一道 `canClear` 守卫（未开 clearable、
  禁用、只读或没有值时不进）；按住途中值被清空、关掉 clearable 或转入禁用 / 只读时由机器自行松开。清空按钮的
  pointerdown 仍拦默认聚焦，焦点留在输入框。键盘表新增 `color-field.kbd.press`。三端公开 props 与事件不变。
- 74004f7: **新增** `color-field` 组件（颜色字段）：一个能手打颜色串的单行框，旁边一块当前颜色的色块。

  - 认 `#rgb` / `#rrggbb(aa)`、`rgb()` / `rgba()`、`hsl()` / `hsla()`；打字只留草稿（`data-editing`），回车或失焦收下后按 `format` 重写成规范写法，`alpha` 决定带不带透明度；Escape 放弃草稿；收不下的草稿留在框里并标成无效。
  - 空串是合法的「没有颜色」：`clearable` 开清空按钮与 Escape 清空；表单出口经 `hidden-input` 提交收下的值，框里的半截字不会被提交。
  - 视觉盒走 Field Chrome、色块走 Swatch 家族、清空按钮走 Action Control 的 field-inset 档；放进 `field` 里时说明、错误与四条状态轴随字段下发。
  - Vue `XhColorField*` 与 `useColorField`；React 同名组件与 hook；自定义元素 `<xh-color-field>`（`value` / `default-value` / `format` / `alpha` / `clearable` / `name` 等 attribute，`translations` 只走 property；`setValue` / `clear` / `commit` 命令式方法与 `canClear` / `editing` 只读属性）；皮肤 `@xihan-ui/styles/color-field.css`，覆盖槽前缀 `--xh-color-field-*`。

- 33aa758: ColorPicker 与 HoverCard 现在复用 Headless Presence 行为资源控制器：逻辑关闭立即令 content `inert` 并退出可访问树，Layer、DismissableLayer 及 ColorPicker FocusScope 延后到有限 CSS 退场完成后释放；退场中重开复用原资源。
- 740e2e7: **ColorPicker 屏幕取色按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级；禁用、只读或环境没有 EyeDropper 时不进；屏幕取色一开
  （窗口随即失焦）、浮层收起，或按住途中转入禁用 / 只读时由机器松开。皮肤里取色按钮的按压规则由 `:active` 改为
  `:is(:active, [data-pressed])`，并在 `forced-colors: active` 下用系统高亮反色画回按压面。键盘表新增 `color-picker.kbd.press`。
  三端公开 props 与事件不变。
- 8503826: **新增** `color-slider` 组件（颜色滑块）：一条只推颜色某一路的滑杆，值是整个颜色串。

  - `channel` 七选一：`hue`（0-360）、`saturation` / `brightness` / `alpha`（0-100）、`red` / `green` / `blue`（0-255）；`format` 决定写法，`alpha` 决定串里带不带透明度（缺省时推透明度那一路带、其余不带）。
  - 轨道渐变由连接层按当前颜色现算写成内联 `background-image`（其余分量不动，只让本通道从 min 走到 max），拇指填当下那一档的颜色；透明度那一路皮肤垫棋盘格。
  - 拖动、键盘（方向键 / PageUp / PageDown / Home / End）、RTL 掉头与竖直排布整份取自内嵌的 `slider` 机器；`onValueChange` 拖动中连发，`onValueChangeEnd` 松手只发一次；灰度处色相靠锚保住。
  - Vue `XhColorSlider*` 与 `useColorSlider`；React 同名组件与 hook；自定义元素 `<xh-color-slider>`（`value` / `default-value` / `channel` / `format` / `alpha` / `orientation` / `dir` / `size` / `name` 等 attribute，`translations` 只走 property）；皮肤 `@xihan-ui/styles/color-slider.css`，覆盖槽前缀 `--xh-color-slider-*`。

- 5b8a8fd: **ColorSwatchPicker 色格接入按压通道：Space 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（换描边并缩放）。**
  机器 context 新增 `pressedValue`（正被按住的格子，按颜色串记），事件 `PRESS.START { value, disabled? }` / `PRESS.END { value }`；
  守卫 `canPress` 在整组禁用、只读与格子自身禁用时不进，按住途中整组转入禁用或只读时由机器自行松开。role=radio 只有
  Space 是激活键，Enter 那一路没有按压面。ColorPicker 内嵌的预设色板复用同一份 connect，随之接上。键盘表新增
  `color-swatch-picker.kbd.press`。三端公开 props 与事件不变。
- 1b63bf3: **新增** `color-swatch-picker` 组件（颜色色块选择器）：从一组固定颜色里挑一个，每格是一颗 `role=radio` 的色块。

  - 与单选组同一套 roving tabindex：整组一个 Tab 位，四个方向键移焦点并选中、回绕、跳过禁用格，Space 选中；焦点从组外进来落在已选中的格子上。
  - 选中按颜色比不按串比（`rgb(255, 0, 0)` 与 `#ff0000` 是同一格）；`swatches` 给数据时可及名字与禁用从数据里查，格子部件只报 `value`，不写默认内容时按数据自动铺开。
  - 每格的色块面走 Swatch 家族；`readOnly` 只挡落值不挡焦点；表单出口是每格内一份 `inert` 的隐藏原生 radio。
  - Vue `XhColorSwatchPicker{Root,Label,Item}` 与 `useColorSwatchPicker`；React 同名组件与 hook；自定义元素 `<xh-color-swatch-picker>`（`value` / `default-value` / `disabled` / `read-only` / `invalid` / `required` / `dir` / `name` / `size` attribute，`swatches` 与 `translations` 只走 property；格子部件用 `value` / `label` 属性声明）；皮肤 `@xihan-ui/styles/color-swatch-picker.css`，覆盖槽前缀 `--xh-color-swatch-picker-*`。

- 216095b: **新增** `color-swatch` 组件（颜色色块）与 Swatch 色块面家族配方。

  - 色块把一个颜色画成一小块给人看，不接交互：认 `#rgb` / `#rrggbb(aa)`、`rgb()` / `rgba()`、`hsl()` / `hsla()`，解析不出时只画棋盘格底并带 `data-invalid`；`label` 给读屏一个有含义的名字，不给就念颜色串，两者都没有时整块视为装饰。
  - 家族配方 `@xihan-ui/styles/swatch.css`（`recipes/swatch.recipe.json` 生成）：棋盘格底、颜色填充层、描边与 sm / md / lg 尺寸档只有这一份真源，消费者投影 `data-xh-swatch` / `data-xh-swatch-size` 并经私有槽 `--xh-_swatch-color` 写入颜色；高对比模式退出强制着色保住原色，打印保留底色。色块选择器、颜色字段与取色器里的当前色块随后都改吃它。
  - Vue `XhColorSwatch`；React 同名组件；自定义元素 `<xh-color-swatch>`（`value` / `size` / `label` 三个 attribute）；皮肤 `@xihan-ui/styles/color-swatch.css`，覆盖槽前缀 `--xh-color-swatch-*`。

- e2956f1: **Combobox 候选、展开按钮与清空按钮接入按压通道：Enter / Space 与触屏按住投影 `data-pressed`，与指针 `:active`
  同一副按压面。** 机器 context 新增 `pressedPart`（`item` / `trigger` / `clear-trigger`）与 `pressedValue`（候选
  value，两个按钮记 null），根级事件 `PRESS.START { part, value?, disabled? }` / `PRESS.END { part, value? }` 两个
  状态都认；守卫 `canPress` 在禁用、只读或加载时三者都不进，候选自身禁用（部件声明或 collection）时不进，清空按钮没有
  东西可清时不进；`endPress` 只松开 part + value 对应的那一个，open 态 exit 时候选随浮层收起一并松开，按住途中转入
  禁用 / 只读 / 加载或值与输入串都被清空时由机器自行松开。焦点恒在输入框：候选的键盘按压由输入框代发（Enter 按住时
  高亮候选投影），候选自己只接触屏；两个按钮在焦点落到自己身上时由 Enter / Space 按住投影。Collection Item（overlay
  语境）与 Action Control（field-inset 档）家族配方的按压选择器已是 `:is(:active, [data-pressed])`；键盘表新增
  `combobox.kbd.press`。三端公开 props 与事件不变。
- a2a1be7: **Command 接入 Collection Item 配方：面板改 overlay 圆角 + sheet 三件套，命令补按下面，结果列表三端接自绘条。**

  - 命令投影 `data-xh-collection-item` / `-size` / `-context='overlay'`，`item-text` 落 `text` 槽。`aria-selected` 仍跟着活动候选走，家族的浮层选中面映射到与悬停同一档（`--xh-bg-subtle`），不投影对号槽，视觉上仍不绘制对号或选中底；按下 200（`--xh-bg-subtle-hover`，此前零反馈）与禁用面由家族给，新增 `--xh-command-item-bg-pressed`。
  - 面板由「surface 8px 圆角 + `--xh-bg-surface` + `--xh-elevation-sheet` 无描边」改为与 Dialog 同档：`--xh-shape-overlay` 12px 圆角，`--xh-material-elevated-border` 描边 + `--xh-material-elevated-bg` 底 + `--xh-material-elevated-shadow` 影，新增 `--xh-command-border`；`--xh-command-bg` / `--xh-command-fg` / `--xh-command-shadow` / `--xh-command-radius` 槽名不变、缺省随之改变。
  - 结果列表接自绘条：Vue / React `useScrollbars`、Web Components `ScrollbarsController`，壳是面板自己，条子走 4px 档；list 补 `overscroll-behavior: contain`，content 声明 `--xh-scrollbar-track-bg: transparent`。
  - 定位层与面板上 `--xh-icon-size` 缺省由随文字形改为 `--xh-glyph-size-md` 并随 `size` 换档。
  - 皮肤体积基线随面板三件套与家族槽映射重落（10621 → 11969 字节）。

- 652936c: **Command 命令接入按压通道：Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器 context 新增
  `pressedValue`（命令 value），根级事件 `PRESS.START { value, disabled? }` / `PRESS.END { value }` 两个状态都认；守卫
  `canPress` 在加载中不进，命令自身禁用（部件声明或清单）时不进；`endPress` 只松开 value 对应的那一条，open 态 exit 时随
  面板收起一并松开，按住途中转入加载时由机器自行松开。焦点恒在检索框，命令的键盘按压由检索框代发（Enter 按住时锚点命令
  投影），命令自己只接触屏。Collection Item（overlay 语境）家族配方的按压选择器已是 `:is(:active, [data-pressed])`；
  键盘表新增 `command.kbd.press`。三端公开 props 与事件不变。
- 57adc57: Command 与 Tooltip 现在由 Headless Presence 资源控制器持有真实退场资源：逻辑关闭立即令 content
  `inert` 并退出可访问树，Layer、DismissableLayer 及 Command 的 FocusScope、滚动锁与背景失活延后
  到全部有限 CSS 退场完成后释放；退场中不重复消解，重开复用原资源。Tooltip 原有开闭延时与
  trigger/content 间悬停语义保持不变。
- 21bcb16: **ContextMenu 接入 Collection Item 配方：条目按下面由 300 改 200，浮层条子走 4px 档并补 overscroll 隔离。**

  - 条目投影 `data-xh-collection-item` / `-size` / `-context='overlay'`，`item-text` 落 `text` 槽、`item-indicator` 落 `prefix` 槽（常显前导图标，不是选中对号）、`item-description` 落 `description` 槽，分隔线投影 `data-xh-collection-separator`；子菜单触发项由子层的 Menu 机器合并同一批标记并在子层开着时报 `data-in-path`。
  - 悬停 / 键盘锚点 100（`--xh-bg-subtle`）、按下 200（`--xh-bg-subtle-hover`，此前是 `--xh-bg-subtle-active` 300）、打开路径与 hover 同档、禁用面都由家族给，皮肤只映射公开槽；`--xh-context-menu-item-bg-pressed` 缺省随之改变。
  - 标记位盒尺改随家族按档下发的 `--xh-icon-size`（md 20px）；根与定位层上 `--xh-icon-size` 缺省由随文字形改为 `--xh-glyph-size-md` 并随 `size` 换档，content 上的重复声明删除。
  - content 补 `overscroll-behavior: contain`；三端自绘条改传 `size: 'sm'`（浮层里的条子走 4px 档）。

- 921463b: **ContextMenu 条目接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  触发区的长按等待已占用 `PRESS.START` / `PRESS.END`（`closed → pressing`，投影 `data-pressing`），条目的按压另起
  事件 `ITEM.PRESS.START { value, disabled }` / `ITEM.PRESS.END { value }`，写入新增的 context `pressedValue`，不复用
  `pressing` 状态；守卫 `canPressItem` 在条目禁用（部件声明或 collection）时不进，`endItemPress` 只松开 value 对应的
  那一条，open 态 exit 时由机器自行松开。条目 getter 投影 `data-pressed`，Collection Item 家族配方的按压选择器已是
  `:is(:active, [data-pressed])`；键盘表新增 `context-menu.kbd.press`。三端公开 props 与事件不变。
- 441c426: **DateField 清空按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器
  context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级，守卫 `canPress` 与清空按钮的显隐同一口径（可编辑且在用的
  段里填了哪怕一段，禁用、只读或一段都没填时不进）；按住途中段位被清空或转入禁用 / 只读时由机器自行松开。清空按钮的
  pointerdown 仍拦默认聚焦，焦点留在段位上。date-picker / date-range-picker 自家的清空按钮由各自的根机器负责，不在此列。
  键盘表新增 `date-field.kbd.press`。三端公开 props 与事件不变。
- fa05663: **DatePicker 触发钮、清空钮、确认钮、快捷选项与时间格接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针
  `:active` 同一副按压面。** 编排机器 context 新增 `pressed`（按 key 记住正被按住的那一个，新增导出类型 `DatePickerPressedKey`；
  日历里的翻页钮、标题与日期格由 calendar-picker 自己投影），事件 `PRESS.START` / `PRESS.END` 挂根级：整体禁用谁都不进；
  只读时触发钮与确认钮只管开合、照有回执，清空钮、快捷选项与时间格与它们的写值同一道门不进；与模式不配、不可用或作者禁用的
  快捷选项不进，藏起的确认钮不进。浮层收起时浮层里按住的部件由机器自行松开（Enter 在 keydown 即写值 / 确认收起，不再有 keyup）；
  按住途中转入禁用 / 只读或值被清空同样自行松开。键盘表新增 `date-picker.kbd.press`。三端公开 props 与事件不变。
- 9e57b36: **DateRangePicker 触发钮、清空钮与快捷选项接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副
  按压面。** 编排机器 context 新增 `pressed`（按 key 记住正被按住的那一个，新增导出类型 `DateRangePickerPressedKey`；日历里的
  翻页钮、标题与日期格由 calendar-range-picker 自己投影），事件 `PRESS.START` / `PRESS.END` 挂根级：整体禁用谁都不进；只读时
  触发钮照常展开、照有回执，清空钮与快捷选项与它们的写值同一道门不进；不成一对、不可用或作者禁用的快捷选项不进。浮层收起时
  浮层里按住的部件由机器自行松开（Enter 在 keydown 即写值收起，不再有 keyup）；按住途中转入禁用 / 只读或值被清空同样自行松开。
  键盘表新增 `date-range-picker.kbd.press`。三端公开 props 与事件不变。
- d374f89: **新增** `date-range-picker` 组件（日期范围选择器）：起止两组可键入的分段日期框、`range-separator`、日历触发器与内嵌 `calendar-range-picker` 的浮层组合成一个字段，承接原 `date-picker` `selectionMode="range"` 那一路。

  - 值恒为区间两端 `[start, end]`，按位存放，空缺的一端用空串占位（只填了终点是 `['', end]`），受控回写按同一份下标认领；`api.start` / `api.end` 直接取两端，两端都落定时 `periodValue` 给出周期首尾与回显键。
  - `name` 与 `endName` 各自决定两份 `hidden-input` 参不参与提交；`segment-group` 带 `data-index`（0 起点、1 终点），方向键换段不跨组，两组各报「开始日期」「结束日期」（`translations.startDate` / `endDate`）。
  - 浮层里是范围日历：先落起点再落终点，两端都落定才写值并（`closeOnSelect`）收起；`min` / `max` / `isDateUnavailable(value, anchor)` / `allowsNonContiguousRanges` / `visibleCount` / `granularity` 一并转给日历；终点早于起点或任一端越界时整个字段标为不合法。
  - `presets` 只收区间（`start/end` 写法），`dateRangePickerPresetRange` / `dateRangePickerPresetMonth` / `dateRangePickerPresetYear` 三个纯函数按时区算「近 N 天」「本月」「今年」。
  - Vue `XhDateRangePicker*` 与 `useDateRangePicker`；React 同名组件与 hook；自定义元素 `<xh-date-range-picker>`（`value` / `default-value` 是数组，只走 property）；皮肤 `@xihan-ui/styles/date-range-picker.css`，覆盖槽前缀 `--xh-date-range-picker-*`。

- 38efe68: 修复日期时间选择器的完整分段显示，统一清空按钮与选择图标的互斥状态，并为字段聚焦、日历按压和组件内部滚动补齐一致的反馈。
- 1587d60: DatePicker 与 TimePicker 现在复用 Headless Presence 行为资源控制器：逻辑关闭立即令 content `inert` 并退出可访问树，Layer、DismissableLayer 与 FocusScope 延后到有限 CSS 退场完成后释放；退场中重开复用原资源并重新激活焦点域。
- 09a1a45: Dialog 与共用机器的 Drawer 在退出期间立即失活内容，保持模态资源直到内容和遮罩实际完成退出，并提供 onExitComplete/exit-complete 通知。重开撤销旧退出且恢复原焦点域，卸载立即清理。

  Presence.claimExit 删除 timeoutMs 参数，CSS 退出不再猜测声明时长或首个事件完成，而等待全部实际有限动画对象完成或取消；自定义租约必须由创建方完成或取消。FocusScope 增加 reactivate()，供保留中的焦点域恢复域内焦点。

- 12958c2: **DiffView 的展开按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（disclosure trigger 只换面不缩放）。**
  diff-view 机器 context 新增 `pressedValue`（按折叠格 id 记），事件 `PRESS.START { value }` / `PRESS.END { value }`；按住途中那一格被展开
  （Enter 在 keydown 即 click，折叠格离开行序）时由机器松开，受控写回同样松开。`<xh-diff-view>` 在行序未变时也刷新展开按钮的属性，
  按压面不再被「内容未变不重铺」挡住。键盘表新增 `diff-view.kbd.press`。三端公开 props 与事件不变。
- 009167e: **Editable 编辑 / 提交 / 撤销三颗按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副
  按压面。** 机器 context 新增 `pressed`（按 part 键记住正被按住的那颗，新增导出类型 `EditablePressedPart`），事件
  `PRESS.START` / `PRESS.END`：预览态只认编辑按钮（禁用 / 只读时不进），编辑态只认提交 / 撤销按钮；进出编辑态时由机器
  自行松开（Enter 在 keydown 即激活，随后按钮藏起不再有 keyup），按住编辑按钮途中转入禁用 / 只读同样自行松开。
  提交 / 撤销按钮的 pointerdown 仍把焦点摁在输入框里。键盘表新增 `editable.kbd.press`。三端公开 props 与事件不变。
- 1ff2803: **FieldArray 新增把手与行内的删除 / 上移 / 下移把手接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针
  `:active` 同一副按压面。** 机器 context 新增 `pressed`（按 key 记住正被按住的那一个，行内把手按机器分配的行序号区分；
  新增导出类型 `FieldArrayPressedKey`），事件 `PRESS.START` / `PRESS.END` 挂根级；整体禁用 / 只读，以及到上下限、首末行
  这类 aria-disabled 的把手不进。删除 / 换序落地后把手随行离场或换位时由机器当场松开；按住途中转入禁用 / 只读，或作者
  整份换掉值使该行离场时同样松开。键盘表新增 `field-array.kbd.press`。三端公开 props 与事件不变。
- 5c202e3: **FileUpload 选择钮、逐条删除钮与清空钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副
  按压面。** 机器 context 新增 `pressed`（按 key 记住正被按住的那一个，删除钮按文件标识；新增导出类型 `FileUploadPressedKey`），
  事件 `PRESS.START` / `PRESS.END` 挂根级，禁用时不进；按住途中转入禁用，或按住的删除钮随文件一起离开列表（Enter 在 keydown
  即删）时由机器自行松开；选择钮打开系统文件框后随窗口失焦撤下。投放区仍不投影（按下回执由拖入态给出）。皮肤里三颗钮的按压规则
  由 `:active` 改为 `:is(:active, [data-pressed])`，并在 `forced-colors: active` 下用系统高亮反色画回按压面。键盘表新增
  `file-upload.kbd.press`。三端公开 props 与事件不变。
- cf2e555: 为 FloatButton 建立专用 Headless 状态机与逻辑浮层生命周期。click/hover 展开后由同一
  Document 的 LayerRegistry 仲裁层外 pointerdown 和全局 Escape，后开的 Drawer/Popover
  优先消解，Toast 反馈通道不占可消解父层；关闭、禁用写回与卸载均精确释放资源。

  受控实例的交互只派发 open-change 意图，父级写回前不改可见 DOM；hover 模式的层外
  pointer/focus 由同一次 pointerleave 收口，disabled watch 每次变更只派一次意图。三端适配器仅桥接 RuntimeConfig、
  LayerRegistry 登记函数与根节点引用。

- affa413: **Form 提交钮、重置钮与错误摘要条目接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副
  按压面。** 机器 context 新增 `pressed`（按 key 记住正被按住的那一个，摘要条目按字段路径键区分；新增导出类型
  `FormPressedKey`），事件 `PRESS.START` / `PRESS.END` 挂根级；整体禁用一律不进，只读时重置钮不进，所指字段没有错误
  （藏着）的条目不进；异步校验在途（提交或逐字段）时不进，按住途中开跑即由机器松开。按住途中转入禁用 / 只读，或条目所指
  字段改好了时同样松开。皮肤里错误摘要条目补上集合行的换面反馈：悬停 `--xh-bg-subtle`（100）、按下
  `--xh-bg-subtle-hover`（200）只换面不缩放，走按压 / 释放时间线，`forced-colors: active` 下用系统高亮反色画回；新增
  覆盖槽 `--xh-form-summary-item-bg / -bg-hover / -bg-pressed / -px / -radius`。键盘表新增 `form.kbd.press`。三端公开
  props 与事件不变。
- e59b69d: Form 增加独立的 validationError 状态和校验执行异常事件，保留原始 cause、值快照及触发字段。
  同步抛错和异步拒绝都会结束当前快照的校验，不再产生未处理拒绝或卡在忙碌态，也不伪装成字段错误。
  已启动异步规则后再遇到同步异常时，仍将整批 Promise 纳入拒绝处理，不遗漏随后失败的任务。
  新校验、变值和重置清除旧异常，重试由业务显式触发。
  三端均提供异常状态读取；Vue/Web Components 发出 validation-error，React 使用 onValidationError。
- 775a3a9: Button 文档示例按常用场景重排，首例保持最标准用法，并统一变体、尺寸、图标、加载、全宽、禁用与链接示例。

  React `XhButton` 在 `as="a"` 时公开 `href`、`target` 与 `rel` 类型。

  React `XhIcon` 将结构化图标的 SVG 呈现属性转换为 React 属性名，避免运行时无效属性警告。

  ButtonGroup 默认分隔线在浅色与深色按钮面上均保持清晰可见。

- cd1a841: **HoverCard 说明文字改说明档，卡片面补 overscroll 隔离，自绘条走浮层档。** 视觉默认变化：description 字号
  `--xh-text-body-size` 14 → `--xh-text-secondary-size` 13（新增 `--xh-hover-card-description-font-size` 槽）；content
  新增 `overscroll-behavior: contain`，滚到头不再把页面一起带走；三端的自绘滚动条改走浮层 4px 档（`size: 'sm'`）。
- 21b006a: `trackHoverIntent` 的触发器从误导性的动态 `getTriggerEl` 改为必填 `trigger` 创建快照。跟踪器固定使用该元素所属的 Document 与 Window，严格校验动态 content、计时参数与活动 realm，并在 content 换代、重复安全三角和重复清理时完整释放旧资源。

  Menu 与 SideNav 在各自 effect 的 DOM flush 中解析 trigger；无渲染器或该次提交没有节点时，该 effect 明确保持未绑定。SideNav 后续悬停会话会重新建立状态 effect，Menu 调用方则必须在启动服务前接好锚点引用。

  Vue 与 React 的 `useHoverIntent` 继续接受 nullable trigger getter，并新增各自公开的 `UseHoverIntentOptions`。包装会在 DOM 提交后绑定，随 trigger 与计时参数重建；Vue 的 content getter 和意图回调读取当前响应式选项，React 读取最近一次已提交选项。

- 5e2efdd: `image-viewer` 现在以 Headless 的 Presence 租约为退出生命周期真源：逻辑关闭立即让内容 `inert` 并退出可访问树，内容和遮罩的全部有限退场完成后才释放 Layer、焦点域、滚动锁与背景失活。退场期间不会再次响应 Escape 或外部交互；重开撤销旧租约并重新激活原焦点域，卸载立即释放资源。

  三端均追踪 content 与 backdrop 的退出租约，避免一侧提前完成就提前卸载；不新增 ImageViewer 的退出完成公开事件或回调。

- c87cc26: **ImageViewer 的关闭钮、工具条七颗与两端翻页钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressed`（`ImageViewerPressedPart`，按 part 键记按住的那一颗），事件 `PRESS.START` / `PRESS.END` 挂根级、只在展开态接；贴住缩放端点的缩放钮与到边界的翻页钮不进，按住途中转禁用或浮层收起时由机器松开。
  键盘表新增 `image-viewer.kbd.press`；`ImageViewerPressedPart` 进公开面。三端公开 props 与事件不变。
- ea27877: **`infinite-scroll` 的取下一页按钮接入 Action Control row outline 档，默认几何与阶梯会变。** connect 在
  `load-more-trigger` 上投影 `data-xh-action-control` / `profile="row"` / `variant="outline"` / `display="always"` /
  `size="md"`（本组件没有 size 轴，档位固定）。真源 §9.2 把 load-more trigger 归为铺满一行的独立动作条目：宽度由容器给
  （`inline-size: 100%`）、高度随内容（至少一个控件高 36px，内衬 `--xh-list-option-py-md`、正文行高，文案可折行）、按下只换面
  不缩放。此前它是一颗行内 `inline-flex` 描边钮，宽度随文案、按下缩到 0.97。

  皮肤 `@import` 家族 action-control，删除按钮自写的盒、底、边、transition、hover / active / 缩放规则，改为映射家族桥接槽
  （`--xh-infinite-scroll-load-more-gap` / `-h` / `-px` / `-radius` / `-border` / `-border-hover` / `-bg` / `-bg-hover` /
  `-bg-active` / `-fg` / `-font-size` 使用者槽全部保留为第一参数），只留文案居中、正文行高与 `touch-action: manipulation`；
  新增使用者槽 `--xh-infinite-scroll-load-more-icon-size`（映射 `--xh-icon-size`，缺省按档取
  `--xh-_action-profile-glyph-size` 20px）。默认外观变化：静息底由 `--xh-bg-canvas` 改为透明（描边仍 `--xh-border-control`、
  control 圆角、无影）；悬停由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100）+ `--xh-border-control-hover`；按下由
  `--xh-bg-subtle-active`（300）+ 0.97 缩放改为 `--xh-bg-subtle-hover`（200）只换面（白底承载阶梯）；焦点环、禁用面
  （`data-disabled` 时透明底 + `--xh-fg-disabled` + `--xh-border-subtle`）与粗指针 44px 热区由家族给；取数中（`data-loading`）
  不再响应悬停。

  登记如实缩小：check-press-feedback 把 `infinite-scroll:load-more-trigger` 改登记为 `{ feedback: 'surface' }`，family-backlog
  删 press 段 1 条与 ladder 段 hover / pressed 2 条；check-dead-state-attr 删 `infinite-scroll:data-loading` 钩子（在途守卫由家族
  配方消费）。文档示例的取页钮外层不再用 flex 居中，按钮自己铺满一行。

- 714cc99: **InfiniteScroll 的 load-more-trigger 接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（row 档只换面不缩放）。**
  机器 context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级；取数中与关闭时不进，按住途中进入取数 / 关闭两段时由机器松开。
  键盘表新增 `infinite-scroll.kbd.press`。三端公开 props 与事件不变。
- c4e10d5: 为 InputGroup 新增 `primary | secondary` 视觉变体，并将前缀、输入控件与后缀统一为一个输入表面。皮肤体积增加用于补齐外层材质、悬停、聚焦、校验与强制色状态，同时消除子输入重复绘制的背景、描边和阴影。
- 31b54f4: **JsonViewer 的分支行接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（行只换面不缩放）。**
  机器 context 新增 `pressedValue`，事件 `PRESS.START` / `PRESS.END` 按行路径记按住的那一行；键盘那一路由 `branch` 代发（焦点落在它身上），触屏按在 `branch-control` 上。
  皮肤的按压规则改为 `:is(:active, [data-pressed])`，并补 `forced-colors: active` 下的系统高亮反色。键盘表新增 `json-viewer.kbd.press`。三端公开 props 与事件不变。
- ab2417c: **Layout 的 sider-trigger 接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 在两个折叠态都接；把手没有禁用态，按住一律进。
  键盘表新增 `layout.kbd.press`。三端公开 props 与事件不变。
- 9cb1db6: **Listbox 接入 Collection Item 与 Action Control 配方，选中改页内持久集合的品牌淡底 + 前导对号，列表接自绘条。**

  - 条目投影 `data-xh-collection-item` / `data-xh-collection-size` / `data-xh-collection-context='page'`，文字与对号落在家族网格的 `text` / `indicator` 列；悬停 100、按下 200 只换面（此前按下零反馈），选中行铺 `--xh-bg-brand-subtle` 行面 + `--xh-fg-on-brand-subtle` 前景，对号前置到起始侧（此前透明底 + 行尾对号）；selected + hover 20%、+ pressed 28%。公开槽名不变，新增 `--xh-listbox-item-bg-pressed` / `--xh-listbox-item-bg-selected` / `--xh-listbox-item-check-fg`。
  - 取下一页的钮接 Action Control `row` 档 ghost 形态：铺满一行只换面不缩放（此前 0.97 缩放且不换底）。
  - 根上 `--xh-icon-size` 缺省由随文字形改为 `--xh-glyph-size-md` 并随 `size` 换档；条目内字形由家族按档下发。
  - 三端把 `content` 接上自绘滚动条（真源 §6.6 定高小列表）：条子挂在 `root` 上、贴层锚定、两轴都摆、走 6px 缺省档；Vue 的 `XhListboxContent` 与 React 的同名组件根节点从此是片段（列表 + 条子），直通属性仍落在列表节点上。

- eb1bc18: **Listbox 条目与「取下一页」接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副
  按压面。** 机器 context 新增 `pressedPart`（`item` / `load-more-trigger`）与 `pressedValue`（条目 value，取下一页记
  null），事件 `PRESS.START { part, value?, disabled? }` / `PRESS.END { part, value? }`；守卫 `canPress` 在整列禁用时
  两者都不进，条目在只读或自身禁用（部件声明或 collection）时不进，取下一页在取数在途中（`loading`）不进；
  `endPress` 只松开 part + value 对应的那一个，按住途中转入禁用 / 只读 / 加载时由机器自行松开。item 与
  load-more-trigger 的 getter 投影 `data-pressed`，Collection Item（page 语境）与 Action Control（row 档）家族配方的
  按压选择器已是 `:is(:active, [data-pressed])`；键盘表新增 `listbox.kbd.press`。三端公开 props 与事件不变。
- 6c876c8: **Log 的回到底部按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  log 机器 context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END`；守卫 `canPress` 只在视口离底（按钮在场）时放行，
  按住途中回到底部、按钮随之收起时由贴底回报一并松开。键盘表新增 `log.kbd.press`。三端公开 props 与事件不变。
- 8b6b118: **`matrix-code` 新增 `pdf417` 与 `aztec` 两种码制；`level` 的取值域随码制，新增 `columns`。**

  `format="pdf417"` 画 PDF417（ISO/IEC 15438）：字节压缩模式（每 6 个字节按 900 进制压成 5 个码字，含 ASCII 以外的字符时声明 ECI 26），GF(929) 素域里德-所罗门，九档纠错 0–8（缺省按数据量取规范推荐档），行列在宽高比最接近 3:1 的一档里挑，`columns` 可指定数据列数 1–30；每个码字行占 3 个模块高。它是堆叠条码不是点阵，`moduleShape` 不认。

  `format="aztec"` 画 Aztec（ISO/IEC 24778）：大写 / 小写 / 数字三种字符模式贪心切换、其余字节成串二进制移位，紧凑型 1–4 层与完整型 4–32 层自动挑（5 层起插参考网格），字宽随层数取 6 / 8 / 10 / 12 位、各自建 GF(2^m) 域，模式信息走 GF(16)；不需要静区，缺省 `margin` 为 0。

  `level` 现在是 `MatrixCodeLevel`：qr 认 L / M / Q / H，pdf417 认 0–8，aztec 认纠错码字至少占的百分比 5–95（缺省 33）；给了码制不认的值不画码，根落到 `error` 态并在 `error` 里说明取值域——不静默换成缺省档。自定义元素的 `level` attribute 照旧是字符串，数字串交给 connect 核。`columns` 三端同名；`columns` / `moduleShape` / `gs1` 给了不认它们的码制，往诊断通道报 `matrix-code.option-ignored` 警告，按没给处理。共享的 `createReedSolomon` 多一个位宽参数，QR 与 Data Matrix 不受影响。

  四种码制都配了独立重写的解码器做回环，并用 zxing-cpp（WASM）逐一交叉解码过（PDF417 九档级别 × 列数 1–30 × 近容量；Aztec 1–32 层、纠错 5–80%、二进制长短移位）。

- 592ab23: **Mention 候选接入按压通道：触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器 context 新增
  `pressedValue`（候选 value），根级事件 `PRESS.START { value, disabled? }` / `PRESS.END { value }` 两个状态都认；守卫
  `canPress` 在禁用、只读或加载时不进，候选自身禁用（部件声明或 collection）时不进；`endPress` 只松开 value 对应的那一条，
  open 态 exit 时随浮层收起一并松开，按住途中转入禁用 / 只读 / 加载时由机器自行松开。焦点恒在输入框，Enter 在同一次
  keydown 里插入候选并收起浮层，键盘那一路没有可见的按住帧，候选只接触屏。Collection Item（overlay 语境）家族配方的
  按压选择器已是 `:is(:active, [data-pressed])`。三端公开 props 与事件不变。
- 1587d60: Mention 与 TreeSelect 现在复用 Headless Presence 行为资源控制器：逻辑关闭立即令 content
  `inert` 并退出可访问树，Layer、DismissableLayer 与 TreeSelect FocusScope 延后到全部有限 CSS
  退场完成后释放；退场中重开复用原资源并重新激活 TreeSelect 焦点域。
- 858eac5: **Menu 接入 Collection Item 配方：条目按下面由 300 改 200，展开着的触发器改中性面，浮层条子走 4px 档并补 overscroll 隔离。**

  - 条目与子菜单触发项投影 `data-xh-collection-item` / `-size` / `-context='overlay'`，`item-text` 落 `text` 槽、`item-indicator` 落 `prefix` 槽（常显前导图标，不是选中对号）、`item-description` 落 `description` 槽，分隔线投影 `data-xh-collection-separator`；子层开着时子菜单触发项同报 `data-in-path`，打开路径的面由家族按它给。
  - 悬停 / 键盘锚点 100（`--xh-bg-subtle`）、按下 200（`--xh-bg-subtle-hover`，此前是 `--xh-bg-subtle-active` 300）、打开路径与 hover 同档、禁用面都由家族给，皮肤只映射公开槽；`--xh-menu-item-bg-pressed` 缺省随之改变。
  - 展开着的触发器由「品牌淡底、随 tone 换色」改为与家族 hover 同档的 `--xh-bg-subtle`；`--xh-menu-trigger-bg-active` 槽名不变，私有槽 `--xh-_menu-active-bg` 删除。
  - 标记位盒尺改随家族按档下发的 `--xh-icon-size`（md 20px）；content 上 `--xh-icon-size` 缺省由随文字形改为 `--xh-glyph-size-md` 并随 `size` 换档。
  - content 补 `overscroll-behavior: contain`；三端自绘条改传 `size: 'sm'`（浮层里的条子走 4px 档）。

- c530797: ContextMenu、Menu 与 Menubar 现在由 Headless Presence 生命周期持有行为资源：根菜单与各级子菜单分别等待自己的退出，Menubar 按菜单 value 精确配对当前 Layer owner；逻辑关闭立即令 content `inert` 并退出可访问树，退场中重开复用行为资源。
- 1eae644: **Menu 条目接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器
  context 新增 `pressedValue`（正被按住的条目 value），根级事件 `PRESS.START { value, disabled }` /
  `PRESS.END { value }` 两个状态都认；守卫 `canPress` 在整张菜单禁用或条目自身禁用（部件声明或 collection）时不进，
  `endPress` 只松开 value 对应的那一条，open 态 exit 与按住途中整张菜单被禁用时由机器自行松开。条目与子菜单触发条目的
  getter 投影 `data-pressed`，Collection Item 家族配方的按压选择器已是 `:is(:active, [data-pressed])`，键盘与触屏按住
  呈现与指针一致的 pressed 底；键盘表新增 `menu.kbd.press`。三端公开 props 与事件不变。
- d74e0f2: **Menubar 接入 Collection Item 配方：条目按下面由 300 改 200，展开着的入口改中性面并只换面不缩放，下拉菜单三端接自绘条。**

  - 条目投影 `data-xh-collection-item` / `-size` / `-context='overlay'`，`item-text` 落 `text` 槽、`item-indicator` 落 `prefix` 槽（常显前导图标，不是选中对号）、`item-description` 落 `description` 槽，分隔线投影 `data-xh-collection-separator`；子菜单触发项由子层的 Menu 机器合并同一批标记并在子层开着时报 `data-in-path`。
  - 悬停 100（`--xh-bg-subtle`）、按下 200（`--xh-bg-subtle-hover`，此前是 `--xh-bg-subtle-active` 300）、打开路径与 hover 同档、禁用面都由家族给，皮肤只映射公开槽；`--xh-menubar-item-bg-pressed` 缺省随之改变。
  - 展开着的入口由「品牌淡底、随 tone 换色」改为与悬停同档的 `--xh-bg-subtle`；按下由缩放改为只换面到 200，新增 `--xh-menubar-trigger-bg-pressed`；私有槽 `--xh-_menubar-active-bg` 删除。
  - 标记位盒尺改随家族按档下发的 `--xh-icon-size`（md 20px）；根与定位层上 `--xh-icon-size` 缺省由随文字形改为 `--xh-glyph-size-md` 并随 `size` 换档，content 上的重复声明删除。
  - 下拉菜单接自绘条：Vue / React 每张菜单的 positioner 各配一套（`useScrollbars`，`size: 'sm'`），Web Components 由 `ScrollbarsController` 跟着最近展开的那张菜单走；层分支把当前那张的 positioner 记进去，按住条子拖动不再把菜单消解掉；content 补 `overscroll-behavior: contain`，positioner 声明 `--xh-scrollbar-track-bg: transparent`。

- fd6ec65: **Menubar 入口与条目接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressedPart`（`trigger` / `item`）与 `pressedValue`，根级事件 `PRESS.START { part, value, disabled }` / `PRESS.END { part, value }` 两个状态都认；守卫 `canPress` 在整条菜单栏禁用或部件自身禁用（部件声明或
  collection）时不进，`endPress` 只松开 part + value 对应的那一颗；trigger 的开合与按压互不影响，条目随 open 态 exit
  一并松开，按住途中整条菜单栏被禁用时由机器自行松开。trigger 与 item 的 getter 投影 `data-pressed`，Collection Item
  家族配方（nav / overlay 语境）的按压选择器已是 `:is(:active, [data-pressed])`；键盘表新增 `menubar.kbd.press`。

  `@xihan-ui/testing` 的共享步骤 `heldPress` / `heldPressIgnored` 新增可选 `{ value }`，多条目部件可按 `data-value`
  指定按哪一条（Web Components 只把展开的浮层搬到落点，文档序里第一条不一定是它的）。三端公开 props 与事件不变。

- 86345b1: **MessageFeed 的回到底部按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  message-feed 机器 context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END`；守卫 `canPress` 只在视口离底（按钮在场）时放行，
  按住途中回到底部、按钮随之收起时由贴底回报一并松开。键盘表新增 `message-feed.kbd.press`。三端公开 props 与事件不变。
- 1f6afdb: **NavigationMenu 入口与面板链接接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副
  按压面。** 机器 context 新增 `pressedPart`（`trigger` / `link`）与 `pressedValue`，根级事件
  `PRESS.START { part, value, disabled? }` / `PRESS.END { part, value }` 三个状态都认；守卫 `canPress` 在整套导航禁用时
  不进，入口自身禁用时不进；`endPress` 只松开 part + value 对应的那一个；按住 Enter 激活链接后面板收起（或换到另一
  张），链接藏进 inert 的面板里不会再来 keyup，机器随 `value` 变化撤下链接的按压；按住途中导航转入禁用时由机器自行
  松开。入口的 Enter / Space 开合现在拦下自动重复（按住不放不再来回翻转）。键盘表新增 `navigation-menu.kbd.press`。

  **破坏性（headless）：`NavigationMenuLinkProps` 新增必填 `value`。** 面板里可以有多条链接，按压通道按它记按住的
  那一条。三端适配器按实例生成（Vue / React `useId`，Web Components 升级时按节点分配一次），作者不必提供；直接消费
  `connectNavigationMenu` 的调用方需给每条链接一个稳定且不重复的串。三端公开 props、attribute 与事件不变。

- c13579f: **Notification 卡片的关闭按钮与操作按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  卡片复用 toast 状态机，按住的那颗记在它的 `pressed`（`ToastPressedPart`）里，卡片按 part 键比对投影；不可关闭时关闭按钮
  不进，卡片进入退场或按住途中转成不可关闭时由机器松开。notification 自身状态机不变，三端公开 props 与事件不变。
- bc80c37: **NumberField 加减按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器
  context 新增 `pressed`（按 part 键记住正被按住的那颗，新增导出类型 `NumberFieldPressedPart`），事件
  `TRIGGER.PRESS.START` / `TRIGGER.PRESS.END` 挂根级——`PRESS.*` 仍是指针按住连发的事件，按压通道只投影按压面、不改
  步进；守卫 `canPressTrigger` 与按钮的 disabled 同一口径（禁用、只读或该侧已贴住端点时不进）；按住途中值贴到端点、
  区间收紧或转入禁用 / 只读时由机器自行松开。键盘表新增 `number-field.kbd.press`。三端公开 props 与事件不变。
- 674ee88: **Pagination 两端翻页钮、页码与省略位接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active`
  同一副按压面。** 机器 context 新增 `pressed`（`PaginationPressedKey`：`prev` / `next` / `item:页号` /
  `ellipsis:侧`，类型进公开面），根级事件 `PRESS.START { key, disabled? }` / `PRESS.END { key }`；守卫 `canPress` 在到
  边界的翻页钮上不进；`endPress` 只松开 key 对应的那一个；摊开的页码面板收起时一并松开（面板里被按住的页码不会再来
  keyup）。皮肤按压面由 Action Control 家族配方给出；键盘表新增 `pagination.kbd.press`。三端公开 props 与事件不变。
- c247435: **PasswordInput 切换按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器
  context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级，按压与切换同一道 `canReveal` 守卫（禁用时不进；
  只读不拦明暗，按压面也照常给）；按住途中明暗翻面不影响按压面，转入禁用时由机器自行松开。键盘表新增
  `password-input.kbd.press`。三端公开 props 与事件不变。
- 4b4db79: **Popconfirm 三颗按钮接入 Action Control 与按压通道，取消钮改中性描边，内容面接自绘条。** 连接层的 trigger 新增
  稳定属性 `data-xh-action-control` / `data-xh-action-profile="text"` / `data-xh-action-display="always"` /
  `data-xh-action-size="md"` / `data-xh-action-variant="outline"`；confirm-trigger 新增
  `data-xh-action-size="sm"` / `data-xh-action-variant="solid"`（确认是本浮层的主要动作，与 Button 主动作同待遇，语气
  仍随 content 的 `data-tone`）；cancel-trigger 新增 `data-xh-action-size="sm"` / `data-xh-action-variant="outline"`。
  Space / Enter 与触屏按住期间该按钮投影 `data-pressed`（记在共用的 popover 机器 `context.pressed` 里，浮层收起时一并
  松开），键盘表新增 `popconfirm.kbd.press`。

  视觉默认变化：trigger 此前是 UA 裸按钮，现由家族配方按 outline 列给出 md 档盒型与中性描边。确认钮删除自写的顶光、
  soft 影与悬停 `--xh-elevation-raised` 抬升，改由配方 solid 列给出（悬停 / 按下按语气色阶梯换底并 0.97 缩放，无影）。
  取消钮由 soft 材质淡底改为透明底 + `--xh-border-control` 描边，悬停 `--xh-bg-subtle`（100）→ 按下
  `--xh-bg-subtle-hover`（200），聚焦不再铺 `--xh-material-soft-focus-surface` 实体底。挂起圆环由 pill 改为
  `--xh-shape-circle`。description 字号 `--xh-text-body-size` 14 → `--xh-text-secondary-size` 13，颜色
  `--xh-material-frosted-fg-muted` → `--xh-fg-muted`（同值）。content 新增 `overscroll-behavior: contain`，并在三端
  接上与 Popover 同款的自绘滚动条（浮层 4px 档，positioner 记进层分支、轨道透明）。

  公开槽 `--xh-popconfirm-action-px / -radius / -shadow`、`--xh-popconfirm-confirm-bg / -fg / -shadow`、
  `--xh-popconfirm-cancel-bg / -fg / -bg-focus / -fg-focus` 改为桥接到配方之前（`-bg-focus` / `-fg-focus` 桥到配方
  的 focus-visible 面，缺省不再铺实体底而是透明底 + 静息字色，槽本身保留）；新增
  `--xh-popconfirm-cancel-bg-hover / -bg-active / -border / -border-hover`、`--xh-popconfirm-action-font-weight`、
  `--xh-popconfirm-description-font-size`、`--xh-popconfirm-icon-size`。

- 8cbf0be: Popconfirm 的确认动作改为一项明确的事务。`onConfirm` 现在接收任意 `PromiseLike` 返回值，调用前即同步占用；
  跨 realm Promise、自定义 thenable、同步抛错、读取 `then` 时抛错和异步拒绝都走同一条生命周期，不再依赖
  `instanceof Promise`。pending 会阻止重复确认、trigger 切换、`setOpen(false)`、Escape 与层外交互；兑现后才收起。

  新增 `actionError` 状态与 `confirm-error` 通知，`details.cause` 保留原始抛出或拒绝值，包括 `undefined`。
  新一轮确认会清除旧错误。取消会立即解除 pending、关闭浮层并使当前事务票据失效；它不会声称取消业务 Promise，
  迟到的兑现或拒绝不会关闭新会话，也不会写回错误。组件卸载后的旧结算同样失效。
  受控 `open` 的真实关闭再重开也会换一张事务票据并解除 pending；已取消或停机的回调即使返回已拒绝 Promise，
  组件仍会接管其拒绝，避免产生未处理拒绝，但不会恢复已失效事务。

  非模态 Popconfirm 的内容角色由 `alertdialog` 校正为 `dialog`，与不陷焦点、不锁滚动、不隐藏页面其它内容的既有合同一致；
  这次调整没有引入完整模态行为。pending 确认按钮新增 `aria-disabled="true"`，仍保留焦点并通过 `aria-busy` 报告在途。

- 36ff669: **Popover 触发器与关闭按钮接入 Action Control 与按压通道，说明文字改说明档。** 连接层的 trigger 新增稳定属性
  `data-xh-action-control` / `data-xh-action-profile="text"` / `data-xh-action-display="always"` /
  `data-xh-action-size="md"` / `data-xh-action-variant="outline"`；close-trigger 新增
  `data-xh-action-profile="icon"` / `data-xh-action-size="sm"` / `data-xh-action-variant="ghost"`。作者以 asChild
  换成自己的按钮时，家族标记不落到它身上。机器新增按压通道（`context.pressed` 记正被按住的那颗：`trigger` /
  `close-trigger`，导出类型 `PopoverPressedPart`），Space / Enter 与触屏按住期间该按钮投影 `data-pressed`，浮层收起时
  一并松开；键盘表新增 `popover.kbd.press`。

  视觉默认变化：trigger 此前是 UA 裸按钮，现由家族配方按 outline 列给出 md 档盒型、中性描边、悬停
  `--xh-bg-subtle`（100）→ 按下 `--xh-bg-subtle-hover`（200）并 0.97 缩放。close-trigger 删除自写的悬停 200 / 按下
  300、聚焦铺 `--xh-material-frosted-focus-surface` 实体底，改由配方 ghost 列给出（悬停 100 → 按下 200，焦点面透明吃
  库环）；作者塞入的图标由随文 1em 改为随档 16px。description 字号 `--xh-text-body-size` 14 →
  `--xh-text-secondary-size` 13，颜色 `--xh-material-frosted-fg-muted` → `--xh-fg-muted`（两者同值）。content 的
  `--xh-icon-size` 缺省由 `--xh-glyph-size-text` 改为 `--xh-glyph-size-md`，并新增 `overscroll-behavior: contain`；
  三端的自绘滚动条改走浮层 4px 档（`size: 'sm'`）。

  公开槽 `--xh-popover-close-size / -radius / -fg / -fg-hover / -bg-hover / -bg-active / -bg-focus / -fg-focus` 改为
  桥接到配方之前（`-bg-focus` / `-fg-focus` 桥到配方的 focus-visible 面，缺省不再铺实体底而是透明底 + 悬停字色，
  槽本身保留）；新增 `--xh-popover-description-font-size`。

- 4babe65: **按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 此前按压反馈只挂在 `:active` 上：键盘 Enter 按住、触屏手指按下时按钮纹丝不动，只有鼠标看得见缩放与换底（真源 §9.1 / §9.2）。

  - `@xihan-ui/core` 新增 `createPressTracker({ isPressed, onChange })`：把 Space / Enter 的 keydown / keyup / blur 与触屏的 pointerdown / pointerup / pointercancel 翻成「该按下 / 该松开」，不自存状态、不持有 DOM；长按重复键、输入法组合键、鼠标与笔一律不算。
  - `@xihan-ui/headless` 新增 `pressHandlers(service)` 与 `PressEvent` / `PressService`；`button` 与 `toggle` 的机器接上 `PRESS.START` / `PRESS.END`（context `pressed`），root 投影 `data-pressed`，禁用或进入加载途中按住的由机器自行松开。**破坏性：** `connectButton` 的第一个参数由 props 改为 `Service<ButtonSchema>`——按钮此前没有状态机，现在由 `buttonMachine` 承载按压通道，与其余跑机器的组件同构；`ButtonProps` 仍导出，等于 `ButtonSchema['props']`。
  - `@xihan-ui/styles` 的家族配方 `family/action-control.css` 与 `family/collection-item.css` 把按压选择器改为 `:is(:active, [data-pressed])`，特指度不变；组件皮肤自己写的 `:active` 规则由各组件迁移时改写。
  - 三个适配器的 `Button` 改跑 `buttonMachine`（公开 props 不变），键盘与触屏按住时呈现与指针一致的 0.97 缩放与 pressed 底；`Toggle` 同步接入。
  - `@xihan-ui/testing` 新增 `heldPress` / `heldPressIgnored` 共享步骤，button 与 toggle 套件三端核对按住中间帧。

  其余可按部件（`check-press-feedback` 的 PRESSABLE 表）已随各组件提交逐个接入；`family-backlog.json` 里的 `*:data-pressed` 总豁免随之删除，门禁 ⑧ 对没投影 `data-pressed` 的 getter 直接判红，不再留豁免入口。

- 7c5f97f: **PromptInput 发送 / 停止按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级；守卫与按钮的可用性同口径——禁用不进，发送身份要可提交
  （空内容、输入法组合中不进），停止身份（loading）恒可用、同样有回执；按钮身份随 loading 切换时由机器松开，提交后清空 /
  组合开始使发送钮转禁用时同样松开。键盘表新增 `prompt-input.kbd.press`。三端公开 props 与事件不变。
- 80bf4c8: **QuestionFlow 的选项与四颗按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  question-flow 机器 context 新增 `pressed`（按 `QuestionFlowPressedKey` 记：`'prev'` / `'next'` / `'skip'` / `'submit'` / `` `item:${value}` ``，
  类型进公开面），事件 `PRESS.START { key, disabled }`（只在答题态接，部件自身的禁用随事件带入守卫 `canPress`）/ `PRESS.END { key }`；
  换题、题目改写、交卷与关掉跳过时由机器松开。选项是 `role=radio` / `checkbox`，只有 Space 是激活键，Enter 归选项组的前进、不进按压面。
  键盘表新增 `question-flow.kbd.item-press` 与 `question-flow.kbd.press`。三端公开 props 与事件不变。
- 797a14f: **RadioGroup 条目接入按压通道：Space 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（行与圆圈一起换面）。**
  机器 context 新增 `pressedValue`（按住的条目 value），事件 `PRESS.START { value, disabled? }` / `PRESS.END { value }`；
  守卫 `canPress` 在整组禁用、只读或条目自身禁用时不进；`endPress` 只松开 value 对应的那一个；按住途中整组转入禁用或
  只读时由机器自行松开。`role=radio` 只有 Space 是激活键，Enter 不进按压面；选中与按压互相独立，Space 在 keydown 那一刻
  照旧选中。皮肤的按压选择器已是 `:is(:active, [data-pressed])`（换面落在行与 `indicator`）；键盘表新增
  `radio-group.kbd.press`。三端公开 props 与事件不变。
- 655ac38: Calendar 的区间模式新增 hover 预览状态，连续轨道使用轻量行边界与完整起止圆帽，中间日期不再叠加普通悬停圆底。

  DatePicker 的区间模式新增 `range-separator` 部件及三适配器组件，起止日期输入可使用正式分隔部件组合，不再依赖空白区分。

- 2fca91b: **Rating 星接入按压通道：触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器 context 新增 `pressedValue`
  （正被按住的星，按序号记），事件 `PRESS.START { value }` / `PRESS.END { value }`，守卫沿用 `canInteract`（禁用或只读不进），
  按住途中转入禁用或只读时由机器自行松开；松开不清悬停预览。星是 role=radio 的 span，Space / Enter 在它上面什么都不做
  （评分靠方向键走档），键盘那一路没有按压面。三端公开 props 与事件不变。
- f45e0f7: **新增第三个适配器 `@xihan-ui/react`，本批只交运行时接缝。**

  `ReactiveRuntime` 的五个口子这次是第三份实现。React 与 Vue 不同类：它没有细粒度依赖追踪，只能整体重渲加提交后拉，所以接缝照的是 Web Components 那份，不是 Vue 那份。`cell` 变化推一个版本号喂 `useSyncExternalStore`；`track` 是拉式的，宿主每次提交后逐项比对依赖；`flush` 排队之后由提交后的 layout effect 取走，接不上提交时退到微任务里先 `flushSync` 逼出一次同步提交再跑。

  **`flush` 是这一批唯一真正难的一格。** 它的契约是「跑在宿主提交完这次渲染、DOM 已经落定之后」，全仓 64 个调用点吃这条，其中浮层定位与模态背景失活两处写错了都不报错——浮层量到零尺寸就定位到左上角，背景收不到节点就永远 Tab 得出去。Vue 靠 `nextTick` 套 `nextTick`、WC 靠轮询 `updateComplete`，React 两者都没有。这次先写了一份 18 条的判据套件（`tests/support/runtime-contract.tsx`），再让三种策略各实现一遍拿它评分：提交后 effect 排空得 16/18，`requestAnimationFrame` 兜底得 13/18，`flushSync` 强制提交 18/18。判据本身也做过反向验证——拿一份故意写错的实现（推式 `track` 加微任务 `flush`）跑，红的正是预期那四条。

  判据覆盖的是几种具体的写错方式，不是泛泛的冒烟：只在 props 上变、永不经过 `cell.set` 的值 `track` 看不看得见（推式实现在这里全线失效，受控回写跟着一起哑）；`flush` 在 React 事件内、事件外、消费方自己的 effect 里、以及回调里再次转移这四种时机是否都排在提交之后；受控判定有没有被首帧闭包冻住；StrictMode 走完 mount → cleanup → mount 之后状态与上下文会不会分叉。

  停机后的 service 会静默丢弃一切事件，所以 StrictMode 那一轮走整台重建，与 WC 的 `MachineController` 同一做法；`useMachine` 返回的是身份稳定的门面而不是 service 本体，否则重建前的渲染闭包里抓到的旧 service 会让绑在 JSX 上的 `send` 全部落空。

  `reactNormalize` 一并交了：11 项属性改名（`tabindex` 137 处、`readonly` 13 处、`for` 11 处等）、事件名按全小写索引归一（headless 里 `onKeyDown` 与 `onKeydown` 一类的两种写法并存共 48 处）、`onFocusIn` / `onFocusOut` 归到 `onFocus` / `onBlur`、两处字符串 `style` 解析成对象。

  `@xihan-ui/core` 这一侧只改了对外自报的适配器名单。

  **尚未交付**：组件、命令式服务、表单桥、SSR、一致性套件接线。React 侧的公开面这一批还是空的。

  已知缺口，逐条记在案：外部组件在自己的 effect 或 ref 回调里调进 `send` 时，两面禁区旗盖不住，那一路会退化成不保证提交后；`flush` 回调自排回调的同轮上限是 100；`flushSync` 只保证 DOM 与 layout effect 落定，被动 effect 可能仍在后面；并发渲染下被丢弃的那次渲染同样会写脏 props 取值器，直到下一次渲染盖掉。

- 9c11611: **React 侧铺上 AI 这一族八个组件：`code-view`、`markdown-stream`、`message-feed`、`prompt-input`、`tool-call`、`reasoning`、`approval`、`diff-view`。**

  八个的共同点是「一段还在长的内容」，分歧在谁持有状态：`code-view` 与 `markdown-stream` 一台机器都没有，只把代码与块列表投影成属性；`tool-call` 与 `reasoning` 共用同一台机器（它不认解剖，只认在不在跑与四个叶态），各自配自己的解剖；`prompt-input`、`approval`、`diff-view` 各有一台；`message-feed` 那一台还要接粘底句柄与四个取元素口。

  `react-coverage.json` 记到 95/126。

  **`message-feed` 的两处 `focus` 改装成原生监听器。** `connect` 派的是 DOM 的 `focus`（不冒泡），React 的同名合成事件挂的是冒泡的 `focusin`：容器那一路会在条目得焦时也被叫起来，把焦点从条目抢回锚点；条目那一路则收不到直接派到节点上的事件。两处都只摘 `onFocus`——同一个根节点上还有 `onFocusOut`，它经归一化落到 React 的 `onBlur`、挂的正是冒泡的 `focusout`，动它反而把语义改坏。

  共享一致性套件咬不到这一路（它走真实 `el.focus()`，`focusin` 会冒泡，接线断了照样全绿），`collection-native-events.spec.tsx` 补了两条，按 DOM 的送达路径直接派。反向验过：把两处 `useNativeEvents` 的名单清空，这两条判红，一致性套件里的两条键盘用例也跟着判红（合成事件把焦点抢了回去）。

  **`message-feed` 的条目补上离场焦点上报。** 条目被移出 DOM 时浏览器不派 `focusout`，焦点无声地掉到 body 上，而机器仍记着那个已经不存在的锚点——根的 Tab 位判据是 `focusedId == null`，于是整份消息流一个停靠点都没有，键盘再也进不来。照库里既有的口径写在 layout effect 里（passive 清理排在 DOM 摘除之后，那时 `activeElement` 已经回到 body，守卫恒不成立），另配一条「节点还在、`itemId` 换了」的重报。`collection-focus-report.spec.tsx` 补了两条，两个方向都反向验过：把 layout effect 换回 `useEffect`，「条目被摘掉」那条判红。

  需要说明的是**这条上报 Vue 侧的 `message-feed` 没有**，同一个缺陷在那一侧仍在；本批只动 React，没有跨过去改。

  **`code-view` 接上可选的默认着色实现，包清单跟着加了一条可选 peer。** `@xihan-ui/code-highlight` 在 Vue 与 Web Components 那两侧都是可选 peer：装了它，模块到达后共用的那一份实现落地，在场的代码视图重渲一次并着色；没装则一直是 null，代码按纯文本渲染。React 这边此前没有这条声明，结果是同一份 `code-view` 在两个适配器上渲出来的东西不一样——逐帧对拍在「标出语言与闭合」那一条上当场判红（Vue 有 `token` 部件，React 只有一个文本节点）。补齐声明后转绿。落地写法与另外两侧对齐，只是把「模块到了要叫醒谁」换成 `useSyncExternalStore`：Vue 用 `shallowRef` 的响应性，React 这边得自己订阅。

  `packages/adapters/react/package.json` 因此多了一条可选 `peerDependencies` 与对应的 `devDependency`，`pnpm-lock.yaml` 跟着动。

  **测试宿主：部件节点上的连字符属性换成驼峰。** 共享 fixture 写的是 DOM 属性口径（`item-id`、`scope-value`），而部件在 React 侧解析成组件、入参是驼峰 props，原样传过去组件读到的是 `undefined`，条目与授权项的身份整个丢掉。`fixture-element.ts` 里那一步本就在做「DOM 口径 → React 口径」的翻译（空串转 `true` 那一条），这次把连字符键的驼峰化并进去，只对部件节点做，`data-*` / `aria-*` 不动。

  **`tool-call` 与 `reasoning` 的收起走退场闸门。** 与 Vue 侧同形：皮肤刻意没给 `content` 补 `[hidden]{display:none}`（补了退场就一帧都播不出来），真正的收起落成内联 `display`，节点始终留在原地；服务端没有 DOM 时闸门退化成「跟着展开态」。

  `prompt-input` 的 `textarea` 与 `approval` 的 `note` 都带 `value` 与 `onInput`、没有 `onChange`，按既有口径各补了一个空的 `onChange`（React 要求带 `value` 的输入交出一个出口），不改用 `readOnly`——那一项在归一化快照的基准属性表里，改了逐帧对拍当场分叉。

  八个组件在 Vue 侧一个部件都不收 `asChild`，React 这边照样不收；八台机器里也都没有 `FORM.RESET`，因此都不调 `useFormReset`。

  四条判据链全绿：共享一致性套件这八个组件共 73 条（`prompt-input` 13 / `tool-call` 11 / `approval` 10 / `code-view` 10 / `message-feed` 9 / `diff-view` 7 / `markdown-stream` 7 / `reasoning` 6，含各自的键盘表覆盖行），**键盘零豁免**；服务端直出**零豁免**，八个都直出得了；与 Vue 的逐帧对拍与标签名对拍各收下这八个套件，`parity-react` 的待铺名单同步删掉八行。

  **已知没有判据咬得住的几处，逐条记在案。**

  - **jsdom 没有布局，`message-feed` 的粘底整条判不红。** 视口与内容两个节点交给机器、句柄在节点换掉之后重绑（`retarget`）、以及「在不在底」这两个布尔本身，都要真实的滚动几何才动得起来；套件里那几条只核了「回到底部按钮按 `atBottom` 收放」这一层属性投影，按钮按下去有没有真滚到底、上滚之后粘附有没有松手，一条用例都碰不到。`getViewportEl` / `getContentEl` 那两行 `refs.set` 与重绑效应，当前只有代码在保证。
  - **退场闸门在 jsdom 里只走「没有动画」那一支。** `tool-call` 与 `reasoning` 的 `content` 收起后仍留在 DOM 上、只是拿到内联 `display: none`，这一层由逐帧对拍咬着；而「退场动画播完之前保持可见」那条真正的闸门要量 `animationName`，jsdom 量不到，只能在真机上看。
  - **共享套件的 fixture 里不出现的部件，只有 `check-part-wiring` 的「源码里引到了那个 getter」在核，行为一条都没跑过，共 8 个**：`prompt-input` 的 `control`，`tool-call` 的 `summary` / `duration`，`reasoning` 的 `icon`，`approval` 的 `note` / `result` / `footer`，`diff-view` 的 `summary` / `truncation`。其中 `approval` 的 `note` 那一格连带着「备注只随判定载荷发出、不参与能不能批」这条语义，整条只有类型与门禁兜着。
  - **着色片段这一路只有 `code-view` 走到过。** `code-view` 的 `token` 部件不在套件的断言里，但默认着色实现落地之后它真的渲了出来，逐帧对拍逐个属性比着——它是被对拍咬住的，不是被套件咬住的（判据来自实测：没有默认实现那一版，对拍就在这一处判红）。`diff-view` 的 `token` 与 `inline-change` 则一次都没渲过：套件的模型不带着色结果，而它那两条改动行是整行替换、词级差异被比例判据丢掉，两支恒为空数组。也是实测的——把词级片段那一支整个短路掉，逐帧对拍照样全绿。
  - **`code-view` 的行内容接管口（逐行 children）没有判据。** `check-slot-types` 只核「标了 `SlotChildren` 就得经 `renderSlot` 取值」，套件的 fixture 不传这个函数，载荷里的行文本、下标与行号一条都没被读过。`markdown-stream` 的逐块接管口同理。
  - **播报区的文本不进判据**：归一化快照只收属性、文档序、焦点与事件，不收文本。`markdown-stream` 与 `approval` 的 `live-region` 在不在场由对拍咬着，里面写了什么没有。
  - React 侧还没有浏览器态用例与计算样式快照这条输入，八个组件的皮肤、流式光标、`textarea` 自动长高、代码块的横向滚动一律不在判据内——这些只能在真机上看。

- 4b8fdbc: **新增子入口** `@xihan-ui/react/backgrounds`：视觉层的 React 适配，与 Vue、Web Components 两家的同名子入口对齐。

  `XhBackground` 是独立视觉组件，children 浮在效果之上，画布铺满根元素且 `pointer-events: none`；`as` 换标签，其余 props 与作者自己的 `ref` 照常落到根元素上。`useBackground` 把画面实例交到手上：返回的 `ref` 挂到哪个元素上，效果就铺在哪个元素上，`surface.current` 是底层画面，接自定义调度或调参面板走它。

  `@xihan-ui/backgrounds` 是**可选 peer**，不用视觉效果的应用不会因为装了本包而多出一个 WebGL 引擎。

  公开面比 Vue 那份少一项：Vue 有 `v-background`，React 没有对应物——指令是 Vue 才有的介质，把 `useBackground` 返回的 `ref` 挂到元素上就是同一件事，包括挂到别人的组件上。

  两处接线与 Vue 不同，都是 React 的渲染模型逼出来的：`ref` 的身份跨渲染稳定，换身份会让 React 先用 `null` 调旧的、再用节点调新的，画面于是每渲染一次就销毁重建；props 的同步落在不给依赖数组的效应里，跟着依赖走的话，调用方原地改参数对象里的某一项收不到。

- 38740a3: **React 侧铺上集合与检索这一族五个组件：`combobox`、`listbox`、`command`、`cascader`、`tree-select`。**

  五个都是「一堆条目 + 一条检索或导航线」。`listbox` 是裸列表框，其余四个各带一层浮层：`combobox` 的锚点是整个输入行，`command` 是模态面板加遮罩，`cascader` 是横着铺开的多列，`tree-select` 是一棵可展开的树。层级集合（列与分支）、分组、连敲检索三样在同一批里都要对。

  **不冒泡的事件逐个改装成原生监听器，七处。** `connect` 派的 `focus`（DOM 的那一个，不是 `focusin`）、`pointerenter`、`pointerleave` 都不冒泡，而 React 的合成事件全部委派在根容器上、只在冒泡阶段派发。七处是：`listbox` 的列表容器与条目（都是 `focus`）、`combobox` 与 `command` 的条目（`pointerleave`）、`cascader` 的条目（`focus` 与 `pointerenter` 两样）、`tree-select` 的叶子与分支（`focus`）。`listbox` 容器上那一处最容易看走眼——它同时派 `onFocus` 与 `onFocusOut`，后者经归一化落到 React 的 `onBlur`、挂的正是冒泡的 `focusout`，动它反而会把语义改坏，所以只摘前者。

  **共享一致性套件咬不到原生改装那一路**：它走的是真实 `el.focus()`，`focusin` 会冒泡，接线断了照样全绿。补了 `collection-native-events.spec.tsx` 八条，按 DOM 的送达路径直接派发。八条一并反向验过——五个组件的 `useNativeEvents` 名单全清空，八条整齐判红。

  **认表单重置的两个组件（`combobox`、`tree-select`）逐个调了 `useFormReset`，锚点接在根部件自己渲的那个 div 上。** 门禁对 React 只做静态串匹配（源码里有没有这句调用），核不到那只 ref 有没有真落到根节点上，所以 `form-reset.spec.tsx` 里补了两条行为用例。两个方向都反向验过：摘掉那句 hook，两条判红；hook 留着、只把根节点上的 `ref=` 拿掉，两条照样判红。

  **候选的结算在 React 上换了一种排法。** 过滤是调用方做的，机器无从预知何时变，headless 要求适配器每次提交完 DOM 发一次 `ITEMS.SYNC`。Vue 走 `nextTick` 合并，React 这边合并到微任务里：根部件每次提交后发起一次，每个候选在挂载、卸载与改名时也各发起一次，同一拍里多次调用只送一个事件。空态的显隐与「高亮项被筛掉时摘掉 `aria-activedescendant`」都挂在这份结算上，而共享套件不动候选的进出。补了 `combobox-item-sync.spec.tsx` 四条，其中一条专门让候选只在作者自己那一层重渲（根部件不跟着渲），钉的正是候选自己那条上报。反向验过：整份上报关掉，四条全红；只摘掉候选那一条，第四条判红。

  **`command` 的根部件只渲插槽、不产出自己的元素**，与 Vue 侧同形，所以服务端直出的 `partExempt` 里记了 `command.root`，理由与 Vue 侧那一行逐字一致。键盘豁免同样只有一条 `command.kbd.tab`（jsdom 按 Tab 不移动焦点，焦点环绕演不出来），照 Vue 侧同一行的措辞。

  **`asChild` 只有 `command` 的触发器收**，与 Vue 侧一致；其余四个组件在 Vue 上一个部件都不收，React 这边照样不收。两份影子输入按既有口径给了空的 `onChange`（值攥在机器里，React 又要求带 `value` 的输入交出一个出口），不改用 `readOnly`——那一项在归一化快照的基准属性表里，改了逐帧对拍当场分叉。

  **三个浮层壳挂了自绘滚动条**，与 Vue 侧同一处：`combobox` 只摆竖的，`cascader` 只摆横的（纵向溢出归每一列自己），`tree-select` 两条轴都摆。横条的正负按排版方向算，而组件不读计算样式，所以把 positioner 上那份显式的 `dir` 交了过去。三家的层分支因此记的都是「锚点 + 浮层壳」两个节点，按住条子拖动不会把浮层消解掉。

  **`cascader` 的空态节点长在 content 里**（Vue 侧也是这样，不是单独一个部件），React 上落成 content 的一个 `empty` 属性，不给就按视图取「无匹配」或「无数据」。搜索候选同理，整组由 `XhCascaderSearchList` 自动铺，`renderItem` 换内容。

  四条判据链全绿：共享一致性套件这五个组件共 118 条（`cascader` 27 / `combobox` 27 / `command` 16 / `listbox` 18 / `tree-select` 30，含各自的键盘表覆盖行），**键盘豁免一条**；服务端直出**豁免一条**；与 Vue 的逐帧对拍与标签名对拍各收下这五个套件，`parity-react` 的待铺名单同步删名；`react-coverage.json` 记到 61/126。

  **已知没有判据咬得住的几处，逐条记在案。**

  - 共享套件的 fixture 里不出现的部件，`check-part-wiring` 只核「适配器源码里引到了那个 getter」，行为一条都没跑过，共 14 个：`listbox` 的 `empty` / `loading` / `load-more-trigger`，`combobox` 的 `loading`，`cascader` 的 `input` / `search-list` / `search-item` / `group` / `group-label` / `loading` / `footer`，`tree-select` 的 `empty` / `loading` / `footer`。其中 `cascader` 的检索视图（搜索框加候选列表）整条只有类型与门禁兜着。
  - 根部件那一次「每次提交完 DOM 都发一遍 `ITEMS.SYNC`」单独摘掉时**判不红**：机器进 `open` 时自己会结算一次，其余变动全被候选自己那条上报盖住。它按 headless 的接线要求与 Vue 侧的形状留着，但当前没有任何一条用例只钉它。
  - React 侧还没有浏览器态用例与计算样式快照这条输入，五个组件的皮肤、退场动画与浮层定位一律不在判据内——这一族的浮层退场与多列横向滚动只能在真机上看。

- 968f4da: **React 侧铺上数据与列表这一族六个组件：`table`、`list`、`tree`、`transfer`、`virtualizer`、`infinite-scroll`。**

  六个的共同点是「一堆行 + 一条导航线」，分歧在行从哪儿来：`list` 是纯容器，行由作者自己排；`tree` 与 `transfer` 是集合，行的身份、禁用与层级都回 `collection` 里查；`table` 多一层列与区段（表头 / 表体 / 脚注）；`virtualizer` 与 `infinite-scroll` 不持有行，只回答「此刻该渲哪几条」与「该取下一页了吗」。

  **不冒泡的事件逐个改装成原生监听器，七处。** `connect` 派的 `focus` 是 DOM 的那一个（不是 `focusin`），而 React 的合成事件全部委派在根容器上、只在冒泡阶段派发。七处分两类：容器兜底那一路（`tree` 的 `tree`、`transfer` 的 `list`、`table` 的 `body`），焦点从外面进来时把它转投给锚点行；行自己那一路（`tree` 的 `item` 与 `branch`、`transfer` 的 `item`、`table` 的 `row`），得焦即改记锚点。三个容器都同时派 `onFocusOut`，它经归一化落到 React 的 `onBlur`、挂的正是冒泡的 `focusout`，动它反而把语义改坏，所以只摘 `onFocus`。

  **共享一致性套件咬不到这一路**：它走真实 `el.focus()`，`focusin` 会冒泡，接线断了照样全绿。`collection-native-events.spec.tsx` 补了六条，按 DOM 的送达路径直接派发。六条一并反向验过——三份组件源码里 `useNativeEvents` 的名单全清空，六条整齐判红，改回即全绿。

  **行离场时的焦点上报从 passive 改成 layout effect，这一条差点静默失效。** 行被摘出 DOM 时浏览器不派 `focusout`，焦点无声掉回 body，而机器仍记着那个已经不存在的锚点：容器因此不再兜底进 Tab 序列，整组一个停靠点都没有，键盘再也进不来。适配器要在卸载时如实上报——但 React 对被删子树的 passive 清理排在 DOM 摘除**之后**，那时 `getActiveElement()` 已经是 body，守卫一律不成立，事件一次都发不出去。改成 layout effect（照 `tags-input` 那一处的做法，服务端退回永不执行的 `useEffect`），清理跑在节点摘除之前，焦点还在它身上。

  这条同样没有现成判据：套件的 fixture 是一棵固定的树，不会在中途摘掉持有焦点的行。新增 `collection-focus-report.spec.tsx` 四条，覆盖三个组件的「行离场」与 `tree` 的「节点还在、身份换了」。两个方向都反向验过：三处上报 hook 全摘掉，四条判红；hook 留着、只把 layout effect 换回 `useEffect`，四条照样判红。

  **`table` 的行按区段拆成了两个内部组件。** Vue 侧在 `setup` 里按区段二选一，表头行与脚注行不报行身份、不认领 Tab 位、也没有焦点上报，数据行三样都有——两条路的 hook 数不一样，而 React 的 hook 不能按条件调。照 `tag` 的写法：`XhTableRow` 用一个 `useState` 把挂载那一刻的区段冻住，再分派给两个内部组件。

  **`table` 的根渲的是三样并排的东西**，与 Vue 侧同形：工具条槽的产出排在最前（它是 `root` 的兄弟——`root` 是 `role=grid`，子节点只能是 row 与 rowgroup）、`root` 本身、以及根自己渲的播报区（活动区域塞进 `role=grid` 是 `aria-required-children`）。工具条槽的载荷只给对整张表下手的那几样，逐行的东西（可见行、行号、逐行查询）不进来。

  `transfer` 的两个面板共用一份实现，只在 `side` 上不同；`XhTransferSourcePanel` / `XhTransferTargetPanel` 各是一层薄壳，部件名与 Vue 侧一一对上。搜索框带 `value` 与 `onInput`、没有 `onChange`，按既有口径补了一个空的 `onChange`（React 要求带 `value` 的输入交出一个出口），不改用 `readOnly`——那一项在归一化快照的基准属性表里，改了逐帧对拍当场分叉。

  六个组件在 Vue 侧一个部件都不收 `asChild`，React 这边照样不收；六个的机器里也都没有 `FORM.RESET`，因此都不调 `useFormReset`，也没有影子输入。

  四条判据链全绿：共享一致性套件这六个组件共 91 条（`table` 25 / `tree` 23 / `transfer` 17 / `virtualizer` 10 / `infinite-scroll` 9 / `list` 7，含各自的键盘表覆盖行），**键盘豁免一条** `table.kbd.column-visibility`，理由照 Vue 侧同一行逐字抄（列设置区在 `root` 之外，fixture 表达不出它的兄弟位）；服务端直出**零豁免**，六个都直出得了；与 Vue 的逐帧对拍与标签名对拍各收下这六个套件，`parity-react` 的待铺名单同步删掉六行；`react-coverage.json` 记到 81/126。逐帧对拍连跑两轮结果一致，没有抖字段。

  **已知没有判据咬得住的几处，逐条记在案。**

  - **jsdom 没有布局，量测口一律是空的。** `virtualizer` 的一致性套件自己把视口尺寸与滚动量桩成了可读可写，所以「该渲哪几条、位移多少、总长多少」这一路是真跑过的；但**条目的 `measure` 回喂没有任何用例碰过**——套件的 fixture 不开这个开关，真实高度回喂给内核那条线只有类型兜着。`getContentEl` 同理：内核不认识 content 节点，把这行 `refs.set` 整个摘掉，一致性套件与逐帧对拍全绿（已实测）。
  - **`infinite-scroll` 的滚动容器 `getTargetEl` 也判不红。** 套件那台假观察器只记「观察了谁」与 `rootMargin`，不记 `root`，而用例又不传 `target`；把这行 `refs.set` 摘掉，全套照样绿（已实测）。也就是说「列表滚在某个 overflow 容器里、提前量要按那块可视区算」这条接线，当前只有代码在保证。
  - **共享套件的 fixture 里不出现的部件，只有 `check-part-wiring` 的「源码里引到了那个 getter」在核，行为一条都没跑过，共 12 个**：`tree` 的 `item-checkbox` / `branch-checkbox` / `empty` / `loading`，`transfer` 的 `group` / `group-label` / `empty` / `loading`，`table` 的 `toolbar` / `column-list` / `column-visibility-trigger` / `load-more-trigger`。其中 `table` 的列设置那一组（列表区加显隐把手，以及「把手不写 `value` 时跟着所在列标题走」的那条继承）整条只有类型与门禁兜着。
  - **`table` 的工具条槽同理**：`check-slot-types` 只核「标了 `SlotChildren` 就得经 `renderSlot` 取值」，套件的 fixture 里没有工具条，载荷里那十四样一条都没被读过。
  - **播报区的文本不进判据**：归一化快照只收属性、文档序、焦点与事件，不收文本。`tree` 与 `table` 的 `live-region` 在不在场由逐帧对拍咬着，里面写了什么没有。
  - React 侧还没有浏览器态用例与计算样式快照这条输入，六个组件的皮肤、吸顶表头、虚拟滚动的真实滚动行为与拖动换位的指针路径一律不在判据内——这些只能在真机上看。

- 38740a3: **React 侧铺上日期时间这一族五个组件：`calendar`、`date-field`、`date-picker`、`time-field`、`time-picker`。**

  这一批是目前为止最重的一批：日历有网格与月份切换的键盘面，两个 picker 是浮层加输入的组合，两个 field 是分段输入。受控值、表单接线、浮层消解三样在同一批里全都要对。

  **`date-picker` 一个组件里跑四台机器**，是 React 侧第一个这样的组件。编排机 + 日历 + 起止两组分段输入共用一份 `scope`，三台内嵌机器的 props 都从编排机现读，所以建立顺序是硬的：`useOverlay` 先建（它要给编排机交 `config` / `registerLayer` / `presence`），编排机随后，日历与两组段位再随后。日历的 `getGridEl` 走各自的 `onCreate` 交出去——机器的挂载效应一启动就读 refs，放进组件自己的效应里就晚了。

  **分段输入与日期格子的处理器，React 上必须改装成原生监听器。** `connect` 派的 `focus`（DOM 的那一个，不是 `focusin`）、`pointerenter`、`pointerleave` 三样都不冒泡，而 React 的合成事件全部委派在根容器上、只在冒泡阶段派发：`onFocus` 挂的是 `focusin`，另外两个是从 `pointerover` / `pointerout` 合出来的。接线看着还在，段位得焦不记锚点、指针扫过日历不出区间预览——全程零报错。八处逐个走了 `useNativeEvents`：日历的网格与格子、两个 field 的段位、时间选择器的段位与浮层选项、日期选择器的段位与格子。

  **这条口径原先有一处静默漏检，顺手把门禁补上。** `check-native-events` 是拿「本组件自己那份 `connect` 派了哪几个不冒泡事件」当分母的，而 `date-picker` 自己那份一个都不派——它的段位与格子直接返回 `connectDateField` / `connectCalendar` 算出来的 props。于是这个组件整个被 `continue` 跳过：接不接原生监听器，门禁一句话都不会说。现在按「从兄弟组件目录引进了那一家的 `connect` 函数」把转交的那几家一并算进分母，`date-picker` 的三类事件因此进了等式（21 个组件 36 类 → 22 个组件 39 类）。反向验过：把格子那一行的 `onPointerEnter` 摘掉，门禁点名报出这一个。

  **共享一致性套件咬不到原生改装那一路**，它走的是真实的 `el.focus()`（`focusin` 会冒泡），接线断了照样全绿。补了 `date-time-native-events.spec.tsx` 八条，按 DOM 的送达路径直接派发。八条一并反向验过——五个组件的 `useNativeEvents` 名单全清空，八条整齐判红。

  **认表单重置的四个组件逐个调了 `useFormReset`，锚点接在根部件自己渲的那个节点上。** `date-picker` 那边四台机器逐一挂：编排机与两组段位各自认重置，日历那台不认、由 hook 自己让位；漏挂内嵌那两组的话，浮层里的值回去了而输入行里的段位还停在旧值上。门禁对 React 只做静态串匹配（源码里有没有这句调用），核不到那只 ref 有没有真落到根节点上，所以 `form-reset.spec.tsx` 里补了四条行为用例。两个方向都反向验过：摘掉那句 hook，四条判红；只把 `date-field` 根节点上的 `ref=` 拿掉、hook 留着，那一条照样判红。

  **双面板的面板号也补了一份判据。** 面板号写在日历上一处，面板内的标题、网格与格子跟着它走，自己写了仍按自己写的算——落点在 React 上是一个默认值为 0 的 context 加一个 `usePanelIndex`。共享套件的 fixture 是单面板的，落点恒为 0，「跟着所在的日历走」这条路一次都不走。`date-picker-panel-index.spec.tsx` 四条，与 Vue 侧同名那份对位；把 `usePanelIndex` 改成无视显式写的那一份，四条全红。

  四条判据链全绿：共享一致性套件这五个组件共 150 条（含各自的键盘表覆盖行），**键盘豁免零条**；服务端直出 **零豁免**；与 Vue 的逐帧对拍与标签名对拍各收下这五个套件，`parity-react` 的待铺名单同步删名；`react-coverage.json` 记到 56/126。

  **这一族在 Vue 侧没有一个部件收 `asChild`**，React 这边照样不收。四份影子输入按既有口径给了空的 `onChange`（值攥在机器里，React 又要求带 `value` 的输入交出一个出口），不改用 `readOnly`——那一项在归一化快照的基准属性表里，改了逐帧对拍当场分叉。`date-picker` 的浮层壳挂了自绘滚动条，与 Vue 侧同一处；层分支因此记的是输入行加浮层壳两个节点，按住条子拖动不会把浮层消解掉。

  **已知没有判据咬得住的几处，逐条记在案。** 共享套件的 fixture 里不出现的部件，`check-part-wiring` 只核「适配器源码里引到了那个 getter」，行为一条都没跑过：日历的 `prev-year-trigger` / `next-year-trigger` / `week-number`，日期选择器的那几个同名部件外加 `heading-year-trigger` / `heading-month-trigger` / `time-column` / `time-item` / `confirm-trigger`。其中 `XhDatePickerTimePanel`（`showTime` 打开时自动铺出时分秒三列）整个只有类型与门禁兜着。另外，React 侧还没有浏览器态用例与计算样式快照这条输入，五个组件的皮肤、退场动画与浮层定位一律不在判据内——这一族的浮层退场只能在真机上看。

- 0ad0615: **React 侧铺上第二个组件 `dialog`，浮层族的接线模板随之定形。**

  `dialog` 是浮层这一类的样板：运行时配置、消隐层注册、进出场租约、CSS 退场探测、portal 落点、模态背景失活，一次全接上。共用的那半抽成 `useOverlay`，另外 17 个浮层组件照它接即可。

  **refs 的交出时机是这一批的硬约束。** 机器的挂载效应（浮层定位与消隐层就在里面）一启动就读 refs，而组件自己的效应排在 `useMachine` 的挂载效应之后——放在那里就晚了。`useMachine` 因此多一个 `onCreate`：机器建好、挂载之前跑一次，StrictMode 整台重建时再跑一次，返回值在卸载时调用。

  **浮层落点的搬迁时机是一道两难，两边的代价都验过了。** 首帧就搬，React 会把这棵子树拆掉重建，机器刚放进去的焦点跟着丢——浮层展开却没有焦点，键盘用户当场卡住；推迟到挂载后的效应里搬，焦点保住了，但首帧与服务端标记的对齐要另说。React 没有「此刻在水合」这个渲染期信号，判不出该走哪一档，所以做成 `deferUntilMounted` 闸门，缺省立刻搬。实测 React 19 在缺省档下会把原位那份收掉、只剩落点上的一份，也不报错——原先担心的重影没有发生。服务端一律就地渲染（`react-dom/server` 对 `createPortal` 是直接抛，不是静默跳过），首屏即展开的浮层因此正文进得了标记。

  判据四条全绿：共享一致性套件 10 条、服务端直出 10 条（豁免只剩 `root` 这一条结构性的，与 Vue 同）、与 Vue 的逐帧对拍 17 条、标签名对拍 2 条。

  **逐帧对拍顺手补上一处归一化缺口。** 部件 id 的构造式是 `<组件>:<实例>:<部件>`，中段由宿主生成、逐家不同（Vue 是 `v-0`，React 是 `_r_1_`）。浮层收起时 `aria-controls` 指向的节点不在文档里，归一化写成 `@extern(原样 id)`，那个实例段就漏进了比对——两家逐帧对拍比的于是是取名规则而不是行为，9 条用例全红。现在部件 id 的实例段一律抹成 `*`，作者自己写的 id 不长这个形状、原样保留。

  **`check-read-ports` 有一处会让判据恒绿的解析错误。** 它把 `.tsx` 按 `ScriptKind.TS` 解析，JSX 于是被当成类型断言、整棵语法树散架，遍历一个节点都找不到——React 侧的插槽载荷比对因此从来没有真正跑过。这一类漏检比判错更难发现：门禁照常打印通过。

- e92ebf5: **React 侧再铺六个展示与标记组件：`avatar`、`avatar-group`、`separator`、`skeleton`、`spinner`、`tag`。**

  六个里只有 `avatar` 与 `tag` 有状态机，其余四个的 `connect` 直接吃 props，props 变了就整份重算属性。`avatar-group`、`spinner`、`tag` 三个在 headless 里声明了 `size` 或 `translations`，逐个调了 `withXhConfig`——`useMachine` 那一处只并 `locale` 与 `size`，按组件名分桶的文案到不了它，`separator` 与 `skeleton` 两样都没声明，不接。六个组件一条 `FORM.RESET` 都不认（机器的事件联合里没有），Vue 侧也没有一个部件收 `asChild`，这两条接线本批为空。

  **`avatar` 的 `load` / `error` 不必改装成原生监听器。** 这两个事件不冒泡，但 React 不把它们交给根容器上的委派：`<img>` 一类的元素由 React 直接在节点上挂 `load` / `error`，套件往 image 节点上直接派发的 `new Event('load')` 因此照常到达。改坏了验过——把 image 部件的属性整份摘掉，六条用例当场判红。

  **图片在机器就位前就已解码那一条另外补了用例。** 缓存命中或注水前就加载好的图，`load` 事件早在挂处理器之前派完，之后一辈子等不到，头像会永远停在回退位；补报由 image 部件提交后的效应负责。共享套件咬不到它——jsdom 不真取图，`complete` 恒假、`naturalWidth` 恒零，套件里的 `load` 全是手工派的。`avatar-cached-image.spec.tsx` 把这三个只读属性按「已解码」的样子接管掉，一个事件都不派也要落到 `loaded`；摘掉那句补报即判红。

  **`tag` 的「不给关闭钮就不建机器」在 React 上要拆成两个组件。** 不给关闭钮时 `OPEN` / `CLOSE` 两条路都走不到，展开态恒等于 `open ?? defaultOpen ?? true`，一台机器纯属开销——表格一页几十行、每行几个状态药丸就是几百台。Vue 那边在 `setup` 里按挂载那一刻的 `closable` 二选一，React 的 hook 不能按条件调，于是判据冻在 `XhTagRoot` 的一个 `useState` 里，两条路各自是一个组件（`connectTag` / `connectStaticTag`）。受控与非受控语义两条路逐条一致：受控时只发意图、值每次从 prop 现读，非受控时住在本地那一格。两条路各自反向验过——机器路摘掉 `translations`、快路把 `defaultOpen` 换成常量，都判红。

  **`XhSeparator` 的三段拼装与 `XhTagRoot` 替纯文字补 `label` 这两条分支，共享套件一次都走不到**：套件的 fixture 总把部件一个不落地写全。写错了套件照样全绿——分隔线会连成一条没有断口的线，标签的文字会直接摊在 root 上把关闭钮挤出去。补了一份 `shorthand-children.spec.tsx` 钉这两条：空白与假分支留下的 children 不算给了文案，文字里夹着节点就整份原样放行。判据用的 `slotIsPlainText` 与 Vue 侧同名同义，落在 `runtime/slot-content.ts`。

  四条判据链：共享一致性套件这六个组件共 41 条（含各自的键盘表覆盖行），**键盘豁免零条**；服务端直出 **零豁免**；与 Vue 的逐帧对拍与标签名对拍各收下这六个套件，`parity-react` 的待铺名单同步删名；`react-coverage.json` 记到 34/126。

  尚未交付：六个组件的浏览器态用例与计算样式快照（React 侧那一整条输入还不存在）；`skeleton` 与 `spinner` 的动效只落属性，动画由皮肤画，收不进 jsdom 的判据；`avatar-group` 只把上限如实落成 `data-max`，裁到几枚、「+N」里的 N 写多少仍全在作者手里，与另外两个适配器一致。

- 5328f38: **React 侧再铺六个展示与容器组件：`card`、`empty-state`、`statistic`、`progress`、`rating`、`timeline`。**

  六个里只有 `rating` 有状态机，其余五个的 `connect` 直接吃 props，props 变了就整份重算属性。六个在 headless 里都声明了 `size`，`rating` 另有 `translations`，因此逐个调了 `withXhConfig`——`useMachine` 那一处只并 `locale` 与 `size`，按组件名分桶的文案到不了它。Vue 侧这六个没有一个部件收 `asChild`，这条接线本批为空。

  **`rating` 认 `FORM.RESET`，接了 `useFormReset`，锚点是根组件渲出来的那个 div。** 值攥在机器里，原生 `reset` 只还原原生控件，不接这条线点重置什么都不会发生；Vue 那边由 `useMachine` 顺着组件实例的 `$el` 自动挂上，React 这边必须逐个显式给锚点。门禁对 React 只做静态串匹配，核不到 ref 究竟落在哪个节点上，所以在 `form-reset.spec.tsx` 里补了一条行为用例：点到第 3 颗星、`reset`、回到 `defaultValue` 且表单影子跟着还原。摘掉那句 `useFormReset` 即判红。

  **`rating` 的表单影子带 `value`，补了一个空的 `onChange`。** React 要求带 `value` 的输入交出一个变更出口，否则开发构建里逐帧告警；不能改用 `readOnly` 收告警——`readonly` 在归一化快照的 `BASE_ATTRS` 里，多加一个属性会让逐帧对拍当场分叉，而 `connect` 自己按 `readOnly` 这个 prop 发的那一份 `readonly` 照旧。

  **`rating` 有四个 `connect` 处理器要改装成原生监听器，其中一条是这一批新遇上的。** `control` 的 `onFocus` 与 `onPointerLeave` 是老口径：前者是不冒泡的 DOM focus，React 的同名合成事件挂的是冒泡的 `focusin`；后者 React 由 `pointerout` 推导，直接派到节点上的 `pointerleave` 到不了。新的一条是 **`item` 的 `onClick` 与 `onPointerMove` 要读 `offsetX`**——指针落在这颗星的左半边还是右半边全靠它，而 **React 的合成鼠标事件根本不带 `offsetX`**（它只搬 `clientX` / `pageX` / `screenX` / `movementX` 那一组），半颗星于是被一律算成整颗。这一条是共享套件的 `allowHalf` 用例先判红才发现的。`onFocusOut` 归到的 `onBlur` 本就是冒泡的 `focusout`，不动它。

  **`timeline` 的条目语气经上下文下传给它自己那颗圆点。** `getIndicatorProps` 收条目参数，而圆点是写在条目里的兄弟节点，拿不到条目的 props；照 `steps` 的两层上下文写法，条目在自己这一层再 provide 一份身份。

  **`progress` 是单件不是部件族**，形态决定结构：线形渲成轨道套进度两层 `div`，环形把同一份几何画进一张 `<svg>` 里的两个 `<circle>`，环心那一块只在作者给了内容时才渲——不然一个空盒子会压在环上把指针挡住。

  四条判据链：共享一致性套件这六个组件共 48 条（`card` 5 / `empty-state` 6 / `statistic` 9 / `progress` 8 / `timeline` 8 / `rating` 12，含 `rating` 键盘表的五行覆盖），**键盘豁免零条**；服务端直出 **零豁免**；与 Vue 的逐帧对拍与标签名对拍各收下这六个套件，`parity-react` 的待铺名单同步删名；`react-coverage.json` 记到 51/126。

  **两处共享套件咬不到的分支各补了一份用例。** `progress-ring.spec.tsx` 钉环形那条分支：套件的 fixture 只有一个 root 节点、也不给 children，环形与环心一次都走不到，画布写成 `div`、环心恒渲一个空盒子都不会判红。`rating-native-events.spec.tsx` 钉 `control` 的 `onFocus`：套件的 `focus` 步骤只落在 `control` 自己身上，从不直接聚焦某颗星，而 React 的 `focusin` 会在星星得焦时也把那个处理器叫起来一次、把焦点抢回锚点。两份都反向验过——把实现改回默认写法即判红。

  **有一处接线目前没有判据咬得住**：`item` 的 `onFocus` 也走了原生监听器（与 `control` 同一条口径），但把它退回 React 合成事件，共享套件与新补的两份用例全都照样绿——`focusin` 从星星冒到 `control` 之前会先在星星自己身上派一次，行为恰好重合。只有星星里再嵌一个可聚焦节点时两者才分叉，而库里的星星只放字形。留着是为了与另外两家同一条到达路径，不是为了过某条判据。

  尚未交付：六个组件的浏览器态用例与计算样式快照（React 侧那一整条输入还不存在）；`rating` 的半档几何在 jsdom 里只能手工喂 `offsetX` 与 `clientWidth`，真实布局下的落点判读仍要等浏览器态；`progress` 的不确定态与环形动画只落属性，动画由皮肤画，收不进 jsdom 的判据。

- 519b544: **再铺 `button` / `toast` / `notification` / `loading-bar`，并交出第一个命令式服务。已铺 12/126。**

  `createDialogService` 是服务层的样板：从组件树之外调起，自带宿主树，同一时刻只挂一个对话框、后来的排队，退场窗口走完才放下一个。八条用例钉住行为，其中一条专盯 `dispose`——队里没结的一律按取消结掉，调用方的 `await` 不会永远挂着。

  React 版与 Vue 的结构差异写在代码里：Vue 用 `reactive` + `createApp`，React 这边宿主树在组件树之外，状态自己存一份、经 `useSyncExternalStore` 推重渲；`prompt` 的可写代理换成「值 + set 回调」。

  **`@xihan-ui/react/behavior` 此前是错的。** 这个子路径在 Vue 侧是「行为原语的框架包装」——滚动锁、悬停意图、滚动观察、贴底、连敲检索五件，文档里明写「自建浮层才用得上，不用的应用不必把它压进主入口的体积」。React 侧第一批却把机器运行时放了进去，两家同名子路径指着完全不同的东西：照 Vue 文档写 `import { useScrollLock } from '@xihan-ui/react/behavior'` 什么也拿不到。现在按 Vue 那五件逐个包装，机器运行时留在主入口。

  这一处是被体积预算撞出来的：`react/behavior` 7.51 kB 顶破了 3.8 kB 的额度，而那个额度是照 Vue 同名条目抄的——数字对不上正说明装的不是同一批东西。改完 3.52 kB。

  **顺带记一处判据够不着的地方**：公开面基线把「子路径清单」与「导出名清单」分开记，名字不与子路径挂钩。把一个导出从一个子路径挪到另一个，基线看不出任何变化，而消费方的 import 会断。三家适配器都在这条口径下。

  **connect 的处理器按 DOM 语义写，React 的合成事件在两处不满足它**，这一批又撞到两次：`button` 在载入态调 `stopImmediatePropagation()` 拦同节点上作者的处理器（React 的 SyntheticEvent 没有这个方法，直接抛）；`toast` 与 `notification` 的卡片派 `pointerenter` / `pointerleave`（不冒泡，React 的同名合成事件是从 `pointerover` / `pointerout` 合出来的，直接派到节点上的那一种到不了）。都用 `useNativeEvents` 把这几个处理器改装成原生监听器；它新加了一个 `only` 参数——`toast` 只摘那两个指针事件，因为同一份 props 里的 `onFocusIn` / `onFocusOut` 归到 React 的 `onFocus` / `onBlur` 恰好挂的是冒泡的 `focusin` / `focusout`，整份改装反而会让焦点落在内部按钮上时按不住计时。

  两张门禁的 React 读取器此前只认「同名目录」，而 `button` 与 Vue 侧一样是单文件平铺：`check-part-wiring` 直接判红，`check-read-ports` 则是**静默跳过**。两张都改成两种形态都认——`check-read-ports` 的可比对份数随之从 1 涨到 6，说明此前一直有组件在它眼皮底下没被核过。

- 278e7e5: **React 侧交出另外三个命令式服务：`createToastService`、`createNotificationService`、`createLoadingBarService`。** 加上此前的对话框服务，四个服务面与 Vue 侧齐平——从组件树之外调起，自带宿主树，命令面与文案配置逐条对齐。

  一处 Vue 与 React 的真实差别：`createRoot().render()` 是排队的，而 Vue 的 `app.mount()` 当场渲完。服务建好之后紧接着发的那条命令（`createToastService()` 下一行就 `toast.info(…)`，拦截器里很常见）在 React 这边找不到队列句柄，会被当成「宿主没挂起来」静默丢掉。首帧提交因此由 `flushSync` 包住。十三条用例里当时红了九条，红的正好全是「渲出来了吗」那一类——静默丢消息这件事不会自己冒头。

  进度条那三条用例第一版盯的是 `data-loading`，而机器给的是 `data-state`（`idle` / `loading` / `finishing`），`null` 与 `null` 比，三条里有两条一路绿着什么也没核。改成盯 `data-state`，并把「在途计数不是布尔开关」钉进去：两笔并发只回来一笔时不该收。

- 950ae67: **React 适配器再铺六个组件：`accordion`、`collapsible`、`checkbox`、`toggle`、`alert`、`badge`。** 折叠两件、表单控件两件、纯展示两件，公开面从 12 个组件涨到 18 个。

  六个都不碰浮层，所以这一批没有新的定位与消隐层接线。真正新增的运行期件只有一个：`runtime/use-overlay-exit.ts`。折叠族的 content 需要退场闸门——连接层给它打的 `hidden` 跟着展开态走，收起那一帧节点就不生成盒子，退场动画一帧都播不出来。浮层族那几个走 `use-overlay`（它们还要连消隐层、遮罩与定位一起管），折叠族只需要「几时真的收起」这一件事，所以另收一个薄件：presence 建一次、每次提交后按展开态 update、把 CSS 退场动画接到退出租约，收起落成内联 `display: none`。首帧的展开态用 `useState` 冻住，每帧现算会让展开一次就重建一次 presence、退场租约跟着断掉。手风琴的闸门按面板各开一个：切换项时一个进场一个退场是同时发生的。

  `checkbox` 是 `switch` 之后第二个认表单重置的组件。React 的桥是个 hook、由组件自己调，不像 Vue / WC 在运行时统一挂一次，所以它逐个组件挂：锚点取组件渲出来的最外层节点——给了文字时是外面那个 `<label>`，没给时就是那颗按钮。半选也走这条线，重置回 `defaultChecked="indeterminate"`。字段接线照 `switch`：说明与校验状态落在焦点所在的那颗按钮上，字段的标签并进名字链。

  `badge` 没有机器，`connectBadge` 直接吃 props；全局配置经 `withXhConfig` 并进来。角标的计数文本作为函数式 children 的载荷交给作者。`alert` 的 `translations` 同样只能经 `withXhConfig` 拿到——`useMachine` 那一处只并 locale 与 size，按组件名分桶的文案到不了它。

  判据一并接上：一致性套件、服务端直出、Vue×React 的逐帧对拍与标签名对拍四条链，加上 `react-coverage.json` 的登记。这六个一个 SSR 豁免都没用上，键盘覆盖也没有豁免行。对拍连跑三轮无抖动。

  **尚未交付**：`checkbox-group` 与 `toggle-group` 还没铺，这两个单件目前只能单独用；手风琴的 `collection` 铺开走 `renderContent` 这个渲染 prop，与 Vue 侧的 `#content` 插槽是同一份能力的两种介质。

- e92ebf5: **React 侧再铺五个组件：`checkbox-group`、`radio-group`、`toggle-group`、`fieldset`、`field-array`。已铺 23/126。**

  前三个是组族，各自与已铺的单件配对：`checkbox-group` 每一项自成一个 Tab 停靠点、另带一颗第三态的全选格（`select-all-trigger` 在事件里现查活 DOM 认领可用条目），`radio-group` 与 `toggle-group` 走 roving tabindex，整组只占一个 Tab 位。组级的禁用、只读、必填与校验状态都由 connect 逐条铺到条目上——`role=group` 接不住 `aria-invalid`，所以校验标记落在每个条目上而不是根上。三个组的表单出口形状不同：复选框组与单选组每个条目内各一份原生输入，开关组整组只有一份。

  后两个是字段容器。`fieldset` 无状态机，root 必须是原生 `<fieldset>`、legend 必须是原生 `<legend>`：整组禁用连坐组内控件与「legend 即组名」都是浏览器给的，换成 `div` 只剩一层灰样式。`field-array` 是唯一交出整套动作的那个——函数式 children 交出逐行投影 `items`、行数与上下限状态，以及 `add` / `remove` / `move` 五个动作；删完、挪完由机器按把手的 id 把焦点接到接位的行上，那份 id 从 React 的 `useId` 派生的 scope 来。

  **容器的 `onFocus` 必须装成原生监听器。** `radio-group` 与 `toggle-group` 的 connect 在 root 上派了一个 `onFocus`，它写的是 DOM 的 `focus`——不冒泡，只在容器自己得焦时接管，把焦点转投给锚点条目。React 的同名合成事件挂的却是冒泡的 `focusin`：条目得焦也会把它叫起来，而那一帧的 `anchor` 还停在上一次的取值，于是焦点被从条目抢回旧锚点。改坏了验过：这一条不接，「禁用条目仍是方向键的起点」当场判红。`useNativeEvents` 的 `only` 只摘 `onFocus` 这一个——`onFocusOut` 经归一化落到 React 的 `onBlur`，那本就是冒泡的 `focusout`，改装反而会让它收不到后代失焦。

  **带 `checked` 的影子输入要交出一个变更出口。** 复选框组与单选组的隐藏输入是 `type=checkbox` / `type=radio` 且带 `checked`，React 在开发构建里会逐帧告警「受控字段没有 onChange」。这里给的是一个空出口：值由机器持有，节点又是 `inert`，它不会被调用；`readOnly` 不能用——那会多出一个 `readonly` 属性，与另外两家的 DOM 不再一致。

  四条判据链：共享一致性套件这五个组件共 70 条、服务端直出 **零豁免**、与 Vue 的逐帧对拍与标签名对拍各收下这五个套件（`parity-react` 的待铺名单同步删名）。另在 `form-reset.spec.tsx` 里补了四条行为用例——四个认表单重置的组件各一条：门禁只静态核那句 `useFormReset(` 在不在，核不到锚点 ref 有没有真落到根节点上，而这一路失效时页面上不报任何错。

  尚未交付：五个组件的浏览器态用例与计算样式快照（React 侧那一整条输入还不存在），以及 `field-array` 的 `item-label` 部件只有组件、共享套件的 fixture 里还没有它的位置。

- 38740a3: **React 侧铺上排版与版式这一批八个组件：`flex`、`grid`、`layout`、`page-header`、`descriptions`、`truncate`、`typography`、`watermark`。**

  八个里六个没有状态机（`flex` / `grid` / `page-header` / `descriptions` / `typography` / `watermark`），`connect` 在渲染期直接算出属性；`layout` 与 `truncate` 各跑一台机器。

  **没有机器的那几个，全局配置只能自己接。** `useMachine` 那一处只并 `locale` 与 `size`，按组件名分桶的文案到不了没有机器的组件。headless 上声明了 `size` 的三个——`descriptions`、`page-header`、`typography`——逐个走 `withXhConfig`；另外三个两样都没声明，与 Vue 侧一样不接，接了也是空跑。反向验过：把 `descriptions` 那一句换成裸对象，`check-config-wiring` 点名报出这一个。

  **这一批没有一处要改装原生监听器。** 八份 `connect` 派出去的处理器只有 `onClick` 与 `onKeydown`（`layout` 的把手与遮罩、`truncate` 的整块文字），两个都冒泡，走 React 的合成事件即可；`check-native-events` 因此在这八个上不产出任何待办。同样地，八台里没有一台认 `FORM.RESET`，`useFormReset` 一处都不接。

  **Vue 侧这一批没有一个部件收 `asChild`，收的是 `as`。** 换标签在这里是真需求：页头的标题要能写成 `h1`、描述列表的根是 `dl`、版式的富文本要能换成 `article`。React 这边照 `button.tsx` 的写法给 `as?: ElementType`，默认标签与 Vue 逐个对齐（`descriptions` 的 dl / div / dt / dd，`page-header` 的 button 与 div，`typography` 的 p / span / div），由标签名对拍咬住。与 `XhButton` 同一个限制：props 仍按默认标签声明，`as="a"` 时 `href` 这类另一标签独有的属性过不了类型。

  **`truncate` 的量测口经 `onCreate` 交出去。** 机器的挂载效应一启动就挂 `ResizeObserver` 与 `MutationObserver` 并立刻量一次，放进组件自己的效应里就晚了——那一步排在 `useMachine` 的挂载效应之后，观察器挂上时读到的是 `null`，量测整条链静默不跑。`grid` 的列数、跨列与错列收字符串与 JSON 串（特性写法拿到的就是串），解析不出对象时按没写算。`flex` 给了 `split` 时在每两个子项之间自动铺一个分隔符部件：`Children.toArray` 已经丢掉 `null` / 布尔并把数组摊平，这里再滤掉只有空白的文本节点。

  **共享套件咬不到的三处，各补了一份行为用例。**
  `flex-split.spec.tsx` 八条：套件的 fixture 把 `split` 部件一个不落地手写在树里，自动铺那一支一次都不走；反向验过——把自动铺那一支拿掉，六条判红。
  `truncate-children.spec.tsx` 五条：套件只递静态子节点，函数式 `children` 的载荷一次都没取过，量测口的接线也只有一张静态门禁看着；反向验过——去掉 `onCreate`，这一份判红两条、一致性套件同时判红六条。
  `as-tag.spec.tsx` 六条：`as` 与 `descriptions` 的 `span` 在套件的 fixture 里从不出现，标签名也不进快照；两个方向各自反向验过（钉死标题的标签、丢掉 `span`，各判红一条）。

  四条判据链全绿：共享一致性套件这八个组件共 86 条（含 `layout` 与 `truncate` 的键盘表覆盖行），**键盘豁免零条**；服务端直出 **零豁免**；与 Vue 的逐帧对拍与标签名对拍各收下这八个套件，`parity-react` 的待铺名单同步删名；`react-coverage.json` 记到 69/126。

  **已知没有判据咬得住的几处，逐条记在案。**
  `layout` 显式建的那份 `scope`（走 `useReactScope`，基名取 React 的 `useId`）拿掉之后判据全绿：把手的 `aria-controls` 与侧栏的 `id` 都出自同一个 service 的 scope，服务自己建一个也对得上；它真正管的是服务端直出与客户端首帧的 id 要同源，而 React 侧还没有这条判据的输入。
  `page-header` 的 `breadcrumb` 与 `media` 两个部件不在共享 fixture 里，只有 `check-part-wiring` 的静态接线核着，行为一条都没跑过。
  `grid` 的 `rows` 收字符串这条路没有用例（套件只给数字）。
  `watermark` 这一侧没有量测口——图样与平铺步距是 `connect` 按字号与角度算出来的，不读 DOM；判据能核到的就是根上那两个内联自定义属性。
  React 侧仍然没有浏览器态用例与计算样式快照这条输入，这八个组件的皮肤、`truncate` 的真实裁行与 `layout` 覆盖档的退场动画一律不在判据内。

- d18d6a5: **React 侧铺上最后四个组件：`masonry`、`heatmap`、`timer`、`timestamp`。`react-coverage.json` 记到 126/126，待铺清零。**

  四个各占一种模型：`masonry` 是没有机器的排版容器，分几列与每一项落哪一列都要先量到尺寸，量测与分配归适配器，`connect` 只把结果落成属性；`heatmap` 跑机器，一份 `connect` 同时供日历、月历、矩阵三种形态，网格由作者按网格模型铺，键盘在 `grid` 上收口；`timer` 跑机器，起跑后在宿主里挂着两个定时器（按 `interval` 跳数字的那一个与精确落在终点上的那一个）；`timestamp` 一台机器都没有，文本与 `datetime` 全部由 `connect` 从入参算出来。

  **`heatmap` 的三路不冒泡事件改装成原生监听器。** `grid` 上是「网格自己得焦就把焦点转投给锚点那一格」的 `focus`，`cell` 上是 `focus` 与 `pointerenter` / `pointerleave`。`grid` 的 `onFocusOut` 不动——它经归一化落到 React 的 `onBlur`，挂的正是冒泡的 `focusout`，改装反而会改坏「网格内部换格子不算离场」那一条；`onPointerCancel` 同理，`pointercancel` 本就冒泡。另外三个组件的 `connect` 一个不冒泡的事件都不派。

  - 指针那一路由共享套件自己咬住：`heatmap` 的详情条用例本就直接往格子上派 `pointerenter` / `pointerleave`。反向验过：把 `bind.attrs` / `bind.ref` 换回裸的 `getCellProps()`，「详情条：指针进到某一格就打开，离开即收起」当场判红。
  - 聚焦那两路共享套件咬不住——它走的是真实 `el.focus()`，`focusin` 会冒泡，React 的合成事件照样收得到。新加 `tests/heatmap-native-events.spec.tsx`，按 DOM 的送达路径直接派 `focus`：观察口一条取 `document.activeElement`（网格得焦后焦点该落到锚点那一格），一条取 roving tabindex 的换人。反向验过：两处 `useNativeEvents` 一起换回裸 props，两条同时判红。

  **`timer` 卸载时要把定时器摘干净。** 共享套件只在挂载态里断言，卸载之后那一段没有判据：定时器留着的话组件早已不在页面上、回调还在按拍调用。新加 `tests/timer-unmount.spec.tsx`，两条分别核跳数字的那一拍与落在终点上的那一次，观察口取卸载前后的回调计数。反向验过：把 `useMachine` 挂载效应的清理换成空函数，两条判红。

  **`masonry` 的观察名单与卸载。** 新加 `tests/masonry-observer.spec.tsx`，换一个只记「谁被观察了、断开过几次」的观察器进去——不伪造任何尺寸，核的是「容器与每一项都在名单里」「项增删后名单跟着换人」「卸载时摘干净」这三条接线。反向验过：去掉卸载清理里的 `disconnect()`，第三条判红。

  **四个组件都不认表单重置**（机器里没有 `FORM.RESET` 声明，`masonry` 与 `timestamp` 更是连机器都没有），**没有一个部件带影子输入**，**Vue 侧也没有任何一个部件收 `asChild`**，React 这边照样不收。

  **`timer` 的条目文本恒归组件写。** 作者写进 `XhTimerItem` 的内容不渲染：属性照收（走 `mergeReactProps`），内容由 JSX 的显式子节点盖掉，与 Vue 侧「组件不声明插槽」是同一个结果。这一条由套件的「条目里的文本恒归组件写」咬着。

  **`masonry` 的 `columns` 在 React 只收数字与断点对象。** Vue 侧兼收字符串是为了模板里写 `columns="3"`，React 的 props 是值不是属性，没有这一层。其余入参与 Vue 逐个同名同义。

  **四条判据链全绿：** 共享一致性套件这四个组件共 46 条（`heatmap` 21 / `timer` 9 / `timestamp` 8 / `masonry` 4，另各有一条键盘表覆盖），**键盘零豁免**；服务端直出**零豁免**，四个都直出得了；与 Vue 的逐帧对拍与标签名对拍各收下这四个套件，`parity-react` 的待铺名单随之清空——那份 `PENDING` 与它带的三条比对整段删掉了，覆盖等式收紧成「目录里的套件一个不落地在对拍」，不留一个恒真的空判据。

  **已知没有判据咬得住的几处，逐条记在案。**

  - **`masonry` 的量测整条没有判据。** jsdom 没有布局，`getBoundingClientRect()` 恒为 0：按容器宽度换档（`resolveMasonryColumns` 的断点那一支）与按真实高度分配（最短列优先、逐列填）两条都走不到——套件里「三项三列各占一列」这个结果在高度全为 0 时与「逐列轮流」同解，验的是兜底那一支而不是量测那一支。把 `measure()` 整个换成空函数，一致性套件、逐帧对拍与标签名对拍全绿。新加的观察器用例只核名单与断开，观察器回调触发之后的重排同样没有判据（尺寸变化在 jsdom 里发不出来）。
  - **`heatmap` 不写 `children` 时组件自己铺的那棵默认树，只有新加的那份用例走到。** 一致性套件的每个用例都自带 fixture，三种形态的默认树与两个渲染口（`renderCell` / `renderTooltip`）一次都没被套件碰过；新加的用例走的是日历形态那一支，月历与矩阵两支的默认树没有判据。
  - **`heatmap` 的两个对外事件进不了快照。** 两个宿主的公开事件表只收登记过的那些，`cell-focus` 与 `cell-active` 都不在表内，派没派、派了几次一律看不见。
  - **`heatmap` 的详情条落点没有判据。** 套件对详情条只断言 `data-state` 与 `data-placement` 两样，后者由「活跃那一格在本组行里的第几行」算出来、与量测无关；真正量出来的坐标与尺寸落成内联的 `--xh-_heatmap-tip-*` 与 `data-inline-anchor`，前者归一化快照不收 style，后者一次都没进期望表，jsdom 也量不到矩形。
  - **`timer` 有八个入参在共享套件里一次都没走到**：`value`、`active`、`autoStart`、`interval`、`targetMs`、`precision`、`format`、`live`。它们随整份 props 交进机器，接线本身没有单独的判据；其中 `autoStart` 与 `interval` 由新加的卸载用例顺带走到，其余六个仍然只有代码在保证。
  - **`timestamp` 只在给了 `now` 时是确定的。** 套件的相对说法用例全部显式传参照时刻，不给 `now` 时取真实墙钟那一支没有判据。它也不自己刷新（Vue 侧同样不刷）：相对说法不会随时间自己变，这是当前定案而不是遗漏。
  - React 侧还没有浏览器态用例与计算样式快照这条输入，四个组件的皮肤——瀑布流的列宽与间距、热力图的色阶与详情条、计时器与时间戳的字号——一律不在判据内。

- 968f4da: **React 侧铺上媒体这一族六个组件：`image`、`image-viewer`、`image-cropper`、`carousel`、`qr-code`、`signature-pad`。**

  一族里三种模型都齐了：`qr-code` 无机器、矩阵全由 props 算；`image` / `carousel` / `image-cropper` / `signature-pad` 各跑一台机器；`image-viewer` 是模态浮层，走 `useOverlay` 那一套（运行时配置、消隐层注册、进出场租约、CSS 退场探测、落点解析）。

  **`image` 的 `load` / `error` 不改装。** 先按 `avatar` 的做法确认过：这两个事件在 React 里本来就不走委派——`load` / `error` 与 `scroll` 一样直接装在节点上，`connect` 派下来的处理器原样交给 `<img>` 就能收到。门禁那张不冒泡事件表里也没有它们（表里只有 `focus` / `pointerenter` / `pointerleave` / `mouseenter` / `mouseleave`），摘出来反而是无中生有。图片在机器就位前就已解码那一路照 `avatar` 补了提交后的效应，另配 `image-cached-image.spec.tsx` 两条——共享套件咬不到它（jsdom 不真取图，`complete` 恒假、`naturalWidth` 恒零，套件里的 `load` 全是手工派的）。反向验过：把补报那一句摘掉，「一个 load 事件都不派也落到 loaded」当场判红。

  **`carousel` 根上的 `pointerenter` / `pointerleave` 必须改装成原生监听器。** 这两个不冒泡，而 React 的同名合成事件是从 `pointerover` / `pointerout` 合出来的——指针在幻灯片之间划过就会重放一遍，自动播放的按住与放开跟着乱跳。`onFocusIn` / `onFocusOut` 不动：它们经 `reactNormalize` 归到 React 的 `onFocus` / `onBlur`，挂的正是冒泡的 `focusin` / `focusout`。两个方向都反向验过——名单清空后 `check-native-events` 点名判红，共享套件那条「指针停上去即按住，移开又接着播」也判红（这一族的指针进出是直接派在 root 上的，不像焦点那路走真实 `el.focus()`，所以套件这次咬得住）。

  **认 `FORM.RESET` 的两个组件各挂一座重置桥。** `image-cropper` 的裁切矩形与 `signature-pad` 的笔迹都攥在机器里，原生 `reset` 只还原原生控件，不接这条线点重置什么都不会发生。锚点接在根部件自己渲的那个 `div` 上。门禁对 React 只做静态串匹配（源码里有没有这句调用），核不到那只 ref 有没有真落到根节点，所以 `form-reset.spec.tsx` 补了两条行为用例：裁切那条先把图片自然尺寸由 `load` 报进去、方向键挪一格再重置；签名那条桩上画布矩形、落笔划一笔再重置。两条都反向验过，摘掉 hook 整齐判红。

  **三份影子输入按既有口径给了空的 `onChange`**（`image-cropper` 的两条滑杆与隐藏输入、`signature-pad` 的隐藏输入）——值攥在机器里，React 又要求带 `value` 的输入交出一个出口。不改用 `readOnly`：那一项在归一化快照的基准属性表里，改了逐帧对拍当场分叉。

  **`qr-code` 判断作者放没放 logo 的那一步，React 比 Vue 短一截。** Vue 侧要先落到 `shallowRef` 再让 `computed` 依赖它（插槽有没有东西是渲染期才知道的事实，进不了 computed 的依赖）；React 的 `children` 在渲染期就在手里，`slotPaints(children)` 直接算进 `connectQrCode` 的入参。反向验过：把它钉死成 `false`，「放 logo」那条报出「放了 logo 却没铺挖空矩形」。顺带给 `reactNormalize` 的属性别名表补了 `shape-rendering → shapeRendering`——全仓只此一处连字符 SVG 属性，不换名 React 会在开发构建里逐帧告警（属性照旧渲染，但那条告警是噪音）。

  **`asChild` 照 Vue 侧的收法**：这一族只有 `image-viewer` 的 `trigger` 收，其余部件一个都不收。

  四条判据链全绿：共享一致性套件这六个组件共 **85 条**（含各自的键盘表覆盖行），键盘豁免 **两条**——`image-viewer.kbd.tab` / `shift-tab`，理由照 Vue 侧同一行（jsdom 按 Tab 不移动焦点，焦点环绕演不出来）；服务端直出 **零豁免**；与 Vue 的逐帧对拍与标签名对拍各收下这六个套件，`parity-react` 的待铺名单同步删名；六个登记进 `react-coverage.json`。

  **已知没有判据咬得住的几处，逐条记在案。**

  - **`image-viewer` 视口上滚轮缩放的原生改装。** `connect` 那一行写明「适配器须以 passive:false 绑定这个监听」，而 React 把 `wheel` 委派在根容器上、登记为被动监听器，那条路上的 `preventDefault()` 是空操作——滚轮缩放的同时页面照滚。这里走 `useNativeEvents(props, ['onWheel'])` 装到节点上（元素上 `addEventListener` 的 `passive` 默认为假）。共享套件里一条滚轮用例都没有：把这处改装整个撤掉，全套 1674 条照样全绿。这一条目前只有代码与本说明，没有判据。
  - **`carousel` 视口的指针拖动与 `image-viewer` 的单指平移、双指捏合。** 两家套件都只断言了「没在拖」那一档（`data-dragging: null`），落笔之后的那条路一步都没走。这两处的 `pointerdown` 都冒泡、走 React 合成事件即可，但接没接上没有东西核。
  - **量测口这一族其实不涉及**：`carousel` 与 `image-viewer` 的 headless 里没有任何 `getBoundingClientRect` / `clientWidth` —— 轨道位移是纯百分比 `transform`，浮层定位由皮肤的 `inset` 直接摆。真要量尺子的是 `image-cropper` 的视口与 `signature-pad` 的画布，这两处共享套件自己把矩形桩在了真实节点上，拖动与落笔两条路都跑到了。
  - **React 侧仍没有浏览器态用例与计算样式快照这条输入**，六个组件的皮肤、`image-viewer` 的退场动画与浮层落位一律不在判据内。

  **没交的部分**：`docs/adapters/react.md` 里的已铺数与公开面基线这一轮没动（`check-doc-numbers` 会因此判红），归协调方处理。

- e92ebf5: **React 侧再铺五个导航与结构组件：`tabs`、`segmented`、`steps`、`breadcrumb`、`pagination`。**

  五个都是键盘面重的组件：方向键沿轴走、Home / End 跳首末、`tabs` 与 `steps` 还分手动与自动两档激活（automatic 下方向键顺带切换选中，manual 下只搬焦点、Enter / Space 才落值）。共享键盘表 27 行逐行有用例认领，**一条豁免都没加**——jsdom 演不出来的只有真实 Tab 焦点环绕那一类，这五个都不涉及。

  `tabs` 的换位与关闭是通知而非命令：库不持有标签序，`onTabMove` / `onTabClose` 只发意图，DOM 里的顺序要宿主写回 `collection` 才变。`steps` 的 `linear` 把没走到的那几步锁成 `aria-disabled`（不是原生 `disabled`，那样就当不成方向键的起点）。`breadcrumb` 没有状态机，`connect` 直接吃 props；当前页那条渲染成带 `aria-current="page"` 的 `<a>`，点击由连接层拦下，避免 href 跳回自己。`pagination` 是这一批唯一带浮层的：省略位可展开，接了运行期配置、消解层与定位引擎，收起走 presence 闸门落成内联 `display`，自绘滚动条挂在 positioner 上。

  **容器的 `onFocus` 必须装成原生监听器，这一批又踩到三处。** `tabs.list`、`steps.list`、`segmented.root` 的 connect 都派了一个 `onFocus`，写的是 DOM 的 `focus`——不冒泡，只在容器自己得焦时把焦点转投给锚点条目。React 的同名合成事件挂的是冒泡的 `focusin`，条目得焦也会把它叫起来，那一帧的锚点还停在上一次的取值，焦点被从条目抢回旧锚点。改坏了验过：`tabs` 的「点击 trigger 切换选中」与 `steps` 的三条（点 trigger 切步 / linear / 受控 value）当场判红。`useNativeEvents` 的 `only` 只摘 `onFocus`——`onFocusout` 经归一化落到 React 的 `onBlur`，那本就是冒泡的 `focusout`，改装反而收不到后代失焦。条目自己的 `onFocus`（`tabs.trigger` / `steps.trigger` / `segmented.item`）同样是不冒泡的 `focus`，一并装成原生监听器；这一处在共享套件里咬不到（容器那一条接对之后，两条到达路径产出的 DOM 相同），钉的是「按钮的后代得焦不该算本条目得焦」这条语义。

  **`pagination` 的省略位靠 `pointerenter` / `pointerleave` 摊开与收起，这两个也不冒泡。** 共享套件只点得到它（`click` 冒泡），这条路一路绿着什么也没核——补了一份 `pagination-ellipsis-hover.spec.tsx`，直接往节点上派不冒泡的事件；改坏了验过，不装原生监听器时 `aria-expanded` 停在 `false`。

  `segmented` 是这一批唯一认表单重置的（机器的 `FORM.RESET` 只有它声明），按 React 的接法逐组件调 `useFormReset(service, rootRef)`，锚点落在根部件自己渲的那个 div 上；`form-reset.spec.tsx` 里补了一条行为用例——门禁只静态核那句调用在不在，核不到锚点有没有真落到节点上。

  四条判据链：共享一致性套件这五个组件共 75 条、服务端直出 **零豁免**、与 Vue 的逐帧对拍与标签名对拍各收下这五个套件（`parity-react` 的待铺名单同步删名）。

  尚未交付：五个组件的浏览器态用例与计算样式快照（React 侧那一整条输入还不存在）；`tabs` 的指针拖动换位只接了事件与量测口，真实拖动同样要等浏览器态；`pagination` 的 `summary` / `jumper` / `page-size-select` 三个部件有组件、共享套件的 fixture 里还没有它们的位置。

- 968f4da: **React 侧再铺六个导航与工具条组件：`menubar`、`navigation-menu`、`side-nav`、`toolbar`、`tour`、`anchor`。**

  六个里有四个带浮层或层级。`menubar` 是一排入口共用一台机器：定位锚点、被定位的浮层壳与焦点域容器都随「当前展开的是哪一张」换人，所以三份角色节点按 `value` 各记一张表，机器经 `getAnchorEl` / `getFloatingEl` / `getContentEl` 现查。Vue 侧靠 `watch` 迁移键，React 这边把登记做成按 `value` 记忆的 ref 回调——`value` 变了 React 先拿旧回调注销旧键、再拿新回调登记新键，卸载时同样注销，比自己盯着 `value` 少一条会说岔的路。退场闸门一张菜单一份：它们各开各的、动画各跑各的，一份管不过来；开合判据直接取 `connect` 这一帧产出的 `hidden`，不另起一套。

  `menubar` 的子菜单跑的是另一台 `menu` 机器（submenu 档）：菜单栏那台是单机器单锚点，装不下第二层。`XhMenubarSubTrigger` 把两家的 props 合成一份，合并序是子先父后——反过来写会让节点带上 `data-scope="menu"`，菜单栏按自己的 scope 查条目就一条都找不到。任意层级的选中都汇到根：先发根的 `select`，再 `setValue(null)` 关掉整条菜单栏（菜单栏是「当前展开哪一项」的模型，没有 `setOpen`）。

  `tour` 是模态浮层加步进：遮罩、高亮框与定位层三样一起搬到浮层落点（遮罩留在原地就会被面板甩下），收起统一押后到退场动画播完；`side-nav` 的弹出面板只在折叠态出现，定位层与面板的 `hidden` 同样跟着闸门走。`navigation-menu` 的面板就在文档流里，层只参与 Escape 仲裁与栈顶判定，不陷焦点、不锁滚动。`toolbar` 与 `anchor` 不建 scope——两者的 `connect` 都不派生配对 id。

  **不冒泡的事件这一批有九处，逐处装成了原生监听器。** `menubar` 的 root / trigger / item、`navigation-menu` 的 root / trigger、`side-nav` 的 branch-trigger / link、`toolbar` 的 root / item：`connect` 点名的 `focus` / `pointerenter` / `pointerleave` 都不冒泡，而 React 的 `onFocus` 挂的是冒泡的 `focusin`、`onPointerEnter` 是从 `pointerover` 合出来的，直接送到节点上的那一种一个都到不了。容器那一档尤其要命——`menubar` 与 `toolbar` 的根 `onFocus` 只该在容器自己得焦时把焦点转投给锚点，挂成 `focusin` 之后条目得焦也会把它叫起来，焦点当场被从条目抢回旧锚点。`onFocusOut` 不动：它经归一化落到 React 的 `onBlur`，那本就是冒泡的 `focusout`，改装反而收不到后代失焦。

  共享一致性套件核不到这一路（它走的是真实 `el.focus()`，`focusin` 会冒泡），补了一份 `navigation-native-events.spec.tsx` 按 DOM 的送达路径直接派。**九处逐处反向验证过**：把哪一处的改装拆掉，就有对应的用例判红——菜单栏与工具条的「容器得焦转投条目」「条目得焦换锚点」、导航的「指针离开整个 nav 收起面板」、侧栏的「分支入口/链接得焦换锚点」「折叠态掠过延时弹出」「延时到点前离开撤销那次弹出」。入口的 `pointerenter` 两处由共享套件自己咬住（`menubar` 与 `navigation-menu` 的套件都直接派了裸 `pointerenter`），拆掉同样判红。

  四条判据链：共享一致性套件收下这六个套件（**一条键盘豁免都没加**，与 Vue 侧同一行）、服务端直出 **零豁免**、与 Vue 的逐帧对拍与标签名对拍各收下这六个（`parity-react` 的待铺名单同步删名）。这六个都不认 `FORM.RESET`，没有表单重置这条线要接。

  尚未交付、以及目前没有判据咬得住的地方：

  - **量测口在 jsdom 里恒为空**。`anchor` 的滚动观察（`getScrollEl` / `getListEl` 交出去了，判定线与指示条量测都在机器的效应里跑）、`navigation-menu` 与 `anchor` 的指示条坐标、`tour` 的高亮框与自动滚动、`side-nav` 弹出面板与 `menubar` 浮层的定位结果——这些都要真实布局才算得出来，接线接上了，但**没有判据咬得住**，不拿 mock 假装量到了。要核只能等浏览器态。
  - 六个组件的浏览器态用例与计算样式快照都还没有（React 侧那一整条输入还不存在）。
  - `menubar` 的子菜单（`XhMenubarSub` / `XhMenubarSubTrigger`）有组件，共享套件的 fixture 里还没有它们的位置，逐帧对拍因此照不到这一段；同一段在 Vue 侧由单独的 `menubar-submenu.spec.ts` 认领，React 这边还没有对位的那一份。
  - 有几个部件接线接上了，但共享套件的 fixture 里没有它们的位置，逐帧对拍与标签名对拍照不到，只有部件接线门禁核得到：`menubar` 的 `arrow` 与 `item-description`、`navigation-menu` 的 `trigger-indicator`、`side-nav` 的 `group` / `group-label` / `positioner`、`anchor` 的 `link-text`。其中 `side-nav` 的 `positioner` 由本批新补的那份用例顺带渲出来了（折叠态弹出那两条），但它只核悬停这条路，不核定位层自己的属性。

- fb88db3: **再铺三个浮层：`drawer` / `popover` / `tooltip`；补上 `asChild`。已铺 8/126。**

  三个都照 `useOverlay` 接：`drawer` 走模态那一路，`popover` 与 `tooltip` 走非模态。四条判据链全绿，三个组件的服务端直出**零豁免**。

  **`asChild` 补齐了。** 触发器默认渲染 `<button>`，作者想用自己的按钮当触发器时只能往 `<button>` 里再套一个——那是非法嵌套，浏览器会拆开它，事件与焦点都不对。四个已铺触发器（dialog / drawer / popover / tooltip）都接上了。

  写它的时候查出一处**三家之间没人管的行为分叉**：同名事件处理器的执行顺序，Vue 侧两条路是相反的——不开 `asChild` 时部件的先跑，开了 `asChild` 时作者的先跑。这一处没有任何判据在看：`asChild` 只有 Vue 自己一份用例，不在共享套件里，逐帧对拍也覆盖不到，三家可以各写各的顺序而没人会红。React 这一侧照 Vue 对齐（适配器之间对得上是这个库的头号契约，不该单方面另立一套），两种顺序都用例钉住。**这处不一致本身建议单独裁决**：作者想在机器动作前 `preventDefault`，开 `asChild` 时拦得住、不开就拦不住，而两边看着是同一个 `onClick`。

  **全局配置此前到不了 React 的机器。** `withXhConfig` 拿 Proxy 接管 `translations` / `locale` / `size` 三个键，而 `useMachine` 里那次 `{ ...props }` 展开只带走自有键——React 的 props 只有作者真写了的那几个，与 Vue 那种「声明了就一定在」不同。作者没写 `translations` 时它不是自有键，展开就带不走，按组件名分桶的那份文案原地蒸发、组件回落到内建英文；`size` 的全局回落同理失效。Proxy 补上 `ownKeys` 与 `getOwnPropertyDescriptor` 两个陷阱之后才真正到得了。

  这一档没有任何门禁看得见——`check-config-wiring` 只核「有没有调 `withXhConfig`」，核不到「调了之后有没有被展开丢掉」。实测过 Vue 侧不受影响（它的 props 声明保证了自有键），所以这是 React 独有的坑，现在由 `tests/config-provider.spec.tsx` 四条用例守着，摘掉那两个陷阱会红两条。

  `tooltip` 的触发器与内容走原生监听器而非 React 合成事件：指针进出、按下与聚焦这几个事件 `bubbles` 为 false，而 React 的 `onXxx` 委派在根容器的冒泡阶段，收不到；Vue 与 WC 把处理器装在节点上所以照常触发。这一处只用在 `tooltip` 上，其余组件的处理器都冒泡。

  `popover` 补上了自绘滚动条接线——`check-scrollbar-hosts` 在把它登记进铺开名单后立刻点名 React 是唯一没配的一家。

- 5328f38: **React 侧再铺四个浮层组件：`hover-card`、`popconfirm`、`context-menu`、`menu`，共 44 个部件。已铺 45/126。**

  四个都走 `use-overlay` 那条接线：运行时配置、消隐层注册、进出场租约、CSS 退场探测与落点解析都在那一层，各组件只交自己的层种类与分支。三个带内部滚动的（`hover-card`、`menu`、`context-menu`）把 positioner 一并记进层分支——条子是 content 的兄弟、浮在浮层壳上，按住它拖动不记进去就会被判成层外交互，当场把浮层消解掉；`popconfirm` 没有自绘条，分支只记 trigger，与 Vue 侧同一份口径。收起一律落成内联 `display: none` 跟着退场闸门走，`content` 节点始终留在原地。

  **`popconfirm` 跑的是 `popover` 机器**：开合、定位、消解层与焦点域全在那里，确认与取消这两个意图不入机器，由 `connect` 转交。异步确认的挂起布尔住在适配器这一侧（`useState`），`connect` 只发变化意图；机器 props 每帧现搭，`closeOnEscape` / `closeOnInteractOutside` 因此是在消解那一刻现读的，而不是展开那一刻求好值冻住的。

  **`hover-card` 的名字链要靠一格状态兜住。** `title` 与 `description` 是两个可选部件，在不在场决定 `aria-labelledby` 指 title 还是指回 trigger、`aria-describedby` 发不发——而 `connect` 是在渲染期求值的，ref 落位排在提交阶段。只落 ref 不重渲的话，属性会永远停在「两个部件都不在场」那一档。这里在两个落位口里各记一格存在性状态，落位那一刻把属性重算一遍。

  **`menu` 与 `context-menu` 的子菜单**：子层再跑一台 `submenu` 模式的 `menu` 机器，触发条目由 `SubTrigger` 渲染成「父层条目 + 子层触发器」的双重身份，两份属性的合并序照 Vue 侧逐个对齐（`menu` 是父先子后，`context-menu` 反过来）。任意层级的选中都经一条上下文链汇到根：根发 `select` 再关根，各级随父关闭级联收起；父层收起时子层跟着收。`context-menu` 的 content 名字由 `translations.content` 自己给，不指触发区——触发区是作者的一整块内容且不带 role，指过去等于右键一个表格行就把整行念一遍。

  **事件到达路径**：条目与 content 上，`connect` 派的 `pointerenter` / `pointerleave` / `focus` 都不冒泡，逐处用 `useNativeEvents(props, [...])` 只摘这几个改装成原生监听器。`hover-card` 的 content 是例外的另一半：它上面那两个焦点处理器挂的是冒泡的 `focusin` / `focusout`，归一化后正好落在 React 的 `onFocus` / `onBlur` 上，只摘指针那两个。四个机器都不认 `FORM.RESET`，因此都没有 `useFormReset`。Vue 侧收 `asChild` 的四个 trigger，React 这边一并收下；`menu` 根上的 `triggerAsChild` 同样保留。

  四条判据链全绿：共享一致性套件、服务端直出（四个**零豁免**）、与 Vue 的逐帧对拍、标签名对拍。键盘表也是零豁免。

  **另补三份行为用例，每条都反向验证过（把实现改坏，看它是不是真的判红）：**

  - `tests/hover-card-name-chain.spec.tsx`——名字链与说明链的四种组合。共享套件盯着同一组属性，却因为宿主催帧时凑巧多渲了一轮而放行；这份用例只挂载一次不额外催帧，把那一格存在性状态摘掉当场判红两条。
  - `tests/menu-native-events.spec.tsx`——按 DOM 的送达路径直接派 `pointerenter` 与 `focus`，核的是「处理器装在它自己点名的那个事件上」。把两个组件的 `useNativeEvents` 摘取名单清空，五条全红。
  - `tests/popconfirm-async.spec.tsx` 与 `tests/popconfirm-dismiss-live-read.spec.tsx`——异步确认门的四种走向，以及展开态里翻消解开关。把挂起布尔写死、把两个开关提前求值冻住，各自判红。

  **目前没有判据咬得住的接线，逐条记下来：**

  - `menu` 与 `context-menu` 的子菜单整支（`Sub` / `SubTrigger`、选中链、父层收起的级联）。四条判据链用的 fixture 都是单层菜单，一条子菜单用例都没有；Vue 侧那两份子菜单专项用例这一批没有搬过来。
  - `context-menu` 的 `longPressDelay` 与触摸长按入口、`menu` 的 `openOnHover` 与安全三角。套件里没有这两路。
  - `hover-card` content 上那两个焦点处理器留在合成事件档这件事。共享套件里的焦点步骤走的是真实 `el.focus()`，两档都收得到，换成原生监听器一样全绿。

  **尚未交付的部分：** Vue 的 `XhContextMenuRoot` 另经实例暴露了一份 `openAt` / `setOpen`，专给「只交 `collection`、没有默认插槽」那条路用；React 这边只有函数式 children 那一个出口，只交 `collection` 时拿不到按坐标展开的命令。

- 9c11611: **React 侧铺上指针交互这一族八个组件：`slider`、`color-picker`、`file-upload`、`sortable`、`resizable`、`splitter`、`scroll-area`、`scrollbar`。**

  八个的共同点是「值或布局由指针拖出来」，分歧在谁量几何：`slider` 量轨道、`splitter` 与 `sortable` 与 `resizable` 量容器、`color-picker` 量取色区与两条通道轨道、两个滚动件量视口与轨道。`scroll-area` 是唯一没有自己机器的那个——按轴各建一台 `scrollbar`，视口是它们共同的滚动容器；`scrollbar` 的滚动容器则不必是自己的后代，作者给节点、给取节点的函数、或者给它的 id 三条路都收。

  `react-coverage.json` 记到 103/126。

  **`slider` 的拇指与 `splitter` 的分隔条各把一处 `focus` 改装成原生监听器。** `connect` 派的是 DOM 的 `focus`（不冒泡），React 的同名合成事件挂的是冒泡的 `focusin`：直接送到节点上的那一种到不了处理器，后代得焦又会被算成本节点得焦，两头都错。两处都只摘 `onFocus`。其余六个组件的 `connect` 一个不冒泡的事件都不派（`color-picker` 的 `onBlur` 归到 React 的 `onBlur`、挂的正是冒泡的 `focusout`，不动它；两个滚动件的 `pointerenter` / `pointerleave` 由机器自己挂在视口与挂载点上，不经 `connect`）。

  共享一致性套件咬不到这一路（它走真实 `el.focus()`，`focusin` 会冒泡，接线断了照样全绿），新加的 `tests/drag-native-events.spec.tsx` 补了两条，按 DOM 的送达路径直接派。观察口取「正被推动的是哪一个」——这两家的焦点上报只改活动下标，而活动下标唯一落到 DOM 上的地方就是拖动期间那一份 `data-dragging`。反向验过：把两处 `useNativeEvents` 的名单清空，这两条判红。

  **认表单重置的三个各接上了 `useFormReset`。** `slider`、`color-picker`、`file-upload` 的机器在根级 `on` 里声明了 `FORM.RESET`，值（滑块位置、颜色、文件清单）全攥在机器里，原生 `reset` 只还原原生控件——不接这条线，点重置什么都不会发生。锚点取根部件自己渲的那个 `div`。`tests/form-reset.spec.tsx` 补了三条行为用例（门禁对 React 只做静态串匹配，核不到那只 ref 有没有真落到根节点上）。两个方向都反向验过：拆掉三处 `useFormReset` 那三条判红；只把 `slider` 根上的 `{ ref: ctx.rootRef }` 摘掉，滑块那一条单独判红。

  **`file-upload` 的 `trigger` 收 `asChild`，与 Vue 侧对齐；另外七个组件在 Vue 侧一个部件都不收，React 这边照样不收。**

  `slider` 与 `color-picker` 的影子输入、以及 `color-picker` 的通道数值框都带 `value`，按既有口径各补了一个空的 `onChange`（React 要求带 `value` 的输入交出一个出口），不改用 `readOnly`——那一项在归一化快照的基准属性表里，改了逐帧对拍当场分叉。

  **四条判据链全绿：** 共享一致性套件这八个组件共 107 条（`color-picker` 18 / `scroll-area` 17 / `slider` 15 / `file-upload` 14 / `splitter` 14 / `scrollbar` 12 / `sortable` 9 / `resizable` 8，含各自的键盘表覆盖行），**键盘零豁免**；服务端直出**零豁免**，八个都直出得了（`color-picker` 的 `positioner` 在服务端就地渲染，不搬运）；与 Vue 的逐帧对拍与标签名对拍各收下这八个套件，`parity-react` 的待铺名单同步删掉八行。

  **几何接线大半被套件咬住了。** 套件把矩形与尺寸桩在真实节点上再喂给同一台机器，因此 `refs` 那几行不是没人管的：逐个改成恒 `null` 之后，`slider` 的 `getTrackEl`、`sortable` / `splitter` 的 `getRootEl`、`scrollbar` 的 `getScrollableEl` / `getTrackEl`、`scroll-area` 的 `getScrollableEl` / `getTrackEl` / `getRootEl` 八处都当场判红。

  **已知没有判据咬得住的几处，逐条记在案。**

  - **四处 `refs` 接线改坏了套件照样全绿**：`resizable` 的 `getRootEl`、`color-picker` 的 `getAreaEl` 与 `getChannelTrackEl`、`scrollbar` 的 `getRootEl`。前三处是因为套件没有对应的指针路径（`color-picker` 的取色区与两条滑杆只跑了键盘），最后一处是因为「指针进出滚动条本身」这一路套件只派在滚动容器上。逐个实测确认，当前只有代码在保证。
  - **共享套件的 fixture 里不出现的部件，只有 `check-part-wiring` 的「源码里引到了那个 getter」在核，行为一条都没跑过，共 5 个**：`slider` 的 `value-text` / `tick-group` / `tick` / `tick-label`，`scrollbar` 的 `corner`。其中刻度那三个连带着「点刻度文案把最近的滑块跳到这一档」这条语义，整条只有类型与门禁兜着；`XhSliderTickGroup` 逐档铺圆点与文案的顺序（一档一对、圆点在前）同样没有判据。
  - **`XhSliderTickGroup` 的 `tick` 接管口没有判据。** `check-slot-types` 只核「标了 `SlotChildren` 就得经 `renderSlot` 取值」，套件的 fixture 不传这个函数，载荷里那一档刻度的呈现数据一次都没被读过。
  - **`XhFileUploadItem` 的 `file` 入参没跑过。** 一致性 fixture 是静态结构树，属性值只能是字符串、传不了 `File` 对象，套件因此只走 `index` 那条路；按引用直接指定文件的那一支只有类型兜着。`XhFileUploadTrigger` 的 `asChild` 同理——`as-child.spec.tsx` 只演了 `dialog` 那一个。
  - **`XhScrollbarRoot` 的 `scrollable` 入参没跑过。** 套件按 `controls` 当 id 去查容器，`resolveScrollable` 里「作者直接给节点」与「给取节点的函数」两支一次都没走到。
  - **jsdom 没有布局，真实的拖拽与量测都是桩出来的。** 轨道矩形、项的中心、视口与内容的高度、滚动量的夹取，全是套件在真实节点上按需摆的常数；自动滚动（`sortable` 的 `autoScroll`）、触摸手势被系统收走（`pointercancel`）、以及 `scrollbar` 的 `MutationObserver` 重量这三条一条都没跑到。真实排版下的行为只能在真机上看。
  - **`color-picker` 浮层的退场闸门在 jsdom 里只走「没有动画」那一支。** 收起后 `content` 仍留在 DOM 上、只是拿到内联 `display: none`，这一层由逐帧对拍咬着；而「退场动画播完之前保持可见」那条真正的闸门要量 `animationName`，jsdom 量不到。它的 `positioner` 上那套自绘滚动条（`useScrollbars`）也只有 `check-scrollbar-hosts` 的「有没有接这条线」在核，条子画在哪儿、量不量得对都在判据之外。
  - **播报区的文本不进判据**：归一化快照只收属性、文档序、焦点与事件，不收文本。`sortable` 的 `live-region` 在不在场由对拍咬着，里面写了什么没有。
  - React 侧还没有浏览器态用例与计算样式快照这条输入，八个组件的皮肤、滑块与拇指的定位样式、滚动条的显隐过渡一律不在判据内。

- bb04845: **React 侧补上浮层落点；把写死两个适配器的门禁改成认三家。**

  `XhPortal` 把内容搬到浮层落点，服务端与客户端首帧就地渲染、搬迁推迟到挂载后的效应。这不是取巧：`react-dom/server` 根本不支持 `createPortal`，而首屏即展开的浮层必须直出展开态——正文既要能被索引也要能被读屏念到，渲成空占位等于把这一屏丢了。推迟一拍同时解掉水合失配：服务端标记与客户端首帧一致，水合零报错，效应跑完内容才进浮层。三条用例分别验直出、搬迁与水合，水合那条反向验证过（把落点解析挪回首帧就红）。

  **门禁那一半是这一批更要紧的事。** 105 张结构检查里有 22 张把两个适配器写成路径常量，React 目录不在常量里，循环压根不进入——判据对 React 的默认反应不是判红，是**看不见**，收尾还照常打印「两侧都接上了」。现在逐张定性并改写：13 张扩到三家、7 张显式声明「React 不在其列」并写清为什么、1 张本来就按目录枚举、1 张（文档数字）暂无 React 条目可登记。

  扩到三家的那 13 张有一个共同前提：**铺开进度只有一处真源**。`tooling/scripts/react-coverage.json` 说 React 铺到了哪些组件，门禁按它决定该核谁，没铺到的跳过并在收尾行报出「React 已铺 N/126」。`check-react-coverage` 做两侧反查——登记了没铺的判红，铺了没登记的也判红，后者是静默漏检，比前者严重。判据取「主入口导出了根组件」而不是「目录存在」：`components/field/` 只放了接线口子、还没有 `XhField*`，按目录判会把它误算成已铺。

  `check-form-reset` 不是扩，是重写：Vue 与 WC 在 `useMachine` / controller 里统一挂桥，React 是逐组件挂的，原来那种「查这句字符串在不在」的判据对 React 只能证明有人写过、证不明每个认重置的组件都挂了。现在按 `declaresFormReset` 反查已铺组件有没有调 `useFormReset()`。`check-keyboard-suites` 顺手收紧一档：原来「import 过这个套件 id」就算登记，三家一起变严后 Vue 86 / WC 86 仍全绿。

  新增组件的落点清单里补了三条 React 条目（组件、hook、铺开登记），标成人工落而非脚手架生成并写明理由——一律生成会让每个新组件都被迫同时交 React 版，那是 React 完备之后才想要的。

- b6bf1c2: **73 个组件的 Root 现在接住透传属性，逐实例令牌覆盖在 React 上终于写得出来。**

  Vue 侧的根部件吃 fallthrough attrs：作者写 `<XhAlertRoot style="--xh-alert-border: transparent">`，这个 `style` 自己就落到 root 元素上。而 React 侧 107 个 Root 里有 79 个的 props 是封闭列表，同样的写法 TypeScript 直接报 `Property 'style' does not exist`——三级覆盖通道里最里面那一级（写在元素上的内联令牌）React 用户根本用不了。文档站 966 份 Vue 示例里有 90 份在 Root 上写了 `style` / `class`，多数正是设 `--xh-*` 令牌，它们的 React 版此前写不出来。

  判据是「渲染了自己 DOM 元素的 Root 就接住其余属性」。改完 101 个 Root 收 rest；剩下 6 个（`command` / `dialog` / `image-viewer` / `menu` / `popover` / `tooltip`）不改，因为它们的解剖里没有 root 部件、Root 只提供上下文与子树，作者的属性没有元素可落。

  schema props 一律显式解构，绝不漏进 DOM。与 DOM 同名异型的（`dir` 改的是方向键语义、`defaultValue` 的类型更宽、`onSelect` 与合成事件同名）逐个从继承里 `Omit` 掉并写明理由。

  **一处口径顺带对齐了 Vue**：这些 Root 现在交给机器的是一份「键恒在、没给即 `undefined`」的对象，而不是只含作者写过的键的 rest 包。`fillXhConfigDefaults` 的判据正是「键在不在」，所以 `XhConfigProvider` 的全局 `size` / `locale` 从此在这些组件上真的垫得进去了。

  计算样式基线与 Vue 侧仍逐字节全等，逐帧对拍不动。

- e5105e9: **React 侧再铺三个组件：`select`、`field`、`form`。已铺 5/126。**

  这三个各代表一类接线。`select` 是浮层加定位引擎加集合导航那一类——第一次把 `createPositionEngine` 接进来，三个 refs（锚点、浮层、内容）与消隐层的分支判定（触发器算层内交互）一并接上，20 个部件。`field` 与 `form` 是字段与表单桥那一类，把原先只有接线口子的 `components/field/` 补全，字段的说明、校验状态与标签名字链从此真的有上下文可取。

  浮层的共用接线跟着定形：`useOverlay` 现在只管运行时配置、消隐层注册、进出场租约、CSS 退场探测与落点解析，各家自己要交的 refs 经一个口子传进去。模态（`dialog`）与非模态（`select`）两种形态共用同一份，剩下 16 个浮层组件照它接即可。

  四条判据链：共享一致性套件 105 条、服务端直出（`select` / `field` / `form` 三个**零豁免**）、与 Vue 的逐帧对拍 62 条、标签名对拍 5 条。

  **fixture 的布尔属性此前在 React 侧是失效的。** 套件的 `attrs` 是 DOM 属性口径，`disabled: ''` 是「这个布尔属性在场」的 DOM 写法；Vue 的 Boolean prop 声明会把它折成 `true`，React 收到的却是空串——空串是假值，禁用状态于是静默失效，方向键跳过禁用条目那条用例因此判红。现在 React 的 fixture 渲染器按 DOM 语义折算：不带连字符的键遇到空串折成 `true`，带连字符的是 `data-*` / `aria-*` 这类真属性、空串对它们有意义，原样传。

  **逐帧对拍里 `activeElement` 是会抖的。** 移焦由提交后的回调放下去，各家排这一步的时机不同（React 在离散事件末尾同步跑完，Vue 排在 `nextTick` 链上），而两侧的 tick 都盯 DOM 变动、看不见移焦——同一帧里可能一个已经移完、另一个还在半路。实测同一份代码连跑五轮红一轮：这是随机器负载摆动的假红，比稳定判红更糟，它教人重跑而不是排查。`runParity` 因此加一个显式的 `ignore` 开关，vue×react 这一对声明不比 `activeElement` 并写清理由。焦点本身不放过——各自的一致性套件用 `settle` 等着断言，那一侧是确定的。

  期间试过另一条路：给两侧的 `flush` 各加一轮宏任务让焦点落定。结果更差（红的用例从 1 条涨到 5 ～ 7 条且仍在抖），已退掉。

  `check-form-reset` 在这一批咬到一个真缺陷：`select` 认表单重置，桥却没接——点重置什么都不会发生，页面上不报任何错。`check-dir-exposed` 与此前的 `check-backdrop-variant` 同因判红一次：解析只认「逐个键解构」这一种接线，不认「整份 props 透传」（后者更严，一个键都漏不掉），已教会。

- 4b8fdbc: **React 适配器补上 `@xihan-ui/react/sound` 子入口。** 此前 Vue 有 `.` / `./backgrounds` / `./behavior` / `./sound` 四个子入口，React 只有 `.` 与 `./behavior`——声音层在 React 侧根本接不进来。

  服务那一层与 Vue 完全同名同形：`getSoundPlayer` / `setSoundPlayer` 管共享播放器，`withToastSound` / `withDialogSound` 包一层现成的命令式服务，入队即发声、调用点一行不改，默认映射（`loading` 不发声、`confirm` 发 `open`、`update` 只在改了类型时响）与逐项改写、`autoUnlock` 的口径逐条对齐。

  给单个元素配声的那一份换了介质：指令是 Vue 才有的，React 侧是 `useSoundOnPress`，返回一个挂到元素 `ref` 上的回调。传进去的值每次渲染现读，换语义名、换音量、换播放器都不解绑重绑；回调本身常驻，重渲染不会反复解绑。它按 React 19 的约定返回清理函数，因此与组件自己转发的 ref 合成之后照样能解绑——那条路上 `ref(null)` 不再被调用，只靠返回值这一条通道。

  `@xihan-ui/sound` 是可选 peer，不装它主入口一行都不引。

- d18d6a5: **React 侧铺上收尾这一批八个组件：`tag-group`、`button-group`、`icon`、`icon-wrapper`、`gradient-text`、`highlight`、`marquee`、`number-animation`。**

  八个里只有 `tag-group` 与 `number-animation` 跑机器，其余六个的属性全部由 `connect` 从 props 算出：`button-group` 与 `icon-wrapper` 只把三个视觉轴摊到根上，`gradient-text` 与 `marquee` 另把两端颜色、每秒像素写成根上的内联变量（`reactNormalize` 把这两处的 style 串解析成 React 的对象），`highlight` 按关键词把整段文本切成 `<mark>` 与纯文本两种片段，`icon` 把图元记录逐层建成 SVG 元素。

  `react-coverage.json` 记到 122/126，`parity-react` 的待铺名单只剩 `heatmap` / `masonry` / `timer` / `timestamp` 四行。

  **`tag-group` 的两处不冒泡事件都改装成了原生监听器。** `list` 自身得焦时把焦点转投给锚点标签，`item` 自身得焦时改记锚点——两处 `connect` 点名的都是 DOM 的 `focus`，而 React 的 `onFocus` 挂的是冒泡的 `focusin`：不改装的话，`item` 得焦会一路把 `list` 的转投也叫起来，摘除钮得焦又会被算成标签得焦。`onFocusOut` 照旧走合成事件，没动它。共享套件走的是真实 `el.focus()`（`focusin` 会冒泡），核不到这条送达路径，新在 `tests/collection-native-events.spec.tsx` 里按 DOM 语义直接派 `focus`，两条。反向验过：分别把两处 `useNativeEvents` 的名单清空，各判红一条。

  **`tag-group` 的标签卸载要在 DOM 摘除之前上报失焦。** 写在 `useIsomorphicLayoutEffect` 的清理里，判据是「本节点当下正持有焦点」；另有一条 value 变更时重报锚点。共享套件的 fixture 是一棵固定的树，不会在中途摘掉持有焦点的节点，这两路新在 `tests/collection-focus-report.spec.tsx` 里认领。反向验过：换成 `useEffect` 那一条判红（`check-focus-report` 同时判红），把 `ITEM.FOCUS` 那一句挖空另一条判红。

  **这八个都不认表单重置**（机器里没有 `FORM.RESET` 声明，也没有一个带 `name`），**Vue 侧没有任何一个部件收 `asChild`**，React 这边照样不收；没有一个组件带影子输入。

  **全局配置的接线按 headless 的声明走，与 Vue 逐个对齐。** `tag-group`（有 `translations`）、`button-group`、`icon-wrapper`、`icon` 走 `withXhConfig`；`number-animation` 的 `size` 由 `useMachine` 那一处并进来；`gradient-text` / `highlight` / `marquee` 三个既没声明 `size` 也没有 `translations`，与 Vue 一样不接。这一条只有 `check-config-wiring` 这张静态门禁在核，没有行为判据。

  **新增三份用例文件，两处补进既有文件，逐条反向验过。**

  - `tests/button-group-disabled.spec.tsx`：整组禁用要落到组内每一段的原生 `disabled` 上，只打 `data-disabled` 的话按钮照样点得动。共享套件的 fixture 里每一段是裸 `<button>`、不经过 `XhButton`，这条路它核不到。顺带把段间装饰线的标签、`aria-hidden` 与「朝向与整组相反」一并咬住。反向验过：把 `ButtonGroupDisabledProvider` 的值换成 `undefined` 即判红。
  - `tests/icon-nested-glyph.spec.tsx`：`defs` / `clipPath` / `clipPathUnits` 这类驼峰名字在 HTML 命名空间下会被小写化，小写之后 `clipPath` 不再是裁剪路径、整个图标空白。共享套件核到了连字符（`fill-rule`）与一层嵌套，核不到大小写这一路。反向验过：`renderNode` 里把标签名 `toLowerCase()` 即判红。
  - `tests/marquee-auto-fill.spec.tsx`：轨道里铺几份、第二份是不是同时标了 `aria-hidden` 与 `inert`、什么才算「真有内容可铺」。壳不是部件，归一化快照只采 `[data-part]` 的节点，套件看不见它。反向验过：把 `slotPaints(children)` 换成 `children != null`，「条件渲染落空」与「纯空白文本」两条判红。
  - `tests/shorthand-children.spec.tsx` 补 `XhNumberAnimation` 三条：不给 children 时根里是格式化好的那串字、函数式 children 拿得到 `{ value, text }`、children 落空时退回那串字。反向验过：把 `slotPaints(content) ? content : api.text` 换成 `content ?? api.text`，第三条判红。

  **四条判据链全绿。** 共享一致性套件这八个组件共 63 条（`tag-group` 14 / `number-animation` 10 / `icon` 9 / `highlight` 9 / `marquee` 7 / `gradient-text` 6 / `button-group` 4 / `icon-wrapper` 4），`tag-group` 的七行键盘表全部认领，**键盘零豁免**；服务端直出**零豁免**，八个都直出得了；与 Vue 的逐帧对拍与标签名对拍各收下这八个套件。React 适配器 38 个文件 2180 条、逐帧与标签名对拍 1603 条全绿。

  **已知没有判据咬得住的几处，逐条记在案。**

  - **`tag-group` 的函数式 children 与 `collection` 铺开这两条路都没有判据。** 共享套件的 fixture 总是把部件一个不落地写全，`renderSlot` 的载荷（`isSelected` / `setValue` / `select` / `toggle` / `deleteItem` 这几个命令）与 `DefaultTree` 的结构一次都没走到。与已铺的 `listbox` / `toggle-group` 同一处空白，当前只有代码在保证。
  - **`number-animation` 的 `onComplete` 没有判据。** 两个宿主的测试 harness 都没有把 `complete` 登记进对外事件表，套件因此收不到它；跑到终点这件事本身由 `data-state` 落回 `idle` 与终点文本咬着，「回调被调了没有、带的载荷对不对」则没人核。
  - **`button-group` 的 `fullWidth` 没有判据。** 套件的四条只核 `role` / 排布 / 三轴 / 角色节点数，`data-full-width` 不在其中；它只是一路透传进 `connect`，改坏了不会有任何一条判红。

- 5328f38: **React 侧再铺七个文本输入组件：`text-field`、`number-field`、`password-input`、`pin-input`、`editable`、`input-group`、`tags-input`。已铺 41/126。**

  这一批是表单接线最重的一族：七个里六个的机器认 `FORM.RESET`，各自在 `use-*.ts` 里调 `useFormReset(service, rootRef)`，锚点接在根部件自己渲的那个 `div` 上。四个是单一可聚焦控件（`text-field`、`number-field`、`password-input`、`tags-input`），输入框上各接了 `useFieldStateWiring()` 与 `useFieldLabelWiring()`——说明、校验状态与字段标签都得落到真控件上，停在封装根的 `div` 上读屏一个字都念不到。`pin-input`（每格一个 input）与 `editable`（预览态与编辑态是两个焦点目标）按既有登记不在这条之列。

  `input-group` 是这批唯一没有机器的：`connect` 直接吃 props，`size` 经 `withXhConfig` 拿全局配置，上下文接口按无机器组件的惯例定义在 `context.ts` 里。带 `translations` 的四个（`text-field`、`password-input`、`pin-input`、`tags-input`）同样逐个调了 `withXhConfig`——`useMachine` 只并 `locale` 与 `size`，按组件名分桶的文案到不了它。

  **三处事件到达路径改装成原生监听器。** `number-field` 的加减钮：`pointerleave` 是「按住连发」的三条收尾出口之一，而 React 的 `onPointerLeave` 是从 `pointerout` 模拟出来的，收不到直接派到节点上的 `pointerleave`——不改装，手已经移出去数字还在涨。`pin-input` 的每一格与 `editable` 的预览区：`connect` 挂的 `onFocus` 是不冒泡的 DOM `focus`，按已定死的口径改装。其余处理器（含 `onBlur`、`onPointerDown`、`onPaste`、`onDblclick`）留在 React 合成事件那一档：它们挂的都是冒泡事件，`onBlur` 走的 `focusout` 在这几个叶子节点上与 `blur` 等价。

  两处影子输入（`pin-input` 与 `tags-input` 的 `hidden-input`）带 `value` 却没有变更出口，各补一个空的 `onChange`：React 的开发构建会为「带 value 没有出口」逐帧告警。真正的输入框不必补——它们带着 `connect` 挂的 `onInput`，React 认这一个。

  `text-field` 的 `input` 部件收 `as`，写 `textarea` 即多行宿主；程序化写值不触发 `input` 事件，自动高度在渲染后由一个效应补量一次。`tags-input` 的标签在 `value` 变更或节点离场时上报 `ITEM.FOCUS_LOST`，用的是 layout effect——节点从文档里摘掉之前它的清理就跑完了，此刻焦点还在里面。Vue 侧这七个没有一个部件收 `asChild`，React 这边同样不收。

  四条判据链全绿：共享一致性套件、服务端直出（七个**零豁免**）、与 Vue 的逐帧对拍、标签名对拍。`tests/form-reset.spec.tsx` 另补六条行为用例逐个核锚点——门禁对 React 只做静态串匹配，核不到 `ref` 究竟落在哪个节点上；把六处 `useFormReset` 逐个注释掉、把 `text-field` 根上的 `ref` 摘掉，七次反向验证都判红。

  **目前没有判据咬得住的接线，逐条记下来：**

  - `pin-input` 每格与 `editable` 预览区的 `onFocus` 改装。套件用的是真实的 `el.focus()`，它同时派 `focus` 与 `focusin`，React 的合成 `onFocus` 照样收得到——把 `['onFocus']` 换成别的名字，一致性套件与逐帧对拍全绿。判红要一次直接派到节点上的、不冒泡的 `focus`，套件里没有这一路。`number-field` 的 `pointerleave` 有判据（「按住后指针移出」那条），换掉当场红。
  - `text-field` 的 `as="textarea"` 与自动高度。套件的 fixture 只写单行 `input`，多行宿主那一路（`data-multiline`、`rows`、量高效应）一条用例都没有。
  - `tags-input` 的 `ITEM.FOCUS_LOST` 上报。套件里没有「标签带着焦点离场」的用例。
  - 两处影子输入的空 `onChange`。它挡的是 React 开发构建的控制台告警，不落 DOM、也不改行为。

- 711dd9e: **React 适配器的组件层地基与第一个组件；共享一致性套件跑通了。**

  这一批要回答的只有一个问题：`tooling/testing` 那套跨适配器的一致性套件——全仓最贵的一项资产——能不能原样套到第三个适配器上。答案是能，套件本身一个字没改。

  `switch` 走通了四条判据链：共享一致性套件（6 条）、服务端直出（5 条，豁免表为空）、与 Vue 的逐帧对拍（5 条）、原生表单重置（2 条）。每一条都做过反向验证：摘掉 `onCheckedChange` 一致性套件红两条，摘掉表单重置桥红两条，把 thumb 的 `<span>` 写成 `<div>` 标签对拍红一条。

  **逐帧对拍另开一份 vue×react，不塞进现有那次调用。** 现有 vue×wc 的 30 条排除九成是「Light DOM 作者手写部件」造成的，与 React 无关；塞进同一次会把最该比的那一对连坐掉——`switch` 本身就在那 30 条里（理由是「WC 侧 thumb 由作者手写」）。新那份没有 EXCLUDED 只有 PENDING：两家都是「组件自己渲染部件、prop 被消费不落 DOM」的同一类模型，理论上每个组件都该对得上，对不上就是缺陷。名单 125 条，只随铺开进度缩短，配一条覆盖等式盯着它。

  **另补一份标签名对拍。** `runParity` 比不到标签名——`DomSnapshot` 只记 `data-part`、属性、文档序、焦点与事件。两家都自己渲染部件，标签是这一层自己定的，选错既不改属性也不改顺序：`<span>` 写成 `<div>` 让内联部件变成块级，原生语义（`<button>` / `<label>` / `<input>`）写错则读屏与表单行为整个不同，而逐帧对拍全绿。这一处此前没有任何判据，不只是 React 的缺口。

  组件层地基：`mergeReactProps`（在 core 那份之上补 ref 合并——React 19 把 ref 当普通 prop，直接后盖前会让先接的一方收不到节点）、函数式 children 的解析与「作者到底给没给内容」的判定、`useReactScope`（scope id 在构造时冻住，落进渲染体会让 `aria-controls` 每帧改指向）、`XhConfigProvider` 全局配置面（嵌套按键合并，只写 translations 不会抹掉外层的 locale）、表单重置桥、字段接线的两个口子。

  `useMachine` 一并接上全局配置合流与锁步版本检查——这是运行期唯一的混装版本信号，Vue 挂在 `use-machine.ts`、WC 挂在 `define.ts`，React 不补第三个调用点就静默退出这道保护。

  **尚未交付**：另外 125 个组件、命令式服务、浮层 portal、`as-child`。写死两个适配器路径的 22 张门禁仍未三态化，它们对 React 的默认反应是看不见、不是判红——包括 `check-form-reset`，这一批的表单重置桥是靠新写的用例守住的，不是靠门禁。

- 9c11611: **React 侧铺上四个组件：`json-viewer`、`log`、`mention`、`question-flow`。**

  四个各占一类接线：`json-viewer` 的行是按数据摊出来的，作者只写根，整棵树由组件自己铺；`log` 只有一台管粘底的机器，行数、载入态与文案是纯视图属性走 `connect` 的第二参；`mention` 是「正文输入框 + 候选浮层」，照 `combobox` 那一路接（`useOverlay` 管运行时配置、消隐层、进出场租约与落点解析，`useScrollbars` 给候选列表配自绘条）；`question-flow` 是十八个部件的分步问答，机器另有一条量测口通到轨道节点。

  `react-coverage.json` 记到 107/126，`parity-react` 的待铺名单同步删掉四行。

  **`json-viewer` 的三处 `focus` 改装成原生监听器。** `connect` 在 `tree`、`item`、`branch` 三个部件上派的都是 DOM 的 `focus`（不冒泡）：容器那一路只该在容器自己得焦时把焦点转投给锚点行，而 React 的同名合成事件挂的是冒泡的 `focusin`，行得焦也会把它叫起来、当场把焦点抢回锚点；行那两路则收不到直接派到节点上的事件，锚点与 roving tabindex 于是永远停在原处。三处都只摘 `onFocus`——`tree` 上还有一个 `onFocusOut`，它经归一化落到 React 的 `onBlur`、挂的正是冒泡的 `focusout`，动它反而把语义改坏。

  行是组件自己铺的，而 hook 不能在循环里调，所以每一行各是一个内部组件（`JsonItem` / `JsonBranch`），`useNativeEvents` 一行一份。

  共享一致性套件咬不到这一路（它走真实 `el.focus()`，`focusin` 会冒泡，接线断了照样全绿），`collection-native-events.spec.tsx` 补了两条，按 DOM 的送达路径直接派。反向验过：把三处 `useNativeEvents` 的名单从 `onFocus` 换成别的事件名，这两条当场判红。

  **`mention` 认表单重置。** 整段正文攥在机器里，原生 `reset` 只还原原生控件——不接 `useFormReset(service, rootRef)`，点重置什么都不会发生，而同表单的原生控件已经还原。锚点是根部件自己渲的那个 `div`。`form-reset.spec.tsx` 补了一条行为用例（门禁对 React 只做静态串匹配，核不到那只 ref 有没有真落到根节点上），反向验过：注释掉那句 hook，用例判红。

  **两档滚动层共用一只「忽略空值」的 ref。** `json-viewer` 的树档与原文档互斥，同一个位置换档时 React 先摘旧节点的 ref（传 null）再装新的；自绘条的取值口若照单全收，中间会空出一拍找不到容器。这只 ref 只记在场的那个，空调用不往下传。

  **几处刻意与既有口径对齐的写法。** 四个组件在 Vue 侧一个部件都不收 `asChild`，React 这边照样不收。`mention` 的 `textarea` 与 `question-flow` 的 `note` 都带 `value` 与 `onInput`、没有 `onChange`——React 对受控输入的告警把 `onInput` 也算作出口，因此照 `text-field` 的既有写法不另补空 `onChange`，更不改用 `readOnly`（那一项在归一化快照的基准属性表里，改了逐帧对拍当场分叉）。`json-viewer` 的机器不派任何 id，因此不建 scope。

  四条判据链全绿：共享一致性套件这四个组件共 56 条（`json-viewer` 17 / `mention` 15 / `question-flow` 13 / `log` 11，含各自的键盘表覆盖行），**键盘零豁免**；服务端直出**零豁免**，四个都直出得了；与 Vue 的逐帧对拍与标签名对拍各收下这四个套件。

  **已知没有判据咬得住的几处，逐条记在案。都是实测的——把那一处改坏，四条判据链照样全绿。**

  - **`json-viewer` 的原文档（`view: 'text'`）整档没有判据。** 共享套件一个用例都没给 `view: 'text'`，`text` 部件因此一次也没渲过，逐帧对拍与标签名对拍同样碰不到它。实测：把那个分支的判据换成一个永远不成立的值，让原文档档位彻底走不到，一致性、服务端直出、两份对拍全绿。这一档的 `pre` 节点、`getTextProps` 与 `api.text` 当前只有 `check-part-wiring` 的「源码里引到了那个 getter」在核。
  - **`question-flow` 的量测口没有判据。** jsdom 没有布局，轨道与题目的几何恒为零，视口高度与轨道位移那两个私有槽算不出东西来。实测：把 `getTrackEl` 直接返回 `null`，一致性、服务端直出、两份对拍全绿。那一行 `refs.set` 当前只有代码在保证。
  - **`log` 的句柄重绑（`retarget`）没有判据。** 视口或内容节点被换掉之后让粘底句柄重新绑一遍，这一步要真实的节点更替加滚动几何才看得出来。实测：把那句调用整个去掉，一致性与对拍全绿。同一处的 `getViewportEl` 反倒是被咬住的——套件用伪造几何驱动粘底，把它改成返回 `null`，「用户上滚」与「离底后按钮露头」两条当场判红。
  - **`mention` 的退场闸门没有判据。** 收起时 `content` 留在 DOM 上、只拿到内联 `display: none`，而归一化快照只收属性、文档序、焦点与事件，不收内联样式。实测：把那一格换成恒不写 `style`，一致性与对拍全绿。「退场动画播完之前保持可见」那条真正的闸门要量 `animationName`，jsdom 量不到。
  - **自绘条只被咬住了「在不在场」这一层。** 标签名对拍收的是整棵子树里每一个 `[data-part]`、不按 scope 过滤，所以条子的节点漏了会判红（实测：去掉 `json-viewer` 那句 `bars.render()`，标签名对拍当场判红）；但条子量没量到尺寸、让不让交叉口、滑块摆在哪，一律要布局才看得出来，jsdom 里全是空的。
  - **共享套件的 fixture 里不出现的部件，只有 `check-part-wiring` 在核，行为一条都没跑过，共 3 个**：`mention` 的 `label`、`empty`、`loading`。其中 `empty` 与 `loading` 那两格「同一个位置、两者不同屏」的互斥关系整条没有判据。
  - **`mention` 按 `collection` 自动铺开的那套结构没有一致性判据。** 套件的 fixture 是手写部件那一路；自动铺开只在新补的那条表单重置用例里渲过一次，「与手写部件产出的 DOM 完全一致」这句话当前没有判据兜着。
  - **插槽载荷一律没有被读过。** 套件的 fixture 传的是静态节点，不是函数：`json-viewer` 的空态文案兜底（`empty ?? api.emptyText`）、`log` 与 `question-flow` 的根载荷、`question-flow` 逐项的 `{ questionId, value, selected }`，都只有 `check-slot-types` 在核类型形态，值一次都没被消费过。
  - React 侧还没有浏览器态用例与计算样式快照这条输入，四个组件的皮肤、候选浮层的落位、日志的粘底滚动一律不在判据内——这些只能在真机上看。

- d18d6a5: **React 侧铺上「钉在视口上」与「装在组件之外」这一族七个组件：`affix`、`back-top`、`float-button`、`floating-panel`、`download-trigger`、`clipboard`、`hotkeys`。**

  七个的共同点是接线越出组件自己那棵子树：`affix` 与 `back-top` 盯的是滚动容器的滚动量，`float-button` 与 `floating-panel` 钉在视口坐标上（后者还搬去浮层落点），`hotkeys` 把 keydown 装在整篇文档上，`download-trigger` 与 `clipboard` 则把内容交给浏览器的下载与剪贴板。分歧在谁管几何：`affix` 量占位盒的矩形并冻结它的高度，`back-top` 只读滚动量，`floating-panel` 自己算整块矩形写进内联样式。`float-button` 是唯一没有自己机器的那个——开合跑的是 `collapsible`，落位、外形与展开方式不入机器，直接进 `connect`。

  `react-coverage.json` 记到 114/126。

  **`float-button` 的定位壳与 `clipboard` 的只读框各把不冒泡的事件改装成原生监听器。** 前者是悬停展开的 `pointerenter` / `pointerleave`（React 的同名合成事件是从 `pointerover` / `pointerout` 合出来的），后者是聚焦即全选的 `focus`（React 的 `onFocus` 挂的是冒泡的 `focusin`）。两处都只摘点名的那几个，`onKeydown` 与 `onClick` 照旧走合成事件。另外五个组件的 `connect` 一个不冒泡的事件都不派。

  - `float-button` 那一路由共享套件自己咬住：它的悬停用例本就直接往壳上派 `pointerenter` / `pointerleave`。反向验过：把 `bind.attrs` / `bind.ref` 换回裸的 `getRootProps()`，「悬停展开」当场判红。
  - `clipboard` 那一路共享套件咬不到（fixture 里没有聚焦只读框这一步），新加 `tests/clipboard-native-events.spec.tsx` 按 DOM 的送达路径直接派 `focus`，观察口取选区。反向验过：把 `useNativeEvents` 的名单清空即判红。先把选区收成一个光标再断言——jsdom 里 `value` 一落地选区本来就是「整段选中」，不这么摆这条用例恒绿。

  **`hotkeys` 的监听装在组件之外，卸载必须自己摘。** 组合式每次提交后对齐一次落点（`document` / `parent` / 作者给的节点），落点没换就不动；卸载在一个只跑一次的 `useEffect` 清理里摘干净。共享套件只在挂载态里按键，卸载之后那一段没有判据，新加 `tests/hotkeys-listener.spec.tsx` 认领：观察口取 `defaultPrevented` 与回调次数。反向验过：把卸载清理换成空函数，第二条判红——组件早已不在页面上，Ctrl+S 仍被它接走。

  **这七个组件都不认表单重置**（机器里没有 `FORM.RESET` 声明），**Vue 侧也没有任何一个部件收 `asChild`**，React 这边照样不收。`clipboard` 的只读框带 `value`，按既有口径补了一个空的 `onChange`（React 要求带 `value` 的输入交出一个出口），没有改用 `readOnly` —— 那一项由 `connect` 自己写，也在归一化快照的基准属性表里。

  **`floating-panel` 的形态钮走部件属性转驼峰这一路。** fixture 写的是 DOM 口径的 `window-state`，`tests/fixture-element.ts` 把它转成 `windowState` 再交给组件，组件那一侧的 prop 名就得是驼峰的那个。反向验过：改成从 `rest['window-state']` 上读，初始快照与形态切换两条当场判红。改尺把手的 `edge` 不带连字符，两侧同名。

  **四条判据链全绿：** 共享一致性套件这七个组件共 47 条（`floating-panel` 10 / `float-button` 8 / `back-top` 7 / `affix` 6 / `hotkeys` 6 / `clipboard` 5 / `download-trigger` 5，另各有一条键盘表覆盖），**键盘零豁免**；服务端直出**零豁免**，七个都直出得了（`floating-panel` 的 `positioner` 在服务端就地渲染，不搬运）；与 Vue 的逐帧对拍与标签名对拍各收下这七个套件，`parity-react` 的待铺名单同步删掉七行，还剩十二行。

  **顺带修掉 React 宿主冲刷的一处时间语义。** `tests/harness.ts` 的 `tick()` 原先每一拍交给 `act` 的是异步回调，那条路 `act` 恒要让出一个宏任务；`download-trigger` 的「取数失败」用例把拒绝推到 `setTimeout(0)` 上，指望冲刷期间状态稳定停在 `preparing`，于是两者赛跑——单独跑那一个组件时冷启动下实测约一半判红，整文件跑因为 JIT 已经热了才一直是绿的。改成同步回调后 `act` 只在自己队列里真有活时才让出宏任务，机器的更新本就由 `flushSync` 同步提交；冲刷于是只把框架排空、不把时间往前推，与 Vue 那侧的 `nextTick` 是同一个意思。改完整份一致性套件 1532 条、逐帧对拍与标签名对拍 1532 条、React 适配器 35 个文件 2069 条全绿，`download-trigger` 单跑连续五次稳定。

  **已知没有判据咬得住的几处，逐条记在案。**

  - **三处滚动容器接线改坏了套件照样全绿**：`back-top` 与 `affix` 的 `getTargetEl`（两个套件都只跑整页滚动那一路，`target` 一次都没传过），以及 `floating-panel` 的 `getContentEl`（它只在指针拖动的副作用里被读，而套件的搬动与改尺全走键盘）。三处逐个实测确认，当前只有代码在保证。`affix` 的 `getRootEl` 不在此列——判定线与占位高度都量它，改成恒 `null` 有四条当场判红。
  - **`floating-panel` 的浮层落点没有判据。** 测试宿主刻意插在 portal 落点之前，于是「搬去落点」与「留在原地」两种渲染的文档序完全一样：把 `XhPortal` 换成片段之后，一致性套件与逐帧对拍都还是全绿。真正要它的理由（逃开祖先的层叠上下文）在 jsdom 里没有可观察面。
  - **`floating-panel` 的退场闸门同样没有判据。** 收起时 `positioner` 由 `connect` 打上 `hidden`，这一条由套件咬着；而适配器额外压上的内联 `display: none`（以及「退场动画播完之前保持可见」这条真正的闸门）落在 `style` 上，归一化快照不收 style，jsdom 也量不到 `animationName`——把那一整段换成空对象照样全绿。
  - **`hotkeys` 挂载后实测平台这一步没有判据。** jsdom 的 `navigator.platform` 不是 Mac，实测值与「还没测出来」时的回落值同为 `other`，把 `detectHotkeysPlatform()` 换成恒 `'auto'` 套件全绿。Mac 上 `Mod` 该落到 ⌘ 这条只能在真机上看。`target: 'parent'` 与「作者给一个取节点的函数」这两支、以及 `stop()` 句柄，套件一次都没走到。
  - **七个组件的对外事件里有六种进不了快照**：两个宿主的公开事件表只收登记过的那些，`affix-change`、`visibility-change`、`copy-error`、`position-change`、`dimensions-change`、`window-state-change` 都不在表内，派没派、派了几次一律看不见（`hot-key` 同样不在表内，由新加的用例单独咬住）。表内的 `open-change` 与 `download-error` 则逐帧对得上。
  - **`float-button` 的贴边距离没有判据。** 它落成内联的 `--xh-_float-button-offset`，而归一化快照不收 style；套件里那条传了 `offset: 8` 的用例只对 `data-placement` 与 `data-shape`。`affix` 与 `floating-panel` 的矩形不在此列——那两个套件专门用 raw 步骤直接读 `el.style` 对数。
  - **`clipboard` 的播报区没跑过。** `status` 部件不在共享 fixture 里，只有 `check-part-wiring` 的「源码里引到了那个 getter」在核；它不给内容时念 `announcement` 这条更是连文本都不进快照（归一化快照只收属性、文档序、焦点与事件）。
  - **`floating-panel` 的文案覆盖没有用例。** 套件对的是把手与形态钮的内建英文（含 `aria-valuetext` 那一句），`translations` 传进去覆盖掉之后的样子一次都没验过。
  - **jsdom 没有布局，量测全是桩出来的。** `affix` 的判定线与占位尺寸、`back-top` 的滚动量、`floating-panel` 的矩形，都是套件在真实节点上按需摆的常数；`floating-panel` 的指针拖动与改尺（`trackPointer` 整条）一次都没跑到。真实排版下的行为只能在真机上看。
  - React 侧还没有浏览器态用例与计算样式快照这条输入，七个组件的皮肤、悬浮钮的贴边、面板的阴影与层级一律不在判据内。

- 140cf60: **Reasoning 的 trigger 接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（disclosure trigger 只换面不缩放）。**
  connect 读共用的 tool-call 机器 `context.pressed`，不另建机器；禁用时不进，按住途中转禁用时由机器松开；思考中 trigger 照常可点，按压面同样照有。
  键盘表新增 `reasoning.kbd.press`。三端公开 props 与事件不变。
- e24a3d3: Scrollbar 新增 `anchor` 属性（`shell` | `layer`，默认 `shell`）：`layer` 时根节点仍挂在定位壳里，
  但按滚动层在壳内的偏移盒（offsetLeft / offsetTop / offsetWidth / offsetHeight）由连接层写成内联几何
  贴在该层的盒子上，根带 `data-anchor="layer"`，皮肤放开壳边的 inset；层与并排兄弟的伸缩、增减都会
  重新测量。多个滚动层并排共用一个壳（级联的列、时间列）时每层各自一套滚动条。三端 `useScrollbars`
  / `ScrollbarsController` 同步接收 `anchor`，Web Components 的 `ScrollbarsController` 另支持
  `scrollables` 多路形态（按当前在场的层逐层建一套、离场即拆），并提供 `dispose()`。
- 6ec0c4b: **Segmented 分段接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressedValue`（按住的段 value），事件 `PRESS.START { value, disabled? }` / `PRESS.END { value }`；
  守卫 `canPress` 在整组禁用、只读或段自身禁用时不进；`endPress` 只松开 value 对应的那一个；按住途中整组转入禁用或
  只读时由机器自行松开。选中与按压互相独立，选中语义照旧由平台把这两个键翻成 click。皮肤的按压选择器已是
  `:is(:active, [data-pressed])`（`--xh-action-scale-pressed: none` 保接缝）；键盘表新增 `segmented.kbd.press`。
  三端公开 props 与事件不变。
- 8efcd86: Select 现在以 Headless Presence 租约管理真实退出：逻辑关闭会立即令 content `inert` 并退出可访问树，Layer、DismissableLayer 与焦点域保留到 content 的全部有限 CSS 退场完成。退场期间不再接受重复消解；重开撤销旧视觉租约、复用 Layer 并重新激活焦点域，卸载立即清理。
- ea9fc5b: **Select 条目与清空按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压
  面。** 机器 context 新增 `pressedPart`（`item` / `clear-trigger`）与 `pressedValue`（条目 value，清空按钮记 null），
  根级事件 `PRESS.START { part, value?, disabled? }` / `PRESS.END { part, value? }` 两个状态都认；守卫 `canPress` 在
  禁用或只读时两者都不进，条目自身禁用（部件声明或 collection）时不进，清空按钮没有值可清时不进；`endPress` 只松开
  part + value 对应的那一个，open 态 exit 时条目随浮层收起一并松开，按住途中转入禁用 / 只读或值被清空时由机器自行
  松开。item 与 clear-trigger 的 getter 投影 `data-pressed`，Collection Item（overlay 语境）与 Action Control
  （field-inset 档）家族配方的按压选择器已是 `:is(:active, [data-pressed])`；键盘表新增 `select.kbd.press`。三端公开
  props 与事件不变。
- 690200f: **SideNav 链接行与分支行接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressedPart`（`link` / `branch-trigger`）与 `pressedValue`（入口 value），根级事件
  `PRESS.START { part, value, disabled? }` / `PRESS.END { part, value }` 平铺与弹出两个状态都认；守卫 `canPress` 在整个侧栏
  禁用时不进，入口自身禁用时不进；`endPress` 只松开 part + value 对应的那一个，弹出面板收起（exit）时一并松开，按住途中
  侧栏转入禁用时由机器自行松开。导航当前（`aria-current`）与按压互相独立；激活与展开语义照旧由同一次按键承担。
  Collection Item（page 语境）家族配方的按压选择器已是 `:is(:active, [data-pressed])`；键盘表新增 `side-nav.kbd.press`。
  三端公开 props 与事件不变。
- 297fb1e: **Sortable 拖动把手接入按压通道：触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器 context 新增 `pressedId`
  （按项 id 记住正被按住的把手），事件 `PRESS.START` / `PRESS.END`；整体禁用或该项禁用时不进。把手的 pointerdown 同时是拖动起点：
  触屏那一下先进按压面、拖动会话同时起步，走够激活距离升级成拖动时由机器撤下，拖动中的回执只剩 `data-dragging`；键盘的
  Space / Enter 在 keydown 即拾起转拖动、按压面随即撤下。按住途中整体转禁用或该项离开 `ids` 时同样松开。键盘表新增
  `sortable.kbd.press`。三端公开 props 与事件不变。
- 295d6e0: **Steps 触发器接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（行与圆点一起
  换面）。** 机器 context 新增 `pressedStep`（按住的那一步的下标），事件 `PRESS.START { step, disabled? }` /
  `PRESS.END { step }`；守卫 `canPress` 在整组禁用、作者自报禁用或 linear 未解锁时不进；`endPress` 只松开 step 对应的那
  一个；按住途中整组转入禁用时由机器自行松开。切步与按压互相独立，Enter / Space 在 keydown 那一刻照旧切步。皮肤按压规则
  已是 `:is(:active, [data-pressed])`（换面落在行与 `indicator`）；键盘表新增 `steps.kbd.press`。三端公开 props 与事件不变。
- 498ce78: **Switch 轨道接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressed`，根级事件 `PRESS.START` / `PRESS.END`；守卫 `canPress` 在禁用、提交中或只读时不进；按住
  途中转入禁用、提交中或只读时由机器自行松开。轨道是原生按钮，Space 与 Enter 都是激活键，两键都进按压面；按压与开关态
  互相独立，按住途中开关态翻转不会丢掉按压面。皮肤按压规则已是 `:is(:active, [data-pressed])`；键盘表新增
  `switch.kbd.press`。三端公开 props 与事件不变。
- 101f8cb: **Table 七个可按部件接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  行（`row`）、全选把手、行选把手、展开把手、列显隐把手、排序把手与取下一页按钮共用一个机器，context 新增
  `pressed`（`TablePressedKey`：`select-all` / `load-more` / `row:<id>` / `row-select:<id>` / `expand:<id>` /
  `column-visibility:<id>` / `sort:<id>`），根级事件 `PRESS.START { key, disabled? }` / `PRESS.END { key }` 四个状态
  都认；守卫 `canPress` 在加载中不进，部件自身禁用（行禁用、不可展开、列不可排序、选择关停、只剩最后一列）时不进；
  `endPress` 只松开键对应的那一个，按住途中转入加载时由机器自行松开。行的按压只认落在行自己（含普通格子）上的
  事件，行里两颗把手与作者放进格子的控件各有自己的按压面。Space / Enter 的选中、排序与展开语义照旧。Action
  Control（icon / row 档）与 Collection Item（page 语境）家族配方的按压选择器已是 `:is(:active, [data-pressed])`；
  键盘表新增 `table.kbd.press`。三端公开 props 与事件不变。
- a145f51: **Tabs 页签接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressedValue`（按住的 trigger value），事件 `PRESS.START { value, disabled? }` /
  `PRESS.END { value }`；守卫 `canPress` 在条目禁用时不进（Tabs 没有整组禁用，条目自身的禁用由 connect 判定后随事件
  带入）；`endPress` 只松开 value 对应的那一个。选中（`aria-selected` / `data-current`）与按压互相独立，确认语义照旧由
  同一次按键承担；同一个 pointerdown 先过按压跟踪器再判拖动起手（触屏归按压、鼠标归拖动）。line 档的 Collection Item
  nav 语境与 card / segment 皮肤的按压选择器已是 `:is(:active, [data-pressed])`；键盘表新增 `tabs.kbd.press`。
  三端公开 props 与事件不变。
- 32142f9: Tabs 的标签带放不下时不再折行：标签整体沿主轴位移露出被裁掉的那截。新增 `prev-trigger` / `next-trigger` 两个可选部件（Vue / React 为 `XhTabsPrevTrigger` / `XhTabsNextTrigger`，Web Components 为 `data-xh-part="prev-trigger|next-trigger"`），放在 `list` 里作两端翻页钮：接 Action Control icon 档 ghost 面，对读屏隐藏、不占 Tab 位，放得下时 `hidden`，挪到头那一侧禁用并收起；不写内容时皮肤画 chevron，盖底缺省取 surface（`segment` 轨道取 subtle），使用者槽 `--xh-tabs-scroll-trigger-bg` / `-fg`、`--xh-tabs-scroll-icon-size`。标签带上横向滚轮（触控板两指横划、Shift + 滚轮）按量位移并拦住页面滚动，竖滚轮放行；触屏手指按在标签带上沿主轴拖即跟手平移（走够激活距离才算平移，拖着时撤掉指下标签的按压面，抬手后紧跟的那次 click 不算点选；放不下时 `list` 写 `touch-action: pan-y pinch-zoom` 让出交叉轴，竖排为 `pan-x`），与换位拖动共用同一个指针会话；选中或聚焦的标签被裁在外面时自动挪进视野；位移在机器里按 continuous 档补间，减弱动效下一步到位。`api.overflow` 报两端各还有没有被裁掉的标签，放得下时为 `null`；新增事件 `SCROLL.PREV` / `SCROLL.NEXT` / `SCROLL.BY`。皮肤侧 `list` 改为 `flex-wrap: nowrap` + `overflow: clip visible`（只裁主轴，不是滚动容器：焦点环、粗指针外扩与 segment 抬起面的影都不被裁），`root` 加 `min-inline-size: 0` 让它在一行弹性 / 网格容器里也缩得下；指示条的几何改按排布几何（`offset*`）量，与位移无关。一致性夹具的标签带两端补上两只翻页钮，钉三端把它们建成同一种节点。tabs.css 涨约 3.7KB，全是翻页钮与位移规则。
- a316462: Tag 新增第四种公开 `ghost` variant，与既有 solid、subtle、outline 组成完整形态轴。默认与 subtle 改用 M1 soft material 的背景、边界、文字和轻阴影；outline 与 ghost 明确清除表面阴影，ghost 保持透明并可读取 tone 前景色。

  关闭钮维持 16px 视觉盒，同时用透明伪元素把实际指针命中扩到 24px，不改变标签行高。共同连接层现在通过 `setOpen(false)` 关闭，静态受控标签已经关闭时不会重复发同值 open-change 意图。

  皮肤按去注释、压空白的统一标准从 5581 增至 6314 字节（+733），增量对应 ghost 形态、M1 材质与关闭命中层；只重登记 Tag 基线，逐组件 10% 容差保持不变。

- 86ce3e7: TagGroup 按页内持久集合归位选中语义：新增 `item-indicator` 部件（Headless `getItemIndicatorProps`，Vue / React `XhTagGroupItemIndicator`，Web Components `data-xh-part="item-indicator"`）作为文字前的选中标记，选中时展示、未选中以 `hidden` 收起，内容留空时由皮肤绘制对号；按 `collection` 铺开的默认结构已包含它，手写部件时需自行加入。皮肤侧选中的标签改为品牌淡底 + 配对前景（`--xh-tag-group-item-bg-selected` / `-selected-hover` / `-selected-pressed` 新增，`--xh-tag-group-item-border-selected` 缺省改透明、`--xh-tag-group-item-fg-selected` 缺省改 `--xh-fg-on-brand-subtle`），实心档保留 currentColor 选中环；悬停改白底承载的 100 档，按下在缩放之外同时换底（`--xh-tag-group-item-bg-pressed`，实心档 `--xh-tag-group-item-bg-pressed-solid`）。皮肤体积增长来自选中三态、按下面、前导对号与高对比补救块。
- 61f60de: **TagGroup 标签本体与移除钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressedPart` / `pressedValue`（正被按住的那一枚的哪个部件），事件 `PRESS.START { part, value, disabled? }`
  / `PRESS.END { part, value }`；守卫 `canPress` 在整组禁用、只读，条目禁用、不参与选中的本体、摘不掉的移除钮上不进；按住途中
  整组转入禁用 / 只读、正按着的那一枚被摘掉时由机器自行松开。按压经 `connectStaticTag` 的 `press` 入参交给静态标签，
  `data-pressed` 投影在 tag 的 root 与 close-trigger 上，皮肤按压面已是 `:is(:active, [data-pressed])`。三端公开 props 与事件不变。
- 6922cce: **Tag 关闭钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器 context
  新增 `pressed`（`TagPressedPart`：`root` / `close-trigger`，类型进公开面），根级事件 `PRESS.START { part }` / `PRESS.END { part }`；守卫 `canPress` 在禁用、只读时不进，关闭钮还要 `closable`，按住途中转入禁用 / 只读、收回关闭钮或标签收起时由机器
  自行松开。root 同一条通道只在触屏按下时进来，供把标签当条目用的宿主投影。`connectStaticTag` 新增可选的第四个入参 `press`
  （`TagPressPort`）：宿主替静态标签供给按压通道，未提供时两个部件都不接按压，既有调用不受影响。皮肤关闭钮的按压面改为
  `:is(:active, [data-pressed])`；键盘表新增 `tag.kbd.press`。三端公开 props 与事件不变。
- 3ef5a6e: **`tag` 新增 `readOnly`：只锁关闭钮，标签本身不置灰；新导出 `tagVariantForControl`。**

  从前 `tag` 表达「摘不掉」只有两条路：`closable=false` 把关闭钮连同位置一起收起（标签宽度跳变），`disabled` 把整枚标签置灰。宿主整体只读时要的是第三种——叉留在原地但按不动、标签本身照常——`tag` 表达不了，套 `tag` 的宿主只能各自再画一颗钮。

  - **`readOnly`**（Vue / React 同名 prop，Web Components 写 `read-only` 属性）：关闭钮留在原位、带原生 `disabled` 与 `data-disabled`，不打 `hidden`；`root` 不新发任何属性，`data-disabled` 仍只由 `disabled` 决定，皮肤里禁用那一档的置灰不会误伤只读标签。`readOnly` 与 `disabled` 同时在时按禁用那一副画。直接派 click 不收标签、不发 `open-change`，机器路与不建机器的快路同一条规矩。皮肤不改：关闭钮的 `:disabled` 已画成置灰色，光标由公共层给 `not-allowed`。
  - **`tagVariantForControl(variant)`**：控件面到标签形态的映射，`subtle` 的面上摆描边标签、`outline` / `ghost` / 缺省的面上摆淡底标签。此前是 `select` 连接层里的私有函数，套 `tag` 的控件类宿主都要这一份，改从 `tag` 导出。

  判据：headless `tag.spec` 加 5 条（只读的机器路与快路、撤销只读当场解禁、形态映射四个入参）；三侧一致性套件加「readOnly：关闭钮留在原位但禁用，root 不打 data-disabled，直接派 click 也不收标签」；Vue 快路 `tag-static-path.spec` 加 1 条；浏览器态新增 `tag-read-only-skin.spec`（三档形态 × 只读 / 禁用：宽高不跳、只读的底与字与常态逐字相同、禁用退成置灰、只读的叉悬停不换底）。文档站示例新增「只读」一份。

- cb9e315: **TagsInput 清空按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器
  context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级，守卫 `canPress` 与清空按钮的显隐同一口径（禁用、
  只读，或既无标签也无文本时不进）；按住途中标签与文本被清空或转入禁用 / 只读时由机器自行松开。清空按钮的
  pointerdown 仍拦默认聚焦，焦点留在输入框。键盘表新增 `tags-input.kbd.press`。三端公开 props 与事件不变。
- 089ef81: **TextField 清空按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器
  context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级，按压与清空同一道 `canClear` 守卫（未开 clearable、
  禁用、只读或没有值时不进）；按住途中值被清空、关掉 clearable 或转入禁用 / 只读时由机器自行松开。清空按钮的
  pointerdown 仍拦默认聚焦，焦点留在输入框。键盘表新增 `text-field.kbd.press`。三端公开 props 与事件不变。
- 8ee8efe: **TimeField 清空按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器
  context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级，守卫 `canPress` 与清空按钮的显隐同一口径（可编辑且有值，
  禁用、只读或没有值时不进）；按住途中值被清空或转入禁用 / 只读时由机器自行松开。清空按钮的 pointerdown 仍拦默认聚焦，
  焦点留在段位上。time-picker / time-range-picker 自家的清空按钮由各自的根机器负责，不在此列。键盘表新增
  `time-field.kbd.press`。三端公开 props 与事件不变。
- 2ca7fc2: **TimePicker 触发钮、清空钮、快捷选项与时间格接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副
  按压面。** 机器 context 新增 `pressed`（按 key 记住正被按住的那一个，新增导出类型 `TimePickerPressedKey`），事件 `PRESS.START` /
  `PRESS.END` 挂根级：整体禁用谁都不进；只读时触发钮照常展开、照有回执，清空钮、快捷选项与时间格与它们的写值同一道门不进；越界或
  作者禁用的快捷选项与时间格不进。浮层收起时浮层里按住的部件由机器自行松开（Enter 在 keydown 即写值收起，不再有 keyup）；按住途中
  转入禁用 / 只读或值被清空同样自行松开。键盘表新增 `time-picker.kbd.press`。三端公开 props 与事件不变。
- af55d45: **TimeRangePicker 触发钮、清空钮、快捷选项与时间格接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副
  按压面。** 机器 context 新增 `pressed`（按 key 记住正被按住的那一个（时间格再带起 / 止端下标），新增导出类型 `TimeRangePickerPressedKey`），事件 `PRESS.START` /
  `PRESS.END` 挂根级：整体禁用谁都不进；只读时触发钮照常展开、照有回执，清空钮、快捷选项与时间格与它们的写值同一道门不进；越界或
  作者禁用的快捷选项与时间格不进。浮层收起时浮层里按住的部件由机器自行松开（Enter 在 keydown 即写值收起，不再有 keyup）；按住途中
  转入禁用 / 只读或值被清空同样自行松开。键盘表新增 `time-range-picker.kbd.press`。三端公开 props 与事件不变。
- 0460036: **新增** `time-range-picker` 组件（时间范围选择器）：起止两组可键入的分段时间框、`range-separator`、触发器与浮层里并排的两组时列组合成一个字段；`time-picker` 本身不承接区间，这一路是净新增。

  - 值恒为区间两端 `[start, end]`，按位存放，空缺的一端用空串占位（只填了终点是 `['', end]`），受控回写按同一份下标认领；`api.start` / `api.end` 直接取两端，终点早于起点时 `api.reversed` 为真并把整个字段标为不合法。
  - `name` 与 `endName` 各自决定两份 `hidden-input` 参不参与提交；`segment-group` 带 `data-index`（0 起点、1 终点），方向键换段不跨组，两组各报「开始时间」「结束时间」（`translations.startTime` / `endTime`）。
  - 浮层里是 `column-group` × 2（各带 `column-group-label`），每组按 `granularity` / `hourCycle` / `step` 铺时、分、秒（与上下午）列；`min` / `max` 裁掉两组共同的界外值，另一端一填全再各自收窄一次（终点的下界是起点，起点的上界是终点）；`isTimeUnavailable(value, unit, index)` 多收一个端号，逐格判定；方向键在一组内换列、跨到另一组继续。
  - `presets` 只收区间，值用 `start/end` 写法：`timeRangePickerPresetValue` 拼两端，`timeRangePickerPresetTimes` 拆回，`timeRangePickerPresetFromNow(minutes)` 算「接下来 N 分钟」；不是恰好两端、越界或倒序的快捷项直接置灰。
  - Vue `XhTimeRangePicker*` 与 `useTimeRangePicker`；React 同名组件与 hook；自定义元素 `<xh-time-range-picker>`（`value` / `default-value` 是数组，只走 property；`columnGroups` 只读属性给出两组该铺的列与格）；皮肤 `@xihan-ui/styles/time-range-picker.css`，覆盖槽前缀 `--xh-time-range-picker-*`。

- 6b161da: **Timer 的 control 接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级、四段状态都接；同一颗钮在 running / paused 下语义不同，按住途中起停翻转按压面不丢。按钮没有禁用态，按住一律进。
  键盘表新增 `timer.kbd.press`。三端公开 props 与事件不变。
- 5dfa0f2: **Toast 的关闭按钮与操作按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressed`（`ToastPressedPart`：`'close' | 'action'`，记正被按住的那颗），事件 `PRESS.START` / `PRESS.END`；
  不可关闭时关闭按钮不进，进入退场（点关闭、点操作、到点自动退场）或按住途中转成不可关闭时由机器松开。
  `ToastPressedPart` 类型进入公开面；键盘表新增 `toast.kbd.press`。三端公开 props 与事件不变。
- 0a6b3d2: **ToggleGroup 条目接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressedValue`（按住的条目 value），事件 `PRESS.START { value, disabled? }` / `PRESS.END { value }`；
  守卫 `canPress` 在整组禁用或条目自身禁用时不进；`endPress` 只松开 value 对应的那一个；按住途中整组转入禁用时由机器
  自行松开。开关态（`aria-pressed` / `aria-checked`）与按压互相独立，切换照旧由平台把这两个键翻成 click。Action Control
  家族配方的按压选择器已是 `:is(:active, [data-pressed])`；键盘表新增 `toggle-group.kbd.press`。三端公开 props 与事件不变。
- 1536143: **ToolCall 的 trigger 接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（disclosure trigger 只换面不缩放）。**
  tool-call 机器 context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级、auto / held 四个叶态都接；禁用时不进，按住途中转禁用时由机器松开；运行中 trigger 照常可点，按压面同样照有。
  键盘表新增 `tool-call.kbd.press`。三端公开 props 与事件不变。
- 0d7cd38: **Toolbar 的 item 接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressedValue`，事件 `PRESS.START` / `PRESS.END` 按条目 value 记按住的那一个；整条或条目禁用时不进，按住途中整条转禁用时由机器松开。
  键盘表新增 `toolbar.kbd.press`。三端公开 props 与事件不变。
- 3a3b478: `tour` 以 Headless 的 Presence 租约作为退出生命周期真源：逻辑关闭立即让内容 `inert` 并退出可访问树，Layer、DismissableLayer 与焦点域会等气泡、遮罩和聚光灯的全部有限退场完成后才释放。退场期间不会再次接受 Escape 或层外交互；中途重开会结清旧租约、复用原 Layer 并重新激活焦点域，卸载立即释放资源。

  三端均把真实的 content、backdrop 与 spotlight 接入同一份 Presence。Tour 不新增滚动锁、背景失活、退出完成事件或回调。

- 46a5116: **Transfer 接入 Collection Item 与 Action Control 配方，勾选行改品牌淡底，搬运钮改中性描边，两侧列表接自绘条。**

  - 条目投影 `data-xh-collection-item` / `-size` / `-context='page'`，文字落 `text` 槽、勾选方框是前导标记（`prefix`）；悬停 100、按下 200 只换面（此前按下零反馈），勾中的行铺 `--xh-bg-brand-subtle` 行面 + `--xh-fg-on-brand-subtle` 前景（此前行不染色），selected + hover 20%、+ pressed 28%。新增 `--xh-transfer-item-bg-pressed` / `--xh-transfer-item-bg-selected` / `--xh-transfer-item-fg-selected`。
  - 两颗搬运钮接 Action Control `icon` 档 outline 形态：中性描边、透明底，hover 100 → pressed 200 并 0.97 缩放（此前淡底 + 悬停 raised 抬升 + 200 / 300 阶梯）；`--xh-transfer-trigger-shadow-hover` / `-active` 缺省改 none。
  - 全选把手补悬停 / 按下面（`--xh-transfer-select-all-bg-hover` / `-pressed`），圆角改 `--xh-shape-inset` 档（与 control 同值）。
  - 面板标题字重由 500 改为 `--xh-font-weight-semibold`（Surface 内标题档）；根上 `--xh-icon-size` 缺省由随文字形改为 `--xh-glyph-size-md` 并随 `size` 换档，勾选格里的勾按边长比例取尺。
  - 三端把两侧 `list` 接上自绘滚动条（真源 §6.6 定高小列表）：条子挂在 `root` 上、贴层锚定、紧跟在各自列表后面、两轴都摆、走 6px 缺省档；Vue 的 `XhTransferList` 与 React 的同名组件根节点从此是片段（列表 + 条子），直通属性仍落在列表节点上。

- e416596: 穿梭框增加 name/form 原生表单支持，三端自动为每个目标值装配同名隐藏字段，逗号原值无损提交；支持禁用排除和原生重置恢复声明默认目标与勾选。
- 54c56f6: **Transfer 条目、全选格与两颗搬运按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active`
  同一副按压面。** 四类部件共用一个机器，context 新增 `pressed`（`TransferPressedKey`：`to-target` / `to-source` /
  `item:<side>:<value>` / `select-all:<side>`），根级事件 `PRESS.START { key, disabled? }` / `PRESS.END { key }`；守卫
  `canPress` 在禁用、只读或加载时不进，部件自身不可用（条目禁用或被藏起、全选格无可操作条目、搬运按钮没有勾中的
  条目）时不进；`endPress` 只松开键对应的那一个，按住途中转入禁用 / 只读 / 加载，或按住 Enter 搬完后按钮失去可搬的
  条目（原生 disabled 不再来 keyup）时由机器自行松开。Space 的勾选与搬运语义照旧。Action Control（icon / text 档）
  与 Collection Item（page 语境）家族配方的按压选择器已是 `:is(:active, [data-pressed])`；键盘表新增
  `transfer.kbd.press`。三端公开 props 与事件不变。
- db1dc9a: **Tree 叶子行与分支行接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressedPart`（`item` / `branch-control`）与 `pressedValue`（节点 value），事件
  `PRESS.START { part, value, disabled? }` / `PRESS.END { part, value }`；守卫 `canPress` 在整棵树禁用或加载时不进，
  节点自身禁用时不进；`endPress` 只松开 part + value 对应的那一个，按住途中整棵树转入禁用 / 加载时由机器自行松开。
  叶子行自己接键盘与触屏；分支行的焦点落在 branch 上，键盘按压由 branch 代发（只认落在自己身上的按键与失焦，
  子树里冒泡上来的不算），`branch-control` 投影 `data-pressed` 并只接触屏；同一个值按住分支行时叶子不亮。
  Space / Enter 的选中与展开语义照旧由 tree 容器承担，按压只记事实。Collection Item（page 语境）家族配方的按压
  选择器已是 `:is(:active, [data-pressed])`；键盘表新增 `tree.kbd.press`。三端公开 props 与事件不变。
- 261f03d: **TreeSelect 叶子行、分支行与清空按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active`
  同一副按压面。** 机器 context 新增 `pressedPart`（`item` / `branch-control` / `clear-trigger`）与 `pressedValue`
  （节点 value，清空按钮记 null），根级事件 `PRESS.START { part, value?, disabled? }` / `PRESS.END { part, value? }` 两个
  状态都认；守卫 `canPress` 在禁用、只读或加载时三者都不进，节点自身禁用时不进，清空按钮没有值可清时不进；`endPress`
  只松开 part + value 对应的那一个，open 态 exit 时随浮层收起一并松开，按住途中转入禁用 / 只读 / 加载或值被清空时由
  机器自行松开。叶子行自己接键盘与触屏；分支行的焦点落在 branch 上，键盘按压由 branch 代发（只认落在自己身上的按键与
  失焦，子树里冒泡上来的不算），`branch-control` 投影 `data-pressed` 并只接触屏；同一个值按住分支行时叶子不亮。
  Collection Item（overlay 语境）与 Action Control（field-inset 档）家族配方的按压选择器已是
  `:is(:active, [data-pressed])`；键盘表新增 `tree-select.kbd.press`。三端公开 props 与事件不变。
- 5e4b0cb: 补齐视口与特殊浮层的实例级 Portal 容器入口。

  Vue Dialog、Command、ImageViewer、FloatingPanel 与 SideNav 分支，以及 React/Vue Tour，均可让实例
  容器优先于应用配置；React SideNav 同步获得分支实例容器。Tour 的 backdrop、spotlight、positioner
  共享根实例目标，避免三张表面被配置到不同容器。

### Patch Changes

- 233739b: Vue 的 `useScrollLock` 改在 mounted 后用 post watcher 读取当前 active 与 RuntimeConfig，确保初始启用时模板 ref 已经提交。释放会先清空包装层句柄再调用 Core dispose，因此清理抛错后下一次 false→true 仍能用最新配置建立新锁；单次 active 阶段继续固定创建时配置，不因普通对象换代重锁。

  React 的 `useScrollLock` 改用同构 layout effect，在浏览器绘制前完成首帧加锁，并保持单次 active 阶段的 RuntimeConfig 固定；false→true 会读取最近一次已提交配置，StrictMode 的探测清理不会留下额外锁。

  Web Components 的 `<xh-command>` 现在与 Dialog、Drawer、ImageViewer 一样，在每次实际获取滚动锁时沿元素祖先链读取最近的 `<xh-config>` 或全局 `scrollRoot`。未配置时显式返回 `null` 表示页面，不再依赖 Core 自动探测。

- 4192265: Breadcrumb 的数据模式默认使用皮肤绘制的箭头分隔符，不再输出斜杠文字；自定义分隔内容仍通过现有插槽与渲染函数提供。
- a880755: CodeView 默认高亮器的异步请求、单例缓存、订阅与失败边界现由 Headless 资源控制器统一管理，三端适配器只注入可选模块 loader 并桥接各自响应式更新。
  显式关闭高亮不会请求默认模块；明确缺少可选 peer 时保持纯文本，已安装模块的加载或初始化异常不再被静默吞掉。
- ced9f26: Command 的非模态模式不再创建或显示遮罩；全屏 positioner 只负责布局，不截获页面指针，content 自身保持可交互。

  展开期间切换 `modal` 会由无头状态机同步焦点陷阱、Tab 回绕、滚动锁和背景失活。默认模态行为保持不变。

- 02de41e: Command 无可见命令时收起空列表的额外内距，隐藏分组和隐藏条目不会留下空白行；禁用命令仍作为真实候选显示。
  没有作者内容的 Empty / Loading 节点不再占据纯留白。搜索输入、状态文案、底栏及焦点位置保持正常。

  数据集合保持不变，已有 DOM 中明确隐藏的候选退出键盘、指针、执行与 ARIA 高亮；未挂载或虚拟候选不作隐藏推断。
  三端在 List 节点提交和释放时通知私有可见性端口，保持展开替换节点时撤销旧观察并绑定新列表，不扫描整个 Document。

  皮肤体积（去注释、压空白）：前一提交源码 10959 字节，当前 11264 字节；登记基线 10959 → 11264，只更新本组件，10% 容差保持不变。

- c7966d3: 新增框架无关的 `groupAdjacentRuns` 集合投影；ContextMenu 与 Menubar 的数据驱动默认渲染改用同一 Core 真源，不再由 Vue、React 各自复制相邻分组算法。
- 249819e: 新增统一的 `normalizeItemIndex` 部件下标归一函数；Slider 与 Splitter 的 Vue、React、Web Components 接线不再分别复制有限数与回退判定。
- 7e512dc: Dialog 在 `modal=false` 时不再创建或激活全屏遮罩，定位层不再拦截面板之外的页面指针；展开期间切换 `modal` 会同步更新焦点陷阱、滚动锁、背景失活和遮罩。

  FocusScope 的 `loop` 选项新增 getter 形式，使共享核心能够在不重建焦点域的情况下切换 Tab 边界回绕策略。

- 0308154: 新增框架无关的 DialogService controller，统一管理请求排队、单次结算、真实退出身份、动作 attempt 与宿主失败或卸载时的队列清场。

  Vue、React 与 Web Components 的 DialogService 改为共享该控制器；各端公开 API、Promise 结算时点、动作错误语义及渲染结构保持不变。

- 192876a: 命令式对话框服务改用公共 Header、Body、Footer 组件，统一三端结构及间距；长正文只滚动 Body，标题和确认/取消按钮保持可见，字符串、函数正文与 prompt 合同不变。
- 1f1c06a: DialogService 队列改由当前请求对应的真实退出完成通知推进，不再固定等待 250ms。自定义长退场会完整播放，无动画或减动效则立即进入下一项；重复关闭和旧请求的迟到完成不会跳过新请求。
- 4640530: Drawer 在 `modal=false` 时不再创建或激活遮罩，定位层继续允许指针穿透到页面；展开期间切换 `modal` 会同步更新焦点陷阱、滚动锁、背景失活和遮罩。
- 4cebbcf: Toast 与 Notification 的默认服务投影现在由 Headless 统一计算：合并计数标题、Toast 默认语气、
  有效停留时长、默认关闭出口及服务级退场/页面暂停值不再由三端适配器分别判断。DialogService 的
  徽记到语气映射也迁入同一核心层；适配器只保留框架节点、Light DOM、宿主挂载和事件桥接。
- 2cbfb51: 新增 Toast 与 Notification 命令式服务共享的框架无关 controller，统一管理服务级暂停、Toast id、行内动作回调、create/update/dismiss、真实退场回收、Promise 三态和 dispose 生命周期。

  记录数组、max、priority 与 dedupe 继续由既有 notificationMachine 统一处理，没有新增第二套队列。三端公开 API、id、顺序、合并、挤条与渲染语义保持不变。

- d41017b: Checkbox、Switch、RadioGroup 与 NumberField 现已接入统一的 FormControlContext 状态继承：
  `disabled`、`readOnly`、`invalid`、`required` 按实例、最近 Field、Form、默认值的顺序逐轴解析。
  Vue、React 与 Web Components 共用 Headless resolver；Web Components 同时支持显式 `false` 覆盖继承状态。
- c27da1f: Rating、Segmented、ToggleGroup 与 Transfer 现已接入统一 FormControlContext 状态继承。
  各组件只消费原有公开状态轴，并按实例、最近 Field、Form、默认值逐轴解析；显式 `false` 可覆盖继承状态。
- fb56533: Editable、TagsInput、CheckboxGroup 与 Slider 现已接入统一的 FormControlContext 状态继承。
  各组件只按原有公开契约消费 `disabled`、`readOnly`、`invalid`，TagsInput 另消费 `required`；
  所有支持轴均按实例、最近 Field、Form、默认值逐轴解析，并允许实例显式 `false` 覆盖继承状态。
- 36b4098: FieldArray、FileUpload、ImageCropper 与 SignaturePad 现已接入统一 FormControlContext 状态继承。
  各组件只消费原有公开状态轴，并按实例、最近 Field、Form、默认值逐轴解析；显式 `false` 可覆盖继承状态。
- 2d35bc5: 让 Listbox 与 TagGroup 接入统一 FormControlContext 状态继承。

  Listbox 消费既有 disabled/readOnly/invalid 三轴，TagGroup 消费 disabled/readOnly 两轴；实例显式
  `false` 继续优先于最近 Field 与 Form，Web Components 的条目禁用快照使用解析后的有效状态。

- 4da51d1: DatePicker、TimePicker、ColorPicker 与 Mention 现已接入统一 FormControlContext 状态继承。每个组件只消费既有公开状态轴，按实例、最近 Field、Form、默认值逐轴解析，并允许显式 `false` 覆盖继承状态。
- c61f90c: PasswordInput、PinInput、DateField 与 TimeField 现已接入统一的 FormControlContext 状态继承。
  `disabled`、`readOnly`、`invalid`、`required` 按实例、最近 Field、Form、默认值逐轴解析，
  且三端都保留显式 `false` 覆盖继承状态的能力。
- 8507ce8: Select、Cascader、Combobox 与 TreeSelect 现已接入统一 FormControlContext 状态继承。三轴或四轴严格按各组件现有公开契约消费，并按实例、最近 Field、Form、默认值逐轴解析；显式 `false` 可覆盖继承状态。
- 3577e4c: 表单重置桥支持显式 form 归属；未指定时继续查找祖先表单，指定无效目标时不回退其他表单，三端按机器正式 form 属性接线。
- 934a51b: Grid 的单值与逐断点对象/JSON 声明统一由 Headless 归一；Vue、React、Web Components 不再分别解析数字、有限值和断点键。
- 1322aa6: Headless 新增纯数据投影 `groupJsonViewerNodesByParent` / `JsonViewerNodesByParent` 与 `diffViewSides` / `DiffViewSides`，供自定义 JsonViewer 和 DiffView 渲染器复用与官方三端保持一致的数据形状。

  Vue、React 与 Web Components 删除各自重复的父路径分组和差异列序实现，改为调用 Headless 投影；DOM 结构、渲染顺序和公开组件 API 保持不变。

- 5226181: 将 DatePicker 公开部件的面板下标、起止字段身份和字段投影归一逻辑下沉到 Headless。

  三适配器复用同一组纯函数，非法下标回到真实父面板，非区间模式的终点继续如实缺席；
  适配器只保留各框架上下文与 DOM 接线。

- 89b2640: Heatmap 的数字与字符串身份归一改由 Headless 唯一真源提供；三端适配器只读取框架 props 或 Light DOM attribute，不再复制空值与有限数判定。
- 48d6b88: LayerRegistry 现在按每个 Document 的真实逻辑栈派生视觉序号与 lane，并通过统一
  `--xh-_layer` 槽驱动已登记浮层的 z-index。嵌套 popover 高于所属 modal，后来登记的层
  不再被组件静态层级压住；动态 modal 会显式同步 Registry 与视觉绑定。

  删除 `Layer.setModal`。模态性继续由只读 `isModal()` getter 提供，变化后调用
  `LayerRegistry.sync(layer)`；`visualOf(layer)` 返回当前 `visualIndex`、`visualLane` 与可写入
  CSS 的 `visualLayer`。公开组件层级变量仍优先于 Registry 私有槽。

- 31ada22: Layout 覆盖式侧栏的 Escape 层级判断改为读取所在运行时显式注入的
  `RuntimeConfig.layerRegistry`，不再按机器 Scope 的 Document 另取默认注册表。使用自定义
  LayerRegistry 时，上层浮层会先处理 Escape；默认注册表里的层不会串进这份自定义层栈。

  `LayoutSchema.refs` 新增并公开 `LayoutRefs.config`。RuntimeConfig、LayerRegistry 与机器 Scope
  必须属于同一 Document，缺少配置或混接会在副作用挂载时明确失败。Vue、React 与 Web Components
  适配器都在机器 mount 前注入配置；Web Components 重连时会按元素当前 ownerDocument 重建。

  直接启动 `layoutMachine` 的调用方必须先建立同源 Scope 与 RuntimeConfig，并在启动运行时之前注入：

  ```ts
  const scope = createScope(root, idGenerator);
  const service = createService(layoutMachine, { props, runtime, scope });
  service.refs.set("config", createRuntimeConfig({ scope, idGenerator }));
  runtime.start();
  ```

- 10dd5f4: 新增框架无关的 LoadingBarService controller，统一管理并发在途计数、正常与错误语气、确定进度值，以及 finish、error、finishAll 和 dispose 的状态转换。

  Vue、React 与 Web Components 的命令式 LoadingBar 服务改为消费同一份状态快照；公开 API 和进度条爬升、收尾及淡出视觉语义保持不变。

- 4e0aadf: Masonry 的 DOM 测量与作者序高度投影现在由 Headless `measureMasonry` 统一提供，
  `sameMasonryHeights` 统一判断连续两次高度序列是否真的变化。React 与 Vue 只保留
  ResizeObserver、框架响应式状态和节点渲染接线，不再各自查询 item、读取矩形或复制数组判等。

  Web Components 保持其 Light DOM“首次见到顺序”合同，不套用依赖稳定 `data-index` wrapper 的
  框架投影，也不改变运行期新增项的顺序语义。

- 1042c06: 修正多级 Menu、ContextMenu 与 Menubar 在 Portal 之间悬停时祖先提前关闭的问题。

  `trackHoverIntent` 新增可选的 `getHoverBranches` 端口：调用方可显式登记同一 Document 中、
  逻辑上属于当前悬停树的 Portal 后代。主内容、后代分支与触发器之间均使用实时区域快照和
  安全多边形仲裁；没有登记的 Dialog、Popover 等无关浮层不会被推断成菜单后代。

  Menu 机器新增适配器 ref `getHoverBranches`。React 与 Vue 的 Menu、ContextMenu、Menubar
  组合部件按真实父子关系递归登记仅处于展开态的子菜单 positioner；进入三级、在三级内移动、
  返回二级均不会触发祖先的旧关闭计时。末级选择改为从叶到根同步收链，避免共享 LayerRegistry
  出现非栈顶释放；键盘逐层进入、返回与 Escape 栈顶语义保持不变。

- 82d9e67: **Menubar：浮层里的条目失焦到菜单栏外，三端一并收起。** `MENUBAR.BLUR` 的意思一直是「焦点离开整条菜单栏（含浮层里的菜单）即收起」，但上报只挂在根的 `focusout` 上：浮层被搬去了 portal 落点，条目的 `focusout` 走 DOM 树到不了根——Vue 与 Web Components 在 Alt+Tab、程序化 `blur()` 或进 iframe 时菜单留在原地，React 却因合成事件沿组件树穿过 Portal 而收起，三端行为不一致。

  现在 `content` 自己也接 `focusout`：离开的节点在它子树里、落点（`relatedTarget`）既不在根、不在任何一张浮层、也不在子菜单里，就发 `MENUBAR.BLUR`；`relatedTarget` 为 `null` 按 DOM 语义一律算离场。一次离场只由一个部件上报——根只认自己子树里、且不在任何浮层里的节点——所以 React 合成事件把同一次 `focusout` 送到根时不会再报一回，受控宿主只收到一条 `value-change`。子菜单里的条目失焦仍归子层的 Menu 机器，本次不动。

- 1774c08: NavigationMenu 逻辑关闭后不再立刻释放 Layer 与消解层：三端当前面板的退出 presence 完成前，
  资源继续保持；退场中重开会撤销旧完成订阅并复用原 Layer。该修正不改变 NavigationMenu 的
  公开 props、事件、Portal 或视觉环境轴。
- f49e42b: Pagination 的省略位面板与 SideNav 的折叠弹出面板现由 Headless 按视觉 Presence 管理真实退出资源。
  逻辑关闭立即令内容 `inert` 并退出可访问树，Layer、DismissableLayer 与 SideNav 可选 FocusScope
  在对应退出完成前保持；SideNav 按分支身份登记 Presence，换枝时两份资源并存，旧层退出就绪后等待
  重新成为栈顶再安全释放，旧完成信号不会误拆新会话。
- f155ad3: **分格输入受控接法下敲一下就跳一格，不再要按两下。** `value` + `onValueChange` 回写的接法里（文档站「一次性验证码」示例，Vue 的 `v-model:value` 同样），敲第一个数字后焦点停在原格不走，再敲一下才跳格，且第二下会把第一格盖掉——用户看到的是首格填了第二个数字、光标才到第二格。

  根因在连接层写完值之后回读 context 裁落点：受控时 context 里的值直读宿主的 prop，宿主把值写回要等它自己重渲（Vue 的 nextTick、React 的提交），事件处理器里回读到的仍是写之前那份，第一个空格还是刚填过的这一格，落点于是停在原地。Web Components 的 property 写回是同步的，不受影响。

  现在落点在机器里随值一起裁定：`VALUE.FILL` 与 `VALUE.CLEAR_AT` 只按刚写下的值把 `focusedIndex` 挪到该去的格子（铺完落到下一格、`blurOnComplete` 且填满时撤到 -1、清格停在被清的那一格），连接层只照锚点搬焦点，不再按值裁一次；`INPUT.FOCUS` 发现锚点已在这一格上就不再裁，避免焦点事件到达时按旧值把焦点拽回去。方向键的落点同样先交机器裁定。

  `PinInputApi` 没有增删条目。三端各补一条真实键盘的 Chromium 用例：受控与非受控、numeric / alphanumeric、otp 与非 otp、数字小键盘、粘贴整串与退格逐键断言焦点、各格的值与回调发数。

- 80c03ee: Popover 的 `modal` 现在由无头状态机统一兑现完整模态约束：锁住页面滚动、让背景失活，并保留后开的嵌套 Portal 层。

  展开期间可动态切换模态策略；关闭内容立即退出焦点与交互树，滚动锁、背景失活和层登记会保留到实际 CSS 退场完成。退场中重开与组件卸载不会遗留资源。

- 5202ee7: **修十三个集合组件的离场焦点上报一次都发不出去。** 条目被移出 DOM 时浏览器不派 `focusout`，焦点无声地掉到 body 上，机器那一侧仍记着一个已经不存在的锚点——方向键从不在场的条目起步，容器也不再兜底进 Tab 序列。适配器本来靠「本节点当下正持有焦点」这个守卫在卸载时上报，但那段清理写在了 `useEffect` 里：React 对被删子树的 passive 清理排在 DOM 摘除**之后**，那时 `activeElement` 已经回到 body，守卫恒不成立。接线看着还在，全程零报错。

  涉及 `cascader` `context-menu` `listbox` `menu` `radio-group` `rating` `segmented` `select` `steps` `tabs` `toggle-group` `tree-select`，一律改成 layout effect。以 `select` 为例：高亮所在的条目被摘掉之后，整份列表一个高亮都没有、也没有任何一个 `tabindex="0"` 的停靠点——新配的用例先复现了这一幕，改完才转绿。

  `runtime/layout-effect.ts` 收下这个共享件，此前四个组件各抄了一份。

  **同时补上 `check-focus-report`。** 判据：清理函数里读了 `getActiveElement` 的，必须是 layout effect，不许是 `useEffect`。这个缺陷是铺第二批时带进来的，一路复制到第十三个组件都没人发现——它不报错、不改 DOM、只在「持有焦点的条目恰好被摘掉」这一路上现形，共享一致性套件的 fixture 是固定的树，永远走不到那里。

  Vue 与 Web Components 不受影响：两者的卸载钩子本就排在节点摘除之前。

- 0d59d38: **修 `select` 条目上两个不冒泡事件没接成原生监听器。** `connect` 在条目上派的是 DOM 的 `focus` 与 `pointerleave`，而 React 的合成事件全部委派在根容器上、只在冒泡阶段派发：`onFocus` 挂的是 `focusin`，`onPointerLeave` 是从 `pointerout` 合出来的。接线看着还在，直接送到节点上的那一种一个都到不了——条目得焦不改高亮、指针离开列表不收高亮，全程零报错。

  `select` 是第一个铺的浮层组件，这条口径当时还没立起来；后面十六个派不冒泡事件的组件都接对了，只剩它一个。

  **同时补上 `check-native-events`。** 此前这条口径只写在提示词与代码注释里，是逐个组件靠人判断的——`select` 这个洞就是这么留下的，而且已经在仓里躺了两批。现在逐组件对账：`headless` 的 `connect` 派了哪几个不冒泡的事件，React 侧就得逐个用 `useNativeEvents` 摘出来；摘了 `connect` 根本不派的名字同样判失败。`onFocusIn` / `onFocusOut` 不在其列——它们经 `reactNormalize` 归到 React 的 `onFocus` / `onBlur`，而那两个合成事件挂的正是冒泡的 `focusin` / `focusout`，改装反而会改坏语义。

  Vue 与 Web Components 不在这张门禁的核查面内：两者都把 `connect` 的处理器原样挂成 DOM 监听器，没有合成事件这一层。

- 1855495: React Portal 现在区分“祖先 host ref 尚在本轮提交中”与“显式视觉来源确实缺失”。祖先 source 首次为空时
  会让当前 layout 提交完整附着一次，并在绘制前同步复核；复核后仍为空继续明确失败，不生成替代 marker、
  不改挂 body，也不让未桥接的实例壳继续运行。

  Select、Combobox、DatePicker、Mention、TimePicker 与 TreeSelect 改用各自真实的 trigger/control/input
  定位锚点作为视觉来源；Menubar 按菜单 value 从既有触发器登记表读取来源。Pagination 的省略面板在省略位
  尚未出现时使用真实 nav 根作为稳定视觉来源，定位仍由 ellipsis trigger 决定。其余显式 source 浮层逐一
  复验，局部主题桥接与原有定位、焦点和消解逻辑不变。

- a904a51: **命令式服务在组件 `useEffect` 里懒建后，第一条命令不再被当成「宿主没挂」静默丢掉。** 宿主树用 `flushSync` 提交，但从 effect 里懒建时 React 正处在提交上下文，`flushSync` 只能排队，宿主要等那轮 effect 跑完才渲；机器与端口跟着宿主的渲染体走，`createToastService()` 之后紧接着的 `toast.danger()` 返回空 id、什么也不弹。

  toast 与 notification 服务的队列机器改由服务自己持有、建好即 start，端口随即接上；宿主组件只订阅与渲染，什么时候提交都不再影响命令能否入队。

- ff84284: Separator 的 decorative 模式现在同时输出 `role="none"` 与 `aria-hidden="true"`，确保带可见文案的纯装饰分隔整段退出无障碍树；语义分隔继续使用 `role="separator"`，垂直时才显式输出 `aria-orientation="vertical"`。

  默认线色改用会随浅深主题、对比度与透明度策略变化的 frosted material separator，subtle 档使用 soft material separator，strong 档保留高对比边界。根线与文字两侧端线增加统一的胶囊端点，让 1px 横竖线在实体和玻璃表面都保持细腻边缘。

- 75ec9fb: 按压音效的声明归一、禁用标记判断与首手势解锁接线迁入框架无关的 sound 包；Vue、React 不再各自维护三份相同规则。
- 995d675: `@xihan-ui/sound` 新增框架无关的共享播放器、业务语义声音与 Toast/Dialog 服务装饰控制器。控制器通过最小结构化服务端口和解锁接线回调工作，不反向依赖 Headless 或 UI 框架。

  Vue 与 React 的 `withToastSound`、`withDialogSound`、`getSoundPlayer`、`setSoundPlayer` 公开 API 保持不变，内部改为复用声音包控制器；各自的 directive/hook、DOM 点击与首次手势监听仍由适配器持有。

- 5ae85a9: Table 的排序把手改为列头里独立的定尺图标钮，不再撑满整个列头、也不再包着列名：列名装进 `column-header` 里新增的 `column-label` 部件，`sort-trigger` 写在列名之后，被推到列头行尾侧与列宽把手并排（两颗并排时只有排序钮吃 `auto` 外边距，列宽把手紧贴其后）；点列头文字不再排序，点钮才排序。

  Headless 新增 `column-label` 部件（anatomy 登记、`getColumnLabelProps()` 只投部件属性、无状态）：列名装进它而不是裸写在 `column-header` 里。列头是 flex 行，裸文本是匿名 flex item、min-inline-size 为 auto 缩不下去，窄列配长列名时定尺的把手（排序 / 列宽 / 列拖拽）连同 auto 外边距一起被挤出列头盒、被 overflow: hidden 裁掉，排序只剩 Tab 可达；皮肤给不了匿名项 min-inline-size: 0 / text-overflow，只有真实节点接得住。同时新增 `TableTranslations.sort(columnLabel)`（默认 `Sort by <列名>`），写成排序钮的 `aria-label`——钮里只剩一枚箭头，名字得自己说清是给哪一列排序的。`role=button`、Tab 位、Enter / Space、按住 Shift 追加排序链、`aria-disabled`、`data-sort` / `data-sort-index` 都不变；`data-xh-action-profile` 由 `row` 改为 `icon`，与展开箭头同款。

  皮肤侧的破坏性变化：排序钮接进五颗把手共用的 16px 方盒（`--xh-table-trigger-size`，comfortable 16 / compact 14），静息透明、悬停 / 按下按表头淡底阶梯换面（200 → 300）并 0.97 缩放；方向箭头从 `::after` 改画在 `:empty::before` 上（作者塞进钮里的图标整个顶掉兜底），尺寸经钮自己改接的 `--xh-icon-size`（公开槽 `--xh-table-sort-size`，缺省与方盒同边长）量；多列排序的序号角标改画在 `::after`，压在钮的行尾上角（rtl 自动换边）；`--xh-table-sort-gap` 槽随撑满列头那套写法一起退役。**列名应放进 `column-label`**（`[data-scope='table'][data-part='column-label']`：`flex: 1`、`min-inline-size: 0`、省略号，列头里唯一可收窄的一格），排序钮、列宽把手与列拖拽把手写在它旁边作为兄弟；不可排序、不可改宽的列也用它。粗指针下多列排序的序号角标补了 `inset-inline-start: auto`，不再被家族热区的行首起点过约束成方盒的一半（两位数序号此前会被截断）。作者自己给 `sort-trigger::after` 写过覆盖、或依赖把列名塞进 `XhTableSortTrigger` / `<span data-xh-part="sort-trigger">` 的标记要按新写法改：列名装进 `XhTableColumnLabel` / `<span data-xh-part="column-label">`、把手在后。

  三端各新增列名部件：Vue `XhTableColumnLabel`、React `XhTableColumnLabel`、Web Components `data-xh-part="column-label"`（CEM 已登记）；文档站全部表格示例与 03-data-page 的列头改为列名装进部件、把手在旁。

- a9f9c2e: TagGroup 现在把标签本体的选择与摘除钮的删除严格分成两个点击边界。摘除钮会先停止 click 向标签行冒泡，再执行 Tag 的删除逻辑；single/multiple 模式下删除已选项只发一次移除后的 `value-change` 与一次 `item-delete`，不会把待删值重新选回。
- 148f500: TextField textarea 的 `autoSize` 现在完整跟随运行期值与配置：程序化写值、`minRows` / `maxRows`
  变化都会重新测量，切为 `false`、改回 input、节点换代或组件卸载时会归还 helper 首次启用前的
  `block-size` 与 `overflow-y` 内联声明，包括各自的 `!important` priority。作者原本没有声明的项
  才会被移除，不再把作者样式一并清空。

  测量与样式读取严格使用 textarea 所属 Document 的 Window，三端适配器共用同一 helper。
  `minRows` 与 `maxRows` 作为原生 rows 同义的行数边界，给值时必须是大于等于 1 的有限整数，
  且 `minRows` 不得大于 `maxRows`；无效配置现在明确抛错并撤销旧量高结果，不再静默沿用旧配置。
  这项约束收紧了已公开的 `TextFieldAutoSize` 数值语义，因此 Headless 按 major 记录。

- 9ec6c65: TextField textarea 的 `autoSize` 现在用所属 Document 内短暂挂载的 textarea 镜像测量内容与单行高度。
  `line-height: normal` 不再退回 `font-size * 1.2` 或固定 `20px`；`minRows` / `maxRows` 会按浏览器
  实际行盒换算。

  量高同时区分 `content-box` 与 `border-box`：内容的 padding-box、块轴内距和边框先换到同一种
  声明尺寸口径再夹取，避免 content-box 重复计入内距、遗漏边框或在 maxRows 处错误开启滚动。
  现有 helper 管理的是纵向滚动，因此当前只接受 `writing-mode: horizontal-tb`；其他书写模式会明确失败
  并归还 autoSize 接管前的内联声明，不再产生轴向错误的高度。

  对已公开量高函数的书写模式约束改为显式拒绝，因此 Headless 按 major 记录。
  Vue 输入部件也改在挂载或更新完成后量高，不会再从尚未接入 Document 的模板 ref 回调读取排版。

- beab157: 修正 Toast 与 HeroUI 原实现的差异：全局服务改为测量真实高度的 Sonner 式堆叠，最新一条置前，后层按 12px 偏移和 0.05 比例收拢，鼠标或焦点进入后展开并暂停整组计时。

  进场从对应视口边缘落入折叠层级，退场沿相同方向移出；堆叠位移、缩放、高度和透明度使用独立过渡。

  Toast 独立皮肤增加真实堆叠、六个落位与三类进退场规则，压缩后体积由 11,650 字节调整为 14,487 字节。

  宽度覆盖槽由 `--xh-toast-w` 更名为 `--xh-toast-inline-size`，默认宽度对齐为 460px。

- e164db0: TreeSelect 的单选、多选、叶子与分支统一使用末端对号表示选中，级联半选显示横线。
  选中正文不再变色或加粗，中性底仅表示悬停和键盘高亮；展开箭头与选择标记独立排布。

  补齐 Vue / React 自动分支结构的 `item-indicator`，Web Components 同一部件按最近叶子或分支接线。
  同步现有三端示例，级联示例使用正式标记部件，移除另外自绘的方框和重复状态判断。
  自定义分支结构应显式加入 `item-indicator`，未提供时不猜测或自动插入作者节点。

  皮肤体积（去注释、压空白）：前一提交源码 21941 字节，当前 21942 字节；登记基线 21941 → 21942，只更新本组件，10% 容差保持不变。

- Updated dependencies [2c2e470]
- Updated dependencies [8cbcd83]
- Updated dependencies [3c49382]
- Updated dependencies [fa08fb4]
- Updated dependencies [fa08fb4]
- Updated dependencies [e72ed26]
- Updated dependencies [317b582]
- Updated dependencies [262f119]
- Updated dependencies [eb33c91]
- Updated dependencies [8f810d8]
- Updated dependencies [dc0d5ea]
- Updated dependencies [121caf3]
- Updated dependencies [e65c6a5]
- Updated dependencies [b2e1edf]
- Updated dependencies [fa08fb4]
- Updated dependencies [c9cf5c8]
- Updated dependencies [c5d69ee]
- Updated dependencies [bdf4028]
- Updated dependencies [6444083]
- Updated dependencies [0e7de3f]
- Updated dependencies [09f8388]
- Updated dependencies [08850a2]
- Updated dependencies [f408efb]
- Updated dependencies [795eaa6]
- Updated dependencies [0dd39b5]
- Updated dependencies [abcb2c1]
- Updated dependencies [80c0cc0]
- Updated dependencies [1fb94ea]
- Updated dependencies [701a791]
- Updated dependencies [785be0a]
- Updated dependencies [3e5079c]
- Updated dependencies [edaa3dc]
- Updated dependencies [cc63f16]
- Updated dependencies [c2ca771]
- Updated dependencies [d013ff2]
- Updated dependencies [a35d0b2]
- Updated dependencies [17e3d21]
- Updated dependencies [92b0a56]
- Updated dependencies [0daae33]
- Updated dependencies [1b713d6]
- Updated dependencies [10c198a]
- Updated dependencies [3490b78]
- Updated dependencies [4b0f2c0]
- Updated dependencies [fa08fb4]
- Updated dependencies [7df7b1a]
- Updated dependencies [c859508]
- Updated dependencies [a880755]
- Updated dependencies [f204269]
- Updated dependencies [dc64383]
- Updated dependencies [1e79021]
- Updated dependencies [99e8787]
- Updated dependencies [270d162]
- Updated dependencies [fa08fb4]
- Updated dependencies [e124792]
- Updated dependencies [74004f7]
- Updated dependencies [33aa758]
- Updated dependencies [6c20a6d]
- Updated dependencies [b908e0e]
- Updated dependencies [740e2e7]
- Updated dependencies [e63a9fd]
- Updated dependencies [8503826]
- Updated dependencies [45e4ab9]
- Updated dependencies [5b8a8fd]
- Updated dependencies [1b63bf3]
- Updated dependencies [216095b]
- Updated dependencies [e2956f1]
- Updated dependencies [66c4abd]
- Updated dependencies [b483c3b]
- Updated dependencies [a2a1be7]
- Updated dependencies [ced9f26]
- Updated dependencies [02de41e]
- Updated dependencies [652936c]
- Updated dependencies [57adc57]
- Updated dependencies [2c5c5ac]
- Updated dependencies [bdbf03c]
- Updated dependencies [49ed6b0]
- Updated dependencies [21bcb16]
- Updated dependencies [921463b]
- Updated dependencies [c7966d3]
- Updated dependencies [9658294]
- Updated dependencies [f070bb8]
- Updated dependencies [249819e]
- Updated dependencies [589d192]
- Updated dependencies [fa08fb4]
- Updated dependencies [441c426]
- Updated dependencies [9a7827b]
- Updated dependencies [fa05663]
- Updated dependencies [9e57b36]
- Updated dependencies [d374f89]
- Updated dependencies [38efe68]
- Updated dependencies [1587d60]
- Updated dependencies [2c2e470]
- Updated dependencies [fc89b39]
- Updated dependencies [c981f41]
- Updated dependencies [ae38d9a]
- Updated dependencies [19570ad]
- Updated dependencies [7e512dc]
- Updated dependencies [09a1a45]
- Updated dependencies [0308154]
- Updated dependencies [ccec02d]
- Updated dependencies [12958c2]
- Updated dependencies [2dd6293]
- Updated dependencies [d822ffd]
- Updated dependencies [3116bd3]
- Updated dependencies [b23b40a]
- Updated dependencies [02713ab]
- Updated dependencies [51f2cbf]
- Updated dependencies [4640530]
- Updated dependencies [31ab5d8]
- Updated dependencies [19570ad]
- Updated dependencies [f0a2e34]
- Updated dependencies [f0a2e34]
- Updated dependencies [19570ad]
- Updated dependencies [009167e]
- Updated dependencies [651befe]
- Updated dependencies [8e35021]
- Updated dependencies [7b187ca]
- Updated dependencies [ce5d75a]
- Updated dependencies [fa08fb4]
- Updated dependencies [4cebbcf]
- Updated dependencies [2cbfb51]
- Updated dependencies [1ff2803]
- Updated dependencies [90564e7]
- Updated dependencies [3480651]
- Updated dependencies [df18553]
- Updated dependencies [5c202e3]
- Updated dependencies [1516b35]
- Updated dependencies [cf2e555]
- Updated dependencies [72ac8eb]
- Updated dependencies [67a4aeb]
- Updated dependencies [d5576cb]
- Updated dependencies [9bf22c1]
- Updated dependencies [147daa4]
- Updated dependencies [ffe0797]
- Updated dependencies [add5b79]
- Updated dependencies [1540cc1]
- Updated dependencies [8b4d452]
- Updated dependencies [d41017b]
- Updated dependencies [36b4098]
- Updated dependencies [2e9ee9d]
- Updated dependencies [fa08fb4]
- Updated dependencies [fee406a]
- Updated dependencies [c60f032]
- Updated dependencies [4fe1897]
- Updated dependencies [affa413]
- Updated dependencies [5982974]
- Updated dependencies [3577e4c]
- Updated dependencies [e59b69d]
- Updated dependencies [294dfa4]
- Updated dependencies [19570ad]
- Updated dependencies [934a51b]
- Updated dependencies [548ef58]
- Updated dependencies [1322aa6]
- Updated dependencies [5226181]
- Updated dependencies [8e6070d]
- Updated dependencies [89b2640]
- Updated dependencies [afcb45b]
- Updated dependencies [8d395ab]
- Updated dependencies [ab984e8]
- Updated dependencies [7640d5c]
- Updated dependencies [8e8d953]
- Updated dependencies [21b006a]
- Updated dependencies [f241bea]
- Updated dependencies [de42a74]
- Updated dependencies [5e2efdd]
- Updated dependencies [c87cc26]
- Updated dependencies [0daae33]
- Updated dependencies [fa08fb4]
- Updated dependencies [ea27877]
- Updated dependencies [714cc99]
- Updated dependencies [c4e10d5]
- Updated dependencies [fa08fb4]
- Updated dependencies [31b54f4]
- Updated dependencies [5f18462]
- Updated dependencies [78ccfcb]
- Updated dependencies [0e5bed0]
- Updated dependencies [66d7ad5]
- Updated dependencies [16f8296]
- Updated dependencies [502ee35]
- Updated dependencies [bd67168]
- Updated dependencies [48d6b88]
- Updated dependencies [f30630d]
- Updated dependencies [fa08fb4]
- Updated dependencies [31ada22]
- Updated dependencies [ab2417c]
- Updated dependencies [2c5c5ac]
- Updated dependencies [9cb1db6]
- Updated dependencies [c6a9c39]
- Updated dependencies [19570ad]
- Updated dependencies [eb1bc18]
- Updated dependencies [0edf9bd]
- Updated dependencies [10dd5f4]
- Updated dependencies [0d35f1a]
- Updated dependencies [6c876c8]
- Updated dependencies [cd74476]
- Updated dependencies [ed347e1]
- Updated dependencies [fa08fb4]
- Updated dependencies [a0ae74b]
- Updated dependencies [4e0aadf]
- Updated dependencies [db52f9b]
- Updated dependencies [8b6b118]
- Updated dependencies [fa08fb4]
- Updated dependencies [592ab23]
- Updated dependencies [0daae33]
- Updated dependencies [0781fa5]
- Updated dependencies [1587d60]
- Updated dependencies [858eac5]
- Updated dependencies [c530797]
- Updated dependencies [1eae644]
- Updated dependencies [1042c06]
- Updated dependencies [f12bee3]
- Updated dependencies [d74e0f2]
- Updated dependencies [82d9e67]
- Updated dependencies [fd6ec65]
- Updated dependencies [ccc453d]
- Updated dependencies [c8790c8]
- Updated dependencies [4abf7a4]
- Updated dependencies [86345b1]
- Updated dependencies [14b9dcd]
- Updated dependencies [fa08fb4]
- Updated dependencies [5d97aab]
- Updated dependencies [3956657]
- Updated dependencies [1774c08]
- Updated dependencies [1f6afdb]
- Updated dependencies [e3abd75]
- Updated dependencies [c13579f]
- Updated dependencies [3f9c145]
- Updated dependencies [bc80c37]
- Updated dependencies [db84441]
- Updated dependencies [4c287eb]
- Updated dependencies [c8790c8]
- Updated dependencies [1f472ba]
- Updated dependencies [d51d182]
- Updated dependencies [1f472ba]
- Updated dependencies [fa08fb4]
- Updated dependencies [4c287eb]
- Updated dependencies [05e809c]
- Updated dependencies [c1ddd60]
- Updated dependencies [6b4c5d0]
- Updated dependencies [674ee88]
- Updated dependencies [f49e42b]
- Updated dependencies [bdbf03c]
- Updated dependencies [19570ad]
- Updated dependencies [c247435]
- Updated dependencies [5bd9ec2]
- Updated dependencies [2c2e470]
- Updated dependencies [680e9a2]
- Updated dependencies [f155ad3]
- Updated dependencies [b81590f]
- Updated dependencies [4b4db79]
- Updated dependencies [8cbf0be]
- Updated dependencies [ed257c8]
- Updated dependencies [36ff669]
- Updated dependencies [80c03ee]
- Updated dependencies [fc0ecaf]
- Updated dependencies [963fe2c]
- Updated dependencies [eabcc37]
- Updated dependencies [07e29f9]
- Updated dependencies [c544218]
- Updated dependencies [b991bb5]
- Updated dependencies [ff3593c]
- Updated dependencies [95ebc66]
- Updated dependencies [4babe65]
- Updated dependencies [6c05da3]
- Updated dependencies [7c5f97f]
- Updated dependencies [cd74476]
- Updated dependencies [dc64383]
- Updated dependencies [80e6fdf]
- Updated dependencies [80bf4c8]
- Updated dependencies [12d3a04]
- Updated dependencies [797a14f]
- Updated dependencies [9c43f67]
- Updated dependencies [655ac38]
- Updated dependencies [2fca91b]
- Updated dependencies [f45e0f7]
- Updated dependencies [2c2e470]
- Updated dependencies [140cf60]
- Updated dependencies [5397ae3]
- Updated dependencies [cd74476]
- Updated dependencies [82b5de5]
- Updated dependencies [842da07]
- Updated dependencies [fa08fb4]
- Updated dependencies [a15f0f3]
- Updated dependencies [e24a3d3]
- Updated dependencies [6ec0c4b]
- Updated dependencies [3ef5a6e]
- Updated dependencies [2962b7d]
- Updated dependencies [8efcd86]
- Updated dependencies [ea9fc5b]
- Updated dependencies [e3abd75]
- Updated dependencies [1f6da9d]
- Updated dependencies [fa08fb4]
- Updated dependencies [ff84284]
- Updated dependencies [7f77bdd]
- Updated dependencies [1ed8f67]
- Updated dependencies [00bca80]
- Updated dependencies [dc64383]
- Updated dependencies [f7cd99b]
- Updated dependencies [690200f]
- Updated dependencies [2fdf721]
- Updated dependencies [30a811b]
- Updated dependencies [3be9407]
- Updated dependencies [297fb1e]
- Updated dependencies [d366e45]
- Updated dependencies [75ec9fb]
- Updated dependencies [995d675]
- Updated dependencies [e6bb853]
- Updated dependencies [f0a2e34]
- Updated dependencies [295d6e0]
- Updated dependencies [f7495fd]
- Updated dependencies [9c32ad7]
- Updated dependencies [498ce78]
- Updated dependencies [42f7f15]
- Updated dependencies [2c5c5ac]
- Updated dependencies [101f8cb]
- Updated dependencies [5ae85a9]
- Updated dependencies [bf75f85]
- Updated dependencies [9a866b2]
- Updated dependencies [a145f51]
- Updated dependencies [ee85e3b]
- Updated dependencies [32142f9]
- Updated dependencies [a316462]
- Updated dependencies [a9f9c2e]
- Updated dependencies [86ce3e7]
- Updated dependencies [3ef5a6e]
- Updated dependencies [61f60de]
- Updated dependencies [fa08fb4]
- Updated dependencies [6922cce]
- Updated dependencies [3ef5a6e]
- Updated dependencies [3ef5a6e]
- Updated dependencies [cb9e315]
- Updated dependencies [148f500]
- Updated dependencies [9ec6c65]
- Updated dependencies [089ef81]
- Updated dependencies [8795555]
- Updated dependencies [8ee8efe]
- Updated dependencies [134dea9]
- Updated dependencies [2ca7fc2]
- Updated dependencies [af55d45]
- Updated dependencies [7cf8734]
- Updated dependencies [0460036]
- Updated dependencies [6b161da]
- Updated dependencies [fb01380]
- Updated dependencies [a16f7f2]
- Updated dependencies [5dfa0f2]
- Updated dependencies [beab157]
- Updated dependencies [0a6b3d2]
- Updated dependencies [9ad1389]
- Updated dependencies [1536143]
- Updated dependencies [252e2d5]
- Updated dependencies [9e47622]
- Updated dependencies [0d7cd38]
- Updated dependencies [d67fd51]
- Updated dependencies [3a3b478]
- Updated dependencies [d642ddd]
- Updated dependencies [00d9c58]
- Updated dependencies [46a5116]
- Updated dependencies [e416596]
- Updated dependencies [54c56f6]
- Updated dependencies [f0a2e34]
- Updated dependencies [8ea0ff8]
- Updated dependencies [db1dc9a]
- Updated dependencies [61773be]
- Updated dependencies [261f03d]
- Updated dependencies [afeb764]
- Updated dependencies [dc64383]
- Updated dependencies [fa08fb4]
- Updated dependencies [3b7a72b]
- Updated dependencies [33c6805]
- Updated dependencies [4f7ac7a]
- Updated dependencies [80f9809]
  - @xihan-ui/headless@2.0.0
  - @xihan-ui/motion@2.0.0
  - @xihan-ui/core@2.0.0
  - @xihan-ui/position@2.0.0
  - @xihan-ui/code-highlight@2.0.0
  - @xihan-ui/backgrounds@2.0.0
  - @xihan-ui/sound@2.0.0
  - @xihan-ui/pointer@2.0.0
