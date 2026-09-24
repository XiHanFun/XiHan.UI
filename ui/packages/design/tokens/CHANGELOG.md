# @xihan-ui/tokens

## 2.1.0

### Patch Changes

- Updated dependencies [1e7bc1d]
- Updated dependencies [abd9e8c]
  - @xihan-ui/core@2.1.0

## 2.0.0

### Major Changes

- cbb844f: 所有带边框的控件盒改成同一条边线、不填底。`--xh-border-control` 在缺省档改为与装饰边界 `--xh-border-default` 同色（浅色 neutral 200、深色 700），输入框壳、Checkbox / CheckboxGroup / Transfer / Tree / Table 的方框、RadioGroup / QuestionFlow 的圆圈、Switch 轨道、InputGroup 组壳、ColorPicker 控件、FileUpload 拖放区、SignaturePad 画布，以及 Action Control `outline` 形态的按钮描边从此与旁边的浮层面板、卡片描边同一重量；`--xh-border-control-hover` 改为 neutral 400 / 550，悬停仍看得出一道台阶。

  字段家族 outline 档与上述控件盒的静息、聚焦、无效、加载态底色由 `--xh-bg-canvas` 改为 `transparent`，露出宿主的面；悬停在透明上罩 `color-mix(--xh-bg-subtle 45%, transparent)`，readOnly / disabled 仍填 `--xh-bg-subtle`。`--xh-bg-canvas` 保留给自动填充遮罩、色块选中环等必须不透明的地方。

  破坏性变化：缺省档的控件边界不再满足 WCAG 1.4.11 的 3:1（浅色 1.26:1），该门槛只在 `data-contrast="more"` / `prefers-contrast: more` 下保持（neutral 600 / 400）；令牌测试相应改为「缺省档与装饰边同色、高对比档 3:1、悬停棘轮」。铺在非白底上的字段不再自带白底，需要白底的宿主请写对应组件的底色槽，如 `--xh-text-field-control-bg: var(--xh-bg-canvas)`、`--xh-checkbox-bg: var(--xh-bg-canvas)`。

- 390fa7a: **退役 glass 材质；M4 elevated 改为不透明的 sheet 实体面。**

  删除 `material.glass` 配方及全部 `--xh-material-glass-*` 令牌（bg、backdrop、border、highlight、shadow、separator、fg、fg-muted、focus-surface），不提供别名，也不把非法值映射为 frosted。材质只保留 solid（M0）、soft（M1）、frosted（M2）、elevated（M4）四档。

  `--xh-material-elevated-*` 改为完全不透明、无背景模糊、无顶部高光，只保留三层高层投影；Dialog 主阅读面与头部 lens 都使用它。BackTop、FloatButton、FloatingPanel 的默认面迁到 `--xh-material-frosted-*`；PromptInput 的默认外壳迁到 `--xh-material-soft-*`。

  破坏性：消费 `--xh-material-glass-*` 的自定义样式必须显式改为 frosted 或实体材质；Dialog 内容不再采样背景。

- c981f41: **形状令牌按设计真源回正为 4 / 8 / 12px 小圆角阶梯，新增 `--xh-shape-circle`，全部组件按家族身份重新归位圆角。**

  `--xh-shape-control` 由 8px 改为 4px，`--xh-shape-surface` 由 12px 改为 8px，`--xh-shape-overlay` 由 24px 改为 12px；新增 `--xh-shape-circle: 50%` 表示正圆身份。`--xh-shape-inset`（4px）与 `--xh-shape-pill` 不变。

  皮肤按家族身份消费形状令牌：Button、ButtonGroup、Toggle、ToggleGroup、Toolbar 条目、Clipboard 复制钮、DownloadTrigger 从胶囊改为 control 4px；Tabs 分段变体的标签带与 Segmented 轨道改为 surface 8px、标签本体 control 4px；字段外壳（TextField、DateField、DatePicker、DateRangePicker、TimeField、TimePicker、TimeRangePicker、Select、ColorField、NumberField、Field、InputGroup）改为 control 4px；Popover、Menu、ContextMenu、Menubar、HoverCard、Popconfirm、Tour、Dialog、Drawer、Notification、FloatingPanel、Select / Combobox / Cascader / TreeSelect / Mention / DatePicker / DateRangePicker / TimePicker / TimeRangePicker / ColorPicker 的浮层内容、NavigationMenu 内容、Pagination 面板、SideNav 弹出面改为 overlay 12px；Card 改为 surface 8px；日历格子改为 inset 4px；Avatar、AvatarGroup 溢出项、BackTop、FloatButton、Carousel 翻页钮与指示点、Spinner、Steps 指示器、Timeline 指示器、Switch 滑块、Skeleton 圆形、QuestionFlow 圆点、IconWrapper、ImageCropper 把手、Slider / ColorSlider / ColorPicker 拇指、RadioGroup 指示器、Log / MessageFeed 回到底部钮、Dialog 指示器改为 circle。Action Control 家族的 floating profile 同样改为 circle。

  破坏性：依赖旧默认圆角的自定义样式与视觉基线需要更新；`--xh-shape-*` 的值改变会影响所有未显式覆盖组件圆角槽的消费者。定位引擎的箭头端距改为对齐 `--xh-shape-overlay`。

- 6b4c5d0: **聚焦环从「画在元素外面」改成「画在元素自己那一圈」。** `--xh-ring-offset` 由 `2px` 改为 `calc(-1 * {ring.width})`，环的外沿与元素边框外沿重合。此前键盘落焦时控件的绘制外沿每边外扩 4px（偏移 2 + 环宽 2）——按钮 54×32 画到 62×40、勾选框 16×16 画到 24×24、sm 档图标钮 28×28 画到 36×36；现在逐档外扩 0px，聚焦前后一样大。

  **库里从此只有一种偏移。** 此前并存五种写法：`var(--xh-ring-offset)`（外扩 2px，30 处）、`calc(-1 * var(--xh-ring-width))`（内收 2px，9 处）、`--xh-_ring-offset: var(--xh-_ring-inset)`（内收 2px，46 处）、`calc(-1 * var(--xh-stroke-thin))`（内收 1px，color-picker 的通道输入框）、`var(--xh-stroke-thin)`（外扩 1px，tags-input 三处）。全部收敛到 `var(--xh-ring-offset)`：46 处槽赋值连同 `--xh-_ring-inset` 一起删除（令牌默认已是内收），其余四种改写成令牌。高对比档与打印档里那些画状态与形状的 outline 不在此列，逐条未动。

  **实心面上的环换成面自己的前景色。** 环画进元素之后压着的是元素自己的面。面是实心品牌底时环色（brand-500）与面（brand-600）只有 1.37:1，贴上去看不出来；这类档在各自皮肤的 `:focus-visible` 规则里把新的私有槽 `--xh-_ring-color` 灌成 `currentColor`，环随之取面自己的前景色——那一族色本来就要在这块面上把字读清楚。34 条规则铺在 31 份皮肤上：`button`/`download-trigger`/`tag`/`tag-group` 的 solid 形态、`checkbox`/`switch`/`toggle`/`toggle-group`/`transfer`/`tree` 的勾选与开档、`calendar`/`carousel`/`pagination`/`time-picker`/`table` 的当前与选中档、以及 approval / editable / form / popconfirm / prompt-input / question-flow / tour / date-picker 的提交类按钮等。公共层只留槽的默认值，名单不收在 `focus.css` 里——谁的面是实心的由那份皮肤自己知道。

  **`heatmap` 的格距不再从环几何推。** 它此前把格距与上下内衬写成 `calc(var(--xh-ring-offset) + var(--xh-ring-width))`，为的是让外扩的环整圈落进格子之间的空当。环不再外扩，这个推导会把格距算成 0，改为直接取 `--xh-space-1`：**取值仍是 4px，渲染逐像素不变**。

  浏览器态判据 `focus-ring-inset-grpring.spec.ts` 逐档量聚焦前后的布局盒与绘制外沿（差 0）、扫随库发出去的样式表确认只有一种偏移、并对 44 个实心面档逐条核对环色与面的对比度不低于 3:1。高对比档（`forced-colors: active`）下环照旧由系统色画出，未受影响。

- afcb45b: 默认控件高度改为 32 / 36 / 40px，紧凑密度改为 28 / 32 / 36px；控件、表面与大表面的
  圆角基准同步调整为 8 / 12 / 16px。浮层箭头端距跟随新的表面圆角更新为 12px。
- 418b713: 浅色主题公共焦点环由 brand-500 提升为 brand-600，保证它压在画布、实体面与浅灰高亮面上均达到 WCAG 3:1 非文本对比。
- 9d0de29: 颜色运行时完整保留十六进制、RGB、HSL 与 OKLCH 的透明度，并新增 `compositeColors` 计算 CSS sRGB source-over 合成。

  `Oklch` 新增必填的 `a` 通道；`formatOklch`、混色、提亮和压暗不再丢失透明度。`relativeLuminance` 与 `contrastRatio` 遇到半透明背景时要求显式提供最终不透明底色，避免玻璃表面的对比度假通过；`contrastRatio` 参数语义明确为前景、背景和可选最终底色。透明品牌种子不再被静默当作实体品牌色。

  `PickColorOptions` 增加 `backdrop`；`pickOnColor` 与 `pickAwayColor` 会在透明背景合成后比较两个候选的真实对比度，不再套用只对黑白候选成立的固定交叉点。

- 80f9809: 新增单一 `VisualEnvironmentController`，统一解析、继承、持久化并投影 mode、brand、density、dir、contrast、motion、transparency 七轴；根作用域可显式注入 motion sink 同步 JS 动效，局部作用域只影响自身 DOM 与 Portal 壳。`createThemeController` 改为七轴控制器的五轴视图，`contrast` 基线由无效的 `base` 更正为 CSS 正式值 `default`，启用 `storageKey` 必须提供 `onStorageError`。

  移除三端 `XhConfig.motion` 隐式全局 override。React/Vue 配置改以带显式 root 的 `visualEnvironment` 绑定接线，Web Components 的全局配置接受同一绑定，`<xh-config>` 直接提供七轴局部 scope；嵌套配置不再污染兄弟树。

### Minor Changes

- fa08fb4: **动作与触发族补能力：三轴铺齐、两个 group 补分隔线与组级禁用、剪贴板补禁用与播报区、按钮补圆角档与标签选择。** 纯新增，公开面一个名字都没删。

  **三轴铺齐。** `toggle-group` 是全族唯一「有 tone 没 variant」的一件，现在补上 `variant`：四档与 `toggle` 一处对一处——未选中那些段的壳与选中那一段用哪一档底都由它定，切换仍由 `data-state='on'` 一条完成。`float-button` 补 `variant` / `tone` / `size`（尺寸缺省与 `lg` 同档，悬浮钮起步就比行内按钮大一号），`back-top` 补 `variant`，`download-trigger` 与 `clipboard` 补 `variant` / `tone` / `size`。五份皮肤同批把颜色改成「使用者令牌 → 私有槽 → 语义令牌」三级：使用者令牌排在形态之前，没写 `data-variant` 时逐值与从前相同。`float-button` 的前景这一支顺带接上语气槽，与 `back-top` 补齐；两颗角落浮钮的按钮块现在逐条同形，`check-family-parity` 立了「角落浮钮族」把它钉住。

  **两个 group。** `button-group` 与 `toggle-group` 各补一个可选的 `separator` 部件（`aria-hidden`，朝向是这条线自己的，与组的排布相反）与 `fullWidth`。`toggle-group` 另补 `hidden-input` 表单出口与 `name`，机器认 `FORM.RESET`，`check-form-reset` 的分母里因此多了一件。插了分隔线之后首末两段不再是 root 的首末子节点，圆角另按元素类型认一遍（条目是原生 `button`，分隔线不是），没有分隔线时与从前逐值相同。

  **组级禁用是真禁用。** `button-group` 补 `disabled`：Vue 侧经注入让组内每颗 `XhButton` 拿到原生 `disabled`，Web Components 侧把 `disabled` 写到组根的每个直接子节点上（作者自己声明的那一份按元素记住首见值，解禁时解得开）。只打 `data-*` 是假禁用——段照样可聚焦、照样派 click。

  **`toggle` 与 `button`。** `toggle` 补 `iconOnly` / `fullWidth` 与三档 `--xh-icon-size`，同一枚图标放进 `button` 与 `toggle` 直径终于一样。`button` 补 `shape`（`rounded` / `pill` / `square`，只换圆角这一个私有槽，不写进尺寸档）与 `as`（`button` / `a`，写成 `a` 时不再产出 `type` 与原生 `disabled`，禁用改由 `aria-disabled` 表达、点击仍被拦下），官方示例里那份「往 `<a>` 上手抄 `data-scope` / `data-part`」的写法可以退休了。

  **`clipboard` 与 `download-trigger`。** `clipboard` 补 `disabled`（守卫在机器层，作者调 `api.copy()` 也绕不过去）、`copy-trigger` 的 `indicator` 补上 `aria-hidden`，并新增一个可选的 `status` 部件：`role="status"` + `aria-live="polite"` 的视觉隐藏播报区，不给内容时念 `translations.copied`——在这之前，复制成功对读屏用户是零反馈。`ClipboardTranslations` 与 `DownloadTriggerTranslations` 从空接口立起来（`copy` / `copied`、`trigger`），两处的可及名都只在作者给了文案时才产出，不凭空盖掉按钮上的可见文字。`download-trigger` 另补兜底字形，新增令牌 `--xh-glyph-mark-download`。

  体积：`clipboard.css` 5630 → 9144 字节、`download-trigger.css` 3143 → 6914 字节，涨的全是四档形态与两档尺寸的槽赋值，与 `button.css` 同形。

- 317b582: **新增**入场缓动令牌 `--xh-motion-ease-enter-strong`（原语 `--xh-ease-out-strong` = `cubic-bezier(0.23, 1, 0.32, 1)`）。位移与高度变化走这一条：起步快、收尾长，比 `--xh-motion-ease-enter` 看得清。JS 侧同值常量 `easing.outStrong` 一并加上，两边由门禁对账。

  **新增**正文行高令牌 `--xh-text-prose-leading`（原语 `--xh-leading-relaxed` = 1.625）。成段正文此前与控件文字共用 1.5 一个值。

  **新增**兜底字形令牌 `--xh-glyph-mark-arrow-up`。此前只能借语义不对的 `--xh-glyph-mark-sort-asc`。

  **修复** `code-view` 的行号被染成语法数字色。`--xh-code-view-number-fg` 一个名字被行号与数字记号两处消费，根上给它赋了语法色之后行号跟着变色。语法记号改用 `--xh-code-view-number-token-fg`，行号那个名字的语义不变。

  **修复** `prompt-input` 发送按钮禁用态的字底对比度（浅色 1.96:1、深色 2.08:1）。禁用时底色仍是品牌色而只把字变灰，现在底色一并降到 `--xh-bg-muted`。

  **修复** AI 族八处按下缩放是硬切。`approval` / `code-view` / `diff-view` / `message-feed` / `prompt-input` / `reasoning` / `tool-call` 的可点部件此前只声明了 `:active` 的缩放量、没有把 `scale` 写进 `transition`，按下与松手都不过渡；同批补齐悬停与描边的过渡。

- 4b058b2: **品牌淡底改为 12% 拼色，并补上淡底前景令牌。** `--xh-bg-brand-subtle` 不再取 brand-100 / brand-950 原语，改为 `color-mix(in oklab, var(--xh-bg-brand) 12%, var(--xh-bg-surface))`，与 `-hover`（20%）、`-active`（28%）和语气层 `--xh-_tone-subtle` 落在同一条曲线上：写 `data-tone='brand'` 与不写语气从此是同一块面。浅色由 L 0.936 提到 0.946，深色由 L 0.282 降到 0.258，肉眼是「更淡一点」。

  新增 `--xh-fg-on-brand-subtle`，与 `--xh-_tone-fg` 同式（品牌色往正文色兑到 60%），压淡底 12 / 20 / 28 三档浅色 8.49 / 7.60 / 6.78、深色 7.41 / 6.67 / 5.93。此前皮肤在 `--xh-fg-brand`（压淡底 4.33）与 `--xh-fg-brand-strong`（压按下面 4.42）之间各自取用，两者都够不到 4.5；皮肤切换到这支令牌在后续提交逐组件进行。

