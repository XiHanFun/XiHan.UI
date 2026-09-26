# XiHan.UI 统一组件设计方案

状态：已生效。

本文只规定组件应当怎样设计、怎样确定样式、怎样实现和怎样验收。所有后续组件和现有组件重构必须遵守；单个组件不得自行偏离。

## 1. 规范级别

- **必须**：不满足即不能合并。
- **应当**：默认执行；只有存在明确的组件语义冲突时才能例外，并在文档和测试中说明。
- **可以**：按组件能力选择，不构成统一公开契约。

当局部组件需求与本规范冲突时，先修改本规范并完成评审，再改组件。禁止在组件 CSS、适配器或示例中偷偷形成第二套规则。

## 2. 组件设计步骤

每个组件按以下顺序设计，不得从画样式开始：

1. 确认组件是否有必要存在。
2. 定义用户任务、何时使用、何时不用。
3. 归入组件家族。
4. 定义 anatomy、状态、事件和键盘行为。
5. 确定受控/非受控、异步和生命周期契约。
6. 按统一规则确定尺寸、圆角、材质、颜色和动效。
7. 实现 Headless，再实现三个适配器和共享皮肤。
8. 完成文档、示例、生成物、测试和 changeset。
9. 验证通过后独立提交。

### 2.1 是否新增组件

同时满足以下条件才新增：

- 解决一个稳定、可重复出现的用户任务。
- 现有组件组合无法在不复制行为的前提下完成。
- 拥有明确的语义、状态或生命周期边界。
- 能定义稳定 anatomy，而不是某个页面的临时布局。
- 至少有一个可验证的无障碍和交互契约。

以下情况不新增：

- 只是现有组件换颜色、圆角或间距。
- 只是某个业务页面的固定排列。
- 只为缩短少量模板代码。
- 需要大量互斥 props 才能解释其身份。
- 与现有组件功能相同，仅名称不同。

图表类组件按「数据任务 + 坐标系 / 布局」划分：同一坐标系里标记种类不同的是系列类型（`mark`），同一标记外观不同的是样式轴。柱状图与条形图、折线图与面积图、散点图与气泡图、饼图与环形图、矩形树图与旭日图都不是两个组件；仪表盘与子弹图是 Progress 在 meter 语义下的形态，不另建组件。

## 3. 分层实现

```text
Primitive Tokens
  └─ Semantic Tokens
      └─ Family Recipes
          └─ Component Slots

Core Behaviors
  └─ Headless Component
      ├─ Vue Adapter
      ├─ React Adapter
      └─ Web Components Adapter
          └─ Shared CSS Skin
```

### 3.1 Core

Core 只放跨组件可复用的行为原语：

- 焦点、选区、集合导航、Portal、Dismiss、Presence。
- 图层仲裁、滚动锁定、表单重置、环境检测。
- 与框架、组件名称和具体 DOM 结构无关的算法。

### 3.2 Headless

Headless 是组件行为真源，必须包含：

- Props、Context、State、Event、Action、Guard 和 Effect。
- `connect` 产生的 DOM 属性、事件处理器和状态属性。
- anatomy、required parts、键盘表和元数据。
- 默认值、非法输入校验和可访问名称生成。

跨框架行为不得在适配器中重新实现。

### 3.3 适配器

Vue、React、Web Components 只负责：

- 框架响应式接入。
- DOM 引用、Portal 目标和原生监听器。
- 将同一 Headless API 渲染为各自节点。
- 生命周期的绑定与释放。

适配器不得改变状态语义、默认值、键盘行为或事件载荷。

### 3.4 共享皮肤

- 三端必须消费同一份 CSS。
- CSS 只依赖 `data-scope`、`data-part`、状态属性和语义令牌。
- 不以框架类名、组件实现细节或 DOM 顺序作为唯一选择依据。
- 组件状态由 Headless 发出，CSS 不通过内容猜测业务状态。

## 4. 组件家族

新组件必须先归族，再决定局部样式。

| 家族 | 典型组件 | 必须复用的规则 |
| --- | --- | --- |
| Action Control | Button、Toggle、ToggleGroup item、分页按钮、图标按钮、Toolbar item、Segmented item、Tabs trigger、各类 trigger | 高度、内边距、图标随档、缺省语气（§7.2）、按承载面的交互阶梯（§7.2）、按压（§9.1）、焦点、禁用、加载 |
| Field Chrome | Input、Textarea、Select Trigger、Date/Time Field、Combobox、Cascader、TagsInput、PinInput、PromptInput | 静息描边外壳（§8.3）、`outline\|subtle\|ghost` 三档 × rest/hover/focus/invalid/disabled/readOnly/loading 七态、placeholder、前后缀、清空、标签与说明排版（§6.4） |
| Collection Item | Menu Item、Listbox Item、Tree Node、Table Row、Transfer Item、SideNav Link、Tabs line trigger、Anchor link、Breadcrumb link、NavigationMenu / Menubar trigger | highlighted、按集合语境的 selected/current 标记（§7.3）、pressed 只换面（§9.2）、disabled、缩进、指示器 |
| Surface | Card、Alert、Panel、CodeView、DiffView、Log、JsonViewer、ToolCall、Reasoning、Approval、QuestionFlow、Accordion/Toolbar/PageHeader 的 outline 档、Tree/Listbox/Transfer/List/Descriptions/Table 容器面 | 边界三选一（§8.3）、raised 逐部件登记（§8）、标题/说明排版（§6.4）、内衬只走 `--xh-surface-*`、层级 |
| Overlay | Popover、Menu、Select content、Dialog、Drawer、Tooltip、NavigationMenu content、日期/时间面板 | Portal、定位、遮罩、材质按内容判定（§8.4）、进退场按锚定关系（§9.5）、浮层滚动面（§6.6）、焦点归还 |
| Feedback | Toast、Notification、Progress、Skeleton | 状态语气、sheet 面描边（§8.4）、计时、暂停、消除、加载和即时反馈 |
| 图表家具 | 网格线、坐标轴、刻度、轴标签、十字准线、参考线 / 参考带 | 只用 `--xh-chart-*` 家具令牌；网格为 1px 实线；文字用文字令牌，不用系列色（§6.7） |
| 数据标记 | 柱、线、面积、点、扇区、节点、流带、树图格 | 颜色只来自数据色（§7.6）；不投影 Action Control、不做按压缩放；相邻标记用 2px 表面间隙分隔，不画描边（§6.7） |

新增 Family Recipe 必须满足以下任一条件：

- 已有两个明确消费者。
- 单个组件具有不可共享但稳定的结构身份，并经过专项评审。

禁止多个组件复制相同状态样式后再各自维护。

### 4.1 部件归族表

一个组件可以横跨多个家族，但每个部件只能有一个主要身份；下表为门禁登记与家族比对的依据。

| 部件 | 家族 | 备注 |
| --- | --- | --- |
| Segmented / Tabs segment 的轨道 | Surface（淡底面） | 形状 surface；见 §6.3 |
| Segmented / Tabs segment 的滑块 indicator | raised 部件 | 白色抬起面 + border-default；见 §7.3 |
| Toggle、ToggleGroup item、Toolbar `aria-pressed` 项 | Action Control（无滑块开关） | 选中 = 品牌淡底；见 §7.3 |
| Tabs line trigger、Anchor link、SideNav link、NavigationMenu trigger / 面板 link | Collection Item（导航当前） | 当前 = 指示条 / 字色；SideNav link 投影 `data-xh-collection-context='page'`，其余投影 `'nav'`（Tabs 只在 line 档投影，另投 `data-current`；NavigationMenu trigger 展开时投影 `data-in-path`）；见 §7.3 |
| Breadcrumb link | Collection Item（导航当前） | 当前页是不可点位置：`aria-current="page"`，`--xh-fg-default` + medium，无指示条；投影 `data-xh-collection-context='nav'`，当前页再投影 `data-xh-collection-terminal`（它同时带 `aria-disabled`，不显式标会被家族禁用面吃掉）；见 §7.3 |
| Menubar trigger | Collection Item（展开路径 / 打开中） | 没有当前态：open 与家族 hover 同档的中性面，不用品牌色、不加粗；投影 `data-xh-collection-context='nav'`，展开时投影 `data-in-path`；见 §7.3 |
| Pagination item、Steps indicator、Calendar cell | Action Control（格状当前） | 当前 = 实心品牌；见 §7.3 |
| CheckboxGroup item / select-all trigger、RadioGroup item、Steps trigger | Action Control `row` profile | 只换面不缩放；方框 / 圆圈 / 圆点是宿主内的标记，读宿主 host 槽；见 §9.2 |
| Accordion / Collapsible / Reasoning / ToolCall trigger、CodeView fold-trigger、DiffView gap-trigger | disclosure trigger | 只换面，不缩放；见 §9.2 |
| FloatButton、BackTop、Carousel 翻页、Log/MessageFeed 回底、ImageViewer 翻页 | Action Control `floating` profile | 形状 circle；见 §6.3 |
| Tag、Badge、ToolCall status、Approval result、QuestionFlow result | 状态 chip | 形状 pill；见 §6.3 |
| 图表根 | 无壳 | 不画外边、不填底，透出宿主面；需要框时由作者放进 Card |
| 图例项 | Action Control `text` profile、ghost、xs 档 | 按压 0.97；显隐标记见 §7.3「图例显隐」 |
| 图例色标 | 标记 | 柱、面积系列为方块（inset）；折线为 2px 短线（pill）；散点为该系列的符号 |
| 图表提示框（含 Heatmap 详情条） | Overlay：frosted | 不反白；见 §8.4 |
| 图表十字准线标签 | 反白小标签 | 与 Tooltip 同一身份：反白底、control 4px |
| 图表参考线 | 图表家具 | 1px 虚线 `--xh-fg-muted`：虚线只表达阈值 / 目标，网格不用虚线 |
| 图表缩放窗口、刷选框 | 选中范围 | `--xh-bg-brand-subtle`（选中语义）；刷选框另加 1px `--xh-border-control-focus` |
| 图表缩放手柄 | 拖动手柄 | pill；粗指针 44px 命中区 |


## 5. 样式确定方法

组件样式必须按以下决策顺序确定。

### 5.1 第一步：确定功能身份

| 问题 | 结果 |
| --- | --- |
| 用户是否直接触发动作 | Action Control |
| 用户是否输入或选择值 | Field Chrome |
| 用户是否在集合中导航、选择或操作条目 | Collection Item |
| 组件是否长期承载一组内容 | Surface |
| 组件是否脱离文档流并临时覆盖页面 | Overlay |
| 组件是否表达任务过程或结果 | Feedback |

一个组件可以组合多个家族，但每个部件只能有一个主要身份。例如 Select 的 trigger 属于 Field Chrome，option 属于 Collection Item，content 属于 Overlay。

### 5.2 第二步：确定视觉轴

只允许使用以下公共轴：

- `size`：sm、md、lg。
- `variant`：结构形态，不表达业务状态。输入类与容器类共用 `ControlVariant = outline | subtle | ghost`，可按下的表面在其上多一档 `solid`（`ActionVariant`）。缺省等价于 `outline`，Headless 默认值必须落 `variant: 'outline'`，不允许存在「不传 variant」的第四种形态。三档的面定义见 §8.3：outline = 描边、subtle = 淡底、ghost = 无壳。有框/无框只走这一条轴：废弃 `bordered`、`borderless`、`plain | surface`、`primary | secondary` 等私有轴（`surface ≡ outline`、`plain ≡ ghost`；Card 的 `secondary` → `subtle`、`tertiary` → `ghost`）。Tabs 的缺省 `variant` 为 `line`。
- `tone`：neutral、brand、info、success、warning、danger。
- `density`：comfortable、compact，由环境统一控制；comfortable 是基线。
- `orientation`：horizontal、vertical，仅结构确实支持两种方向时提供。

禁止用 `type`、`color`、`status`、`danger` 等多套 props 重复表达同一视觉结果。

### 5.3 第三步：确定层级

从低到高：

```text
canvas → solid（描边面）/ subtle（淡底面）→ raised → floating / frosted → sheet
```

- 页面背景使用 canvas；亮色保持白页白卡，层级差交给描边，subtle 阶梯不动。
- 静态内容面缺省使用 solid：`--xh-border-default` 描边 + `--xh-bg-surface` + 无影（§8.3）。
- 淡底面使用 subtle：`--xh-bg-subtle` + 透明边位 + 无影；淡底与描边互斥、淡底与阴影互斥。
- raised 只给 Card 与「可抬起 / 可拖起」的部件（Segmented / Tabs segment 滑块、Slider / Switch thumb、Button soft），逐部件登记；raised 面必须带 `--xh-border-default` 描边，影只是加成，亮色 raised 背景不分档。
- 锚定瞬态浮层按内容判定：短列表 / 菜单 / tooltip 用 frosted；含网格或多列的锚定面板用 floating（§8.4）。
- Dialog、Drawer、Command、Toast、Notification、Tour 等模态与强反馈面统一 sheet（`--xh-material-elevated-*`）。

同一页面不允许用更多阴影表达同一级别。层级优先通过描边和间距确定，背景差只在暗色下补充，阴影只表达真实抬升；`--xh-border-subtle` 只作内部分隔，不作任何根面外边。

### 5.4 第四步：确定状态

先画 rest，再按固定顺序补齐：

```text
hover → active/pressed → focus-visible → selected/open
→ disabled → loading/pending → invalid/error → dismissing/unmounted
```

不能只完成默认状态。任何状态缺失都视为组件未完成。

selected / current 的标记方式不由组件自定，按 §7.3 的「语义 → 标记」表取唯一一种；open / in-path 与家族 hover 同档，不占独立灰阶。

