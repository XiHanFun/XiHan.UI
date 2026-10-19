---
"@xihan-ui/designer-shell": minor
---

**新增** 历史记录零件 `<xh-designer-history>` 与四款共用的历史命令 `designerHistoryCommands()`。

- `<xh-designer-history>`：按先后列出起点与撤销栈里的每一步，当前位置那一行选中；已撤销的步骤字色减淡、写「已撤销」，保存点写「已保存」，没写说明的一步写「编辑」。属性 `snapshot`（designer-kit 的 `snapshotHistory(history)`）、`readonly`、`headless`、`announce`；选一行派发 `history-go { position }`，头部清空钮派发 `history-clear`。列表是单选的 `xh-listbox`：方向键只移焦点，Enter、Space 或点一行才跳；从这里跳转完成后经 `announce` 读一句。
- `designerHistoryCommands()`：撤销（Mod+Z）、重做（Mod+Shift+Z，另认 Ctrl+Y）与清空历史（`clear-history`）。撤销、重做的全名带上下一步的说明（「撤销：添加卡片」），短文字不变；在只读、事务中或没有历史时不可用；清空先经 `confirm` 弹确认框，确定后才清空；三条做完都经 `announce` 读一句。
- 文案：新增 `xh-designer-history` 一桶，`xh-designer-commands` 一桶加 `undoWith`、`redoWith`、`clearHistory`，十种语言都有；新增导出 `DESIGNER_HISTORY_EN_US`。

**新增** 面板工厂 `createHistoryPanel(adapter, options?)`：各款写一个适配器（`snapshot`、`goTo`，可选的 `announce`），得到一块放进内置扩展 `panels` 的历史记录面板。缺省区名 `history`、停在右栏、缺省隐藏（打开后在属性下面），面板头是清空历史；`region` 可换图标、位置与 `defaultHidden`，标题与帮助取零件文案、随语言变；`readonly(context)` 管只读。`xh-designer-history` 一桶加面板头的帮助 `help`，十种语言都有。
