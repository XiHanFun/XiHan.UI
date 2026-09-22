来源：https://ui.docs.xihanfun.com/design/patterns

# 组件家族与模式

新组件先归族，再决定局部样式。家族给出尺寸、状态、焦点、禁用与按压的配方（`family/*.css`），组件只映射自己的覆盖槽；门禁按家族逐成员比对，同族成员的同类部件逐条同值。

## 六个家族

| 家族 | 典型组件 | 配方给什么 |
| --- | --- | --- |
| Action Control | Button、Toggle、ToggleGroup item、分页按钮、图标按钮、Toolbar item、Segmented item、各类 trigger | 高度、内边距、图标随档、缺省语气（只有 Button 品牌实心）、按承载面的交互阶梯、120 / 200ms 按压、焦点、禁用、加载。六个 profile：`text`、`icon`、`field-inset`（字段内的清空 / 展开小钮）、`floating`（悬浮单图标动作，圆形）、`row` 与 `disclosure-trigger`（铺满一行、只换面） |
| Field Chrome | Input、Textarea、Select trigger、Date / Time field、Combobox、Cascader、TagsInput、PinInput、PromptInput | 静息描边式外壳（不填底）、`outline / subtle / ghost` 三档 × rest / hover / focus / invalid / disabled / readOnly / loading 七态、占位、前后缀、清空、标签与说明排版、缺省宽 |
| Collection Item | Menu item、Listbox item、Tree node、Table row、Transfer item、SideNav link、Tabs line trigger、Anchor / Breadcrumb link、NavigationMenu / Menubar trigger | highlighted、按集合语境（`overlay / page / nav`）的 selected / current 标记、pressed 只换面、disabled、缩进、指示器 |
| Surface | Card、Alert、Panel、CodeView、DiffView、Log、JsonViewer、ToolCall、Reasoning、Approval、QuestionFlow、Accordion / Toolbar / PageHeader 的 outline 档、各类容器面 | 边界三选一、raised 逐部件登记、标题与说明排版、内衬只走 `--xh-surface-*`、层级 |
| Overlay | Popover、Menu、Select content、Dialog、Drawer、Tooltip、NavigationMenu content、日期 / 时间面板 | Portal、定位、遮罩、材质按内容判定、进退场按锚定关系、浮层滚动面、焦点归还 |
| Feedback | Toast、Notification、Progress、Skeleton | 状态语气、sheet 面描边、计时、暂停、消除、加载与即时反馈 |

一个组件可以组合多个家族，但每个部件只有一个主要身份。归族的判据是功能：用户直接触发动作 → Action Control；输入或选择值 → Field Chrome；在集合中导航、选择或操作条目 → Collection Item；长期承载一组内容 → Surface；脱离文档流临时覆盖页面 → Overlay；表达任务过程或结果 → Feedback。

## 视觉轴

组件只允许这几条公共轴，不允许私有轴：

| 轴 | 取值 | 说明 |
| --- | --- | --- |
| `size` | `sm / md / lg` | md 缺省；换高度、内衬、间隙、字号与图标，不随断点改 |
| `variant` | `outline / subtle / ghost`，可按下的表面多一档 `solid` | 结构形态，不表达业务状态；缺省等价 outline，Tabs 缺省 `line` |
| `tone` | `brand / neutral / danger / warning / success / info` | 语气；缺省中性，只有 Button 缺省品牌 |
| `data-density` | `comfortable / compact` | 环境轴，由控制器投影，组件不各自定义 |

`bordered`、`borderless`、`plain | surface`、`primary | secondary` 这类私有轴一律不存在：有框无框走 `variant`，主次走 `variant` + `tone`。

## 状态

每个组件按实际能力补齐 rest、hover、pressed、focus-visible、selected / open、disabled、loading、invalid 与退出状态，由 Headless 投影成 `data-*` 状态事实，皮肤只映射：

- hover、active、selected 从当前语义面派生，不切换到无关颜色。
- disabled 同时调整前景或背景并关闭交互，不只降 opacity。
- 错误、选择、加载与警告不能只靠颜色。
- 暗色下 overlay 必须能从 canvas 与 surface 中辨认。

## 七个分类怎么选

组件总览按用途分七类，与家族是两个维度——分类回答"我要做什么"，家族回答"它长什么样"：

| 分类 | 选型要点 |
| --- | --- |
| [通用](/components/#通用) | Button 只给动作，导航用链接；Toggle 表达开关态而不是触发动作；Clipboard、DownloadTrigger 是带结果反馈的动作钮 |
| [布局](/components/#布局) | 页面骨架用 Layout，局部排列用 Flex / Grid，可拖动分栏用 Splitter；见 [布局](/design/layout) |
| [导航](/components/#导航) | 页级切换用 Tabs，站内层级用 SideNav / NavigationMenu / Menubar，位置用 Breadcrumb / Anchor / Steps，右键与更多用 ContextMenu / Menu |
| [数据录入](/components/#数据录入) | 少于七个互斥项用 RadioGroup，更多用 Select；可输入的候选用 Combobox；多选用 CheckboxGroup 或 TagsInput；日期优先分段输入（DateField）再加日历（DatePicker）；整表用 Form + Field 承担校验与重置 |
| [数据展示](/components/#数据展示) | 记录用 Table，层级用 Tree，键值对用 Descriptions，长列表用 Virtualizer / InfiniteScroll，状态用 Tag / Badge |
| [反馈](/components/#反馈) | 页内静态提示用 Alert，操作结果用 Toast（短、自动消失）或 Notification（可停留、可动作），进行中用 Progress / Spinner / Skeleton / LoadingBar |
| [浮层](/components/#浮层) | 轻量补充用 Tooltip / HoverCard / Popover，需要确认用 Popconfirm，需要打断用 Dialog，侧边任务流用 Drawer，命令入口用 Command |
| [AI 对话](/components/#ai-对话) | 输入用 PromptInput，流式正文用 MarkdownStream / MessageFeed，工具与推理用 ToolCall / Reasoning，审批与提问用 Approval / QuestionFlow |

## 示例与总览

- 第一个示例用最少结构展示核心用途；一个示例只证明一个意图；不为覆盖 API 保留重复示例；示例不写内联宽度。
- 组件总览用独立极简预览：一律 md 缺省档、缺省 variant，tone 只在语气即核心用途时允许一个非 neutral 值；浮层类展示已打开的静态面板。
- 复杂业务组合放到 [示例](/examples/) 一册，不塞进基础组件专页。

## 相关

- [设计原则](/design/principles) · [形状与边界](/design/shape) · [动效](/design/motion)
- 指南：[解剖与部件契约](/guide/anatomy) · [connect 与属性产出](/guide/connect)