- fb3b186: **日历的大步翻那对钮补上兜底字形，组合框的清空钮改为顶替展开钮那一格。**

  **`calendar` / `date-picker` 的 `prev-year-trigger` / `next-year-trigger` 此前不写内容就是空钮**，示例里只好手打 `«` `»` 两个字符顶着——它们随字体走，与旁边由图标画出来的单步翻那对不是一套东西。现在两颗不写内容时由皮肤画双箭头，与单步翻的单箭头同一把尺、同一副着色；作者往里塞了自己的图形照旧让位。新增字形令牌 `--xh-glyph-mark-chevrons-left` / `--xh-glyph-mark-chevrons-right`，在任意子树上重声明即可换图。示例里的 `«` `»` 已删掉，写成自闭合部件即可。

  **`combobox` 的清空钮此前与展开钮并排堆在盒里**：有值时两枚图标挨着，用户分不清点哪个；清空钮出现与收起还会让盒的宽度跳一下（没定宽的盒尤其明显，多选每并入第一个值就撑宽一截）。现在与 `select` / `cascader` / `tree-select` 同一套契约——盒里有一颗没收起的清空钮时展开钮让位，两颗互斥显示、始终只占一格，盒宽不随有没有值变动。判据是盒里此刻真有一颗没收起的清空钮：没写清空钮的结构里展开钮照常留着。展开的入口不变，仍是输入框（打字、方向键、`openOnClick`）。

- c859508: **新增** `code-view` 组件：一段代码的逐行呈现，Vue 与 Web Components 两侧同时可用。

  它比 `code-block` 多出行号、指定行高亮、超长折叠与文件名四件，而这四件都建立在同一件事上——**逐行切分在连接层完成**。词法器是单趟不回溯的，一个记号可以横跨多行（未闭合的字符串与块注释就是这样），所以「一个记号一个 span」的渲染方式切不出行；行号与高亮行不是皮肤能反推出来的东西。切分保证无损：`lines.map(l => l.text).join('\n')` 逐字等于原文，着色实现即使给不全记号也用纯文本片段补齐。

  `lineNumbers` 的行号由皮肤用 `attr()` 画出来，因此**复制代码不会带上行号**，读屏也不会逐行念数字。`startLine` 让摘录与 patch 片段的行号对得上真实文件，`highlightLines` 收 `'3,7-9'` 或行号数组，写错的片段丢掉而不是让整段代码渲不出来。

  `clamp` 给出折叠阈值，`clamped` 是**纯受控**的：折叠态通常由页面上「全部展开 / 全部折叠」统一持有，组件内建一份只会跟它打架；要非受控就套 `collapsible`。折叠按钮带 `aria-expanded` 与指向代码区的 `aria-controls`。

  `complete` 与 `highlighter` 沿用 `code-block` 的取舍：未闭合默认不着色，着色端口返回 `null` 是合法结果、退回纯文本。渲了文件名节点它就成为代码区的可访问名，没渲则用 `translations.code` 兜底。复制不内建，与 `clipboard` 组合。

  **新增** 语义令牌 `--xh-text-code-leading`：代码行距从此有名字，`code-block` 与 `code-view` 都指向它，不再各写一份字面量。

- fa08fb4: **数据展示族补能力：描述列表补跨列、统计数补涨跌、时间线补坐标列、JSON 视图补空态、树与 JSON 视图补形态轴、无限滚动补取下一页的按钮。** 纯新增，公开面一个名字都没删。

  **描述列表的跨列。** `descriptions` 的 `getItemProps` 从零参改成收一个可选的 `DescriptionsItemProps`（`{ span?: number }`），产出 `style.gridColumn`；`span` 钳在 1 与当前 `columns` 之间——跨出网格的格子会另起一行，比截断更难看。旧的零参调用照样成立。Vue 侧 `XhDescriptionsItem` 补 `span` prop，Web Components 侧从格子自己的 `span` 特性上读。

  **统计数的涨跌。** `statistic` 补 `trend` 部件与 `trend` prop（`up` / `down` / `flat`），方向落成部件上的 `data-direction`，皮肤据它出兜底箭头——示例里不必再手打箭头。`trend` 与 `tone` 保持正交，方向与颜色互不联动：跌也可以是好事（差错率、退货率），要不要联动由作者自己定。新增令牌 `--xh-glyph-mark-arrow-down`（`arrow-up` 与 `minus` 早已在册）。

  **时间线的坐标列。** `timeline` 补 `label` 部件：与内容对置的那一列，装这一条的日期或版本号。竖排三种侧别各给它一条轨道——结束侧占线之前那列、起始侧占线之后那列、逐条交替时恒在内容对面，时间戳因此不再跟着内容左右横跳。`time` 留在 `content` 里不动，两者语义不同：`label` 是这一条的坐标，`time` 是内容的一部分。横排不为它单开轨道。

  **JSON 视图的空态。** `json-viewer` 补 `empty` 部件与 `api.isEmpty` / `api.emptyText`：一行也摊不出来时（`value` 没给或给的是 `undefined`）由它说话，有行可摊时组件给它打 `hidden`。文案走新增的 `translations.empty`（缺省 `No data`），Vue 侧另有一个 `empty` 插槽，Web Components 侧由元素铺兜底文案。**这一件会改 DOM**：两个适配器都会在根里多渲一个 `[data-part='empty']` 节点，有数据时它带 `hidden` 不占位置；写了 `:last-child` 一类结构选择器的使用者要复核。

  **两条形态轴。** `tree` 与 `json-viewer` 各补 `variant`（`'plain' | 'surface'`），落成根上的 `data-variant`。**缺省是 `surface`，逐值与从前相同**；`plain` 是新增档，边框留着但转成透明——去掉外框不会让行的位置跳一格。皮肤同批把那两条边框与底色的声明改成「使用者令牌 → 私有槽 → 语义令牌」三级，使用者写的 `--xh-tree-border` / `--xh-json-viewer-bg` 仍排在形态之前。

  **无限滚动的键盘等价通路。** `infinite-scroll` 补 `load-more-trigger` 部件：一颗真按钮，点它与哨兵进可视区走同一段（机器新增 `LOAD` 事件，取数中与关掉两段同样不响应），按钮在这两段自动 `disabled` 并带 `data-loading` / `data-disabled`。读屏在虚拟光标模式下不产生滚动事件，只靠哨兵那条路取不到第二页——这颗按钮是它的等价入口。**文案由作者写在按钮里，组件不代填可及名字**：写死一句英文会与可见文字对不上，读屏念的与眼睛看的就分了家。部件是可选的，不写它的页面 DOM 一字不变。文档首段同批改口径：本组件是「取下一页」的通用触发器，滚动只是默认的触发方式。

  体积（去注释压空白后）：`statistic.css` 2190 → 3559 字节、`timeline.css` 9561 → 11643 字节、`json-viewer.css` 7740 → 8710 字节、`tree.css` 13253 → 13455 字节、`infinite-scroll.css` 447 → 2123 字节；`descriptions.css` 未动。涨的是新增部件的排版块与两条形态轴的槽赋值。

- 38efe68: 修复日期时间选择器的完整分段显示，统一清空按钮与选择图标的互斥状态，并为字段聚焦、日历按压和组件内部滚动补齐一致的反馈。
- fa08fb4: **日期与时间两家的展开钮换成日历与时钟字形，日历的翻页箭头在 RTL 下对调，时刻段补上触屏手势与内衬槽。**

  **`date-picker` / `time-picker` 的 `trigger` 此前不写内容画的都是向下的尖角**，与 `select` / `combobox` / `cascader` 的展开钮长得一模一样——一排表单控件摆在一起，哪个开出来的是日历、哪个开出来的是时刻列表，只能靠盒里的文字猜。现在两家各画各的：日期那颗是日历，时刻那颗是表盘。新增字形令牌 `--xh-glyph-mark-calendar` / `--xh-glyph-mark-clock`，在任意子树上重声明即可换图，置 `none` 就是「这里我自己放节点」；作者往部件里塞了自己的图形照旧让位。

  **`calendar` 的四颗翻页钮此前在 `dir="rtl"` 下指错方向**：月份从右往左排，箭头却仍按从左往右的页序画。现在四颗按 `dir` 分支对调 —— 单步的 `prev-trigger` / `next-trigger` 与大步的 `prev-year-trigger` / `next-year-trigger` 都跟着行进方向走。只在不写内容时命中，作者自己放的图形不受影响。

  **`time-field` 的 `segment` 补两条与 `date-field` 对齐的声明**：`touch-action: manipulation`（此前触屏上连点两段会被当成缩放手势），以及内衬槽 `--xh-time-field-segment-py`（此前竖向内衬写死为 0，改不动；默认值仍是 0，不写就与现在一模一样）。

- ca8156d: **统一点击触感：按下 120ms 进入 active 面并缩到 0.97，释放 200ms 回到 hover / rest；禁用同时降级前景与表面，不再只降低 opacity。**

  令牌新增 `--xh-motion-duration-press`（120ms）、`--xh-motion-duration-release`（200ms）、`--xh-motion-ease-press`（standard）与 `--xh-motion-ease-release`（out-strong），减弱动效档两段时长归 1ms。

  Action Control 家族配方的 rest 规则改为 `scale` 走 release 段，`:active` 规则追加 press 段的时长与曲线；Collection Item 家族配方的换面同节奏，`:active` 只改时长与曲线，不缩放整条。所有手写按压反馈的皮肤（83 处 rest 过渡、91 处 `:active` 规则）统一接入同一时间线；`segmented` 删除私有的 `--xh-segmented-item-press-scale` 槽，按压缩放一律走 `--xh-motion-scale-press`。

  Action Control 家族的 disabled 状态改为 `--xh-bg-subtle` + `--xh-fg-disabled` 且 opacity 为 1；Button 不再为 solid / 默认变体保留品牌底的禁用面，outline / ghost 变体禁用时保持透明底；Toggle 新增 `--xh-toggle-bg-disabled` / `--xh-toggle-fg-disabled` / `--xh-toggle-border-disabled` / `--xh-toggle-bg-on-disabled` / `--xh-toggle-fg-on-disabled` 槽，选中且禁用时底色掺一半中性面；Accordion 与 Collapsible 的禁用触发器改为 `--xh-accordion-trigger-fg-disabled` / `--xh-collapsible-trigger-fg-disabled`。

  破坏性：`--xh-segmented-item-press-scale` 被删除；按钮与切换按钮的禁用外观由淡化品牌面改为中性面。

- ccec02d: **新增** `diff-view` 组件：一份改动的逐行呈现，单栏与并排两种形态，Vue 与 Web Components 两侧同时可用。

  **两个入口归一到同一个模型**：`computeTextDiff(before, after)` 拿新旧两版全文算（Myers 最短编辑脚本），`parseUnifiedPatch(patch)` 解析统一格式的补丁；组件只认模型，两种输入在 AI 场景里都真实存在。另导出 `diffStats(model)` 数增删。

  **着色在建模时一次算好，不在连接层跑。** `computeTextDiff` 手里有两份完整文本，整体切一次再按行取，跨行的块注释与多行字符串才不会着错色；`parseUnifiedPatch` 拿不到完整文件，因此**一律不填着色**——宁可不着色也不错着色，与代码视图「未闭合默认不着色」是同一条取舍。

  `maxLines` 是必须有的上限：AI 会吐超大文件，超出即截断并在根上标出来。编辑距离超过内部上限时整段按「全删全增」呈现——那种情况下两份文本几乎没有共同行，逐行对齐既算不快也读不出意义。

  表格语义完整：`role=table` 配 `role=row` 与 `role=cell`，带 `aria-rowcount` / `aria-rowindex` / `aria-colcount` / `aria-colindex`。**列数只数真正暴露的内容列**——行号不算列，它不给 role、对读屏隐藏、由皮肤用 `attr()` 画出来，所以复制差异不会带上行号。并排视图里空的那一侧**照发格子**，否则列号会串位。每一行都带一段视觉隐藏的变更类型文字：变更不能只靠颜色传达。

  **刻意不采表格那套行级 roving**：只读差异不是网格，给每份差异一个吞方向键的焦点组会把页面滚动抢走，而读屏本来就有表格浏览模式。整份差异只占一个 Tab 停靠点。

  `contextLines` 把远离变更的连续上下文折成一格，展开集合可受控。

  **新增** 语义令牌 `--xh-diff-added-bg` / `--xh-diff-added-fg` / `--xh-diff-removed-bg` / `--xh-diff-removed-fg`：增删两色随主题明暗切换。

- 0f2072f: Editable 改为与 NumberField 一致的一体式字段结构：标签在上，`control` 是唯一的边框、背景、圆角、落影与焦点环载体，预览文字或输入框与动作组都位于框内。预览态只显示编辑图标，编辑态只显示确认与取消图标；空按钮由共享皮肤使用 Pencil、Check、Close 字形绘制，作者仍需提供可访问名称。

  Breaking：字段表面覆盖槽从 `--xh-editable-input-*` 迁移为 `--xh-editable-control-*`；独立按钮边框、圆角和实心提交按钮相关槽已移除，动作尺寸与分隔线改用 `--xh-editable-trigger-size`、`--xh-editable-trigger-divider` 和 `--xh-editable-trigger-divider-h`。

  新增一体式字段排布、三颗图标动作、粗指针命中区与状态样式后，`editable.css` 的去注释压空白体积由 10,386 字节增至 13,335 字节。

- 7b187ca: **四档投影从纯黑单层改成中性色三层，装饰性边界跟着退一档。**

  **投影。** `--xh-shadow-sm` / `-md` / `-lg` / `-xl` 与它们之上的 `--xh-elevation-raised` / `-lifted` / `-floating` / `-sheet` 此前是一到两层纯黑（`oklch(0 0 0 / a)`）。纯黑压在带色的底上会把底色往灰里抽，单层又只有一个模糊半径，抬起的东西看着是"贴了一块灰"而不是"浮起来"。现在每档三层，各管一件事：贴边层（偏移 1–2px、模糊 1–4px）画出面与底的交界，主层给出方向，环境层（模糊 6–64px、大收缩）铺开大范围的暗。浅色档的投影色换成中性色阶最暗那一档的色相与彩度 `oklch(0.145 0.005 258)`；深色档留在纯黑——中性色阶最暗的一档比页面底还亮，拿它当投影压不出任何深度。

  四档的取值：

  | 令牌                      | 浅色档                           | 深色档                                                              |
  | ------------------------- | -------------------------------- | ------------------------------------------------------------------- |
  | `--xh-elevation-raised`   | `{shadow.sm}`，主层 4%/环境层 3% | 三层黑 0.4 / 0.36 / 0.3，末尾 `inset 0 1px 0 0 oklch(1 0 0 / 0.05)` |
  | `--xh-elevation-lifted`   | 逐层落在 raised 与 floating 中间 | 同左，另带 6% 的内顶高光                                            |
  | `--xh-elevation-floating` | `{shadow.md}`                    | 三层黑 0.5 / 0.45 / 0.4，另带一圈 `0 0 0 1px oklch(1 0 0 / 0.06)`   |
  | `--xh-elevation-sheet`    | `{shadow.lg}`                    | 三层黑 0.6 / 0.5 / 0.45，另带一圈 8% 的描边                         |

  深色档四档末尾都带一条浅色描边把面的上沿提出来。`raised` 与 `lifted` 那条写成 `inset` 且只画上边缘、不绕四周：这两档落在自带 `--xh-border-control` 的输入框壳与自带 2px 描边的滑杆拇指上，绕一圈会与那条描边并成相距 1px 的两道线。

  **装饰性边界不动。** `--xh-border-default` 浅色留在 `neutral.200`、深色留在 `neutral.700`。本轮曾把浅色退到半档试图与更讲究的投影配对，但那一步要把令牌层的对比度棘轮从 1.26 调低到 1.22 才成立，而它原本的理由（给同批的大圆角与重投影做对价）随大圆角被否掉一并消失；深色侧同样过不了——往下的半档 `neutral.750` 与 `--xh-bg-subtle` 只差 1.04，热力图格子的描边落到那一档就与空格的底连成一片。两档都维持原值，棘轮仍钉在 1.26。

  **新增一支中性阶。** `--xh-color-neutral-750`（`oklch(0.28 0.006 258)`），给深色档的 `--xh-bg-surface-raised` 用：它此前与 `--xh-bg-subtle` 逐值相同，深色下悬停的亮度差是 0，看不出来。取值上界由深色档次要文字压得住这一档来定——这一档上 `--xh-fg-subtle` 是 4.51，再亮 0.005 就掉到 WCAG AA 的 4.5 以下。

  圆角一档没动：`--xh-radius-*` 与 `--xh-shape-*` 全部维持原值。既有令牌名一个没删、没改名。

