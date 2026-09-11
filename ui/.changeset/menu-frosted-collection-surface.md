---
"@xihan-ui/styles": major
---

**Menu 迁入 M2 Frosted Surface，并统一条目、分组与子菜单的视觉节奏。**

菜单内容面改用 M2 的 tint、backdrop、边界、不透明前景、分隔色与 frosted floating shadow；顶部高光是独立的一像素装饰层，不替换真实边框。箭头读取同一 tint 与边界且不重复 backdrop blur。减少透明、高对比与 forced-colors 继续由同名材质令牌原位切换，打印仍隐藏交互浮层。

进场从 zoom 改为按实际 placement 从锚点一侧短移入并淡入，退场以更短时长淡出并退回锚点一侧；采用菜单族统一的 `xh-overlay-slide-in/out` 动作，每份可独立引入的皮肤携带相同定义，不再复用语义不同的旧 zoom 动画。positioner 会先清零四个方向变量再启用当前 placement，阻断 Web Components 原地子菜单继承父层方向。`will-change` 只登记 opacity 与 translate，不登记 backdrop-filter。

条目改为稳定网格：同层出现 `item-indicator` 时，所有直属条目统一形成标记、正文、末端三列，分组标题与正文列对齐；判断只查看当前 content 的直属 item/group，不让 Web Components 原地嵌套的子菜单影响父层列宽。长正文和说明各在自己的网格行截断，子菜单箭头固定末列并随 RTL 换向。

新增 `--xh-menu-item-leading-size`、`--xh-menu-group-label-leading-size`、`--xh-menu-group-label-leading-gap` 与 `--xh-menu-separator-radius` 覆写口；默认仍分别与 indicator 尺寸、条目间距和全胶囊圆角同源。

悬停/键盘锚点保持中性，按下增加 pressed surface；打开路径改用品牌轻 tint 与始端 indicator，不再用 semibold 引起宽度变化。禁用项使用非交互光标。separator 改用 M2 separator 并收成胶囊端点。

删除 `--xh-menu-item-active-font-weight`：打开路径不再改变字重，这支槽没有可控制的声明。需要定制打开路径时改写 `--xh-menu-item-bg-active` 与新的 `--xh-menu-item-path-indicator`，不会保留同时加粗的旧兼容分支。

本次没有新增菜单机器 API。CheckboxItem、RadioGroup/RadioItem、ItemShortcut、ItemTrailing 与单项 danger tone 仍缺失，后续需以行为、三端部件和样式一起交付；Menubar 与 ContextMenu 也仍待各自的独立 M2 迁移提交。

皮肤体积（去注释、压空白）从 7912 增至 13832 字节；增量为材质、稳定列布局与状态反馈，仅登记本组件，10% 容差保持不变。
