来源：https://ui.docs.xihanfun.com/design/shape

# 形状与边界

圆角与边线是最容易长出第二套规则的地方——一个组件 6px、另一个 5px，看着都"差不多"。这里的规则是：圆角只有一条语义阶梯，边界只由描边承担，两者都由门禁逐条扫。

## 圆角阶梯

<XhTokenTable
  kind="radius"
  :names="['--xh-shape-inset', '--xh-shape-control', '--xh-shape-surface', '--xh-shape-overlay', '--xh-shape-circle', '--xh-shape-pill']"
  :notes="{
    '--xh-shape-inset': '4px · 嵌在控件里的内层：菜单项、勾选方框、字段内的清空钮、表格行选择框、色块',
    '--xh-shape-control': '4px · 控件本体：Button、Input、Select trigger、Toggle、分页按钮、kbd、tooltip、Tabs / Steps trigger',
    '--xh-shape-surface': '8px · 成面的静态容器：Card、Alert、Panel、列表容器、Segmented 与 Tabs 的轨道',
    '--xh-shape-overlay': '12px · 脱离文档流的浮层：Popover、Menu、Dialog、Drawer、Toast',
    '--xh-shape-circle': '50% · 宽高相等的圆：头像、单选圈、开关与滑杆的拇指、步骤圆点、加载环、悬浮单图标动作',
    '--xh-shape-pill': '9999px · 只两类身份：状态 chip（Badge、Tag、结果标记）与一维对象（轨道、进度条、指示条、手柄、滚动条滑块）',
  }"
/>

强制规则：

- 普通 control 4px、surface 8px、overlay 12px；不存在 6px 或 10px。
- pill 只给明确的胶囊身份；普通按钮、字段、卡片与浮层不用 pill。
- 正方盒（inline-size 与 block-size 同槽）必须取 circle，不得用 pill 冒充圆。
- 内层圆角不超过外层圆角减去内边距；相连控件（InputGroup、ButtonGroup）消除相接侧圆角。
- 亮色、暗色与紧凑密度不改变形状身份。
- PromptInput 是登记过的例外：对话输入条允许 `--xh-shape-surface` 8px。

## 描边宽度

<XhTokenTable
  :names="['--xh-stroke-thin', '--xh-stroke-thick', '--xh-stroke-strong']"
  :notes="{
    '--xh-stroke-thin': '一切描边与分隔线',
    '--xh-stroke-thick': '焦点环、选中指示条、滑杆拇指描边',
    '--xh-stroke-strong': '只给刻意登记的粗把手（图片裁切框、可调尺寸的拖柄）',
  }"
/>

焦点环一律 `--xh-ring-width`（= thick，2px）+ `--xh-ring-offset`（画在盒内一圈，不改布局盒），环色 `--xh-ring-focus` 不随语气；实心面上的环取 `currentColor`。

## 边界三选一

任何根面 / 主面只能取下表之一，阴影与淡底都不作为边界：

| 形态 | variant | 描边 | 底 | 影 |
| --- | --- | --- | --- | --- |
| 描边 | `outline`（缺省） | `--xh-stroke-thin solid --xh-border-default`；字段与控件盒用 `--xh-border-control`（缺省档与 default 同色） | `--xh-bg-surface`；字段与控件盒 `transparent`，露出宿主的面 | none（Card 加 `--xh-elevation-raised`） |
| 淡底 | `subtle` | `--xh-stroke-thin solid transparent`（占位边，尺寸不跳） | `--xh-bg-subtle`（有语气时 `--xh-tone-subtle`） | none |
| 无壳 | `ghost` | 不写 | 不写 | 不写；只允许分隔线 |

- 有框 / 无框只走 `variant` 这一条轴：`outline | subtle | ghost`，可按下的表面多一档 `solid`。不存在 `bordered`、`borderless`、`plain | surface` 这类私有轴。
- `--xh-border-subtle` / `--xh-border-strong` 不得出现在根面 `border` 简写里，只能作 `border-block-start` 类分隔线与 `::after` 分隔伪元素。
- raised 面（Card、Segmented 滑块、静止的滑杆拇指）必带 `--xh-border-default` 描边，影只是加成；只有可交互时允许 hover 抬升。