- 2c2e470: **补齐**两处按钮的兜底字形。这两个部件的解剖里都没有第二个节点放图形，皮肤又没画，渲染出来是摸得着却看不见的空盒：`sortable` 的 `item-drag-trigger` 是一块透明方块、`floating-panel` 的 `window-state-trigger` 是标题栏上并排的两三个一模一样的空方块。名字只在 `aria-label` 上，看得见的那一路什么都没有。

  - `sortable` 的 `item-drag-trigger` 画两条竖线的抓手，与 `tabs` 的 `tab-drag-trigger`、`table` 的 `column-drag-trigger` 同一种画法（`:empty::after` + `border-inline`）。新增覆盖槽 `--xh-sortable-drag-grip-w` / `--xh-sortable-drag-grip-h`。
  - `floating-panel` 的 `window-state-trigger` 按 `data-target-window-state` 分三档：还原、铺满、收拢各一枚。选的是 `data-target-window-state` 而不是面板身上的 `data-window-state`——后者说的是面板此刻在哪一档，用它会让并排的几颗钮同时换成同一枚字形。

  **新增**两个字形令牌 `--xh-glyph-mark-maximize`（四角朝外）与 `--xh-glyph-mark-restore`（四角朝内），供上面那三档使用；「收拢」复用已有的 `--xh-glyph-mark-minus`。

  示例侧同步删掉手打的字符：`sortable` 四份示例里的 `⠿`、`floating-panel` 三份示例里的 `—` 与 `▢`。它们是缺兜底字形时的权宜之计，皮肤补上之后留着反而会把兜底顶掉。

- 622a825: 单行字段不传尺寸时一族同宽：新增语义令牌 `--xh-control-w`（16rem），下拉、日期、时间、文本、数字、密码、颜色、标签、提及、就地编辑、剪贴板等 18 份字段皮肤的根缺省 `inline-size: var(--xh-<组件>-control-w, var(--xh-control-w))`，宽度不再随内容走（此前只有 12rem 地板，实际宽由原生输入的字宽、选中项文字或示例内联样式决定，同一页里 192 到 480 不等）。地板改写成 `min(缺省宽, --xh-<组件>-control-min-w, 100%)`：把缺省宽钉到底线以下时不必再放开底线。

  日期范围选择器是登记过的例外：起止两组按日的段位、分隔符与日历钮放不进 16rem，缺省按内容撑开（`--xh-date-range-picker-control-w` 仍可钉宽），地板取 `--xh-control-w`，按年、按月时不比别的字段窄。Clipboard 只放复制钮的用法仍是一颗独立按钮。

  破坏性变化：字段根不再随内容变宽，要撑满表单列请在根上写 `inline-size: 100%`；Clipboard 的 `--xh-clipboard-input-min-w` 移除，改为根上的 `--xh-clipboard-control-w` 与 `--xh-clipboard-control-min-w`，输入框改为撑满复制钮之外的剩余宽度。

- df18553: 统一日期、时间、文本、数字与通用表单字段的默认视觉盒，并将日期区间选择的默认日历面板收为单栏。
- 3990795: **增加 M2 Frosted Surface 的 compact 光学尺度，供 Tooltip 等高遮蔽小浮层使用。**

  新增 `alpha.ultra-high = 0.94` 原语，以及 `material.frosted.compact-alpha`、`material.frosted.compact-backdrop`、`material.frosted.compact-shadow` 三支公共配方。内置六种 tone 与默认反白面在纯黑、纯白、灰色、页面底和品牌色底上验证，0.94 均达到 4.5:1 正文对比；0.88 与 0.92 仍存在失败组合。

  compact backdrop 使用 8px blur 与 104% saturation；compact shadow 在亮暗主题分别定义两层小浮层投影，最大范围由标准 M2 的 28px 收到 16px。高对比、forced-colors 与打印把 alpha/backdrop/shadow 切到 opaque/none/none；减少透明把 alpha/backdrop 切到 opaque/none，并保留主题对应的小浮层投影。

  本配方只补紧凑表面的 alpha、backdrop 与 shadow，不复制现有 M2 的背景、边界、前景、高光、分隔和焦点表面。组件仍须从完整 M2 配方组合其余语义，不能直接读取 blur 原语。

- ab984e8: ToggleGroup 默认外观改为浅色胶囊分段控件，选中项使用品牌淡底；`solid` 继续提供强品牌选中态。组内按压不再缩放，分隔线改为覆盖接缝的半高细线。

  ButtonGroup 与 ToggleGroup 的 `outline` 改由组根绘制一条连续外框，子项不再各自绘制贯穿全高的边框；组内仍使用半高分隔线。

  移除 `--xh-toggle-group-separator-inset` 与 `--xh-toggle-group-separator-gap`，新增 separator size、opacity 与 disabled opacity 覆盖槽。

  ButtonGroup 与 ToggleGroup 默认自动生成相邻项分隔线，并新增 `separators` 属性控制显示。移除 `XhButtonGroupSeparator`、`XhToggleGroupSeparator` 及对应 Headless separator 部件与 connect API；分隔线改为适配器内部结构，不再要求作者手工维护。

  Button、ButtonGroup、Toggle 与 ToggleGroup 皮肤增加浅色/深色交互状态、连续外框和自动分隔线规则；同步更新 CSS 体积基线。

  视觉环境控制器迁入 Core，适配器不再硬依赖 Tokens；`@xihan-ui/tokens/runtime` 保持原导出入口。

- fa08fb4: **新增**布局与滚动族的能力补齐（滚动区的边缘渐隐单独一份变更集）。全部是加法，缺省档逐值等于改动前。

  **拖动能撤销了**。`splitter` 新增 `DRAG.CANCEL` 事件，拖动态在文档上听 Escape：按下即把布局退回按下那一刻的快照，`onSizesChangeEnd` 不发。`resizable` 的 `resizing` 态挂同一条通路，Escape 走既有的 `RESIZE.CANCEL`，尺寸与位移一起退回。两条键盘表各多一行 `cancel`。此前拖过头只能再拖回去猜原值，而错值已经发出去了。

  **骨架有名字了**。`splitter` 立 `SplitterTranslations { root, resizeTrigger(index, total) }`，根与每条分隔条从此各带一个 `aria-label`（兜底 `Split panels` / `Resize panel N`）。多条分隔条对读屏不再是一串同名盒子。Vue 侧接 `withXhConfig('splitter')`，Web Components 侧收 `translations` property。

  **拖动排序看得见落点**。`sortable` 新增 `drop-indicator` 部件：拾起时机器记下容器原点，连接层按当前落点算出那条缝并写进内联 `transform`，落点回到起点即 `hidden`。竖排画横线、横排与换行网格画竖线。换行网格里两个方向的项都在动，此前看不出会落到哪一格。同批把 `item-drag-trigger` 的禁用从 `aria-disabled` 改为**同时**发 `data-disabled`（`aria-disabled` 原样保留），全局 `[data-disabled]` 规则从此命中得到它。

  **侧栏会自己收了**。`layout` 新增 `siderBreakpoint`（`sm` / `md` / `lg` / `xl`，落根上的 `data-sider-breakpoint`）：没达到那一档时侧栏按折叠宽显示；同时发 `onSiderBreakpoint({ matched })`，宿主据此换成抽屉。断点像素值现读 `--xh-breakpoint-<档>` 令牌，JS 里不另抄一份。

  **栅格接得住真实版面**。`grid` 新增 `rows`（显式行轨道）、`minColWidth`（四档，走新令牌 `--xh-layout-col-min-xs|sm|md|lg`，皮肤改用 `repeat(auto-fill, minmax(…, 1fr))`，从此做得了「卡片最小 N，放得下几列就几列」）、`rowGap` / `columnGap`（排在 `gap` 档位之后取胜）。`span` 与 `offset` 另外收断点对象：

  ```vue
  <XhGridRoot :cols="{ base: 1, md: 2, lg: 3 }">
    <XhGridItem :span="{ base: 1, lg: 2 }">…</XhGridItem>
  </XhGridRoot>
  ```

  窄屏收成一列时 `span=6` 那一格不再溢出。两个适配器都收 JSON 串写法。

  **未做**：拖起态的观感调整、分隔条的抓手字形、瀑布流的换档动效——三条都是视觉/动效条目，且后者依赖「列与项交给作者持有」那次结构变更。

- a0ae74b: **新增** `markdown-stream` 组件：把已经渲好的 Markdown 块列表投影成带稳定 key 的正文结构，Vue 与 Web Components 两侧同时可用。

  它把 `@xihan-ui/markdown` 这个一直没有消费方的流式渲染内核接到了组件层上。**组件不解析 Markdown，也不持有渲染器**：块列表由宿主调 `createStreamRenderer().render(全文)` 得到后传进来——渲染器是有状态的，做成组件的 prop 会诱导使用者共享一个实例、每帧把整张缓存作废。

  块的 `key` 是稳定的：生长中的那一块 key 恒定，定型的块 key 不再变化。两个适配器都按 key 逐条比对复用节点，只有真正在长的那一块每帧重渲——整表重铺会把已定型的块连同用户正在拖的选区一起弄没，而稳定 key 正是为了避免这件事。

  **`html` 只对 markdown 块有效**，这条契约写在类型上：代码块与公式块拿 `source`（未转义的正文原文）交给 `code-view` 或宿主自选的公式引擎，照 `html` 渲会让同一段代码出现两次。没人接管时把原文当正文显示，这个降级是明写的，不是意外。

  流式光标是皮肤的 `::after`，挂在带 `data-live` 的那一块上，减弱动效时停在实心不闪。正文不套 role、也不做成活区——每来一个 token 播报一次会把读屏刷爆；要在一段回复写完时念一句，把 `announce` 设成 `polite` 并渲出播报区。

  **新增** 语义令牌 `--xh-caret-duration`：文本光标闪一次的周期。

- 28bc87c: 增加 M4 高层玻璃完整材质配方，包含浅深主题、高遮蔽正文区、三层模态投影与焦点隔离底；高对比、减少透明度、打印和强制色均提供同名降级配方。
- b07abfc: **新增 M2 Frosted Surface 材质令牌，以及材质共用的 alpha 与 blur 阶梯。**

  新增 `--xh-material-frosted-*` 九支完整配方：半透明 tint、固定 backdrop、边界、顶部高光、两段浮层投影、分隔线、不透明正文、不透明次要正文和焦点隔离面。浅色与深色分别定值；默认 tint 使用 `--xh-alpha-high`，backdrop 固定为 `blur(--xh-blur-md) + saturate(108%)`。滤镜不参与动效，也不通过 `will-change` 常驻合成层。

  新增五档 `--xh-alpha-*` 与七档 `--xh-blur-*` 原语，供 M2 ～ M4 材质配方统一消费。组件不得直接挑 alpha 或 blur 档；锚定浮层、导航等实际表面只读取材质令牌，页面根、表单、表格和长正文不会因此启用背景采样。

  系统要求减少透明时，M2 在原作用域换成实体 surface 并关闭 backdrop；`forced-colors` 使用 `Canvas` / `CanvasText` 且关闭滤镜、投影；打印时同样实体化并取消高光与投影。三条路径保持原尺寸、层级和交互语义，不建立第二套组件结构。

  正文、次要正文与焦点隔离面均保持不透明，并按纯黑、纯白、中灰、页面底和品牌色等最不利背景合成后验证对比度。具体组件仍需真正绘制 `focus-surface`，只声明令牌不算完成焦点合同。

- f247580: 增加 M3 浮动玻璃完整材质配方，包含浅深主题、独立不透明前景、两段阴影和焦点隔离底；增强对比度、减少透明度、打印和强制色均有明确实体配方。

  修复主题与对比度位于不同祖先时的继承：最近主题与最近对比度共同生效，子主题不会撤销高对比度，可显式设置 contrast=default 恢复常规档。

- 6135250: 建立 M0-M4 材质配方生成真源，将 tint、背景光学、边缘、高光及分层阴影编译为统一令牌，并补齐 M0 实体材质与强制色输出。
- adb91cb: **新增 M1 Soft Surface 完整材质令牌，作为 Card 等内容容器的统一视觉入口。**

  新增九支 `--xh-material-soft-*` 令牌：实体背景、backdrop、边界、顶部高光、接触影、分隔线、正文、次要正文和焦点对比表面。浅色与深色分别定值，不通过反色推导；背景保持完全不透明，`backdrop` 为 `none`，柔和层次由细边、单条顶部高光和最低一档接触影组成。表单、表格与长正文不会因这组令牌被玻璃化。

  `data-contrast="more"` 在当前作用域重新声明边界、分隔线并取消装饰高光，避免根上已经解析的别名穿不过嵌套视觉轴；打印档取消 M1 的高光与接触影。正文、次要正文与焦点环均按最终 M1 表面校验对比度。

  本次只建立材质合同，不改变任何组件默认皮肤。组件迁移会按 Card、Popover、Dialog 分别提交，避免令牌新增与组件视觉变化混成一个无法单独回滚的提交。

- 4e0d857: **新增**连续缓动令牌 `--xh-motion-ease-continuous`（原语 `--xh-ease-standard` = `cubic-bezier(0.2, 0, 0, 1)`）。此前语义层只有 `-enter` / `-enter-strong` / `-exit` 三档，描述的都是元素与视口的进出关系；循环动画没有起终点，被推到新位置的元素起终点又都在屏内，两类都不属于进出，于是只能下探到原语。这一档说的是「两端都在屏内」这层关系：起步就带速度，收尾再减速。

  `segmented` 的滑块位置过渡与 `table` / `skeleton` / `progress` 的循环动画共 7 处，从直引 `--xh-ease-standard` 改走这一档。取值同源，视觉零改动。

  JS 侧不动：`@xihan-ui/motion` 的 `easing.standard` 就是同一条原语，两边由门禁对账。

- 8bbead4: **新增**循环缓动令牌 `--xh-motion-ease-loop`（恒是 `linear`）。无限循环的动画——加载环、流光、跑马灯——必须匀速：带缓动的曲线会让每一圈忽快忽慢。这一档背后刻意不设原语，匀速没有可调余地。

  **收窄** `--xh-motion-ease-continuous` 的语义：它现在只管「元素在屏内被推到新位置」，不再兼管循环动画。原描述把两者合在一起，导致三处循环动画拿到了带缓动的曲线，而另外八处只能手写 `linear` 绕开——同一道流光在库里跑出两种节奏。

  `button` / `marquee` / `notification` / `popconfirm` / `progress` / `reasoning` / `skeleton` / `spinner` / `switch` / `table` / `tool-call` 共 11 处循环改引 `--xh-motion-ease-loop`。取值与各自原先的实际表现一致或更正确，`segmented` 的滑块位置过渡保持在 `--xh-motion-ease-continuous`。

- 8a2d914: **动效补上编排、方向感与退场三层：交错从零到 36 处，浮层有了锚点原点，退场不再是进场倒放。**

  **此前全库没有编排。** `animation-delay` 0 处、`transition-delay` 0 处、`will-change` 0 处、`transform-origin` 1 处——不是动画做得少，是每个动画各自孤立地淡入淡出，没有先后、没有方向、没有分档。175 条 `transition` 里 68% 用同一支时长、71% 用同一支曲线。

  现在：零动效皮肤 43 → 32、`transition` 175 → 200、`animation-delay` 0 → **36**（交错一律走 `calc(N * var(--xh-motion-stagger-step))`，封顶 6 项）、`will-change` 0 → **29**（全部挂在 `[data-state='open']` 一类的状态规则上，随状态一起撤走，不常驻占合成层）、`transform-origin` 1 → **14**（13 个锚定浮层按 `[data-placement]` 打原点并加 4px 方向位移，进场看得出是从哪儿冒出来的）。曲线分布：`enter` 272→238、`enter-strong` 51→150、`continuous` 4→24、`slide`/`sweep`/`settle` 各 0→1。

  **新增令牌 10 支，全部是加法。** 原语 3 支：`--xh-ease-out-fluid`（与 HeroUI 的 `--ease-out-fluid` 逐值相同）、`--xh-ease-in-out`（与本仓 `easing.ts` 的 `easeInOut` 逐值相同，新增它零 JS 改动）、`--xh-ease-out-back`（过冲后落位，全库此前不存在任何会过冲的动效）。语义 7 支：`--xh-motion-ease-slide` / `-sweep` / `-settle`、`--xh-motion-duration-slide`(320ms) / `-nudge`(200ms)、`--xh-motion-stagger-step`（派生自 `duration-enter` 的五分之一 = 40ms）、`--xh-motion-scale-exit`(0.98)。

  `sweep` 与 `loop` 分家的理由和当年 `loop` 与 `continuous` 分家同源：单向循环匀速是硬要求（转圈忽快忽慢不可接受），而往返循环在折返点需要两端减速——`linear` 在那里是瞬时反向，读成硬弹。

  `scale-exit` 0.98 比进场起点的 0.96 更靠近 1：退场不是进场倒放，收得更浅才不显得被吸走。

  减弱档：`duration-slide` / `-nudge` 归 1ms，`scale-exit` 归 1，`stagger-step` **显式归 0ms**——不靠 `calc` 传递。减弱档 `duration-enter` 是 1ms，除 5 得 0.2ms，六项交错累计出一毫秒的、看不见但确实在动的错位。三支新曲线不重映射，1ms 内曲线不可见。

  **焦点环一个字未动。** 曾有提议给 91 份皮肤加 `transition: outline-color`，但 `outline-color` 的初始值是 `currentColor` 不是 `transparent`，从它过渡到聚焦色得到的是一段颜色抹擦而不是淡入。真正的差距在 `box-shadow`：68 份皮肤用它表达悬停抬升、`focus-within` 海拔变化、选中态内阴影，此前只有 `card` 与 `slider` 两处把它写进过渡，其余全是硬切，本批按状态变化逐处补齐。

  **修掉 15 处 `will-change` 声明错属性。** `transform` 与 `scale` / `translate` / `rotate` 在现代 CSS 里是各自独立的属性——关键帧动的是 `scale` 与 `translate`，而声明写的是 `transform` 时，点到的那个属性一帧都不会动、真会动的两个一个没点到。`dialog` / `drawer` 与 13 个锚定浮层全中。新增判据 `check-will-change.mjs` 守住，它只咬「点了却不会动」，不咬「会动但没点」——`will-change` 的用途是提示合成层提升，只点需要提升的那几个是对的。

