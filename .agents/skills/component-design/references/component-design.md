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
- 与现有组件跑同一台状态机、只差一组缺省值（落位、上限、停留、叠摞外观）：做成现有组件的预设，如 Notification 的 `preset: 'toast'`。

布局原语（Flex、Grid、Masonry 这类只排列子节点的容器）是刻意的例外：它们没有自己的交互与状态，不满足「可验证的无障碍和交互契约」一条，但把断点、间距档与对齐收进同一套令牌，避免各页面各写一份散值。它们只接受令牌化的间距与断点对象，不承载语义角色，也不得长出交互状态；需要语义的排列（列表、网格导航、表格）用对应的集合组件。

图表类组件按「数据任务 + 坐标系 / 布局」划分：同一坐标系里标记种类不同的是系列类型（`mark`），同一标记外观不同的是样式轴。柱状图与条形图、折线图与面积图、散点图与气泡图、饼图与环形图、矩形树图与旭日图都不是两个组件；仪表盘与子弹图是 Progress 在 meter 语义下的形态，不另建组件。

Heatmap 与 CartesianChart 是两种布局，分立：直角坐标图至少有一根数值轴，标记沿它定位；热力图的两条坐标都是离散的（类目 × 类目的矩阵、按周列或月块排布的日历），数值只由格子的色阶档位表达，不占任何一根轴，放进直角坐标系里没有数值轴可挂。它的无障碍契约同样是例外，见 §13。

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
| Action Control | Button、Toggle、ToggleGroup item、分页按钮、图标按钮、Toolbar item、RadioGroup segmented 形态的段、Tabs trigger、各类 trigger | 高度、内边距、图标随档、缺省语气（§7.2）、按承载面的交互阶梯（§7.2）、按压（§9.1）、焦点、禁用、加载 |
| Field Chrome | Input、Textarea、Select Trigger、Date/Time Field、Combobox、Cascader、TagsInput、PinInput、PromptInput | 静息描边外壳（§8.3）、`outline\|subtle\|ghost` 三档 × rest/hover/focus/invalid/disabled/readOnly/loading 七态、placeholder、前后缀、清空、标签与说明排版（§6.4） |
| Collection Item | Menu Item、Listbox Item、Tree Node、Table Row、Transfer Item、SideNav Link、Tabs line trigger、Anchor link、Breadcrumb link、NavigationMenu / Menubar trigger | highlighted、按集合语境的 selected/current 标记（§7.3）、pressed 只换面（§9.2）、disabled、缩进、指示器 |
| Surface | Card、Alert、Panel、CodeView、DiffView、Log、JsonViewer、ToolCall、Reasoning、Approval、QuestionFlow、Accordion/Toolbar/PageHeader 的 outline 档、Tree/Listbox/Transfer/List/Descriptions/Table 容器面 | 边界三选一（§8.3）、raised 逐部件登记（§8）、标题/说明排版（§6.4）、内衬只走 `--xh-surface-*`、层级 |
| Overlay | Popover、Menu、Select content、Dialog、Drawer、Tooltip、NavigationMenu content、日期/时间面板 | Portal、定位、遮罩、材质按内容判定（§8.4）、进退场按锚定关系（§9.5）、浮层滚动面（§6.6）、焦点归还 |
| Feedback | Notification（卡片与轻提示两种预设）、Progress、Skeleton | 状态语气、sheet 面描边（§8.4）、计时、暂停、消除、加载和即时反馈 |
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
| RadioGroup segmented 形态 / Tabs segment 的轨道 | Surface（淡底面） | 形状 surface；RadioGroup 的轨道就是 root；见 §6.3 |
| RadioGroup segmented 形态的滑块 thumb / Tabs segment 的滑块 indicator | raised 部件 | 白色抬起面 + border-default；见 §7.3。RadioGroup 的滑块另立 `thumb` 部件，不占行首单选圆圈的 `indicator` |
| RadioGroup segmented 形态的段 | 行级（只换面） | 不投影 Action Control 配方（与 Tabs segment 同）：面与字写在段上，淡底承载阶梯 200 → 300，选中段由滑块标出、不叠按下面；不画行首圆圈，组标题视觉隐藏只作可及名 |
| Toggle、ToggleGroup item、Toolbar `aria-pressed` 项 | Action Control（无滑块开关） | 选中 = 品牌淡底；见 §7.3 |
| Toolbar 「更多」钮（overflow-trigger） | Action Control `icon` profile、ghost、与条目同档 | 不写内容时画横排三点；菜单开着时与悬停同档的中性面；见 §6.6 |
| Tabs 「更多」钮（overflow-trigger） | Action Control `icon` profile、ghost、与两端翻页钮同档 | root 的孩子、排在 list 之后（不进 tablist），自占一个 Tab 位、不是方向键走位的一站；盒取标签同高的正方形（竖排横贯列宽），不写内容时画横排三点；菜单开着时与悬停同档的中性面；见 §6.6 |
| Tabs line trigger、Anchor link、SideNav link、NavigationMenu trigger / 面板 link | Collection Item（导航当前） | 当前 = 指示条 / 字色；SideNav link 投影 `data-xh-collection-context='page'`，其余投影 `'nav'`（Tabs 只在 line 档投影，另投 `data-current`；NavigationMenu trigger 展开时投影 `data-in-path`）；见 §7.3 |
| Breadcrumb link | Collection Item（导航当前） | 当前页是不可点位置：`aria-current="page"`，`--xh-fg-default` + medium，无指示条；投影 `data-xh-collection-context='nav'`，当前页再投影 `data-xh-collection-terminal`（它同时带 `aria-disabled`，不显式标会被家族禁用面吃掉）；见 §7.3 |
| Menubar trigger | Collection Item（展开路径 / 打开中） | 没有当前态：open 与家族 hover 同档的中性面，不用品牌色、不加粗；投影 `data-xh-collection-context='nav'`，展开时投影 `data-in-path`；见 §7.3 |
| Pagination item、Steps indicator、Calendar cell | Action Control（格状当前） | 当前 = 实心品牌；见 §7.3 |
| CheckboxGroup item / select-all trigger、RadioGroup item、Steps trigger | Action Control `row` profile | 只换面不缩放；方框 / 圆圈 / 圆点是宿主内的标记，读宿主 host 槽；见 §9.2 |
| RadioGroup / CheckboxGroup 的 card 档条目（选择卡片） | Action Control `row` profile、`outline` 形态 | 选择卡片家族配方（`family/choice-card.css`，连接层投影 `data-xh-choice-card`）：surface 形状、内衬 space-3 / space-4、透明底 + `--xh-border-control`，白底承载阶梯 100 → 200 且不随语气染色；选中取「页内持久集合的选中」面（§7.3），行首圆圈 / 方框照常；说明行 13 / muted 落在文案下方同一列；只换面不缩放 |
| Accordion / Collapsible / Reasoning / ToolCall trigger、CodeView fold-trigger、DiffView gap-trigger | disclosure trigger | 只换面，不缩放；见 §9.2 |
| FloatButton、BackTop、Carousel 翻页、Log/MessageFeed 回底、ImageViewer 翻页 | Action Control `floating` profile | 形状 circle；见 §6.3 |
| Tag、Badge、ToolCall status、Approval result、QuestionFlow result | 状态 chip | 形状 pill；见 §6.3 |
| 图表根 | 无壳 | 不画外边、不填底，透出宿主面；需要框时由作者放进 Card |
| 图例项 | Action Control `text` profile、ghost、xs 档 | 按压 0.97；显隐标记见 §7.3「图例显隐」 |
| 面板内关闭钮（Dialog、Drawer、Tour、Notification 卡片预设、Popover、Citation 预览） | Action Control `icon` profile、ghost、sm 档（Citation 为 xs），control 形状 | 绝对定位在右上角，内缩 `--xh-surface-action-inset`；Popover 气泡内衬比面板小一档，内缩取 `--xh-space-2`，否则叉会伸出气泡的盒子被裁掉；FloatingPanel 的叉排在 header 流里；Alert 的叉行内垂直居中 |
| Notification 轻提示预设的关闭钮 | Action Control `icon` profile、ghost、xs 档 | 轻提示一句话一行，叉排在行尾、取 xs；可悬停设备上悬停或聚焦才显，触屏常显 |
| ImageViewer 关闭钮 | Action Control `floating` profile、sm 档（40px）、circle | 悬浮在媒体上的单图标动作，与翻页钮同一身份 |
| Tag / TagsInput 标签内的移除钮 | 行内标记，不投影 Action Control | 字形与命中区取指示符档（`--xh-control-indicator-size`），悬停只换 currentColor 淡底；胶囊内放不下 xs 视觉盒 |
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

缺省形态的两类刻意例外：

- 缺省 `ghost`：Accordion、Descriptions、List、PageHeader、Toolbar。它们是排版骨架，通常嵌在 Card、Panel 或页面分区里，自带一圈描边会与宿主面叠成两道边；需要独立成面时由作者显式写 `outline` / `subtle`。Headless 仍须显式给出 `ghost` 缺省，不允许「不传」成为第四种形态。
- 结构形态轴：Tabs 的 `line | card | segment`（缺省 `line`）、RadioGroup / CheckboxGroup 的 `list | card`（缺省 `list`：一列「标记 + 文案」的行；`card`：一组可点的选择卡片，见 §4.1），RadioGroup 另有 `segmented`（一条淡底轨道里首尾相接的段，选中段由滑动的 `thumb` 标出；缺省横排，`block` 撑满行宽；原 Segmented 组件并入于此，见 §4.1、§7.3）、Steps 的 `number | dot`（缺省 `number`：盛内容的序号圆点；`dot`：不盛内容的小圆点，步数多或横向空间紧时用）。它们换的是条目的结构，不是有框 / 无框，不走 ControlVariant。
- 不设 `variant` 轴：Alert（语义由 `tone` 承担，面固定为描边面）、CodeView / DiffView / Log（代码类面固定为描边面，行号槽与高亮依赖这层底）、Collapsible（只有触发条与内容，没有自己的壳）、Citation（随文引用，形态固定）。新增此类组件同样登记在这里，不用私有轴补形态。
- 预设轴 `preset`：只给 Notification（`card | toast`，缺省 `card`）。它打包一组缺省值：落位、上限、间距、停留、页面转入后台时是否暂停与是否叠摞仍可逐项覆盖，卡片排版与关闭钮档位随预设走（卡片是标题加正文的两列网格、叉 sm 钉在右上角；轻提示是一行、叉 xs 排在行尾）。它不是视觉轴，不表达语气或状态，缺省值由 Headless 定。新增此类组件同样登记在这里。
- 放置 `banner`：只给 Alert（布尔，缺省 false）。它说的是提示贴在哪儿（贴着页面或容器顶边铺满整行的通栏，还是内容里的一块面），不是面的形态，也不打包缺省值：面、语气、实时区语义与关闭都不变，只把贴边的几条边与圆角交还给页面（§6.3、§8.3）。不走 `variant`：Alert 不设 variant 轴，通栏也不是描边 / 淡底 / 无壳之外的第四种面；不做成 `preset`：它不改任何行为缺省值。新增此类组件同样登记在这里。

禁止用 `type`、`color`、`status`、`danger` 等多套 props 重复表达同一视觉结果。

### 5.3 第三步：确定层级

从低到高：

```text
canvas → solid（描边面）/ subtle（淡底面）→ raised → floating / frosted → sheet
```

- 页面背景使用 canvas；亮色保持白页白卡，层级差交给描边，subtle 阶梯不动。
- 静态内容面缺省使用 solid：`--xh-border-default` 描边 + `--xh-bg-surface` + 无影（§8.3）。
- 淡底面使用 subtle：`--xh-bg-subtle` + 透明边位 + 无影；淡底与描边互斥、淡底与阴影互斥。
- raised 只给 Card 与「可抬起 / 可拖起」的部件（RadioGroup segmented 形态 / Tabs segment 滑块、Slider / Switch thumb、Button soft），逐部件登记；raised 面必须带 `--xh-border-default` 描边，影只是加成，亮色 raised 背景不分档。
- 锚定瞬态浮层按内容判定：短列表 / 菜单 / tooltip 用 frosted；含网格或多列的锚定面板用 floating（§8.4）。
- Dialog、Drawer、Command、Notification、Tour 等模态与强反馈面统一 sheet（`--xh-material-elevated-*`）。

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