### 5.5 第五步：确定环境变化

每个视觉决定必须回答：

- 暗色下是否仍保持相同层级。
- compact 下哪些尺寸和间距改变。
- RTL 下方向是否镜像。
- 粗指针下命中区是否足够。
- reduced motion 下如何保留反馈。
- reduced transparency 下模糊材质如何转为实体面。
- forced colors 下边界和状态如何可见。
- 打印时是否应隐藏、转实体或回到正常流。

## 6. 强制视觉尺度

### 6.1 间距

| 类型 | 允许值 |
| --- | --- |
| 基础网格 | 4px |
| 半阶补偿 | 2、6、10px |
| 常用间距 | 4、8、12、16、20、24、32px |

规则：

- 所有 padding、gap 和布局间距必须走令牌。
- 2/6/10px 只用于图标基线、紧凑控件和几何补偿。
- 不允许 5、7、9、13、15px 等散值。
- 信息关系越紧密，间距越小；不同信息组至少提升一个间距档位。

### 6.2 控件高度

| 密度 | sm | md | lg |
| --- | ---: | ---: | ---: |
| comfortable | 32px | 36px | 40px |
| compact | 28px | 32px | 36px |

- md 是默认尺寸。
- 同一 `size` 不随断点自动改变高度。
- 图标按钮视觉盒遵循同一高度。
- 粗指针命中区至少 44×44px；可以用伪元素扩展，不能改变布局盒。

字段的宽度同样是一族一个数，不随内容走：

| 槽 | 令牌 | 值 | 含义 |
| --- | --- | ---: | --- |
| `--xh-<c>-control-w` | `--xh-control-w` | 16rem | 不传尺寸时单行字段根的 `inline-size`；选中一条很长的选项触发器也不变宽，文字在盒内截断 |
| `--xh-<c>-control-min-w` | `--xh-control-min-w` | 12rem | 被 flex / grid 容器压缩时的底线；根上写成 `min(缺省宽, 底线, 100%)`，底线不高过缺省宽，容器比底线还窄时收成容器宽 |

- 根另带 `max-inline-size: 100%`；盒（control）只写家族的 `min(…, 100%)` 地板，由根撑开。要撑满表单列由使用者在根上写 `inline-size: 100%`。
- 刻意例外（须登记进 check-control-box 的 EXEMPT）：DateRangePicker 起止两组按日的段位、分隔符与日历钮排在一行，内容比缺省宽宽，缺省 `inline-size: max-content`、地板取 `--xh-control-w`（按年、按月时不比别的字段窄）；PinInput 由格数与格宽定宽；PromptInput 铺满宿主；Field 的控件铺满表单列；Clipboard 只放复制钮的用法是独立按钮，缺省宽只给带输入框的用法（`:has(control)`）。
- 示例不写内联宽度，让文档展示缺省宽；只有演示宽度本身的示例才改槽。

### 6.3 形状身份

| 角色 | 圆角 | 给谁 |
| --- | ---: | --- |
| inset | 4px | 嵌在 control 内的小块：checkbox 系方框、菜单项、字段内 field-inset 钮、table 行选择框、select-all 方框、色块 item；数据标记：柱的远端（基线端直角）、矩形树图 / 冰柱格、桑基节点、图例的柱色标（均夹到短边一半） |
| control | 4px | 一切在 chrome 内或随文的按钮与字段：Button、Input、Select Trigger、Toggle、分页按钮、close/clear trigger、kbd、tooltip、rating item、tabs / steps trigger |
| surface | 8px | Card、Alert、Panel、列表容器、Segmented 与 Tabs segment 的轨道 |
| overlay | 12px | Popover、Menu、Dialog、Drawer、Toast |
| circle | 50% | 宽高相等的圆形对象：avatar、icon-wrapper、radio / question-flow 单选指示器及内点、switch / slider / color thumb、steps / timeline indicator、spinner 与全部加载环、色块选中徽标、skeleton circle；以及悬浮于内容之上的单图标动作（FloatButton、BackTop、Carousel 翻页、Log / MessageFeed 回底、ImageViewer 翻页，走 Action Control `floating` profile）；图表的数据点与端点、关系图节点 |
| pill | 9999px | 仅两类身份：(a) 状态 chip：Badge、Tag、ToolCall status、Approval result、QuestionFlow result；(b) 一维对象：switch 轨道、slider / progress / strength / upload 的 track 与 range、tick、hairline separator、tabs / anchor / navigation-menu 滑动指示条、resize / drag 手柄、scrollbar thumb、sortable 落点线、skeleton text、位置指示点的当前拉长态、图例的折线色标、图表缩放手柄、不贴边的 liquid 一维栏（§8.5） |

强制规则：

- 普通按钮、字段、卡片和浮层不得使用 pill。
- 正方盒（inline-size 与 block-size 同槽）必须取 circle，不得用 pill 冒充圆。
- 位置指示点（Carousel indicator、Tour progress-dot）统一为一种语言：8px 圆点（circle），当前项拉长为 20px 胶囊（pill）。
- 序号状态圆点（Steps / Timeline indicator）取 circle；可点分页按钮（Pagination item）取 control，二者不互相对齐。
- 组件不得写 6px、10px 等独立圆角。
- 内层圆角不得大于外层圆角减去内边距（surface 8px 轨道内 2/4px 内距，滑块 ≥ 4px 满足）。
- 相连控件消除相接侧圆角，不使用负 margin 伪造连接。
- 亮色、暗色和 compact 不改变形状身份。
- 取 circle / pill 的新部件必须在 check-shape-scale 的身份表登记。
- 数据标记之间用 2px 表面间隙分隔，不画描边；数据标记的圆角只取 inset 或 circle。

### 6.4 排版

- 正文和控件默认使用 14px；控件字号随 size 档，标签字号不随档。
- 标题、正文、说明、占位和标签必须使用语义排版令牌，并按下表取角色：

| 角色 | 字号 / 字重 / 颜色 | 与相邻元素的间距 |
| --- | --- | --- |
| 字段标签（单字段与复合单字段：Slider、Rating、Signature、Color*） | `--xh-text-label-size` 14 / `--xh-text-label-weight` 500 / `--xh-fg-default` | 贴控件 `--xh-space-1` |
| 集合标题（RadioGroup、CheckboxGroup、Listbox、Tree、TagGroup、Descriptions） | 14 / 500 / `--xh-fg-muted` | 与集合 `--xh-space-2` |
| 说明 / helper | `--xh-text-secondary-size` 13 / `--xh-fg-muted` / `--xh-leading-normal` | 与控件 `--xh-space-1` |
| 错误文案 | 13 / `--xh-fg-danger` | 与控件 `--xh-space-1` |
| Surface / Feedback / 浮层内标题 | 14 / `--xh-font-weight-semibold` | — |
| 页面级面板标题（Dialog、Drawer、Tour） | heading-3 | — |
| 次级标注（计数、快捷键、时间戳、序号） | `--xh-text-caption-size` 12 | — |
| 图表轴标签、数据标签、轴标题 | `--xh-text-caption-size` 12 / `--xh-fg-muted`；轴刻度用等宽数字（`tabular-nums`）；不使用系列色 | 刻度标签与刻度线 `--xh-space-1` |

- 必填星号与错误文案是公共层规则：`--xh-glyph-mark-required` + `--xh-space-1` + `--xh-fg-danger`，自带标签的字段不得各画一套。
- 禁用标签色统一 `--xh-fg-subtle`；单行标签 `--xh-leading-none`。
- 层级通过字号、字重、行高和间距共同表达，不能只调颜色。
- 不使用极小字号换取信息密度。
- 单行控件文字必须垂直居中；多行内容使用正文行高。
- 标题、标签和按钮不写多余句号。

### 6.5 图标尺寸

- 控件内图标随 size 档：sm 16 / md 20 / lg 24（`--xh-glyph-size-sm/md/lg`）；Action Control、Field Chrome、Collection Item 三份配方按档下发，皮肤缺省值只能是 `var(--xh-<comp>-icon-size, var(--xh-glyph-size-md))` 并随 `data-size` 换档。
- `--xh-glyph-size-text`（随文 1em）只允许在纯行内文字组件（Tag、Kbd、Breadcrumb、Typography、Highlight）里使用。
- Feedback 指示符（Alert、Toast、Notification）统一 `--xh-glyph-size-md`。
- 配方内不写 12px / 14px 等字面图标尺寸；xs 视觉盒与 field-inset 字形走 `--xh-control-action-size` / `--xh-control-indicator-sm` / `--xh-glyph-size-sm`。
- 组件自绘的状态字形（排序方向、勾、半选杠、展开方向、抓手等）是指示符，不是控件内图标：按指示符档 `--xh-control-indicator-*` 取尺、与它所在的方盒 / 把手同一支令牌（勾选格里的勾与半选杠按方盒边长 × 0.75，与 Checkbox 同比例；方向字形与盒同边长），随密度一起换档（comfortable 16 / compact 14）。`--xh-<comp>-icon-size` / `--xh-icon-size` 只管作者放进单元格、把手与插槽里的图标，状态字形不得读它——按图标档取的 20px 会比 16px 的方盒与同行文字都大一圈。

### 6.6 组件内滚动

滚动条形态只有两档，按滚动面身份固定：

| 档 | 适用面 | 表达 |
| --- | --- | --- |
| 自绘条（Scrollbar 组件接线） | Overlay 家族所有 positioner 下的 content / list / column；定高小列表（Listbox content、Transfer list、时间列、Cascader column） | `type` 默认 `scroll-hover`（静止隐形、悬停 / 滚动淡入），浮层 4px、页内 6px，壳上 `--xh-scrollbar-track-bg: transparent`，宿主不写 `scrollbar-gutter` |
| 原生细条 | 页内结构容器：Table、Tree、Transfer 面板、Virtualizer viewport、Dialog / Drawer / FloatingPanel body、Layout sider / content、SideNav popout、Log / MessageFeed 视口、日历年网格、Typography pre、作者自建滚动容器 | 统一细条规则住在 reset 层：`:where([data-scope][data-part], [data-xh-scroll])` 上 `scrollbar-width: thin` + `scrollbar-color: var(--xh-fg-scrollbar-thumb) var(--xh-bg-scrollbar-track)`；皮肤不得手写 `scrollbar-width` / `scrollbar-color`；作者容器与文档示例加 `data-xh-scroll` |

边界行为：

- `overscroll-behavior: contain` 只给 Overlay 家族滚动面、模态 body 与粘底视口；页内结构容器保持 auto。
- `scrollbar-gutter: stable` 只给内容高度动态变化的容器（Log、MessageFeed、Dialog / Drawer body），并带 `:not([data-xh-scrollbar])` 守卫。
- 边缘渐隐只在 ScrollArea 的 fade 变体与 Marquee 提供；粘底只由 Core `createStickToBottom` 提供。
- 滑块色阶维持 15 / 25 / 35% 三级；文档站页面滚动条与组件滚动条同一 `type`，不另写覆写。
- 声明了 `--xh-scrollbar-track-bg` 却未接线为宿主的皮肤视为死声明。
- 横向控件带排不下时分两路：Toolbar / Menubar / NavigationMenu / Segmented 折行；Tabs 不折行——标签带只裁主轴（`overflow: clip visible`，不是滚动容器，交叉轴上的焦点环、粗指针外扩与 raised 影都不被裁），标签整体沿主轴 `translate` 位移（机器按 continuous 档补间写进 `--xh-_tabs-scroll`），两端 `prev-trigger` / `next-trigger` 接 Action Control icon 档 ghost 面、静息底换成所在面的盖底（`--xh-tabs-scroll-trigger-bg`，缺省 surface、segment 轨道取 subtle）、挪到头那一侧 `opacity: 0`（与 Carousel 同），横向滚轮按量位移、竖滚轮留给页面，触屏手指沿主轴拖即跟手平移（放不下时 `list` 写 `touch-action: pan-y pinch-zoom`，交叉轴仍归页面），选中 / 聚焦的标签被裁时自动挪进视野；不铺边缘渐隐。

### 6.7 数据标记与图表家具

| 标记 | 规格 |
| --- | --- |
| 柱 | 厚度 ≤ `--xh-chart-bar-max`（24px），带内余量留白；远端圆角 `--xh-shape-inset`，基线端直角；负值柱圆角在下端 |
| 折线 | `--xh-chart-line-width`（2px），圆角连接与端点 |
| 点、端点 | `--xh-chart-point-size`（8px），外带 2px `--xh-chart-surface` 描边环 |
| 面积 | 系列色 × `--xh-chart-area-alpha`（10%）淡洗，上沿为 2px 折线 |
| 相邻填充（堆叠段、相邻柱、扇区、树图格） | 2px `--xh-chart-surface` 表面间隙，不画描边 |
| 网格线 | 1px 实线 `--xh-chart-grid`（= `--xh-border-subtle`）；不用虚线 |
| 轴线、刻度 | 1px `--xh-chart-axis`（= `--xh-border-default`） |

- `--xh-chart-surface` 是承载面：缺省 `--xh-bg-surface`；图表放在淡底容器里时由宿主下发，间隙与描边环才与底色一致。
- 只标需要的标签：端点、极值或故事所在的那条系列，不在每个点上标数值。
- 标签放不下时不裁切：柱的标签移到柱外，仍放不下交给提示框；堆叠中段放不下就不标，由图例、提示框与数据表承担。
- 单系列不显示图例，标题已说明；2 个及以上系列始终显示图例，≤ 4 条折线时建议再加线端直接标签。
- 视口块尺寸包含坐标轴带，卡片里不出现嵌套的纵向滚动。

