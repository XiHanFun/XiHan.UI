---
'@xihan-ui/styles': major
---

Menubar 顶层控制条继续承担导航职责并保持原表面，弹出的菜单面迁入 Menu / ContextMenu 同源的 M2
Frosted Surface：边界、背景、前景、投影、backdrop、顶光与箭头逐值一致，新增 `--xh-menubar-backdrop`
和 `--xh-menubar-highlight` 覆写槽；箭头只延续面板底色与边界，不重复采样模糊。

弹出菜单条目保留 flex 主行和作者的真实节点顺序：任意图标、`item-text`、快捷键节点与子菜单箭头
可以同排，`item-text` 占剩余空间并截断，只有 `item-description` 独占第二行。没有统一预留列。
悬停/键盘锚点与 open path 均使用中性淡底，pressed 加深一档；展开二级菜单没有始端色条、品牌蓝底
或字重变化。分隔线使用磨砂实体令牌和 pill 圆角，禁用条目使用不可用指针。

新增的稳定覆盖槽包括 `--xh-menubar-backdrop`、`--xh-menubar-highlight`、
`--xh-menubar-item-bg-pressed`、`--xh-menubar-submenu-indicator-fg` 与 `--xh-menubar-separator-radius`。

删除 `--xh-menubar-item-active-font-weight`：打开路径不再改变字重，这支槽已没有可控制的声明。
需要定制打开路径时改写 `--xh-menubar-item-bg-active`；不保留同时加粗的兼容分支，因此 Styles 按 major 记录。

菜单面的 zoom 动效替换为 `xh-overlay-slide-in` / `xh-overlay-slide-out` 四方向短移淡变，方向取实际
placement；positioner 每层先清零四个方向变量，避免嵌套结构继承成斜移。顶层菜单之间的瞬时交接语义保留。
当前 anatomy 没有 shortcut / trailing 等部件，本次没有用临时节点或伪元素伪造公开 API。

皮肤体积（去注释、压空白）从 11226 增至 13127 字节；增量来自每份皮肤自带的四向关键帧、
M2 材质面与状态反馈。