- 根另带 `max-inline-size: 100%`；盒（control）只写家族的 `min(…, 100%)` 地板，由根撑开。
- 放进 Field 即铺满表单列：Field 根把 `--xh-control-w` 改成 `100%`，单个组件的 `--xh-<c>-control-w` 仍压过它；Form `layout="inline"` 一行流里字段宽由控件撑出，Form 把字段还原成缺省宽，避免两者互相依赖塌成内容宽。Field 之外要铺满由使用者改 `--xh-control-w` 或在根上写 `inline-size: 100%`。
- 盒里与已选标签并排的输入框（TagsInput、多选 Combobox）最小宽取 `--xh-control-input-min-w`（4rem）：标签再多也给打字留出这一截——TagsInput 的输入框换到下一行，多选 Combobox 的标签先截断、再折进 +N。
- 刻意例外（须登记进 check-control-box 的 EXEMPT）：DateRangePicker 起止两组按日的段位、分隔符与日历钮排在一行，内容比缺省宽宽，缺省 `inline-size: max-content`、地板取 `--xh-control-w`（按年、按月时不比别的字段窄）；PinInput 由格数与格宽定宽；PromptInput 铺满宿主；Clipboard 只放复制钮的用法是独立按钮，缺省宽只给带输入框的用法（`:has(control)`）。
- 嵌入位改写字段缺省宽同样是例外（须登记进 check-control-box 的 EMBEDDED_WIDTH，并经嵌入方自己的使用者槽）：Pagination 的每页条数控制器是一个库内 Select，选项是「10 条 / 页」一类短串，在分页行里按内容定宽（`--xh-pagination-page-size-select-w`，缺省 `max-content`，地板一并放开）。
- InputGroup 整组是一个字段：缺省宽走 `--xh-input-group-w` → `--xh-control-w`，组里带字段外壳的控件占满前后缀与动作之外的剩余宽度，前后缀与按钮按内容宽。
- 示例不写内联宽度，让文档展示缺省宽；只有演示宽度本身的示例才改槽。

浮层的宽度按内容分三种，不由组件自定：

| 类型 | 组件 | 宽度 |
| --- | --- | --- |
| 列表型 | Select、Combobox、TreeSelect 的候选面板 | 锚在字段盒上、与它等宽；长选项在条目里截断，面板不随最长的一条变宽。字段盒比 `--xh-overlay-menu-min-w` 还窄时取这个下界，比可用区还宽时收成可用宽度；限高统一 `--xh-overlay-menu-max-h` |
| 面板型 | DatePicker、TimePicker、ColorPicker、Cascader 等带网格或多列的面板 | 按内容的自然宽度，与字段盒起始对齐，不随字段盒拉伸 |
| 菜单 | Menu、ContextMenu、Menubar | 不跟随触发器（触发器多是一颗按钮），按条目自然宽度，受 `--xh-overlay-menu-min-w` 与 `--xh-overlay-max-w` 夹取 |

- 列表型浮层的锚点是字段盒（control），不是盒里的触发按钮：锚在触发按钮上时面板左缘会缩进一截内距。
- 作者要给列表封顶写 `--xh-<c>-content-max-w`，要抬下界写 `--xh-<c>-content-min-w`；缺省没有上界。
- Cascader 是多列的面板：锚在字段盒上、与盒起始缘对齐；每一列（含一级列）按条目的自然宽度、受 `--xh-overlay-menu-min-w` 托底，长选项撑到条目上限 `--xh-overlay-max-w` 为止、余下的在条目里截断；搜索框不参与定宽，铺满列撑出的宽度；面板随列数伸展、宽过可用区时收成可用宽度并在面内横滚；每列定高、列内自滚，不走列表档限高。

### 6.3 形状身份

| 角色 | 圆角 | 给谁 |
| --- | ---: | --- |
| inset | 4px | 嵌在 control 内的小块：checkbox 系方框、菜单项与候选行（Menu 族、Select / Combobox / Cascader / TreeSelect / Listbox / Command / Transfer / Mention / Tree 的行，日期与时间面板的预设项与时间格）、字段内 field-inset 钮、table 行选择框、select-all 方框、色块 item；数据标记：柱的远端（基线端直角）、矩形树图 / 冰柱格、桑基节点、图例的柱色标（均夹到短边一半） |
| control | 4px | 一切在 chrome 内或随文的按钮与字段：Button、Input、Select Trigger、Toggle、分页按钮、close/clear trigger、kbd、tooltip、rating item、tabs / steps trigger |
| surface | 8px | Card、Alert、Panel、列表容器、RadioGroup segmented 形态与 Tabs segment 的轨道、选择卡片（RadioGroup / CheckboxGroup card 档条目） |
| overlay | 12px | Popover、Menu、Dialog、Drawer、Notification |
| circle | 50% | 宽高相等的圆形对象：avatar、加了底框的 icon、radio / question-flow 单选指示器及内点、switch / slider / color thumb、steps / timeline indicator、spinner 与全部加载环、色块选中徽标、skeleton circle、Citation 来源列表的序号；以及悬浮于内容之上的单图标动作（FloatButton、BackTop、Carousel 翻页、Log / MessageFeed 回底、ImageViewer 翻页与关闭，走 Action Control `floating` profile）；图表的数据点与端点、关系图节点 |
| pill | 9999px | 仅两类身份：(a) 状态 chip：Badge、Tag、ToolCall status、Approval result、QuestionFlow result；(b) 一维对象：switch 轨道、slider / progress / strength / upload 的 track 与 range、tick、hairline separator、tabs / anchor / navigation-menu 滑动指示条、resize / drag 手柄、scrollbar thumb、sortable 落点线、skeleton text、位置指示点的当前拉长态、图例的折线色标、图表缩放手柄、不贴边的 liquid 一维栏（§8.5）、随文的引用编号（Citation trigger） |

强制规则：

- 普通按钮、字段、卡片和浮层不得使用 pill。
- 正方盒（inline-size 与 block-size 同槽）必须取 circle，不得用 pill 冒充圆。
- 位置指示点（Carousel indicator、Tour progress-dot）统一为一种语言：8px 圆点（circle），当前项拉长为 20px 胶囊（pill）。
- 序号状态圆点（Steps / Timeline indicator）取 circle；可点分页按钮（Pagination item）取 control，二者不互相对齐。
- 盛内容的圆（Avatar、带框 Icon、Steps 序号圆点）直径同一把尺：`--xh-control-h-sm/md/lg`，随密度换档，与同档控件等高；圆里的字形另按字形或指示符档取尺。Timeline 圆点与 Steps 点状形态（`variant="dot"`）的圆点不盛内容，是纯位置标记，走自己的小尺（`--xh-space-*` 相邻三格，sm / md / lg = 8 / 10 / 12px，不随密度换档），不在此列。
- 组件不得写 6px、10px 等独立圆角。
- 内层圆角不得大于外层圆角减去内边距（surface 8px 轨道内 2/4px 内距，滑块 ≥ 4px 满足）。
- 相连控件消除相接侧圆角，不使用负 margin 伪造连接。
- 贴边铺满的通栏（Alert `banner`）不取圆角：它的边就是页面或容器的边，圆了会在两个角露出底下的页面。
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
- 动作区对齐按用途分两种：决策面（Dialog、Drawer 页脚、Popconfirm、Approval、Tour 步骤）整组贴行尾，主动作排在最后、次要动作在它之前；Card 页脚是内容的延续而不是一次决策，与正文同起点对齐。RTL 下行尾与起点随书写方向镜像，主动作仍在阅读顺序的最后。

### 6.5 图标尺寸

- 控件内图标随 size 档：sm 16 / md 20 / lg 24（`--xh-glyph-size-sm/md/lg`）；Action Control、Field Chrome、Collection Item 三份配方按档下发，皮肤缺省值只能是 `var(--xh-<comp>-icon-size, var(--xh-glyph-size-md))` 并随 `data-size` 换档。
- `--xh-glyph-size-text`（随文 1em）只允许在纯行内文字组件（Tag、Kbd、Breadcrumb、Typography、Highlight）里使用。
- Feedback 指示符（Alert、Notification）统一 `--xh-glyph-size-md`。
- 配方内不写 24px / 12px / 14px 等字面尺寸：xs 视觉盒（含 field-inset sm）走 `--xh-control-action-size`；field-inset 字形 xs 走 `--xh-control-indicator-sm`、sm 走 `--xh-control-indicator-md`、md 走 `--xh-glyph-size-sm`，随密度换档。
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
- 横向控件带排不下时分三路：Menubar / NavigationMenu / RadioGroup segmented 形态折行；Toolbar 放了行尾的「更多」钮（`overflow-trigger`）时不折行——条目按文档序从尾部起收进它弹出的 Menu，量测由 Headless 在挂载后按自然排布做（容器变宽变窄、条目增减或改写即重量），全部放得下时钮收起、一个不收；收起的条目在菜单里按可及名取文字，写了 `aria-pressed` 的是勾选项，工具条上的分组与分隔线在菜单里画成分隔线，选中一项即替条目触发它自己的点击；钮接 Action Control icon 档 ghost 面、与条目同档，是方向键走位的最后一站，焦点所在的条目被收起时焦点交给它；它前面收空的分组与多出的分隔线一并让开；没放钮的 Toolbar 仍折行。Tabs 不折行——标签带只裁主轴（`overflow: clip visible`，不是滚动容器，交叉轴上的焦点环、粗指针外扩与 raised 影都不被裁），标签整体沿主轴 `translate` 位移（机器按 continuous 档补间写进 `--xh-_tabs-scroll`），两端 `prev-trigger` / `next-trigger` 接 Action Control icon 档 ghost 面、静息底换成所在面的盖底（`--xh-tabs-scroll-trigger-bg`，缺省 surface、segment 轨道取 subtle）、挪到头那一侧 `opacity: 0`（与 Carousel 同），横向滚轮按量位移、竖滚轮留给页面，触屏手指沿主轴拖即跟手平移（放不下时 `list` 写 `touch-action: pan-y pinch-zoom`，交叉轴仍归页面），选中 / 聚焦的标签被裁时自动挪进视野；root 里紧跟 list 放了「更多」钮（`overflow-trigger`）时，放不下即在标签带行尾（竖排为列尾）露面，弹出的 Menu 列出没有整个露在可见区（标签带露出的那一段，扣掉两端显示着的翻页钮）里的标签、半露的也列，选中一项即选中并挪进可见区；标签不收起，下拉只是可见区外标签的索引，项随位移换；钮的有无与翻页钮同进同退，放不放得下按让回钮那一截算（钮挤窄了标签带也不会自己把自己留住）；不铺边缘渐隐。

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

### 6.8 组件尺寸：缺省、下限与上限

组件尺寸只取语义尺寸令牌。组件槽（`--xh-<c>-…-w`、`-h`、`-size`、`-min-*`、`-max-*`）的缺省值引用令牌，作者改槽，不改私有槽。三种量：

- 缺省：不传 `size`、不改槽时的尺寸。`size` 只有 sm / md / lg（Action Control 另有 xs），md 缺省。
- 下限：被 flex / grid 压缩或内容很少时的底线。
- 上限：内容再多也不越过；越出的部分在面内滚动或在条目里截断，不撑大外框。浮层的上限一律再与可用区取 `min()`（`--xh-_<c>-available-w` / `-h`），窗口小时以可用区为准。

强制规则：

- 新组件先在下表找同类，按同类取档；没有对应档时先加语义令牌，再在皮肤里引用，不在皮肤写字面尺寸。
- 有上限就必须有去处：面内滚动（按 §6.6 的两档滚动条）或条目截断。
- 限高只取 `--xh-viewport-h-sm` / `md` / `lg`、`--xh-viewport-max-h`，浮层另取 `--xh-overlay-max-h` / `--xh-overlay-menu-max-h`。按 px 定高的面板（日期面板）不再叠 rem 上限。
- 尺寸不随断点换档；粗指针命中区至少 44×44px，经伪元素外扩，不改表里的视觉尺寸。
- 表中 sm / md / lg 并列时以「/」分隔；compact 列为空表示不随密度换档。

#### 尺寸令牌