## 7. 颜色

### 7.1 语义角色

- 背景：canvas、surface、surface-raised、subtle、overlay。
- 前景：default、muted、subtle、disabled、inverse。
- 品牌：brand / fg-on-brand、brand-subtle / fg-on-brand-subtle。brand-subtle 为 12% 品牌拼色（与 tone subtle 同曲线 12 / 20 / 28），专属「选中 / 当前」语义，不再用于 today、completed、open 等未选中语义。
- 状态：info、success、warning、danger、neutral。
- 边界：default（一切根面外边与 raised 面描边）、subtle（仅内部分隔线与分隔伪元素）、strong（仅 contrast-more 与刻意登记的强调边）、control / control-hover / control-focus（字段与焦点边）、danger。

每个实色和柔和语气必须提供匹配的 foreground；组件不得自行计算文字颜色。
- 基础色板：十二个色相 × 11 档（`--xh-color-<red|orange|amber|yellow|lime|green|teal|cyan|blue|indigo|purple|pink>-<50…950>`），由 `tokens/palette.seeds.json` 经 `build/emit-palette.mjs` 按品牌曲线派生，同一档跨色相同一明度。它只给使用者、按颜色点名的色板轴（Heatmap `purple`）与数据色语义层（§7.6）用；皮肤只消费语义角色、语气轴与 `--xh-chart-*` 数据色，不直接取色板。

### 7.2 使用规则

1. 页面主体保持中性，品牌色只用于主要动作、选中 / 当前、焦点和关键进度。
2. 缺省语气：只有 Button 缺省为品牌实心（`solid`）；其余按钮形触发器（Toggle、ToggleGroup item、Clipboard、DownloadTrigger、FloatButton、BackTop、Pagination 非当前、Toolbar item、Tabs trigger、Segmented item、Accordion / Collapsible / Menu / Menubar / NavigationMenu trigger、Carousel / Calendar / ImageViewer 控制、所有 field-inset 动作）缺省中性，只有写了 `data-tone` 才切到语气淡底。浮层里的确认 / 主线动作钮（Popconfirm confirm、Tour next）是该浮层的主要动作，与 Button 主动作同待遇，由连接层显式投影 `solid`；这不属缺省语气，同一浮层里的次要出口（Popconfirm cancel）仍是中性 `outline`。
3. 交互阶梯按承载面而不是按家族：坐在 canvas / surface 白底上的控件 hover `--xh-bg-subtle`（100）→ pressed `--xh-bg-subtle-hover`（200）；坐在 subtle 淡底（轨道、淡底容器）上的控件 hover `--xh-bg-subtle-hover`（200）→ pressed `--xh-bg-subtle-active`（300）；300 只留给 pressed。Collection Item 的 `nav` 语境固定按白底承载阶梯生成（rest 透明面 + `--xh-fg-muted` + regular，hover 100 + `--xh-fg-default`，pressed 200 只换面）。承载面通过 `--xh-action-host-bg-hover / -pressed` 向内下发（Action Control 配方的 ghost / outline 悬停与按下面读这两支，缺省画布承载）；`--xh-action-bg-hover / -pressed` 是控件自身的桥接槽，控件皮肤在自己身上赋值，不能作容器下发口。一个部件既投影 Action Control 又承载内嵌标记时，自己的面必须用 `--xh-action-bg-*` 钉住，`--xh-action-host-bg-*` 只对后代生效（否则 ghost / outline 会把自己身上的 host 槽读成自己的面）。
4. 品牌淡底上的阶梯：rest `--xh-bg-brand-subtle`（12%）→ hover `--xh-bg-brand-subtle-hover`（20%）→ pressed `--xh-bg-brand-subtle-active`（28%）；前景一律 `--xh-fg-on-brand-subtle`。
5. 焦点边框一律 `--xh-border-control-focus`，不随 tone；焦点环 `--xh-ring-focus` 不随 tone。
6. 状态色表达任务结果，不表达空间层级。
7. danger 动作与 error 状态分开定义，不共用业务语义。
8. hover、active、selected 从当前语义面派生，不切换到无关颜色；open / in-path 与所在家族的 hover 同档。
9. disabled 不能只降低 opacity，必须同时调整前景或背景并关闭交互；字段 disabled = `--xh-border-default` + `--xh-bg-subtle` + `--xh-fg-disabled`，readOnly 只换 `--xh-bg-subtle` 不动描边。
10. 错误、选择、加载和警告不能只靠颜色，必须有图标、形状、文案或结构通道。
11. 暗色不是简单反相；overlay 必须能从 canvas 和 surface 中辨认。
12. 所有背景 / 前景组合必须通过对比度门禁；令牌提交附亮 / 暗 × 淡底 / 前景 / 指示条对比度表。

### 7.3 选中与当前态

按语义分类，每类只允许一种标记；配方通过 `data-xh-collection-context='overlay|page|nav'` 与 `data-current` 区分，皮肤只映射桥接槽、连接层只投影：

| 语义 | 对象 | 唯一标记 | 叠加态 | forced-colors |
| --- | --- | --- | --- | --- |
| 对号集合的选中 | Select、Combobox、TreeSelect、Cascader、时间列、Mention、Tree、Listbox、TagGroup | 透明底 + 行尾对号（`--xh-glyph-mark-check`，`--xh-fg-brand`）；正文颜色与字重保持 rest。TagGroup 保持标签自身的面，选中只多一枚文字后的对号。树族单选、多选、级联同一种标记：分支行也放对号，半选画横杠（`--xh-glyph-mark-minus`），不用勾选方框（Tree、Listbox、TagGroup 2026-09-24 起与 TreeSelect 统一） | highlighted = 家族 hover 档；selected + highlighted = hover 档 + 对号 | Highlight / HighlightText |
| 页内持久集合的选中 | Table row、Transfer、SideNav 当前项 | `--xh-bg-brand-subtle` 行面 + `--xh-fg-on-brand-subtle`；Table row / Transfer 另有行首勾选框。配方 `markers.page.glyph` 为 trailing：page 语境若再接对号部件，对号同样落在行尾。SideNav 当前项只有行面与字色，不画起始侧指示条（配方 `markers.page.current: none`，2026-09-22 起） | selected + hover = 20%、selected + pressed = 28% | Highlight / HighlightText |
| 导航当前页 | Tabs line、Anchor、NavigationMenu、Breadcrumb | `nav` 语境：透明面 + 2px 指示条 + 字色 `--xh-fg-brand-strong` + `--xh-font-weight-medium`；指示条由组件自己的滑动 indicator 部件承担（Tabs / Anchor / NavigationMenu，机器量几何、皮肤画在 list 上）；list 里没放该部件时，当前项在自己的 `::after` 上自画一条同规格的静态线（厚度 / 颜色 / 圆角读各自 `--xh-<c>-indicator-*` 同一组槽，不做动画，rtl 随逻辑属性镜像，放了部件即收起）：Tabs 横向贴底、纵向贴行向末端（与部件同侧）；Anchor 竖排贴行向起始缘、横排贴底边（链接为省略号收着 overflow，线画在链接盒内、主轴两端各退 `--xh-space-1` 避开圆角，部件则骑在 list 的轨道上）；NavigationMenu 的 `indicator` 部件表达的是「哪张面板开着」而非当前页，指向当前页面的链接始终自画静态线、不随部件收起（横排 list 里的直达链接贴底边，竖排的直达链接与面板里的链接贴行向起始缘，两端同样退 `--xh-space-1`）；Breadcrumb 当前页为不可点位置，投影 `data-xh-collection-terminal`：`--xh-fg-default` + medium、cursor default、无 hover / pressed | current + hover = 100、current + pressed = 200（terminal 不叠加） | ButtonText |
| 格状当前 | Pagination item、Steps indicator、Calendar 选中格 | 实心 `--xh-bg-brand` + `--xh-fg-on-brand`，不加粗 | pressed = `--xh-bg-brand-active` | Highlight / HighlightText |
| 开关型（有滑块） | Segmented、Tabs segment | 轨道 `--xh-bg-subtle`（surface 形状）内的白色抬起 indicator：`--xh-bg-surface-raised` + `--xh-border-default` 描边 + `--xh-elevation-raised`，字 `--xh-fg-default` | — | ButtonText 边 |
| 开关型（无滑块） | Toggle、ToggleGroup item、Toolbar `aria-pressed` | `--xh-bg-brand-subtle` + `--xh-fg-on-brand-subtle` | hover 20% → pressed 28%；`solid` 变体才允许品牌实心 | Highlight / HighlightText |
| 展开路径 / 打开中（不是选中） | Menu / Menubar / NavigationMenu trigger open、Cascader in-path、SideNav in-path、Date / Time trigger open | 与所在家族 hover 同档的中性面，不用品牌色、不加粗；非颜色通道由 chevron 转向与子面板承担。Menubar / NavigationMenu trigger 投影 `data-in-path`，`nav` 语境 open-path = `--xh-bg-subtle` | — | — |
| 图例显隐（开是常态） | 图表图例项（`aria-pressed`） | 显示：实心色标 + `--xh-fg-default` 文字；隐藏：空心色标（只留描边）+ `--xh-fg-subtle` 文字 + 删除线；不用品牌淡底，否则整排图例都成了品牌底 | hover 100 → pressed 200（白底承载面阶梯） | 色标 CanvasText；隐藏态保留空心与删除线 |

- `--xh-bg-brand-subtle` 退出 today、completed、open 语义：Calendar today 改 inset 1px `--xh-fg-brand` 环 + 品牌字；Steps completed 改中性面 + 品牌对号。
- 集合行不允许零按压反馈；pressed 只换面（§9.2）。
- 选中对号一律落在行尾（`indicator` 列），不放行首：行首一格归前导图标、展开箭头、拖拽把手与勾选框；TagGroup 选中标签的对号同样在标签尾部（2026-09-24 起）。

### 7.4 集合行的语气

Collection Item 家族的 `tone` 表达条目**动作自身的性质**（删除是 danger、停用是 warning），不表达选中、当前、校验结果或加载。不写 `data-tone` 的条目保持中性，与家族缺省逐档一致；写了才切到语气。

| 状态 | 面 | 字 |
| --- | --- | --- |
| rest | 透明（不换面） | `--xh-tone-fg` |
| hover / keyboard-highlight | `--xh-tone-subtle`（12%） | `--xh-tone-fg` |
| pressed | `--xh-tone-subtle-hover`（20%） | `--xh-tone-fg` |

- 静息不换面：整行彩底会把菜单读成色块表，语气由字色承担即可。面只在指针或键盘落到该行时出现，节奏与层级同中性行的「透明 → 100 → 200」，只是换了族色。
- 字色固定取 `--xh-tone-fg`，不取 `--xh-tone-solid`：前者是按 WCAG 兑到 60% 的可读文字色，对本家族会遇到的透明面、语气淡底三态与抬起面共五种底、六个语气全部 ≥4.5（见 `css/tone.css` 的实测记录）。
- 说明行保持 `--xh-collection-description-fg` 的 muted，不跟随语气：一条里出现两种彩字，语气就失去指向。
- 优先级：selected / current 的标记（§7.3）压过语气，disabled 压过一切。同一条既选中又带 danger 时面归选中、语气退出——选中是集合的结构事实，语气只是该条动作的性质。
- `nav` 语境（Tabs line trigger、Anchor / Breadcrumb link、Menubar / NavigationMenu trigger）不接语气：那里的条目表达的是位置而不是动作，语气轴在该语境下不生效，写了也不产出语气面。
- 语气不改字重、缩进和指示器颜色。非颜色通道由图标承担（§7.2 第 10 条）：danger 条目必须同时给图标，不允许只靠红字区分。
- forced-colors 下语气面与语气字一并退出，回到家族的系统色，只保留图标与文案通道。

### 7.5 集合行的槽位

一行按 `prefix | text | shortcut | suffix | indicator` 五列排布，说明占 text 列的第 2 行。每一格的归属固定：

| 槽 | 归属 | 内容来源 |
| --- | --- | --- |
| `prefix` | 菜单族是前导图标（`item-indicator`）；候选列表是作者内容（`item-prefix`）；树族归展开箭头与拖拽把手；穿梭框归勾选框 | 数据里的字形，或适配器的逐条钩子 |
| `text` | `item-text`，也是连打检索的取字来源 | `label` |
| `description` | 第 2 行，跨 text 列 | 数据 |
| `shortcut` | 行尾，菜单族与 Command 才有 | 数据 |
| `suffix` | 行尾，排在快捷键之后、对号之前 | 适配器的逐条钩子 |
| `indicator` | 选中对号，由库按 `aria-selected` 显隐；分支行按标记自身的 `data-selected` / `data-indeterminate` 显形，半选画横杠 | 库 |

- 行首与行尾两格承载任意节点（图标、头像、计数、徽标），家族只管落位，不规定字号与颜色——它们不是文字。
- 行首那一格是装饰：可及名由 `text` 承担，该格一律 `aria-hidden`。
- 导航族（Tabs、Anchor、Breadcrumb、NavigationMenu、SideNav）不接这套槽：那里的条目表达位置，不是一条可配置的数据行。

一行里最多两处次级文字：跨 text 槽第 2 行的说明，和行尾跨两行居中的快捷键提示。两者同档、同色，只是落位不同。

| 槽 | 落位 | 字号 | 颜色 |
| --- | --- | --- | --- |
| `description` | text 槽第 2 行 | `--xh-control-caption-md` | `--xh-collection-description-fg` |
| `shortcut` | 行尾 `shortcut` 列，跨两行居中，排在 `suffix` 之前 | `--xh-control-caption-md` | `--xh-collection-description-fg` |

