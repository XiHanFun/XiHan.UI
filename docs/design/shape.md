# 形状与边界

圆角与边线是最容易长出第二套规则的地方——一个组件 6px、另一个 5px，看着都"差不多"。这里的规则是：圆角只有一条语义阶梯，边界只由描边承担，两者都由门禁逐条扫。

## 圆角阶梯

<XhTokenTable
  kind="radius"
  :names="['--xh-shape-inset', '--xh-shape-control', '--xh-shape-surface', '--xh-shape-overlay', '--xh-shape-circle', '--xh-shape-pill']"
  :notes="{
    '--xh-shape-inset': '2px · 嵌在控件里的内层：勾选方框、页内列表的候选行（Listbox、Tree）、字段内的清空钮、表格行选择框、色块',
    '--xh-shape-control': '2px · 控件本体：Button、Input、Select trigger、Toggle、kbd、tooltip、Tabs / Steps trigger、单选组 segmented 形态的轨道；方签 Tag、状态方签（ToolCall 状态、Approval / QuestionFlow 结果）与 Alert 提示条',
    '--xh-shape-surface': '4px · 成面的静态容器：Card、Panel、列表容器、Tabs segment 的轨道、选择卡片、分页的描边方块',
    '--xh-shape-overlay': '4px · 脱离文档流的浮层：Popover、Menu、Dialog、Notification 卡片预设；Drawer 贴边不取圆角，Notification 轻提示预设取 control',
    '--xh-shape-circle': '50% · 宽高相等的圆：头像、单选圈、开关与滑杆的拇指、步骤圆点、加载环、悬浮单图标动作',
    '--xh-shape-pill': '9999px · 只两类身份：状态 chip（Badge；Tag 与结果标记是方签，取 control）与一维对象（轨道、进度条、指示条、手柄、滚动条滑块）',
  }"
/>

强制规则：

- 普通 control 2px、surface 4px、overlay 4px；组件不写 6px、10px 这类独立圆角。
- pill 只给明确的胶囊身份；普通按钮、字段、卡片与浮层不用 pill。Tag 与结果标记是方签，取 control。
- 正方盒（inline-size 与 block-size 同槽）必须取 circle，不得用 pill 冒充圆。
- 内层圆角不超过外层圆角减去内边距（surface 4px 的轨道留 2px 内距，里面的滑块取 2px）；相连控件（InputGroup、ButtonGroup）消除相接侧圆角。
- 锚定浮层里的列表行（Menu 族、Select、Combobox、TreeSelect、Mention、Cascader 列）与 Command、Transfer 的列表行是通栏行，不取圆角，悬停与选中的面铺满整行；Listbox、Tree 的行仍按 inset 内缩。
- 贴边铺满的通栏（Alert `banner`）与贴边面板（Drawer）不取圆角：它们的边就是页面或容器的边。
- 亮色、暗色与紧凑密度不改变形状身份。
- PromptInput 是登记过的例外：对话输入条允许 `--xh-shape-surface`。

## 描边宽度

<XhTokenTable
  :names="['--xh-stroke-thin', '--xh-stroke-thick', '--xh-stroke-strong']"
  :notes="{
    '--xh-stroke-thin': '一切描边与分隔线',
    '--xh-stroke-thick': '焦点环、选中指示条、滑杆拇指描边',
    '--xh-stroke-strong': '只给刻意登记的粗把手（图片裁切框、可调尺寸的拖柄）',
  }"
/>

焦点环一律 `--xh-ring-width`（= thick，2px）+ `--xh-ring-offset`（画在盒内一圈，不改布局盒），环色 `--xh-ring-focus` 不随语气；实心面上的环取 `currentColor`。字段外壳聚焦不画环，焦点由描边换色与底色差标出（见下文「字段外壳」）。

## 边界三选一

任何根面 / 主面只能取下表之一，阴影与淡底都不作为边界：

| 形态 | variant | 描边 | 底 | 影 |
| --- | --- | --- | --- | --- |
| 描边 | `outline`（缺省） | `--xh-stroke-thin solid --xh-border-default`；字段与控件盒用 `--xh-border-control`（缺省档与 default 同色） | `--xh-bg-surface`；字段外壳与 SignaturePad 画布铺 `--xh-bg-field`，FileUpload 拖放区铺 `--xh-bg-subtle`，勾选方框与单选圈 `transparent`，露出宿主的面 | none（Card 加 `--xh-elevation-raised`，缺省 none） |
| 淡底 | `subtle` | `--xh-stroke-thin solid transparent`（占位边，尺寸不跳） | `--xh-bg-subtle`（有语气时 `--xh-tone-subtle`） | none |
| 无壳 | `ghost` | 不写 | 不写 | 不写；只允许分隔线 |

- 有框 / 无框只走 `variant` 这一条轴：`outline | subtle | ghost`，可按下的表面多一档 `solid`。不存在 `bordered`、`borderless`、`plain | surface` 这类私有轴。
- `--xh-border-subtle` / `--xh-border-strong` 不得出现在根面 `border` 简写里，只能作 `border-block-start` 类分隔线与 `::after` 分隔伪元素。
- raised 面（Card、Tabs segment 的滑块）必带 `--xh-border-default` 描边，影只是加成：`--xh-elevation-raised` 缺省 none，主题要抬起感时再给它一层影；只有可交互时允许 hover 抬升。