| 令牌 | comfortable | compact | 用途 |
| --- | --- | --- | --- |
| `--xh-control-h-sm` / `md` / `lg` | 32 / 36 / 40px | 28 / 32 / 36px | 单行控件、按钮、集合行、标签页与导航 trigger 的高；盛内容的圆的直径 |
| `--xh-control-box-sm` / `md` / `lg` | 32 / 40 / 48px | 28 / 36 / 44px | 方格：PinInput 格、floating 动作钮 |
| `--xh-control-action-size` | 24px | 20px | xs 动作钮、sm 字段里的 field-inset 钮 |
| `--xh-control-indicator-sm` / `md` / `lg` | 12 / 16 / 20px | 10 / 14 / 18px | 勾选方框、单选圆、状态字形、行内拖拽把手 |
| `--xh-glyph-size-sm` … `4xl` | 16 / 20 / 24 / 32 / 40 / 56 / 72px | | 图标与插图，见 §6.5 |
| `--xh-switch-track-h-sm` / `md` / `lg` | 18 / 22 / 28px | 16 / 20 / 24px | Switch 轨道高 |
| `--xh-track-thickness`、`--xh-track-thumb-size` | 6px、18px | | 轨道与滑块 |
| `--xh-control-w`、`--xh-control-min-w`、`--xh-control-input-min-w` | 16rem、12rem、4rem | | 字段缺省宽、压缩底线、标签旁输入框的最小宽 |
| `--xh-viewport-h-sm` / `md` / `lg` | 12 / 16 / 24rem | 10 / 14 / 20rem | 页内与面板内滚动面的定高与限高 |
| `--xh-viewport-max-h` | 24rem | 20rem | 长文本视口限高 |
| `--xh-overlay-menu-min-w`、`--xh-overlay-min-w` | 10rem、12rem | | 菜单与候选面板的下限；带输入的面板宽 |
| `--xh-overlay-column-min-w` | 3.5rem | | 时间列下限 |
| `--xh-overlay-max-w-sm`、`--xh-overlay-max-w`、`-lg`、`-xl` | 16、20、24、48rem | | 浮层宽的上限 |
| `--xh-overlay-max-h` | 16rem | 14rem | 卡片类浮层限高 |
| `--xh-overlay-menu-max-h` | 20rem | 17rem | 菜单与候选列表限高 |
| `--xh-overlay-sheet-w-sm` / `md` / `lg` | 24 / 32 / 48rem | | Dialog、Command 宽的上限 |
| `--xh-overlay-drawer-w-sm` / `md` / `lg` | 16 / 20 / 28rem | | Drawer 厚度 |
| `--xh-overlay-toast-w` | 28.75rem | | 轻提示卡宽：一行排开指示符、正文、行内动作与关闭钮 |
| `--xh-sider-w`、`--xh-sider-collapsed-w` | 15rem、4rem | | 侧栏展开与收起宽 |
| `--xh-nav-link-max-w` | 12rem | | 导航链接上限 |
| `--xh-measure-prose` | 32rem | | 说明文字行宽上限 |
| `--xh-chart-height`、`--xh-chart-bar-max` | 20rem、24px | | 图表视口高、柱厚上限 |
| `--xh-stroke-thin` / `thick` / `strong` | 1 / 2 / 3px | | 分隔线、指示条与细进度、把手 |

#### 动作控件

| profile | 用于 | xs | sm | md | lg |
| --- | --- | --- | --- | --- | --- |
| text / icon | Button、Toggle、ToggleGroup 与 Toolbar 条目、各组件的触发与提交钮 | `control-action-size` | `control-h-sm` | `control-h-md` | `control-h-lg` |
| field-inset | 字段里的清空、展开、步进、可见性钮，档位随所在字段 | `control-action-size` | `control-action-size` | `control-h-sm` | `control-h-md` |
| floating | FloatButton、BackTop、Carousel 翻页、Log / MessageFeed 回底、ImageViewer | `control-box-sm` | `control-box-md` | `control-box-lg` | `control-box-lg` + 8px |

- text 档宽按内容，下限等于高；icon、field-inset、floating 是正方盒。
- 字形：text / icon 为 16 / 16 / 20 / 24px；field-inset 为 `control-indicator-sm`、`control-indicator-md`、16px、20px；floating 为 16 / 20 / 24 / 32px。
- Dialog、Drawer、Popover、Tour、Notification 的关闭钮取 `control-h-sm`。

#### 字段

| 组件 | 缺省 | 下限 | 上限 |
| --- | --- | --- | --- |
| 单行字段（TextField、Select、Combobox、TreeSelect、Cascader、NumberField、PasswordInput、DateField、TimeField、DatePicker、TimePicker、TimeRangePicker、ColorField、ColorPicker、Mention、TagsInput、Editable、Clipboard、InputGroup） | 宽 16rem；高 `control-h` 随 size | 宽 `min(16rem, 12rem, 100%)` | 宽 100%；长值在盒内截断 |
| 放进 Field 的字段 | 铺满 Field；Form `layout="inline"` 还原 16rem | 同上 | 100% |
| TextField 多行 | 随内容长高 | 一行 `control-h` | `viewport-h-sm`，超出内滚 |
| TagsInput | 标签折行长高 | 输入框 4rem | `viewport-h-sm`，超出内滚 |
| 多选 Combobox | 标签与输入框同行 | 输入框 4rem | 标签先截断、再折进 +N |
| PromptInput | 铺满宿主 | 一行 | 8 行，超出内滚 |
| NumberField 输入框 | 5em | | |
| PinInput | 格 `control-box` 随 size；根宽 = 格数 × 格宽 + 间距 | | |
| DateRangePicker | `max-content` | 16rem | 100% |
| Pagination 每页条数、跳页框 | `max-content`、64px | 放开 | |

| 组类控件 | 尺寸 |
| --- | --- |
| Checkbox、Radio、CheckboxGroup、RadioGroup、Transfer、GridList、Tree 的方框与圆 | `control-indicator` 随 size |
| RadioGroup segmented | 条目高 `control-h`，轨道内距 2px |
| ColorSwatchPicker 色块 | `control-h` 随 size |
| Switch | 轨道高 `switch-track-h` 随 size；宽 = 2 × 高 − 2 × 内距；滑块 = 高 − 2 × 内距 |
| Slider | 轨道 6px、滑块 18px、刻度 4px；竖向长度 10rem |
| ColorSlider | 轨道 12px、滑块 18px；竖向长度 10rem |

#### 浮层

| 组件 | 宽 | 高 |
| --- | --- | --- |
| Tooltip | 内容宽，上限 20rem | 内容高 |
| Popover、Popconfirm、HoverCard | 内容宽，上限随 size 16 / 20 / 24rem | 上限 `overlay-max-h` |
| Tour | 内容宽，上限 24rem | 上限 `overlay-max-h` |
| Citation 预览 | 上限 20rem | 上限 `overlay-max-h` |
| Menu、ContextMenu、Menubar、SideNav 弹出层 | 条目自然宽，下限 10rem，上限 20rem | 上限 `overlay-menu-max-h` |
| NavigationMenu | 下限 10rem，上限 48rem | 内容高 |
| Select、Combobox、TreeSelect | 与字段盒等宽，下限 10rem，缺省无上限 | 下限一行 `control-h`，上限 `overlay-menu-max-h` |
| Mention | 下限 12rem，上限 20rem | 下限一行 `control-h`，上限 `overlay-max-h` |
| Cascader | 每列自然宽、下限 10rem，条目上限 20rem；整面上限为可用宽，超出横滚 | 列定高 `viewport-h-sm`，列内滚 |
| DatePicker、DateRangePicker | 内容宽；时间列下限 3.5rem | 上限为可用高；时间列高 `control-h-sm` × 7 + 28px；预设组上限 `viewport-h-lg` |
| TimePicker、TimeRangePicker | 内容宽；列下限 3.5rem | 列定高 `viewport-h-sm`；面板上限 `viewport-h-lg`；预设组上限 `viewport-h-sm` |
| ColorPicker | 定宽 12rem；饱和区高 9rem | 上限 `viewport-h-md` |
| Pagination 下拉 | 上限 20rem | 上限 `overlay-max-h` |
| Dialog | 铺满可用宽，上限随 size 24 / 32 / 48rem | 上限为视口可用高，正文内滚 |
| Command | 铺满可用宽，上限随 size 24 / 32 / 48rem | 上限 `overlay-max-h` |
| Drawer | 厚度随 size 16 / 20 / 28rem，不超过视口；可拖拽时夹在 `minPanelSize`（缺省 160px）与 `maxPanelSize` 之间 | 贴边铺满 |
| FloatingPanel | 缺省 360 × 240px，下限 `minSize` 缺省 160 × 120px，上限 `maxSize` 缺省不封顶 | 同左 |
| Notification | 卡宽 `overlay-max-w-lg`，toast 档 `overlay-toast-w`；不超过视口宽 − 32px | 描述上限 `viewport-h-md`，超出内滚 |
| ImageViewer | 图片上限 90% 视口宽 | 图片上限 85% 视口高 |

#### 页内滚动面与数据展示

| 组件 | 尺寸 |
| --- | --- |
| Table | 限高 `viewport-h-lg`；单元格最小宽 3rem；列 `width` 是伸缩基准，`minWidth` / `maxWidth` 落成内联上下限，三者同值即定宽；空态与加载态最小高 0 |
| Tree | 限高 `viewport-h-lg` |
| Listbox | 限高 `viewport-h-md` |
| Transfer | 列表定高 `viewport-h-md` |
| FileUpload | 列表限高 `viewport-h-md`；拖放区最小高 8rem；预览 `control-h-md`；文件名最小宽 12rem；进度条宽 2 × `control-h-md` |
| JsonViewer、DiffView | 限高 `viewport-max-h` |
| Log | 视口 16 行 |
| CalendarPicker、CalendarRangePicker | 日期格最小宽与星期行高 `control-h-sm`；年网格限高 `viewport-h-sm` |
| Image | 宽 100%，高随比例；兜底最小高 `control-h-lg` |
| Typography | 行宽上限 68ch |
| EmptyState | 说明行宽上限 32rem |
| CodeView | 页头最小高 `control-h-lg` |
| Marquee | 块高 10rem |

#### 标记与小件

| 组件 | 缺省 | sm / lg |
| --- | --- | --- |
| Avatar、AvatarGroup、Icon 底框 | `control-h-md` | `control-h-sm` / `control-h-lg` |
| Steps 序号圆 | `control-h-md` | `control-h-sm` / `control-h-lg` |
| Steps 点状、Timeline 圆点 | 10px | 8 / 12px |
| Badge 计数 | 最小 20px | 14 / 24px |
| Badge 圆点 | 8px | 6 / 10px |
| Spinner | 20px | 16 / 24px |
| EmptyState 图标 | 40px；媒体区高为图标 2 倍 | 32 / 56px |
| Kbd | 高 24px，最小宽 24px | |
| Skeleton | 圆与矩形 `control-h-lg`；文本行高等于说明字号 | |
| Progress | 线形厚 6px；环形直径 7.5rem | |
| Carousel、Tour 位置点 | 8px，当前项 20px；Carousel 点命中区 44px | |
| Sparkline | 6rem × 一行正文高 | |
| 图表视口 | 高 20rem，含坐标轴带；缩放条高 24px | |

#### 布局与导航