- 两者都走控件内次级文字档（`--xh-control-caption-*`，比同档主文字低一级），不是 §6.4 表里给非控件语境的 `--xh-text-caption-size`。
- 两者都不跟随语气（§7.4）：一行里出现两种彩字，语气就失去指向。
- 快捷键提示不换行：它是一串按键记号，折行会读成两个组合。
- 快捷键是纯装饰，可及名由条目自己的文字承担；只为真正注册了的快捷键显示提示，写一个不存在的组合比不写更糟。
- 说明与快捷键可以同时出现，此时说明占第 2 行、快捷键仍贴行尾；条目高度由说明行撑开，快捷键不额外增高。

### 7.6 数据色

图表颜色按职责分六类，每类只有一种结构：

| 职责 | 编码 | 结构 | 令牌 |
| --- | --- | --- | --- |
| 分类 | 身份（哪个系列） | 8 个固定顺序的色槽，按系列声明顺序分配 | `--xh-chart-categorical-1…8`、`-other`、`--xh-chart-deemphasis` |
| 有序 | 次序（漏斗阶段、档位） | 单色相，明度单调；最浅一档对表面 ≥ 2:1 | `--xh-chart-ordinal-*` |
| 顺序 | 大小 | 单色相由浅到深；暗色下翻转锚点，小值贴近表面 | `--xh-chart-sequential-start / -mid / -end` |
| 发散 | 高于 / 低于基线 | 冷暖两个色相 + 中性灰中点，两臂等档 | `--xh-chart-diverging-negative / -center / -positive` |
| 语气 | 好坏 | 复用语气轴，必须配图标或文字 | `--xh-tone-*` |
| 涨跌 | K 线、瀑布、盈亏 | 两色；缺省绿涨红跌，主题覆盖一行即可换为红涨绿跌 | `--xh-chart-rise / -fall` |

- 颜色跟随实体：色槽按系列在 `series` 中的声明顺序分配，隐藏、筛选、排序都不重新分配；系列可用 `slot` 固定色槽。
- 不循环、不生成第 9 色：分类系列超过 8 个立即报错，由作者合并为「其他」或拆成多张小图。散点、气泡、雷达这类任意两个标记都可能相邻的形态，只有前 3 个色槽保证两两可分，超过 3 个系列给出开发期提示。
- 单系列用色槽 1；不按数值给名义类目上色；突出一个系列时，其余系列改用 `--xh-chart-deemphasis`。
- 同一张图不混用分类色与语气色。
- 文字不用系列色：数值、标签、图例文字用文字令牌，身份由旁边的色标承担；写在色块内部的标签用 `--xh-chart-on-categorical-N`（构建期按色块亮度在白字与墨字之间择一）。
- 顺序与发散色阶在运行时不由 JS 计算颜色：headless 写入色阶位置 t，皮肤用 `color-mix()` 在令牌锚点之间插值，主题与暗色自动跟随。顺序色阶的锚点同色相，用 `in oklch`；发散色阶的中点是中性色、没有色相，用 `in oklab`，oklch 插值会绕着色相环走出一段杂色。
- 不提供任意颜色的 prop；需要时覆盖系列部件上的组件槽 `--xh-chart-series-color`。

分类色板由基础色板计算得出（`tokens/build/emit-chart-palette.mjs`），亮暗两套分别通过以下检查，由门禁从 `tokens.css` 复验：

| 检查 | 门槛 |
| --- | --- |
| 明度带 | OKLCH L：亮色 0.43–0.77，暗色 0.48–0.67 |
| 彩度下限 | C ≥ 0.10 |
| 色觉障碍分离 | 以 Machado–Oliveira–Fernandes 2009（严重度 1.0）模拟红色弱与绿色弱，相邻色槽与前 3 个色槽两两的 OKLab ΔE×100 ≥ 8；6–8 只在有非颜色通道时合法，色板自身按 8 取 |
| 正常视觉下限 | 相邻与前 3 个色槽两两 ΔE ≥ 15，硬门槛 |
| 任意两色 | 正常视觉 ΔE ≥ 10：隐藏、筛选都不重新分配颜色，原本不相邻的两色随时会挨在一起 |
| 色相分散 | 任意 45° 扇区（8 个色槽的平均间隔）里至多 2 个色槽，同一色系不挤在一起 |
| 离开告警色 | 与 danger 语气每一档的正常视觉 ΔE ≥ 10：图里的红色会被读成告警 |
| 对比度 | 标记对表面 ≥ 3:1；色板自身每个色槽都满足，使用者覆盖后不足时必须有可见标签或数据表 |
| 固定顺序 | 顺序本身是可分性的保证，不随主题改变；色槽 1 是品牌色相 |

- 基础色板同一档跨色相同一明度，分类色必须跨档取值，相邻色槽之间才有明度差。
- 满足全部检查的排法里取相邻色槽在两种色觉障碍模拟下最小 ΔE 最大的一种，并列时取任意两色 ΔE 更大的一种；搜索是确定的，同一份基础色板永远得到同一套结果。
- red 与发红的 orange 由「离开告警色」挡在外面；yellow 整族不进分类色板，同档同明度的色板里它在对白底 3:1 的明度上只剩橄榄色。
- 颜色按浏览器在 sRGB 显示器上的画法换算：基础色板的中档允许略出 sRGB 色域，出界的通道逐个截断，不按降彩度收回。
- 有序色阶单色相、1 对承载面最强且逐档减弱；顺序色阶小值贴近承载面；发散色阶两臂同档、中点是贴近承载面的中性色；涨跌两色在色觉障碍模拟下靠明度拉开。这几组同样由门禁复验。

非颜色通道：

| 通道 | 何时启用 |
| --- | --- |
| 图例 | 2 个及以上系列时始终存在 |
| 符号 | 散点缺省启用；折线在点可见时启用；色槽 N 对应第 N 个符号 |
| 线型、纹理 | 强制色、打印，或任意祖先写了 `data-xh-chart-patterns`；常规模式下不用，因为虚线表达的是预测或阈值 |
| 数据表 | 始终存在（视觉隐藏），见 §13 |

### 7.7 墨色与彩色面

墨色是所在面的前景基色：浅色面上是纯黑，深色面上是纯白。中性装饰（描边、分隔、淡底、交互阶梯）不取不透明灰，而取墨色按比例透明。不透明灰的显著度随底色变化十几倍（neutral 200 描边在黄底上 1.06:1、黑底上 16.68:1），墨色在任何底色上显著度一致，颜色取底色自身的深浅变体。

墨色由域决定。域是声明了自身底色极性的面：

| 声明 | 含义 |
| --- | --- |
| `data-xh-ink="dark"` | 浅色底，黑墨 |
| `data-xh-ink="light"` | 深色底，白墨 |
| `data-xh-ink="auto"` + `--xh-ink-surface` | 由底色以相对颜色语法按相对亮度 0.179 选墨色（与 `tone.css` 的黑白字分界同一个数）；写在 `@supports` 内，不支持时等于未声明。auto 只决定墨色与中性装饰，语气色与表面沿用外层主题；需要它们随极性切换时声明 dark / light |
| `data-xh-ink-margin="ample"` | 底色离分界足够远，允许弱化文字；缺省 `tight` |

库自己渲染的彩色面自动成为域：

| 面 | 做法 |
| --- | --- |
| 实心语气面（Action Control 实心档、Tag solid）、Tooltip 反白面 | 连接层打 `data-xh-ink-surface`，皮肤把自己当前的底色写进 `--xh-ink-surface`；域落在面的直接子元素上，按 auto 同一套规则选墨，更深的后代沿继承取值。面自身的底、字与焦点环仍按外层取值 |
| ImageViewer 看片层 | 两种主题下都压在深色遮罩上，content 声明 `data-xh-ink="light"`；这一层自己的面取原语 |
| liquid 材质 | 液态面按下层写 `data-xh-ink`（§8.5） |

- 域不落在彩色面自己身上：这些面的底色取自 `--xh-bg-brand`、`--xh-fg-default` 等被域改写的令牌，落在自身时底色随域翻转，auto 下还会与墨色互相引用成环。作者自己的区块同理：声明了域的区块，底色取原语或在域外取值。
- 禁用等换底的状态同步换 `--xh-ink-surface`；悬停、按下、在途不翻极性，按静息面取。
- 面内按 auto 求值，需要相对颜色语法；更早的引擎里面内内容保持外层取值。

域内重映射：

| 令牌 | 域内取值（浅色档） |
| --- | --- |
| `--xh-fg-default` | 墨色 |
| `--xh-fg-muted`、占位文字 | `ample` 时墨色 72%；`tight` 时等于墨色，层级只靠字号与字重 |
| `--xh-border-default` / `-control` | 墨色 10% |
| `--xh-border-subtle`、`--xh-bg-subtle` | 墨色 4.5% |
| 白底阶梯 hover → pressed | 墨色 4.5% → 10% |
| 淡底阶梯 hover → pressed | 墨色 10% → 17% |
| `--xh-ring-focus`、`--xh-border-control-focus` | 墨色 |
| Button solid | 墨色实心 + 域底色字 |
| 选中面（原 `--xh-bg-brand-subtle`） | 墨色 12% + 选中字重 |
| Switch 打开 | 墨色轨道 + 域底色拇指 |

- 未声明域的缺省面同样用墨色表达描边与淡底，墨色取主题极性；作者自建的彩色区块即使不声明，描边与淡底也是洁净的，只剩文字需要声明域。置灰字属于文字，缺省面上保持实色，只在域里换成墨色：多段描边拼成的图标置灰时，半透明的交点会叠深。
- 比例由令牌构建生成，皮肤与作者不手填，按「与原中性色对比度相等」求：描边画在面上，在页面底、画布、缺省面与 elevated 面上各求一个比例取最大值，哪种面上都不比原中性色淡；淡底是承载文字、对号与焦点环的面，只按缺省面求，压在它上面的内容对比度不降。浅色档与原中性色一致；深色档描边按最深的页面底（neutral 950）定为 22%，缺省面上略重，淡底 6.2%。
- 墨色淡底与描边是半透明的：要盖住下层内容的面（粘性表头、固定列、浮在内容上的钮、层叠的头像、自动填充遮罩）与压在任意内容上的框（滑杆拇指、裁剪把手）取 `-opaque` 不透明档——同一比例的墨色叠在缺省面上的实色，淡底四支与 `--xh-border-default-opaque`。
- 淡底叠淡底、描边压在自身淡底上会按墨色叠深，这是墨色的本义，不另处理；与半透明色做 color-mix 时取不透明档，否则混出来的面也跟着半透明。
- 半透明色的取色：相对颜色语法只看分量、不看透明度，给 `--xh-ink-surface` 写淡底时写它的不透明档。
- 半透明描边相叠会加深：段间共用描边的组合控件（ButtonGroup、InputGroup、ToggleGroup、Pagination、日历网格、表格单元格）只画一侧，不以负外边距叠边。
- 正文墨色取纯黑 / 纯白，不取 neutral 950 / 50：底色相对亮度 0.15–0.24 时，后两者都到不了 4.5:1。
- 余量：黑墨在相对亮度 ≥ 0.5 的底上、白墨在 ≤ 0.05 的底上才声明 `ample`。
- 放文字的彩色面避开相对亮度 0.15–0.24；品牌色阶 500 落在其中，所以浅色档品牌实心取 600（白字 5.08:1），暗色档取 500 配深字。
- 语气色（danger、success 等）在域内保留自己的实心或淡底面，文字落在自己的面上，不改成墨色。
- contrast more 下域内装饰回到实色（与缺省面同一套高对比取值）；forced colors 下取 `CanvasText` / `Canvas`。

## 8. 材质

| 材质 | 用途 | 强制表达 |
| --- | --- | --- |
| solid | 静态内容面缺省（Surface 家族根面、outline 档容器、Collection 容器面） | `--xh-material-solid-border`（= border-default）描边 + `--xh-material-solid-bg`（= surface）+ `box-shadow: none`；内部分隔用 `--xh-material-solid-separator`（= border-subtle） |
| subtle | 淡底面（Segmented / Tabs segment 轨道、Kbd、`subtle` 档容器、Card subtle） | `--xh-bg-subtle` + `--xh-stroke-thin solid transparent` 占位边 + 无影 |
| soft | 次级操作（Button soft、Tag 等已登记消费者） | 柔和淡底，不加无意义阴影；不用于字段与内容面 |
| raised | Card 与可抬起 / 可拖起部件，逐部件登记 | solid 描边 + solid 底 + `--xh-elevation-raised`；描边必须在，影只是加成；只有可交互时允许 hover 抬升 |
| floating | 含网格或多列的锚定面板（NavigationMenu content、Date / Time / DateRange / TimeRange picker content） | solid 底 + `--xh-border-default` + `--xh-elevation-floating`，不透景 |
| frosted | 短列表 / 菜单 / tooltip 等需要透景的锚定瞬态浮层 | `--xh-material-frosted-*` 四件套（bg + backdrop + border + shadow） |
| sheet | Dialog、Drawer、Command、Tour、Toast、Notification | `--xh-material-elevated-border` + `--xh-material-elevated-bg` + `--xh-material-elevated-shadow` 三件套，必有 1px 描边 |
| liquid | `data-material="liquid"` 下浮在内容之上的导航层：浮动钮、媒体控制、悬浮栏（§8.5） | `--xh-material-liquid-*`：取样 + 折射 + 按下层着色 + 墨色细线与 1px 边缘光 + floating 影；standard 档下这些部件取原材质 |

