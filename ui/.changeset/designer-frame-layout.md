---
'@xihan-ui/designer-shell': minor
---

**新增** 外框 `<xh-designer-frame>` 的面板布局：面板停靠为主、可以浮出，布局整份存进设置。

- 布局 `layout`（类型 `DesignerLayout`）：各面板停在左、右、下哪一栏与先后、隐藏的面板、收成标题条的面板、浮出的小窗位置与大小、三栏与栏内各面板的大小、在分隔条上收起的栏。外框改了就换成改完的整份并派发 `layout-change { layout, reason }`；拖分隔条只在松手时派发。设置里存它的键是 `layout.panels`（`DESIGNER_SETTING_KEYS.layout`）。
- 宿主的缺省 `defaultLayout`：用户没存过布局时用它，「恢复默认布局」也回到它。宿主管控 `layoutPolicy`：`designerLayoutPolicy(settingsPolicy)` 从设置的管控换算，`layout.panels` 锁整份，`layout.panels.<面板 id>` 藏掉或锁定一块面板。
- 面板登记：区新增 `icon`、`defaultHidden`、`movable`、`floatable`、`minimizable`；位置新增 `overlay`（画布浮动件，按 `anchor` 放进画布的角上，只能显示或隐藏）。
- 面板头新增收起钮（收成标题条，双击面板头也行）与「更多」菜单（移到左栏 / 右栏 / 下栏、上移、下移、浮出、停靠、收起、隐藏）；按住面板头拖到外框边上换栏、拖进一栏两块面板之间调序、拖到画布上浮出成小窗。小窗用 `<xh-floating-panel>`，限在外框里，标题栏有停靠、收拢与关闭。窄屏时浮出的面板按停靠收在抽屉里。
- 外框新增方法 `setPanelVisible`、`movePanel`、`setPanelMinimized`、`floatPanel`、`dockPanel`、`revealPanel`、`toggleAllPanels`、`restorePanels`、`resetLayout`、`announce`，只读属性 `resolvedLayout`；`panelEntries()` 每项多出图标、所在栏、收起、浮出与锁定。挪动、浮出、停靠、收起之后经礼貌级播报读一句。
- 布局的纯函数：`resolveDesignerLayout`、`defaultDesignerLayout`、`designerLayoutEquals`、`designerPanelAbilities`、`designerPanelDock` 与 `withDesignerPanelVisible` 等几种改法。
- 内置命令：`designerShellCommands` 给了 `frame` 时另有 `panels-toggle-all`（显示或隐藏所有面板，`Mod+\`）、`panels-restore`（还原面板显隐，`Mod+Shift+\`）与 `layout-reset`（恢复默认布局），「面板」菜单在各面板之后列出这三条；新增 `designerPanelCommands`，每块面板一条开关命令 `panel:<面板 id>`。
- 扩展的面板新增 `headerCommands`：面板宿主按命令表在面板头操作区铺一小条只显示图标的命令（`createPanelHost` 的选项加 `commands`）；内置面板用 `createPanelActions` 建同样的一条。
- 文案：外框与命令新增若干条，十种语言都有。