| 组件 | 尺寸 |
| --- | --- |
| Layout | 页头高 3.5rem；侧栏 15rem，收起 4rem；侧栏限高 100vh |
| SideNav | 宽 15rem，收起 4rem；行高 `control-h` 随 size |
| Tabs、NavigationMenu | trigger 高 `control-h` 随 size |
| Breadcrumb、Anchor | 链接上限 12rem，超出截断 |
| Splitter、Resizable | Splitter 拖拽条 4px；Resizable 边柄 8px、角柄 16px |

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
2. 缺省语气：只有 Button 缺省为品牌实心（`solid`）；其余按钮形触发器（Toggle、ToggleGroup item、Clipboard、DownloadTrigger、FloatButton、BackTop、Pagination 非当前、Toolbar item、Tabs trigger、RadioGroup segmented 形态的段、Accordion / Collapsible / Menu / Menubar / NavigationMenu trigger、Carousel / Calendar / ImageViewer 控制、所有 field-inset 动作）缺省中性，只有写了 `data-tone` 才切到语气淡底。浮层里的确认 / 主线动作钮（Popconfirm confirm、Tour next）是该浮层的主要动作，与 Button 主动作同待遇，由连接层显式投影 `solid`；这不属缺省语气，同一浮层里的次要出口（Popconfirm cancel）仍是中性 `outline`。
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
| 页内持久集合的选中 | Table row、Transfer、GridList、SideNav 当前项、选择卡片（RadioGroup / CheckboxGroup card 档条目） | `--xh-bg-brand-subtle` 行面 + `--xh-fg-on-brand-subtle`；Table row / Transfer / GridList 另有行首勾选框（勾由勾选标记配方画），方框是非颜色通道，行面是扫读通道，两者都留；选择卡片行首照常是圆圈 / 方框，描边不换、写了 `data-tone` 时面换语气淡底。配方 `markers.page.glyph` 为 trailing：page 语境若再接对号部件，对号同样落在行尾。SideNav 当前项只有行面与字色，不画起始侧指示条（配方 `markers.page.current: none`，2026-09-22 起） | selected + hover = 20%、selected + pressed = 28% | Highlight / HighlightText |
| 导航当前页 | Tabs line、Anchor、NavigationMenu、Breadcrumb | `nav` 语境：透明面 + 2px 指示条 + 字色 `--xh-fg-brand-strong` + `--xh-font-weight-medium`；指示条由组件自己的滑动 indicator 部件承担（Tabs / Anchor / NavigationMenu，机器量几何、皮肤画在 list 上）；list 里没放该部件时，当前项在自己的 `::after` 上自画一条同规格的静态线（厚度 / 颜色 / 圆角读各自 `--xh-<c>-indicator-*` 同一组槽，不做动画，rtl 随逻辑属性镜像，放了部件即收起）：Tabs 横向贴底、纵向贴行向末端（与部件同侧）；Anchor 竖排贴行向起始缘、横排贴底边（链接为省略号收着 overflow，线画在链接盒内、主轴两端各退 `--xh-space-1` 避开圆角，部件则骑在 list 的轨道上）；NavigationMenu 的 `indicator` 部件表达的是「哪张面板开着」而非当前页，指向当前页面的链接始终自画静态线、不随部件收起（横排 list 里的直达链接贴底边，竖排的直达链接与面板里的链接贴行向起始缘，两端同样退 `--xh-space-1`）；Breadcrumb 当前页为不可点位置，投影 `data-xh-collection-terminal`：`--xh-fg-default` + medium、cursor default、无 hover / pressed | current + hover = 100、current + pressed = 200（terminal 不叠加） | ButtonText |
| 格状当前 | Pagination item、Steps indicator、Calendar 选中格 | 实心 `--xh-bg-brand` + `--xh-fg-on-brand`，不加粗 | pressed = `--xh-bg-brand-active` | Highlight / HighlightText |
| 开关型（有滑块） | RadioGroup segmented 形态、Tabs segment | 轨道 `--xh-bg-subtle`（surface 形状）内的白色抬起滑块（RadioGroup 为 `thumb` 部件、Tabs segment 为 `indicator` 部件）：`--xh-bg-surface-raised` + `--xh-border-default` 描边 + `--xh-elevation-raised`，字 `--xh-fg-default` | — | ButtonText 边 |
| 开关型（无滑块） | Toggle、ToggleGroup item、Toolbar `aria-pressed` | `--xh-bg-brand-subtle` + `--xh-fg-on-brand-subtle` | hover 20% → pressed 28%；`solid` 变体才允许品牌实心 | Highlight / HighlightText |
| 展开路径 / 打开中（不是选中） | Menu / Menubar / NavigationMenu trigger open、Cascader in-path、SideNav in-path、Date / Time trigger open | 与所在家族 hover 同档的中性面，不用品牌色、不加粗；非颜色通道由 chevron 转向与子面板承担。Menubar / NavigationMenu trigger 投影 `data-in-path`，`nav` 语境 open-path = `--xh-bg-subtle` | — | — |
| 图例显隐（开是常态） | 图表图例项（`aria-pressed`） | 显示：实心色标 + `--xh-fg-default` 文字；隐藏：空心色标（只留描边）+ `--xh-fg-subtle` 文字 + 删除线；不用品牌淡底，否则整排图例都成了品牌底 | hover 100 → pressed 200（白底承载面阶梯） | 色标 CanvasText；隐藏态保留空心与删除线 |

- `--xh-bg-brand-subtle` 退出 today、completed、open 语义：Calendar today 改 inset 1px `--xh-fg-brand` 环 + 品牌字；Steps completed 改中性面 + 品牌对号；点状形态没有放对号的地方，三态改由形状区分：没走到的空心圈、走过的实心标记色（`--xh-fg-brand`）、当前步实心品牌（格状当前）外加一圈同色环。
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

集合行高按语境取，不由组件自定：

| 语境 | 组件 | 行高来源 |
| --- | --- | --- |
| 候选与菜单 | Menu 族、Listbox、Select / Combobox / Cascader 选项、Tree、Command、时间列（TimePicker、TimeRangePicker 与 DatePicker / DateRangePicker 的时间格） | `--xh-list-option-py-*` 内距加一行文字撑开，说明行再撑高一行 |
| 页面级导航 | SideNav | 最小行高取 `--xh-control-h-*`，与折叠窄栏的方形图标位、同档控件等高 |
| 随文目录 | Anchor | 块向内距 `--xh-space-1`，贴近正文阅读节奏，不按控件高 |

- 新增集合组件从这三种语境里取一种，不另立行高；同一语境内 sm / md / lg 只随控件档变。
- 行高不随选中、当前或语气改变：这些状态只换面与字色。

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
| subtle | 淡底面（RadioGroup segmented 形态 / Tabs segment 轨道、Kbd、`subtle` 档容器、Card subtle） | `--xh-bg-subtle` + `--xh-stroke-thin solid transparent` 占位边 + 无影 |
| soft | 次级操作（Button soft、Tag 等已登记消费者） | 柔和淡底，不加无意义阴影；不用于字段与内容面 |
| raised | Card 与可抬起 / 可拖起部件，逐部件登记 | solid 描边 + solid 底 + `--xh-elevation-raised`；描边必须在，影只是加成；只有可交互时允许 hover 抬升 |
| floating | 含网格或多列的锚定面板（NavigationMenu content、Date / Time / DateRange / TimeRange picker content、Cascader content） | solid 底 + `--xh-border-default` + `--xh-elevation-floating`，不透景；面内分隔取 `--xh-material-solid-separator` |
| frosted | 短列表 / 菜单 / tooltip 等需要透景的锚定瞬态浮层 | `--xh-material-frosted-*` 四件套（bg + backdrop + border + shadow） |
| sheet | Dialog、Drawer、Command、Tour、Notification | `--xh-material-elevated-border` + `--xh-material-elevated-bg` + `--xh-material-elevated-shadow` 三件套，必有 1px 描边 |
| liquid | `data-material="liquid"` 下浮在内容之上的导航层：浮动钮、媒体控制、悬浮栏（§8.5） | `--xh-material-liquid-*`：取样 + 折射 + 按下层着色 + 墨色细线与 1px 边缘光 + floating 影；standard 档下这些部件取原材质 |

### 8.1 Frosted

- 只用于需要保留背景空间感的瞬态浮层。
- 背景最终不透明度应在约 82%–90%。
- blur 使用 16px，saturate 不高于 1.08（这一上限只约束 frosted，liquid 见 §8.5）。
- 必须有 1px 可见边界，不能只依赖 `backdrop-filter`。
- 允许 1px 内侧顶部边界光（`--xh-material-frosted-highlight`）：它是 1px 边界的内侧一半，只表达面的厚度，不是玻璃反射；不允许更大范围的高光、反射线或高透明玻璃效果。Tooltip 反白 compact 档不画（§8.4）。
- 大段正文、表单、Card、Table、Notification、Dialog 主阅读面默认不使用 frosted。
- reduced transparency、forced colors 和 print 下移除 blur，使用同语义实体面。
- 实现只有一份：材质家族配方 `family/material.css`。连接层在部件上投影 `data-xh-material="frosted"`，配方声明私有槽 `--xh-_material-*`（底、悬停 / 按下 / 键盘聚焦面、前景、描边、投影、背景滤镜、顶光）；锚定浮层的内容面由配方直接画四件套与顶光，皮肤只把使用者槽接到桥接槽 `--xh-frosted-*`；浮动钮（BackTop / FloatButton 的 outline 档、Carousel 控制钮、Log / MessageFeed 回到底部）的面归 Action Control，皮肤把 `--xh-action-*` 指向这组私有槽，悬停 / 按下换不透明淡底一档、二档，键盘聚焦铺 focus surface。1px 顶光画在背景最上一层，不用伪元素：滚动的内容面里伪元素会跟着内容滚走。

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
- 刻意例外（须登记）：面板内嵌搜索（Command、Cascader、TreeSelect、Transfer、SideNav 的搜索框）不画字段外壳，只画一道 `border-block-end` 下划线，五处同一种写法：通栏一行，块尺寸取所在尺寸档的 `--xh-control-h-*`、字号取 `--xh-control-font-*`；下划线是面内分隔，取所在面材质的分隔令牌（实体面与 floating 取 `--xh-material-solid-separator`，sheet 取 `--xh-material-elevated-separator`），不取字段边 `--xh-border-control`；连接层投影 `data-xh-field-input`，重置与占位前景走字段家族，自动填充铺的底取所在面板的面；聚焦不画环、下划线也不换色，插入符就是焦点指示（框没有外壳，全局那圈环只会压在通栏一行上），五份皮肤各在搜索框的 `:focus-visible` 上关环并登进焦点环门禁的 ringless；PromptInput 允许 `--xh-shape-surface` 8px，但静息描边仍为 `--xh-border-control`、不用 soft；SignaturePad 画布是画布型字段，按 `aspect-ratio` 撑高、吃不下字段家族配方钉死的控件行高，允许不投影 `data-xh-field-chrome` 而自绘外壳，但值必须与字段规则一致（静息 `transparent` 底 + `--xh-border-control` + `--xh-shape-control` + 无影，落笔升 `--xh-border-control-hover`，disabled / readOnly 按 §7.2 第 9 条）。
- Form 内外字段同形；InputGroup 组壳画 outline 描边，子字段压平为透明。
- 贴边通栏（Alert `banner`）只画朝向页面内容的块尾一条 `--xh-border-default`：另外三条是页面或容器自己的边，重画只会压在边上。面仍是描边面，底色与页内提示相同。

### 8.4 浮层材质判据

- 内容为短列表、菜单、tooltip、气泡 → frosted 四件套；reduced-transparency 下退回同语义实体面。
- 刻意例外（须登记）：Tooltip 保留反白身份，走 compact 档 frosted（`--xh-material-frosted-compact-*` 的 backdrop / shadow / alpha + 光学层），边不取 `--xh-material-frosted-border`（深色 14% 透明边压在反白深底上不可见），改取 on 色 20% 拼色承担 §8.1 的 1px 可见边界；不画 §8.1 的 1px 内侧顶部边界光（反白深底上不需要厚度提示）。
- 刻意例外（须登记）：图表提示框（含 Heatmap 的详情条）走标准 frosted 四件套 + overlay 形状，不反白。提示框里有系列色标，色槽色按图表所在表面校准，反白深底会让色标失去校准；跟随指针时不做位置过渡；`aria-hidden`，朗读由数据标记承担（§13）。
- 内容含网格或多列（日历、时间列、导航大面板）→ floating（solid + border-default + elevation-floating）。
- 模态与强反馈面 → sheet 三件套；任何浮层不得只靠 box-shadow 分层，content / item 部件必须有非透明 border 或 material-*-border。
- 瞬态浮层与模态不使用 liquid。

完整细则见《交互触感与柔和模糊材质规范》。

### 8.5 Liquid

liquid 是导航层材质：浮在内容之上、内容会从它下面滚过、自身内容很短的控制面。它只在应用级轴 `data-material="liquid"` 下出现（视觉环境控制器的 `material` 轴，缺省 `standard`，由 Portal 视觉桥投影，最近的祖先生效）；standard 档下同一部件取原材质。

| 允许 | 部件 |
| --- | --- |
| 浮动钮 | FloatButton trigger 与列表项、BackTop、MessageFeed / Log 回底按钮 |
| 媒体控制 | Carousel 翻页钮与指示器、ImageViewer 工具条 / 翻页钮 / 关闭钮 / 计数 |
| 悬浮栏 | Layout 顶栏、底栏（sticky 或 fixed 时）、Toolbar 悬浮档 |

- 不允许：瞬态浮层、模态、Notification、Card、Table、表单、正文容器；liquid 内再嵌 liquid。栏内的 RadioGroup segmented 形态、Tabs 继承栏的材质，自身不叠材质。允许的部件逐个登记在门禁 `check-material-scope`，连接层投影 `data-xh-liquid`（Layout 顶栏只在吸顶时投影）。
- 液态档下的形态：Carousel 分页条托在一条液态胶囊上；ImageViewer 的工具条与计数取 pill、叉取 circle，前景随墨色域在黑白之间切换，不再钉在浅字上；Layout 吸顶顶栏贴边铺满、不取圆角，边界由下沿墨色细线承担。
- 结构五层，自下而上：
  1. 取样：`--xh-material-liquid-backdrop`（blur sm 8px + saturate 140%）。
  2. 折射：只在距边缘 `--xh-material-liquid-bezel`（18px）以内，按边缘法线向内位移。
  3. 着色：色调浅 / 深 × 不透明度；材质自身是一个墨色域（§7.7）。
  4. 边界：墨色 12% 细线承担可见边界，外加 1px 边缘光环；面内无高光、无反射线。
  5. 投影：`--xh-elevation-floating`。