## 控件盒：浅边、不填底

所有带边框的控件盒同一条规则：输入框壳、Checkbox / CheckboxGroup / Transfer / Tree / Table 的方框、RadioGroup / QuestionFlow 的圆圈、Switch 轨道描边、InputGroup 组壳、ColorPicker 控件、FileUpload 拖放区、SignaturePad 画布——

- 静息不填底，露出宿主的面：白页上它就是白的，灰卡片上它就是灰的，不再自带一块白。
- 描边取 `--xh-border-control`，缺省档与浮层面板、卡片的 `--xh-border-default` 同色，页面里只有一种边线重量；`prefers-contrast: more` 才换到 3:1 的档。
- hover 升 `--xh-border-control-hover` 并在透明上罩 45% 淡底；focus-within 换 `--xh-border-control-focus` + 焦点环；invalid 换 `--xh-border-invalid` + `--xh-ring-invalid`。
- readOnly 只填 `--xh-bg-subtle` 不动描边；disabled = `--xh-border-default` + `--xh-bg-subtle` + `--xh-fg-disabled`，不靠 opacity。
- 字段的 `subtle` / `ghost` 只限有壳容器内（InputGroup、Command 面板、Toolbar）使用，hover / focus 必须浮出 `--xh-border-control`。
- 登记过的例外：浮层面板内嵌搜索（Command、Cascader）允许 `border-block-end` 下划线式；SignaturePad 不投影字段配方而自绘外壳，值必须与字段规则一致。

需要白底的宿主写对应组件的底色槽，如 `--xh-text-field-control-bg: var(--xh-bg-canvas)`。

## 选中与当前态的标记

按语义分类，每类只允许一种标记（门禁 `check-selection-marker` 逐成员核）：

| 语义 | 对象 | 唯一标记 |
| --- | --- | --- |
| 对号集合的选中 | Select、Combobox、TreeSelect、Cascader、时间列、Mention、Tree、Listbox、TagGroup | 透明底 + 行尾对号（`--xh-fg-brand`），正文颜色与字重保持 rest；树的分支行也放对号，半选画横杠；TagGroup 保持标签自身的面，只多一枚文字后的对号 |
| 页内持久集合的选中 | Table row、Transfer、SideNav 当前项 | `--xh-bg-brand-subtle` 行面 + `--xh-fg-on-brand-subtle`；Table row / Transfer 另有行首勾选框。SideNav 当前项只有行面与字色，不画指示条 |
| 导航当前页 | Tabs line、Anchor、NavigationMenu、Breadcrumb | 透明面 + 2px 指示条 + `--xh-fg-brand-strong` + medium；Breadcrumb 当前页不可点、无指示条 |
| 格状当前 | Pagination item、Steps indicator、Calendar 选中格 | 实心 `--xh-bg-brand` + `--xh-fg-on-brand`，不加粗 |
| 开关型（有滑块） | Segmented、Tabs segment | 轨道 `--xh-bg-subtle` 内的白色抬起 indicator |
| 开关型（无滑块） | Toggle、ToggleGroup item、Toolbar `aria-pressed` | `--xh-bg-brand-subtle` + `--xh-fg-on-brand-subtle` |
| 展开路径 / 打开中（不是选中） | Menu / Menubar / NavigationMenu trigger、Cascader in-path、Date / Time trigger | 与所在家族 hover 同档的中性面，不用品牌色 |

选中对号一律落在行尾，不放行首：行首一格归前导图标、展开箭头、拖拽把手与勾选框。

`--xh-bg-brand-subtle` 专属"选中 / 当前"：Calendar 的今天改成 inset 1px `--xh-fg-brand` 环 + 品牌字，Steps 已完成改成中性面 + 品牌对号。

## 相关

- [色彩](/design/colors) · [阴影与材质](/design/shadow)
- 指南：[设计令牌与主题 · 形状阶梯](/guide/theme#形状阶梯)