- 1f472ba: **新增**有遮罩的浮层的遮罩形态轴：`dialog` / `drawer` / `image-viewer` 三家收下 `variant`，落成 `backdrop` 上的 `data-variant`。

  三档封闭：`opaque` 是缺省档（不写这个 prop 时逐像素与从前相同）、`blur` 在同一层底色之上再糊背后的页面、`transparent` 去掉底色只留下吃指针的那一层（交互外关闭与滚动锁定照旧）。走 `variant` 而不另开属性名：形态、语气、尺寸三轴之外不再多一个概念。

  `tour` 不在此列：它的暗幕真身是 spotlight 那圈大扩散阴影，`backdrop` 只是下面一层垫子——`transparent` 档改了垫子暗幕照样在，`blur` 档会把洞里的高亮目标一起糊掉。

  **新增**全局令牌 `--xh-overlay-backdrop-blur`（12px）与三条组件覆盖槽 `--xh-dialog-backdrop-blur` / `--xh-drawer-backdrop-blur` / `--xh-image-viewer-backdrop-blur`。

- 7b187ca: **页面底与控件盒底分家，面的层次重新拉开。**

  **新增 `--xh-bg-page`。** 从前页面底与控件盒底共用 `--xh-bg-canvas`：浅色档它与 `--xh-bg-surface`、`--xh-bg-surface-raised` 三支同值，页面、面、抬起的面在一块白上分不出前后。`--xh-bg-page` 只管铺满视口的那一层，浅色档取 `neutral.50`、深色档取 `neutral.950`；`--xh-bg-canvas` 保持原值，全库三十余份皮肤的输入盒底色一处不动。布局根从 `--xh-bg-canvas` 改读 `--xh-bg-page`，它是全库唯一一处页面底的消费点。

  **深色档 `--xh-bg-surface-raised` 从 `neutral.800` 改到新增的半档 `neutral.750`。** 它原先与 `--xh-bg-subtle` 同值，抬起的面上那些底色取淡底的部件——通知卡里的动作钮、日志面板上的滚动钮——静态时明度差为 0，只有悬停才浮出来。新档的取值上界由深色档语气前景定：`neutral.750` 之上中性语气的字对这块面掉到 4.5 以下。

  `--xh-color-neutral-750` 与 `--xh-bg-page` 都是新增名字，既有令牌名一个没动。

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

- 751645b: 新增基础色板：十二个色相（red / orange / amber / yellow / lime / green / teal / cyan / blue / indigo / purple / pink）各 11 档（50 – 950），产出 `--xh-color-<色相>-<档>` 共 132 支原语。每档明度、彩度取品牌曲线的基线，彩度再按该档明度与色相收进 sRGB 色域：同一档跨色相同一明度，换色相不改对比度；色相 258 的 indigo 与 `--xh-color-brand-*` 逐值一致。色板由 `build/emit-palette.mjs` 从 `tokens/palette.seeds.json` 的色相角派生，`tests/palette.spec.ts` 逐档核对生成物与运行时 `deriveBrandScale` 同源。

  原先只有一档的 `--xh-color-purple-600` 并入色板：名字不变，取值从 `oklch(0.577 0.213 302)` 改为色板曲线的 600 档 `oklch(0.546 0.216 302)`，热力图的 purple 色板随之略深。

- 2c2e470: **走马灯：自动播放补上暂停控件，并且不再在减弱动效档下自己起播。**

  `autoplay` 一直没有任何播放 / 暂停入口——解剖里没有这样的部件，`connect` 里的 `play` / `pause` / `resume` 三个方法从来没有被接出来过。自动翻页因此是一段用户按不住的动画：读得慢的人永远读不完一张，屏幕上的东西自己在动而没有出口。减弱动效那一路也只关掉了滑动过渡，翻页照走。

  - **新增**部件 `autoplay-trigger`（Vue 的 `XhCarouselAutoplayTrigger`，自定义元素的 `data-xh-part="autoplay-trigger"`）。它承载 `data-state="running" / "paused"`，名字随动作走（`translations.autoplayTriggerPlay` / `autoplayTriggerPause`），没配 `autoplay` 时转原生 `disabled`。
  - **新增** API 成员 `autoplayStopped`：只算「用户按停了没有」，不含悬停与焦点那两路一挪开就自己续上的临时按住。开关的名字与图形跟着它走，指针碰到按钮时不会翻面。
  - **变更**：减弱动效档下 `autoplay` 不再自己起播（停在 `idle`），要播由用户按下开关。偏好探测走 `@xihan-ui/motion` 的 `resolveMotionPreference`，应用级 `setMotionOverride` 同样管用。
  - **新增**字形令牌 `--xh-glyph-mark-play` / `--xh-glyph-mark-pause`，皮肤按 `data-state` 换字形。

  **差异视图：补上截断提示条，展开按钮补上可访问名。**

  超过 `maxLines` 的差异从尾部断开，界面上没有任何痕迹（`data-truncated` 全库无人消费），看着仍像一份完整差异——评审的人会以为自己看完了，而少掉的恰恰是没被审到的那几行。

  - **新增**部件 `truncation`（Vue 的 `XhDiffViewTruncation`，自定义元素的 `data-xh-part="truncation"`）与文案 `translations.truncated`，文字默认由组件自己填。
  - **新增** `DiffModel.truncatedLines` 与 API 的 `truncatedLines` / `truncationText`：砍掉多少行现在是模型的一部分。
  - **修正** `truncated` 的判据：上限改为按新旧两侧各自计，真砍掉了行才置位。旧判据用两侧行数之和，会在一行都没砍的情况下报「截断了」。
  - `DiffViewTranslations.expandGap` 由 `string` 放宽为 `string | ((count: number) => string)`。它是这个组件里唯一没有兜底的文案，此前展开按钮的可访问名就是按钮上那串「⋯ 12」，读屏念出来什么都没说明。给函数就能把折起来的行数念进名字；仍传字符串的调用方一行不用改——收两种形状是为了不把这一条修复变成整个锁步组的主版本。

- c894319: 新增 `data-transparency="reduce"` 的本地减少透明钩子，与系统减少透明媒体路径使用同一组材质令牌；Portal 视觉桥接可将该显式环境带到实例壳。
- 6d71d04: Rating 新增首方星形皮肤字形，空条目自动绘制中性底层与强调色覆盖层，完整、半档和 RTL 状态均通过图形裁切呈现。

  双层蒙版、半档裁切与独立命中盒使 `rating.css` 的压缩体积由 4286 字节增至 5914 字节。

- e547f3d: **可调容器与图片裁切的调整指示器改为贴住边框。** 新增 `--xh-stroke-strong` 描边令牌，两者的边缘短条统一使用稍粗的 3px 视觉厚度；图片裁切去掉中边指示器的额外描边并改用与可调容器一致的圆端造型，角部折角同步贴边。
- 825d92e: **字段族标签收进一份公共层。** 新增 `css/label.css`，按 `[data-part='label']` 给列出的 18 个 scope 画两条逐值相同的规则：行距取 `--xh-leading-none`，禁用档字色取 `--xh-fg-subtle`。原先这两条散在 18 份皮肤里各写一遍（22 处声明、其中 4 条整块规则），现在收成 2 条。

  字色、字号、字重三条仍留在各组件皮肤：它们挂着 `--xh-<组件>-label-*` 覆盖槽，槽名里带组件名，写不进一条共享规则。scope 逐个列出而不写通配：`label` 这个部件名在标签、统计、进度、推理、说明列表上指的是另一种文字。

  按需引入的人多引一份：`import '@xihan-ui/styles/label.css'`，位置排在组件皮肤之前。

  **`--xh-border-control-focus` 改指聚焦环色。** 它原先指着 `{border.control}`，四个档位下与常态描边逐值相同——输入类控件聚焦时那道描边过渡不出任何变化。现在指 `{ring.focus}`（浅色 brand-500、深色 brand-400），聚焦时描边与聚焦环同色。

  跟着换色的还有三处把它当默认值消费的指示条：表格的列宽拖拽条与放置条、标签页的放置条，拖拽中由中性灰变品牌色。要钉回中性色的写 `--xh-table-resize-fg-active` / `--xh-table-drop-fg` / `--xh-tabs-drop-fg`。

  覆盖槽名、部件名与 `data-*` 取值一个没删也没改名。

- 825d92e: **面板外壳的内衬与角落关闭钮收进共享语义档。**

  令牌 `surface` 一族补齐两件事。原先 `py-md` 指着 `{section.py}`、`px-md` 指着 `{control.px-lg}`，而 `py-sm` / `px-sm` 是直写原语加 compact 表里逐档覆盖——同一族两条密度跟随路径。现在四档一律直写原语，compact 覆盖写在 compact 表里，两档同源。取值一个没变（comfortable 20/16，compact 16/12）。

  新增四边等宽的面板内衬档 `--xh-surface-pad-xs|sm|md|lg`（4 / 8 / 12 / 16）与角落钮贴边档 `--xh-surface-action-inset`（12）。`pad-*` 三档在 compact 下逐档收窄（6 / 8 / 12）。

  皮肤侧：

  - 气泡、悬浮卡、确认气泡三份各写一遍的三档内衬（每份 6 条声明、纵横两把尺）收成一个私有槽读 `--xh-surface-pad-*`，18 条声明变 9 条。纵向内缩原先取不随密度动的原语，现在与横向同尺，compact 下一起收窄。
  - 菜单、菜单栏、右键菜单、导航菜单四份外壳内衬改读 `--xh-surface-pad-xs`；通知卡片读 `--xh-surface-pad-lg`；提示条读 `--xh-surface-py-sm` / `--xh-surface-px-sm`。comfortable 取值不变，compact 下随密度收窄。
  - 四份角落关闭钮的贴边与标题让位量改读 `--xh-surface-action-inset`：漫游导览从 8px 挪到 12px，与对话框、抽屉、通知同档（它的面板内衬本就与对话框同为 20 / 16）；通知的标题让位量原先按 8px 让、钮却钉在 12px 处，现在两处取同一个值。气泡的贴边仍是 8px：它的面板内衬只有 12px，28px 的钮按 12px 贴边会伸出面板自己的盒子、被 `overflow` 裁掉。
  - 对话框、抽屉、气泡、漫游导览四份关闭钮的过渡属性表补上 `color`：这四颗叉悬停时换前景色，属性表里没有它，颜色是硬切的。九颗关闭钮的属性表现在统一为 `background` / `color` / `scale`（看图器那颗前景恒随外层继承、自己不定色，仍是两项）。

  覆盖槽名、部件名与 `data-*` 取值一个没删也没改名。

- 4c287eb: **槽名的部件段与所在部件对齐，跨组件抄写的默认值收成一处。** 三道门禁把扫描面补到位之后，各揪出一处存量违规，逐条修掉，没有加豁免。默认渲染逐像素未变——40 张像素基线（button / text-field / select / menu / popover / dialog / drawer / toast 共 8 件 × 5 档主题密度对比）无差异。

  **破坏性：`--xh-combobox-input-py` 已删，换成 `--xh-combobox-control-py`。** 这条槽管的是「输入行是多行时，控件盒纵向撑开多少」，规则作用在 `control` 上，槽名却写着 `input`——照名字去改 `input` 的内衬，改不动；照名字理解这条槽的人，也不知道它其实动的是外面那个盒。CSS 这一介质没有 IDE 提示，改名之后旧声明只会静默失配，不报错也不降级：请在自己的代码库里全文搜索 `--xh-combobox-input-py`，换成 `--xh-combobox-control-py`。默认值仍是 `var(--xh-field-py)`。

  **新增 `--xh-drawer-description-font-size`。** 抽屉的说明文字此前直接写 `var(--xh-text-body-size)`，全库唯一一处没给使用者留口子的说明段——同族的 dialog 早就有这条槽。默认值不变。

  **新增令牌 `--xh-measure-prose`（`32rem`）：成段正文的读行宽度。** empty-state 与 result 的说明段此前各写一份 `32rem`，是同一条没被命名的决策：整句话不收窄就会拉成一条难读的长行。两处改指这支令牌，随之删掉私有槽 `--xh-_empty-state-measure` / `--xh-_result-measure`（私有槽不在公开面上）。两处的使用者槽 `--xh-empty-state-description-max-w` / `--xh-result-description-max-w` 不变，仍排在令牌之前。

  **实心面顶边的内高光收进语气层。** `inset 0 var(--xh-stroke-thin) 0 0 color-mix(in oklab, …14%, transparent)` 这条式子此前在 16 处实心档里各抄一遍，改一处得挨个找。现在由 `tone.css` 统一声明两支私有槽，各组件指过去：跟着语气走的读 `--xh-_highlight-tone`（badge / button / button-group / icon-wrapper / pagination / tag 带语气那档 / toggle / toggle-group / approval / popconfirm / prompt-input / question-flow），底色恒是品牌色的读 `--xh-_highlight-brand`（editable / form / tag 不带语气那档 / tour）。两支的取值与各处原来那一份逐字相同，各组件自己的 `--xh-<组件>-…-shadow` 覆盖槽与「哪一档才画高光」的规则都不动。

  它落在 `:where([data-scope])` 上而不是 `:root` 的令牌层：自定义属性值里的 `var()` 在声明它的那个元素上就替换掉了，写进 `:root` 会把 `--xh-_tone-on` 与 `--xh-fg-on-brand` 一并按根元素解析，语气与嵌套主题（子树上的 `[data-theme='dark']`）就都冻死在根上那一份。

- d51d182: **令牌层补两处缺口，并把 space 的间距槽移出全局原语的命名空间。**

  **新增 `--xh-elevation-lifted`。** 海拔阶梯此前只有三档：`raised` 是贴在页面上的面，`floating` 是 portal 出去的锚定浮层，`sheet` 是遮罩式与通知。被指针拎起来、正跟着手移动的东西（滑杆拇指、拖动中的排序项、取色器拇指）没有自己那一档，只能借 `floating`——那一档为浮层调深时，跟手的拇指会跟着莫名变重。新档逐位落在 `raised` 与 `floating` 中间：偏移 1 → 2 → 4、模糊 2 → 4 → 8、收缩 0 → -1 → -2、主层不透明度浅色 0.05 → 0.08 → 0.1、深色 0.4 → 0.45 → 0.5；打印档与另外三档一样取消。深色档不带 `floating` 与 `sheet` 那条 1px 白色描边——那条描边是给身下没有自己边界的面用的，跟手移动的元素带着自己的描边一起走。眼下还没有皮肤引它。

  **新增 `--xh-gradient-brand-from` / `--xh-gradient-brand-to`，渐变字改引它们。** `gradient-text` 此前直接引 `--xh-color-brand-500` / `--xh-color-brand-700` 两支色阶原语，而原语只在根上声明一次、浅色档与深色档都不重声明——同一份令牌表里 `--xh-bg-brand` 浅色指 600、深色指 500，全库品牌面随主题走，只有渐变字四季不变，700 那一端落在深色画布上尤其暗。新的两支逐主题给值：浅色 `brand-500 → brand-700`（白底上 3.74:1 → 6.48:1，与改前渲染一致），深色 `brand-400 → brand-300`（深底上 7.33:1 → 10.85:1）。改写品牌色的使用者从此只改语义层，渐变字跟着走。`--xh-gradient-text-from` / `--xh-gradient-text-to` 两个组件槽照旧，写了就以它为准。

  **破坏性：`--xh-space-gap` 改名 `--xh-space-root-gap`，旧名已删。** `--xh-space-` 是全局间距原语的命名空间（`--xh-space-0` … `--xh-space-8` 与 `--xh-space-0_5` / `-1_5` / `-2_5`，后缀一律是数字）。在 `:root` 上写 `--xh-space-gap` 的人会以为自己在改全站间距，实际只改了 Space 一个组件；反过来，日后往令牌表里加一支同名的，全站 Space 的缺省间距会被悄悄接管。新名字带部件段，与其余组件槽同构。改法：`--xh-space-gap: 24px` 改写成 `--xh-space-root-gap: 24px`，位置与作用范围都不变。

  **两道新判据。** `check-token-refs` 盯住 `--xh-space-` 命名空间：底下只许有间距原语，以及形如 `--xh-space-<部件>-<属性>`、部件段取自 space 解剖的组件槽（皮肤在场标记单独登记并带过期反查）；皮肤与令牌产物两边都扫。`check-color-literals` 盯住色阶原语下探：皮肤取色只走语义令牌，画的东西本来就不该随主题翻的（语气层、热力图色板、二维码、看图器、取色器等 7 份皮肤共 52 处）逐份登记理由，登记项扫不到即判名单过期。

