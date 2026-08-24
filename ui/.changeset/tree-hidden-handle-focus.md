---
"@xihan-ui/headless": patch
---

树上三个对读屏隐藏的把手不再被指针聚焦，勾选把手补上焦点接管。

branch-trigger / item-checkbox / branch-checkbox 都是 `aria-hidden` + `tabindex="-1"`：
隐藏是对的，退出 Tab 序列也是对的，但 `tabindex="-1"` 的节点仍然点得到焦点，
而焦点归属是在 mousedown 的默认动作里定的——浏览器随即报
"Blocked aria-hidden on an element because its descendant retained focus"。
箭头原有的补救写在 onClick 里，晚了一拍，拦不住这条告警；两个勾选把手连补救都没有。

三处统一拦掉指针的默认聚焦（写法同 tree-select 的清空钮），
两个勾选把手再把焦点交给所在的那一行——不接管的话点勾选框焦点原地不动，
roving tabindex 的锚点跟不上，treeitem 的 onFocus 也不触发。
