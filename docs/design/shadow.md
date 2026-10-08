# 阴影与材质

阴影在这里只表达"离页面多远"，不表达边界——边界归描边。所以阴影只有四个海拔角色，每个角色对应一类离开页面的方式；材质配方把底、边、影、高光与前景打包成四档，组件只挑档，不自己配光。

## 海拔角色

<XhTokenTable
  kind="shadow"
  :names="['--xh-elevation-raised', '--xh-elevation-lifted', '--xh-elevation-floating', '--xh-elevation-sheet']"
  :notes="{
    '--xh-elevation-raised': '贴在页面上、略抬起的面：Card、Tabs segment 的滑块、开关拇指。缺省 none（平面），边界全靠 border-default 描边；主题要抬起感时再给它一层影',
    '--xh-elevation-lifted': '被指针拎起来、正跟着手移动的东西：拖动中的滑杆拇指、排序项、取色器拇指。一层柔和投影',
    '--xh-elevation-floating': 'portal 出去的锚定浮层里含网格或多列的面板：日期 / 时间选择器面板、NavigationMenu 面板、侧栏弹出层。一层柔和投影',
    '--xh-elevation-sheet': '模态与强反馈面：Dialog、Drawer、Command、Notification。一层投影，比 floating 略重',
  }"
/>

浅色档的四个角色不引原语 `--xh-shadow-sm / md / lg / xl`，直接写成单层投影：raised 平面无影，lifted 与 floating 同为 `0 4px 10px`（10% 黑），sheet 为 `0 4px 12px`（15% 黑）。层级先靠描边与间距分，阴影只表达真实抬升。海拔逐部件登记（门禁 `check-elevation-role`），登记表之外的部件不许消费阴影。

## 四档材质

每档提供同名九项令牌：`bg`、`backdrop`、`border`、`highlight`、`shadow`、`separator`、`fg`、`fg-muted`、`focus-surface`。

| 档 | 令牌 | 给谁 | 光学 |
| --- | --- | --- | --- |
| M0 solid | `--xh-material-solid-*` | 静态内容面缺省：border-default 描边 + surface 底 + 无影；字段静息同为描边式，另铺 `--xh-bg-field` 淡底 | 实体底色，无高光、无投影 |
| M1 soft | `--xh-material-soft-*` | 柔和淡底的次级面；不用于 Card 与字段。Button 与 Tag 是平面面，不取它的顶光与投影 | 实体底色，细微顶光与两段接触投影，无背景模糊 |
| M2 frosted | `--xh-material-frosted-*` | 短列表、菜单、tooltip、气泡等锚定瞬态浮层 | 实体 surface 底，无背景模糊，1px border-default 描边，一层 `0 4px 10px` 柔和投影，无顶光 |
| M4 elevated | `--xh-material-elevated-*` | Dialog、Drawer、Command、Tour、Notification 等模态与强反馈面，必有 1px 描边 | 实体 surface 底，无背景模糊，一层 `0 4px 12px` 投影 |

另有两个由海拔组成的叠加档：raised = solid 描边 + solid 底 + `--xh-elevation-raised`（Card 与可抬起 / 可拖起部件）；floating = solid 底 + `--xh-border-default` + `--xh-elevation-floating`（含网格或多列的锚定面板）。它们没有 `--xh-material-*` 令牌。

## frosted 浮层面

- 名字沿用 frosted，取值是实体弹出层：`--xh-bg-surface` 不透明底、1px `--xh-border-default` 描边、一层柔和投影（浅色 10% 黑、深色 36% 黑），不采样背后内容，没有顶部边界光。
- 只用于锚定瞬态浮层（短列表、菜单、气泡、提示框）；正文、表单主体、Card、Table、Notification 与 Dialog 主阅读面不用。
- 必须有 1px 可见边界，不能只靠投影分层。
- 含网格或多列的锚定面板（日期面板、多列级联）用 floating：实体底 + border-default + `--xh-elevation-floating`。
- 背景滤镜与顶光两条通道保留给主题：要磨砂透景时，给 `--xh-material-frosted-bg` 半透明底、给 backdrop 一档 blur（不高于 16px，saturate 不高于 1.08）、给 highlight 不超过 1px 的内侧顶光；减少透明度、强制色与打印下这些通道一律退回实体面。开了透景的主题不把 `backdrop-filter` 放在页面根、大滚动区或重叠的多层表面，不对模糊半径做动画。
- 没有 glass 材质，也没有任何兼容别名。

Tooltip 保留反白身份，用三支 compact 配方（`--xh-material-frosted-compact-alpha / -backdrop / -shadow`，缺省不透明、无模糊、一层 `0 4px 10px` 投影）组合 M2 的前景；边不取 frosted 描边（装饰边压在反白深底上看不见），改取 on 色 20% 拼色承担 1px 可见边界。

## 深色档的投影

深色主题的投影色留在纯黑：中性色阶最暗的一档比页面底还亮，拿它当投影压不出深度。四个海拔角色在深色档是多层投影，末尾带一条 1px 的浅色描边把面的上沿提出来——raised 与 lifted 那条写成 inset 且只画上边缘，不绕四周，否则会与输入框壳、滑杆拇指自带的描边并成相距 1px 的两道线。frosted 与 elevated 两档材质在深色档仍是单层投影，只把黑色加深（36% / 40%）。

## 环境轴上的降级

同一令牌名原位降级：高对比档加强边界；减少透明度（`data-transparency="reduce"`）与打印强制实体底、关闭背景滤镜（主题开了透景也一样）；打印另把四档海拔置 none；强制色改由 `Canvas` / `CanvasText` 表达。四档在浅色、深色两套主题下都按黑、白、中灰、页面与品牌背景验证正文至少 4.5:1、焦点环对隔离底至少 3:1。

## 相关

- [形状与边界](/design/shape) · [暗黑模式](/design/dark)
- 指南：[设计令牌与主题 · 材质配方](/guide/theme#材质配方)
