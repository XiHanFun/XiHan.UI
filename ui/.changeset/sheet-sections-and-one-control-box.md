---
"@xihan-ui/headless": major
"@xihan-ui/vue": major
"@xihan-ui/web-components": major
"@xihan-ui/styles": major
---

**浮层面板的三段分区补齐，文本输入的两套控件盒收成一套。** 不留别名、不留 `var(新名, 旧名)` 双写：下面标为已删的槽名在皮肤里不再存在，设它没有任何效果。

## 一、`dialog` / `drawer` 补三段：`header` / `body` / `footer`

`floating-panel` 早有 `header` 与 `body`，`dialog` 与 `drawer` 一个都没有——面板里做不出「头尾定在原处、正文自己滚」，官方示例只好在 `content` 里手写一个内联的滚动盒。三家现在是同一套角色划分：

| 部件 | 角色 | 排布契约 |
| --- | --- | --- |
| `header` | 面板头 | `flex: none`，不参与压缩；`dialog` / `drawer` 里纵向堆叠标题与说明，`floating-panel` 里是横排标题栏 |
| `body` | 正文 | `flex: 1 1 auto` + `min-block-size: 0` + `overflow: auto`，面板里唯一会滚的一段 |
| `footer` | 面板尾 | `flex: none`，动作按钮排一行靠尾 |

`dialog` 与 `drawer` 各新增：

- 无头层 `getHeaderProps` / `getBodyProps` / `getFooterProps`；
- Vue `<XhDialogHeader>` / `<XhDialogBody>` / `<XhDialogFooter>`、`<XhDrawerHeader>` / `<XhDrawerBody>` / `<XhDrawerFooter>`；
- 自定义元素的 `header` / `body` / `footer` 三个角色节点（`data-xh-part`），已接进 `@csspart`；
- 覆盖槽 `--xh-{dialog,drawer}-header-gap` / `-header-pb` / `-footer-gap` / `-footer-pt`。

面板的内衬与安全区让位仍由 `content` 一层给出，三段只接手段与段之间那道缝：内衬换成三段各留一份，安全区与局部容器两档就要在三处各算一遍。

写了 `body` 的那一档，`dialog` 的 `content` 同时封顶（`max-block-size: 100%`）并收起自身溢出——不封顶正文永远没有可滚的余量，滚动条出不来。不写 `body` 的写法与从前逐值相同。

**新增，不是改名**：既有的 `content` + `title` + `description` 写法一个字不用改。

## 二、`text-field` 只剩一个控件盒（BREAKING）

`text-field.css` 此前有两套完整的盒规则：一套画在 `control` 上，一套画在 `input` 上，两组公开槽并存且互不感知——同一个组件里长了两个盒，同族其余控件的盒都只有一个。现在 `control` 是唯一的视觉盒：描边、圆角、底色、落影与聚焦环全画在它身上，`input` 退成框里的一段透明分段。

**`input` 必须写在 `control` 里面**，否则输入框没有任何框的观感（不再有「不写 control 就由 input 自己画盒」这一档）。

已删的覆盖槽（14 支），换成 `control` 上的同名槽：

| 已删 | 换成 |
| --- | --- |
| `--xh-text-field-input-h` | `--xh-text-field-control-h` |
| `--xh-text-field-input-min-w` | `--xh-text-field-control-min-w` |
| `--xh-text-field-input-px` | `--xh-text-field-control-px` |
| `--xh-text-field-input-radius` | `--xh-text-field-control-radius` |
| `--xh-text-field-input-bg` | `--xh-text-field-control-bg` |
| `--xh-text-field-input-bg-hover` | `--xh-text-field-control-bg-hover` |
| `--xh-text-field-input-bg-readonly` | `--xh-text-field-control-bg-readonly` |
| `--xh-text-field-input-bg-disabled` | `--xh-text-field-control-bg-disabled` |
| `--xh-text-field-input-border` | `--xh-text-field-control-border` |
| `--xh-text-field-input-border-hover` | `--xh-text-field-control-border-hover` |
| `--xh-text-field-input-border-focus` | `--xh-text-field-control-border-focus` |
| `--xh-text-field-input-border-at-max` | `--xh-text-field-control-border-at-max` |
| `--xh-text-field-input-border-invalid` | `--xh-text-field-control-border-invalid` |
| `--xh-text-field-input-shadow` | `--xh-text-field-control-shadow` |

仍留在 `input` 上的是文字与自动填充那几支：`--xh-text-field-input-fg` / `-font-size` / `-autofill-bg` / `-autofill-fg`，以及多行宿主的 `--xh-text-field-textarea-py`。

多行宿主（`as="textarea"`）在框里：`control` 的定高换成由行数撑起（`block-size: auto` + `min-block-size` 走控件行高），纵向内衬仍由 `input` 自己留。

文档站 18 份示例（`text-field` 16 份、`listbox` 与 `pagination` 各 1 份）已改成把 `input` 写进 `control`；`text-field/11-affix` 的前后缀不再靠绝对定位压在输入框上，改为与输入框同在框里排成一行。

## 三、`select` / `listbox` 两页登记官方组合写法

`popselect` 退役后，「浮层壳 + 条目层」的替代写法成为两页文档里的官方组合示例：浮层只管开合与定位，条目、键盘导航、连打检索与选中语义全在 `listbox` 里。`select` 页新增示例「官方组合：浮层 + 列表框」，`listbox` 页的「弹出式选择」是同一例。