- db1fa77: 新增原语 `--xh-color-neutral-650`（600 与 700 之间的半档），深色档的 `--xh-bg-subtle-active`（淡底承载阶梯的按下面）改取它：按住且落焦时焦点环保留在按下面上，默认环 `brand.400` 压 600 只有 2.93:1，压 650 是 3.39:1，与浅色档 300 上的 3.43:1 同一余量。

### Patch Changes

- fe307e5: 新增两支语义令牌，把浮层时列的尺寸从各家皮肤的散值收成一处：`--xh-overlay-column-min-w`（3.5rem，成列排布的时 / 分 / 秒选项列的最小宽度）与 `--xh-overlay-column-item-h`（比小号控件行矮一档，列里一格的高度）；`time-picker` 与 `date-picker` 时列的 `column-min-w`、`time-picker` 的 `item-h` 这几条槽的默认值改读它们。`date-range-picker` 的 `range-separator-mx` 默认值先灌进私有槽再消费，对外契约不变。
- 9a798f6: **标签三档整体放大一级，同档标签有没有关闭钮都一样高。**

  从前三档的高全靠「一行字 + 上下内衬」，字号又只有 12 / 12 / 13 三档，缺省档带关闭钮量出来只有 22px、不带 18px，与相邻控件摆在一行里像缩了一号；现在三档各上一级：字号走 caption / secondary / body（12 / 13 / 14），行框取指示符档（sm / md 取 `--xh-control-indicator-md`、lg 取 `--xh-control-indicator-lg`）；关闭钮仍按库里「标签内移除钮以 `--xh-control-indicator-size` 为基准」的契约走，三档都是 16px。

  实测（comfortable 密度，含 1px 描边）：

  | 档  | 高 · 改前（无关闭钮 / 带关闭钮） | 高 · 改后 | 字号    | 上下内衬 | 左右内衬 | 关闭钮  |
  | --- | -------------------------------- | --------- | ------- | -------- | -------- | ------- |
  | sm  | 14 / 18                          | **22**    | 12 → 12 | 0 → 2    | 6        | 16 → 16 |
  | md  | 18 / 22                          | **26**    | 12 → 13 | 2 → 4    | 8        | 16 → 16 |
  | lg  | 23 / 26                          | **30**    | 13 → 14 | 4 → 4    | 12       | 16 → 16 |

  三档台阶一样宽（4px）；md 档 26px 放进 `--xh-control-h-md`（32px）的控件里不撑高；compact 密度下指示符档收一号，三档相应是 20 / 24 / 28，挂在子树上的局部 compact 也是这个数——为此令牌层的 compact 块补声明了一次别名 `--xh-control-indicator-size`：别名在 `:root` 上解析成像素后按计算值继承，子树上的 compact 原本收不动它，`select` / `tags-input` / `tag-group` 的删除钮同样受益。参照：Ant Design 默认 22 / 12px，Naive UI 22 / 28 / 34，Element Plus 20 / 24 / 32——md 落在 Naive medium 与 Element default 之间。

  带来的变化：同一排里有没有关闭钮的标签从此齐平（从前带钮的高 4px）；行框由 `line-height: 1` 改成「一行字与指示符档取大者」——作者把 `--xh-tag-font-size` 调得比行框还大时行框跟着字走，`label` 的截断不会剪掉字的上下沿；`--xh-tag-close-size` 仍只管关闭钮的边长。文档站的尺寸示例改成每档并排一枚无钮、一枚带钮。

  `tag-group` / `tags-input` / `select` 里各自画的标签没有套 `tag`，这一批不跟着动。

- 1c827ba: 材质里指向主题语义的别名（`--xh-material-solid-*`、`--xh-material-*-fg` / `-fg-muted` / `-focus-surface`、`--xh-material-soft-border` / `-separator` 等）此前只写在 `:root` 上；自定义属性里的 `var()` 在声明处求值，嵌套的 `[data-theme]` 边界只继承到根主题的冻结值，局部深色区里的材质前景与边框仍是浅色取值。生成器改为把这组别名同时挂在每个主题边界上，引用在该边界自己的主题里解析。
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

## 1.0.0

### Major Changes

- bc65cb7: 首个公开版本：框架无关的 UI 基座。

  自研薄 FSM 内核 + headless（anatomy / machine / connect）+ 设计令牌与主题运行时 + 样式层，
  102 个组件在 Vue 与 Web Components 两套适配器上共用同一份内核，跨适配器一致性套件与
  真实 Chromium 里的无障碍扫描、浮层定位契约全绿。

  浮层定位、虚拟滚动、Web Components 响应式基类、代码着色、流式 Markdown 均为自研，
  运行时不带第三方依赖。

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

### Minor Changes

- 9ea57f6: 颜色能力收成一处：亮度、对比度、择色、混色与深浅，从 `@xihan-ui/tokens` 导出。

  这套数学此前在四个地方各写了一份：`runtime/brand.ts` 的私有换算、令牌层的对比度用例、语气对比度门禁，以及消费方自己的主题钩子。四份互不知道对方存在，判据也就各走各的——消费方那份把「白字还是深字」的交叉点写成了相对亮度 0.55，而正确的交叉点是 0.179，等于恒选白字。

  新增 `runtime/color.ts`，`brand.ts` 改成建在它之上（`deriveBrandScale` 的产出逐值不变）：

  - `relativeLuminance` / `contrastRatio` / `meetsContrast` / `CONTRAST_MIN`
  - `pickOnColor`：压在某个底色上读得清的那一档。判据是 WCAG 相对亮度而不是 OKLCH 的 L——后者不含通道权重，同一个 L 上黄与蓝的实际亮度差得很远，按 L 分派会挑错边
  - `pickAwayColor`：交互态该往哪一侧挪，恒取前景的反面
  - `ON_COLOR_CROSSOVER`：白字与黑字对比度相等的那一点，`√0.0525 − 0.05 ≈ 0.179`，解析解
  - `mixColors`：与 CSS 的 `color-mix(in oklab, …)` 同一条路（在 oklab 里插值，不走 oklch 的极坐标）
  - `lighten` / `darken` / `withAlpha`
  - 换算与色域那几样一并转正：`parseColorToOklch`、`formatOklch`、`clampChroma`、`inSrgbGamut` 等

  CSS 那侧做不成同样的共享槽：相对颜色语法的 `r` / `g` / `b` 只在色函数被解析时存在，而自定义属性是之后才替换的——把配方放进槽再 `var()` 进通道位，两种形态都实测失败（整条无效，六族退化成同一个颜色）。所以配方仍写在使用处（`tone.css`），由 `check-tone-contrast` 逐字对账它的形态，`check-css-floor` 管住「必须包 @supports」，令牌包的 `color.spec.ts` 再把那条配方里的交叉点与通道权重读出来与本模块对账——三道合起来保证两边算的是同一件事。

- f72664d: 新增 `--xh-border-control` / `--xh-border-control-hover`，并让 `data-contrast='more'` 第一次真的起作用。

  **控件边界这一族。** WCAG SC 1.4.11 要求控件边界对相邻色达 3:1，而 `border.default` 对画布浅色只有
  1.26、深色只有 1.91——12 组边界组合一组都不达标。容器分隔线不在这条规格的范围内，把
  `border.default` 整个调深会让每条分隔线跟着变重，所以另立一支专供控件边界的令牌：

  |                             | 取值          | 对 canvas | 对 surface |
  | --------------------------- | ------------- | --------- | ---------- |
  | 浅色 `border.control`       | `neutral.450` | 3.23      | 3.23       |
  | 浅色 `border.control-hover` | `neutral.500` | 4.73      | 4.73       |
  | 深色 `border.control`       | `neutral.550` | 3.59      | 3.23       |
  | 深色 `border.control-hover` | `neutral.500` | 4.18      | 3.76       |

  两个静息档都是中性色阶里**第一个过 3:1 的档**：再退一档浅色掉到 2.59、深色掉到 2.54；再进一档浅色
  跳到 4.73，那已是正文级重量，1px 描边取到那里整屏会发硬。悬停档单列一支是必须的——沿用
  `border.strong`（浅 1.48 / 深 2.28）会让悬停比静息更淡。

  **`data-contrast='more'`。** 主题运行时一直在往根元素写这个属性，5 个运行时文件解析它、测试也断言它，
  但令牌产物里一条 `[data-contrast]` 选择器都没有，写上去没有任何东西响应。现在它产出一套边界覆盖，
  判据是每条边界对两种底都不低于 4.5:1（与正文 AA 同一条线），取值同样全部从既有色阶里挑。

  判据从 65 条涨到 102 条：控件边界的 3:1 是硬门槛、悬停必须比静息更重、装饰边框的棘轮从 8 组补到
  12 组（`bg.surface` 底那 4 组此前没钉）、高对比档逐条断言。

  本次只动令牌层，皮肤尚未切换到新令牌，**默认外观一字未变**。

- 1b7a5f1: 统一性审计收口后的六条遗留项。

  **px 与 rem 按口径归位。** 字号七档 `--xh-font-size-xs…3xl` 从 px 改为 rem（0.75 / 0.8125 / 0.875 / 1 / 1.125 / 1.375 / 1.75rem，根字号 16 时像素不变，使用者改根字号时整套排版随之缩放）；字形与控件几何改为 px：`--xh-glyph-size-sm/md/lg` 16 / 20 / 24px、`--xh-glyph-size-xl…4xl` 32 / 40 / 56 / 72px、`--xh-control-action-size` 24px（compact 20px）、`--xh-control-indicator-size` 16px（compact 14px）；color-picker 的动作钮与色块同样归 px。

  **side-nav 折叠态换枝播退场。** 机器里弹出面板的坐标改为按分支记账（`popoutPlacements`），换枝时旧面板保留坐标、`data-state=closed` 播 `xh-pop-out`，新面板同帧 `open` 播 `xh-pop-in`；此前旧面板的坐标在新枝 OPEN 那一拍被作废，退场瞬时。

  **tree-select 的 Vue Root 补 collection 自动渲染树。** 没给默认插槽且传了 `collection` 时自动铺 label? / trigger / clear-trigger? / positioner / content / tree（分支与叶子递归），新增 `label` prop 与插槽、`clearable` prop（缺省 false）；自动树与手写树 DOM 逐字同构，与 select / combobox 同口径。

  **门禁与测试整洁。** 三道浮层门禁共用 `tooling/scripts/lib/overlay-families.mjs`（名单与核实逻辑一份，各门禁的子集差异写明）；27 处测试里为旧 kernel 缺省桩的 `matchMedia` 删掉（减弱动效探测无 matchMedia 时已一律不减弱）。

- f154e07: 组件自带的兜底字形改为真正的图标：勾、半选横杠、展开箭头、清空与关闭的叉、排序方向、加减号、翻页箭头、图片查看器工具条这些，原先要么是皮肤里的 Unicode 字符（`✓ ▾ ✕`，跨字体跨系统长得各不一样），要么由作者在每个部件里手打一个字符。现在统一走 `--xh-glyph-mark-*` 一族二十个令牌，取值是图标包里对应 SVG 的 `url("data:image/svg+xml,…")`，皮肤拿它当 `mask-image`、用 `currentColor` 着色——随语气、悬停、禁用自动变色，与 `<XhIcon>` 画出来的一模一样。令牌的 `$type` 为 `icon`、`$value` 是图标名，构建期从图标包读 SVG 内联，改图标只改一处。

  使用者换图标有两条路：在 `:root` 上重声明令牌即全局换，写在任意容器上即只换那一块（任何 SVG 都行，着色一样走 `currentColor`）；或者往部件里放自己的节点，皮肤那条 `:empty` 守卫即不命中。兜底覆盖面从 14 份皮肤扩到 39 份：此前 tree / tree-select / table / toast / dialog / drawer / number-field / carousel / transfer / image-viewer 等二十个组件的把手空着就什么都不画，文档示例只好逐个手打字符；现在示例里的 960 处手打字符全部删掉，由皮肤画。命令式 toast / dialog 的类型徽记与 `XhToastCloseTrigger`、`XhImageViewer*Trigger` 的默认内容同样改走这族令牌。

  图标包新增 `info` / `rotate-left` / `rotate-right` / `flip-horizontal` / `flip-vertical` 五枚。`check-glyph-slots` 门禁禁止皮肤里再写字面字形，并双向核对令牌与用处（适配器里的 JS 默认模板也算）。

- 1e90ce6: 热力图新增 `palette` 色板轴：`green` / `blue` / `orange` / `purple` / `red` / `gray`，直接按颜色点名色阶满档那一端，三种形态与图例一起跟着走。它是装饰性的一条轴，不是第四条语义轴——与 `tone` 同时写时听色板的，两条都压不过作者自己写的 `--xh-heatmap-ink`；不写时行为与之前逐字一致。

  令牌层随之补上紫色原语 `--xh-color-purple-600`：明度与彩度照 danger 的 600 档，只把色相换成 302。

- 091bbef: 补上动效地基的四个缺口。

  **减弱动效此前基本是失效的。** `tokens.css` 里一个 `prefers-reduced-motion` 都没有，降级靠 19 份皮肤各写各的 `@media`，而它们只把 `animation-duration` 压到 `0.01ms`——位移与缩放是写死的字面量，压时长压不掉。前庭不适恰恰来自大位移与缩放，所以「减弱动效」的用户看到的是瞬间跳完整段位移。现在幅度走 `--xh-motion-distance-sm/-md` 与 `--xh-motion-scale-enter`，令牌层在 reduce 下把它们归零，皮肤不必自带 `@media`。删掉 8 份已经冗余的降级块（含 8 条 `!important`）；marquee / skeleton / spinner 那几处有讲得通的自定义降级，保留。

  **dialog 与 image-viewer 的退场动画从来没播过。** 皮肤给挂着退场动画的 `content` 补了 `[hidden]{display:none}`，收起时元素当场不生成盒子，动画不启动，退场探测器放弃申领租约、就地卸载。drawer 早就绕开了这个坑，它的注释还写着「与 dialog 一致」——而 dialog 恰恰是反的。现在真的一致了，四条退场动画同时补上 `forwards`。

  **Web Components 端全域没有退场动画。** 三个浮层元素把收起写死在展开态上，与 `data-state="closed"` 同帧写内联 `display:none`。现在收起跟着 presence 走；Light DOM 下被拉长的不是节点存在的时间，而是可见的时间。

  **破坏性程度**：进场缩放统一到 `0.96`（此前 0.98 与 0.96 混用），dialog / toast 进场 / color-picker 的起势略明显一点。button 的加载转圈不再被压成 `0.01ms`——转圈是「系统还在做事」的唯一可感知信号，压掉等于把加载态变成假死。

  回归测试进了 `tests/browser/`：jsdom 不把样式表里的 animation 算进 `getComputedStyle`，这三件事在 jsdom 里结构性测不到。

