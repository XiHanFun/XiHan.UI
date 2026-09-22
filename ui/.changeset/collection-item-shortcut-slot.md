---
'@xihan-ui/styles': minor
---

Collection Item 家族的 `shortcut` 槽终于被真正画出来：与说明同档同色的次级文字，不换行。

这一列从家族建立起就在网格里（`prefix | text | shortcut | suffix | indicator`），但只声明了 `grid-column`——没有字号也没有颜色，落进去的文字会按主文字的 14px 与全强度前景显示，与命令本身抢层级。全库至今没有任何组件消费它，Menu 的示例只能在条目末尾塞一个没有槽位的裸 `<span>`，既不落列也不对齐。

现在补齐三条声明：

- 字号走 `--xh-control-caption-md`（控件内次级文字档，比同档主文字低一级），与 `description` 同档；可用 `--xh-collection-shortcut-font-size` 逐组件改写。
- 颜色跟着 `--xh-collection-description-fg` 那支 muted 走，因此逐态跟随（rest / hover / selected / disabled），也**不跟随语气**——一行里出现两种彩字，语气就失去指向。
- `white-space: nowrap`：它是一串按键记号，折行会被读成两个组合。

设计真源补 §7.5「集合行的次级文字」，把说明与快捷键两处的落位、字号、颜色与语气边界写在一起。
