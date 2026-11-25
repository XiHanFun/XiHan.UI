---
'@xihan-ui/headless': major
'@xihan-ui/styles': patch
---

**破坏性** GridList 的行与行内部件改用布尔 `data-selected` 表达选中，与 Table、Tree、TagGroup 的行一致；此前写的是 `data-state="checked" | "unchecked"`，和删掉的行退场用的 `data-state="closed"` 挤在同一个属性上。行首的勾选标记照旧走 `data-state="checked"`。自己写选择器读行选中态的，把 `[data-state='checked']` 换成 `[data-selected]`。

| 旧写法 | 新写法 |
| --- | --- |
| 行 `data-state="checked"` / `"unchecked"` | `data-selected`（选中时出现） |
