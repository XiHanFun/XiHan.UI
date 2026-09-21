# 阴影与材质

阴影在这里只表达"离页面多远"，不表达边界——边界归描边。所以阴影只有四个海拔角色，每个角色对应一类离开页面的方式；材质配方把底、边、影、高光与前景打包成四档，组件只挑档，不自己配光。

## 海拔角色

<XhTokenTable
  kind="shadow"
  :names="['--xh-elevation-raised', '--xh-elevation-lifted', '--xh-elevation-floating', '--xh-elevation-sheet']"
  :notes="{
    '--xh-elevation-raised': '贴在页面上、略抬起的面：Card、Segmented 与 Tabs 的滑块、静止的滑杆拇指、开关拇指。必带 border-default 描边，影只是加成',
    '--xh-elevation-lifted': '被指针拎起来、正跟着手移动的东西：拖动中的滑杆拇指、排序项、取色器拇指。比 raised 高、没到 floating',
    '--xh-elevation-floating': 'portal 出去的锚定浮层里含网格或多列的面板：日期 / 时间选择器面板、NavigationMenu 面板、侧栏弹出层',
    '--xh-elevation-sheet': '模态与强反馈面：Dialog、Drawer、Command、Toast、Notification',
  }"
/>

原语只有 `--xh-shadow-sm / md / lg / xl` 四档；lifted 落在 raised 与 floating 之间，原语里没有它的位置，所以直接写成三层配方。海拔逐部件登记（门禁 `check-elevation-role`），登记表之外的部件不许消费阴影。

## 四档材质

每档提供同名九项令牌：`bg`、`backdrop`、`border`、`highlight`、`shadow`、`separator`、`fg`、`fg-muted`、`focus-surface`。

| 档 | 令牌 | 给谁 | 光学 |
| --- | --- | --- | --- |
| M0 solid | `--xh-material-solid-*` | 静态内容面缺省：border-default 描边 + surface 底 + 无影；字段静息同为描边式 | 实体底色，无高光、无投影 |
| M1 soft | `--xh-material-soft-*` | Button soft、Tag、Popconfirm 动作等次级操作；不用于 Card 与字段 | 实体底色，细微顶光与两段接触投影，无背景模糊 |
| M2 frosted | `--xh-material-frosted-*` | 短列表、菜单、tooltip、气泡等需要透景的锚定瞬态浮层 | 0.88 不透明度，16px 模糊，108% 饱和度，1px 可见边界 |
| M4 elevated | `--xh-material-elevated-*` | Dialog、Drawer、Command、Tour、Toast、Notification 等模态与强反馈面，必有 1px 描边 | 完全不透明，无背景模糊，三层高层投影 |

另有两个由海拔组成的叠加档：raised = solid 描边 + solid 底 + `--xh-elevation-raised`（Card 与可抬起 / 可拖起部件）；floating = solid 底 + `--xh-border-default` + `--xh-elevation-floating`（含网格或多列的锚定面板）。它们没有 `--xh-material-*` 令牌。

## 磨砂面的范围

- 只用于需要保留背景空间感的瞬态浮层；正文、表单主体、Card、Table、Toast 与 Dialog 主阅读面不用。
- 含网格或多列的锚定面板（日期面板、多列级联）改用 floating：实体底、不透景，网格线不会与背景打架。
- 不把 `backdrop-filter` 放在页面根、大滚动区或重叠的多层表面，不对模糊半径做动画。
- 焦点环必须搭配 `focus-surface` 对应的实体隔离面。
- 没有 glass 材质，也没有任何兼容别名；透明浮层只允许 frosted 这一种柔和模糊。

Tooltip 等小型反白面用三支 compact 配方（`--xh-material-frosted-compact-alpha / -backdrop / -shadow`：0.94 不透明度、8px 模糊、明暗独立的小投影）组合 M2 的边界、前景与高光。

## 深色档的投影

深色主题的投影色留在纯黑：中性色阶最暗的一档比页面底还亮，拿它当投影压不出深度。四档都在末尾带一条 1px 的浅色描边把面的上沿提出来——raised 与 lifted 那条写成 inset 且只画上边缘，不绕四周，否则会与输入框壳、滑杆拇指自带的描边并成相距 1px 的两道线。

## 环境轴上的降级

同一令牌名原位降级：高对比档提高不透明度并加强边界；减少透明度（`data-transparency="reduce"`）与打印改为实体底并关闭背景滤镜；强制色改由 `Canvas` / `CanvasText` 表达。四档在浅色、深色两套主题下都按黑、白、中灰、页面与品牌背景验证正文至少 4.5:1、焦点环对隔离底至少 3:1。

## 相关

- [形状与边界](/design/shape) · [暗黑模式](/design/dark)
- 指南：[设计令牌与主题 · 材质配方](/guide/theme#材质配方)