- 可读下限：浅色调不透明度 ≥ 0.48、深色调 ≥ 0.61，标签文字在任何下层上 ≥ 4.5:1。下层均匀且色调已知时可降到通透档（浅 0.24 / 深 0.34）；下层杂乱、有文字、未知，以及首次判定完成前，一律取可读下限。
- 色调按下层决定，不按主题：作者在图片、视频、画布区域声明 `data-xh-backdrop="light | dark"`（杂乱时加 `data-xh-backdrop-busy`），其余读 DOM 计算色；相对亮度 0.179 ± 0.04 滞回。不读像素、不申请设备方向权限。图片、视频、画布、内嵌 SVG 没有声明时按未知；模态把背景设为 inert、命中栈里读不到时同样只按主题猜色调，不换通透档。库自己知道的下层由连接层声明（ImageViewer 的定位层替被 inert 的深色遮罩声明 `dark`，透明遮罩不声明）。
- 重读时机：滚动、窗口缩放、进入视口，以及下层原地变样——媒体加载完、过渡与动画播完、状态机驱动的平移落定（`data-animating` 撤掉）。
- 光源：细指针下 1px 边缘光沿周长的亮度随指针方向转动；粗指针与无指针固定左上（RTL 右上）。
- 折射只在 Chromium 内核启用，按内核品牌门控（其余引擎能解析 SVG 背景滤镜却不渲染，不能用 `CSS.supports` 判断）；其余引擎为模糊 + 饱和。尺寸超过 640 × 120 或同一视口超过 3 个时只取样不折射。
- 选中不用品牌色字：品牌字压在彩色下层上会失去对比。选中只用指示块 + 字重。
- 形状：不贴边的一维栏取 pill，浮动钮与媒体控制钮取 circle，贴边铺满的栏不取圆角。
- 环境：reduced transparency 下不透明度 1、无背景滤镜与折射，细线与边缘光保留；contrast more 下不透明度 1、细线 3:1、无光环；forced colors 下 `Canvas` / `CanvasText` + 系统边框；print 随导航层隐藏；reduced motion 下色调切换保留 120ms 淡变、光源固定。
- 投影了 `data-xh-material` 的部件，液态档的取值由材质家族配方在同一组私有槽上换出（皮肤不另写液态块）；其余液态部件（Carousel 分页条、ImageViewer 控制层、Layout 顶栏）直接读液态层的 `--xh-_liquid-*`。
- 下层判定、折射与光源由 core 的液态面（`@xihan-ui/core/visual-environment` 的 `trackLiquidSurface`）承担，同一文档的部件共用一套监听；组件的状态机在启动时把投影了 `data-xh-liquid` 的部件挂进去，作者只需写 `data-material`，不再额外安装或调用。这些行为不改变结构、语义与状态表达；服务端与挂载前输出静态形态（色调随主题、不透明度取可读下限）。
- 按下形变：按住液态面时面朝手指鼓出、沿指向拉长、另一个方向压扁（不低于 `--xh-motion-scale-squash`）；拖离时越拉越长，按越界跟手的衰减趋近上限（沿指向伸长 35%）。松手由 `spring-toggle` 带回原形。形变写成 `--xh-_liquid-deform`，只挂在可交互的面上，定位壳上不挂 transform（会抢走 fixed 的包含块）；减弱动效下不形变。
- 液态组：同一宿主里的几块液态面可结成一组（core 的 `trackLiquidGoo`），共用一层库生成的装饰色块层（`aria-hidden`、不接指针，与装滤镜的 `<svg>` 一起插在宿主最前面）。粘连滤镜把边缘相距约 15px 以内的块连成一片；底色、墨色细线、1px 亮边与投影都沿整组外形画，连起来的液桥同样有边、投影不落进液桥；块自身只留前景与磨砂。色块层跟源块的色调、通透档与光源方向走。强制色下色块层撤掉、块取系统边框。现有组：FloatButton 触发器与列表项（缺省 outline 的液态面；其余形态的面是实心的，不结组）。

## 9. 动效

动效只做四件事：确认操作、交代去向、提示进行中与变化，以及在极少数情况下引导注意。全库动效归为以下角色；组件只选择角色，不自定时长、缓动与幅度。

| 角色 | 用途 | 可动属性 | 时长 / 缓动 | 减弱动效 |
| --- | --- | --- | --- | --- |
| 按压 | 确认按下（§9.1–§9.3） | `scale` + 换面 | `press` / `press`，`release` / `release` | 只换面 |
| 状态 | hover、选中、焦点、校验的换色；liquid 档的交互光（§9.12） | 颜色、描边色、阴影、`opacity`；交互光只动描边上的渐变位置；焦点环即时 | `micro` / `enter`；交互光 `glint` / `enter` | 保留淡变；交互光不播 |
| 切换 | 开关滑块、单选圆点、勾选标记 | `translate`、`scale` | `nudge` / `continuous`；短边 ≤ 32px 部件的缩放可用 `settle`；liquid 档的滑块用弹簧 `spring-toggle` | 瞬时 |
| 指示 | 选中指示器在项之间移动（§9.8） | `translate`；尺寸为登记例外 | `move` / `continuous`；liquid 档用双沿弹簧 `spring-lead` / `spring-trail` | 瞬时 |
| 披露 | 内容展开收起（§9.4） | `grid-template-rows` | `expand` / `enter-strong`；`collapse` / `exit` | 瞬时 |
| 出现 | 挂载与卸载（§9.5） | `opacity`、小幅 `translate` / `scale` | `enter` / `enter` 或 `enter-strong`；`exit` / `exit` | 淡变 |
| 列表 | 加入、移除、重排、错开（§9.6） | 同出现；重排用 `translate` | 同出现；重排 `move` / `continuous` | 淡变，无错开 |
| 导航 | 整幅位移：抽屉、覆盖式侧栏、走马灯翻页、平滑滚动 | `translate`、滚动位置 | 进 `slide` / `slide`；出 `exit` / `exit` | 抽屉类淡变，其余瞬时 |
| 数值 | 进度、计数、倒计时（§9.7） | `translate`、`clip-path`、文本 | `move` / `continuous` | 瞬时；倒计时分段 |
| 手势 | 拖拽跟手、松手归位、快甩、越界回弹 | `translate`、`scale`（`scale-drag`） | 跟手无过渡；松手用弹簧并交接松手速度（§9.11）：归位与快甩 `smooth`、越界回弹 `stiff` | 瞬时归位 |
| 循环 | 转圈、微光、脉冲、光标、不定进度、呼吸（§9.12） | `rotate`、`background-position`、`opacity`、`translate`；呼吸只动 `opacity`、`scale` | 循环时长 / `loop`；呼吸 `loop-breathe` / `breathe` | 停止并显示静态替代 |
| 注意 | 抖动、脉冲强调 | — | 只在 `@xihan-ui/animations` 中使用：`attention`，摆幅以 `--xh-motion-distance-md` 为准 | 不播放 |
| 数据 | 图表入场、更新、退出（§9.10） | 几何参数、`scale`、`stroke-dashoffset`、`opacity` | 入场 `reveal` / `enter-strong`，描线 `reveal` / `continuous`；更新与删除 `morph` / `continuous`；淡入 `enter` | 几何瞬时，淡变保留 |
| 氛围 | 动态背景、跑马灯 | 着色器时间轴、`translate` | 由速度决定 | 冻结或停止 |

表中时长省略前缀 `--xh-motion-duration-`，缓动省略前缀 `--xh-motion-ease-`；弹簧名是 `@xihan-ui/motion` 的预设，由令牌生成。

- 带位移、缩放、旋转或尺寸变化的动画不得使用 `micro`、`enter`、`exit` 三支时长：这三支在减弱动效下保留为淡变（§14.4）。
- 屏内换位与尺寸变化（占位式侧栏折叠、分栏折叠、标签带滚动、指示器滑移）归指示 / 列表的 `move`，不归导航；导航只管整幅位移。
- 走马灯的淡变换页（Carousel `effect="fade"`）仍归导航：各张叠放在同一格，新一张压在上面淡入、旧一张同一段淡出、淡完才藏起，取 `slide` / `slide`，与平移换页同一档；减弱动效下与平移一样直接换，不按状态换色保留 120ms 淡变——两张叠着淡过去读起来是重影。淡变一页只放一张，一页多张时两页共有的那几张得在途中换格。
- 时间列（TimePicker、TimeRangePicker 与 DatePicker / DateRangePicker 的时间列）打开时每一列都把选中的那一格停到列顶，几列的选中落在同一行；这一下是首帧内容，直接到位。之后选中值变了，只有换了格的那一列平滑滚过去（导航角色的平滑滚动，减弱动效下直接到位），没换的列留在用户自己滚到的位置。
- 焦点环（`outline` 与字段外壳的环）即时出现、即时撤下，不进过渡：键盘用户要焦点当场落位；字段的描边与底色换色照常 `micro` 淡变。
- `move` 与 `nudge` 的分界：跨位置的换位与尺寸变化（指示器滑移、进度增长、堆叠重排、视口长高）取 `move`（200ms）；原地的小幅几何变化（滑块、勾选标记、展开箭头、拇指缩放）与跟手的拖拽让位、查看器缩放平移取 `nudge`（120ms）。
- 例外：进出场（出现、列表加入与移除、整幅滑出）用 `enter` / `exit` 与对应曲线，关键帧与过渡同一条，前提是其中的位移与缩放只取 `--xh-motion-distance-*`、`--xh-motion-scale-*`、`--xh-motion-travel`：减弱动效下归零，剩下的只有淡变。整幅滑入仍走 `slide`。

### 9.1 离散动作控件

按压缩放只给「定尺的独立动作控件」：inline-size 由 Action Control profile（text / icon / field-inset / floating）决定的按钮、把手、方框、轨道、星、日历格、色块、表格排序钮与展开钮（列头里的排序钮不包列名，是列名之后一颗独立的 icon 档 ghost 钮）。它们必须投影 `data-xh-action-control` 并使用同一配方，同时换底：

| 阶段 | 时长 | 结果 | 缓动 |
| --- | ---: | --- | --- |
| 按下 | `--xh-motion-duration-press`（120ms） | scale 1 → `--xh-motion-scale-press`（0.97），背景进入 active | `--xh-motion-ease-press` |
| 释放 | `--xh-motion-duration-release`（200ms） | scale 0.97 → 1；背景、描边、字色按 `--xh-motion-duration-micro` 回到 hover/rest | `--xh-motion-ease-release`（换面 `--xh-motion-ease-enter`） |

- transform origin 固定为 center。
- 共边相接的分段（ButtonGroup 段、ToggleGroup item、Toolbar group 里的 item）按下只换面不缩放：分段零间距相接，缩放任一段都会撕开两侧接缝；皮肤在该部件上写 `--xh-action-scale-pressed: none`，换底照常。散落的独立条目仍缩放。
- 指针 `:active`、键盘 Press 和 Headless `data-pressed` 必须一致。
- 不采用点击波纹。
- 不允许组件自行设置 0.94、0.96、0.98 等缩放。
- 业务事件不能等待动画结束；按下首帧必须先于异步 loading 状态可见。

### 9.2 行级与 disclosure trigger

主体规则含 `inline-size: 100%`、`flex: 1`、含文本的 grid / flex 或高度随内容多行的部件——Menu Item、Listbox Item、Tree Node、Table Row、SideNav link、Accordion / Collapsible / Reasoning / ToolCall trigger、CodeView fold-trigger、DiffView gap-trigger、Tabs trigger、RadioGroup segmented 形态的段、NavigationMenu / Menubar trigger、Anchor / Breadcrumb link、load-more trigger：

- 按下 120ms 切到 active 面；松开与悬停进入一样按 micro 回到 hover / rest。换面的过渡分不出「悬停进入」与「按压释放」两种来路，所以换面只取一个时长，释放时长只给缩放。
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
- 中途反向从此刻接着走：展开到一半点收起（或反过来），新一段按自己的曲线从当前开合程度继续，不先跳到全开再收、也不先塌成 0 再展。关键帧不能打断，由 Headless 在翻转那一刻（绘制之前）把新一段拨到对应的时间点。
- 关键帧集中在 `family/motion.css`，皮肤只引用。