- ec93d6b: 浮层里的条目之间加 2px 行距，新增语义令牌 `--xh-list-option-gap` 统一这把尺。

  **下拉里选中项与悬停项贴成一整块。** a11 的选中蓝底与 b22 的悬停灰底之间没有一丝缝，
  两块底色首尾相接，读起来像一条被涂了两截颜色的长条而不是两个条目。

  **库内自己就有三种方言**：浮层选项列（time-picker / date-picker 的时间列与预设列）已经是
  2px，页面导航列（side-nav / navigation-menu）是 4px，下拉、菜单、树这一族是 0。补上 2px
  是把这一族拉回库内既有的口径。

  `list` 组的描述原文写着「option-\* 给浮层里的条目——菜单项、下拉选项、树行、时间列」，
  新令牌落在这一组：`--xh-list-option-gap: 2px`。compact 档不覆盖，2px 已是最小档。

  22 个条目的直接父容器接上这把尺：select 的 `list`；combobox / listbox 的 `content` 与
  `item-group`；popselect 与 mention 的 `content`；menu / menubar / context-menu 的 `content`
  与 `group`；cascader 的 `column` 与 `search-list`；tree 与 tree-select 的 `tree`、
  `branch-content`、`branch`；transfer 的 `list`。装 list 加 footer 的外壳（select /
  tree-select 的 `content`）不接——它不是条目的父层。json-viewer 也不接，只读数据视图与
  table、log 同为紧排一档。

  `tree` 与 `tree-select` 的 `branch` 此前是块盒，为接这把尺改成纵向 flex，tree-select 同时
  补上此前缺的 `[hidden]` 兜底。

  节奏顺手收一级，加了 gap 之后总量不变：combobox 与 listbox 的组间距 8px → 6px，
  menu / menubar / context-menu 的分隔线外边距 4px → 2px。time-picker 那两处等值的
  `--xh-space-0_5` 改指新令牌，视觉不变。

  这把尺打在容器上，所以分组标题与它下面第一条之间同样多出 2px——分组标题是 `group`
  的第一个子元素，与条目同属一层 flex 子项。

- 8d35702: 动效与浮层口径收口。

  **减弱动效只剩一条通道。** 此前 kernel 的 `RuntimeConfig.reducedMotion` 只读系统 matchMedia、motion 包的 `setMotionOverride` 只有 animate / 滚动 / 数字动画在听，presence 与 stick-to-bottom 感知不到应用级覆盖；无 matchMedia 的宿主两包还给出相反答案（kernel 直接抛 TypeError、motion 报 reduce）。现在 kernel 依赖 motion，`reducedMotion` 缺省即 `resolveMotionPreference() === 'reduce'`（覆盖 ?? 系统偏好），没有 matchMedia 一律不减弱；glyph 转圈、backgrounds、滚动、数字动画全部走同一函数。CSS 侧 `tokens.css` 新增 `:where([data-motion='reduce'])` 块，与 `@media (prefers-reduced-motion: reduce)` 同源生成、逐条相同——作者把 `data-motion="reduce"` 打在任意容器即局部减弱。全局配置加 `motion?: 'reduce' | 'no-preference'`，Vue `provideXhConfig` / WC `<xh-config motion>` 收到即调 `setMotionOverride`。

  **缓动与时长的真源是令牌。** motion 包新增 `durations = { fast, normal, slow }`，`animate()` 缺省与 `@xihan-ui/animations` 的缺省时长都引它；`check-motion-source` 比对 primitive.json 与 easing.ts / durations.ts，值不等即红；`check-reduced-motion-channel` 禁止 motion 包之外再出现 `matchMedia('(prefers-reduced-motion')`。

  **皮肤的 reduce 块归口。** 只在两种情况自写：无限循环动画要整个停掉、有使用者时长槽的过渡要兜住穿透。image-viewer / side-nav / layout 三份纯重复令牌层的块删掉；table 的 `0.01ms !important` 改 `animation: none`；保留的 10 份每块配一份等价的 `[data-motion='reduce']` 规则。animation / transition 不再直引 `--xh-duration-*` 原语：spinner 走 `--xh-spin-duration`，skeleton 走新令牌 `--xh-shimmer-duration`（1600ms）。`check-infinite-motion` / `check-motion-primitives` 守住。

  **浮层的 placement / offset 默认值只有两种语义。** `OVERLAY_PLACEMENT_ANCHORED = 'bottom'`（气泡类）与 `OVERLAY_PLACEMENT_LIST = 'bottom-start'`（列表类）、`OVERLAY_OFFSET = 8` 从 headless 共享导出，各组件的 `<C>_DEFAULT_PLACEMENT` 改为引用它们（tooltip / hover-card / popover / popconfirm / popselect 新增导出常量），所有机器显式传 offset，不再隐式靠引擎兜底；`check-overlay-defaults` 守住。

  **层级覆盖槽齐全、后缀统一。** 22 个浮层族的 positioner / backdrop、toaster、navigation-menu 面板都有了 `--xh-<c>-layer` 槽（缺省仍是 `--xh-layer-*`）；tour / table / heatmap 的 `-z` 后缀槽改名 `-layer`（7 个，公开面变更，基线已推）。

  **进退场对称。** toast 退场位移从 distance-sm 改 distance-md（与进场、与 dialog 一致）；tour 的气泡改用 pop 族，聚光灯补退场；side-nav 折叠态弹出面板补进退场并在 Vue / WC 接上退场租约。

  **navigation-menu 的定位登记变成可验证的。** 三道浮层门禁此前按「anatomy 有 positioner」发现族，它从没被检查过；现在 `SKIN_POSITIONED` 名单要求它没有 positioner、不接引擎、面板由皮肤 absolute 排布，任一条不成立即红。`check-arrow-geometry` 增比对 JS 箭头常量（8·√2 / 8）与令牌（8px 边长 / 8px 圆角）。

- 9548330: 新增 `scrollbar` 组件：自绘滚动条，挂在**任意一个**滚动容器上——表格的滚动盒、虚拟滚动的视口、随手一个 `overflow: auto` 的 div 都行，不必是本组件的后代。此前这套东西焊在 `scroll-area` 里，只有连视口带内容一起交出去的场景用得上。

  解剖 `root` / `track` / `thumb` 三层必需、`corner` 可选（横竖两条同时摆着时写在其中一条里补交叉口，配合 `gutter` 让两条各自让出那一格）；四种露面时机（`auto` / `always` / `scroll` / `hover`）带收起延时；拖滑块、点轨道跳转、RTL 双向换算、滑块像素下限、成段的 `scroll-start` / `scroll-end` 与 `drag-start` / `drag-end` 都在库里。`focusable` 打开后滑块进 Tab 序、报 `role="scrollbar"` 与三个 `aria-value*`，方向键 / 翻页键 / Home / End 可用；缺省不进 Tab 序也对读屏隐藏——滚动本身由滚动容器报，同一件事没必要报两遍。触屏（粗指针）上默认交给原生滚动，整条不画并带 `data-native`，`forceVisible` 打开才画。收起不再打 `hidden`，而是 `data-state=hidden` 由皮肤淡出（`visibility` 随退场播完才收），露出同样淡入；根上另有 `data-hover` 标指针在不在这一片。

  **`scroll-area` 改由 `scrollbar` 组装。** 滚动区不再有自己的机器：它是视口加两条 scrollbar——`scrollbar` 角色节点是那条滚动条的挂载点、同时充当它的根，里面照 scrollbar 的写法摆 `track` / `thumb` / `corner`（戴 `data-scope="scrollbar"`），显隐、拖动、键盘、几何、触屏原生、淡入淡出全是 scrollbar 那一套，两个组件共用一份滚动条。Vue 新增 `XhScrollAreaTrack`；交叉口 `corner` 改写在竖条的挂载点里，两条都显形时才露；`scroll-area` 新增 `size` / `forceVisible`；视口的占道改打在视口自己身上（`data-lane-vertical` / `data-lane-horizontal`），不再依赖 `:has()`。原 `--xh-scroll-area-thumb-*` / `-bar-*` / `-corner-bg` 那几个槽随之归到 `--xh-scrollbar-*` 名下；`scrollAreaMachine` / `ScrollAreaSchema` / `SCROLL_AREA_*` 导出不再有，连接层改收两台 scrollbar 机器与 props（`scrollAreaScrollbarProps` 给出每台的 props）。挂了自绘滚动条的容器带 `data-xh-scrollbar`（挂在它身上的条数），皮肤据此藏掉原生滚动条的外观——表格放进滚动区即可滚（吸顶表头与吸附列钉在视口上），虚拟滚动的视口给个 id 用 `controls` 挂上即可。

  滚动容器换了会自动把监听挪过去（`scrollable` / `controls` 指向另一个节点、或条件渲染的容器重建）；查不到时投一条 `scrollbar.missing-scrollable` 诊断，不静默，容器后到时调一次 `api.measure()` 即接上。容器里内容长短变了会自动重量（`MutationObserver` 盯着子树，一拍内合并成一次），量不到的场合另有 `api.measure()`。

- 8d6e450: 整洁度归队（统一性审计的最后一批）。

  **令牌**：dialog / drawer 的宽度档提为 `--xh-overlay-sheet-w-sm/md/lg`（24/32/48rem）与 `--xh-overlay-drawer-w-sm/md/lg`（16/20/28rem），empty-state / result 的图标档提为 `--xh-glyph-size-xl/2xl/3xl/4xl`；`--xh-control-gap-lg` 此前与 md 恒等，改为 space-3（compact space-2）；补 `--xh-fg-warning` / `--xh-fg-info`（与 success 同构）。tokens README 写明 px 与 rem 的口径，以及「单行控件本体的槽一律叫 control」。

  **皮肤**：number-field 的 `--xh-number-field-input-h` 在 control 上用错部件名，改 `--xh-number-field-control-h`；spinner 三档归 glyph 尺寸族、anchor / pagination / steps / composer / menubar 的内衬对齐 control-px 阶梯；back-top / card / float-button / switch / dynamic-input 的阴影补使用者槽；timeline / typography / field / slider 的字面残留改令牌；30 处与令牌同值却不引令牌的兜底改引（15 处登记理由）；checkbox-group / transfer 的指示符字形与 checkbox 同一配方。菜单与列表族的条目高亮只认 `[data-highlighted]`（菜单族此前还并挂 `:focus` / `:focus-visible`）。

  **无障碍**：select 的触发器按 APG select-only combobox 打 `role=combobox` + `aria-haspopup=listbox` + `aria-controls`（popselect 是按钮式弹出保持 button）；image-viewer 触发器补 `aria-controls`；83 处 `aria-hidden` 统一写布尔；iconOnly 按钮没有 `aria-label` / `aria-labelledby` 时开发模式提醒一次（Vue / WC 把作者写在根节点上的可及名转告连接层）。

  **共享配方**：visually-hidden 的 9 条声明收成 headless 的 `VISUALLY_HIDDEN_STYLE`，六份 connect 引它；七份皮肤各自那份必须与 `visually-hidden.css` 逐条一致。

  **门禁**：`check-literal-fallbacks`（兜底字面量与令牌同值即红）、`check-visually-hidden`、`check-tone-contrast`（自算 oklch → WCAG 对比度，六族 × 两主题 26 组配对，1 组已知例外登记理由）、`check-aria-shapes`（aria-hidden 字符串写法 / listbox 触发器角色）；`check-elevation-role` 增「阴影必须带使用者槽」。

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

- 4abe899: 统一性收口的头两批：先立门禁让跑偏能红，再补语义令牌把皮肤里的原语引用与互异的字面量收成一处。

  **海拔改按角色走。** `--xh-elevation-0…4` 五档删掉，换成三个角色：`raised`（静态抬起面：卡片的 elevated 变体、分段控制器的滑块、滑杆拇指）、`floating`（锚定浮层：下拉、菜单、popover、hover-card、tooltip）、`sheet`（遮罩式与通知：dialog / drawer / toast / tour / floating-panel / float-button / back-top）。深色主题的三档更重、外加一圈 1px 浅描边，暗底上浮层才分得出层。34 份皮肤全部迁过去，`check-elevation-role` 校验每处阴影都走角色、且 27 个浮层/遮罩面的角色与部件对得上。这是公开面的删减，基线已推。

  **字号不再下探原语。** 新增 `--xh-control-font-sm/md/lg`（控件主文字，与 `--xh-control-h-*` 同构按档走）、`--xh-control-caption-sm/md/lg`（控件里的次级文字：提示、计数、快捷键、清空钮，比同档主文字低一级）、`--xh-text-heading-1/2-*`、`--xh-text-caption-size`、`--xh-text-secondary-size`。皮肤里两百三十处 `--xh-font-size-*` 引用全部换成语义档；typography 的六级标题与 rating 的星标是字号阶梯本身，登记为例外。`check-text-scale` 守住。

  **默认宽度、内衬、轨道、折叠面的共享字面量收成令牌。** `--xh-control-min-w`（12rem）统一了 select / combobox / tree-select / cascader / color-picker / date-picker 六个触发器此前的六个值，time-picker / text-field / date-field / time-field / password-input 五家此前没有任何宽度声明，现在同样接上；`--xh-surface-py/px-sm/md` 统一了 dialog / drawer / tour / floating-panel / toast 的内衬；`--xh-track-thickness` / `--xh-track-thumb-size` 给滑杆与进度条；`--xh-nav-link-max-w`、`--xh-viewport-max-h`、`--xh-motion-scale-drag`（减弱动效归 1）、`--xh-glyph-size-text`（跟文字走的字形尺寸）、`--xh-control-box-sm/md/lg`（pin-input 的方格，随 compact 收）、`--xh-switch-track-h-*`、`--xh-syntax-string/number/keyword`（code-block 与 json-viewer 的语法色，随主题明暗切换，皮肤里不再有 hex 字面量）。`check-shared-slots` 新增「同后缀跨组件字面量互异也报」。

  **聚焦态描边统一成一派。** 此前三派：描边不变只画环、描边跟着环色走（语气轴在这一派整个失效）、只画环不管描边。现在 21 份输入类皮肤都写 `border-color: var(--xh-<c>-<part>-border-focus, var(--xh-_tone, var(--xh-border-control-focus)))`，新令牌 `--xh-border-control-focus` 缺省等于 `--xh-border-control`；time-field 聚焦补上了此前缺的环。`check-focus-ring` 加校验。

  **图标尺寸接线。** 38 份画兜底字形的皮肤在 root（浮层族在 content）上声明 `--xh-icon-size: var(--xh-<c>-icon-size, var(--xh-glyph-size-text))`，兜底字形的盒同样按它量——作者往指示符槽塞 `<XhIcon>` 时不再从 1em 跳到 20px。`check-icon-size` 守住。

  **几何修正。** pin-input 的方格此前缺省引的是 lg 档高度、sm 档引 md；segmented 横排外盒此前 38px（item 32 + 轨道内衬 + 描边），现在外盒本身即一档控件高、段撑满轨道内侧；checkbox 的方框锚在 `--xh-control-indicator-size` 上随 compact 收；checkbox-group 的指示符不再是 16px 字面量。radio-group / checkbox-group / composer 的禁用态去掉叠加的不透明度（与容器一起变淡会把对比度压穿）。

  **门禁。** 新增 `check-stroke-scale`（描边宽度只走 `--xh-stroke-*` / ring）、`check-keyboard-suites`（键盘表非空 ⇒ 一致性套件存在且两个适配器都登记）；`check-control-height` 按「组件 → 控件本体部件」显式管辖（button / toggle / segmented / pagination 等此前在门禁外）并校验 sm/md/lg 档位与 `data-size` 对应；`check-disabled-contrast` 改正则并加跨块判定；`check-shape-scale` 扩到逻辑角与私有槽；`check-keyframe-refs` 增扫适配器源码里的内联动画名（反馈服务的加载徽记改用 Web Animations，不再依赖某份皮肤在场）；`check-state-vocabulary` 接上 `state-vocabulary.json` 真源（`data-state` 的 43 个取值分 9 个族，connect 字面量与皮肤选择器两头对表，并报告「发射但零引用」的属性）；`check-token-refs` 禁皮肤里的颜色字面量。

  **套件。** 补 image-viewer（8 行键盘表，Tab 循环两行 jsdom 豁免）与 side-nav（10 行含折叠态弹出）的一致性套件，Vue 与 WC 两侧登记。

