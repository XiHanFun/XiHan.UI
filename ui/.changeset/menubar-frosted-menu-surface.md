---
'@xihan-ui/styles': major
---

Menubar 顶层控制条继续承担导航职责并保持原表面，弹出的菜单面迁入 Menu / ContextMenu 同源的 M2
Frosted Surface：边界、背景、前景、投影、backdrop、顶光与箭头逐值一致，新增 `--xh-menubar-backdrop`
和 `--xh-menubar-highlight` 覆写槽；箭头只延续面板底色与边界，不重复采样模糊。

弹出菜单条目改为稳定网格：悬停/键盘锚点、按下、打开路径分成三档反馈，打开路径增加始端色线且不改变
字重；同层存在 indicator 时，直属条目与组标题统一留出 leading 轨，正文、说明和裸内容落入同一正文列，
子菜单箭头固定末轨。分隔线改用磨砂实体分隔令牌和 pill 圆角，禁用条目使用不可用指针。

新增的稳定覆盖槽包括 `--xh-menubar-backdrop`、`--xh-menubar-highlight`、
`--xh-menubar-item-bg-pressed`、`--xh-menubar-item-path-indicator`、`--xh-menubar-item-leading-size`、
`--xh-menubar-group-label-leading-size`、`--xh-menubar-group-label-leading-gap`、
`--xh-menubar-submenu-indicator-fg` 与 `--xh-menubar-separator-radius`。

删除 `--xh-menubar-item-active-font-weight`：打开路径不再改变字重，这支槽已没有可控制的声明。
需要定制打开路径时改写 `--xh-menubar-item-bg-active` 与新的 `--xh-menubar-item-path-indicator`；
不保留同时加粗的兼容分支，因此 Styles 按 major 记录。

菜单面的 zoom 动效替换为 `xh-overlay-slide-in` / `xh-overlay-slide-out` 四方向短移淡变，方向取实际
placement；positioner 每层先清零四个方向变量，避免嵌套结构继承成斜移。顶层菜单之间的瞬时交接语义保留。
当前 anatomy 没有 shortcut / trailing 等部件，本次没有用临时节点或伪元素伪造公开 API。

去注释与空白后的皮肤体积由 11226 增至 17478 字节；增加的是每份皮肤自带的四向关键帧、M2 材质面、
三态条目反馈和同层标记列几何。

皮肤体积（去注释、压空白）从 11226 增至 17478 字节；增量为材质、稳定列布局与状态反馈，仅登记本组件，10% 容差保持不变。