### 9.5 浮层进出场

按锚定关系与面的类型分组：

| 关系 | 关键帧 | 组件 |
| --- | --- | --- |
| 锚定列表 / 菜单 | `xh-overlay-slide-in / out` | Menu、Select、Combobox、Cascader、ContextMenu、Menubar、Mention、TreeSelect、Date / Time picker、ColorPicker、SideNav 弹出分支、Pagination 省略页码面板、Tooltip（入场 `--xh-motion-duration-enter`） |
| 锚定面板 | `xh-overlay-pop-in` / `xh-pop-out` | Popover、HoverCard、Popconfirm、Tour、Command |
| 无锚定弹出 | `xh-pop-in / out` | NavigationMenu、FloatingPanel、FloatButton 列表、BackTop、Log / MessageFeed 回底按钮 |
| 面板（sheet） | `xh-sheet-in / out`（位移 md + scale-enter） | Dialog、Notification |
| 整幅滑入（slide） | `xh-slide-in / out`（位移 `--xh-motion-travel`） | Drawer、Layout 抽屉式侧栏：入场 `--xh-motion-duration-slide` + `--xh-motion-ease-slide`，退场 `--xh-motion-duration-exit` + `--xh-motion-ease-exit` |

遮罩与全屏面 `xh-fade-in / out`。皮肤内不得重定义共享关键帧。

锚定关系按面板贴不贴着一个锚点、里面是不是一列可选的去处来判：SideNav 折叠态的弹出分支贴着分支行、是一列导航去处，Pagination 摊开的页码面板贴着省略位、是一组可选的页码，两者都归锚定列表，从锚点一侧短移淡入、不缩放；Pagination 的页大小选择是 Select，归 Select。

- Notification 从视口边缘推入属出现，不属整幅滑入：位移以卡片自身高度计、只在堆叠边缘出入，卡片小、距离短，取 `enter` / `exit`；`slide` 只给以视口尺度移动的面（抽屉、覆盖式侧栏、走马灯翻页）。逐条排开的一摞走 `xh-sheet-in / out`；叠摞（轻提示预设的缺省）的进出场另带层深位移与收拢比例，关键帧由 Notification 皮肤自己定义。
- 日历翻月、年月视图切换瞬时，不做方向动画：日期格是查阅对象，横移途中读格会读错；方向由标题里的年月文字交代。

- 首帧：挂载时已经打开的浮层（`defaultOpen`，或受控 `open` / `value` 的初值即打开）属于首帧内容，content 与带进场的遮罩、定位层、聚光框、展开组投影 `data-instant` 直接呈现；机器在进入收起态（按展开项开合的族：展开项第一次变化）时撤掉标记，之后每一次打开照常进场，第一次收起照常播退场。Mention、Pagination 弹层与 SideNav 弹出分支只由用户操作打开，没有挂载即开的那一次。
- 换张：Menubar 与 NavigationMenu 在同一条里的两张之间换，两侧都投影 `data-instant`、瞬时换张（交叉的进退场读起来是闪烁）；只有首开进场、末收退场。NavigationMenu 用共享外壳（viewport）时外壳承担弹出与收回，外壳里的面板回到静态流、只随外壳淡入淡出，时长与外壳同档；换张时外壳留在原处，高度即刻换成新的一张。
- 进场必有退场：凡有进场关键帧的部件必须有对应退场；退场一律经 Presence 等待动画结束再卸载，不用固定计时器。
- 分层：遮罩与面板同时开始、同时退场，在最长的那个结束后卸载；面板内列表的错开从面板进场开始计时。
- 打断：退场中途重新打开时取消退场，从当前透明度继续进场，不先跳回不可见。
- 焦点与事件：进场开始即移入焦点，退场开始即归还；退场中的节点不可命中、不接收键盘；业务回调不等待动画。

### 9.6 列表

- 加入用 `xh-item-in`（竖向上浮），移除用 `xh-fade-out`，都经 Presence。行内横排的胶囊集合（TagsInput、TagGroup、Select 标签行）加入用 `xh-pop-in`：竖向上浮与它们的来源方向不符，还会探出字段外壳的底边。重排用 FLIP：读取旧位置、写入新布局、以 `translate` 反向补偿后过渡到 0，`--xh-motion-duration-move` + `--xh-motion-ease-continuous`。
- 条目由作者渲染、删掉即卸载的集合，离场由列表动效在原位置放一个退场态的替身：绝对定位在原排布位、`inert`、摘掉 id 与表单名，播完即移除。作者的列表写法不为退场改变。
- 错开步长 `--xh-motion-stagger-step`，只对同一批到达的条目按到达顺序计数，最多 5 步；不按 DOM 位置（`nth-child`）计数。
- 首帧规则：初始渲染时已存在的内容（默认展开的披露、默认打开的浮层、历史消息、初始列表）直接呈现，只有用户操作或新数据导致的出现才播进场。headless 以共享状态属性 `data-instant` 标记这类内容，皮肤的进场写在 `:not([data-instant])` 下。
- 启用列表增删动效的集合：TagsInput、FieldArray，以及已有的 Notification、MessageFeed、Command、Cascader 等；Transfer（两侧同时变化）与 InfiniteScroll（批量追加）不启用。
- 检索过滤不算到达：Command 这类随输入即时换一批结果的集合，筛掉又露出来的条目直接呈现，不重播进场与错开（逐键重播会让列表一直在动、读不稳）；只有新插进列表的条目（宿主追加、异步取回的一批）才上浮错开。
- 占位到内容的交叉只动占位：Skeleton 刚加载完时让出版面（原地抬出文档流、钉住原来的尺寸），盖在补上来的真实内容之上以 `exit` 淡出，播完才收起；挂载时就已加载完的直接收起，不播这一段。与 Image / Avatar 的占位层淡出同一个做法，内容在底下直接落位。
- 换位的条目 translate 另有用途、过渡清单又归家族配方时（Tabs 的标签：标签带整体位移占着 translate），换位改走 transform 上的一段 Web 动画（core `glideBy`），时长与曲线同样读 `move` / `continuous`；Tabs 拖动放下、键盘挪位之后挪了位置的标签与分隔线这样滑到新位置，选中标签跟着挪时指示条同一段一起滑。Sortable 放下或取消之后，撤掉拖动位移的那几项按撤之前的屏幕位置同样滑回（`glideFrom`），指针拖动放下的那一项仍由弹簧带着松手速度收进。

### 9.7 数值

- 进度类填充（Progress、LoadingBar、FileUpload 进度）不动 `inline-size`：填充铺满轨道、按比例 `translate`，由轨道裁掉，只走合成；前端圆角保留，行首由轨道圆角裁出。倒计时条自己就是填充、父级不裁，以 `clip-path: inset(…)` 裁切收起。
- 不定进度以固定宽度的段做 `translate` 往复。
- Steps 推进时连接线的点亮层沿行向以 `clip-path: inset(…)` 从这一步填到下一步（左右两侧乘 `--xh-direction-sign`，rtl 翻转；回退时反向收回），`move` / `continuous`；标题换色与圆点换面同一段 `micro`，走过那一步的对号淡入，首帧就走过的直接呈现。
- Steps 当前步的进度环（`percent`）画在序号圆点外一道缝处，与点状形态当前步那圈环同一副几何（缝 `--xh-space-0_5`、环宽 `--xh-stroke-thick`，落在触发器内衬里）：弧从 12 点顺时针走、不随 RTL 镜像，已完成那段取强调色、轨道取连接线的底色；比例写进登记为数值的私有槽，变化时沿 `move` / `continuous` 走到新值，首帧直接落位，走到 / 离开这一步时环按状态角色淡入淡出。
- 倒计时共用一份关键帧；减弱动效下按秒分段显示剩余时间。
- 数值补间（NumberAnimation）的时长由属性给出，减弱动效下直接落到终值。

### 9.8 指示器与性能

- 滑动指示器（Tabs、RadioGroup segmented 形态的滑块、Anchor、NavigationMenu）共用一套测量：取当前项相对列表容器的 `offset*` 几何，投影为私有槽。只有换项才滑：首次落位、同一项的重量（容器与条目尺寸变化、换上正式字体）直接到位，连接层在这一落点投影 `data-instant`，皮肤在它身上撤掉几何过渡；连续缩放窗口时指示器不拖尾。不用 `getBoundingClientRect`，因为祖先的进场缩放会让测量值失真。位置用 `translate`，尺寸用 `inline-size` / `block-size`；Tabs 的标签带滚动已占用 `translate`，指示条的位置叠在 `transform` 上，两者互不覆盖。Tour 聚光框是 `position: fixed` 的视口坐标，按目标的屏幕矩形定位；换步时聚光框与气泡定位层同一段时长、同一条曲线一起滑（只在换步那一段投影 `data-animating`，两者的过渡播完即撤），页面滚动与视口缩放时两者跟手、不补过渡。
- 优先动可合成属性：`translate`、`scale`、`rotate`、`opacity`；`clip-path` 只触发重绘，可以使用。
- 布局属性动画只允许下列登记例外：披露内容的 `grid-template-rows` 与 padding；指示器尺寸（绝对定位、`contain: layout` 的独立小元素）；Switch 滑块按下伸长；Carousel 当前指示点与 Tour 进度点伸长；Layout 侧栏与 SideNav 折叠（同一段 `move`，SideNav 放在侧栏里时随侧栏直接落位；行文字先淡出、宽度落定才裁成图标栏，分组标题留着高度）；Splitter 面板折叠与展开（拖拽与步进跟手，不带过渡）；QuestionFlow 视口与 Notification 叠摞的高度；Tour 换步时聚光框的位置与尺寸、气泡定位层的位置（`position: fixed` 的独立框，只在换步那一段挂）。新增例外须登记理由（门禁 `check-motion-layout`）。
- `will-change` 只写在动画进行中的状态下：拖拽中（`data-dragging`）、机器驱动的补间进行中（`data-animating`），以及 Presence 管理的部件的收起态（`data-state='closed'`，只在退场那一段留在屏上）。开态常驻会使文字模糊；不可合成的属性不写 `will-change`。
- transition 列表写长名：`background-color`、`border-color`、`outline-color`、`box-shadow`、`opacity`、`translate`、`scale`、`rotate`；不写 `background`、`border`、`outline` 与 `transform` 简写。需要一次性组合多个变换、且顺序是独立属性表达不了的，才写 `transform`，并登记理由。
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
| 柱入场 | `scale` 沿值轴从 0 到 1，原点在基线 | `reveal` / `enter-strong` |
| 折线描出 | 共享关键帧 `xh-draw`（`pathLength="1"` + `stroke-dashoffset`） | `reveal` / `continuous` |
| 扇区扫开 | 饼图与旭日图同一手势：扇区收在整圈的起始角上，起止角一起按比例放开 | `reveal` / `enter-strong` |
| 数据更新、图例切换 | JS 参数插值（按几何参数插值，不按路径字符串插值），坐标轴刻度同步插值 | `morph` / `continuous` |
| 点、标签淡入 | 淡入 | `enter` / `enter` |
| 条目删除 | 收回基线并淡出后移除，与邻居的重排同一段 | `morph` / `continuous` |
| 缩放换窗 | 一步到位的换窗（键盘缩放、滚轮一格、点缩放条、命令式）从当前帧补间到新窗口；拖动平移、捏合与触控板连续滑动跟手 | `move` / `continuous` |
| 悬停、聚焦 | 不改几何，只换状态属性 | `micro` / `enter` |

- 错开按系列（直角坐标图与雷达图的多系列同一规则），最多 5 步；同一系列内的点不错开。
- 首次挂载播放入场；重取数据后的变化按「更新」处理，不再次播放入场。
- 十字准线与提示框跟随指针时不做位置过渡。

### 9.11 弹簧

| 场景 | 档 | 参数 |
| --- | --- | --- |
| 手势松手：Carousel 翻页 / 归位、Sortable 放下归位、ImageViewer 平移惯性、Switch 拖动拇指 | 缺省 | `smooth`（刚度 300 / 阻尼 30，超调 0.4%，落定约 283ms） |
| 越界回弹 | 缺省 | `stiff`（600 / 42，超调 0.5%，约 195ms） |
| 惯性滑行：ImageViewer 平移快甩 | 缺省 | 临界阻尼、固有频率 1 / τ（motion 的 `glideSpring`，τ 为投影时间）：以投影落点为目标时恰是指数减速，停在落点；落点越过边界时滑到边界交给越界回弹 |
| 切换滑块 | liquid | `spring-toggle`（420 / 26，超调 7.5%） |
| 指示器前沿 / 后沿 | liquid | `spring-lead`（520 / 34）/ `spring-trail`（210 / 24） |
| 融合分离 | liquid | `spring-merge`（320 / 24，超调 5.8%） |
| 按下形变回弹 | liquid | `spring-toggle` |