### 8.1 Frosted

- 只用于需要保留背景空间感的瞬态浮层。
- 背景最终不透明度应在约 82%–90%。
- blur 使用 16px，saturate 不高于 1.08（这一上限只约束 frosted，liquid 见 §8.5）。
- 必须有 1px 可见边界，不能只依赖 `backdrop-filter`。
- 允许 1px 内侧顶部边界光（`--xh-material-frosted-highlight`）：它是 1px 边界的内侧一半，只表达面的厚度，不是玻璃反射；不允许更大范围的高光、反射线或高透明玻璃效果。Tooltip 反白 compact 档不画（§8.4）。
- 大段正文、表单、Card、Table、Toast、Dialog 主阅读面默认不使用 frosted。
- reduced transparency、forced colors 和 print 下移除 blur，使用同语义实体面。

### 8.2 禁止 Glass

- 不允许 `glass` 材质、variant、令牌或配方。
- 不允许将非法的 `glass` 值自动映射为 frosted。
- 发现旧 glass 消费者时必须显式迁移，并按公开面变化提供 changeset。
- liquid（§8.5）是独立角色，不是 glass 的别名：不接受 `glass` 值，不复用 glass 的旧槽名，也不用于 glass 曾经覆盖的内容面与浮层。

### 8.3 边界三选一

边界只由描边承担，阴影与淡底不作为边界。任何根面 / 主面只能取下表之一：

| 形态 | variant | border | background | box-shadow |
| --- | --- | --- | --- | --- |
| 描边 | outline（缺省） | `--xh-stroke-thin solid --xh-border-default`；字段用 `--xh-border-control`（缺省档与 `--xh-border-default` 同色，高对比档才加深） | `--xh-bg-surface`；字段与控件盒 `transparent`，露出宿主的面 | none（Card 加 `--xh-elevation-raised`） |
| 淡底 | subtle | `--xh-stroke-thin solid transparent` | `--xh-bg-subtle`（有 tone 时 `--xh-tone-subtle`） | none |
| 无壳 | ghost | 不写 | 不写 | 不写；只允许分隔线 |

- `--xh-border-subtle` / `--xh-border-strong` 不得出现在根面 `border` 简写里，只能出现在 `border-block-start / inline-start` 类分隔线与 `::after` 分隔伪元素中。
- 字段静息形态 = 描边：`transparent` 底 + `--xh-border-control` + `--xh-shape-control` + 无影；hover 升 `--xh-border-control-hover` 并在透明上罩 `color-mix(--xh-bg-subtle 45%, transparent)`，focus-within 换 `--xh-border-control-focus` + `--xh-ring-focus`，invalid 用 `--xh-border-invalid` + `--xh-ring-invalid`；readOnly / disabled 才填 `--xh-bg-subtle`。字段家族不消费 `--xh-elevation-raised`。
- 所有带边框的控件盒同一条规则（2026-09-22 起）：输入框壳、Checkbox / CheckboxGroup / Transfer / Table 的方框、RadioGroup / QuestionFlow 的圆圈、Switch 轨道描边、InputGroup 组壳、ColorPicker 控件、FileUpload 拖放区、SignaturePad 画布——静息不填底、描边取 `--xh-border-control`，它在缺省档与浮层面板、卡片的 `--xh-border-default` 同色（页面里只有一种边线重量），`prefers-contrast: more` 才换到 3:1 的 neutral 600 / 400。`--xh-bg-canvas` 保留给自动填充遮罩、色块选中环等必须不透明的地方，不再是控件盒的底。
- 字段的 `subtle` / `ghost` 只限有壳容器内（InputGroup、Command 面板、Toolbar）使用，hover / focus 必须浮出 `--xh-border-control`。
- 刻意例外（须登记）：浮层面板内嵌搜索（Command、Cascader 搜索框）允许 `border-block-end` 下划线式；PromptInput 允许 `--xh-shape-surface` 8px，但静息描边仍为 `--xh-border-control`、不用 soft；SignaturePad 画布是画布型字段，按 `aspect-ratio` 撑高、吃不下字段家族配方钉死的控件行高，允许不投影 `data-xh-field-chrome` 而自绘外壳，但值必须与字段规则一致（静息 `transparent` 底 + `--xh-border-control` + `--xh-shape-control` + 无影，落笔升 `--xh-border-control-hover`，disabled / readOnly 按 §7.2 第 9 条）。
- Form 内外字段同形；InputGroup 组壳画 outline 描边，子字段压平为透明。

### 8.4 浮层材质判据

- 内容为短列表、菜单、tooltip、气泡 → frosted 四件套；reduced-transparency 下退回同语义实体面。
- 刻意例外（须登记）：Tooltip 保留反白身份，走 compact 档 frosted（`--xh-material-frosted-compact-*` 的 backdrop / shadow / alpha + 光学层），边不取 `--xh-material-frosted-border`（深色 14% 透明边压在反白深底上不可见），改取 on 色 20% 拼色承担 §8.1 的 1px 可见边界；不画 §8.1 的 1px 内侧顶部边界光（反白深底上不需要厚度提示）。
- 刻意例外（须登记）：图表提示框（含 Heatmap 的详情条）走标准 frosted 四件套 + overlay 形状，不反白。提示框里有系列色标，色槽色按图表所在表面校准，反白深底会让色标失去校准；跟随指针时不做位置过渡；`aria-hidden`，朗读由数据标记承担（§13）。
- 内容含网格或多列（日历、时间列、导航大面板）→ floating（solid + border-default + elevation-floating）。
- 模态与强反馈面 → sheet 三件套；任何浮层不得只靠 box-shadow 分层，content / item 部件必须有非透明 border 或 material-*-border。
- 瞬态浮层与模态不使用 liquid。

完整细则见《交互触感与柔和模糊材质规范》。

### 8.5 Liquid

liquid 是导航层材质：浮在内容之上、内容会从它下面滚过、自身内容很短的控制面。它只在应用级轴 `data-material="liquid"` 下出现（缺省 `standard`，与现有 7 个视觉轴并列，由 Portal 视觉桥投影，最近的祖先生效）；standard 档下同一部件取原材质。

| 允许 | 部件 |
| --- | --- |
| 浮动钮 | FloatButton trigger 与列表项、BackTop、MessageFeed / Log 回底按钮 |
| 媒体控制 | Carousel 翻页钮与指示器、ImageViewer 工具条 / 翻页钮 / 关闭钮 / 计数 |
| 悬浮栏 | Layout 顶栏、底栏（sticky 或 fixed 时）、Toolbar 悬浮档 |

- 不允许：瞬态浮层、模态、Toast / Notification、Card、Table、表单、正文容器；liquid 内再嵌 liquid。栏内的 Segmented、Tabs 继承栏的材质，自身不叠材质。
- 结构五层，自下而上：
  1. 取样：`--xh-material-liquid-backdrop`（blur sm 8px + saturate 140%）。
  2. 折射：只在距边缘 `--xh-material-liquid-bezel`（18px）以内，按边缘法线向内位移。
  3. 着色：色调浅 / 深 × 不透明度；材质自身是一个墨色域（§7.7）。
  4. 边界：墨色 12% 细线承担可见边界，外加 1px 边缘光环；面内无高光、无反射线。
  5. 投影：`--xh-elevation-floating`。
- 可读下限：浅色调不透明度 ≥ 0.48、深色调 ≥ 0.61，标签文字在任何下层上 ≥ 4.5:1。下层均匀且色调已知时可降到通透档（浅 0.24 / 深 0.34）；下层杂乱、有文字、未知，以及首次判定完成前，一律取可读下限。
- 色调按下层决定，不按主题：作者在图片、视频、画布区域声明 `data-xh-backdrop="light | dark"`（杂乱时加 `data-xh-backdrop-busy`），其余读 DOM 计算色；相对亮度 0.179 ± 0.04 滞回。不读像素、不申请设备方向权限。
- 光源：细指针下 1px 边缘光沿周长的亮度随指针方向转动；粗指针与无指针固定左上（RTL 右上）。
- 折射只在 Chromium 内核启用，按内核品牌门控（其余引擎能解析 SVG 背景滤镜却不渲染，不能用 `CSS.supports` 判断）；其余引擎为模糊 + 饱和。尺寸超过 640 × 120 或同一视口超过 3 个时只取样不折射。
- 选中不用品牌色字：品牌字压在彩色下层上会失去对比。选中只用指示块 + 字重。
- 形状：不贴边的一维栏取 pill，浮动钮与媒体控制钮取 circle，贴边铺满的栏不取圆角。
- 环境：reduced transparency 下不透明度 1、无背景滤镜与折射，细线与边缘光保留；contrast more 下不透明度 1、细线 3:1、无光环；forced colors 下 `Canvas` / `CanvasText` + 系统边框；print 随导航层隐藏；reduced motion 下色调切换保留 120ms 淡变、光源固定。
- 下层判定、折射与光源由 core 的液态面（`@xihan-ui/core/visual-environment` 的 `trackLiquidSurface`）承担，同一文档的部件共用一套监听；组件的状态机在启动时把投影了 `data-xh-liquid` 的部件挂进去，作者只需写 `data-material`，不再额外安装或调用。这些行为不改变结构、语义与状态表达；服务端与挂载前输出静态形态（色调随主题、不透明度取可读下限）。
- 按下形变：按住液态面时面朝手指鼓出、沿指向拉长、另一个方向压扁（不低于 `--xh-motion-scale-squash`）；拖离时越拉越长，按越界跟手的衰减趋近上限（沿指向伸长 35%）。松手由 `spring-toggle` 带回原形。形变写成 `--xh-_liquid-deform`，只挂在可交互的面上，定位壳上不挂 transform（会抢走 fixed 的包含块）；减弱动效下不形变。
- 液态组：同一宿主里的几块液态面可结成一组（core 的 `trackLiquidGoo`），共用一层库生成的装饰色块层（`aria-hidden`、不接指针，与装滤镜的 `<svg>` 一起插在宿主最前面）。粘连滤镜把边缘相距约 15px 以内的块连成一片；底色、墨色细线、1px 亮边与投影都沿整组外形画，连起来的液桥同样有边、投影不落进液桥；块自身只留前景与磨砂。色块层跟源块的色调、通透档与光源方向走。强制色下色块层撤掉、块取系统边框。现有组：FloatButton 触发器与列表项（缺省 outline 的液态面；其余形态的面是实心的，不结组）。

## 9. 动效

动效只做四件事：确认操作、交代去向、提示进行中与变化，以及在极少数情况下引导注意。全库动效归为以下角色；组件只选择角色，不自定时长、缓动与幅度。

| 角色 | 用途 | 可动属性 | 时长 / 缓动 | 减弱动效 |
| --- | --- | --- | --- | --- |
| 按压 | 确认按下（§9.1–§9.3） | `scale` + 换面 | `press` / `press`，`release` / `release` | 只换面 |
| 状态 | hover、选中、焦点、校验的换色；liquid 档的交互光（§9.12） | 颜色、描边色、阴影、`opacity`；交互光只动描边上的渐变位置 | `micro` / `enter`；交互光 `glint` / `enter` | 保留淡变；交互光不播 |
| 切换 | 开关滑块、单选圆点、勾选标记 | `translate`、`scale` | `nudge` / `continuous`；短边 ≤ 32px 部件的缩放可用 `settle`；liquid 档的滑块用弹簧 `spring-toggle` | 瞬时 |
| 指示 | 选中指示器在项之间移动（§9.8） | `translate`；尺寸为登记例外 | `move` / `continuous`；liquid 档用双沿弹簧 `spring-lead` / `spring-trail` | 瞬时 |
| 披露 | 内容展开收起（§9.4） | `grid-template-rows` | `expand` / `enter-strong`；`collapse` / `exit` | 瞬时 |
| 出现 | 挂载与卸载（§9.5） | `opacity`、小幅 `translate` / `scale` | `enter` / `enter` 或 `enter-strong`；`exit` / `exit` | 淡变 |
| 列表 | 加入、移除、重排、错开（§9.6） | 同出现；重排用 `translate` | 同出现；重排 `move` / `continuous` | 淡变，无错开 |
| 导航 | 抽屉、侧栏、走马灯、标签带滚动、平滑滚动 | `translate`、滚动位置 | 进 `slide` / `slide`；出 `exit` / `exit` | 抽屉类淡变，其余瞬时 |
| 数值 | 进度、计数、倒计时（§9.7） | `clip-path`、文本 | `move` / `continuous` | 瞬时；倒计时分段 |
| 手势 | 拖拽跟手、松手归位、快甩、越界回弹 | `translate`、`scale`（`scale-drag`） | 跟手无过渡；松手用弹簧并交接松手速度（§9.11）：归位与快甩 `smooth`、越界回弹 `stiff` | 瞬时归位 |
| 循环 | 转圈、微光、脉冲、光标、不定进度、呼吸（§9.12） | `rotate`、`background-position`、`opacity`、`translate`；呼吸只动 `opacity`、`scale` | 循环时长 / `loop`；呼吸 `loop-breathe` / `breathe` | 停止并显示静态替代 |
| 注意 | 抖动、脉冲强调 | — | 只在 `@xihan-ui/animations` 中使用 | 不播放 |
| 数据 | 图表入场、更新、退出（§9.10） | 几何参数、`scale`、`stroke-dashoffset`、`opacity` | `move` / `continuous`；淡入 `enter` | 几何瞬时，淡变保留 |
| 氛围 | 动态背景、跑马灯 | 着色器时间轴、`translate` | 由速度决定 | 冻结或停止 |