- 35c9b65: 相似组件与组合组件的视觉、动效、行为收成一套口径。

  **盒的定义统一了。** 此前 16 个输入 / 选择控件有三种「盒」：9 家由 `control` 画描边与底、5 家由 `trigger`（一个 `<button>`）当盒、2 家由 `input` 自画。盒是 button 的那 5 家（select · cascader · tree-select · popselect · color-picker）没法把清空钮放进框里，只能贴在框外——这就是「清空钮位置不统一」的总根因。现在判据只有一条：**解剖里有 `control` 就是盒**，`trigger` 退化成盒内那颗 `flex: 1 1 auto; border: 0; background: transparent` 的按钮，聚焦环改画在 `control:focus-within` 上。cascader / tree-select / popselect / color-picker / text-field 的解剖新增 `control` 部件。

  **尾部按钮一律在框内最右。** 盒内布局恒为「内容区 `flex: 1` → 尾钮组 `flex: none`」。段位并排、没有单一容器的四家（date-field · time-field · date-picker · time-picker）新增 `segment-group` 部件把段位与分隔符包起来当内容区（date-picker 原有的 `input` 分段容器改名 `segment-group`，四家从此同名同职），`margin-inline-start: auto` 那套 hack 删掉。行内动作钮（清空 / 展开 / 明暗切换 / 加减）一律 `--xh-control-action-size` 方钮——number-field 的加减钮与 password-input 的明暗钮此前是「贴边的控件高钮」。

  **并排成对的面板定高。** 新增 `--xh-viewport-h-sm/md/lg`（12/16/24rem，compact 同比例收）。transfer 两侧列表此前是 `min 8rem / max 16rem`，条目搬走后整个组件跟着变矮——现在定高 `--xh-viewport-h-md`，左右等高、空侧也占满。cascader 的列、date-picker / time-picker 的时间列同样定高；单个浮层面板仍内容驱动，但补上了此前缺失的高度上限。

  **菜单族三家逐条同值。** `menu` / `menubar` / `context-menu` 共用同一台机器，皮肤却各写各的：menubar 根本没有 `item[data-state='open']` 这条规则，所以「发送到…」展开时不像 menu 那样加粗高亮。现在条目内衬 / 字号 / 圆角 / 行高 / 展开态 / 高亮态 / `content` 外观 / `separator` / `group-label` 全族同值，menu 补齐 `group` / `group-label` / `separator` 部件，子菜单箭头走字形令牌。navigation-menu 与 side-nav 的弹出面板按同族口径归队。

  **浮层面板与输入族小件归队。** `content` 一律双槽内衬 + 族档 min-w / max-w；cascader 的 48rem、color-picker 的 15rem、tour 的 22rem 等裸值改令牌（新增 `--xh-overlay-max-w-xl`）；label 颜色与间距、图标尺寸随档、聚焦环私有槽（invalid 时变红）、`:focus-within` 的禁用守卫、disabled / readonly 的三样齐——逐条统一。password-input 的明暗钮用上了新的 `--xh-glyph-mark-eye` / `-eye-off` 字形令牌。

  **门禁**：`check-control-box`（盒结构 12 条判据）、`check-panel-height`（面板高度只走滚动面令牌、并排面板必须定高）、`check-family-parity`（菜单族 / 分段族 / 下拉族 / 气泡族逐条同值）。

  公开面：五家 `--xh-<c>-trigger-*` → `--xh-<c>-control-*` 槽改名、date-picker 的 `input` 部件与 `XhDatePickerInput` 组件改名 `segment-group` / `XhDatePickerSegmentGroup`、`--xh-hover-card-font-size` 与 transfer 的 `-list-min-h` / `-list-max-h` 删除，共 43 项，基线已推。

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

## 1.0.0-preview.0

### Minor Changes

- 9ea57f6: 颜色能力收成一处：亮度、对比度、择色、混色与深浅，从 `@xihan-ui/tokens` 导出。

  这套数学此前在四个地方各写了一份：`runtime/brand.ts` 的私有换算、令牌层的对比度用例、语气对比度门禁，以及消费方自己的主题钩子。四份互不知道对方存在，判据也就各走各的——消费方那份把「白字还是深字」的交叉点写成了相对亮度 0.55，而正确的交叉点是 0.179，等于恒选白字。

  新增 `runtime/color.ts`，`brand.ts` 改成建在它之上（`deriveBrandScale` 的产出逐值不变）：

  - `relativeLuminance` / `contrastRatio` / `meetsContrast` / `CONTRAST_MIN`
  - `pickOnColor`：压在某个底色上读得清的那一档。判据是 WCAG 相对亮度而不是 OKLCH 的 L——后者不含通道权重，同一个 L 上黄与蓝的实际亮度差得很远，按 L 分派会挑错边
  - `pickAwayColor`：交互态该往哪一侧挪，恒取前景的反面
  - `ON_COLOR_CROSSOVER`：白字与黑字对比度相等的那一点，`√0.0525 − 0.05 ≈ 0.179`，解析解
  - `mixColors`：与 CSS 的 `color-mix(in oklab, …)` 同一条路（在 oklab 里插值，不走 oklch 的极坐标）
  - `lighten` / `darken` / `withAlpha`
  - 换算与色域那几样一并转正：`parseColorToOklch`、`formatOklch`、`clampChroma`、`inSrgbGamut` 等

  CSS 那侧做不成同样的共享槽：相对颜色语法的 `r` / `g` / `b` 只在色函数被解析时存在，而自定义属性是之后才替换的——把配方放进槽再 `var()` 进通道位，两种形态都实测失败（整条无效，六族退化成同一个颜色）。所以配方仍写在使用处（`tone.css`），由 `check-tone-contrast` 逐字对账它的形态，`check-css-floor` 管住「必须包 @supports」，令牌包的 `color.spec.ts` 再把那条配方里的交叉点与通道权重读出来与本模块对账——三道合起来保证两边算的是同一件事。

- ec93d6b: 浮层里的条目之间加 2px 行距，新增语义令牌 `--xh-list-option-gap` 统一这把尺。

  **下拉里选中项与悬停项贴成一整块。** a11 的选中蓝底与 b22 的悬停灰底之间没有一丝缝，
  两块底色首尾相接，读起来像一条被涂了两截颜色的长条而不是两个条目。

  **库内自己就有三种方言**：浮层选项列（time-picker / date-picker 的时间列与预设列）已经是
  2px，页面导航列（side-nav / navigation-menu）是 4px，下拉、菜单、树这一族是 0。补上 2px
  是把这一族拉回库内既有的口径。

  `list` 组的描述原文写着「option-\* 给浮层里的条目——菜单项、下拉选项、树行、时间列」，
  新令牌落在这一组：`--xh-list-option-gap: 2px`。compact 档不覆盖，2px 已是最小档。

  22 个条目的直接父容器接上这把尺：select 的 `list`；combobox / listbox 的 `content` 与
  `item-group`；popselect 与 mention 的 `content`；menu / menubar / context-menu 的 `content`
  与 `group`；cascader 的 `column` 与 `search-list`；tree 与 tree-select 的 `tree`、
  `branch-content`、`branch`；transfer 的 `list`。装 list 加 footer 的外壳（select /
  tree-select 的 `content`）不接——它不是条目的父层。json-viewer 也不接，只读数据视图与
  table、log 同为紧排一档。

  `tree` 与 `tree-select` 的 `branch` 此前是块盒，为接这把尺改成纵向 flex，tree-select 同时
  补上此前缺的 `[hidden]` 兜底。

  节奏顺手收一级，加了 gap 之后总量不变：combobox 与 listbox 的组间距 8px → 6px，
  menu / menubar / context-menu 的分隔线外边距 4px → 2px。time-picker 那两处等值的
  `--xh-space-0_5` 改指新令牌，视觉不变。

  这把尺打在容器上，所以分组标题与它下面第一条之间同样多出 2px——分组标题是 `group`
  的第一个子元素，与条目同属一层 flex 子项。

## 1.0.0-alpha.3

### Major Changes

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

### Minor Changes

- 1b7a5f1: 统一性审计收口后的六条遗留项。

  **px 与 rem 按口径归位。** 字号七档 `--xh-font-size-xs…3xl` 从 px 改为 rem（0.75 / 0.8125 / 0.875 / 1 / 1.125 / 1.375 / 1.75rem，根字号 16 时像素不变，使用者改根字号时整套排版随之缩放）；字形与控件几何改为 px：`--xh-glyph-size-sm/md/lg` 16 / 20 / 24px、`--xh-glyph-size-xl…4xl` 32 / 40 / 56 / 72px、`--xh-control-action-size` 24px（compact 20px）、`--xh-control-indicator-size` 16px（compact 14px）；color-picker 的动作钮与色块同样归 px。

  **side-nav 折叠态换枝播退场。** 机器里弹出面板的坐标改为按分支记账（`popoutPlacements`），换枝时旧面板保留坐标、`data-state=closed` 播 `xh-pop-out`，新面板同帧 `open` 播 `xh-pop-in`；此前旧面板的坐标在新枝 OPEN 那一拍被作废，退场瞬时。

  **tree-select 的 Vue Root 补 collection 自动渲染树。** 没给默认插槽且传了 `collection` 时自动铺 label? / trigger / clear-trigger? / positioner / content / tree（分支与叶子递归），新增 `label` prop 与插槽、`clearable` prop（缺省 false）；自动树与手写树 DOM 逐字同构，与 select / combobox 同口径。

  **门禁与测试整洁。** 三道浮层门禁共用 `tooling/scripts/lib/overlay-families.mjs`（名单与核实逻辑一份，各门禁的子集差异写明）；27 处测试里为旧 kernel 缺省桩的 `matchMedia` 删掉（减弱动效探测无 matchMedia 时已一律不减弱）。

- f154e07: 组件自带的兜底字形改为真正的图标：勾、半选横杠、展开箭头、清空与关闭的叉、排序方向、加减号、翻页箭头、图片查看器工具条这些，原先要么是皮肤里的 Unicode 字符（`✓ ▾ ✕`，跨字体跨系统长得各不一样），要么由作者在每个部件里手打一个字符。现在统一走 `--xh-glyph-mark-*` 一族二十个令牌，取值是图标包里对应 SVG 的 `url("data:image/svg+xml,…")`，皮肤拿它当 `mask-image`、用 `currentColor` 着色——随语气、悬停、禁用自动变色，与 `<XhIcon>` 画出来的一模一样。令牌的 `$type` 为 `icon`、`$value` 是图标名，构建期从图标包读 SVG 内联，改图标只改一处。

  使用者换图标有两条路：在 `:root` 上重声明令牌即全局换，写在任意容器上即只换那一块（任何 SVG 都行，着色一样走 `currentColor`）；或者往部件里放自己的节点，皮肤那条 `:empty` 守卫即不命中。兜底覆盖面从 14 份皮肤扩到 39 份：此前 tree / tree-select / table / toast / dialog / drawer / number-field / carousel / transfer / image-viewer 等二十个组件的把手空着就什么都不画，文档示例只好逐个手打字符；现在示例里的 960 处手打字符全部删掉，由皮肤画。命令式 toast / dialog 的类型徽记与 `XhToastCloseTrigger`、`XhImageViewer*Trigger` 的默认内容同样改走这族令牌。

  图标包新增 `info` / `rotate-left` / `rotate-right` / `flip-horizontal` / `flip-vertical` 五枚。`check-glyph-slots` 门禁禁止皮肤里再写字面字形，并双向核对令牌与用处（适配器里的 JS 默认模板也算）。

- 1e90ce6: 热力图新增 `palette` 色板轴：`green` / `blue` / `orange` / `purple` / `red` / `gray`，直接按颜色点名色阶满档那一端，三种形态与图例一起跟着走。它是装饰性的一条轴，不是第四条语义轴——与 `tone` 同时写时听色板的，两条都压不过作者自己写的 `--xh-heatmap-ink`；不写时行为与之前逐字一致。

  令牌层随之补上紫色原语 `--xh-color-purple-600`：明度与彩度照 danger 的 600 档，只把色相换成 302。

- 8d35702: 动效与浮层口径收口。

  **减弱动效只剩一条通道。** 此前 kernel 的 `RuntimeConfig.reducedMotion` 只读系统 matchMedia、motion 包的 `setMotionOverride` 只有 animate / 滚动 / 数字动画在听，presence 与 stick-to-bottom 感知不到应用级覆盖；无 matchMedia 的宿主两包还给出相反答案（kernel 直接抛 TypeError、motion 报 reduce）。现在 kernel 依赖 motion，`reducedMotion` 缺省即 `resolveMotionPreference() === 'reduce'`（覆盖 ?? 系统偏好），没有 matchMedia 一律不减弱；glyph 转圈、backgrounds、滚动、数字动画全部走同一函数。CSS 侧 `tokens.css` 新增 `:where([data-motion='reduce'])` 块，与 `@media (prefers-reduced-motion: reduce)` 同源生成、逐条相同——作者把 `data-motion="reduce"` 打在任意容器即局部减弱。全局配置加 `motion?: 'reduce' | 'no-preference'`，Vue `provideXhConfig` / WC `<xh-config motion>` 收到即调 `setMotionOverride`。

  **缓动与时长的真源是令牌。** motion 包新增 `durations = { fast, normal, slow }`，`animate()` 缺省与 `@xihan-ui/animations` 的缺省时长都引它；`check-motion-source` 比对 primitive.json 与 easing.ts / durations.ts，值不等即红；`check-reduced-motion-channel` 禁止 motion 包之外再出现 `matchMedia('(prefers-reduced-motion')`。

  **皮肤的 reduce 块归口。** 只在两种情况自写：无限循环动画要整个停掉、有使用者时长槽的过渡要兜住穿透。image-viewer / side-nav / layout 三份纯重复令牌层的块删掉；table 的 `0.01ms !important` 改 `animation: none`；保留的 10 份每块配一份等价的 `[data-motion='reduce']` 规则。animation / transition 不再直引 `--xh-duration-*` 原语：spinner 走 `--xh-spin-duration`，skeleton 走新令牌 `--xh-shimmer-duration`（1600ms）。`check-infinite-motion` / `check-motion-primitives` 守住。

  **浮层的 placement / offset 默认值只有两种语义。** `OVERLAY_PLACEMENT_ANCHORED = 'bottom'`（气泡类）与 `OVERLAY_PLACEMENT_LIST = 'bottom-start'`（列表类）、`OVERLAY_OFFSET = 8` 从 headless 共享导出，各组件的 `<C>_DEFAULT_PLACEMENT` 改为引用它们（tooltip / hover-card / popover / popconfirm / popselect 新增导出常量），所有机器显式传 offset，不再隐式靠引擎兜底；`check-overlay-defaults` 守住。

  **层级覆盖槽齐全、后缀统一。** 22 个浮层族的 positioner / backdrop、toaster、navigation-menu 面板都有了 `--xh-<c>-layer` 槽（缺省仍是 `--xh-layer-*`）；tour / table / heatmap 的 `-z` 后缀槽改名 `-layer`（7 个，公开面变更，基线已推）。

  **进退场对称。** toast 退场位移从 distance-sm 改 distance-md（与进场、与 dialog 一致）；tour 的气泡改用 pop 族，聚光灯补退场；side-nav 折叠态弹出面板补进退场并在 Vue / WC 接上退场租约。

  **navigation-menu 的定位登记变成可验证的。** 三道浮层门禁此前按「anatomy 有 positioner」发现族，它从没被检查过；现在 `SKIN_POSITIONED` 名单要求它没有 positioner、不接引擎、面板由皮肤 absolute 排布，任一条不成立即红。`check-arrow-geometry` 增比对 JS 箭头常量（8·√2 / 8）与令牌（8px 边长 / 8px 圆角）。

- 9548330: 新增 `scrollbar` 组件：自绘滚动条，挂在**任意一个**滚动容器上——表格的滚动盒、虚拟滚动的视口、随手一个 `overflow: auto` 的 div 都行，不必是本组件的后代。此前这套东西焊在 `scroll-area` 里，只有连视口带内容一起交出去的场景用得上。

  解剖 `root` / `track` / `thumb` 三层必需、`corner` 可选（横竖两条同时摆着时写在其中一条里补交叉口，配合 `gutter` 让两条各自让出那一格）；四种露面时机（`auto` / `always` / `scroll` / `hover`）带收起延时；拖滑块、点轨道跳转、RTL 双向换算、滑块像素下限、成段的 `scroll-start` / `scroll-end` 与 `drag-start` / `drag-end` 都在库里。`focusable` 打开后滑块进 Tab 序、报 `role="scrollbar"` 与三个 `aria-value*`，方向键 / 翻页键 / Home / End 可用；缺省不进 Tab 序也对读屏隐藏——滚动本身由滚动容器报，同一件事没必要报两遍。触屏（粗指针）上默认交给原生滚动，整条不画并带 `data-native`，`forceVisible` 打开才画。收起不再打 `hidden`，而是 `data-state=hidden` 由皮肤淡出（`visibility` 随退场播完才收），露出同样淡入；根上另有 `data-hover` 标指针在不在这一片。

  **`scroll-area` 改由 `scrollbar` 组装。** 滚动区不再有自己的机器：它是视口加两条 scrollbar——`scrollbar` 角色节点是那条滚动条的挂载点、同时充当它的根，里面照 scrollbar 的写法摆 `track` / `thumb` / `corner`（戴 `data-scope="scrollbar"`），显隐、拖动、键盘、几何、触屏原生、淡入淡出全是 scrollbar 那一套，两个组件共用一份滚动条。Vue 新增 `XhScrollAreaTrack`；交叉口 `corner` 改写在竖条的挂载点里，两条都显形时才露；`scroll-area` 新增 `size` / `forceVisible`；视口的占道改打在视口自己身上（`data-lane-vertical` / `data-lane-horizontal`），不再依赖 `:has()`。原 `--xh-scroll-area-thumb-*` / `-bar-*` / `-corner-bg` 那几个槽随之归到 `--xh-scrollbar-*` 名下；`scrollAreaMachine` / `ScrollAreaSchema` / `SCROLL_AREA_*` 导出不再有，连接层改收两台 scrollbar 机器与 props（`scrollAreaScrollbarProps` 给出每台的 props）。挂了自绘滚动条的容器带 `data-xh-scrollbar`（挂在它身上的条数），皮肤据此藏掉原生滚动条的外观——表格放进滚动区即可滚（吸顶表头与吸附列钉在视口上），虚拟滚动的视口给个 id 用 `controls` 挂上即可。

  滚动容器换了会自动把监听挪过去（`scrollable` / `controls` 指向另一个节点、或条件渲染的容器重建）；查不到时投一条 `scrollbar.missing-scrollable` 诊断，不静默，容器后到时调一次 `api.measure()` 即接上。容器里内容长短变了会自动重量（`MutationObserver` 盯着子树，一拍内合并成一次），量不到的场合另有 `api.measure()`。

