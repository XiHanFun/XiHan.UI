---
"@xihan-ui/styles": major
---

**九组覆盖槽改名。** 不留别名、不留 `var(新名, 旧名)` 双写：旧槽名在皮肤里不再被读，写旧名的覆盖不再生效。

## 部件段对齐

槽名 `--xh-<组件>[-<部件>]-<后缀>`：部件是 `root` 时省略部件段，不是 `root` 时必须带。

| 组件 | 旧槽 | 新槽 |
| --- | --- | --- |
| `menubar`（`root`） | `--xh-menubar-root-{gap,py,px,radius,bg,fg}` | `--xh-menubar-{gap,py,px,radius,bg,fg}` |
| `menubar`（`content`） | `--xh-menubar-{py,px,radius,bg,fg,shadow}` | `--xh-menubar-content-{py,px,radius,bg,fg,shadow}` |
| `menu`（`content`） | `--xh-menu-{py,px,radius,bg,fg,shadow}` | `--xh-menu-content-{py,px,radius,bg,fg,shadow}` |
| `context-menu`（`content`） | `--xh-context-menu-{py,px,radius,bg,fg,shadow}` | `--xh-context-menu-content-{py,px,radius,bg,fg,shadow}` |
| `image-cropper`（`viewport`） | `--xh-image-cropper-radius` | `--xh-image-cropper-viewport-radius` |

`menubar` 两条方向相反，`--xh-menubar-{py,px,radius,bg,fg}` 这五个名字两条都用到：改前它们管浮层面板，改后管横条本身。设过这五个名字的，要按管的是哪一层重新落位。

`menu` / `context-menu` 与 `menubar` 的 `content` 是同族同结构的三份面板，槽名必须逐条同形。三家的 `arrow` 底色仍取 `content` 的槽（`--xh-<组件>-content-bg`），箭头与面板同底。三家的 `--xh-<组件>-{border,min-w,max-w,max-h}` 不改。

## 槽名跟上部件名

| 组件 | 旧槽 | 新槽 |
| --- | --- | --- |
| `cascader` | `--xh-cascader-row-*`（13 支） | `--xh-cascader-item-*` |
| `tree-select` | `--xh-tree-select-row-*`（10 支） | `--xh-tree-select-item-*` |
| `fieldset` | `--xh-fieldset-helper-{fg,fg-disabled,font-size}` | `--xh-fieldset-description-*` |

`cascader` 的 `item` 与 `search-item`、`tree-select` 的 `item` 与树内条目仍共用同一族行度量，改名后共用关系不变。

## 取值与状态对齐

| 组件 | 旧槽 | 新槽 |
| --- | --- | --- |
| `toggle` | `--xh-toggle-{bg,fg}-pressed` | `--xh-toggle-{bg,fg}-on` |

按下档的 `data-state` 取值是 `on` / `off`，槽名跟着取值走。