表中时长省略前缀 `--xh-motion-duration-`，缓动省略前缀 `--xh-motion-ease-`；弹簧名是 `@xihan-ui/motion` 的预设，由令牌生成。

- 带位移、缩放、旋转或尺寸变化的动画不得使用 `micro`、`enter`、`exit` 三支时长：这三支在减弱动效下保留为淡变（§14.4）。
- `move` 与 `nudge` 的分界：跨位置的换位与尺寸变化（指示器滑移、进度增长、堆叠重排、视口长高）取 `move`（200ms）；原地的小幅几何变化（滑块、勾选标记、展开箭头、拇指缩放）与跟手的拖拽让位、查看器缩放平移取 `nudge`（120ms）。
- 例外：进出场（出现、列表加入与移除、整幅滑出）用 `enter` / `exit` 与对应曲线，关键帧与过渡同一条，前提是其中的位移与缩放只取 `--xh-motion-distance-*`、`--xh-motion-scale-*`、`--xh-motion-travel`：减弱动效下归零，剩下的只有淡变。整幅滑入仍走 `slide`。

### 9.1 离散动作控件

按压缩放只给「定尺的独立动作控件」：inline-size 由 Action Control profile（text / icon / field-inset / floating）决定的按钮、把手、方框、轨道、星、日历格、色块、表格排序钮与展开钮（列头里的排序钮不包列名，是列名之后一颗独立的 icon 档 ghost 钮）。它们必须投影 `data-xh-action-control` 并使用同一配方，同时换底：

| 阶段 | 时长 | 结果 | 缓动 |
| --- | ---: | --- | --- |
| 按下 | `--xh-motion-duration-press`（120ms） | scale 1 → `--xh-motion-scale-press`（0.97），背景进入 active | `--xh-motion-ease-press` |
| 释放 | `--xh-motion-duration-release`（200ms） | scale 0.97 → 1，背景回到 hover/rest | `--xh-motion-ease-release` |

- transform origin 固定为 center。
- 指针 `:active`、键盘 Press 和 Headless `data-pressed` 必须一致。
- 不采用点击波纹。
- 不允许组件自行设置 0.94、0.96、0.98 等缩放。
- 业务事件不能等待动画结束；按下首帧必须先于异步 loading 状态可见。

### 9.2 行级与 disclosure trigger

主体规则含 `inline-size: 100%`、`flex: 1`、含文本的 grid / flex 或高度随内容多行的部件——Menu Item、Listbox Item、Tree Node、Table Row、SideNav link、Accordion / Collapsible / Reasoning / ToolCall trigger、CodeView fold-trigger、DiffView gap-trigger、Tabs trigger、Segmented item、NavigationMenu / Menubar trigger、Anchor / Breadcrumb link、load-more trigger：

- 使用相同的 120ms 按下、200ms 释放节奏。
- 只换面：active 背景，不缩放整个条目。
- 集合行投影 `data-xh-collection-item`（Tabs line trigger、Anchor / Breadcrumb link、NavigationMenu / Menubar trigger 投影 `nav` 语境）；铺满一行的独立动作条目（load-more trigger、审批项）登记 Action Control `row` profile，disclosure trigger 登记 `disclosure-trigger` profile。两档 `press: surface`、`fill: true`：宽度由容器给、高度随内容、按下 `scale: none` 只换面；不允许零反馈。
- Space / Enter 与粗指针触屏由 Headless / pointer 会话投影 `data-pressed`，皮肤 `:is(:active, [data-pressed])`。
- 带内嵌标记的行级宿主（CheckboxGroup item / select-all trigger 的方框、RadioGroup item 的圆圈、Steps trigger 的序号圆点）：激活落在宿主上，宿主投影 `row` profile、`ghost` 形态并在自己身上用 `--xh-action-bg-hover / -pressed` 钉住画布阶梯（100 → 200），同时以 `--xh-action-host-bg-hover / -pressed` 向内声明自己是标记的承载面（200 → 300）；aria-hidden 的方框 / 圆圈 / 圆点不投影配方，只在宿主的 `:hover` / `:is(:active, [data-pressed])` 下换面，走同一时间线（按下 `--xh-motion-duration-press`、释放 micro），不缩放。桥接槽只写不读：host 槽的值由皮肤的私有槽（`--xh-_<c>-host-bg-*`）供给，标记读同一支私有槽即与宿主的 host 槽同源。取值与投影了配方的同类控件逐档一致（CheckboxGroup 方框 = 独立 Checkbox：悬停 `--xh-border-control-hover`、按下承载面阶梯上一档、勾中语气 active、禁用 `--xh-border-default` + `--xh-bg-subtle`；RadioGroup 圆圈同一条阶梯，选中圈描边不换、按下换的是圆点（语气 active）、禁用圆点 `--xh-fg-disabled`；Steps 圆点是格状当前标记，当前步按下 `--xh-bg-brand-active`）。

### 9.3 状态叠加

| 状态 | 强制规则 |
| --- | --- |
| hover + pressed | pressed 优先，使用 active 面和 0.97 scale |
| focus-visible + pressed | 保留焦点环，按压只改变内部表面 |
| selected + pressed | 保留 selected 身份，在其上派生 active 面 |
| danger + pressed | 保持 danger 语气 |
| pending | 首次反馈后锁定重复操作，不持续缩放 |
| disabled | 无 hover、pressed、scale 和业务事件 |
| reduced motion | 取消 scale/translate；换面保留（颜色淡变不属于运动，§14.4） |

### 9.4 Disclosure

- Surface 级 disclosure（Accordion、Collapsible、Reasoning、ToolCall）内容统一 `grid-template-rows: 0fr → 1fr`；展开 `--xh-motion-duration-expand` + `--xh-motion-ease-enter-strong`，收起 `--xh-motion-duration-collapse` + `--xh-motion-ease-exit`；两支时长在减弱动效下瞬时完成。
- 密集 disclosure（Tree、TreeSelect、JsonViewer、SideNav 内联子层、Table 展开行、Truncate）不动高度，刻意瞬时；树族只旋转指示器。
- 指示器与内容同档：内容有动画时随内容用 `expand` / `collapse`；内容瞬时时用 `--xh-motion-duration-nudge`。
- 初始即展开的内容直接呈现，不播展开动画（§9.6 首帧规则）。
- 关键帧集中在 `family/motion.css`，皮肤只引用。

### 9.5 浮层进出场

按锚定关系与面的类型分组：

| 关系 | 关键帧 | 组件 |
| --- | --- | --- |
| 锚定列表 / 菜单 | `xh-overlay-slide-in / out` | Menu、Select、Combobox、Cascader、ContextMenu、Menubar、Mention、TreeSelect、Date / Time picker、ColorPicker、Tooltip（入场 `--xh-motion-duration-enter`） |
| 锚定面板 | `xh-overlay-pop-in` / `xh-pop-out` | Popover、HoverCard、Popconfirm、Tour、Command |
| 无锚定弹出 | `xh-pop-in / out` | NavigationMenu、SideNav popout、FloatingPanel、FloatButton 列表、Pagination 弹层、BackTop、Log / MessageFeed 回底按钮 |
| 面板（sheet） | `xh-sheet-in / out`（位移 md + scale-enter） | Dialog、Notification |
| 整幅滑入（slide） | `xh-slide-in / out`（位移 `--xh-motion-travel`） | Drawer、Layout 抽屉式侧栏：入场 `--xh-motion-duration-slide` + `--xh-motion-ease-slide`，退场 `--xh-motion-duration-exit` + `--xh-motion-ease-exit` |

遮罩与全屏面 `xh-fade-in / out`。皮肤内不得重定义共享关键帧。

- 进场必有退场：凡有进场关键帧的部件必须有对应退场；退场一律经 Presence 等待动画结束再卸载，不用固定计时器。
- 分层：遮罩与面板同时开始、同时退场，在最长的那个结束后卸载；面板内列表的错开从面板进场开始计时。
- 打断：退场中途重新打开时取消退场，从当前透明度继续进场，不先跳回不可见。
- 焦点与事件：进场开始即移入焦点，退场开始即归还；退场中的节点不可命中、不接收键盘；业务回调不等待动画。

### 9.6 列表

- 加入用 `xh-item-in`，移除用 `xh-fade-out`，都经 Presence。重排用 FLIP：读取旧位置、写入新布局、以 `translate` 反向补偿后过渡到 0，`--xh-motion-duration-move` + `--xh-motion-ease-continuous`。
- 错开步长 `--xh-motion-stagger-step`，只对同一批到达的条目按到达顺序计数，最多 5 步；不按 DOM 位置（`nth-child`）计数。
- 首帧规则：初始渲染时已存在的内容（默认展开的披露、默认打开的浮层、历史消息、初始列表）直接呈现，只有用户操作或新数据导致的出现才播进场。headless 以共享状态属性 `data-instant` 标记这类内容，皮肤的进场写在 `:not([data-instant])` 下。
- 启用列表增删动效的集合：TagsInput、FieldArray，以及已有的 Toast、Notification、MessageFeed、Command、Cascader 等；Transfer（两侧同时变化）与 InfiniteScroll（批量追加）不启用。

### 9.7 数值

- 进度类填充（Progress、LoadingBar、FileUpload 进度、倒计时）不动 `inline-size`：填充铺满轨道，以 `clip-path: inset(…)` 显示进度，保留 pill 端头。
- 不定进度以固定宽度的段做 `translate` 往复。
- 倒计时共用一份关键帧；减弱动效下按秒分段显示剩余时间。
- 数值补间（NumberAnimation）的时长由属性给出，减弱动效下直接落到终值。

### 9.8 指示器与性能

- 滑动指示器（Tabs、Segmented、Anchor、NavigationMenu）与 Tour 聚光框共用一套测量：取当前项相对列表容器的 `offset*` 几何，投影为私有槽。不用 `getBoundingClientRect`，因为祖先的进场缩放会让测量值失真。位置用 `translate`，尺寸用 `inline-size` / `block-size`。
- 优先动可合成属性：`translate`、`scale`、`rotate`、`opacity`；`clip-path` 只触发重绘，可以使用。
- 布局属性动画只允许下列登记例外：披露内容的 `grid-template-rows` 与 padding；指示器尺寸（绝对定位、`contain: layout` 的独立小元素）；Switch 滑块按下伸长；Carousel 当前指示点伸长；Layout 侧栏折叠；QuestionFlow 视口与 Toast 堆叠的高度。新增例外须登记理由。
- `will-change` 只写在动画进行中的状态下（`data-animating`、`data-dragging`）。开态常驻会使文字模糊；不可合成的属性不写 `will-change`。
- liquid 档的双沿指示器：起始沿与结束沿各由一支弹簧驱动，去向那一侧用 `spring-lead`、另一侧用 `spring-trail`，移动中被拉长、停下时收回；拉长时块向收到不低于 `--xh-motion-scale-squash`（0.86）。测量与绘制沿用上面的共享几何与登记例外；新的点击从当前位置与速度改向。standard 档保持曲线。

### 9.9 JS 动效

- JS 动效只经 `@xihan-ui/motion`：不直接调用 `requestAnimationFrame` 或以动画为目的的 `setInterval`，不写固定毫秒。
- 时长与缓动从元素读取令牌（`readMotion`），作者对组件槽的覆盖与容器上的 `data-motion` 同时生效；无计算样式时（SSR）用由令牌生成的常量。
- 判断减弱动效必须传入组件自己的元素或窗口，不用全局默认。
- 停留时长（提示停留、自动播放间隔、自动前进、滚动条隐藏延迟、提示存留）不是动效，作为组件属性给出缺省值，不受减弱动效影响；自动播放例外：减弱动效下不自动播放。
- 弹簧只用于这几处：手势松手（缺省），以及 liquid 档的切换、指示、融合分离与按下形变回弹。其余角色用曲线：出现与披露经 Presence 等待 `animationend`，弹簧没有确定的结束时间；数值必须精确落在终值。融合分离落定时由组件把收起的内容藏起来，不依赖 `animationend`。
- 适配器中不写动画代码。

### 9.10 图表

| 场景 | 做法 | 时长 / 缓动 |
| --- | --- | --- |
| 柱入场 | `scale` 沿值轴从 0 到 1，原点在基线 | `move` / `enter-strong` |
| 折线描出 | 共享关键帧 `xh-draw`（`pathLength="1"` + `stroke-dashoffset`） | `move` / `continuous` |
| 扇区展开、数据更新、图例切换 | JS 参数插值（按几何参数插值，不按路径字符串插值），坐标轴刻度同步插值 | `move` / `continuous` |
| 点、标签淡入 | 淡入 | `enter` / `enter` |
| 条目删除 | 收回基线并淡出后移除 | `exit` / `exit` |
| 悬停、聚焦 | 不改几何，只换状态属性 | `micro` / `enter` |

- 错开按系列，最多 5 步；同一系列内的点不错开。
- 首次挂载播放入场；重取数据后的变化按「更新」处理，不再次播放入场。
- 十字准线与提示框跟随指针时不做位置过渡。

### 9.11 弹簧

| 场景 | 档 | 参数 |
| --- | --- | --- |
| 手势松手：Carousel 翻页 / 归位、Drawer 与底部面板滑动关闭 / 弹回、Sortable 放下归位、ImageViewer 平移惯性、Switch 拖动拇指 | 缺省 | `smooth`（刚度 300 / 阻尼 30，超调 0.4%，落定约 283ms） |
| 越界回弹 | 缺省 | `stiff`（600 / 42，超调 0.5%，约 195ms） |
| 惯性滑行：ImageViewer 平移快甩 | 缺省 | 临界阻尼、固有频率 1 / τ（motion 的 `glideSpring`，τ 为投影时间）：以投影落点为目标时恰是指数减速，停在落点 |
| 切换滑块 | liquid | `spring-toggle`（420 / 26，超调 7.5%） |
| 指示器前沿 / 后沿 | liquid | `spring-lead`（520 / 34）/ `spring-trail`（210 / 24） |
| 融合分离 | liquid | `spring-merge`（320 / 24，超调 5.8%） |
| 按下形变回弹 | liquid | `spring-toggle` |