- standard 档超调不超过 3%，liquid 档不超过 8%；`bouncy` 不进入核心组件。
- 速度交接：指针会话（单指与多指）保留最近 80ms 的采样，松手时的速度（px/s）作为弹簧初速度；落点取「当前位置 + 速度 × 投影时间」最近的吸附点。投影时间：Switch 拇指 0.06s、Carousel 翻页 0.2s、ImageViewer 惯性 0.3s。Carousel 往回甩到起点另一侧算收回，不翻到反方向；落定途中再按下时从弹簧此刻的位置接着拖。被系统收走（pointercancel）时不按速度投影，回到原位。
- 越界跟手按 `(1 − 1 / (x × 0.55 / d + 1)) × d` 衰减（motion 的 `rubberBand`）：拇指 24px、卡片（Carousel 首末页）60px、面板（ImageViewer 平移范围）80px。
- 惯性滑行撞边：投影落点越过边界时照原速滑到边界，碰到的那一刻以那一刻的速度（越过边界那段投影 ÷ τ）交给越界回弹 `stiff`；越出的那段与越界跟手同一条橡皮筋，越界量到不了橡皮筋尺寸，轻碰一下再停。不把落点截到边界再交给同一支滑行弹簧：临界阻尼弹簧带着松手速度奔向截短的目标会冲过头，越界量约为截掉那段的 1 / e，快甩时露出视口底色。
- 中途改向：以当前值与当前速度为初始条件重新求解，位置与速度都不跳变。
- 实现：`@xihan-ui/motion` 的有状态弹簧经 `frameLoop` 驱动；减弱动效下直接落到终态。CSS 侧的弹簧曲线只有令牌 `--xh-motion-ease-spring`（`linear()`，`@supports` 守卫，兜底 `cubic-bezier`），只用于 liquid 档的点击切换；手势一律走 JS。
- Slider 拇指、FloatingPanel、Splitter、Resizable 不用弹簧：值必须精确跟手，或松手即停在原位。

### 9.12 呼吸与光

呼吸只表达「正在进行、给不出进度、需要被察觉」：Badge 圆点的 `pulse`（直播、录制、通话中）、MessageFeed 已发送待首个片段、Approval 待审。有进度用 Progress，只是等待用 Spinner，静态状态（在线、已完成）不呼吸。

- 周期 `--xh-motion-loop-breathe`（3600ms），缓动 `--xh-motion-ease-breathe`（正弦式缓入缓出）；圆点不透明度 0.5 ↔ 1、缩放 0.82 ↔ 1；外扩光环缩放 1 → 2.6、不透明度 0.32 → 0，只播 3 个周期后停止，圆点持续到状态结束。
- 共享关键帧 `xh-breathe` / `xh-breathe-halo`；两道减弱开关，静态替代为满不透明度的圆点；状态必须同时有文字或可及名。
- 状态点是装饰部件、对读屏隐藏，只在等待时出现，各组件统一叫 `pending-indicator`：MessageFeed 的放在列表之后，只在 `status` 为 `submitted` 时出现，首个片段到来即收；Approval 的钉在右上角（不占版面），颜色随语气、缺省取警示色，判定落定即收。强制色下取 `CanvasText`，打印时隐藏。

光分三类：

| 类别 | 例子 | 规则 |
| --- | --- | --- |
| 状态光 | 思考中文字、骨架屏、工具调用进行中的扫光 | 循环角色，共享 `xh-shimmer` |
| 交互光 | Button solid 悬停时光沿描边扫过一次（`::after` 只留 1px 描边环，光取面上前景色）；可交互 Card（`interactive`）悬停时同一配方，光取卡片前景色 | 只在 liquid 档、`(hover: hover) and (pointer: fine)`、非强制色；不循环；`--xh-motion-duration-glint`（640ms，减弱档 1ms），共享关键帧 `xh-glint` |
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

### 11.1 占位态

集合、浮层、图表与媒体「此刻没有可看的内容」时画占位。占位只有四个相位，占同一个位置、同一副排版，同一时刻只出现一种；占位自己不画面（底、描边、投影归宿主）。

| 相位 | 条件 | 画面 |
| --- | --- | --- |
| 加载 | 还没有数据、正在取 | 一枚加载环排在一句文案之前。环走加载环家族配方（`family/loading-ring.css`，与 Spinner 环档同一副画法：轨道 `--xh-border-default`、`--xh-stroke-thick`、起始边取前景）；连接层在占位部件上投影 `data-xh-loading-ring` 与 `data-loading`，环随之按 `micro` 淡入淡出、转与停 |
| 刷新 | 已有数据、后台在取 | 不换成占位：保留上一帧的内容，容器报 `aria-busy`，内容按 `micro` 淡到 `--xh-state-disabled-opacity`，数据到了再淡回；加载占位在这一相位让位 |
| 空 | 取完没有条目、筛完没有匹配 | 一句文案，由作者或 `translations` 供给；没给文案时不渲染一块空白 |
| 错误 | 取数或载入失败 | 一枚 `--xh-glyph-mark-warning` 字形（`--xh-fg-danger`，非颜色通道）排在一句说明之前；有重试能力时另给重试入口。媒体在画面正中画同一枚字形，不露浏览器的破图 |

- 文字：字号与所在尺寸档的条目同档（`--xh-control-font-*`），颜色取次要文字：实体面、floating 与 sheet 上 `--xh-fg-muted`，frosted 浮层上取材质的 `--xh-material-frosted-fg-muted`（常规档二者同值，强制色下后者退成 `CanvasText`）。不取 `--xh-fg-subtle`：那一档留给占位字与禁用标签。
- 排版：块向内距 `--xh-space-3`，行内内距与条目文字对齐（取条目的行内内衬槽），内容居中；不设最小高，占位不撑出空白。浮层与字段盒等宽时占位铺满这一宽度。
- 加载环：直径取所在尺寸档的图标档 `--xh-icon-size`，与文案的间距取控件间距；减弱动效与打印下换成静止的点线环，淡入淡出照常（配方给）。
- Spinner 独立成件，环档自己画（它另有渐隐弧与三点两档、语气与延迟露面），但与加载环配方逐项同值：环粗、轨道、起始边、圆角与转圈节拍；三档直径同控件内图标档（sm 16 / md 20 / lg 24）。
- 进行中的动作钮（Button、Clipboard、DownloadTrigger、Popconfirm 确认钮）是同一种环，只有一种做法：钮宽不变，环居中压在钮上（承载者投影 `data-xh-loading-ring="overlay"`）；进入在途要等一个 `micro` 才起淡，钮里原有的内容同一刻淡出留位，不到一个 `micro` 就结束的短请求什么都不闪；退出在途不等，环与内容按 `micro` 交叉淡回，不硬切。
- 行内的在途标记（Approval 判定在途、Switch 拇指、Toast / Notification 行首）同样走加载环配方，只是环排在自己的位置上，不压在内容上。
- 页内整块的等待用 Skeleton。图表的加载与空态走 Chart 家族配方：环同样由加载环配方画在空态部件上（空态部件投影 `data-xh-loading-ring` 与 `data-loading`），刷新相位同本节保留上一帧淡下；图表没有尺寸档，文字取说明档 `--xh-text-secondary-size`、环径取 `--xh-glyph-size-md`。

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

- Notification、Dialog、LoadingBar 等服务必须绑定 Provider 或目标文档。
- 同一类反馈只有一个服务工厂：轻提示是 `createNotificationService({ preset: 'toast' })`，不另立工厂；每个服务实例各自持有队列。
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
- 不提供导出（PNG / SVG / 数据下载）：图表只负责展示与交互，导出涉及字体嵌入、主题解析与打印尺寸，交给宿主应用按自身需求实现；需要打印时走 §14.5 的打印规则。

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
- 例外：Heatmap 不走 `<figure>` + 视觉隐藏数据表，网格部件取 `role="grid"`（`aria-readonly`）。它的格子排成的就是一张二维表：行列头是两条坐标，每格的可及名自带完整身份与数值，整张网格占一个 Tab 位、方向键逐格走（APG grid）；再生成一张隐藏表会让同一批数值被读两遍。坐标轴文字与色阶图例的色块照旧 `aria-hidden`，详情条同图表提示框。
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

### 14.6 断点

尺寸档按视口，不按容器：容器查询会让组件根不再由内容撑宽，组件落在收缩包裹的祖先链里就塌掉，库无法控制作者的祖先链。

| 档 | 条件 | 写法 |
| --- | --- | --- |
| 紧凑 | 视口宽 < 640px | `@media not all and (min-width: 640px)` |
| 中等 | 640–1023px | `@media (min-width: 640px)` 起 |
| 宽松 | ≥ 1024px | `@media (min-width: 1024px)` |
| 粗指针 | `(pointer: coarse)` | 与宽度正交 |

- 低于断点只用补集写法：它在地板内可用，并与 `min-width` 规则在断点处严格互补。不写 `max-width` / `max-height`，不写媒体查询范围语法（`width < …`，Safari 16.4 起支持，高于地板）。
- 小屏与触屏的专门适配（浮层换成底部面板或全屏、触屏手势、悬停守卫、粗指针字号、软键盘让位）暂缓，另行规划；在那之前组件不按这些方向改形态。

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
- 组件总览的每张卡片放一张内联 SVG 示意图，不挂真实组件，写法见 §15.2。
- 复杂业务组合放到模式页，不塞进基础组件专页。
- 示例必须覆盖 Vue、React、Web Components；确实不适用时登记原因。
- 图表的第一个示例只写根、视口与绘图区；作为双 y 轴替代的多图联动示例放在显眼处。
- 文档另设《选图指南》：按数据任务选组件，并给出系列数量阶梯。

### 15.2 总览示意图

组件总览（`docs/components/index.md`）同时摆出全部组件，每张卡片只放一张内联 SVG 示意图：源文件是 `docs/.vitepress/catalog/<组件>.vue`，跨分类引用的卡片用清单里 `preview` 指定的文件名。示意图只画识别该组件所需的特征，不挂真实组件、不引 `@xihan-ui/*` 运行时。门禁 `check-catalog-preview` 逐条核对本节。

**文件与根**

- 文件只有一个 `<template>`，里面只有一个 `<svg>` 根；不写 `<script>`、`<style>`。
- 根属性固定为 `viewBox="0 0 240 160" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"`，不写 `width` / `height` / `style` / `class`。卡片标题已给可及名，示意图对读屏隐藏。
- 画布只有 240 × 160 一档。卡片把 SVG 铺满内容区、按比例缩放，宽屏下与画布 1:1。
- 元素只用 `g`、`path`、`rect`、`circle`、`defs`、`linearGradient`、`stop`。不写 `<text>`、`<foreignObject>`、`<image>`、`<use>`、`<style>`、`<animate*>` / `<set>`，不写 `transform`、事件与 Vue 绑定。
- 渐变的 `id` 以文件名开头（`<组件>-<用途>`）：全部示意图内联在同一页，撞名时后一张会取到前一张的渐变。
- 一张图的元素不超过 40 个；同色、同线宽、相邻绘制的文字条与字形合并成一条 `path`。

**网格与尺度**

- 尺寸与间距按 §6.1 的 4 格取值，半阶 2 / 6 / 10 只用于居中补偿；1 线宽的描边落在半格（`x="24.5"`），外框仍对齐整格；`rect` / `circle` 的坐标与尺寸取 0.5 的倍数。
- 内容框两档：常规 x 16–224（宽 208），单行字段 x 40–200（宽 160）。构图上下居中，离画布边不少于 8；遮罩与跑马灯这类铺满或越出视口的构件除外。

| 构件 | 尺寸 | 形状 |
| --- | --- | --- |
| 控件：按钮、字段、触发器 | 高 32 | 圆角 4 |
| 面板里的紧凑按钮、列表行 | 高 24；行的悬停面左右各内缩 4 | 圆角 4 |
| 复选框、色块 | 16 × 16、24 × 24 | 圆角 4 |
| 单选圈、头像、浮动钮、节点 | — | `<circle>` |
| 开关 | 32 × 16，拇指半径 6 | 胶囊 |
| 轨道：滑块、进度、滚动条 | 线宽 4 / 6 的圆头线 | 胶囊 |
| 标签、徽标 | 高 16–20 | 胶囊 |
| 内容面：Card、列表与表格容器 | — | 圆角 8 |
| 浮层：Popover、Menu、Dialog、Notification | — | 圆角 12 |
| 字形 | 16 × 16 格 | 线宽 2 |