## 字段外壳：淡底、聚焦换白底

字段外壳（输入框壳、InputGroup 组壳、ColorPicker 控件、SignaturePad 画布）静息是描边形态，但铺一层淡底：

- 静息 `--xh-bg-field`（淡底兑一半）+ `--xh-border-control` + `--xh-shape-control` + 无影。描边缺省档与浮层面板、卡片的 `--xh-border-default` 同色，页面里只有一种边线重量；`prefers-contrast: more` 才换到 3:1 的档。
- hover 底不变，描边升 `--xh-border-strong`。
- focus-within 换成承载面 `--xh-bg-surface` + `--xh-border-control-focus`，不画聚焦环：焦点由描边换色与底色差标出，强制色档补一圈 Highlight 环。
- invalid 换 `--xh-border-invalid` 并铺 4% 失效色淡底，聚焦时让位给聚焦态。
- readOnly 只填 `--xh-bg-subtle` 不动描边；disabled = `--xh-border-default` + `--xh-bg-subtle` + `--xh-fg-disabled`，不靠 opacity。
- 字段的 `subtle` / `ghost` 只限有壳容器内（InputGroup、Command 面板、Toolbar）使用，hover / focus 必须浮出 `--xh-border-control`。
- 登记过的例外：面板内嵌搜索（Command、Cascader、TreeSelect、Transfer、SideNav）不画字段外壳，只画一道 `border-block-end` 下划线，聚焦不画环、下划线也不换色；SignaturePad 不投影字段配方而自绘外壳，值必须与字段规则一致。

需要白底的宿主写对应组件的底色槽，如 `--xh-text-field-control-bg: var(--xh-bg-surface)`。

## 其余控件盒

字段外壳之外带边框的控件盒：

- FileUpload 拖放区是一块可放置的面：静息铺 `--xh-bg-subtle` 淡底、画 1px `--xh-border-control` 虚线；悬停描边升 `--xh-border-strong`、淡底升一档，拖入换品牌描边，底仍是中性淡底一档。
- Checkbox / CheckboxGroup / Transfer / Table 的方框与 RadioGroup / QuestionFlow 的圆圈是 16px 的小盒，透明底、描边重一档取 `--xh-border-strong`，一眼认得出；悬停升 `--xh-border-control-hover`。
- `--xh-bg-canvas` 保留给自动填充遮罩、色块选中环等必须不透明的地方，不作控件盒的底。

## 选中与当前态的标记

按语义分类，每类只允许一种标记（门禁 `check-selection-marker` 逐成员核）：

| 语义 | 对象 | 唯一标记 |
| --- | --- | --- |
| 对号集合的选中 | Select、Combobox、TreeSelect、Cascader、时间列、Mention、Tree、Listbox、TagGroup | 透明底 + 行尾对号（`--xh-fg-brand`），正文颜色保持 rest，字重升到 medium；树的分支行也放对号，半选画横杠；TagGroup 保持标签自身的面，只多一枚文字后的对号 |
| 页内持久集合的选中 | Table row、Transfer、GridList、SideNav 当前项、选择卡片 | `--xh-bg-brand-subtle` 行面 + `--xh-fg-on-brand-subtle`；Table row / Transfer / GridList 另有行首勾选框。SideNav 当前项是行面与字色，字重提到 semibold、行取 surface 圆角，不画指示条 |
| 导航当前页 | Tabs line、Anchor、NavigationMenu、Breadcrumb | 透明面 + 2px 指示条 + `--xh-fg-brand` + medium；Breadcrumb 当前页不可点、无指示条 |
| 格状当前 | Steps indicator、Calendar 选中格 | 实心 `--xh-bg-brand` + `--xh-fg-on-brand`，不加粗 |
| 分页当前页 | Pagination item | 品牌描边 + `--xh-bg-brand-subtle` + `--xh-fg-on-brand-subtle`，不加粗（字重一变页码就变宽） |
| 开关型（有滑块） | Tabs segment | 轨道 `--xh-bg-subtle` 内的白色抬起 indicator |
| 分段选中 | 单选组 segmented 形态 | 字段同款轨道（`--xh-bg-field` + `--xh-border-control`）内的品牌淡底滑块 `--xh-bg-segment-selected`，字 `--xh-fg-segment-selected` + medium |
| 开关型（无滑块） | Toggle、ToggleGroup item、Toolbar `aria-pressed` | `--xh-bg-brand-subtle` + `--xh-fg-on-brand-subtle` |
| 展开路径 / 打开中（不是选中） | Menu / Menubar / NavigationMenu trigger、Cascader in-path、Date / Time trigger | 与所在家族 hover 同档的中性面，不用品牌色 |

选中对号一律落在行尾，不放行首：行首一格归前导图标、展开箭头、拖拽把手与勾选框。

`--xh-bg-brand-subtle` 专属"选中 / 当前"：Calendar 的今天改成 inset 1px `--xh-fg-brand` 环 + 品牌字。Steps 已完成是唯一的例外，取品牌淡底 + 品牌对号（走过的步与当前步同属一段已点亮的进度）；点状形态的圆点不盛内容，三态由形状区分：没走到的空心圈、走过的实心标记色、当前步实心品牌并放大一档。

## 相关

- [色彩](/design/colors) · [阴影与材质](/design/shadow)
- 指南：[设计令牌与主题 · 形状阶梯](/guide/theme#形状阶梯)