- standard 档超调不超过 3%，liquid 档不超过 8%；`bouncy` 不进入核心组件。
- 速度交接：指针会话（单指与多指）保留最近 80ms 的采样，松手时的速度（px/s）作为弹簧初速度；落点取「当前位置 + 速度 × 投影时间」最近的吸附点。投影时间：Switch 拇指 0.06s、Carousel 翻页 0.2s、ImageViewer 惯性 0.3s。Carousel 往回甩到起点另一侧算收回，不翻到反方向；落定途中再按下时从弹簧此刻的位置接着拖。被系统收走（pointercancel）时不按速度投影，回到原位。
- 快甩阈值（底部面板、抽屉：速度 > 900px/s 或位移 > 35% 即关闭）是停留类参数，作为组件属性缺省值，不是令牌。
- 越界跟手按 `(1 − 1 / (x × 0.55 / d + 1)) × d` 衰减（motion 的 `rubberBand`）：拇指 24px、卡片（Carousel 首末页）60px、面板（ImageViewer 平移范围）80px。
- 中途改向：以当前值与当前速度为初始条件重新求解，位置与速度都不跳变。
- 实现：`@xihan-ui/motion` 的有状态弹簧经 `frameLoop` 驱动；减弱动效下直接落到终态。CSS 侧的弹簧曲线只有令牌 `--xh-motion-ease-spring`（`linear()`，`@supports` 守卫，兜底 `cubic-bezier`），只用于 liquid 档的点击切换；手势一律走 JS。
- Slider 拇指、FloatingPanel、Splitter、Resizable 不用弹簧：值必须精确跟手，或松手即停在原位。

### 9.12 呼吸与光

呼吸只表达「正在进行、给不出进度、需要被察觉」：Badge 圆点的 `pulse`（直播、录制、通话中）、MessageFeed 已发送待首个片段、Approval 待审。有进度用 Progress，只是等待用 Spinner，静态状态（在线、已完成）不呼吸。

- 周期 `--xh-motion-loop-breathe`（3600ms），缓动 `--xh-motion-ease-breathe`（正弦式缓入缓出）；圆点不透明度 0.5 ↔ 1、缩放 0.82 ↔ 1；外扩光环缩放 1 → 2.6、不透明度 0.32 → 0，只播 3 个周期后停止，圆点持续到状态结束。
- 共享关键帧 `xh-breathe` / `xh-breathe-halo`；两道减弱开关，静态替代为满不透明度的圆点；状态必须同时有文字或可及名。

光分三类：

| 类别 | 例子 | 规则 |
| --- | --- | --- |
| 状态光 | 思考中文字、骨架屏、工具调用进行中的扫光 | 循环角色，共享 `xh-shimmer` |
| 交互光 | Button solid 悬停时光沿描边扫过一次；可悬停 Card 的描边随指针亮起 | 只在 liquid 档、`(hover: hover) and (pointer: fine)`；不循环；`--xh-motion-duration-glint` |
| 边缘光 | frosted 1px 顶部边界光；liquid 1px 光环 | 材质的一部分（§8.1、§8.5） |

- 光只走描边，不进面：浅色档 Button solid（品牌 600 底、白字）面内叠 8% 白光，文字对比就从 5.08:1 降到 4.46:1。凡是字压在面上的部件，面内都不加光。
- 融合分离（FloatButton 菜单展开）：列表项从触发器里分离出来，收起时融回，融回落定后才藏起列表，其间列表 `inert`。离触发器近的先走、相邻两项错开交错步长，起点缩放 0.6、淡入晚于位移；位移用 `spring-merge`。粘连只作用在不含文字与图标的装饰色块层（§8.5 液态组），图标在上层保持清晰；只在 liquid 档，减弱动效下不分离、收起当场藏起。

## 10. Anatomy

- 每个可样式化节点必须有稳定 `data-scope` + `data-part`。
- 部件名表达语义，不表达位置、颜色或实现方式。
- Root 承担组件级状态；子部件只接自身状态。
- CSS Parts、Vue/React 导出和 Web Components 作者节点必须对应。
- 可选部件缺席时不得留下空布局。
- required part 缺失必须显式诊断。
- 部件不得因为样式方便重复表达同一语义。

## 11. 状态契约

每个交互组件至少覆盖：

| 状态 | 视觉要求 | 行为要求 |
| --- | --- | --- |
| rest | 可识别但不过度强调 | 原生语义成立 |
| hover | 面或前景变化 | 不能成为唯一入口 |
| active/pressed | 统一触感或集合项换面 | 不延迟事件 |
| focus-visible | 2px 可见焦点环 | 键盘路径完整 |
| disabled | 前景和表面同时降级 | 不响应、不提交 |
| loading/pending | 尺寸不跳动 | 防重复提交 |
| invalid/error | 语气 + 非颜色通道 | 关联错误说明 |
| selected/checked/open | 与 hover 明确区分 | 受控/非受控一致 |
| dismissing/unmounted | 退出和移除顺序明确 | 生命周期回调一次 |

集合和浮层还必须覆盖空、异步、部分成功、超长内容、滚动边界、嵌套和退出中的交互屏蔽。

## 12. API

### 12.1 公开模型

- 复杂组件使用 Compound Parts 暴露完整结构。
- 便利 props 只覆盖唯一、无歧义的常见写法。
- 不为减少几行模板增加会与 Parts 冲突的快捷入口。

### 12.2 Props

- 受控值统一 `value/onValueChange`。
- 开合统一 `open/onOpenChange`。
- 布尔 prop 使用肯定命名。
- 默认值在 Headless 定义，三个适配器不得各自设置。
- 非法组合立即报错，不静默修正。
- `asChild` 或 render prop 只在确实需要替换语义宿主时提供。
- 任意像素调整走 CSS 变量，不扩散成布局 props。

### 12.3 事件

- 复杂事件使用 details 对象。
- 事件名表达已发生事实或明确意图。
- 同一事件三端载荷结构一致。
- 原始 DOM 事件只在调用方确实需要时保留。
- 退出、完成、选择和变更回调必须定义触发时机和次数。

### 12.4 服务

- Toast、Notification、Dialog 等服务必须绑定 Provider 或目标文档。
- 不创建脱离当前配置上下文的静态渲染兜底。
- create/update/dismiss 使用稳定 id。
- update 保持原位置和生命周期，不先删除再创建。
- 跨边界队列只保存可序列化数据，业务回调由宿主侧按 id 管理。

### 12.5 图表

- 数据用 `data`（对象数组）加系列的字段通道（`x`、`y`、`size`、`open`……）表达。`x` / `y` 表示自变量与因变量，不表示屏幕方向；`orientation: 'horizontal'` 即坐标转置。
- 系列类型的判别键是 `mark`，注释的判别键是 `kind`；不用 `type`（§5.2）。
- 缺失值（null、undefined、NaN）是缺失，不按 0 处理：折线断开、柱不画、提示框显示缺失文案。
- 受控对：`hiddenSeries`、`window`、`brushSelection`、`activeKey`，各带 `default*` 与 `on*Change`。多图联动由作者把受控状态接到同一份状态上，不提供全局联动注册表。
- 回调：`onDatumActive(details | null)`（悬停或聚焦，按数据去重）、`onDatumPress(details)`；三端载荷一致。
- 不提供双 y 轴：两个量纲用两张联动的图，或指数化到同一基准。
- 立即报错的输入：对数轴定义域含 0 或跨正负；柱系列所在值轴不含 0；分类系列超过 8 个；同图混用分类色与语气色；同一堆叠组的偏移方式不一致；占比类（饼、漏斗、层级）出现负值；K 线不满足 low ≤ open、close ≤ high；桑基数据成环；层级数据多根、缺父或成环。
- 块级结构（图例、视口、提示框、缩放条）以组合部件暴露，由作者摆放；绘图区里的标记按数据生成，作者不逐个书写。

## 13. 无障碍

- 优先使用原生 button、input、dialog、table、progress 等元素。
- 无原生语义时遵循 WAI-ARIA APG。
- 每个交互出口必须有可访问名称。
- 标题、说明、错误和状态必须与目标控件关联。
- 键盘表逐行写明按键、生效条件、行为和焦点结果。
- Modal、Popover、Menu 覆盖焦点进入、循环、关闭和归还。
- 非冒泡事件由适配器使用原生监听器。
- 状态不能只靠颜色。
- 视觉隐藏和 DOM 隐藏必须按语义选择，不能互相替代。
- 图表的根为 `<figure>`，可及名来自 caption 部件或根上的 `aria-label` / `aria-labelledby`。绘图区 `role="graphics-document"` + `aria-roledescription`，系列 `role="graphics-object"`，数据标记 `role="graphics-symbol"` + `aria-label`；层级图改用 `tree` / `treeitem`；坐标轴、网格、注释 `aria-hidden`。
- 图表绘图区只占一个 Tab 位，roving 真实焦点。没有逐点元素的系列（折线、面积）由绘图区为激活数据生成一个以数据 key 为 id 的焦点代理元素；焦点环是独立部件，不依赖 SVG 元素的 outline。
- 图表必须自动生成摘要与视觉隐藏的数据表，服务端即输出；提示框只是增强，`aria-hidden`，任何数值都不能只靠提示框读到。
- 图表命中区至少 24px，粗指针 44px；密集标记用最近点拾取，不要求指针落在标记正中。

## 14. 跨环境

### 14.1 暗色

- 保持与亮色相同的层级关系。
- 浮层不能只靠黑色阴影分层，必须有背景差或内边界。
- 状态色重新校准前景对比，不直接复用亮色色值。

### 14.2 RTL

- 布局、间距、边界和定位使用逻辑属性。
- 只有物理键位、图表轴和时间方向等稳定身份可以固定方向。
- 图表绘图区的几何不随 RTL 镜像，方向键跟随视觉次序；图例、提示框、caption、缩放条外壳按逻辑属性镜像。

### 14.3 SSR

- 首屏不得读取 `document`、`navigator` 或布局测量决定结构。
- 平台和尺寸测量在挂载后更新，服务端输出必须稳定。
- 图表的视口块尺寸由令牌固定（含坐标轴带），绘图区在挂载测量后才生成标记；图例、摘要与数据表服务端即输出，首屏无布局偏移。

### 14.4 Reduced Motion

减弱动效是「去位移、留淡变」：

| 类别 | 减弱动效下 |
| --- | --- |
| 位移、缩放、旋转、尺寸变化 | 瞬时完成：幅度令牌归零、缩放归 1，`move`、`expand`、`collapse`、`slide`、`nudge`、`press`、`release` 为 1ms |
| 透明度、颜色、描边、阴影 | 保留短淡变：`micro`、`enter`、`exit` 为 120ms |
| 错开 | 取消 |
| 循环 | 停止，并显示静态替代（虚线圆、静态底色、常亮光标、半透明条） |
| 注意动效 | 不播放 |
| 弹簧 | 直接落到终态；跟手拖动不受影响（跟手不是动画） |
| 交互光、融合分离 | 不播放；融合分离只剩淡变 |
| 倒计时 | 按秒分段 |
| 平滑滚动 | 改为 `auto` |

- 作用域：`data-motion="reduce" | "default"` 可以写在任意元素上，最近的祖先生效；CSS 与 JS 读同一个作用域，应用级覆盖同时写到文档根。
- 无限循环必须同时有 `@media (prefers-reduced-motion: reduce)` 与 `:where([data-motion='reduce'])` 两道停止。
- 几何类时长减弱为 1ms 而不是 0，保证 `animationend` 仍会触发。
- 保留颜色、边界、图标或文案反馈。
- 不通过 0.01ms 动画规避生命周期逻辑。

### 14.5 Forced Colors 与打印

- 强制色使用系统颜色表达边界、焦点和状态。
- 瞬态浮层打印时隐藏。
- 必须打印的内容转为实体背景并移除模糊、透明和动画。

### 14.6 小屏与触屏

尺寸档按视口，不按容器：容器查询会让组件根不再由内容撑宽，组件落在收缩包裹的祖先链里就塌掉，库无法控制作者的祖先链。

| 档 | 条件 | 写法 |
| --- | --- | --- |
| 紧凑 | 视口宽 < 640px | `@media not all and (min-width: 640px)` |
| 中等 | 640–1023px | `@media (min-width: 640px)` 起 |
| 宽松 | ≥ 1024px | `@media (min-width: 1024px)` |
| 粗指针 | `(pointer: coarse)` | 与宽度正交 |
| 矮视口 | 视口高 < 480px | `@media not all and (min-height: 480px)`，只用于浮层与面板的高度 |

