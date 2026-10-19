---
"@xihan-ui/designer-kit": minor
"@xihan-ui/designer-shell": minor
---

**新增** 历史栈能列出全部步骤、一次跳到其中一步；步骤说明可以随语言变；命令可以登记第二快捷键。

- designer-kit 历史：
  - `entries` 按先后列出已做与已撤销的步（`{ position, label, state, saved, time }`），`position` 是当前位置，`origin` 是起点，`truncated` 表示起点之前有被步数上限丢掉的步，`originSaved` 表示起点是保存点。
  - `goTo(position)` 跳到起点或某一步：连续撤销或连续重做，全部成功才生效，有一步失败时什么都不变；只通知一次。
  - 变化通知加 `steps`：撤销或重做一次走了几步，`undo()`、`redo()` 为 1，别的种类为 0。
  - 说明的类型改成 `HistoryLabel`：字符串，或读的时候现取的函数，换语言后跟着变。`createHistory` 新增选项 `describe(operations, before)`，给没写说明的步按操作生成说明。
  - 新增 `snapshotHistory(history)`：把历史取成说明已现取的快照，给历史面板与宿主用。
  - 新增 `nudgeMergeKey(ids)` 与 `HISTORY_NUDGE_MERGE_WITHIN`（1000 毫秒）：方向键微移的合并键与时间窗，连续按、选中不变、一秒之内的并成一步。
- designer-kit 命令：`DesignerCommand` 新增 `alternateShortcuts`，另外几组也能触发这条命令的快捷键，与 `shortcut` 一样查重、一样由 `commandForShortcut` 命中；新增 `commandShortcuts(command)` 列出一条命令的全部快捷键。
- designer-shell：工具栏按钮与右键菜单项的 `aria-keyshortcuts` 把第二快捷键接在主快捷键后面；提示与菜单行尾仍只显示主快捷键。
