---
"@xihan-ui/designer-kit": minor
"@xihan-ui/designer-shell": minor
---

**新增** 弹层命令与菜单命令、竖排的命令工具栏，以及内置的「面板」命令。

- `DesignerCommand` 加 `panel`、`menu` 与 `select`：给了 `panel` 是弹层命令，在工具栏上点开一块锚在按钮上的面板；给了 `menu` 是菜单命令，点开一张锚在按钮上的菜单，条目按上下文现算，可以是条目、另一条命令的 id 或 `'separator'`，可勾选的条目按 `group` 分单选与复选，选中调 `select`。两者只能给一个。这两类命令的 `run` 可以不给；普通命令仍必须有 `run`。`mergeExtensions` 合并时查这两条，不合抛 `TypeError`（`assertCommandShape`）。`commandForShortcut` 只返回有 `run` 的命令。
- `createCommandToolbar` 接上这两类命令：点按钮打开锚在它上面的 `<xh-popover>` 或 `<xh-menu>`，收在「更多」里时锚在「更多」钮上；开着的时候命令被收进「更多」或放回工具栏，弹层与菜单跟着换锚点。新增 `open(id)`、`close()`、`opened()`，快捷键要打开它们时在命令的 `run` 里调 `open(id)`。
- `createCommandToolbar` 加 `orientation: 'vertical'`：按钮上下排，提示、弹层与菜单在按钮的行首一侧弹出，放不下的按高度收进「更多」。外框画布右侧中间的竖条（`canvas-end`）不再超出画布区。
- `designerShellCommands` 加 `frame` 选项，给了就有 `panels` 命令：一张菜单列出外框能开关的面板，勾选的显示。外框新增 `panelEntries()` 与 `togglePanel(name)`，后者与面板头的关闭钮一样派发 `layout-change`。
- `runCommand` 对没有 `run` 的命令返回 `false`；`renderCommandMenu` 遇到没有 `run` 的弹层或菜单命令时抛 `TypeError`，它们只能放在工具栏上。