- 低于断点只用补集写法：它在地板内可用，并与 `min-width` 规则在断点处严格互补。不写 `max-width` / `max-height`，不写媒体查询范围语法（`width < …`，Safari 16.4 起支持，高于地板）。
- 验收标准（小屏巡检按 320 × 640、360 × 780、375 × 812、414 × 896 与 667 × 375 横屏断言）：
  1. 无页面级横向滚动；登记的横滚容器（Table 主体、CodeView、DiffView、Tabs 标签带、Carousel 轨道、Marquee）除外。
  2. 含文字的元素不被意外裁切，省略必须有完整文本出口。
  3. 粗指针命中区 ≥ 44px。
  4. 浮层完全落在可视视口内（含安全区），矮视口下可滚动到最后一项。
  5. 软键盘弹出后聚焦字段仍在可视视口内。
  6. 粗指针下可编辑元素字号 ≥ 16px（iOS Safari 聚焦字号更小的输入框会整页放大）；不用 `maximum-scale=1` 规避，它禁止用户缩放。
  7. 触屏点按释放后没有悬停残留：`:hover` 规则一律写在 `@media (hover: hover)` 内。
  8. 横竖屏切换后打开的浮层仍打开、仍在视口内，焦点不丢。
- 浮层形态：`presentation` 缺省 `auto`，紧凑档且粗指针时换形态，否则保持锚定并按可用空间收缩。选择类（Select、日期 / 时间 / 颜色选择）→ 底部面板；带搜索输入的（Combobox、Mention、可搜索的 TreeSelect / Cascader、Command）→ 全屏，搜索框在面板顶部；Cascader → 底部面板逐级下钻；Menu、ContextMenu → 底部动作面板；Menubar 收成一个触发器；HoverCard 触屏不打开；Tooltip 触屏长按打开、松手 1.5 秒后关闭。
- 底部面板由 headless 共享原语承担：抓手 + 头部 + 可滚动主体，上侧 overlay 圆角，sheet 材质；抓手与头部、或主体已滚到顶时可向下拖动，速度 > 900px/s 或位移 > 35% 关闭，否则弹回（§9.11）；焦点、`Escape`、遮罩与 Dialog 一致；减弱动效下无位移、120ms 淡变。
- 视口高度先写 `vh` 再写 `dvh`；贴边的面板、全屏浮层、贴底输入、固定底栏、浮动钮、Toast 加安全区；宿主页需要 `viewport-fit=cover`，`env(safe-area-inset-*)` 才有值。
- 软键盘：底部面板、全屏浮层与贴底输入按 `visualViewport` 让位，面板高度上限取可视视口高度。
- 自动换档只用于信息不丢、结构不变的调整（Form 标签上移、Pagination 简洁模式、Steps 紧凑条、Breadcrumb 折叠）；改变结构或交互方式的（Toolbar 溢出菜单、Table 卡片形态、Drawer 滑动关闭之外的新手势）用属性开启。

## 15. 文档

组件文档固定顺序：

1. 概述。
2. 用法。
3. 组件结构。
4. 示例。
5. 设计指引。
6. API 参考。
7. 无障碍。
8. 样式参考。

### 15.1 示例

- 第一个示例必须用最少结构展示核心用途。
- 一个示例只证明一个意图。
- 不为覆盖 API 保留重复或低质量示例。
- 组件总览使用独立极简预览，并遵守：
  - 一律 md 默认档、默认 variant；`size="sm|lg"` 只允许以尺寸本身为身份的组件（ColorSwatch、Icon、NumberAnimation）并登记；tone 只在组件核心用途即语气时（Alert、Toast、Notification、Badge、Progress）允许一个非 neutral 值。
  - 预览根不写 inline-size 散值，宽度由卡片以 CSS 变量下发（常规与单行输入类两档）；禁止内联 font-size / padding / gap 字面值，只引令牌。
  - 禁止裸 `overflow: auto | scroll` 容器，需要滚动的用 ScrollArea 或加 `data-xh-scroll`；文字用 span / div，不用 p / li / a。
  - 卡片不缩放（无 `transform: scale`），预览底色 `--xh-bg-page`，并打 `data-theme / data-density / dir` 舞台属性、受示例隔离样式保护。
  - 浮层类展示已打开的静态面板，不能只剩触发钮；trigger 走 Action Control 默认档。
- 复杂业务组合放到模式页，不塞进基础组件专页。
- 示例必须覆盖 Vue、React、Web Components；确实不适用时登记原因。
- 图表的第一个示例只写根、视口与绘图区；作为双 y 轴替代的多图联动示例放在显眼处。
- 文档另设《选图指南》：按数据任务选组件，并给出系列数量阶梯。

### 15.2 文案

- 使用短句、事实和约束。
- 先说用户能完成什么，不描述实现过程。
- 同一概念始终使用同一个词。
- 错误文案说明发生了什么以及下一步怎么做，不责怪用户。
- 标题、标签、按钮和单句提示不写多余标点。

### 15.3 自动生成内容

Props、事件、插槽、anatomy、键盘表、状态属性、CSS 变量和 CEM 必须由源码生成或校验，不允许手工维护两份不一致的事实。

## 16. 实现与验收顺序

### 16.1 实现

1. Core 公共原语。
2. Headless 状态机和 connect。
3. Headless 单测。
4. Vue、React、Web Components 适配器。
5. 共享 CSS 和组件令牌。
6. 三端一致性与真实浏览器测试。
7. 文档、示例、总览预览和生成物。
8. changeset。

不得在重建共享 dist 时并行运行依赖该 dist 的适配器测试。

### 16.2 必测内容

- Props 默认值、非法输入和受控/非受控。
- 键盘、焦点、表单和原生事件。
- 所有标准状态和状态叠加。
- 单行、多行、空、超长、异步和嵌套内容。
- comfortable/compact、light/dark、LTR/RTL。
- pointer、keyboard、coarse pointer。
- reduced motion、reduced transparency、forced colors、print。
- 进入、退出、卸载和回调次数。
- 三端 DOM、属性和计算样式一致性。

### 16.3 提交

- 一个组件或一个共享配方一个提交。
- 不混入无关格式化、重命名或清理。
- 公开面变化必须有 changeset。
- 生成物与源文件同一提交。
- 提交前必须通过相关测试、主门禁和生产构建。

## 17. Definition of Done

- [ ] 用户任务、何时不用和反模式已明确。
- [ ] 已归入正确组件家族。
- [ ] Core/Headless 是行为唯一真源。
- [ ] anatomy、状态、事件和键盘表完整。
- [ ] 三个适配器契约一致。
- [ ] 使用 4/8/12px 小圆角体系。
- [ ] 根面边界取描边 / 淡底 / 无壳之一；raised 已逐部件登记且带 border-default。
- [ ] 字段静息为描边式且不填底，variant 缺省落 outline；带边框的控件盒描边取 `--xh-border-control`。
- [ ] 单行字段根缺省宽走 `--xh-<c>-control-w` → `--xh-control-w`，地板不高过缺省宽；例外已登记。
- [ ] selected / current 按 §7.3 语义表取唯一标记；open / in-path 与 hover 同档。
- [ ] 交互阶梯按承载面取档；缺省语气正确（只有 Button 品牌实心）。
- [ ] 形状按 §6.3 身份表取值，正方盒未用 pill。
- [ ] 滚动面按 §6.6 归档，无手写 scrollbar-* 与死 track-bg。
- [ ] 标签 / 说明 / 标题 / 图标按 §6.4、§6.5 角色取值。
- [ ] 离散动作控件缩放换底；行级与 disclosure trigger 只换面，无零反馈。
- [ ] 动效已按 §9 选定角色；几何动画不用 `micro` / `enter` / `exit` 时长；有进场即有退场；初始内容不播进场；JS 无固定毫秒。
- [ ] 未使用 glass；frosted 使用范围正确。
- [ ] 正常、交互、禁用、加载、错误和退出状态齐全。
- [ ] 亮暗、密度、RTL、指针和无障碍环境通过。
- [ ] 组件槽、文档、CEM 和公开面闭环。
- [ ] 示例无冗余，总览有独立预览。
- [ ] 单测、一致性、浏览器和构建门禁通过。
- [ ] 图表：数据色经 `--xh-chart-*` 且色板门禁通过；摘要与数据表存在；非颜色通道齐备；SSR 首屏无偏移。
- [ ] changeset 和独立提交完成。

## 18. 禁止项

- 禁止在适配器复制跨框架行为。
- 禁止通过内容或 DOM 顺序猜测状态。
- 禁止同一语义存在多套 prop、事件、状态属性或令牌名。
- 禁止普通 control、Card 和 Overlay 使用 pill。
- 禁止组件写未登记的间距、圆角、颜色、阴影和动效散值。
- 禁止用阴影或淡底充当边界；禁止 `--xh-border-subtle` / `--xh-border-strong` 作根面外边。
- 禁止字段静息消费 raised 阴影或透明边。
- 禁止用 `bordered` / `borderless` / `plain|surface` / `primary|secondary` 等私有轴表达有框无框。
- 禁止 `--xh-bg-brand-subtle` 用于未选中语义（today、completed、open）。
- 禁止 hover 与 pressed 同档，或在白底上 hover 直接落 200。
- 禁止除 Button 外的触发器缺省品牌实心。
- 禁止正方盒取 pill、禁止分页点两种语言。
- 禁止整行 / disclosure trigger 缩放，禁止集合行零按压反馈。
- 禁止皮肤手写 scrollbar-width / scrollbar-color，禁止总览预览缩放、内联 px 与裸 overflow。
- 禁止 glass 材质及其兼容别名。
- 禁止 liquid 用于内容层、瞬态浮层与模态；禁止 liquid 嵌套；禁止 liquid 上的选中用品牌色字。
- 禁止皮肤直接取 `--xh-color-neutral-*` 原语画描边与淡底（墨色域无法重映射）。
- 禁止面内交互光；禁止交互光循环。
- 禁止 standard 档弹簧超调超过 3%；禁止 `bouncy` 进入核心组件；禁止数值、出现、披露用弹簧。
- 禁止呼吸表达有进度的过程或静态状态。
- 禁止点击波纹和组件私有按压参数。
- 禁止只用颜色表达状态。
- 禁止只降低 opacity 表达 disabled。
- 禁止无边界的透明模糊面。
- 禁止静默修正非法输入和非法结构。
- 禁止脱离配置上下文创建服务实例。
- 禁止文档重复实现过程、营销描述和无用途示例。
- 禁止未验证就提交，或多个无关组件合并提交。
- 禁止为同一数据任务、同一坐标系只因样式不同另建图表组件。
- 禁止双 y 轴。
- 禁止图表文字使用系列色；禁止网格用虚线；禁止用描边分隔相邻数据标记。
- 禁止生成第 9 个分类色、按排名或数值给名义类目着色、随筛选重新分配颜色。
- 禁止提示框成为读取数值的唯一途径。
- 禁止几何动画使用 `micro`、`enter`、`exit` 时长（进出场的幅度令牌位移例外，见 §9）。
- 禁止有进场无退场；禁止用固定计时器代替 Presence 等待退场。
- 禁止初始内容播放进场动画。
- 禁止在 JS 中写动画时长字面量，或直接调用 `requestAnimationFrame` 做动画。
- 禁止未登记的布局属性动画与常驻 `will-change`。
- 禁止 `:hover` 规则写在 `@media (hover: hover)` 之外。
- 禁止 `max-width` / `max-height` 媒体查询与媒体查询范围语法。
- 禁止用 `maximum-scale` 或 `user-scalable=no` 规避 iOS 聚焦放大。
- 禁止用容器查询给组件根换档。

## 19. 待落地条款

以下条款已生效，但实现尚未完成。落地前现有代码可以暂不满足；新代码不得与之冲突，也不得为了满足它们去改动尚未排期迁移的组件。完成一项即从本表删除。

| 条款 | 待完成 |
| --- | --- |
| §4「图表家具 / 数据标记」、§6.7、§7.6、§12.5、§13 与 §14 中的图表条款 | 图表组件；chart 家族配方随第二个图表组件建立 |
| §8.4 图表提示框材质 | Heatmap 详情条由反白改为 frosted |
| §9.5 进场必有退场、退场经 Presence；§9.6 首帧规则与错开按到达顺序 | 补 FloatButton 列表（standard 档；liquid 档已由融回承担）、回底按钮、BackTop 的退场；`data-instant` 推广；错开序号投影 |
| §9.7 `clip-path` 填充 | Progress、LoadingBar、FileUpload、倒计时迁移 |
| §9.8 共享测量、布局例外登记、`will-change` 规则 | 指示器与 Tour 迁移；布局例外登记门禁；`data-animating` 投影 |
| §8.5 liquid 与 `data-material` 轴 | 其余消费者接入（Carousel 翻页与指示器、ImageViewer 控制层、MessageFeed / Log 回底按钮、Layout 悬浮栏、Toolbar 悬浮档；悬浮栏里相邻的分段按液态组结组）；共享材质配方（frosted 一并收敛，现状 17 个皮肤各自内联四件套）；`data-material` 进入视觉环境控制器 |
| §9.11 弹簧 | `--xh-motion-ease-spring`；Drawer 与底部面板的滑动关闭（随 §14.6 底部面板原语） |
| §9.12 呼吸与光 | `xh-breathe` / `xh-breathe-halo`、`--xh-motion-loop-breathe`、`--xh-motion-ease-breathe`、`--xh-motion-duration-glint`；Badge `pulse`、MessageFeed / Approval 状态点；交互光 |
| §14.6 小屏与触屏 | 小屏巡检套件；悬停守卫与门禁；粗指针字段字号；Tooltip 长按；`dvh` 与安全区补齐；底部面板共享原语与 `presentation`；软键盘让位；逐组件自动换档 |
| §9.9 带元素参数的减弱判断、JS 无固定毫秒；§14.4 JS 与 CSS 同作用域 | headless 各状态机（Tabs 标签带补间、NumberAnimation、Carousel 起播）与 core 的 `reducedMotion()`（Presence、贴底滚动、平滑滚动）改为按元素判断并用 `readMotion` 取时长；门禁要求判断减弱动效时传参 |