- `rect` 的 `rx` 只取 4 / 8 / 12，或等于短边一半（胶囊）；圆用 `<circle>`。数据标记按 §6.3 取 inset。
- 线宽只有五档：1 描边、分隔、网格与坐标轴；2 字形、焦点边、指示条、折线；4 / 6 / 8 文字条与轨道。虚线只画不存在实体边的范围（拖放区、视口外的虚拟行），取 `stroke-dasharray="4 4"`。

**文字条**

文字一律画成圆头线 `<path d="M x y h len" stroke-width="…">`，不写真实文案：语言、字体与字宽都不进示意图。数字与字母同样画成短条。条长取偶数，只示意字数多少，并列的几条长短错开；圆头向两端各伸出半个线宽，按可见长度排版。

| 角色 | 线宽 | 颜色 |
| --- | --- | --- |
| 大号数值、页面标题 | 8 | `--xh-fg-default` |
| 标题、控件里的值与按钮字 | 6 | `--xh-fg-default` |
| 条目与正文里的主文字 | 6 | `--xh-fg-muted` |
| 占位 | 6 | `--xh-fg-disabled` |
| 字段标签、列头 | 4 | `--xh-fg-default` |
| 段落、说明 | 4 | `--xh-fg-muted` |
| 次级标注、时间、计数 | 4 | `--xh-fg-subtle` |
| 图表刻度与标签 | 4 | `--xh-chart-label` |
| 品牌实心面上 | 6 / 4 | `--xh-fg-on-brand` |
| 选中面上 | 6 / 4 | `--xh-fg-on-brand-subtle` |
| 链接、当前项 | 6 / 4 | `--xh-fg-brand` / `--xh-fg-brand-strong` |

**颜色**

- `fill`、`stroke`、`stop-color` 只写 `var(--xh-*)` 语义令牌、同文件渐变 `url(#…)` 或 `none`；不写十六进制、`rgb()`、具名色与 `currentColor`。亮暗主题、高对比与墨色都随令牌走。
- 可用的令牌族：`--xh-bg-*`、`--xh-fg-*`、`--xh-border-*`、`--xh-chart-*` 的颜色、`--xh-syntax-*`、`--xh-gradient-brand-*`；语气色写在 `<g data-tone="…">` 里取 `--xh-tone-*`；基础色板 `--xh-color-*` 只给画颜色本身的组件（ColorField、ColorPicker、ColorSlider、ColorSwatch、ColorSwatchPicker）。
- 透明度只取令牌：`fill-opacity` 取 `--xh-chart-area-alpha` / `--xh-chart-link-alpha`；渐变的 `stop-opacity` 只取 0 / 1。

| 构件 | 取色 |
| --- | --- |
| 卡片底 | 不画，透出卡片的 `--xh-bg-page` |
| 内容面 | `--xh-bg-surface` 底 + `--xh-border-default` 描边 |
| 浮层面 | `--xh-bg-surface-raised` 底 + `--xh-border-default` 描边 |
| 控件盒：字段、复选框、单选圈 | 只描 `--xh-border-control`，不填底；聚焦 `--xh-border-control-focus`，校验失败 `--xh-border-invalid` |
| 按钮 | 主动作 `--xh-bg-brand` 实心；次要动作 `--xh-border-default` 描边；中性触发器 `--xh-bg-subtle` 淡底 |
| 选中 / 当前 | 行与开关面 `--xh-bg-brand-subtle`；对号与指示条 `--xh-fg-brand`；格状当前 `--xh-bg-brand` |
| 悬停行、打开中的触发器 | `--xh-bg-subtle` |
| 轨道 | `--xh-bg-subtle-active`，已走过的一段 `--xh-bg-brand` |
| 分隔线 | `--xh-border-subtle`；面的外边 `--xh-border-default` |
| 图片占位 | `--xh-bg-subtle-hover-opaque` 底，山与日 `--xh-bg-subtle-active-opaque` |
| 遮罩 | `--xh-bg-overlay` |
| 数据标记 | 数据色（§7.6）；相邻填充之间用 `--xh-chart-surface` 线宽 2 分开 |

**画什么**

- 画组件缺省形态的识别特征：md 档、缺省 variant；语气即核心用途的组件（Alert、Badge、Progress、Notification）可以画非中性语气。
- 浮层类画已打开的静态面板：触发器 + 面板，带箭头的浮层画箭头，模态画遮罩；不只画触发器。
- 同族组件用同一套构件拼：字段类是控件盒 + 值条 + 尾部字形；下拉类是触发器 + 下方隔 4 的浮层面 + 24 高的行；集合类是 24 高的行、悬停面与行尾对号；图表类画示意性的数据图形（网格、坐标轴、刻度条与数据色），不画真实数据。
- 各张图的信息量相近：主体占画布的一半到七成，不画说明性的注释与引线。
- 不画动效：转圈、骨架、跑马灯与流式光标都画静止的一帧，没有循环、进场与悬停反馈。

**字形**

字形在 16 × 16 格里画，线宽 2，`stroke` 取前景令牌。写成「起点 + 相对命令」：起点相对格的左上角，挪位置只改起点。

| 字形 | 起点 | 相对命令 |
| --- | --- | --- |
| `chevron-down` | 4, 6 | `l4 4 4-4` |
| `chevron-up` | 4, 10 | `l4-4 4 4` |
| `chevron-right` | 6, 4 | `l4 4-4 4` |
| `chevron-left` | 10, 4 | `l-4 4 4 4` |
| `check` | 3, 8 | `l3 3 7-7` |
| `close` | 4, 4 | `l8 8m0-8l-8 8` |
| `plus` | 8, 3 | `v10m-5-5h10` |
| `minus` | 3, 8 | `h10` |
| `more` | 3, 8 | `h0m5 0h0m5 0h0` |
| `grip` | 6, 3 | `h0m4 0h0m-4 5h0m4 0h0m-4 5h0m4 0h0` |
| `search` | 12, 7 | `a5 5 0 1 1-10 0a5 5 0 1 1 10 0m-1.5 3.5l3.5 3.5` |
| `zoom-in` | 12, 7 | `a5 5 0 1 1-10 0a5 5 0 1 1 10 0m-1.5 3.5l3.5 3.5m-7-9v4m-2-2h4` |
| `zoom-out` | 12, 7 | `a5 5 0 1 1-10 0a5 5 0 1 1 10 0m-1.5 3.5l3.5 3.5m-9-7h4` |
| `arrow-up` | 8, 14 | `v-12m-5 5l5-5 5 5` |
| `arrow-right` | 2, 8 | `h12m-5-5l5 5-5 5` |
| `download` | 8, 2 | `v8m-4-4l4 4 4-4m-10 8h12` |
| `upload` | 8, 10 | `v-8m-4 4l4-4 4 4m-10 8h12` |
| `copy` | 6, 6 | `h8v8h-8zm-4 4v-8h8` |
| `pencil` | 2, 14 | `l1-4 8-8 3 3-8 8z` |
| `calendar` | 2, 4 | `h12v10h-12zm0 4h12m-9-6v3m6-3v3` |
| `clock` | 14, 8 | `a6 6 0 1 1-12 0a6 6 0 1 1 12 0m-6-3v3l2 2` |
| `info` | 14, 8 | `a6 6 0 1 1-12 0a6 6 0 1 1 12 0m-6-.5v3.5m0-6h0` |
| `check-circle` | 14, 8 | `a6 6 0 1 1-12 0a6 6 0 1 1 12 0m-8.5 0l2 2 3-3.5` |
| `alert` | 8, 2 | `l6.5 11.5h-13zm0 4.5v3m0 2.5h0` |
| `bell` | 3, 12 | `h10l-1.5-2.5v-3a3.5 3.5 0 0 0-7 0v3zm3.5 2h3` |
| `user` | 10.5, 5.5 | `a2.5 2.5 0 1 1-5 0a2.5 2.5 0 1 1 5 0m-7.5 8.5a5 5 0 0 1 10 0` |
| `home` | 2, 8 | `l6-5 6 5m-10-1v7h8v-7` |
| `file` | 3, 2 | `h6l4 4v8h-10zm6 0v4h4` |
| `folder` | 2, 4 | `h4l2 2h6v7h-12z` |
| `image` | 2, 3 | `h12v10h-12zm0 8l4-4 3 3 2-2 3 3` |
| `link` | 6.5, 9.5 | `l3-3m-4.5.5l-1.5 1.5a2.8 2.8 0 0 0 4 4l1.5-1.5m2-2l1.5-1.5a2.8 2.8 0 0 0-4-4l-1.5 1.5` |
| `eye` | 1, 8 | `q7-8 14 0q-7 8-14 0zm7-2a2 2 0 1 1 0 4a2 2 0 1 1 0-4` |
| `paperclip` | 12, 7 | `l-5 5a2 2 0 0 1-3-3l6-6a3 3 0 0 1 4 4l-6 6` |
| `sparkle` | 8, 2 | `q1 5 6 6q-5 1-6 6q-1-5-6-6q5-1 6-6z` |
| `align-left` | 2, 4 | `h12m-12 4h8m-8 4h10` |
| `align-center` | 2, 4 | `h12m-10 4h8m-9 4h10` |
| `align-right` | 2, 4 | `h12m-8 4h8m-10 4h10` |
| `play` | 5, 3 | `v10l8-5z` |
| `pause` | 5.5, 3 | `v10m5-10v10` |
| `refresh` | 13, 8 | `a5 5 0 1 1-1.5-3.5m1.5-2.5v4h-4` |
| `rotate` | 3, 8 | `a5 5 0 1 1 1.5 3.5m-1.5 2.5v-4h4` |
| `resize` | 14, 4 | `l-10 10m10-5l-5 5` |

**环境**

- 方向：示意图画的是界面布局，RTL 下整张水平镜像。方向固定的内容不镜像，根上写 `data-direction="fixed"`：图表分类的全部卡片（绘图区不随 RTL 镜像，§14.2），条码与二维码，代码、差异、JSON 与日志。
- 强制色：卡片把示意图转成系统色线稿：有填充的形状画成 `Canvas` 面 + `CanvasText` 边，线与文字条取 `CanvasText`，引用品牌令牌的取 `Highlight` / `HighlightText`，禁用取 `GrayText`。示意图只按语义取令牌，不写强制色分支。
- 密度与高对比：控件高度与线宽按画布固定，密度不改示意图；高对比随令牌加深描边。

### 15.3 文案

- 使用短句、事实和约束。
- 先说用户能完成什么，不描述实现过程。
- 同一概念始终使用同一个词。
- 错误文案说明发生了什么以及下一步怎么做，不责怪用户。
- 标题、标签、按钮和单句提示不写多余标点。

### 15.4 自动生成内容

Props、事件、插槽、anatomy、键盘表、状态属性、CSS 变量和 CEM 必须由源码生成或校验，不允许手工维护两份不一致的事实。

## 16. 实现与验收顺序

### 16.1 实现

1. Core 公共原语。
2. Headless 状态机和 connect。
3. Headless 单测。
4. Vue、React、Web Components 适配器。
5. 共享 CSS 和组件令牌。
6. 三端一致性与真实浏览器测试。
7. 文档、示例、总览示意图和生成物。
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
- [ ] 示例无冗余，总览有按 §15.2 画的示意图。
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
- 禁止皮肤手写 scrollbar-width / scrollbar-color。
- 禁止总览卡片挂真实组件；禁止总览示意图写散色、文字与动画。
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
- 禁止 `max-width` / `max-height` 媒体查询与媒体查询范围语法。
- 禁止用 `maximum-scale` 或 `user-scalable=no` 规避 iOS 聚焦放大。
- 禁止用容器查询给组件根换档。

## 19. 待落地条款

以下条款已生效，但实现尚未完成。落地前现有代码可以暂不满足；新代码不得与之冲突，也不得为了满足它们去改动尚未排期迁移的组件。完成一项即从本表删除。

| 条款 | 待完成 |
| --- | --- |
| §8.5 liquid | Toolbar 悬浮档与悬浮栏里相邻分段结液态组（Toolbar 还没有悬浮形态，等它落地再接） |
| §9.11 弹簧 | `--xh-motion-ease-spring` |
