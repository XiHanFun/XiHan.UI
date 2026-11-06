---
'@xihan-ui/core': patch
'@xihan-ui/headless': patch
---

**修复** 弹出层、对话框里一颗带提示（Tooltip）的按钮，提示在场时按层外要按两次才收得掉外面那层：浮层打开后初始焦点落在这颗按钮上，提示随聚焦出现，这时按层外只收了提示；指针悬停出来的提示在移开后的收起等待与退场那一小段里按层外，同样没反应。提示否决层外票或收到关闭意图还没退栈时，会护着它开在其内容里的那一层。

现在内联层（`kind: 'inline'`，即 Tooltip、SideNav 折叠态的行提示与 NavigationMenu 的面板）只在交互落在它里面、或它还判不了这次交互时护着它开在其内容里的层；交互落在层外时它谁也不护，提示和它所在的弹出层、对话框、导航面板在这一下一并收起。按在提示里外面那层不收、Escape 仍先收栈顶的提示，这两条不变；`popover`、`modal` 两种层的行为不变。

两层一并收起后各播各的退场。库内的浮层在退场播完、要释放层与行为资源时，先等开在它里面的层退栈，不再出现父层先释放的乱序（`core.layer.dispose-not-top`）：Popover / Popconfirm、Dialog / Drawer、ImageViewer、Tour、NavigationMenu 以及下拉、选择器、悬停卡片等其余浮层都按这条走。只等开在它里面的层，与它无关的层压在上面时照常从中间释放；等的期间它已经关闭、内容已经失活，滚动锁、焦点域的释放和 Dialog / Drawer 的 `onExitComplete` 随之晚到里面那层退栈之后，通常不超过一次退场的时长；组件卸载不等。`LayerRegistry` 新增可选方法 `nestedAbove(layer)`，给出栈中压在某层上面、登记时记下开在它里面的层。