- 8d6e450: 整洁度归队（统一性审计的最后一批）。

  **令牌**：dialog / drawer 的宽度档提为 `--xh-overlay-sheet-w-sm/md/lg`（24/32/48rem）与 `--xh-overlay-drawer-w-sm/md/lg`（16/20/28rem），empty-state / result 的图标档提为 `--xh-glyph-size-xl/2xl/3xl/4xl`；`--xh-control-gap-lg` 此前与 md 恒等，改为 space-3（compact space-2）；补 `--xh-fg-warning` / `--xh-fg-info`（与 success 同构）。tokens README 写明 px 与 rem 的口径，以及「单行控件本体的槽一律叫 control」。

  **皮肤**：number-field 的 `--xh-number-field-input-h` 在 control 上用错部件名，改 `--xh-number-field-control-h`；spinner 三档归 glyph 尺寸族、anchor / pagination / steps / composer / menubar 的内衬对齐 control-px 阶梯；back-top / card / float-button / switch / dynamic-input 的阴影补使用者槽；timeline / typography / field / slider 的字面残留改令牌；30 处与令牌同值却不引令牌的兜底改引（15 处登记理由）；checkbox-group / transfer 的指示符字形与 checkbox 同一配方。菜单与列表族的条目高亮只认 `[data-highlighted]`（菜单族此前还并挂 `:focus` / `:focus-visible`）。

  **无障碍**：select 的触发器按 APG select-only combobox 打 `role=combobox` + `aria-haspopup=listbox` + `aria-controls`（popselect 是按钮式弹出保持 button）；image-viewer 触发器补 `aria-controls`；83 处 `aria-hidden` 统一写布尔；iconOnly 按钮没有 `aria-label` / `aria-labelledby` 时开发模式提醒一次（Vue / WC 把作者写在根节点上的可及名转告连接层）。

  **共享配方**：visually-hidden 的 9 条声明收成 headless 的 `VISUALLY_HIDDEN_STYLE`，六份 connect 引它；七份皮肤各自那份必须与 `visually-hidden.css` 逐条一致。

  **门禁**：`check-literal-fallbacks`（兜底字面量与令牌同值即红）、`check-visually-hidden`、`check-tone-contrast`（自算 oklch → WCAG 对比度，六族 × 两主题 26 组配对，1 组已知例外登记理由）、`check-aria-shapes`（aria-hidden 字符串写法 / listbox 触发器角色）；`check-elevation-role` 增「阴影必须带使用者槽」。

- 4abe899: 统一性收口的头两批：先立门禁让跑偏能红，再补语义令牌把皮肤里的原语引用与互异的字面量收成一处。

  **海拔改按角色走。** `--xh-elevation-0…4` 五档删掉，换成三个角色：`raised`（静态抬起面：卡片的 elevated 变体、分段控制器的滑块、滑杆拇指）、`floating`（锚定浮层：下拉、菜单、popover、hover-card、tooltip）、`sheet`（遮罩式与通知：dialog / drawer / toast / tour / floating-panel / float-button / back-top）。深色主题的三档更重、外加一圈 1px 浅描边，暗底上浮层才分得出层。34 份皮肤全部迁过去，`check-elevation-role` 校验每处阴影都走角色、且 27 个浮层/遮罩面的角色与部件对得上。这是公开面的删减，基线已推。

  **字号不再下探原语。** 新增 `--xh-control-font-sm/md/lg`（控件主文字，与 `--xh-control-h-*` 同构按档走）、`--xh-control-caption-sm/md/lg`（控件里的次级文字：提示、计数、快捷键、清空钮，比同档主文字低一级）、`--xh-text-heading-1/2-*`、`--xh-text-caption-size`、`--xh-text-secondary-size`。皮肤里两百三十处 `--xh-font-size-*` 引用全部换成语义档；typography 的六级标题与 rating 的星标是字号阶梯本身，登记为例外。`check-text-scale` 守住。

  **默认宽度、内衬、轨道、折叠面的共享字面量收成令牌。** `--xh-control-min-w`（12rem）统一了 select / combobox / tree-select / cascader / color-picker / date-picker 六个触发器此前的六个值，time-picker / text-field / date-field / time-field / password-input 五家此前没有任何宽度声明，现在同样接上；`--xh-surface-py/px-sm/md` 统一了 dialog / drawer / tour / floating-panel / toast 的内衬；`--xh-track-thickness` / `--xh-track-thumb-size` 给滑杆与进度条；`--xh-nav-link-max-w`、`--xh-viewport-max-h`、`--xh-motion-scale-drag`（减弱动效归 1）、`--xh-glyph-size-text`（跟文字走的字形尺寸）、`--xh-control-box-sm/md/lg`（pin-input 的方格，随 compact 收）、`--xh-switch-track-h-*`、`--xh-syntax-string/number/keyword`（code-block 与 json-viewer 的语法色，随主题明暗切换，皮肤里不再有 hex 字面量）。`check-shared-slots` 新增「同后缀跨组件字面量互异也报」。

  **聚焦态描边统一成一派。** 此前三派：描边不变只画环、描边跟着环色走（语气轴在这一派整个失效）、只画环不管描边。现在 21 份输入类皮肤都写 `border-color: var(--xh-<c>-<part>-border-focus, var(--xh-_tone, var(--xh-border-control-focus)))`，新令牌 `--xh-border-control-focus` 缺省等于 `--xh-border-control`；time-field 聚焦补上了此前缺的环。`check-focus-ring` 加校验。

  **图标尺寸接线。** 38 份画兜底字形的皮肤在 root（浮层族在 content）上声明 `--xh-icon-size: var(--xh-<c>-icon-size, var(--xh-glyph-size-text))`，兜底字形的盒同样按它量——作者往指示符槽塞 `<XhIcon>` 时不再从 1em 跳到 20px。`check-icon-size` 守住。

  **几何修正。** pin-input 的方格此前缺省引的是 lg 档高度、sm 档引 md；segmented 横排外盒此前 38px（item 32 + 轨道内衬 + 描边），现在外盒本身即一档控件高、段撑满轨道内侧；checkbox 的方框锚在 `--xh-control-indicator-size` 上随 compact 收；checkbox-group 的指示符不再是 16px 字面量。radio-group / checkbox-group / composer 的禁用态去掉叠加的不透明度（与容器一起变淡会把对比度压穿）。

  **门禁。** 新增 `check-stroke-scale`（描边宽度只走 `--xh-stroke-*` / ring）、`check-keyboard-suites`（键盘表非空 ⇒ 一致性套件存在且两个适配器都登记）；`check-control-height` 按「组件 → 控件本体部件」显式管辖（button / toggle / segmented / pagination 等此前在门禁外）并校验 sm/md/lg 档位与 `data-size` 对应；`check-disabled-contrast` 改正则并加跨块判定；`check-shape-scale` 扩到逻辑角与私有槽；`check-keyframe-refs` 增扫适配器源码里的内联动画名（反馈服务的加载徽记改用 Web Animations，不再依赖某份皮肤在场）；`check-state-vocabulary` 接上 `state-vocabulary.json` 真源（`data-state` 的 43 个取值分 9 个族，connect 字面量与皮肤选择器两头对表，并报告「发射但零引用」的属性）；`check-token-refs` 禁皮肤里的颜色字面量。

  **套件。** 补 image-viewer（8 行键盘表，Tab 循环两行 jsdom 豁免）与 side-nav（10 行含折叠态弹出）的一致性套件，Vue 与 WC 两侧登记。

- 35c9b65: 相似组件与组合组件的视觉、动效、行为收成一套口径。

  **盒的定义统一了。** 此前 16 个输入 / 选择控件有三种「盒」：9 家由 `control` 画描边与底、5 家由 `trigger`（一个 `<button>`）当盒、2 家由 `input` 自画。盒是 button 的那 5 家（select · cascader · tree-select · popselect · color-picker）没法把清空钮放进框里，只能贴在框外——这就是「清空钮位置不统一」的总根因。现在判据只有一条：**解剖里有 `control` 就是盒**，`trigger` 退化成盒内那颗 `flex: 1 1 auto; border: 0; background: transparent` 的按钮，聚焦环改画在 `control:focus-within` 上。cascader / tree-select / popselect / color-picker / text-field 的解剖新增 `control` 部件。

  **尾部按钮一律在框内最右。** 盒内布局恒为「内容区 `flex: 1` → 尾钮组 `flex: none`」。段位并排、没有单一容器的四家（date-field · time-field · date-picker · time-picker）新增 `segment-group` 部件把段位与分隔符包起来当内容区（date-picker 原有的 `input` 分段容器改名 `segment-group`，四家从此同名同职），`margin-inline-start: auto` 那套 hack 删掉。行内动作钮（清空 / 展开 / 明暗切换 / 加减）一律 `--xh-control-action-size` 方钮——number-field 的加减钮与 password-input 的明暗钮此前是「贴边的控件高钮」。

  **并排成对的面板定高。** 新增 `--xh-viewport-h-sm/md/lg`（12/16/24rem，compact 同比例收）。transfer 两侧列表此前是 `min 8rem / max 16rem`，条目搬走后整个组件跟着变矮——现在定高 `--xh-viewport-h-md`，左右等高、空侧也占满。cascader 的列、date-picker / time-picker 的时间列同样定高；单个浮层面板仍内容驱动，但补上了此前缺失的高度上限。

  **菜单族三家逐条同值。** `menu` / `menubar` / `context-menu` 共用同一台机器，皮肤却各写各的：menubar 根本没有 `item[data-state='open']` 这条规则，所以「发送到…」展开时不像 menu 那样加粗高亮。现在条目内衬 / 字号 / 圆角 / 行高 / 展开态 / 高亮态 / `content` 外观 / `separator` / `group-label` 全族同值，menu 补齐 `group` / `group-label` / `separator` 部件，子菜单箭头走字形令牌。navigation-menu 与 side-nav 的弹出面板按同族口径归队。

  **浮层面板与输入族小件归队。** `content` 一律双槽内衬 + 族档 min-w / max-w；cascader 的 48rem、color-picker 的 15rem、tour 的 22rem 等裸值改令牌（新增 `--xh-overlay-max-w-xl`）；label 颜色与间距、图标尺寸随档、聚焦环私有槽（invalid 时变红）、`:focus-within` 的禁用守卫、disabled / readonly 的三样齐——逐条统一。password-input 的明暗钮用上了新的 `--xh-glyph-mark-eye` / `-eye-off` 字形令牌。

  **门禁**：`check-control-box`（盒结构 12 条判据）、`check-panel-height`（面板高度只走滚动面令牌、并排面板必须定高）、`check-family-parity`（菜单族 / 分段族 / 下拉族 / 气泡族逐条同值）。

  公开面：五家 `--xh-<c>-trigger-*` → `--xh-<c>-control-*` 槽改名、date-picker 的 `input` 部件与 `XhDatePickerInput` 组件改名 `segment-group` / `XhDatePickerSegmentGroup`、`--xh-hover-card-font-size` 与 transfer 的 `-list-min-h` / `-list-max-h` 删除，共 43 项，基线已推。

## 1.0.0-alpha.2

### Minor Changes

- 091bbef: 补上动效地基的四个缺口。

  **减弱动效此前基本是失效的。** `tokens.css` 里一个 `prefers-reduced-motion` 都没有，降级靠 19 份皮肤各写各的 `@media`，而它们只把 `animation-duration` 压到 `0.01ms`——位移与缩放是写死的字面量，压时长压不掉。前庭不适恰恰来自大位移与缩放，所以「减弱动效」的用户看到的是瞬间跳完整段位移。现在幅度走 `--xh-motion-distance-sm/-md` 与 `--xh-motion-scale-enter`，令牌层在 reduce 下把它们归零，皮肤不必自带 `@media`。删掉 8 份已经冗余的降级块（含 8 条 `!important`）；marquee / skeleton / spinner 那几处有讲得通的自定义降级，保留。

  **dialog 与 image-viewer 的退场动画从来没播过。** 皮肤给挂着退场动画的 `content` 补了 `[hidden]{display:none}`，收起时元素当场不生成盒子，动画不启动，退场探测器放弃申领租约、就地卸载。drawer 早就绕开了这个坑，它的注释还写着「与 dialog 一致」——而 dialog 恰恰是反的。现在真的一致了，四条退场动画同时补上 `forwards`。

  **Web Components 端全域没有退场动画。** 三个浮层元素把收起写死在展开态上，与 `data-state="closed"` 同帧写内联 `display:none`。现在收起跟着 presence 走；Light DOM 下被拉长的不是节点存在的时间，而是可见的时间。

  **破坏性程度**：进场缩放统一到 `0.96`（此前 0.98 与 0.96 混用），dialog / toast 进场 / color-picker 的起势略明显一点。button 的加载转圈不再被压成 `0.01ms`——转圈是「系统还在做事」的唯一可感知信号，压掉等于把加载态变成假死。

  回归测试进了 `tests/browser/`：jsdom 不把样式表里的 animation 算进 `getComputedStyle`，这三件事在 jsdom 里结构性测不到。

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

## 1.0.0-alpha.1

### Minor Changes

- f72664d: 新增 `--xh-border-control` / `--xh-border-control-hover`，并让 `data-contrast='more'` 第一次真的起作用。

  **控件边界这一族。** WCAG SC 1.4.11 要求控件边界对相邻色达 3:1，而 `border.default` 对画布浅色只有
  1.26、深色只有 1.91——12 组边界组合一组都不达标。容器分隔线不在这条规格的范围内，把
  `border.default` 整个调深会让每条分隔线跟着变重，所以另立一支专供控件边界的令牌：

  |                             | 取值          | 对 canvas | 对 surface |
  | --------------------------- | ------------- | --------- | ---------- |
  | 浅色 `border.control`       | `neutral.450` | 3.23      | 3.23       |
  | 浅色 `border.control-hover` | `neutral.500` | 4.73      | 4.73       |
  | 深色 `border.control`       | `neutral.550` | 3.59      | 3.23       |
  | 深色 `border.control-hover` | `neutral.500` | 4.18      | 3.76       |

  两个静息档都是中性色阶里**第一个过 3:1 的档**：再退一档浅色掉到 2.59、深色掉到 2.54；再进一档浅色
  跳到 4.73，那已是正文级重量，1px 描边取到那里整屏会发硬。悬停档单列一支是必须的——沿用
  `border.strong`（浅 1.48 / 深 2.28）会让悬停比静息更淡。

  **`data-contrast='more'`。** 主题运行时一直在往根元素写这个属性，5 个运行时文件解析它、测试也断言它，
  但令牌产物里一条 `[data-contrast]` 选择器都没有，写上去没有任何东西响应。现在它产出一套边界覆盖，
  判据是每条边界对两种底都不低于 4.5:1（与正文 AA 同一条线），取值同样全部从既有色阶里挑。

  判据从 65 条涨到 102 条：控件边界的 3:1 是硬门槛、悬停必须比静息更重、装饰边框的棘轮从 8 组补到
  12 组（`bg.surface` 底那 4 组此前没钉）、高对比档逐条断言。

  本次只动令牌层，皮肤尚未切换到新令牌，**默认外观一字未变**。

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

## 1.0.0-alpha.0

### Major Changes

- bc65cb7: 首个公开版本：框架无关的 UI 基座。

  自研薄 FSM 内核 + headless（anatomy / machine / connect）+ 设计令牌与主题运行时 + 样式层，
  102 个组件在 Vue 与 Web Components 两套适配器上共用同一份内核，跨适配器一致性套件与
  真实 Chromium 里的无障碍扫描、浮层定位契约全绿。

  浮层定位、虚拟滚动、Web Components 响应式基类、代码着色、流式 Markdown 均为自研，
  运行时不带第三方依赖。
